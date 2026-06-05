"""Sighting model for citizen-reported sightings."""

import uuid
from datetime import datetime

from sqlalchemy import Column, String, Text, Float, DateTime, Enum as SAEnum, ForeignKey, Boolean
from sqlalchemy.orm import relationship
import enum

from app.database import Base


class SightingStatus(str, enum.Enum):
    PENDING = "pending"
    VERIFIED = "verified"
    DISMISSED = "dismissed"


class Sighting(Base):
    __tablename__ = "sightings"

    id = Column(String, primary_key=True, default=lambda: f"sgt-{uuid.uuid4().hex[:8]}")
    case_id = Column(String, ForeignKey("cases.id"), nullable=False, index=True)
    location_name = Column(String, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    description = Column(Text, nullable=False)
    witness_name = Column(String, nullable=True)
    witness_contact = Column(String, nullable=True)
    is_anonymous = Column(Boolean, default=True)
    status = Column(SAEnum(SightingStatus), default=SightingStatus.PENDING, nullable=False)
    reported_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    reported_by = Column(String, ForeignKey("users.id"), nullable=True)
    verified_by = Column(String, nullable=True)
    verified_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    case = relationship("MissingPersonCase", back_populates="sightings")
    reporter = relationship("User", back_populates="sightings")
    media = relationship("Media", back_populates="sighting")
    matches = relationship("AIMatch", back_populates="sighting")

    def __repr__(self):
        return f"<Sighting {self.id} for {self.case_id}>"
