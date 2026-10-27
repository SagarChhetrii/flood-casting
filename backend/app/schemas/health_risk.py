"""Schemas for the transparent post-flood health-risk baseline."""

from pydantic import BaseModel, Field


class HealthRiskRequest(BaseModel):
    rainfall_mm: float = Field(0, ge=0, description="Accumulated rainfall over the selected period.")
    flood_duration_hours: float = Field(0, ge=0, description="Hours that flooding has persisted.")
    sanitation_disruption: float = Field(0, ge=0, le=1, description="Verified sanitation disruption signal.")
    water_quality_concern: float = Field(0, ge=0, le=1, description="Verified water-quality concern signal.")
    displaced_population_ratio: float = Field(0, ge=0, le=1, description="Estimated displaced population ratio.")


class HealthRiskResponse(BaseModel):
    indicator: str
    score: float
    priority: str
    horizon: str
    supporting_factors: list[str]
    limitations: list[str]
