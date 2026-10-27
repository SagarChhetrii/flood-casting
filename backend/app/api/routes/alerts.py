import logging
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.api.deps import get_road_graph, require_admin
from backend.app.db.database import SessionLocal
from backend.app.db.disaster_store import disaster_store
from backend.app.db.models import AlertSubscriberModel
from backend.app.routing.graph import EvacuationRoadGraph
from backend.app.routing.router import EvacuationRouter
from backend.app.routing.models import NoRouteFoundError, NodeNotFoundError, InvalidRouteRequestError
from backend.app.schemas.alerts import (
    AlertBroadcastRequest,
    AlertBroadcastResponse,
    AlertDelivery,
    AlertSubscriberCreate,
)
from backend.app.schemas.disasters import DisasterStatus
from backend.app.services.sms import send_sms

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/alerts", tags=["Evacuation Alerts"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/subscribers", status_code=status.HTTP_201_CREATED)
def register_alert_subscriber(payload: AlertSubscriberCreate, db: Session = Depends(get_db)):
    now = datetime.now(timezone.utc).isoformat()
    subscriber = db.query(AlertSubscriberModel).filter_by(phone_number=payload.phone_number).first()
    if subscriber:
        subscriber.node_id = payload.node_id
        subscriber.latitude = payload.latitude
        subscriber.longitude = payload.longitude
        subscriber.enabled = 1
        subscriber.updated_at = now
    else:
        subscriber = AlertSubscriberModel(
            phone_number=payload.phone_number,
            node_id=payload.node_id,
            latitude=payload.latitude,
            longitude=payload.longitude,
            created_at=now,
            updated_at=now,
        )
        db.add(subscriber)
    db.commit()
    return {"phone_number": subscriber.phone_number, "node_id": subscriber.node_id, "enabled": True}


@router.post("/broadcast", response_model=AlertBroadcastResponse)
def broadcast_alert(
    payload: AlertBroadcastRequest,
    db: Session = Depends(get_db),
    graph: EvacuationRoadGraph = Depends(get_road_graph),
    x_role: str = Depends(require_admin),
):
    disaster = disaster_store.get_disaster(payload.disaster_id)
    if not disaster:
        raise HTTPException(status_code=404, detail="Disaster incident not found.")
    if disaster.status != DisasterStatus.APPROVED:
        raise HTTPException(status_code=409, detail="Only approved disasters can trigger evacuation alerts.")

    affected_nodes = {node.strip() for node in disaster.affected_nodes}
    subscribers = db.query(AlertSubscriberModel).filter(AlertSubscriberModel.enabled == 1).all()
    matched = [s for s in subscribers if s.node_id in affected_nodes]
    deliveries = []
    shelters = ("Z", "C")  # E is currently full in the shelter registry.

    for subscriber in matched:
        route = None
        for destination in shelters:
            if destination not in graph.nodes or destination == subscriber.node_id:
                continue
            try:
                candidate = EvacuationRouter(risk_weight=10).find_safest_route(
                    subscriber.node_id, destination, graph
                )
                if route is None or candidate.total_cost < route.total_cost:
                    route = candidate
            except (NoRouteFoundError, NodeNotFoundError, InvalidRouteRequestError):
                continue

        if route is None:
            deliveries.append(AlertDelivery(
                phone_number=subscriber.phone_number,
                status="failed",
                message="No safe evacuation route is currently available. Contact emergency services.",
            ))
            continue

        message = payload.message or (
            f"EVACUATE/निकासी: {disaster.disaster_type.value}. "
            f"Follow/मार्ग: {'-'.join(route.nodes)} to shelter/आश्रय {route.destination_node}. "
            f"{route.total_distance:.1f} km. Call emergency services/आपातकालीन सेवा."
        )
        try:
            delivery_status = send_sms(subscriber.phone_number, message)
            deliveries.append(AlertDelivery(
                phone_number=subscriber.phone_number,
                status=delivery_status,
                message=message,
                route_nodes=route.nodes,
                destination_node=route.destination_node,
                total_distance=route.total_distance,
            ))
        except Exception:
            deliveries.append(AlertDelivery(
                phone_number=subscriber.phone_number,
                status="failed",
                message=message,
                route_nodes=route.nodes,
                destination_node=route.destination_node,
                total_distance=route.total_distance,
            ))

    return AlertBroadcastResponse(
        disaster_id=payload.disaster_id,
        matched_subscribers=len(matched),
        delivered=sum(d.status in {"sent", "logged"} for d in deliveries),
        failed=sum(d.status == "failed" for d in deliveries),
        deliveries=deliveries,
    )
