# app/api/__init__.py
from app.api.auth import router as auth_router
from app.api.cases import router as cases_router
from app.api.sightings import router as sightings_router
from app.api.matches import router as matches_router
from app.api.notifications import router as notifications_router
from app.api.analytics import router as analytics_router
from app.api.admin import router as admin_router

__all__ = [
    "auth_router",
    "cases_router",
    "sightings_router",
    "matches_router",
    "notifications_router",
    "analytics_router",
    "admin_router",
]
