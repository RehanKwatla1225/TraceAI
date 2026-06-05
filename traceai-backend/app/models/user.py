"""User model with roles and auth fields."""

import uuid
from datetime import datetime

from sqlalchemy import Column, String, Boolean, DateTime, Enum as SAEnum
from sqlalchemy.orm import relationship
import enum

from app.database import Base


class UserRole(str, enum.Enum):
    FAMILY = "family"
    CITIZEN = "citizen"
    AUTHORITY = "authority"
    ADMIN = "admin"


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=lambda: f"usr-{uuid.uuid4().hex[:8]}")
    email = Column(String, unique=True, nullable=False, index=True)
    phone = Column(String, nullable=True)
    name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(SAEnum(UserRole), default=UserRole.FAMILY, nullable=False)
    is_verified = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    avatar_url = Column(String, nullable=True)
    otp_code = Column(String, nullable=True)
    otp_expires_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    cases = relationship("MissingPersonCase", back_populates="creator")
    sightings = relationship("Sighting", back_populates="reporter")
    notifications = relationship("Notification", back_populates="user")

    def __repr__(self):
        return f"<User {self.email} ({self.role.value})>"
