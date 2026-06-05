"""Analytics service: aggregates case and sighting data."""

from datetime import datetime, timedelta
from typing import List

from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from app.models.case import MissingPersonCase, CaseStatus
from app.models.sighting import Sighting, SightingStatus
from app.models.match import AIMatch, MatchStatus
from app.models.user import User


class AnalyticsService:
    @staticmethod
    def get_overview(db: Session) -> dict:
        total_cases = db.query(MissingPersonCase).count()
        active_cases = db.query(MissingPersonCase).filter(
            MissingPersonCase.status == CaseStatus.ACTIVE
        ).count()
        resolved_cases = db.query(MissingPersonCase).filter(
            MissingPersonCase.status == CaseStatus.RESOLVED
        ).count()
        total_sightings = db.query(Sighting).count()
        pending_matches = db.query(AIMatch).filter(
            AIMatch.status == MatchStatus.PENDING
        ).count()
        approved_matches = db.query(AIMatch).filter(
            AIMatch.status == MatchStatus.APPROVED
        ).count()
        total_users = db.query(User).count()

        return {
            "total_cases": total_cases,
            "active_cases": active_cases,
            "resolved_cases": resolved_cases,
            "total_sightings": total_sightings,
            "pending_matches": pending_matches,
            "approved_matches": approved_matches,
            "avg_resolution_hours": 18.5,  # Mock value
            "total_users": total_users,
        }

    @staticmethod
    def get_trends(db: Session, days: int = 7) -> dict:
        daily = []
        for i in range(days - 1, -1, -1):
            day = datetime.utcnow() - timedelta(days=i)
            day_start = day.replace(hour=0, minute=0, second=0, microsecond=0)
            day_end = day_start + timedelta(days=1)

            cases = db.query(MissingPersonCase).filter(
                MissingPersonCase.created_at >= day_start,
                MissingPersonCase.created_at < day_end,
            ).count()

            resolved = db.query(MissingPersonCase).filter(
                MissingPersonCase.resolved_at >= day_start,
                MissingPersonCase.resolved_at < day_end,
            ).count()

            sightings = db.query(Sighting).filter(
                Sighting.created_at >= day_start,
                Sighting.created_at < day_end,
            ).count()

            daily.append({
                "date": day_start.strftime("%Y-%m-%d"),
                "cases": cases,
                "resolved": resolved,
                "sightings": sightings,
            })

        return {"daily": daily, "weekly": []}

    @staticmethod
    def get_heatmap_data(db: Session) -> List[dict]:
        cases = db.query(MissingPersonCase).filter(
            MissingPersonCase.latitude.isnot(None),
            MissingPersonCase.longitude.isnot(None),
        ).all()

        result = []
        for case in cases:
            sightings_count = db.query(Sighting).filter(
                Sighting.case_id == case.id
            ).count()
            result.append({
                "case_id": case.id,
                "name": case.name,
                "latitude": case.latitude,
                "longitude": case.longitude,
                "status": case.status.value,
                "sightings_count": sightings_count,
            })
        return result

    @staticmethod
    def get_regional(db: Session) -> List[dict]:
        # Mock regional data since real regions depend on case locations
        regions = [
            {"region": "Northeast", "total_cases": 128, "active_cases": 72, "resolution_rate": 68.5},
            {"region": "Southeast", "total_cases": 96, "active_cases": 51, "resolution_rate": 72.1},
            {"region": "Midwest", "total_cases": 74, "active_cases": 42, "resolution_rate": 65.3},
            {"region": "Southwest", "total_cases": 63, "active_cases": 38, "resolution_rate": 70.8},
            {"region": "West Coast", "total_cases": 112, "active_cases": 64, "resolution_rate": 66.7},
        ]
        return regions
