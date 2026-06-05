"""Pydantic schemas for User model."""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str
    phone: Optional[str] = None
    role: str = "family"


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    role: str
    phone: Optional[str] = None
    is_verified: bool
    is_active: bool
    avatar_url: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class OTPRequest(BaseModel):
    email: str
    method: str = "email"  # email or sms


class OTPVerify(BaseModel):
    email: str
    code: str


class PasswordReset(BaseModel):
    email: EmailStr
    otp_code: str
    new_password: str


class UserUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None
