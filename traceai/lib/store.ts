import { create } from "zustand";
import type { User, UserRole } from "@/types";
import { setToken, clearToken, setStoredUser, clearStoredUser, getStoredUser } from "@/lib/api-client";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  setUser: (user: User) => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  login: (user, token) => {
    setToken(token);
    setStoredUser(user);
    set({ user, isAuthenticated: true });
  },
  logout: () => {
    clearToken();
    clearStoredUser();
    set({ user: null, isAuthenticated: false });
  },
  setUser: (user) => {
    setStoredUser(user);
    set({ user });
  },
  hydrate: () => {
    const stored = getStoredUser();
    const token = typeof window !== "undefined" ? localStorage.getItem("traceai_token") : null;
    if (stored && token) {
      set({ user: stored as User, isAuthenticated: true });
    }
  },
}));

// Hydrate on load (restore session from localStorage)
if (typeof window !== "undefined") {
  const stored = getStoredUser();
  const token = localStorage.getItem("traceai_token");
  if (stored && token) {
    useAuthStore.getState().setUser(stored as User);
  }
}

interface ThemeState {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}));

export const roleLabels: Record<UserRole, string> = {
  family: "Family Member",
  citizen: "Citizen",
  authority: "Authority",
  admin: "Administrator",
};

export const roleColors: Record<UserRole, string> = {
  family: "bg-blue-100 text-blue-800",
  citizen: "bg-green-100 text-green-800",
  authority: "bg-purple-100 text-purple-800",
  admin: "bg-red-100 text-red-800",
};