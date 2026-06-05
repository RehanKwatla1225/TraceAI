"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const Badge = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: "default" | "secondary" | "success" | "warning" | "destructive" | "outline";
  }
>(({ className, variant = "default", ...props }, ref) => {
  const variants = {
    default: "bg-[#1428A0] text-white",
    secondary: "bg-secondary text-secondary-foreground",
    success: "bg-[#16A34A]/10 text-[#16A34A] border border-[#16A34A]/20",
    warning: "bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20",
    destructive: "bg-destructive/10 text-destructive border border-destructive/20",
    outline: "border border-border text-foreground",
  };
  return (
    <div
      ref={ref}
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
        variants[variant],
        className
      )}
      {...props}
    />
  );
});
Badge.displayName = "Badge";

export { Badge };
