"""Pydantic schemas for Sighting and Match models."""

from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel


class SightingCreate(BaseModel):
    case_id: str
    location_name: str
    latitude: float
    longitude: float
    description: str
    witness_name: Optional[str] = None
    witness_contact: Optional[str] = None
    is_anonymous: bool = True
    reported_at: Optional[datetime] = None


class SightingResponse(BaseModel):
    id: str
    case_id: str
    location_name: str
    latitude: float
    longitude: float
    description: str
    witness_name: Optional[str] = None
    status: str
    is_anonymous: bool
    reported_at: datetime
    reported_by: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class MatchResponse(BaseModel):
    id: str
    case_id: str
    sighting_id: Optional[str] = None
    confidence_score: float
    ai_model_version: str
    status: str
    matched_attributes: List[str] = []
    reviewed_by: Optional[str] = None
    reviewed_at: Optional[datetime] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class MatchApproveReject(BaseModel):
    reviewer_id: str


class MatchAnalysisResult(BaseModel):
    case_id: str
    sighting_id: str
    confidence_score: float
    matched_attributes: List[str]
