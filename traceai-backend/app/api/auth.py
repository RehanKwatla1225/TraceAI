"""Auth routes: register, login, OTP, password reset, token refresh."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.user import (
    UserCreate, UserLogin, UserResponse, TokenResponse,
    OTPRequest, OTPVerify, PasswordReset,
)
from app.services.auth_service import AuthService
from app.middleware.auth import decode_token, get_current_user
from app.models.user import User

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(data: UserCreate, db: Session = Depends(get_db)):
    """Register a new user account."""
    try:
        user, token = AuthService.register(
            db, email=data.email, password=data.password,
            name=data.name, role=data.role, phone=data.phone,
        )
        return TokenResponse(
            access_token=token,
            user=UserResponse.model_validate(user),
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/login", response_model=TokenResponse)
def login(data: UserLogin, db: Session = Depends(get_db)):
    """Authenticate user and return JWT token."""
    try:
        user, token = AuthService.login(db, email=data.email, password=data.password)
        return TokenResponse(
            access_token=token,
            user=UserResponse.model_validate(user),
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))


@router.post("/refresh", response_model=TokenResponse)
def refresh_token(current_user: User = Depends(get_current_user)):
    """Refresh the access token."""
    from app.middleware.auth import create_access_token
    token = create_access_token({"sub": current_user.id, "role": current_user.role.value})
    return TokenResponse(
        access_token=token,
        user=UserResponse.model_validate(current_user),
    )


@router.post("/otp/send")
def send_otp(data: OTPRequest, db: Session = Depends(get_db)):
    """Send OTP to user email or phone."""
    try:
        otp = AuthService.generate_otp(db, data.email)
        # In production, actually send the OTP
        return {"message": "OTP sent successfully", "debug_otp": otp}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/otp/verify")
def verify_otp(data: OTPVerify, db: Session = Depends(get_db)):
    """Verify OTP code."""
    try:
        AuthService.verify_otp(db, data.email, data.code)
        return {"message": "OTP verified successfully"}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/password-reset")
def reset_password(data: PasswordReset, db: Session = Depends(get_db)):
    """Reset password using OTP verification."""
    try:
        AuthService.reset_password(db, data.email, data.otp_code, data.new_password)
        return {"message": "Password reset successfully"}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/me", response_model=UserResponse)
def get_profile(current_user: User = Depends(get_current_user)):
    """Get current user profile."""
    return UserResponse.model_validate(current_user)
