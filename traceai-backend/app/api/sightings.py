"""Sighting routes: report sightings, list, verify/dismiss."""

from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.sighting import Sighting, SightingStatus
from app.models.case import MissingPersonCase, TimelineEvent, TimelineEventType
from app.models.user import User, UserRole
from app.schemas.sighting import SightingCreate, SightingResponse
from app.middleware.auth import get_current_user
from app.services.ai_service import AIService

router = APIRouter(prefix="/api/sightings", tags=["Sightings"])


@router.post("", response_model=SightingResponse, status_code=status.HTTP_201_CREATED)
def report_sighting(
    data: SightingCreate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user),
):
    """Report a sighting for a missing person case."""
    case = db.query(MissingPersonCase).filter(MissingPersonCase.id == data.case_id).first()
    if not case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found")

    sighting = Sighting(
        case_id=data.case_id,
        location_name=data.location_name,
        latitude=data.latitude,
        longitude=data.longitude,
        description=data.description,
        witness_name=data.witness_name,
        witness_contact=data.witness_contact,
        is_anonymous=data.is_anonymous,
        reported_at=data.reported_at or datetime.utcnow(),
        reported_by=current_user.id if current_user else None,
    )
    db.add(sighting)
    db.flush()

    # Add timeline event
    db.add(TimelineEvent(
        case_id=case.id,
        event_type=TimelineEventType.SIGHTING,
        title="Sighting Reported",
        description=f"New sighting reported at {data.location_name}",
        created_by=current_user.id if current_user else "anonymous",
    ))

    # Trigger AI analysis
    AIService.analyze_sighting(db, data.case_id, sighting.id)

    db.commit()
    db.refresh(sighting)
    return sighting


@router.get("", response_model=List[SightingResponse])
def list_sightings(
    case_id: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status"),
    skip: int = Query(0, alias="offset"),
    limit: int = Query(20),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List sightings. Authority sees all; others see only their own."""
    query = db.query(Sighting)

    if current_user.role == UserRole.FAMILY:
        # Family sees sightings on their own cases
        own_case_ids = [
            c.id for c in db.query(MissingPersonCase).filter(
                MissingPersonCase.created_by == current_user.id
            ).all()
        ]
        query = query.filter(Sighting.case_id.in_(own_case_ids))
    elif current_user.role == UserRole.CITIZEN:
        query = query.filter(Sighting.reported_by == current_user.id)

    if case_id:
        query = query.filter(Sighting.case_id == case_id)
    if status_filter:
        query = query.filter(Sighting.status == status_filter)

    sightings = query.order_by(Sighting.created_at.desc()).offset(skip).limit(limit).all()
    return sightings


@router.get("/{sighting_id}", response_model=SightingResponse)
def get_sighting(sighting_id: str, db: Session = Depends(get_db)):
    """Get sighting details."""
    sighting = db.query(Sighting).filter(Sighting.id == sighting_id).first()
    if not sighting:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sighting not found")
    return sighting


@router.patch("/{sighting_id}/verify", response_model=SightingResponse)
def verify_sighting(
    sighting_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Verify a sighting (Authority only)."""
    if current_user.role not in [UserRole.AUTHORITY, UserRole.ADMIN]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")

    sighting = db.query(Sighting).filter(Sighting.id == sighting_id).first()
    if not sighting:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sighting not found")

    sighting.status = SightingStatus.VERIFIED
    sighting.verified_by = current_user.id
    sighting.verified_at = datetime.utcnow()

    db.commit()
    db.refresh(sighting)
    return sighting


@router.patch("/{sighting_id}/dismiss", response_model=SightingResponse)
def dismiss_sighting(
    sighting_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Dismiss a sighting (Authority only)."""
    if current_user.role not in [UserRole.AUTHORITY, UserRole.ADMIN]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")

    sighting = db.query(Sighting).filter(Sighting.id == sighting_id).first()
    if not sighting:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sighting not found")

    sighting.status = SightingStatus.DISMISSED
    sighting.verified_by = current_user.id
    sighting.verified_at = datetime.utcnow()

    db.commit()
    db.refresh(sighting)
    return sighting
