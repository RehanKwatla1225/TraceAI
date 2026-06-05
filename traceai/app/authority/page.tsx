"use client";

import { PortalLayout } from "@/components/layout/portal-layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3,
  ClipboardCheck,
  Network,
  Users,
  MapPin,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  BrainCircuit,
  TrendingUp,
  Activity,
  ArrowUpRight,
  Filter,
  Download,
  Shield,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import { mockCases, mockMatches, mockSightings } from "@/lib/mock-data";

export default function AuthorityDashboard() {
  const chartData = [
    { name: "Mon", cases: 12, resolved: 8 },
    { name: "Tue", cases: 19, resolved: 14 },
    { name: "Wed", cases: 15, resolved: 12 },
    { name: "Thu", cases: 22, resolved: 18 },
    { name: "Fri", cases: 28, resolved: 21 },
    { name: "Sat", cases: 24, resolved: 19 },
    { name: "Sun", cases: 18, resolved: 15 },
  ];

  const matchConfidenceData = [
    { name: "90-100%", count: 12 },
    { name: "80-89%", count: 24 },
    { name: "70-79%", count: 42 },
    { name: "60-69%", count: 18 },
  ];

  const pendingMatches = mockMatches.filter((m) => m.status === "pending");
  const unverifiedCases = mockCases.filter((c) => c.status === "under-review");

  return (
    <PortalLayout role="authority">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 font-heading">
              Authority Operations Command
            </h1>
            <p className="text-gray-500">
              Command center for case verification and resource deployment.
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export Report
            </Button>
            <Button className="gap-2 shadow-md">
              <Filter className="h-4 w-4" />
              Intelligence Filters
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: "Active Cases",
              value: "428",
              change: "+12%",
              trend: "up",
              icon: Users,
              color: "text-blue-600",
              bg: "bg-blue-100",
            },
            {
              title: "AI Matches Found",
              value: "56",
              change: "+24%",
              trend: "up",
              icon: BrainCircuit,
              color: "text-purple-600",
              bg: "bg-purple-100",
            },
            {
              title: "Resolution Rate",
              value: "68%",
              change: "+4%",
              trend: "up",
              icon: CheckCircle2,
              color: "text-green-600",
              bg: "bg-green-100",
            },
            {
              title: "Avg. Lead Time",
              value: "4.2h",
              change: "-1.5h",
              trend: "down",
              icon: Activity,
              color: "text-red-600",
              bg: "bg-red-100",
            },
          ].map((stat, i) => (
            <Card key={i} className="border-none shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={cn("p-2 rounded-[10px]", stat.bg)}>
                    <stat.icon className={cn("h-5 w-5", stat.color)} />
                  </div>
                  <span
                    className={cn(
                      "text-xs font-bold flex items-center",
                      stat.trend === "up" ? "text-green-600" : "text-blue-600"
                    )}
                  >
                    {stat.change}
                    <ArrowUpRight className="ml-1 h-3 w-3" />
                  </span>
                </div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                  {stat.title}
                </h3>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stat.value}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Action Queues */}
            <Tabs defaultValue="matches">
              <div className="flex items-center justify-between mb-4">
                <TabsList className="bg-white border">
                  <TabsTrigger value="matches" className="gap-2">
                    <Network className="h-4 w-4" />
                    Match Queue
                    <Badge variant="destructive" className="ml-1 h-5 min-w-[20px]">
                      {pendingMatches.length}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger value="verification" className="gap-2">
                    <ClipboardCheck className="h-4 w-4" />
                    Case Verification
                  </TabsTrigger>
                </TabsList>
                <Button variant="ghost" size="sm" className="text-[#1428A0]">
                  Expand Queue
                </Button>
              </div>

              <TabsContent value="matches" className="mt-0">
                <div className="space-y-4">
                  {pendingMatches.map((match) => {
                    const caseItem = mockCases.find((c) => c.id === match.caseId);
                    return (
                      <Card key={match.id} className="border-none shadow-sm overflow-hidden">
                        <div className="flex flex-col md:flex-row">
                          <div className="w-full md:w-64 bg-gray-100 flex flex-col p-4 border-r">
                            <div className="flex items-center gap-2 mb-3">
                              <Badge variant="success" className="h-5">
                                {match.confidenceScore}% MATCH
                              </Badge>
                              <BrainCircuit className="h-4 w-4 text-purple-600" />
                            </div>
                            <div className="flex-1 flex items-center justify-center border rounded-[8px] bg-white aspect-square mb-3">
                              <Users className="h-8 w-8 text-gray-300" />
                            </div>
                            <Button size="sm" variant="outline" className="w-full text-xs">
                              Compare Biometrics
                            </Button>
                          </div>
                          <div className="flex-1 p-6">
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h3 className="text-lg font-bold">
                                  {caseItem?.name || "Unknown Case"}
                                </h3>
                                <div className="flex items-center gap-3 text-sm text-gray-500">
                                  <span className="flex items-center gap-1">
                                    <MapPin className="h-3.5 w-3.5" />
                                    Detected at: Union Station
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Calendar className="h-3.5 w-3.5" />
                                    {new Date(match.createdAt).toLocaleTimeString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="space-y-3">
                              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                                Matched Attributes
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {match.matchedAttributes.map((attr, i) => (
                                  <Badge key={i} variant="outline" className="bg-purple-50 border-purple-100 text-purple-700">
                                    {attr}
                                  </Badge>
                                ))}
                              </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                              <Button variant="outline" size="sm" className="flex-1 gap-2 text-red-600 border-red-100 hover:bg-red-50">
                                <XCircle className="h-4 w-4" />
                                Reject
                              </Button>
                              <Button variant="outline" size="sm" className="flex-1 gap-2">
                                <Search className="h-4 w-4" />
                                Verify More
                              </Button>
                              <Button size="sm" className="flex-1 gap-2 bg-[#16A34A] hover:bg-[#15803D]">
                                <CheckCircle2 className="h-4 w-4" />
                                Approve
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </TabsContent>
            </Tabs>

            {/* Recovery Analytics */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold font-heading">Performance Analytics</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="border-none shadow-sm p-6">
                  <h3 className="text-sm font-bold mb-6">Case Volume vs. Resolution</h3>
                  <div className="h-[240px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip />
                        <Line type="monotone" dataKey="cases" stroke="#1428A0" strokeWidth={2} dot={{ fill: "#1428A0" }} />
                        <Line type="monotone" dataKey="resolved" stroke="#16A34A" strokeWidth={2} dot={{ fill: "#16A34A" }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
                <Card className="border-none shadow-sm p-6">
                  <h3 className="text-sm font-bold mb-6">AI Match Confidence Distribution</h3>
                  <div className="h-[240px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={matchConfidenceData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip />
                        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                          {matchConfidenceData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={index === 0 ? "#1428A0" : index === 1 ? "#3b82f6" : "#93c5fd"} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </div>
            </div>
          </div>

          {/* Sidebar Column */}
          <div className="space-y-8">
            <Card className="border-none shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-[#1428A0]" />
                  Active Search Zones
                </CardTitle>
                <CardDescription>Hotspots with highest activity</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { zone: "Metropolitan Central", density: 85, color: "bg-red-500" },
                  { zone: "East Transport Hub", density: 62, color: "bg-orange-500" },
                  { zone: "Riverside District", density: 45, color: "bg-yellow-500" },
                  { zone: "Industrial North", density: 28, color: "bg-blue-500" },
                ].map((item, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between text-xs font-bold">
                      <span>{item.zone}</span>
                      <span>{item.density}% Density</span>
                    </div>
                    <Progress value={item.density} className="h-2" />
                  </div>
                ))}
                <Button variant="outline" className="w-full text-xs gap-2">
                  <MapPin className="h-3.5 w-3.5" />
                  Launch Heatmap Visualization
                </Button>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <h2 className="text-lg font-bold font-heading">Priority Sightings</h2>
              <div className="space-y-4">
                {mockSightings.slice(0, 2).map((s) => (
                  <Card key={s.id} className="border-none shadow-sm hover:ring-1 ring-[#1428A0]/20 cursor-pointer transition-all">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <Badge variant="outline" className="text-[10px] uppercase">{s.caseId}</Badge>
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                          Verified Witness
                        </span>
                      </div>
                      <p className="text-xs text-gray-700 line-clamp-2">
                        &quot;{s.description}&quot;
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold">
                        <MapPin className="h-3 w-3" />
                        {s.location}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <Card className="bg-[#0F172A] text-white border-none shadow-xl">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-400" />
                  Predictive Engine
                </CardTitle>
                <CardDescription className="text-gray-400">
                  AI Movement Pattern Analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-[12px] bg-white/5 border border-white/10 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
                    <span className="text-xs font-medium">Analyzing TA-1002 Path</span>
                  </div>
                  <p className="text-[10px] text-gray-400 leading-relaxed">
                    Most probable location in next 2 hours: <span className="text-white font-bold">Western Transit Terminal (74% probability)</span>.
                  </p>
                </div>
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white border-none shadow-md">
                  View Predicted Route
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}
