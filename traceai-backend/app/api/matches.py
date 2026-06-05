"""AI Match routes: list, approve, reject, manual analysis trigger."""

from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.match import AIMatch, MatchStatus, MatchAttribute
from app.models.case import MissingPersonCase, TimelineEvent, TimelineEventType
from app.models.user import User, UserRole
from app.models.notification import Notification, NotificationType
from app.schemas.sighting import MatchResponse, MatchApproveReject
from app.middleware.auth import get_current_user
from app.services.ai_service import AIService

router = APIRouter(prefix="/api/matches", tags=["AI Matches"])


@router.get("", response_model=List[MatchResponse])
def list_matches(
    case_id: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status"),
    min_confidence: Optional[float] = Query(None),
    skip: int = Query(0, alias="offset"),
    limit: int = Query(20),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List AI matches. Family sees own case matches; Authority/Admin see all."""
    query = db.query(AIMatch)

    if current_user.role == UserRole.FAMILY:
        own_case_ids = [
            c.id for c in db.query(MissingPersonCase).filter(
                MissingPersonCase.created_by == current_user.id
            ).all()
        ]
        query = query.filter(AIMatch.case_id.in_(own_case_ids))

    if case_id:
        query = query.filter(AIMatch.case_id == case_id)
    if status_filter:
        query = query.filter(AIMatch.status == status_filter)
    if min_confidence:
        query = query.filter(AIMatch.confidence_score >= min_confidence)

    matches = query.order_by(AIMatch.confidence_score.desc()).offset(skip).limit(limit).all()

    result = []
    for match in matches:
        attrs = db.query(MatchAttribute).filter(MatchAttribute.match_id == match.id).all()
        result.append(MatchResponse(
            id=match.id,
            case_id=match.case_id,
            sighting_id=match.sighting_id,
            confidence_score=match.confidence_score,
            ai_model_version=match.ai_model_version,
            status=match.status.value,
            matched_attributes=[a.attribute_name for a in attrs],
            reviewed_by=match.reviewed_by,
            reviewed_at=match.reviewed_at,
            created_at=match.created_at,
        ))

    return result


@router.get("/{match_id}", response_model=MatchResponse)
def get_match(match_id: str, db: Session = Depends(get_db)):
    """Get match details with attributes."""
    match = db.query(AIMatch).filter(AIMatch.id == match_id).first()
    if not match:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Match not found")

    attrs = db.query(MatchAttribute).filter(MatchAttribute.match_id == match.id).all()
    return MatchResponse(
        id=match.id,
        case_id=match.case_id,
        sighting_id=match.sighting_id,
        confidence_score=match.confidence_score,
        ai_model_version=match.ai_model_version,
        status=match.status.value,
        matched_attributes=[a.attribute_name for a in attrs],
        reviewed_by=match.reviewed_by,
        reviewed_at=match.reviewed_at,
        created_at=match.created_at,
    )


@router.post("/analyze")
def trigger_analysis(
    case_id: str = Query(...),
    sighting_id: str = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Manually trigger AI analysis for a sighting (Authority only)."""
    if current_user.role not in [UserRole.AUTHORITY, UserRole.ADMIN]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")

    match = AIService.analyze_sighting(db, case_id, sighting_id)
    if not match:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Analysis failed: case or sighting not found")

    return {
        "message": "Analysis complete",
        "match_id": match.id,
        "confidence_score": match.confidence_score,
    }


@router.patch("/{match_id}/approve", response_model=MatchResponse)
def approve_match(
    match_id: str,
    data: MatchApproveReject,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Approve an AI match (Authority only)."""
    if current_user.role not in [UserRole.AUTHORITY, UserRole.ADMIN]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")

    match = db.query(AIMatch).filter(AIMatch.id == match_id).first()
    if not match:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Match not found")

    match.status = MatchStatus.APPROVED
    match.reviewed_by = current_user.id
    match.reviewed_at = datetime.utcnow()

    # Add timeline event
    db.add(TimelineEvent(
        case_id=match.case_id,
        event_type=TimelineEventType.MATCH,
        title=f"Match Approved ({match.confidence_score:.0%} confidence)",
        description=f"AI match approved by {current_user.name}",
        created_by=current_user.id,
    ))

    # Notify family
    case = db.query(MissingPersonCase).filter(MissingPersonCase.id == match.case_id).first()
    if case:
        db.add(Notification(
            user_id=case.created_by,
            title="Match Approved",
            message=f"A verified match for {case.name} has been approved by authorities.",
            notification_type=NotificationType.SUCCESS,
            link=f"/cases/{case.id}",
        ))

    db.commit()
    db.refresh(match)
    return get_match(match_id, db)


@router.patch("/{match_id}/reject", response_model=MatchResponse)
def reject_match(
    match_id: str,
    data: MatchApproveReject,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Reject an AI match (Authority only)."""
    if current_user.role not in [UserRole.AUTHORITY, UserRole.ADMIN]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")

    match = db.query(AIMatch).filter(AIMatch.id == match_id).first()
    if not match:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Match not found")

    match.status = MatchStatus.REJECTED
    match.reviewed_by = current_user.id
    match.reviewed_at = datetime.utcnow()

    db.commit()
    db.refresh(match)
    return get_match(match_id, db)
