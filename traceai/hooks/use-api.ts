"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, camelize } from "@/lib/api-client";
import type {
  MissingPersonCase,
  Sighting,
  AIMatch,
  Notification,
  User,
  CaseTimelineEvent,
  MovementPrediction,
  HeatZone,
  TransportHub,
  CaseStats,
  MatchAttributeDetail,
} from "@/types";

// ── Query key factory ──

export const queryKeys = {
  auth: { me: ["auth", "me"] as const },
  cases: {
    all: ["cases"] as const,
    detail: (id: string) => ["cases", id] as const,
    timeline: (id: string) => ["cases", id, "timeline"] as const,
  },
  sightings: {
    all: ["sightings"] as const,
    byCase: (caseId: string) => ["sightings", caseId] as const,
  },
  matches: {
    all: ["matches"] as const,
    detail: (id: string) => ["matches", id] as const,
    ranked: (caseId?: string) => ["matches", "ranked", caseId] as const,
  },
  notifications: {
    all: ["notifications"] as const,
  },
  analytics: {
    overview: ["analytics", "overview"] as const,
    trends: (days: number) => ["analytics", "trends", days] as const,
    heatmap: ["analytics", "heatmap"] as const,
    regional: ["analytics", "regional"] as const,
  },
  predictive: {
    movement: (caseId: string) => ["predictive", "movement", caseId] as const,
    hubs: (caseId: string) => ["predictive", "hubs", caseId] as const,
    heatZones: ["predictive", "heatZones"] as const,
    timeline: (caseId: string) => ["predictive", "timeline", caseId] as const,
  },
  admin: {
    users: ["admin", "users"] as const,
    audit: ["admin", "audit"] as const,
    health: ["admin", "health"] as const,
  },
};

// ── Auth ──

export function useCurrentUser() {
  return useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: () => api.get<User>("/api/auth/me"),
    enabled: !!localStorage.getItem("traceai_token"),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}

// ── Cases ──

export function useCases(filters?: { status?: string; search?: string }) {
  const params = new URLSearchParams();
  if (filters?.status) params.set("status", filters.status);
  if (filters?.search) params.set("search", filters.search);

  return useQuery({
    queryKey: [...queryKeys.cases.all, filters],
    queryFn: () => api.get<MissingPersonCase[]>(`/api/cases?${params}`),
  });
}

export function useCase(id: string) {
  return useQuery({
    queryKey: queryKeys.cases.detail(id),
    queryFn: () => api.get<MissingPersonCase>(`/api/cases/${id}`),
    enabled: !!id,
  });
}

export function useCreateCase() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<MissingPersonCase>) =>
      api.post<MissingPersonCase>("/api/cases", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cases.all });
    },
  });
}

export function useUpdateCase() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Record<string, unknown>) =>
      api.put<MissingPersonCase>(`/api/cases/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cases.all });
    },
  });
}

export function useUpdateCaseStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, resolvedBy }: { id: string; status: string; resolvedBy?: string }) =>
      api.patch<MissingPersonCase>(`/api/cases/${id}/status`, {
        status,
        resolved_by: resolvedBy,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cases.all });
    },
  });
}

export function useCaseTimeline(caseId: string) {
  return useQuery({
    queryKey: queryKeys.cases.timeline(caseId),
    queryFn: () => api.get<CaseTimelineEvent[]>(`/api/cases/${caseId}/timeline`),
    enabled: !!caseId,
  });
}

export function useDeleteCase() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.del(`/api/cases/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cases.all });
    },
  });
}

// ── Sightings ──

export function useSightings(caseId?: string) {
  const params = new URLSearchParams();
  if (caseId) params.set("case_id", caseId);

  return useQuery({
    queryKey: caseId ? queryKeys.sightings.byCase(caseId) : queryKeys.sightings.all,
    queryFn: () => {
      // The API returns sighting data; map location_name → location for frontend
      return api.getRaw<Sighting[]>(`/api/sightings?${params}`).then((data) =>
  data.map((s: any) => {
    const c: any = camelize(s);

    return {
      ...c,
      location: s.location_name || s.locationName,
      witnessName: s.witness_name,
      witnessContact: s.witness_contact,
    };
  })
);
    },
  });
}

export function useCreateSighting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      api.post<Sighting>("/api/sightings", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sightings.all });
    },
  });
}

export function useVerifySighting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sightingId: string) =>
      api.patch<Sighting>(`/api/sightings/${sightingId}/verify`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sightings.all });
    },
  });
}

export function useDismissSighting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sightingId: string) =>
      api.patch<Sighting>(`/api/sightings/${sightingId}/dismiss`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sightings.all });
    },
  });
}

// ── AI Matches ──

export function useMatches(caseId?: string) {
  const params = new URLSearchParams();
  if (caseId) params.set("case_id", caseId);
  params.set("limit", "50");

  return useQuery({
    queryKey: caseId ? [...queryKeys.matches.all, caseId] : queryKeys.matches.all,
    queryFn: () => api.get<AIMatch[]>(`/api/matches?${params}`),
  });
}

