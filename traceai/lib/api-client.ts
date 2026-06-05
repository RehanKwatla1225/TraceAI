"use client";

// Centralized API client with JWT auth, snake_case ↔ camelCase conversion

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function toCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}

function toSnake(str: string): string {
  return str.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
}

export function camelize<T>(obj: unknown): T {
  if (obj === null || obj === undefined) return obj as T;
  if (Array.isArray(obj)) return obj.map((v) => camelize(v)) as T;
  if (typeof obj === "object" && !(obj instanceof Date)) {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      result[toCamel(key)] = camelize(value);
    }
    return result as T;
  }
  return obj as T;
}

export function snakeize(obj: unknown): unknown {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map(snakeize);
  if (typeof obj === "object" && !(obj instanceof Date)) {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      result[toSnake(key)] = snakeize(value);
    }
    return result;
  }
  return obj;
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("traceai_token");
}

export function setToken(token: string) {
  localStorage.setItem("traceai_token", token);
}

export function clearToken() {
  localStorage.removeItem("traceai_token");
}

export function getStoredUser() {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("traceai_user");
  return raw ? JSON.parse(raw) : null;
}

export function setStoredUser(user: unknown) {
  localStorage.setItem("traceai_user", JSON.stringify(user));
}

export function clearStoredUser() {
  localStorage.removeItem("traceai_user");
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  opts?: { raw?: boolean }
): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(snakeize(body)) : undefined,
  });

  if (response.status === 401) {
    clearToken();
    clearStoredUser();
    if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
      window.location.href = "/login";
    }
    throw new Error("Unauthorized");
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(error.detail || `HTTP ${response.status}`);
  }

  if (response.status === 204) return undefined as T;
  const data = await response.json();
  return opts?.raw ? (data as T) : camelize<T>(data);
}

export const api = {
  get: <T>(path: string) => request<T>("GET", path),
  post: <T>(path: string, body?: unknown) => request<T>("POST", path, body),
  put: <T>(path: string, body?: unknown) => request<T>("PUT", path, body),
  patch: <T>(path: string, body?: unknown) => request<T>("PATCH", path, body),
  del: <T>(path: string) => request<T>("DELETE", path),
  // Raw mode: skip camelCase conversion (for endpoints that return non-standard shapes)
  getRaw: <T>(path: string) => request<T>("GET", path, undefined, { raw: true }),
  postRaw: <T>(path: string, body?: unknown) => request<T>("POST", path, body, { raw: true }),
};