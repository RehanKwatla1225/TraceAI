export type UserRole = "family" | "citizen" | "authority" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  createdAt: string;
}

export interface MissingPersonCase {
  id: string;
  name: string;
  age: number;
  gender: "male" | "female" | "other";
  lastSeenLocation: string;
  lastSeenDate: string;
  latitude: number;
  longitude: number;
  description: string;
  photos: string[];
  clothing?: string;
  distinguishingFeatures?: string;
  status: "active" | "under-review" | "resolved" | "closed";
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CaseTimelineEvent {
  id: string;
  caseId: string;
  type: "created" | "sighting" | "match" | "status-change" | "evidence" | "note";
  title: string;
  description: string;
  timestamp: string;
  createdBy: string;
}

export interface Sighting {
  id: string;
  caseId: string;
  location: string;
  latitude: number;
  longitude: number;
  description: string;
  photos: string[];
  videos: string[];
  witnessName?: string;
  witnessContact?: string;
  timestamp: string;
  status: "pending" | "verified" | "dismissed";
  createdAt: string;
}

export interface AIMatch {
  id: string;
  caseId: string;
  sightingId: string;
  confidenceScore: number;
  matchedAttributes: string[];
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export interface CaseStats {
  total: number;
  active: number;
  resolved: number;
  sightings: number;
  matchesFound: number;
  avgResolutionDays: number;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "info" | "alert" | "success" | "warning";
  read: boolean;
  createdAt: string;
}

export interface MatchAttributeDetail {
  name: string;
  confidence: number;
  category: "biometric" | "clothing" | "demographic" | "distinctive" | "behavioral";
}

export interface FaceMatchResult {
  facial_score: number;
  age_estimation: number;
  age_confidence: number;
}

export interface ClothingRecognition {
  clothing_match: number;
  detected_items: string[];
}

export interface TimeBucketZone {
  zone: string;
  probability: number;
  distance_km: number;
}

export interface TimeBucket {
  timeframe: string;
  hours: number;
  zones: TimeBucketZone[];
  total_movement_radius: number;
}

export interface TransportHub {
  name: string;
  city: string;
  lat: number;
  lon: number;
  type: string;
  daily_traffic: number;
  distance_km: number;
  catchment_probability: number;
  adjusted_probability?: number;
}

export interface RouteStep {
  step: number;
  type: "last_seen" | "transport_hub" | "predicted_zone";
  location: string;
  lat: number;
  lon: number;
  description: string;
  timeframe: string;
  probability?: number;
}

export interface MovementPrediction {
  case_id: string;
  name: string;
  age: number;
  age_category: string;
  hours_since_last_seen: number;
  decay_factor: number;
  current_best_guess: TimeBucketZone;
  time_buckets: TimeBucket[];
  nearby_transport_hubs: TransportHub[];
  predicted_route: RouteStep[];
  model_version: string;
}

export interface HeatZone {
  case_id: string;
  name: string;
  lat: number;
  lon: number;
  intensity: number;
  sightings: number;
  approved_matches: number;
  status: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  details: string;
  ipAddress: string;
  timestamp: string;
}