export function useMatch(id: string) {
  return useQuery({
    queryKey: queryKeys.matches.detail(id),
    queryFn: () => api.get<AIMatch>(`/api/matches/${id}`),
    enabled: !!id,
  });
}

export function useApproveMatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (matchId: string) =>
      api.patch<AIMatch>(`/api/matches/${matchId}/approve`, { reviewer_id: "current" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.matches.all });
    },
  });
}

export function useRejectMatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (matchId: string) =>
      api.patch<AIMatch>(`/api/matches/${matchId}/reject`, { reviewer_id: "current" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.matches.all });
    },
  });
}

export function useTriggerAnalysis() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ caseId, sightingId }: { caseId: string; sightingId: string }) =>
      api.post("/api/matches/analyze", {
        case_id: caseId,
        sighting_id: sightingId,
      }),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.matches.all });
    },
  });
}

// ── Notifications ──

interface NotificationsResponse {
  notifications: Notification[];
  total: number;
  unreadCount: number;
}

export function useNotifications(unreadOnly = false) {
  const params = new URLSearchParams();
  if (unreadOnly) params.set("unread_only", "true");

  return useQuery({
    queryKey: [...queryKeys.notifications.all, { unreadOnly }],
    queryFn: () => {
      // Map backend notification_type → type and is_read → read
      return api.getRaw<Record<string, unknown>>(`/api/notifications?${params}`).then((data) => {
        const raw = data as Record<string, unknown>;
        const notifications = ((raw.notifications || []) as Record<string, unknown>[]).map((n) => {
  const c: any = camelize(n);

  return {
    ...c,
    type: n.notification_type,
    read: n.is_read,
  };
});
        return {
          notifications: notifications as Notification[],
          total: (raw.total as number) || notifications.length,
          unreadCount: (raw.unread_count as number) || 0,
        };
      });
    },
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (notificationId: string) =>
      api.patch(`/api/notifications/${notificationId}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.patch("/api/notifications/read-all"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });
}

// ── Analytics ──

export function useAnalyticsOverview() {
  return useQuery({
    queryKey: queryKeys.analytics.overview,
    queryFn: () => {
      // Map backend avg_resolution_hours → avgResolutionDays (convert hours → days)
      return api.getRaw<Record<string, unknown>>("/api/analytics/overview").then((data) => {
        const d = data as Record<string, unknown>;
        return {
          total: d.total_cases || 0,
          active: d.active_cases || 0,
          resolved: d.resolved_cases || 0,
          sightings: d.total_sightings || 0,
          matchesFound: d.approved_matches || 0,
          avgResolutionDays: d.avg_resolution_hours
            ? Math.round(((d.avg_resolution_hours as number) / 24) * 10) / 10
            : 0,
        } as CaseStats;
      });
    },
  });
}

export function useAnalyticsTrends(days = 7) {
  return useQuery({
    queryKey: queryKeys.analytics.trends(days),
    queryFn: () => api.get(`/api/analytics/trends?days=${days}`),
  });
}

export function useAnalyticsHeatmap() {
  return useQuery({
    queryKey: queryKeys.analytics.heatmap,
    queryFn: () => api.get<HeatZone[]>("/api/analytics/heatmap"),
  });
}

// ── Predictive Intelligence ──

export function useMovementPrediction(caseId: string) {
  return useQuery({
    queryKey: queryKeys.predictive.movement(caseId),
    queryFn: () => api.getRaw<MovementPrediction>(`/api/predictive/movement/${caseId}`),
    enabled: !!caseId,
  });
}

export function useTransportHubs(caseId: string) {
  return useQuery({
    queryKey: queryKeys.predictive.hubs(caseId),
    queryFn: () =>
      api.getRaw<{ case_id: string; hubs: TransportHub[] }>(
        `/api/predictive/hubs/${caseId}`
      ),
    enabled: !!caseId,
  });
}

export function useHeatZones() {
  return useQuery({
    queryKey: queryKeys.predictive.heatZones,
    queryFn: () =>
      api
        .getRaw<{ zones: HeatZone[] }>("/api/predictive/heatmap")
        .then((res) => res.zones),
  });
}

export function usePredictiveTimeline(caseId: string) {
  return useQuery({
    queryKey: queryKeys.predictive.timeline(caseId),
    queryFn: () => api.get(`/api/predictive/timeline/${caseId}`),
    enabled: !!caseId,
  });
}

export function useBatchAnalyze() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (caseId: string) =>
      api.post(`/api/predictive/batch-analyze/${caseId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.matches.all });
    },
  });
}

// ── Admin ──

export function useAdminUsers() {
  return useQuery({
    queryKey: queryKeys.admin.users,
    queryFn: () => api.get<User[]>("/api/admin/users"),
  });
}

export function useAdminAudit() {
  return useQuery({
    queryKey: queryKeys.admin.audit,
    queryFn: () => api.get("/api/admin/audit"),
  });
}

export function useSystemHealth() {
  return useQuery({
    queryKey: queryKeys.admin.health,
    queryFn: () => api.get("/api/admin/health"),
  });
}