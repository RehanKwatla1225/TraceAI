"""Case management routes: CRUD, timeline, search, media uploads."""

from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.database import get_db
from app.models.case import (
    MissingPersonCase, CaseStatus, TimelineEvent, TimelineEventType,
)
from app.models.sighting import Sighting
from app.models.user import User, UserRole
from app.models.audit_log import AuditLog
from app.schemas.case import (
    CaseCreate, CaseUpdate, CaseResponse, CaseListResponse,
    CaseStatusUpdate, TimelineEventResponse,
)
from app.middleware.auth import get_current_user

router = APIRouter(prefix="/api/cases", tags=["Cases"])


@router.post("", response_model=CaseResponse, status_code=status.HTTP_201_CREATED)
def create_case(
    data: CaseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Register a new missing person case."""
    case = MissingPersonCase(
        name=data.name,
        age=data.age,
        gender=data.gender,
        last_seen_location=data.last_seen_location,
        last_seen_date=data.last_seen_date,
        latitude=data.latitude,
        longitude=data.longitude,
        description=data.description,
        clothing=data.clothing,
        distinguishing_features=data.distinguishing_features,
        is_urgent=True,
        created_by=current_user.id,
    )
    db.add(case)
    db.flush()

    # Add initial timeline event
    db.add(TimelineEvent(
        case_id=case.id,
        event_type=TimelineEventType.CREATED,
        title="Case Created",
        description=f"Missing person report filed for {data.name}",
        created_by=current_user.id,
    ))

    # Audit
    db.add(AuditLog(
        user_id=current_user.id, user_name=current_user.name,
        action="CASE_CREATED", resource=f"cases/{case.id}",
        details=f"Created case for {data.name}",
    ))
    db.commit()
    db.refresh(case)
    return case


@router.get("", response_model=List[CaseListResponse])
def list_cases(
    status_filter: Optional[str] = Query(None, alias="status"),
    search: Optional[str] = Query(None),
    skip: int = Query(0, alias="offset"),
    limit: int = Query(20),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List cases. Family sees own; Authority/Admin see all."""
    query = db.query(MissingPersonCase)

    if current_user.role == UserRole.FAMILY:
        query = query.filter(MissingPersonCase.created_by == current_user.id)

    if status_filter:
        query = query.filter(MissingPersonCase.status == status_filter)

    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                MissingPersonCase.name.ilike(search_term),
                MissingPersonCase.last_seen_location.ilike(search_term),
                MissingPersonCase.description.ilike(search_term),
                MissingPersonCase.id.ilike(search_term),
            )
        )

    cases = query.order_by(MissingPersonCase.created_at.desc()).offset(skip).limit(limit).all()
    return cases


@router.get("/{case_id}", response_model=CaseResponse)
def get_case(
    case_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get case details with timeline."""
    case = db.query(MissingPersonCase).filter(MissingPersonCase.id == case_id).first()
    if not case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found")

    # Family can only see their own cases
    if current_user.role == UserRole.FAMILY and case.created_by != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to view this case")

    return case


@router.put("/{case_id}", response_model=CaseResponse)
def update_case(
    case_id: str,
    data: CaseUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update case details."""
    case = db.query(MissingPersonCase).filter(MissingPersonCase.id == case_id).first()
    if not case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found")

    if current_user.role == UserRole.FAMILY and case.created_by != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(case, key, value)
    case.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(case)
    return case


@router.patch("/{case_id}/status", response_model=CaseResponse)
def update_case_status(
    case_id: str,
    data: CaseStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update case status (Authority/Admin only)."""
    if current_user.role not in [UserRole.AUTHORITY, UserRole.ADMIN]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")

    case = db.query(MissingPersonCase).filter(MissingPersonCase.id == case_id).first()
    if not case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found")

    case.status = CaseStatus(data.status)
    case.updated_at = datetime.utcnow()

    if data.status == "resolved":
        case.resolved_at = datetime.utcnow()
        case.resolved_by = data.resolved_by or current_user.name

    # Add timeline event
    db.add(TimelineEvent(
        case_id=case.id,
        event_type=TimelineEventType.STATUS_CHANGE,
        title=f"Case Status: {data.status}",
        description=f"Case status changed to {data.status} by {current_user.name}",
        created_by=current_user.id,
    ))

    db.commit()
    db.refresh(case)
    return case


@router.get("/{case_id}/timeline", response_model=List[TimelineEventResponse])
def get_case_timeline(
    case_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get timeline for a case."""
    case = db.query(MissingPersonCase).filter(MissingPersonCase.id == case_id).first()
    if not case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found")

    events = (
        db.query(TimelineEvent)
        .filter(TimelineEvent.case_id == case_id)
        .order_by(TimelineEvent.timestamp.desc())
        .all()
    )
    return events


@router.delete("/{case_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_case(
    case_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a case (Admin only or case owner)."""
    case = db.query(MissingPersonCase).filter(MissingPersonCase.id == case_id).first()
    if not case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found")

    if current_user.role != UserRole.ADMIN and case.created_by != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")

    db.delete(case)
    db.commit()
    return None
