"""Notification model for in-app and push notifications."""

import uuid
from datetime import datetime

from sqlalchemy import Column, String, Text, Boolean, DateTime, Enum as SAEnum, ForeignKey
from sqlalchemy.orm import relationship
import enum

from app.database import Base


class NotificationType(str, enum.Enum):
    INFO = "info"
    ALERT = "alert"
    SUCCESS = "success"
    WARNING = "warning"


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(String, primary_key=True, default=lambda: f"not-{uuid.uuid4().hex[:8]}")
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    notification_type = Column(SAEnum(NotificationType), default=NotificationType.INFO, nullable=False)
    is_read = Column(Boolean, default=False)
    read_at = Column(DateTime, nullable=True)
    link = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationship
    user = relationship("User", back_populates="notifications")

    def __repr__(self):
        return f"<Notification {self.id}: {self.title}>"
