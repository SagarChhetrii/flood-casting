"""
Disaster Management & Incident API Router.
Handles user disaster reporting and admin disaster lifecycle management.
"""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from backend.app.api.deps import require_admin
from backend.app.schemas.disasters import (
    DisasterCreate,
    DisasterUpdate,
    DisasterStatusUpdate,
    DisasterResponse,
    DisasterListResponse,
    DisasterStatus,
)
from backend.app.db.disaster_store import disaster_store

router = APIRouter(tags=["Disasters & Incidents"])


@router.get("/disasters", response_model=DisasterListResponse)
@router.get("/incidents", response_model=DisasterListResponse)
def list_disasters(
    status_filter: Optional[str] = Query(None, alias="status", description="Filter by status: PENDING, APPROVED, REJECTED, RESOLVED"),
    disaster_type: Optional[str] = Query(None, description="Filter by disaster type"),
):
    """
    Retrieve all disaster incidents reported by users or managed by admins.
    """
    disasters = disaster_store.list_disasters(status=status_filter, disaster_type=disaster_type)
    pending_count = len([d for d in disasters if d.status == DisasterStatus.PENDING])
    approved_count = len([d for d in disasters if d.status == DisasterStatus.APPROVED])

    return DisasterListResponse(
        total_count=len(disasters),
        pending_count=pending_count,
        approved_count=approved_count,
        disasters=disasters,
    )


@router.get("/disasters/{disaster_id}", response_model=DisasterResponse)
@router.get("/incidents/{disaster_id}", response_model=DisasterResponse)
def get_disaster(disaster_id: str):
    """
    Retrieve details for a specific disaster incident.
    """
    disaster = disaster_store.get_disaster(disaster_id)
    if not disaster:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Disaster incident '{disaster_id}' not found.",
        )
    return disaster


@router.post("/disasters", response_model=DisasterResponse, status_code=status.HTTP_201_CREATED)
@router.post("/incidents", response_model=DisasterResponse, status_code=status.HTTP_201_CREATED)
def create_disaster(
    payload: DisasterCreate,
    x_role: str = Depends(require_admin),
):
    """
    Report a new disaster incident.
    Civilians create disasters with 'PENDING' status for admin approval.
    Prevents duplicate report creation for active/pending road incidents.
    """
    try:
        return disaster_store.create_disaster(payload, is_admin=True)
    except ValueError as val_err:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(val_err),
        )


@router.patch("/disasters/{disaster_id}/status", response_model=DisasterResponse)
@router.patch("/incidents/{disaster_id}/status", response_model=DisasterResponse)
def update_disaster_status(
    disaster_id: str,
    payload: DisasterStatusUpdate,
    x_role: str = Depends(require_admin),
):
    """
    [Admin Role] Update status of a disaster report (e.g. Approve, Reject, Resolve).
    Approving a disaster automatically updates road network risk and triggers evacuation path recalculation.
    """
    updated = disaster_store.update_status(disaster_id, payload)
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Disaster incident '{disaster_id}' not found.",
        )
    return updated


@router.patch("/incidents/{disaster_id}/approve", response_model=DisasterResponse)
def approve_incident(
    disaster_id: str,
    admin_notes: Optional[str] = Query(None, description="Optional admin note"),
    x_role: str = Depends(require_admin),
):
    """[Admin Role] Approve a disaster incident."""
    payload = DisasterStatusUpdate(status=DisasterStatus.APPROVED, admin_notes=admin_notes)
    return update_disaster_status(disaster_id, payload, x_role=x_role)


@router.patch("/incidents/{disaster_id}/reject", response_model=DisasterResponse)
def reject_incident(
    disaster_id: str,
    admin_notes: Optional[str] = Query(None, description="Optional admin note"),
    x_role: str = Depends(require_admin),
):
    """[Admin Role] Reject a disaster incident."""
    payload = DisasterStatusUpdate(status=DisasterStatus.REJECTED, admin_notes=admin_notes)
    return update_disaster_status(disaster_id, payload, x_role=x_role)


@router.patch("/incidents/{disaster_id}/resolve", response_model=DisasterResponse)
def resolve_incident(
    disaster_id: str,
    admin_notes: Optional[str] = Query(None, description="Optional admin note"),
    x_role: str = Depends(require_admin),
):
    """[Admin Role] Resolve a disaster incident."""
    payload = DisasterStatusUpdate(status=DisasterStatus.RESOLVED, admin_notes=admin_notes)
    return update_disaster_status(disaster_id, payload, x_role=x_role)


@router.put("/disasters/{disaster_id}", response_model=DisasterResponse)
@router.put("/incidents/{disaster_id}", response_model=DisasterResponse)
def update_disaster_details(
    disaster_id: str,
    payload: DisasterUpdate,
    x_role: str = Depends(require_admin),
):
    """
    [Admin Role] Edit title, severity, description, or affected roads/nodes of a disaster.
    """
    updated = disaster_store.update_disaster(disaster_id, payload)
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Disaster incident '{disaster_id}' not found.",
        )
    return updated


@router.delete("/disasters/{disaster_id}", status_code=status.HTTP_204_NO_CONTENT)
@router.delete("/incidents/{disaster_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_disaster(
    disaster_id: str,
    x_role: str = Depends(require_admin),
):
    """
    [Admin Role] Delete a disaster report.
    """
    success = disaster_store.delete_disaster(disaster_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Disaster incident '{disaster_id}' not found.",
        )
    return None
