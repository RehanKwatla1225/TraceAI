"""AI Match model for facial and attribute matching results."""

import uuid
from datetime import datetime

from sqlalchemy import Column, String, Float, DateTime, Enum as SAEnum, ForeignKey
from sqlalchemy.orm import relationship
import enum

from app.database import Base


class MatchStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"


class MatchAttribute(Base):
    """Individual matched attributes for a match result."""
    __tablename__ = "match_attributes"

    id = Column(String, primary_key=True, default=lambda: f"attr-{uuid.uuid4().hex[:8]}")
    match_id = Column(String, ForeignKey("matches.id"), nullable=False)
    attribute_name = Column(String, nullable=False)
    confidence = Column(Float, nullable=False)
    match = relationship("AIMatch", back_populates="attributes")


class AIMatch(Base):
    __tablename__ = "matches"

    id = Column(String, primary_key=True, default=lambda: f"mch-{uuid.uuid4().hex[:8]}")
    case_id = Column(String, ForeignKey("cases.id"), nullable=False, index=True)
    sighting_id = Column(String, ForeignKey("sightings.id"), nullable=True)
    confidence_score = Column(Float, nullable=False)
    ai_model_version = Column(String, default="face-match-v1")
    status = Column(SAEnum(MatchStatus), default=MatchStatus.PENDING, nullable=False)
    reviewed_by = Column(String, nullable=True)
    reviewed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    case = relationship("MissingPersonCase", back_populates="matches")
    sighting = relationship("Sighting", back_populates="matches")
    attributes = relationship("MatchAttribute", back_populates="match", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<AIMatch {self.id}: {self.confidence_score:.0%} confidence>"
