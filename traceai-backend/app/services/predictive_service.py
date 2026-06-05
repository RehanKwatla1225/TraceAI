"""Predictive intelligence service: movement patterns, transport hubs, route prediction."""

import random
import math
from datetime import datetime, timedelta
from typing import List, Dict, Optional
from sqlalchemy.orm import Session

from app.models.case import MissingPersonCase, CaseStatus
from app.models.sighting import Sighting
from app.models.match import AIMatch, MatchStatus


class PredictiveIntelligence:
    """Movement pattern engine, route prediction, and transport hub detection.

    Simulates what would be powered by ML models (LSTM/Transformer for
    sequences, XGBoost for hub classification) in production.
    """

    # Known transport hubs with coordinates
    TRANSPORT_HUBS = [
        {"name": "Grand Central Terminal", "city": "New York", "lat": 40.7527, "lon": -73.9772, "type": "rail", "daily_traffic": 750000},
        {"name": "Penn Station", "city": "New York", "lat": 40.7505, "lon": -73.9934, "type": "rail", "daily_traffic": 600000},
        {"name": "Port Authority Bus Terminal", "city": "New York", "lat": 40.7570, "lon": -73.9911, "type": "bus", "daily_traffic": 200000},
        {"name": "Union Station", "city": "Washington DC", "lat": 38.8977, "lon": -77.0065, "type": "rail", "daily_traffic": 100000},
        {"name": "Los Angeles Union Station", "city": "Los Angeles", "lat": 34.0562, "lon": -118.2368, "type": "rail", "daily_traffic": 110000},
        {"name": "Union Square", "city": "San Francisco", "lat": 37.7879, "lon": -122.4075, "type": "transit", "daily_traffic": 300000},
        {"name": "Chicago Union Station", "city": "Chicago", "lat": 41.8774, "lon": -87.6409, "type": "rail", "daily_traffic": 120000},
        {"name": "South Station", "city": "Boston", "lat": 42.3520, "lon": -71.0554, "type": "rail", "daily_traffic": 90000},
        {"name": "King's Cross Station", "city": "London", "lat": 51.5320, "lon": -0.1233, "type": "rail", "daily_traffic": 500000},
        {"name": "Chhatrapati Shivaji Terminus", "city": "Mumbai", "lat": 18.9398, "lon": 72.8354, "type": "rail", "daily_traffic": 1000000},
    ]

    @staticmethod
    def predict_movement(case: MissingPersonCase) -> dict:
        """Multi-factor movement prediction with time-bucketed probabilities."""
        # Find nearby transport hubs
        nearby_hubs = PredictiveIntelligence._find_nearby_hubs(case.latitude, case.longitude, case.search_radius_km * 2)

        # Time since last seen
        hours_since = (datetime.utcnow() - case.last_seen_date).total_seconds() / 3600 if case.last_seen_date else 0
        decay_factor = max(0.1, 1.0 - (hours_since / 240))  # Decay over 10 days

        # Demographic-appropriate zones
        is_child = case.age < 12
        is_elderly = case.age > 60
        is_teen = 13 <= case.age <= 19

        profile_zones = []
        if is_child:
            profile_zones = ["Playgrounds", "Parks", "Near schools", "Friend homes"]
        elif is_teen:
            profile_zones = ["Shopping centers", "Public transit", "Friend homes", "Entertainment districts"]
        elif is_elderly:
            profile_zones = ["Medical facilities", "Places of worship", "Parks", "Community centers"]
        else:
            profile_zones = ["Transit stations", "Commercial districts", "Public spaces", "Employment areas"]

        # Generate time-bucketed predictions
        time_buckets = [
            {"label": "Next 3 hours", "hours": 3, "weight": 1.0},
            {"label": "3-12 hours", "hours": 12, "weight": 0.7},
            {"label": "12-48 hours", "hours": 48, "weight": 0.4},
        ]

        predictions = []
        for bucket in time_buckets:
            zone_predictions = []
            for zone in profile_zones[:3]:
                base_prob = random.uniform(0.15, 0.50) * bucket["weight"] * decay_factor
                zone_predictions.append({
                    "zone": zone,
                    "probability": round(min(base_prob, 0.95), 3),
                    "distance_km": round(random.uniform(0.5, case.search_radius_km * 1.5), 1),
                })

            # Sort by probability and pick top
            zone_predictions.sort(key=lambda x: x["probability"], reverse=True)
            top_zones = zone_predictions[:3]

            predictions.append({
                "timeframe": bucket["label"],
                "hours": bucket["hours"],
                "zones": top_zones,
                "total_movement_radius": round(case.search_radius_km * (1 + bucket["hours"] * 0.02), 1),
            })

        # The most probable immediate zone
        best_now = predictions[0]["zones"][0] if predictions else {}

        return {
            "case_id": case.id,
            "name": case.name,
            "age": case.age,
            "age_category": "child" if is_child else ("teen" if is_teen else ("elderly" if is_elderly else "adult")),
            "hours_since_last_seen": round(hours_since, 1),
            "decay_factor": round(decay_factor, 3),
            "current_best_guess": best_now,
            "time_buckets": predictions,
            "nearby_transport_hubs": nearby_hubs[:5],
            "predicted_route": PredictiveIntelligence._generate_route(case, nearby_hubs, predictions),
            "model_version": "movement-pattern-v2",
        }

    @staticmethod
    def _find_nearby_hubs(lat: float, lon: float, radius_km: float) -> List[dict]:
        """Find transport hubs within search radius using haversine approximation."""
        def haversine_km(lat1, lon1, lat2, lon2):
            dlat = math.radians(lat2 - lat1)
            dlon = math.radians(lon2 - lon1)
            a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon/2)**2
            c = 2 * math.asin(min(1, math.sqrt(a)))
            return 6371 * c

        results = []
        for hub in PredictiveIntelligence.TRANSPORT_HUBS:
            dist = haversine_km(lat, lon, hub["lat"], hub["lon"])
            if dist <= radius_km:
                entry = dict(hub)
                entry["distance_km"] = round(dist, 1)
                entry["catchment_probability"] = round(max(0.05, 1.0 - (dist / radius_km)), 3)
                results.append(entry)

        results.sort(key=lambda x: x["catchment_probability"], reverse=True)
        return results

    @staticmethod
    def _generate_route(case: MissingPersonCase, hubs: List[dict], predictions: List[dict]) -> List[dict]:
        """Generate a most-probable route through predicted zones."""
        route = []

        # Start: last seen location
        route.append({
            "step": 0,
            "type": "last_seen",
            "location": case.last_seen_location,
            "lat": case.latitude,
            "lon": case.longitude,
            "description": f"Last seen here at {case.last_seen_date.strftime('%b %d, %I:%M %p') if case.last_seen_date else 'unknown time'}",
            "timeframe": "Start",
        })

        # Middle steps: through hubs and zones
        if hubs:
            for i, hub in enumerate(hubs[:2]):
                route.append({
                    "step": i + 1,
                    "type": "transport_hub",
                    "location": hub["name"],
                    "lat": hub["lat"],
                    "lon": hub["lon"],
                    "description": f"Public transport hub ({hub['type']}) serving {hub['daily_traffic']:,} passengers/day",
                    "timeframe": f"+{ (i+1) * 2 }-{ (i+1) * 4 } hours",
                    "probability": hub["catchment_probability"],
                })

        # End: best predicted zone
        if predictions:
            best = predictions[0]
            zone = best["zones"][0] if best["zones"] else None
            if zone:
                route.append({
                    "step": len(route),
                    "type": "predicted_zone",
                    "location": zone["zone"],
                    "lat": case.latitude + random.uniform(-0.05, 0.05) if case.latitude else 0,
                    "lon": case.longitude + random.uniform(-0.05, 0.05) if case.longitude else 0,
                    "description": f"Predicted location with {zone['probability']:.0%} probability",
                    "timeframe": best["timeframe"],
                    "probability": zone["probability"],
                })

        return route

    @staticmethod
    def detect_transport_hubs(db: Session, case_id: str) -> List[dict]:
        """Detect relevant transport hubs for a specific case."""
        case = db.query(MissingPersonCase).filter(MissingPersonCase.id == case_id).first()
        if not case:
            return []

        hubs = PredictiveIntelligence._find_nearby_hubs(case.latitude, case.longitude, case.search_radius_km * 3)

        # Add matching probability based on case demographics
        for hub in hubs:
            # Elderly more likely at rail, teens more likely at transit, etc.
            demographic_bonus = 1.0
            if case.age > 60 and hub["type"] == "rail":
                demographic_bonus = 1.3
            elif case.age < 18 and hub["type"] == "transit":
                demographic_bonus = 1.2

            hub["adjusted_probability"] = round(min(hub["catchment_probability"] * demographic_bonus, 0.95), 3)

        hubs.sort(key=lambda x: x["adjusted_probability"], reverse=True)
        return hubs

    @staticmethod
    def generate_heat_zones(db: Session) -> List[dict]:
        """Generate heat zones based on current active cases and sightings."""
        active_cases = db.query(MissingPersonCase).filter(
            MissingPersonCase.status.in_([CaseStatus.ACTIVE, CaseStatus.UNDER_REVIEW])
        ).all()

        zones = []
        for case in active_cases:
            sighting_count = db.query(Sighting).filter(Sighting.case_id == case.id).count()
            match_count = db.query(AIMatch).filter(
                AIMatch.case_id == case.id,
                AIMatch.status == MatchStatus.APPROVED,
            ).count()

            zones.append({
                "case_id": case.id,
                "name": case.name,
                "lat": case.latitude,
                "lon": case.longitude,
                "intensity": min(100, 30 + sighting_count * 15 + match_count * 20),
                "sightings": sighting_count,
                "approved_matches": match_count,
                "status": case.status.value,
            })

        zones.sort(key=lambda x: x["intensity"], reverse=True)
        return zones

    @staticmethod
    def get_timeline_pattern(db: Session, case_id: str) -> dict:
        """Build chronological movement pattern from case timeline events."""
        case = db.query(MissingPersonCase).filter(MissingPersonCase.id == case_id).first()
        if not case:
            return {"error": "Case not found"}

        sightings = db.query(Sighting).filter(Sighting.case_id == case_id).order_by(Sighting.reported_at).all()

        pattern = {
            "case_id": case_id,
            "name": case.name,
            "last_seen": case.last_seen_date.isoformat() if case.last_seen_date else None,
            "total_sightings": len(sightings),
            "movement_arc": [
                {
                    "sequence": i + 1,
                    "location": s.location_name,
                    "lat": s.latitude,
                    "lon": s.longitude,
                    "time": s.reported_at.isoformat(),
                    "hours_from_last_seen": round((s.reported_at - case.last_seen_date).total_seconds() / 3600, 1) if case.last_seen_date else 0,
                    "status": s.status.value,
                }
                for i, s in enumerate(sightings)
            ],
            "total_distance_traveled_km": round(sum(
                random.uniform(0.5, 5.0) for _ in sightings
            ), 1),
            "direction_momentum": random.choice(["northeast", "southwest", "downtown", "suburban_expansion"]),
        }
        return pattern
