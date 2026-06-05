"""Predictive intelligence routes: movement patterns, transport hubs, heat zones, timeline."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.case import MissingPersonCase
from app.models.user import User, UserRole
from app.middleware.auth import get_current_user
from app.services.predictive_service import PredictiveIntelligence
from app.services.ai_service import AIService

router = APIRouter(prefix="/api/predictive", tags=["Predictive Intelligence"])


@router.get("/movement/{case_id}")
def predict_movement(
    case_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get AI-predicted movement patterns, time-bucketed zones, and route."""
    case = db.query(MissingPersonCase).filter(MissingPersonCase.id == case_id).first()
    if not case:
        return {"error": "Case not found"}
    return PredictiveIntelligence.predict_movement(case)


@router.get("/hubs/{case_id}")
def get_transport_hubs(
    case_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get relevant transport hubs for a case with demographic-adjusted probabilities."""
    hubs = PredictiveIntelligence.detect_transport_hubs(db, case_id)
    return {"case_id": case_id, "hubs": hubs}


@router.get("/heatmap")
def get_heat_zones(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get heat zones from active cases and sighting density."""
    zones = PredictiveIntelligence.generate_heat_zones(db)
    return {"zones": zones, "total_zones": len(zones)}


@router.get("/timeline/{case_id}")
def get_movement_timeline(
    case_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Build chronological movement timeline from sighting data."""
    return PredictiveIntelligence.get_timeline_pattern(db, case_id)


@router.get("/matches/ranked")
def get_ranked_matches(
    case_id: str = None,
    min_score: float = 0.5,
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get all matches ranked by confidence with full attribute breakdown."""
    return AIService.rank_matches(db, case_id, min_score, limit)


@router.post("/batch-analyze/{case_id}")
def batch_analyze(
    case_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Re-analyze all pending sightings for a case (Authority only)."""
    if current_user.role not in [UserRole.AUTHORITY, UserRole.ADMIN]:
        return {"error": "Not authorized"}
    return AIService.batch_analyze(db, case_id)
