"""Media model for uploaded images, videos, and other files."""

import uuid
from datetime import datetime

from sqlalchemy import Column, String, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from app.database import Base


class Media(Base):
    __tablename__ = "media"

    id = Column(String, primary_key=True, default=lambda: f"med-{uuid.uuid4().hex[:8]}")
    case_id = Column(String, ForeignKey("cases.id"), nullable=True, index=True)
    sighting_id = Column(String, ForeignKey("sightings.id"), nullable=True)
    file_name = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    file_type = Column(String, nullable=False)  # image, video, document
    mime_type = Column(String, nullable=False)
    file_size_bytes = Column(Integer, nullable=False)
    uploaded_by = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    case = relationship("MissingPersonCase", back_populates="media")
    sighting = relationship("Sighting", back_populates="media")

    def __repr__(self):
        return f"<Media {self.file_name} ({self.file_type})>"
