"""Auth service: user registration, login, OTP, password management."""

import random
from datetime import datetime, timedelta

from sqlalchemy.orm import Session
from app.middleware.auth import hash_password, verify_password, create_access_token
from app.models.user import User, UserRole
from app.models.audit_log import AuditLog


class AuthService:
    @staticmethod
    def register(db: Session, email: str, password: str, name: str, role: str = "family", phone: str = None) -> tuple[User, str]:
        existing = db.query(User).filter(User.email == email).first()
        if existing:
            raise ValueError("Email already registered")

        try:
            user_role = UserRole(role.lower())
        except ValueError:
            raise ValueError(f"Invalid role: {role}. Must be one of: family, citizen, authority, admin")

        user = User(
            email=email,
            name=name,
            phone=phone,
            hashed_password=hash_password(password),
            role=user_role,
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        token = create_access_token({"sub": user.id, "role": user.role.value})

        # Audit
        db.add(AuditLog(
            user_id=user.id,
            user_name=name,
            action="USER_REGISTERED",
            resource=f"user/{user.id}",
            details=f"User registered with role {role}",
        ))
        db.commit()

        return user, token

    @staticmethod
    def login(db: Session, email: str, password: str) -> tuple[User, str]:
        user = db.query(User).filter(User.email == email).first()
        if not user or not verify_password(password, user.hashed_password):
            raise ValueError("Invalid email or password")
        if not user.is_active:
            raise ValueError("Account is deactivated")

        token = create_access_token({"sub": user.id, "role": user.role.value})

        # Audit
        db.add(AuditLog(
            user_id=user.id,
            user_name=user.name,
            action="USER_LOGIN",
            resource=f"user/{user.id}",
            details="User logged in",
        ))
        db.commit()

        return user, token

    @staticmethod
    def generate_otp(db: Session, email: str) -> str:
        user = db.query(User).filter(User.email == email).first()
        if not user:
            raise ValueError("Email not found")

        otp = str(random.randint(100000, 999999))
        user.otp_code = otp
        user.otp_expires_at = datetime.utcnow() + timedelta(minutes=10)
        db.commit()

        # In production, send via email/SMS here
        return otp

    @staticmethod
    def verify_otp(db: Session, email: str, code: str) -> bool:
        user = db.query(User).filter(User.email == email).first()
        if not user:
            raise ValueError("Email not found")
        if user.otp_code != code:
            raise ValueError("Invalid OTP code")
        if user.otp_expires_at and user.otp_expires_at < datetime.utcnow():
            raise ValueError("OTP has expired")

        user.is_verified = True
        user.otp_code = None
        user.otp_expires_at = None
        db.commit()
        return True

    @staticmethod
    def reset_password(db: Session, email: str, otp_code: str, new_password: str) -> bool:
        # Verify OTP first
        AuthService.verify_otp(db, email, otp_code)
        user = db.query(User).filter(User.email == email).first()
        user.hashed_password = hash_password(new_password)
        db.commit()

        db.add(AuditLog(
            user_id=user.id, user_name=user.name,
            action="PASSWORD_RESET", resource=f"user/{user.id}",
            details="Password reset completed",
        ))
        db.commit()
        return True
