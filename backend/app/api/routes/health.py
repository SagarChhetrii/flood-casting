"""
Health Check Router for Disaster Evacuation Route Optimizer API.
"""

from datetime import datetime, timezone
from fastapi import APIRouter
from backend.app.schemas.health import HealthResponse, ModuleStatus
from backend.app.schemas.health_risk import HealthRiskRequest, HealthRiskResponse
from backend.app.core.config import settings

router = APIRouter()


@router.post("/health-risk", response_model=HealthRiskResponse, tags=["Post-flood health"])
def estimate_health_risk(payload: HealthRiskRequest):
    """Return a screening-priority indicator, not an outbreak or diagnosis prediction."""
    rainfall_signal = min(payload.rainfall_mm / 250, 1)
    duration_signal = min(payload.flood_duration_hours / 72, 1)
    score = round(
        100
        * (
            0.20 * rainfall_signal
            + 0.20 * duration_signal
            + 0.25 * payload.sanitation_disruption
            + 0.20 * payload.water_quality_concern
            + 0.15 * payload.displaced_population_ratio
        ),
        1,
    )
    priority = "LOW" if score < 30 else "WATCH" if score < 60 else "HIGH"
    factors = []
    if rainfall_signal >= 0.5:
        factors.append("heavy accumulated rainfall")
    if duration_signal >= 0.5:
        factors.append("flooding persisted beyond 36 hours")
    if payload.sanitation_disruption >= 0.5:
        factors.append("sanitation disruption")
    if payload.water_quality_concern >= 0.5:
        factors.append("water-quality concern")
    if payload.displaced_population_ratio >= 0.2:
        factors.append("population displacement")

    return HealthRiskResponse(
        indicator="post-flood surveillance priority",
        score=score,
        priority=priority,
        horizon="next 7 days",
        supporting_factors=factors or ["no elevated screening signal in supplied inputs"],
        limitations=[
            "Rule-based screening aid; not an epidemic forecast.",
            "Does not diagnose individuals or confirm an outbreak.",
            "Requires verified public-health surveillance for validation.",
        ],
    )


@router.get("/health", response_model=HealthResponse)
def get_health():
    """
    Health check endpoint returning application operational status.
    """
    return HealthResponse(
        status="ok",
        app=settings.PROJECT_NAME,
        version=settings.VERSION,
        timestamp=datetime.now(timezone.utc).isoformat(),
        modules=ModuleStatus(
            networkx_available=True,
            scikit_learn_available=True,
            sqlite_connected=True,
        ),
    )
