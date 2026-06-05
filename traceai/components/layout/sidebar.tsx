"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuthStore, useThemeStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import {
  Home,
  Users,
  MapPin,
  Activity,
  Search,
  FileText,
  Image,
  BarChart3,
  Bell,
  Settings,
  Shield,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  Eye,
  ClipboardCheck,
  Network,
  LayoutDashboard,
} from "lucide-react";

interface SidebarNavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  roles: string[];
}

const sidebarNav: SidebarNavItem[] = [
  {
    title: "Dashboard",
    href: "/family",
    icon: LayoutDashboard,
    roles: ["family", "authority", "admin"],
  },
  {
    title: "My Cases",
    href: "/family/cases",
    icon: FileText,
    roles: ["family"],
  },
  {
    title: "Case Search",
    href: "/family/search",
    icon: Search,
    roles: ["family", "citizen", "authority"],
  },
  {
    title: "Report Sighting",
    href: "/citizen/sighting",
    icon: MapPin,
    roles: ["citizen"],
  },
  {
    title: "My Sightings",
    href: "/citizen",
    icon: Eye,
    roles: ["citizen"],
  },
  {
    title: "Dashboard",
    href: "/authority",
    icon: LayoutDashboard,
    roles: ["authority"],
  },
  {
    title: "Case Verification",
    href: "/authority/cases",
    icon: ClipboardCheck,
    roles: ["authority"],
  },
  {
    title: "Match Approval",
    href: "/authority/matches",
    icon: Network,
    roles: ["authority"],
  },
  {
    title: "Analytics",
    href: "/authority/analytics",
    icon: BarChart3,
    roles: ["authority", "admin"],
  },
  {
    title: "Admin Dashboard",
    href: "/admin",
    icon: Shield,
    roles: ["admin"],
  },
  {
    title: "User Management",
    href: "/admin/users",
    icon: Users,
    roles: ["admin"],
  },
  {
    title: "Role Management",
    href: "/admin/roles",
    icon: UserPlus,
    roles: ["admin"],
  },
  {
    title: "Audit Logs",
    href: "/admin/audit",
    icon: Activity,
    roles: ["admin"],
  },
  {
    title: "Monitoring",
    href: "/admin/monitoring",
    icon: Settings,
    roles: ["admin"],
  },
];

interface SidebarProps {
  role?: string;
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar } = useThemeStore();
  const { user } = useAuthStore();
  const userRole = role || user?.role || "family";

  const filteredNav = sidebarNav.filter(
    (item) => item.roles.includes(userRole) && item.href !== pathname
  );

  const currentItem = sidebarNav.find((item) => item.href === pathname);

  return (
    <aside
      className={cn(
        "fixed left-0 top-16 z-30 flex h-[calc(100vh-4rem)] flex-col border-r bg-sidebar text-sidebar-foreground transition-all duration-300",
        sidebarOpen ? "w-64" : "w-16"
      )}
    >
      <div className="flex items-center justify-end p-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="text-white/60 hover:text-white hover:bg-white/10"
        >
          {sidebarOpen ? (
            <ChevronLeft className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </Button>
      </div>

      {currentItem && sidebarOpen && (
        <div className="px-4 pb-3">
          <div className="flex items-center gap-3 rounded-[10px] bg-white/10 px-3 py-2">
            <currentItem.icon className="h-5 w-5 text-[#60A5FA]" />
            <span className="text-sm font-medium">{currentItem.title}</span>
          </div>
        </div>
      )}

      <nav className="flex-1 space-y-1 px-3 pb-4">
        {filteredNav.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-[#1428A0] text-white shadow-md"
                  : "text-white/60 hover:bg-white/10 hover:text-white"
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {sidebarOpen && <span>{item.title}</span>}
            </Link>
          );
        })}
      </nav>

      <div
        className={cn(
          "border-t border-white/10 p-4",
          !sidebarOpen && "p-2"
        )}
      >
        <div
          className={cn(
            "flex items-center gap-3 rounded-[10px] bg-white/5 px-3 py-2",
            !sidebarOpen && "justify-center px-0"
          )}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1428A0] text-white text-xs font-bold">
            {user?.name?.[0] || "T"}
          </div>
          {sidebarOpen && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">
                {user?.name || "TraceAI User"}
              </p>
              <p className="truncate text-xs text-white/50 capitalize">
                {user?.role || "Guest"}
              </p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
