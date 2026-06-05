"""Analytics routes: overview, trends, heatmap, regional."""

from typing import List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User, UserRole
from app.middleware.auth import get_current_user
from app.services.analytics_service import AnalyticsService
from app.schemas.analytics import (
    AnalyticsOverview, AnalyticsTrends, HeatmapPoint,
    RegionalAnalytics, SystemHealth,
)

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])


@router.get("/overview", response_model=AnalyticsOverview)
def get_overview(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get dashboard overview statistics."""
    if current_user.role not in [UserRole.AUTHORITY, UserRole.ADMIN]:
        # Family users get overview of their own data
        pass
    return AnalyticsService.get_overview(db)


@router.get("/trends", response_model=AnalyticsTrends)
def get_trends(
    days: int = Query(7),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get case and sighting trends over time."""
    return AnalyticsService.get_trends(db, days)


@router.get("/heatmap", response_model=List[HeatmapPoint])
def get_heatmap(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get location data for heatmap visualization."""
    return AnalyticsService.get_heatmap_data(db)


@router.get("/regional", response_model=List[RegionalAnalytics])
def get_regional(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get analytics broken down by region."""
    return AnalyticsService.get_regional(db)


@router.get("/predictive/{case_id}")
def get_predictive(
    case_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get AI-predicted movement patterns for a case."""
    from app.models.case import MissingPersonCase
    from app.services.ai_service import AIService

    case = db.query(MissingPersonCase).filter(MissingPersonCase.id == case_id).first()
    if not case:
        return {"error": "Case not found"}
    return AIService.predict_movement(case)
