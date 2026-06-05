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
import { StatusBadge } from "@/components/ui/status-badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BrainCircuit,
  Search,
  Filter,
  Download,
  RefreshCw,
  Eye,
  Users,
  MapPin,
  Calendar,
  ArrowUpRight,
  CheckCircle2,
  XCircle,
  BarChart3,
  Sparkles,
  Fingerprint,
  Shirt,
  UserCheck,
  Activity,
  Clock,
  Shield,
  ChevronDown,
  Gauge,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  RadialBarChart,
  RadialBar,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  RadarChart,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";
import { mockCases, mockMatches, mockMatchDetails } from "@/lib/mock-data";
import { useState } from "react";

const algorithmWeights = [
  { name: "Facial Recognition", weight: 45, icon: Fingerprint, color: "#1428A0" },
  { name: "Clothing Analysis", weight: 20, icon: Shirt, color: "#7C3AED" },
  { name: "Distinctive Features", weight: 20, icon: UserCheck, color: "#16A34A" },
  { name: "Demographic Profile", weight: 10, icon: Users, color: "#F59E0B" },
  { name: "Behavioral Patterns", weight: 5, icon: Activity, color: "#EF4444" },
];

const confidenceColors = [
  { range: "90-100%", color: "#16A34A", bg: "bg-green-100" },
  { range: "70-89%", color: "#F59E0B", bg: "bg-yellow-100" },
  { range: "50-69%", color: "#F97316", bg: "bg-orange-100" },
  { range: "< 50%", color: "#EF4444", bg: "bg-red-100" },
];

