import type {
  MissingPersonCase,
  CaseTimelineEvent,
  Sighting,
  AIMatch,
  User,
  Notification,
  AuditLog,
  MatchAttributeDetail,
  MovementPrediction,
  TransportHub,
  HeatZone,
} from "@/types";

export const mockUser: User = {
  id: "usr-001",
  name: "Sarah Johnson",
  email: "sarah.johnson@example.com",
  role: "family",
  phone: "+1 (555) 123-4567",
  createdAt: "2025-03-15T10:30:00Z",
};

export const mockAuthorityUser: User = {
  id: "usr-002",
  name: "Det. Michael Rivera",
  email: "m.rivera@pd.gov",
  role: "authority",
  phone: "+1 (555) 987-6543",
  createdAt: "2025-01-10T08:00:00Z",
};

export const mockAdminUser: User = {
  id: "usr-003",
  name: "Priya Sharma",
  email: "priya.sharma@traceai.io",
  role: "admin",
  createdAt: "2024-11-01T09:00:00Z",
};

export const mockCitizenUser: User = {
  id: "usr-004",
  name: "James Wilson",
  email: "james.wilson@example.com",
  role: "citizen",
  createdAt: "2025-06-01T14:00:00Z",
};

export const mockCases: MissingPersonCase[] = [
  {
    id: "TA-1001",
    name: "Emily Chen",
    age: 8,
    gender: "female",
    lastSeenLocation: "Central Park, New York, NY",
    lastSeenDate: "2025-05-28T14:30:00Z",
    latitude: 40.7829,
    longitude: -73.9654,
    description:
      "Last seen near the Central Park Zoo playground. Was wearing a pink jacket and blue jeans. Has a small birthmark on her left cheek.",
    photos: [],
    clothing: "Pink jacket, blue jeans, white sneakers, purple backpack",
    distinguishingFeatures:
      "Small heart-shaped birthmark on left cheek, dimples when smiling",
    status: "active",
    createdBy: "usr-001",
    createdAt: "2025-05-28T16:00:00Z",
    updatedAt: "2025-06-04T10:00:00Z",
  },
  {
    id: "TA-1002",
    name: "Robert Kim",
    age: 45,
    gender: "male",
    lastSeenLocation: "Union Station, Washington DC",
    lastSeenDate: "2025-05-25T08:15:00Z",
    latitude: 38.8977,
    longitude: -77.0065,
    description:
      "Last seen at Union Station main concourse. May be disoriented. Has early-stage dementia.",
    photos: [],
    clothing: "Navy blue suit jacket, gray trousers, brown leather shoes",
    distinguishingFeatures:
      "Graying hair, glasses with thick black frames, walks with a slight limp on right leg",
    status: "active",
    createdBy: "usr-001",
    createdAt: "2025-05-25T10:30:00Z",
    updatedAt: "2025-06-03T14:00:00Z",
  },
  {
    id: "TA-1003",
    name: "Maria Garcia",
    age: 16,
    gender: "female",
    lastSeenLocation: "Lincoln High School, Los Angeles, CA",
    lastSeenDate: "2025-06-01T15:45:00Z",
    latitude: 34.0522,
    longitude: -118.2437,
    description:
      "Did not return home after school. Last seen leaving through the south parking lot.",
    photos: [],
    clothing: "School uniform: white blouse, navy skirt, black loafers",
    distinguishingFeatures:
      "Long curly brown hair, silver hoop earrings, freckles across nose",
    status: "under-review",
    createdBy: "usr-001",
    createdAt: "2025-06-01T18:00:00Z",
    updatedAt: "2025-06-04T09:00:00Z",
  },
  {
    id: "TA-1004",
    name: "David Patel",
    age: 32,
    gender: "male",
    lastSeenLocation: "Market Street, San Francisco, CA",
    lastSeenDate: "2025-05-20T22:00:00Z",
    latitude: 37.7749,
    longitude: -122.4194,
    description:
      "Last seen near the BART station at Market and Powell. Was headed home from work.",
    photos: [],
    clothing: "Light blue button-down shirt, khaki pants, dark sneakers",
    distinguishingFeatures:
      "Beard, tattoo of a compass on right forearm, glasses",
    status: "resolved",
    createdBy: "usr-001",
    createdAt: "2025-05-21T08:00:00Z",
    updatedAt: "2025-06-02T16:00:00Z",
  },
];

