"""Notification routes: list, mark read, mark all read."""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.schemas.analytics import NotificationResponse, NotificationListResponse
from app.middleware.auth import get_current_user
from app.services.notification_service import NotificationService

router = APIRouter(prefix="/api/notifications", tags=["Notifications"])


@router.get("", response_model=NotificationListResponse)
def list_notifications(
    unread_only: bool = Query(False),
    skip: int = Query(0, alias="offset"),
    limit: int = Query(20),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List notifications for current user."""
    notifications, total, unread_count = NotificationService.get_notifications(
        db, current_user.id, limit=limit, offset=skip, unread_only=unread_only
    )
    return NotificationListResponse(
        total=total,
        unread_count=unread_count,
        notifications=[NotificationResponse.model_validate(n) for n in notifications],
    )


@router.patch("/{notification_id}/read", response_model=NotificationResponse)
def mark_read(
    notification_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Mark a notification as read."""
    notif = NotificationService.mark_read(db, notification_id, current_user.id)
    if not notif:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found")
    return NotificationResponse.model_validate(notif)


@router.patch("/read-all")
def mark_all_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Mark all notifications as read."""
    count = NotificationService.mark_all_read(db, current_user.id)
    return {"message": f"Marked {count} notifications as read"}