export default function AIMatchingPage() {
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"card" | "compare">("card");
  const allMatches = mockMatches;

  const selectedDetail = selectedMatch ? mockMatchDetails[selectedMatch] : null;
  const selectedMatchObj = selectedMatch
    ? allMatches.find((m) => m.id === selectedMatch)
    : null;
  const selectedCase = selectedMatchObj
    ? mockCases.find((c) => c.id === selectedMatchObj.caseId)
    : null;

  const radarData = selectedDetail
    ? selectedDetail.map((attr) => ({
        attribute: attr.name.split(" ")[0],
        confidence: attr.confidence * 100,
        fullMark: 100,
      }))
    : [];

  return (
    <PortalLayout role="authority">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-[12px] bg-purple-100 flex items-center justify-center">
                <BrainCircuit className="h-5 w-5 text-purple-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 font-heading">
                AI Matching Intelligence
              </h1>
            </div>
            <p className="text-gray-500 flex items-center gap-2">
              Ensemble matching engine: FaceNet + YOLOv8 + XGBoost simulation
              <Badge variant="outline" className="text-[10px] ml-1">v2.0</Badge>
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" size="sm" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Re-run Analysis
            </Button>
            <Button size="sm" className="gap-2 shadow-md">
              <Download className="h-4 w-4" />
              Export Match Report
            </Button>
          </div>
        </div>

        {/* Algorithm Weights */}
        <Card className="border-none shadow-sm overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 font-heading">
              <Gauge className="h-5 w-5 text-purple-600" />
              Algorithm Ensemble Weights
            </CardTitle>
            <CardDescription>How each algorithm contributes to the final confidence score</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {algorithmWeights.map((algo, i) => (
                <div key={i} className="text-center p-4 rounded-[12px] bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className={cn("h-10 w-10 rounded-full flex items-center justify-center mx-auto mb-2", algo.color === "#1428A0" ? "bg-blue-100" : "bg-gray-100")}>
                    <algo.icon className={cn("h-5 w-5", algo.color === "#1428A0" ? "text-blue-600" : `text-[${algo.color}]`)} style={{ color: algo.color }} />
                  </div>
                  <p className="text-xs font-bold text-gray-700">{algo.name}</p>
                  <p className="text-2xl font-bold font-heading mt-1" style={{ color: algo.color }}>{algo.weight}%</p>
                  <Progress value={algo.weight} className="h-1 mt-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main: Ranked Matches */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold font-heading">Ranked Match Queue</h2>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" className="text-xs gap-1">
                  <Filter className="h-3.5 w-3.5" />
                  Threshold: &gt;70%
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs"
                  onClick={() => setViewMode(viewMode === "card" ? "compare" : "card")}
                >
                  {viewMode === "card" ? "Compare View" : "Card View"}
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              {allMatches
                .sort((a, b) => b.confidenceScore - a.confidenceScore)
                .map((match) => {
                  const caseItem = mockCases.find((c) => c.id === match.caseId);
                  const detail = mockMatchDetails[match.id] || [];
                  const isSelected = selectedMatch === match.id;
                  const avgAttrConf = detail.length
                    ? detail.reduce((s, a) => s + a.confidence, 0) / detail.length
                    : 0;

                  return (
                    <Card
                      key={match.id}
                      className={cn(
                        "border-none shadow-sm overflow-hidden transition-all cursor-pointer hover:ring-2",
                        isSelected ? "ring-2 ring-purple-500" : "hover:ring-1 hover:ring-purple-300"
                      )}
                      onClick={() => setSelectedMatch(match.id)}
                    >
                      <div className="flex flex-col md:flex-row">
                        {/* Confidence Score Column */}
                        <div className={cn(
                          "w-full md:w-28 flex flex-col items-center justify-center p-4 text-white",
                          match.confidenceScore >= 90 ? "bg-green-500" :
                          match.confidenceScore >= 70 ? "bg-yellow-500" :
                          match.confidenceScore >= 50 ? "bg-orange-500" :
                          "bg-red-500"
                        )}>
                          <div className="text-3xl font-bold font-heading">{match.confidenceScore}%</div>
                          <div className="text-xs font-bold uppercase mt-1 opacity-80 text-center leading-tight">
                            {match.confidenceScore >= 90 ? "Excellent" :
                             match.confidenceScore >= 70 ? "Strong" :
                             match.confidenceScore >= 50 ? "Moderate" :
                             "Weak"}
                          </div>
                        </div>

                        {/* Main Content */}
                        <div className="flex-1 p-5">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="text-lg font-bold">{caseItem?.name || "Unknown"}</h3>
                                <StatusBadge status={match.status} />
                              </div>
                              <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {caseItem?.lastSeenLocation || "Unknown"}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {new Date(match.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            <BrainCircuit className="h-5 w-5 text-purple-600 shrink-0" />
                          </div>

                          {/* Attribute Confidence Bars */}
                          <div className="space-y-1.5">
                            {detail.slice(0, 5).map((attr, i) => (
                              <div key={i} className="flex items-center gap-3">
                                <span className="text-[10px] font-bold text-gray-500 w-24 truncate shrink-0 uppercase tracking-wider">
                                  {attr.name}
                                </span>
                                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                  <div
                                    className={cn(
                                      "h-full rounded-full transition-all duration-500",
                                      attr.confidence >= 0.8 ? "bg-green-500" :
                                      attr.confidence >= 0.6 ? "bg-yellow-500" : "bg-orange-500"
                                    )}
                                    style={{ width: `${attr.confidence * 100}%` }}
                                  />
                                </div>
                                <span className="text-[10px] font-bold w-8 text-right">
                                  {Math.round(attr.confidence * 100)}%
                                </span>
                              </div>
                            ))}
                          </div>

                          {/* Footer stats */}
                          <div className="flex items-center gap-4 mt-4 pt-3 border-t text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                            <span>Avg: {Math.round(avgAttrConf * 100)}%</span>
                            <span>{detail.length} attributes matched</span>
                            <span>Model: ensemble-v2</span>
                          </div>
                        </div>

                        {/* Action Buttons Column */}
                        <div className="p-4 flex md:flex-col items-center justify-center gap-2 border-t md:border-t-0 md:border-l bg-gray-50/50">
                          <Button size="sm" className="w-full gap-1 bg-[#16A34A] hover:bg-[#15803D] text-xs" onClick={(e) => { e.stopPropagation(); }}>
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Approve
                          </Button>
                          <Button size="sm" variant="outline" className="w-full gap-1 text-red-600 border-red-200 hover:bg-red-50 text-xs" onClick={(e) => { e.stopPropagation(); }}>
                            <XCircle className="h-3.5 w-3.5" />
                            Reject
                          </Button>
                          <Button size="sm" variant="ghost" className="w-full text-xs text-gray-500" onClick={(e) => { e.stopPropagation(); setViewMode("compare"); setSelectedMatch(match.id); }}>
                            <Eye className="h-3.5 w-3.5" />
                            Compare
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
            </div>
          </div>

          {/* Sidebar: Attribute Detail Panel */}
          <div className="space-y-6">
            {selectedDetail && selectedMatchObj ? (
              <>
                {/* Radar Chart */}
                <Card className="border-none shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-heading flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-purple-600" />
                      Attribute Confidence Radar
                    </CardTitle>
                    <CardDescription>
                      {selectedCase?.name || "Match"} | {selectedMatchObj.confidenceScore}% overall
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[280px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={radarData}>
                          <PolarGrid stroke="#e5e7eb" />
                          <PolarAngleAxis dataKey="attribute" tick={{ fontSize: 10 }} />
                          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
                          <Radar
                            name="Confidence"
                            dataKey="confidence"
                            stroke="#7C3AED"
                            fill="#7C3AED"
                            fillOpacity={0.2}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* All Attributes */}
                <Card className="border-none shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-heading">Attribute Breakdown</CardTitle>
                    <CardDescription>Per-attribute confidence by category</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {["biometric", "clothing", "demographic", "distinctive"].map((cat) => {
                      const catAttrs = selectedDetail.filter((a) => a.category === cat);
                      if (!catAttrs.length) return null;
                      return (
                        <div key={cat} className="space-y-2">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{cat}</p>
                          {catAttrs.map((attr, i) => (
                            <div key={i} className="flex items-center justify-between">
                              <span className="text-xs font-medium text-gray-700">{attr.name}</span>
                              <div className="flex items-center gap-2">
                                <Progress
                                  value={attr.confidence * 100}
                                  className="h-1.5 w-20"
                                />
                                <span className={cn(
                                  "text-[10px] font-bold w-8 text-right",
                                  attr.confidence >= 0.8 ? "text-green-600" :
                                  attr.confidence >= 0.6 ? "text-yellow-600" : "text-orange-600"
                                )}>
                                  {Math.round(attr.confidence * 100)}%
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>

                {/* Face Comparison (Simulated) */}
                <Card className="border-none shadow-sm bg-gradient-to-br from-purple-50 to-indigo-50">
                  <CardHeader>
                    <CardTitle className="text-sm font-heading flex items-center gap-2">
                      <Fingerprint className="h-4 w-4 text-purple-600" />
                      Face Comparison Preview
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="aspect-square rounded-[12px] bg-white border-2 border-purple-200 flex flex-col items-center justify-center p-4">
                        <Users className="h-8 w-8 text-gray-300 mb-2" />
                        <p className="text-[10px] font-bold text-gray-400 text-center leading-tight">
                          Case Photo<br />{selectedCase?.name || ""}
                        </p>
                      </div>
                      <div className="aspect-square rounded-[12px] bg-white border-2 border-blue-200 flex flex-col items-center justify-center p-4">
                        <Eye className="h-8 w-8 text-gray-300 mb-2" />
                        <p className="text-[10px] font-bold text-gray-400 text-center leading-tight">
                          Sighting<br />CCTV Capture
                        </p>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 rounded-full text-xs font-bold text-purple-700">
                        <Sparkles className="h-3.5 w-3.5" />
                        {selectedMatchObj.confidenceScore}% Match Confidence
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">FaceNet Similarity</span>
                        <span className="font-bold">{Math.min(selectedMatchObj.confidenceScore + 5, 99)}%</span>
                      </div>
                      <Progress value={Math.min(selectedMatchObj.confidenceScore + 5, 99)} className="h-2" />
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">YOLOv8 Attribute Overlap</span>
                        <span className="font-bold">{selectedMatchObj.confidenceScore - 4}%</span>
                      </div>
                      <Progress value={selectedMatchObj.confidenceScore - 4} className="h-2" />
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <Button variant="outline" className="w-full text-xs border-purple-200 text-purple-700">
                      View Full Biometric Report
                    </Button>
                  </CardFooter>
                </Card>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-[400px] text-center p-8">
                <BrainCircuit className="h-16 w-16 text-gray-200 mb-4" />
                <h3 className="font-bold text-gray-400 font-heading">Select a Match</h3>
                <p className="text-xs text-gray-400 mt-2">
                  Click on any match to see the full attribute-level analysis.
                </p>
              </div>
            )}

            {/* Confidence Legend */}
            <Card className="border-none shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-heading">Confidence Thresholds</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {confidenceColors.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-xs">
                    <div className={cn("h-3 w-3 rounded-full", item.color === "#16A34A" ? "bg-green-500" : item.color === "#F59E0B" ? "bg-yellow-500" : item.color === "#F97316" ? "bg-orange-500" : "bg-red-500")} />
                    <span className="font-bold text-gray-600">{item.range}</span>
                    <span className="text-gray-400">Auto-notify</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}
