"""Pydantic schemas for Notification and Analytics."""

from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel


class NotificationResponse(BaseModel):
    id: str
    user_id: str
    title: str
    message: str
    notification_type: str
    is_read: bool
    link: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class NotificationListResponse(BaseModel):
    total: int
    unread_count: int
    notifications: List[NotificationResponse]


class AnalyticsOverview(BaseModel):
    total_cases: int
    active_cases: int
    resolved_cases: int
    total_sightings: int
    pending_matches: int
    approved_matches: int
    avg_resolution_hours: float
    total_users: int


class TrendDataPoint(BaseModel):
    date: str
    cases: int
    resolved: int
    sightings: int


class AnalyticsTrends(BaseModel):
    daily: List[TrendDataPoint]
    weekly: List[TrendDataPoint]


class HeatmapPoint(BaseModel):
    case_id: str
    name: str
    latitude: float
    longitude: float
    status: str
    sightings_count: int


class RegionalAnalytics(BaseModel):
    region: str
    total_cases: int
    active_cases: int
    resolution_rate: float


class SystemHealth(BaseModel):
    status: str = "healthy"
    database: str = "connected"
    ai_service: str = "operational"
    uptime_hours: float
    total_users: int
    active_cases: int
    matches_today: int
