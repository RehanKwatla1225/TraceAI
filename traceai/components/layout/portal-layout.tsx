"use client";

import { ReactNode } from "react";
import { Header } from "./header";
import { Sidebar } from "./sidebar";

interface PortalLayoutProps {
  children: ReactNode;
  role?: string;
}

export function PortalLayout({ children, role }: PortalLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50/50">
      <Header />
      <Sidebar role={role} />
      <main className="min-h-[calc(100vh-4rem)] pl-64 pt-16 transition-all duration-300">
        <div className="animate-fade-in p-6">{children}</div>
      </main>
    </div>
  );
}