export const mockTimeline: Record<string, CaseTimelineEvent[]> = {
  "TA-1001": [
    {
      id: "evt-001",
      caseId: "TA-1001",
      type: "created",
      title: "Case Created",
      description: "Missing person report filed for Emily Chen",
      timestamp: "2025-05-28T16:00:00Z",
      createdBy: "usr-001",
    },
    {
      id: "evt-002",
      caseId: "TA-1001",
      type: "sighting",
      title: "Possible Sighting Reported",
      description:
        "Witness reported seeing a girl matching Emily's description near 5th Avenue at 4:30 PM.",
      timestamp: "2025-05-28T17:30:00Z",
      createdBy: "usr-004",
    },
    {
      id: "evt-003",
      caseId: "TA-1001",
      type: "match",
      title: "AI Match Found (78% confidence)",
      description:
        "CCTV footage from Central Park West entrance matched Emily's appearance with 78% confidence.",
      timestamp: "2025-05-29T09:15:00Z",
      createdBy: "ai-system",
    },
    {
      id: "evt-004",
      caseId: "TA-1001",
      type: "evidence",
      title: "New Photo Evidence Added",
      description:
        "Surveillance image from subway station uploaded to case file.",
      timestamp: "2025-05-30T11:00:00Z",
      createdBy: "usr-002",
    },
    {
      id: "evt-005",
      caseId: "TA-1001",
      type: "status-change",
      title: "Case Escalated to Local Police",
      description:
        "Case forwarded to NYPD Missing Persons Unit for priority handling.",
      timestamp: "2025-05-31T08:00:00Z",
      createdBy: "usr-002",
    },
  ],
  "TA-1002": [
    {
      id: "evt-006",
      caseId: "TA-1002",
      type: "created",
      title: "Case Created",
      description: "Missing person report filed for Robert Kim",
      timestamp: "2025-05-25T10:30:00Z",
      createdBy: "usr-001",
    },
    {
      id: "evt-007",
      caseId: "TA-1002",
      type: "match",
      title: "Transport Hub Detection",
      description:
        "AI detected Robert at Union Station ticketing area at 9:15 AM.",
      timestamp: "2025-05-25T12:00:00Z",
      createdBy: "ai-system",
    },
  ],
};

export const mockSightings: Sighting[] = [
  {
    id: "sgt-001",
    caseId: "TA-1001",
    location: "5th Avenue & 42nd Street, New York, NY",
    latitude: 40.7527,
    longitude: -73.9772,
    description:
      "I saw a young girl who looked like the missing person poster near the public library steps at around 4:30 PM. She was with an older woman.",
    photos: [],
    videos: [],
    witnessName: "Anonymous",
    timestamp: "2025-05-28T16:30:00Z",
    status: "pending",
    createdAt: "2025-05-28T17:30:00Z",
  },
  {
    id: "sgt-002",
    caseId: "TA-1001",
    location: "Times Square Subway Station",
    latitude: 40.758,
    longitude: -73.9855,
    description:
      "CCTV camera at turnstile 7 captured a person matching Emily's description entering the station.",
    photos: [],
    videos: [],
    timestamp: "2025-05-29T08:00:00Z",
    status: "verified",
    createdAt: "2025-05-29T09:00:00Z",
  },
  {
    id: "sgt-003",
    caseId: "TA-1002",
    location: "Union Station, Washington DC",
    latitude: 38.8977,
    longitude: -77.0065,
    description:
      "Station security observed a man matching Robert's description near platform 3.",
    photos: [],
    videos: [],
    timestamp: "2025-05-25T09:15:00Z",
    status: "verified",
    createdAt: "2025-05-25T10:00:00Z",
  },
];

