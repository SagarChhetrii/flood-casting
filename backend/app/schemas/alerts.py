from typing import List, Optional

from pydantic import BaseModel, Field


class AlertSubscriberCreate(BaseModel):
    phone_number: str = Field(..., min_length=7, max_length=30)
    node_id: str = Field(..., min_length=1, max_length=32)
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class AlertBroadcastRequest(BaseModel):
    disaster_id: str
    message: Optional[str] = Field(None, max_length=320)


class AlertDelivery(BaseModel):
    phone_number: str
    status: str
    message: str
    route_nodes: List[str] = Field(default_factory=list)
    destination_node: Optional[str] = None
    total_distance: Optional[float] = None


class AlertBroadcastResponse(BaseModel):
    disaster_id: str
    matched_subscribers: int
    delivered: int
    failed: int
    deliveries: List[AlertDelivery]
