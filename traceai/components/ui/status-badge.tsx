"use client";

import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const statusStyles: Record<string, string> = {
  active: "bg-[#16A34A]/10 text-[#16A34A] border border-[#16A34A]/20",
  "under-review": "bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20",
  resolved: "bg-[#1428A0]/10 text-[#1428A0] border border-[#1428A0]/20",
  closed: "bg-muted text-muted-foreground border border-border",
  pending: "bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20",
  verified: "bg-[#16A34A]/10 text-[#16A34A] border border-[#16A34A]/20",
  dismissed: "bg-destructive/10 text-destructive border border-destructive/20",
  approved: "bg-[#16A34A]/10 text-[#16A34A] border border-[#16A34A]/20",
  rejected: "bg-destructive/10 text-destructive border border-destructive/20",
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize",
        statusStyles[status] || "bg-muted text-muted-foreground",
        className
      )}
    >
      {status.replace("-", " ")}
    </span>
  );
}