export const mockMatches: AIMatch[] = [
  {
    id: "mch-001",
    caseId: "TA-1001",
    sightingId: "sgt-002",
    confidenceScore: 78,
    matchedAttributes: ["Facial structure", "Clothing color", "Age range", "Height"],
    status: "pending",
    createdAt: "2025-05-29T09:15:00Z",
  },
  {
    id: "mch-002",
    caseId: "TA-1003",
    sightingId: "sgt-003",
    confidenceScore: 92,
    matchedAttributes: ["Facial features", "Hair style", "School uniform", "Height"],
    status: "approved",
    createdAt: "2025-06-02T11:30:00Z",
  },
];

export const mockNotifications: Notification[] = [
  {
    id: "not-001",
    userId: "usr-001",
    title: "New Sighting",
    message: "A new sighting has been reported for Emily Chen near Times Square.",
    type: "alert",
    read: false,
    createdAt: "2025-06-04T14:30:00Z",
  },
  {
    id: "not-002",
    userId: "usr-001",
    title: "AI Match Found",
    message: "AI matching engine found a potential match for your case TA-1001 with 78% confidence.",
    type: "info",
    read: false,
    createdAt: "2025-06-04T12:00:00Z",
  },
  {
    id: "not-003",
    userId: "usr-001",
    title: "Case Update",
    message: "Robert Kim's case has been updated with new evidence.",
    type: "success",
    read: true,
    createdAt: "2025-06-03T16:00:00Z",
  },
];

export const mockMatchDetails: Record<string, MatchAttributeDetail[]> = {
  "mch-001": [
    { name: "Facial structure", confidence: 0.82, category: "biometric" },
    { name: "Eye shape", confidence: 0.76, category: "biometric" },
    { name: "Nose bridge", confidence: 0.71, category: "biometric" },
    { name: "Clothing color", confidence: 0.88, category: "clothing" },
    { name: "Clothing type", confidence: 0.79, category: "clothing" },
    { name: "Age range", confidence: 0.91, category: "demographic" },
    { name: "Height estimate", confidence: 0.74, category: "demographic" },
    { name: "Hair style", confidence: 0.85, category: "distinctive" },
  ],
  "mch-002": [
    { name: "Facial structure", confidence: 0.96, category: "biometric" },
    { name: "Eye shape", confidence: 0.93, category: "biometric" },
    { name: "Jawline", confidence: 0.89, category: "biometric" },
    { name: "Clothing color", confidence: 0.94, category: "clothing" },
    { name: "Clothing type", confidence: 0.91, category: "clothing" },
    { name: "Age range", confidence: 0.95, category: "demographic" },
    { name: "Footwear", confidence: 0.82, category: "clothing" },
    { name: "Hair style", confidence: 0.97, category: "distinctive" },
    { name: "Distinguishing marks", confidence: 0.88, category: "distinctive" },
  ],
};

