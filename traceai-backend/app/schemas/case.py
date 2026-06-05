"""Pydantic schemas for Case and Timeline models."""

from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel


class CaseCreate(BaseModel):
    name: str
    age: int
    gender: str
    last_seen_location: str
    last_seen_date: datetime
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    description: str
    clothing: Optional[str] = None
    distinguishing_features: Optional[str] = None


class CaseUpdate(BaseModel):
    name: Optional[str] = None
    age: Optional[int] = None
    last_seen_location: Optional[str] = None
    description: Optional[str] = None
    clothing: Optional[str] = None
    distinguishing_features: Optional[str] = None
    status: Optional[str] = None


class TimelineEventResponse(BaseModel):
    id: str
    case_id: str
    event_type: str
    title: str
    description: Optional[str] = None
    created_by: str
    timestamp: datetime

    model_config = {"from_attributes": True}


class CaseResponse(BaseModel):
    id: str
    name: str
    age: int
    gender: str
    last_seen_location: str
    last_seen_date: datetime
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    description: str
    clothing: Optional[str] = None
    distinguishing_features: Optional[str] = None
    status: str
    is_urgent: bool
    search_radius_km: float
    created_by: str
    created_at: datetime
    updated_at: datetime
    resolved_at: Optional[datetime] = None
    resolved_by: Optional[str] = None
    timeline_events: List[TimelineEventResponse] = []

    model_config = {"from_attributes": True}


class CaseListResponse(BaseModel):
    id: str
    name: str
    age: int
    gender: str
    last_seen_location: str
    last_seen_date: datetime
    status: str
    is_urgent: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class CaseStatusUpdate(BaseModel):
    status: str
    resolved_by: Optional[str] = None


class CaseSearchParams(BaseModel):
    query: Optional[str] = None
    status: Optional[str] = None
    gender: Optional[str] = None
    age_min: Optional[int] = None
    age_max: Optional[int] = None
    location: Optional[str] = None
    created_after: Optional[datetime] = None
