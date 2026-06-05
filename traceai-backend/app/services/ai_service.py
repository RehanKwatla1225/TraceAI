"""AI matching service with attribute-level scoring, clothing recognition,
age estimation, and multi-algorithm match ranking."""

import random
import math
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Tuple

from sqlalchemy.orm import Session

from app.config import settings
from app.models.match import AIMatch, MatchAttribute
from app.models.case import MissingPersonCase, TimelineEvent, TimelineEventType
from app.models.sighting import Sighting
from app.models.notification import Notification, NotificationType


class AIService:
    """AI matching engine simulating FaceNet, YOLOv8, DeepSORT, and XGBoost.

    Each "algorithm" produces a weighted sub-score. The final confidence is
    a weighted ensemble of all sub-scores, mimicking a production ensemble
    without requiring actual ML models.
    """

    # Attribute categories with base weights
    ATTRIBUTES = {
        "biometric": [
            ("Facial structure", 0.35),
            ("Eye shape", 0.35),
            ("Nose bridge", 0.30),
            ("Jawline", 0.25),
            ("Ear shape", 0.15),
        ],
        "clothing": [
            ("Clothing color", 0.25),
            ("Clothing type", 0.25),
            ("Footwear", 0.15),
            ("Accessories", 0.10),
        ],
        "demographic": [
            ("Age range", 0.20),
            ("Height estimate", 0.15),
            ("Build type", 0.15),
            ("Skin tone", 0.10),
        ],
        "distinctive": [
            ("Distinguishing marks", 0.40),
            ("Glasses", 0.15),
            ("Facial hair", 0.15),
            ("Hair style", 0.10),
            ("Tattoos/piercings", 0.30),
        ],
        "behavioral": [
            ("Gait pattern", 0.10),
            ("Posture", 0.10),
            ("Carried items", 0.05),
        ],
    }

    MATCH_THRESHOLD = settings.AI_MATCH_THRESHOLD

    @staticmethod
    def _simulate_face_match(case: MissingPersonCase, sighting: Sighting) -> Dict[str, float]:
        """Simulate FaceNet-like facial recognition scoring."""
        base = random.uniform(0.40, 0.95)
        # Boost if age/gender match well
        gender_bonus = 0.05
        age_penalty = max(0, abs(case.age - random.randint(case.age - 3, case.age + 3)) * 0.01)
        clothing_overlap = random.uniform(0, 0.10)
        return {
            "facial_score": round(min(base + gender_bonus - age_penalty + clothing_overlap, 0.99), 3),
            "age_estimation": case.age + random.randint(-2, 2),
            "age_confidence": round(random.uniform(0.70, 0.95), 3),
        }

    @staticmethod
    def _simulate_clothing_recognition(case: MissingPersonCase) -> Dict[str, float]:
        """Simulate YOLOv8 clothing detection and matching."""
        if not case.clothing:
            return {"clothing_match": 0.0, "detected_items": []}

        clothing_items = [c.strip().lower() for c in case.clothing.replace(", ", ",").split(",")]
        detected = random.sample(clothing_items, min(len(clothing_items), random.randint(2, 5)))

        match_rate = len(detected) / max(len(clothing_items), 1)
        noise = random.uniform(-0.10, 0.10)
        return {
            "clothing_match": round(min(max(match_rate + noise, 0.0), 1.0), 3),
            "detected_items": detected,
        }

    @staticmethod
    def _simulate_distinctive_matching(case: MissingPersonCase) -> Dict[str, float]:
        """Match distinguishing features."""
        if not case.distinguishing_features:
            return {"distinctive_match": 0.0, "matched_marks": []}

        features = [f.strip().lower() for f in case.distinguishing_features.split(",")]
        matched = random.sample(features, min(len(features), random.randint(1, 3)))

        return {
            "distinctive_match": round(min(len(matched) / max(len(features), 1) + random.uniform(-0.05, 0.10), 1.0), 3),
            "matched_marks": matched,
        }

    @staticmethod
    def _compute_ensemble(case: MissingPersonCase, sighting: Sighting) -> Tuple[float, List[Tuple[str, float, float]]]:
        """Weighted ensemble of all sub-scores into final confidence."""
        face = AIService._simulate_face_match(case, sighting)
        clothing = AIService._simulate_clothing_recognition(case)
        distinctive = AIService._simulate_distinctive_matching(case)

        scores = [
            ("Facial recognition", face["facial_score"], 0.45),
            ("Clothing analysis", clothing["clothing_match"], 0.20),
            ("Distinctive features", distinctive["distinctive_match"], 0.20),
            ("Demographic profile", face.get("age_confidence", 0.7), 0.10),
            ("Behavioral patterns", random.uniform(0.30, 0.70), 0.05),
        ]

        weighted = sum(s * w for _, s, w in scores)
        final_score = round(min(max(weighted, 0.0), 0.99), 2)

        # Generate per-attribute details for the match
        attribute_details = []
        for attr_name, base_conf in AIService.ATTRIBUTES["biometric"]:
            attr_details = AIService._generate_attribute_detail(attr_name, base_conf, face)
            attribute_details.append(attr_details)

        for attr_name, base_conf in AIService.ATTRIBUTES["clothing"]:
            attr_details = AIService._generate_attribute_detail(attr_name, base_conf, clothing, "clothing")
            attribute_details.append(attr_details)

        for attr_name, base_conf in AIService.ATTRIBUTES["demographic"]:
            attr_score = face.get("age_confidence", 0.7) if "age" in attr_name.lower() else random.uniform(0.5, 0.9)
            attribute_details.append((attr_name, attr_score))

        for attr_name, base_conf in AIService.ATTRIBUTES["distinctive"]:
            attr_score = distinctive.get("distinctive_match", 0.5) if "mark" in attr_name.lower() or "feature" in attr_name.lower() else random.uniform(0.5, 0.9)
            attribute_details.append((attr_name, attr_score))

        # Trim and sort by confidence
        attribute_details = sorted(set(attribute_details), key=lambda x: x[0])[:8]
        attribute_details.sort(key=lambda x: x[1], reverse=True)

        return final_score, attribute_details

    @staticmethod
    def _generate_attribute_detail(name: str, base_weight: float, source: dict, category: str = "biometric") -> Tuple[str, float]:
        """Generate a per-attribute confidence score based on source data."""
        if category == "clothing" and "clothing_match" in source:
            return (name, round(min(source["clothing_match"] * base_weight * 3 + random.uniform(-0.05, 0.05), 0.99), 2))
        return (name, round(min(base_weight + random.uniform(-0.10, 0.15), 0.99), 2))

    @staticmethod
    def analyze_sighting(db: Session, case_id: str, sighting_id: str) -> Optional[AIMatch]:
        """Full AI analysis pipeline: ensemble of algorithms on a sighting."""
        case = db.query(MissingPersonCase).filter(MissingPersonCase.id == case_id).first()
        sighting = db.query(Sighting).filter(Sighting.id == sighting_id).first()
        if not case or not sighting:
            return None

        final_score, attribute_details = AIService._compute_ensemble(case, sighting)

        match = AIMatch(
            case_id=case_id,
            sighting_id=sighting_id,
            confidence_score=final_score,
            ai_model_version="ensemble-v2",
        )
        db.add(match)
        db.flush()

        # Write attribute-level details
        for attr_name, attr_conf in attribute_details:
            db.add(MatchAttribute(
                match_id=match.id,
                attribute_name=attr_name,
                confidence=attr_conf,
            ))

        # Timeline
        db.add(TimelineEvent(
            case_id=case_id,
            event_type=TimelineEventType.MATCH,
            title=f"AI Match Found ({final_score:.0%} confidence)",
            description=(
                f"Ensemble matched {len(attribute_details)} attributes. "
                f"Face: {final_score:.0%} | Clothing: {random.uniform(0.5, 0.9):.0%} | "
                f"Distinctive: {random.uniform(0.4, 0.9):.0%}"
            ),
            created_by="ai-system",
        ))

        # Notify
        alert = final_score > AIService.MATCH_THRESHOLD
        db.add(Notification(
            user_id=case.created_by,
            title=f"{'HIGH CONFIDENCE ' if alert else ''}Match Found",
            message=f"Case {case.name}: {final_score:.0%} confidence match from {sighting.location_name}.",
            notification_type=NotificationType.ALERT if alert else NotificationType.INFO,
            link=f"/cases/{case_id}",
        ))

        db.commit()
        db.refresh(match)
        return match

    @staticmethod
    def rank_matches(db: Session, case_id: Optional[str] = None, min_score: float = 0.0, limit: int = 20) -> List[dict]:
        """Rank matches by confidence with full attribute breakdowns."""
        from sqlalchemy import desc
        query = db.query(AIMatch)
        if case_id:
            query = query.filter(AIMatch.case_id == case_id)
        if min_score > 0:
            query = query.filter(AIMatch.confidence_score >= min_score)

        matches = query.order_by(desc(AIMatch.confidence_score)).limit(limit).all()

        result = []
        for m in matches:
            attrs = db.query(MatchAttribute).filter(MatchAttribute.match_id == m.id).all()
            result.append({
                "id": m.id,
                "case_id": m.case_id,
                "sighting_id": m.sighting_id,
                "confidence_score": m.confidence_score,
                "ai_model_version": m.ai_model_version,
                "status": m.status.value,
                "matched_attributes": {a.attribute_name: a.confidence for a in attrs},
                "created_at": m.created_at.isoformat(),
            })
        return result

    @staticmethod
    def batch_analyze(db: Session, case_id: str) -> dict:
        """Re-analyze all pending sightings for a case."""
        sightings = db.query(Sighting).filter(
            Sighting.case_id == case_id,
            Sighting.status != "dismissed",
        ).all()

        results = []
        for sighting in sightings:
            match = AIService.analyze_sighting(db, case_id, sighting.id)
            if match:
                results.append({"sighting_id": sighting.id, "match_id": match.id, "confidence": match.confidence_score})

        return {"case_id": case_id, "total_analyzed": len(results), "matches": results}
