"""Audit log model for system-wide activity tracking."""

import uuid
from datetime import datetime

from sqlalchemy import Column, String, Text, DateTime

from app.database import Base


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String, primary_key=True, default=lambda: f"aud-{uuid.uuid4().hex[:8]}")
    user_id = Column(String, nullable=False)
    user_name = Column(String, nullable=False)
    action = Column(String, nullable=False, index=True)
    resource = Column(String, nullable=True)
    details = Column(Text, nullable=True)
    ip_address = Column(String, nullable=True)
    user_agent = Column(String, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<AuditLog {self.action} by {self.user_name}>"
