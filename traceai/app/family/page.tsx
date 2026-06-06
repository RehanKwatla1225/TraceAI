"use client";

import { PortalLayout } from "@/components/layout/portal-layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Search,
  Users,
  User,
  Plus,
  MapPin,
  Shield,
  Calendar,
  Clock,
  ChevronRight,
  BrainCircuit,
  MessageSquare,
  Activity,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/lib/store";
import { mockCases, mockNotifications } from "@/lib/mock-data";

export default function FamilyDashboard() {
  const { user } = useAuthStore();
  const myCases = mockCases.filter((c) => c.createdBy === "usr-001");
  const unreadNotifications = mockNotifications.filter((n) => !n.read);

  return (
    <PortalLayout role="family">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 font-heading">
              Hello, {user?.name?.split(" ")[0] || "Sarah"}
            </h1>
            <p className="text-gray-500">
              Welcome to your family recovery dashboard.
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="gap-2">
              <Search className="h-4 w-4" />
              Find Support
            </Button>
            <Button className="gap-2 shadow-md">
              <Plus className="h-4 w-4" />
              Register New Case
            </Button>
          </div>
        </div>

        {/* Alerts Section */}
        {unreadNotifications.length > 0 && (
          <div className="grid gap-4">
            {unreadNotifications.slice(0, 1).map((notif) => (
              <div
                key={notif.id}
                className="flex items-center justify-between rounded-[12px] bg-[#1428A0]/5 border border-[#1428A0]/10 p-4 animate-fade-in"
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                    {notif.type === "alert" ? (
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    ) : (
                      <BrainCircuit className="h-5 w-5 text-[#1428A0]" />
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-[#1428A0]">{notif.title}</p>
                    <p className="text-sm text-gray-600">{notif.message}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="text-[#1428A0]">
                  View Details
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Column: Cases */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold font-heading">Active Cases</h2>
              <Link href="/family" className="text-sm font-medium text-[#1428A0] hover:underline">
                View All
              </Link>
            </div>

            <div className="grid gap-6">
              {myCases.map((caseItem) => (
                <Card key={caseItem.id} className="overflow-hidden hover:shadow-md transition-all border-none shadow-sm">
                  <div className="flex flex-col md:flex-row">
                    <div className="w-full md:w-48 bg-gray-200 flex items-center justify-center">
                      <div className="text-gray-400 text-center p-4">
                        <Plus className="h-8 w-8 mx-auto mb-2 opacity-20" />
                        <span className="text-xs font-bold uppercase tracking-wider opacity-40">Photo Missing</span>
                      </div>
                    </div>
                    <div className="flex-1 p-6">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <CardTitle className="text-xl mb-1">{caseItem.name}</CardTitle>
                          <div className="flex items-center gap-3 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5" />
                              {caseItem.lastSeenLocation}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              {new Date(caseItem.lastSeenDate).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <StatusBadge status={caseItem.status} />
                      </div>
                      
                      <div className="mt-4 space-y-4">
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs font-medium">
                            <span className="text-gray-500">Search Intensity</span>
                            <span className="text-[#1428A0]">High</span>
                          </div>
                          <Progress value={75} className="h-1.5" />
                        </div>

                        <div className="flex flex-wrap gap-4 pt-2">
                          <div className="flex items-center gap-1.5 text-xs font-semibold bg-green-50 text-green-700 px-2 py-1 rounded-md">
                            <BrainCircuit className="h-3.5 w-3.5" />
                            2 AI MATCHES FOUND
                          </div>
                          <div className="flex items-center gap-1.5 text-xs font-semibold bg-blue-50 text-blue-700 px-2 py-1 rounded-md">
                            <MessageSquare className="h-3.5 w-3.5" />
                            5 COMMUNITY REPORTS
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 border-t md:border-t-0 md:border-l flex md:flex-col justify-center items-center gap-2">
                      <Button variant="outline" size="sm" className="w-full">Edit</Button>
                      <Button size="sm" className="w-full">
                        Update
                        <ChevronRight className="ml-1 h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <Card className="border-dashed border-2 bg-gray-50/50 hover:bg-gray-50 transition-colors cursor-pointer">
              <CardContent className="flex flex-col items-center justify-center p-12">
                <div className="h-12 w-12 rounded-full bg-white border border-dashed flex items-center justify-center mb-4">
                  <Plus className="h-6 w-6 text-gray-400" />
                </div>
                <h3 className="font-bold text-gray-900">Register Another Person</h3>
                <p className="text-sm text-gray-500 text-center max-w-xs mt-1">
                  Add another missing person report to the TraceAI network to start the search.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Column */}
          <div className="space-y-8">
            {/* Quick Actions */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold font-heading">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="h-auto flex-col p-4 gap-2 border-dashed">
                  <Plus className="h-5 w-5 text-[#1428A0]" />
                  <span className="text-xs">Add Photos</span>
                </Button>
                <Button variant="outline" className="h-auto flex-col p-4 gap-2 border-dashed">
                  <Activity className="h-5 w-5 text-[#1428A0]" />
                  <span className="text-xs">Export PDF</span>
                </Button>
                <Button variant="outline" className="h-auto flex-col p-4 gap-2 border-dashed">
                  <Users className="h-5 w-5 text-[#1428A0]" />
                  <span className="text-xs">Invite Team</span>
                </Button>
                <Button variant="outline" className="h-auto flex-col p-4 gap-2 border-dashed">
                  <Shield className="h-5 w-5 text-[#1428A0]" />
                  <span className="text-xs">Auth Contact</span>
                </Button>
              </div>
            </div>

            {/* Network Activity */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold font-heading">Network Activity</h2>
              <Card className="border-none shadow-sm overflow-hidden">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Verified Volunteers Near You
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex -space-x-2">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="h-8 w-8 rounded-full border-2 border-white bg-gray-200" />
                      ))}
                    </div>
                    <span className="text-xs font-bold text-green-600">142 ACTIVE</span>
                  </div>
                  <p className="text-xs text-gray-500">
                    Trusted citizens in your area are currently checking for Emily Chen.
                  </p>
                  <Button variant="secondary" size="sm" className="w-full text-xs">
                    Broadcast Update to Volunteers
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Support Resources */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold font-heading">Recovery Resources</h2>
              <div className="space-y-3">
                {[
                  "Steps to take in the first 24 hours",
                  "Working with law enforcement",
                  "Managing media coverage",
                  "Mental health support services",
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-[10px] bg-white shadow-sm border group cursor-pointer hover:border-[#1428A0]/50 transition-all">
                    <span className="text-sm font-medium text-gray-700">{item}</span>
                    <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-[#1428A0] group-hover:translate-x-1 transition-all" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}
