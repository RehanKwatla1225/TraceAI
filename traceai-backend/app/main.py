"""TraceAI Backend - FastAPI application entry point."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.database import init_db
from app.api import (
    auth_router, cases_router, sightings_router, matches_router,
    notifications_router, analytics_router, admin_router,
)
from app.api.predictive import router as predictive_router
from app.api.uploads import router as uploads_router

app = FastAPI(
    title="TraceAI API",
    description="AI-Powered Missing Person Recovery & Intelligence Network",
    version="1.5.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files for uploads
import os
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

try:
    app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")
except Exception:
    pass

# Register routers
app.include_router(auth_router)
app.include_router(cases_router)
app.include_router(sightings_router)
app.include_router(matches_router)
app.include_router(notifications_router)
app.include_router(analytics_router)
app.include_router(admin_router)
app.include_router(predictive_router)
app.include_router(uploads_router)


@app.on_event("startup")
def on_startup():
    """Initialize database tables on startup."""
    init_db()


@app.get("/api")
def root():
    """API root - returns version and available endpoints."""
    return {
        "name": "TraceAI API",
        "version": "1.5.0",
        "docs": "/docs",
        "redoc": "/redoc",
        "ai_modules": {
            "facial_recognition": "FaceNet-simulated ensemble matching",
            "clothing_analysis": "YOLOv8-simulated item detection",
            "age_estimation": "Regression model +/- 2yr accuracy",
            "attribute_extraction": "Multi-category attribute scoring",
            "movement_prediction": "LSTM-simulated temporal pattern engine",
            "transport_detection": "Haversine-based hub classification",
        },
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=True)
