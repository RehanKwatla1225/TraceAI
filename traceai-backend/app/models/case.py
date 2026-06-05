"""Missing Person Case and Timeline Event models."""

import uuid
from datetime import datetime

from sqlalchemy import Column, String, Text, Boolean, Float, DateTime, Enum as SAEnum, ForeignKey
from sqlalchemy.orm import relationship
import enum

from app.database import Base


class CaseStatus(str, enum.Enum):
    ACTIVE = "active"
    UNDER_REVIEW = "under-review"
    RESOLVED = "resolved"
    CLOSED = "closed"


class TimelineEventType(str, enum.Enum):
    CREATED = "created"
    SIGHTING = "sighting"
    MATCH = "match"
    STATUS_CHANGE = "status-change"
    EVIDENCE = "evidence"
    NOTE = "note"


class MissingPersonCase(Base):
    __tablename__ = "cases"

    id = Column(String, primary_key=True, default=lambda: f"TA-{uuid.uuid4().hex[:6].upper()}")
    name = Column(String, nullable=False)
    age = Column(Float, nullable=False)
    gender = Column(String, nullable=False)
    last_seen_location = Column(String, nullable=False)
    last_seen_date = Column(DateTime, nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    description = Column(Text, nullable=False)
    clothing = Column(String, nullable=True)
    distinguishing_features = Column(String, nullable=True)
    status = Column(SAEnum(CaseStatus), default=CaseStatus.ACTIVE, nullable=False)
    is_urgent = Column(Boolean, default=False)
    search_radius_km = Column(Float, default=50.0)

    created_by = Column(String, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)
    resolved_by = Column(String, nullable=True)

    # Relationships
    creator = relationship("User", back_populates="cases")
    timeline_events = relationship("TimelineEvent", back_populates="case", order_by="TimelineEvent.timestamp.desc()")
    sightings = relationship("Sighting", back_populates="case")
    matches = relationship("AIMatch", back_populates="case")
    media = relationship("Media", back_populates="case")

    def __repr__(self):
        return f"<Case {self.id}: {self.name}>"


class TimelineEvent(Base):
    __tablename__ = "timeline_events"

    id = Column(String, primary_key=True, default=lambda: f"evt-{uuid.uuid4().hex[:8]}")
    case_id = Column(String, ForeignKey("cases.id"), nullable=False)
    event_type = Column(SAEnum(TimelineEventType), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    created_by = Column(String, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)

    # Relationship
    case = relationship("MissingPersonCase", back_populates="timeline_events")
