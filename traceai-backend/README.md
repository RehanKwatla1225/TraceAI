# TraceAI Backend

FastAPI-based backend for the TraceAI missing person recovery platform.

## Quick Start

```bash
cd traceai-backend

# Install dependencies
pip install -r requirements.txt

# Copy and edit config
cp .env.example .env

# Initialize the database
python -m app.seed

# Start the server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## API Documentation

Once running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `SECRET_KEY` | JWT signing secret |
| `AI_MATCH_THRESHOLD` | Minimum AI confidence score (0-1) |
| `UPLOAD_DIR` | Media upload directory |

## Architecture

```
Client Layer
    |
API Gateway (FastAPI + JWT Auth)
    |
Backend Services
    |-- Auth Service (JWT, OTP, RBAC)
    |-- Case Management (CRUD, Timeline, Search)
    |-- Sighting Service (Reports, Evidence, Location)
    |-- AI Matching (Face, Attributes, Scoring)
    |-- Analytics (Stats, Heatmaps, Predictions)
    |-- Notifications (In-App, Email, SMS)
    |-- Admin (Users, Roles, Audit, Monitoring)
    |
Database Layer (PostgreSQL / SQLite)
    |-- Users, Cases, Sightings, Matches
    |-- Notifications, AuditLogs, Media
```

## Default Demo Users

| Role | Email | Password |
|---|---|---|
| Family | family@traceai.io | demo123 |
| Citizen | citizen@traceai.io | demo123 |
| Authority | authority@traceai.io | demo123 |
| Admin | admin@traceai.io | demo123 |

## API Endpoints

### Authentication
- `POST /api/auth/login` - Sign in
- `POST /api/auth/register` - Create account
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/otp/send` - Send OTP
- `POST /api/auth/otp/verify` - Verify OTP

### Cases
- `POST /api/cases` - Create case
- `GET /api/cases` - List cases (role-filtered)
- `GET /api/cases/{id}` - Case detail
- `PUT /api/cases/{id}` - Update case
- `PATCH /api/cases/{id}/status` - Update status
- `GET /api/cases/{id}/timeline` - Case timeline

### Sightings
- `POST /api/sightings` - Report sighting
- `GET /api/sightings` - List sightings
- `GET /api/sightings/{id}` - Sighting detail
- `PATCH /api/sightings/{id}/verify` - Verify sighting

### AI Matches
- `POST /api/matches/analyze` - Run AI analysis
- `GET /api/matches` - List matches
- `GET /api/matches/{id}` - Match detail
- `PATCH /api/matches/{id}/approve` - Approve match
- `PATCH /api/matches/{id}/reject` - Reject match

### Analytics
- `GET /api/analytics/overview` - Dashboard stats
- `GET /api/analytics/trends` - Case trends
- `GET /api/analytics/heatmap` - Location heatmap
- `GET /api/analytics/regional` - By region

### Notifications
- `GET /api/notifications` - List notifications
- `PATCH /api/notifications/{id}/read` - Mark read

### Admin
- `GET /api/admin/users` - List users
- `PATCH /api/admin/users/{id}/role` - Change role
- `GET /api/admin/audit` - Audit logs
- `GET /api/admin/health` - System health