export const mockMovementPrediction: MovementPrediction = {
  case_id: "TA-1001",
  name: "Emily Chen",
  age: 8,
  age_category: "child",
  hours_since_last_seen: 12.5,
  decay_factor: 0.89,
  current_best_guess: {
    zone: "Nearby parks & playgrounds",
    probability: 0.68,
    distance_km: 1.2,
  },
  time_buckets: [
    {
      timeframe: "Next 3 hours",
      hours: 3,
      zones: [
        { zone: "Central Park playgrounds", probability: 0.68, distance_km: 1.2 },
        { zone: "Local elementary schools", probability: 0.52, distance_km: 2.1 },
        { zone: "Neighbor friend homes", probability: 0.38, distance_km: 0.8 },
      ],
      total_movement_radius: 3.5,
    },
    {
      timeframe: "3-12 hours",
      hours: 12,
      zones: [
        { zone: "Public transit stations", probability: 0.55, distance_km: 5.0 },
        { zone: "Shopping centers", probability: 0.48, distance_km: 4.2 },
        { zone: "Community centers", probability: 0.35, distance_km: 3.8 },
      ],
      total_movement_radius: 8.5,
    },
    {
      timeframe: "12-48 hours",
      hours: 48,
      zones: [
        { zone: "Downtown commercial area", probability: 0.42, distance_km: 12.0 },
        { zone: "Transport hubs (rail/bus)", probability: 0.38, distance_km: 15.0 },
        { zone: "Suburban residential area", probability: 0.28, distance_km: 10.5 },
      ],
      total_movement_radius: 18.0,
    },
  ],
  nearby_transport_hubs: [
    { name: "Grand Central Terminal", city: "New York", lat: 40.7527, lon: -73.9772, type: "rail", daily_traffic: 750000, distance_km: 2.4, catchment_probability: 0.72 },
    { name: "Penn Station", city: "New York", lat: 40.7505, lon: -73.9934, type: "rail", daily_traffic: 600000, distance_km: 3.1, catchment_probability: 0.65 },
    { name: "Port Authority Bus Terminal", city: "New York", lat: 40.757, lon: -73.9911, type: "bus", daily_traffic: 200000, distance_km: 3.5, catchment_probability: 0.55 },
  ],
  predicted_route: [
    { step: 0, type: "last_seen", location: "Central Park, New York, NY", lat: 40.7829, lon: -73.9654, description: "Last seen at Central Park Zoo playground", timeframe: "Start" },
    { step: 1, type: "transport_hub", location: "Grand Central Terminal", lat: 40.7527, lon: -73.9772, description: "Transport hub (rail), 750k daily passengers", timeframe: "+2-4 hours", probability: 0.72 },
    { step: 2, type: "predicted_zone", location: "Central Park playgrounds", lat: 40.78, lon: -73.97, description: "Predicted location with 68% probability", timeframe: "Next 3 hours", probability: 0.68 },
  ],
  model_version: "movement-pattern-v2",
};

export const mockHeatZones: HeatZone[] = [
  { case_id: "TA-1001", name: "Emily Chen", lat: 40.7829, lon: -73.9654, intensity: 88, sightings: 5, approved_matches: 2, status: "active" },
  { case_id: "TA-1002", name: "Robert Kim", lat: 38.8977, lon: -77.0065, intensity: 72, sightings: 3, approved_matches: 1, status: "active" },
  { case_id: "TA-1003", name: "Maria Garcia", lat: 34.0522, lon: -118.2437, intensity: 55, sightings: 2, approved_matches: 0, status: "under-review" },
  { case_id: "TA-1004", name: "David Patel", lat: 37.7749, lon: -122.4194, intensity: 30, sightings: 1, approved_matches: 0, status: "resolved" },
];

export const mockAuditLogs: AuditLog[] = [
  {
    id: "aud-001",
    userId: "usr-002",
    userName: "Det. Michael Rivera",
    action: "CASE_VERIFIED",
    resource: "TA-1001",
    details: "Verified sighting evidence for case Emily Chen",
    ipAddress: "192.168.1.45",
    timestamp: "2025-06-04T10:30:00Z",
  },
  {
    id: "aud-002",
    userId: "usr-003",
    userName: "Priya Sharma",
    action: "USER_ROLE_CHANGED",
    resource: "usr-005",
    details: "Changed user role from citizen to authority",
    ipAddress: "192.168.1.100",
    timestamp: "2025-06-04T09:15:00Z",
  },
  {
    id: "aud-003",
    userId: "usr-001",
    userName: "Sarah Johnson",
    action: "CASE_CREATED",
    resource: "TA-1004",
    details: "Created missing person case for David Patel",
    ipAddress: "192.168.1.20",
    timestamp: "2025-06-03T14:00:00Z",
  },
  {
    id: "aud-004",
    userId: "usr-002",
    userName: "Det. Michael Rivera",
    action: "MATCH_APPROVED",
    resource: "mch-002",
    details: "Approved AI match with 92% confidence",
    ipAddress: "192.168.1.45",
    timestamp: "2025-06-02T11:35:00Z",
  },
  {
    id: "aud-005",
    userId: "usr-003",
    userName: "Priya Sharma",
    action: "SYSTEM_CONFIG_CHANGED",
    resource: "system",
    details: "Updated AI matching threshold from 65% to 70%",
    ipAddress: "192.168.1.100",
    timestamp: "2025-06-01T08:00:00Z",
  },
];
