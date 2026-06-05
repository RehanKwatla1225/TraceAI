"""Notification service: in-app, email (SMTP), and SMS (mock) delivery."""

import smtplib
import logging
from email.message import EmailMessage
from datetime import datetime
from typing import List, Optional

from sqlalchemy.orm import Session
from app.config import settings
from app.models.notification import Notification, NotificationType
from app.models.user import User

logger = logging.getLogger("traceai.notifications")


class NotificationService:
    @staticmethod
    def get_notifications(
        db: Session,
        user_id: str,
        limit: int = 20,
        offset: int = 0,
        unread_only: bool = False,
    ) -> tuple[List[Notification], int, int]:
        query = db.query(Notification).filter(Notification.user_id == user_id)
        total = query.count()
        unread_count = query.filter(Notification.is_read == False).count()
        if unread_only:
            query = query.filter(Notification.is_read == False)
        notifications = query.order_by(Notification.created_at.desc()).offset(offset).limit(limit).all()
        return notifications, total, unread_count

    @staticmethod
    def mark_read(db: Session, notification_id: str, user_id: str) -> Optional[Notification]:
        notif = db.query(Notification).filter(
            Notification.id == notification_id,
            Notification.user_id == user_id,
        ).first()
        if notif:
            notif.is_read = True
            notif.read_at = datetime.utcnow()
            db.commit()
            db.refresh(notif)
        return notif

    @staticmethod
    def mark_all_read(db: Session, user_id: str) -> int:
        count = (
            db.query(Notification)
            .filter(Notification.user_id == user_id, Notification.is_read == False)
            .update({"is_read": True, "read_at": datetime.utcnow()})
        )
        db.commit()
        return count

    @staticmethod
    def create_notification(
        db: Session,
        user_id: str,
        title: str,
        message: str,
        notification_type: NotificationType = NotificationType.INFO,
        link: Optional[str] = None,
        send_email: bool = False,
        send_sms: bool = False,
    ) -> Notification:
        notif = Notification(
            user_id=user_id,
            title=title,
            message=message,
            notification_type=notification_type,
            link=link,
        )
        db.add(notif)
        db.flush()

        # Send email alert if configured and requested (TA-025)
        if send_email and settings.SMTP_HOST:
            try:
                user = db.query(User).filter(User.id == user_id).first()
                if user and user.email:
                    NotificationService._send_email(user.email, title, message)
            except Exception as e:
                logger.warning(f"Email send failed for {user_id}: {e}")

        # Send SMS alert (TA-026) - mock implementation
        if send_sms:
            user = db.query(User).filter(User.id == user_id).first()
            if user and user.phone:
                NotificationService._send_sms_mock(user.phone, message)

        db.commit()
        db.refresh(notif)
        return notif

    @staticmethod
    def _send_email(to_email: str, subject: str, body: str):
        """Send email via SMTP (TA-025 Email Alerts)."""
        if not settings.SMTP_HOST or not settings.SMTP_USER:
            logger.info(f"Email not sent (SMTP not configured): [{subject}] to {to_email}")
            return

        msg = EmailMessage()
        msg.set_content(body)
        msg["Subject"] = f"[TraceAI] {subject}"
        msg["From"] = settings.SMTP_USER
        msg["To"] = to_email

        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            if settings.SMTP_PASSWORD:
                server.starttls()
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.send_message(msg)

        logger.info(f"Email sent to {to_email}: {subject}")

    @staticmethod
    def _send_sms_mock(to_phone: str, message: str):
        """Mock SMS sender (TA-026 SMS Alerts - low priority, simulated).
        
        In production, integrate with Twilio, AWS SNS, or similar.
        """
        # Log the SMS for demo purposes
        logger.info(f"SMS to {to_phone}: {message[:60]}...")
        # In production: twilio_client.messages.create(body=message, from_=TWILIO_NUMBER, to=to_phone)
