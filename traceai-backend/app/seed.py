"""Seed script: populates the database with demo users and sample data."""

from datetime import datetime, timedelta
import random

from app.database import init_db, SessionLocal
from app.models.user import User, UserRole
from app.models.case import MissingPersonCase, CaseStatus, TimelineEvent, TimelineEventType
from app.models.sighting import Sighting, SightingStatus
from app.models.match import AIMatch, MatchStatus, MatchAttribute
from app.models.notification import Notification, NotificationType
from app.models.audit_log import AuditLog
from app.middleware.auth import hash_password


def seed():
    """Seed the database with demo data."""
    init_db()
    db = SessionLocal()

    # Check if already seeded
    if db.query(User).count() > 0:
        print("Database already seeded. Skipping.")
        db.close()
        return

    # --- Users ---
    users_data = [
        {"id": "usr-001", "name": "Sarah Johnson", "email": "family@traceai.io", "role": UserRole.FAMILY, "phone": "+1 (555) 123-4567"},
        {"id": "usr-002", "name": "Det. Michael Rivera", "email": "authority@traceai.io", "role": UserRole.AUTHORITY, "phone": "+1 (555) 987-6543"},
        {"id": "usr-003", "name": "Priya Sharma", "email": "admin@traceai.io", "role": UserRole.ADMIN, "phone": "+1 (555) 555-0001"},
        {"id": "usr-004", "name": "James Wilson", "email": "citizen@traceai.io", "role": UserRole.CITIZEN, "phone": "+1 (555) 555-0002"},
    ]

    users = {}
    for u in users_data:
        user = User(
            id=u["id"],
            email=u["email"],
            name=u["name"],
            role=u["role"],
            phone=u.get("phone"),
            is_verified=True,
            hashed_password=hash_password("demo123"),
        )
        db.add(user)
        users[u["id"]] = user

    db.commit()
    print(f"Created {len(users_data)} demo users")

    # --- Cases ---
    cases_data = [
        {
            "id": "TA-1001", "name": "Emily Chen", "age": 8, "gender": "female",
            "last_seen_location": "Central Park, New York, NY",
            "last_seen_date": datetime.utcnow() - timedelta(days=8),
            "latitude": 40.7829, "longitude": -73.9654,
            "description": "Last seen near the Central Park Zoo playground. Was wearing a pink jacket and blue jeans.",
            "clothing": "Pink jacket, blue jeans, white sneakers, purple backpack",
            "distinguishing_features": "Small heart-shaped birthmark on left cheek, dimples when smiling",
            "status": CaseStatus.ACTIVE, "is_urgent": True, "created_by": "usr-001",
        },
        {
            "id": "TA-1002", "name": "Robert Kim", "age": 45, "gender": "male",
            "last_seen_location": "Union Station, Washington DC",
            "last_seen_date": datetime.utcnow() - timedelta(days=11),
            "latitude": 38.8977, "longitude": -77.0065,
            "description": "Last seen at Union Station main concourse. May be disoriented. Has early-stage dementia.",
            "clothing": "Navy blue suit jacket, gray trousers, brown leather shoes",
            "distinguishing_features": "Graying hair, glasses with black frames, walks with a slight limp",
            "status": CaseStatus.ACTIVE, "is_urgent": True, "created_by": "usr-001",
        },
        {
            "id": "TA-1003", "name": "Maria Garcia", "age": 16, "gender": "female",
            "last_seen_location": "Lincoln High School, Los Angeles, CA",
            "last_seen_date": datetime.utcnow() - timedelta(days=4),
            "latitude": 34.0522, "longitude": -118.2437,
            "description": "Did not return home after school. Last seen leaving through the south parking lot.",
            "clothing": "School uniform: white blouse, navy skirt, black loafers",
            "distinguishing_features": "Long curly brown hair, silver hoop earrings, freckles across nose",
            "status": CaseStatus.UNDER_REVIEW, "is_urgent": False, "created_by": "usr-001",
        },
    ]

    cases = {}
    for c in cases_data:
        case = MissingPersonCase(**c)
        db.add(case)
        cases[case.id] = case

        # Timeline event: created
        db.add(TimelineEvent(
            case_id=case.id, event_type=TimelineEventType.CREATED,
            title="Case Created",
            description=f"Missing person report filed for {case.name}",
            created_by=c["created_by"],
            timestamp=case.created_at,
        ))

    db.commit()
    print(f"Created {len(cases_data)} cases")

    # --- Sightings ---
    sightings_data = [
        {
            "id": "sgt-001", "case_id": "TA-1001",
            "location_name": "5th Avenue & 42nd Street, New York, NY",
            "latitude": 40.7527, "longitude": -73.9772,
            "description": "I saw a young girl who looked like the missing person poster near the public library steps.",
            "witness_name": "Anonymous", "is_anonymous": True,
            "status": SightingStatus.PENDING, "reported_by": "usr-004",
            "reported_at": datetime.utcnow() - timedelta(days=7, hours=2),
        },
        {
            "id": "sgt-002", "case_id": "TA-1001",
            "location_name": "Times Square Subway Station",
            "latitude": 40.758, "longitude": -73.9855,
            "description": "CCTV camera at turnstile 7 captured a person matching Emily's description entering the station.",
            "witness_name": "CCTV System", "is_anonymous": True,
            "status": SightingStatus.VERIFIED, "reported_by": "usr-002",
            "reported_at": datetime.utcnow() - timedelta(days=7),
        },
        {
            "id": "sgt-003", "case_id": "TA-1002",
            "location_name": "Union Station, Washington DC",
            "latitude": 38.8977, "longitude": -77.0065,
            "description": "Station security observed a man matching Robert's description near platform 3.",
            "witness_name": "Station Security", "is_anonymous": False,
            "status": SightingStatus.VERIFIED, "reported_by": "usr-002",
            "reported_at": datetime.utcnow() - timedelta(days=10),
        },
    ]

    for s in sightings_data:
        sighting = Sighting(**s)
        db.add(sighting)

        # Timeline: sighting reported
        db.add(TimelineEvent(
            case_id=s["case_id"], event_type=TimelineEventType.SIGHTING,
            title="Sighting Reported",
            description=f"New sighting at {s['location_name']}",
            created_by="system",
            timestamp=s["reported_at"],
        ))

    db.commit()
    print(f"Created {len(sightings_data)} sightings")

    # --- AI Matches ---
    matches_data = [
        {
            "id": "mch-001", "case_id": "TA-1001", "sighting_id": "sgt-002",
            "confidence_score": 0.78, "status": MatchStatus.PENDING,
        },
        {
            "id": "mch-002", "case_id": "TA-1003", "sighting_id": None,
            "confidence_score": 0.92, "status": MatchStatus.APPROVED,
        },
    ]

    for m in matches_data:
        match = AIMatch(**m)
        db.add(match)

        # Add matched attributes
        attr_pool = ["Facial structure", "Hair color", "Clothing color", "Age range", "Height"]
        for attr in attr_pool:
            db.add(MatchAttribute(
                match_id=match.id, attribute_name=attr,
                confidence=round(random.uniform(0.65, 0.95), 2),
            ))

    db.commit()
    print(f"Created {len(matches_data)} AI matches")

    # --- Notifications ---
    notifications_data = [
        {
            "user_id": "usr-001", "title": "New Sighting",
            "message": "A new sighting has been reported for Emily Chen near Times Square.",
            "notification_type": NotificationType.ALERT, "is_read": False,
            "link": "/cases/TA-1001",
        },
        {
            "user_id": "usr-001", "title": "AI Match Found",
            "message": "AI matching engine found a potential match with 78% confidence.",
            "notification_type": NotificationType.INFO, "is_read": False,
            "link": "/matches/mch-001",
        },
        {
            "user_id": "usr-001", "title": "Case Update",
            "message": "Robert Kim's case has been updated with new evidence.",
            "notification_type": NotificationType.SUCCESS, "is_read": True,
        },
        {
            "user_id": "usr-002", "title": "New Match Ready for Review",
            "message": "AI match for Emily Chen (78% confidence) is pending your review.",
            "notification_type": NotificationType.ALERT, "is_read": False,
            "link": "/matches/mch-001",
        },
    ]

    for n in notifications_data:
        notif = Notification(**n)
        db.add(notif)

    db.commit()
    print(f"Created {len(notifications_data)} notifications")

    # --- Audit Logs ---
    audit_data = [
        {"user_id": "usr-002", "user_name": "Det. Michael Rivera", "action": "CASE_VERIFIED", "resource": "TA-1001", "details": "Verified sighting evidence for case Emily Chen", "ip_address": "192.168.1.45"},
        {"user_id": "usr-003", "user_name": "Priya Sharma", "action": "USER_ROLE_CHANGED", "resource": "usr-005", "details": "Changed user role from citizen to authority", "ip_address": "192.168.1.100"},
        {"user_id": "usr-001", "user_name": "Sarah Johnson", "action": "CASE_CREATED", "resource": "TA-1004", "details": "Created missing person case for David Patel", "ip_address": "192.168.1.20"},
        {"user_id": "usr-002", "user_name": "Det. Michael Rivera", "action": "MATCH_APPROVED", "resource": "mch-002", "details": "Approved AI match with 92% confidence", "ip_address": "192.168.1.45"},
        {"user_id": "usr-003", "user_name": "Priya Sharma", "action": "SYSTEM_CONFIG_CHANGED", "resource": "system", "details": "Updated AI matching threshold from 65% to 70%", "ip_address": "192.168.1.100"},
    ]

    for a in audit_data:
        db.add(AuditLog(**a))

    db.commit()
    print(f"Created {len(audit_data)} audit logs")

    db.close()
    print("\nSeed complete! Demo credentials:")
    print("  family@traceai.io / demo123")
    print("  citizen@traceai.io / demo123")
    print("  authority@traceai.io / demo123")
    print("  admin@traceai.io / demo123")


if __name__ == "__main__":
    seed()
