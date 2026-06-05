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
import {
  Activity,
  MapPin,
  Navigation,
  Clock,
  Shield,
  Search,
  Train,
  Bus,
  Waves,
  TrendingUp,
  AlertCircle,
  ArrowRight,
  Filter,
  Layers,
  History,
  Info,
  Calendar,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { mockCases, mockMovementPrediction, mockHeatZones } from "@/lib/mock-data";
import { useState } from "react";

export default function PredictiveIntelligencePage() {
  const [selectedCase, setSelectedCase] = useState("TA-1001");
  const prediction = mockMovementPrediction;
  const heatZones = mockHeatZones;

  return (
    <PortalLayout role="authority">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-[12px] bg-blue-100 flex items-center justify-center">
                <Activity className="h-5 w-5 text-blue-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 font-heading">
                Predictive Intelligence
              </h1>
            </div>
            <p className="text-gray-500 flex items-center gap-2">
              LSTM-simulated movement pattern engine: v1.5.2
              <Badge variant="outline" className="text-[10px] ml-1 bg-green-50 text-green-700">Real-time</Badge>
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="gap-2">
              <Layers className="h-4 w-4" />
              Map Layers
            </Button>
            <Button className="gap-2 shadow-md">
              <Filter className="h-4 w-4" />
              Prediction Filters
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main: Predictive Map & Route */}
          <div className="lg:col-span-2 space-y-8">
            {/* Predictive Analysis Card */}
            <Card className="border-none shadow-sm overflow-hidden bg-[#0F172A] text-white">
              <CardHeader className="border-b border-white/10 pb-6">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl flex items-center gap-2 font-heading">
                      <Sparkles className="h-5 w-5 text-blue-400" />
                      Predicted Movement Arc
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      Analyzing {prediction.name} ({prediction.age}y, {prediction.age_category})
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Time Since Last Seen</p>
                    <p className="text-2xl font-bold text-blue-400">{prediction.hours_since_last_seen}h</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="aspect-[21/9] bg-slate-800 relative flex items-center justify-center border-b border-white/10">
                  <div className="absolute inset-0 opacity-20 bg-[url('https://www.openstreetmap.org/assets/embed-map-6e4695029e84615a676b772c9a96e679.png')] bg-cover" />
                  <div className="z-10 flex flex-col items-center">
                    <Navigation className="h-12 w-12 text-blue-400 animate-pulse mb-2" />
                    <p className="text-xs font-bold uppercase tracking-widest text-blue-300">Live Prediction Active</p>
                  </div>
                  
                  {/* Overlay labels for hubs/zones */}
                  <div className="absolute top-4 left-4 p-3 bg-slate-900/80 backdrop-blur rounded-[10px] border border-white/10">
                    <div className="flex items-center gap-2 text-xs">
                      <div className="h-2 w-2 rounded-full bg-blue-400" />
                      <span className="font-bold">Probability Hub: 74%</span>
                    </div>
                  </div>
                </div>

                <div className="p-8">
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Chronological Route Prediction</h3>
                  <div className="relative space-y-0">
                    {/* Timeline line */}
                    <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-blue-500 via-blue-400 to-transparent" />
                    
                    {prediction.predicted_route.map((step, i) => (
                      <div key={i} className="flex gap-6 pb-8 last:pb-0 group">
                        <div className={cn(
                          "relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-[#0F172A]",
                          step.type === "last_seen" ? "bg-white" : "bg-blue-500"
                        )}>
                          <div className={cn("h-1.5 w-1.5 rounded-full", step.type === "last_seen" ? "bg-blue-600" : "bg-white")} />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-1">
                            <h4 className="font-bold text-white text-lg">{step.location}</h4>
                            <Badge className="bg-blue-900/50 text-blue-300 border-blue-800 text-[10px]">{step.timeframe}</Badge>
                          </div>
                          <p className="text-sm text-gray-400 leading-relaxed">{step.description}</p>
                          {step.probability && (
                            <div className="mt-3 flex items-center gap-3">
                              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">Confidence</span>
                              <div className="w-24 h-1 bg-white/10 rounded-full">
                                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${step.probability * 100}%` }} />
                              </div>
                              <span className="text-[10px] font-bold">{Math.round(step.probability * 100)}%</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-white/5 p-4 border-t border-white/10 justify-between">
                <div className="flex gap-4">
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <Shield className="h-3.5 w-3.5" />
                    Secure Analysis
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <Clock className="h-3.5 w-3.5" />
                    Updated 2m ago
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300 hover:bg-white/5 text-xs">
                  View Full Data Sequence
                  <ArrowRight className="ml-2 h-3.5 w-3.5" />
                </Button>
              </CardFooter>
            </Card>

            {/* Time-bucketed Probability Zones */}
            <div className="space-y-6">
              <h2 className="text-xl font-bold font-heading">Temporal Probability Matrix</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {prediction.time_buckets.map((bucket, i) => (
                  <Card key={i} className="border-none shadow-sm overflow-hidden group hover:shadow-md transition-all">
                    <div className="h-1 bg-blue-500" style={{ opacity: 1 - (i * 0.3) }} />
                    <CardHeader className="p-4 pb-2">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-sm font-bold text-gray-900">{bucket.timeframe}</CardTitle>
                        <Badge variant="outline" className="text-[10px]">{bucket.total_movement_radius}km radius</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 space-y-4">
                      {bucket.zones.map((zone, zi) => (
                        <div key={zi} className="space-y-1.5">
                          <div className="flex justify-between text-xs">
                            <span className="font-medium text-gray-600 truncate max-w-[120px]">{zone.zone}</span>
                            <span className="font-bold text-blue-600">{Math.round(zone.probability * 100)}%</span>
                          </div>
                          <Progress value={zone.probability * 100} className="h-1.5" />
                        </div>
                      ))}
                    </CardContent>
                    <CardFooter className="p-3 bg-gray-50 border-t flex justify-center">
                      <Button variant="ghost" size="sm" className="text-[10px] font-bold text-gray-500 hover:text-blue-600">
                        GENERATE SEARCH GRID
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar: Intelligence Panels */}
          <div className="space-y-8">
            {/* Transport Hub Detection */}
            <Card className="border-none shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2 font-heading">
                  <Train className="h-5 w-5 text-blue-600" />
                  Transport Hub Detection
                </CardTitle>
                <CardDescription>Probability of hub usage</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {prediction.nearby_transport_hubs.map((hub, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-[12px] bg-gray-50 border border-gray-100 group hover:border-blue-200 transition-all cursor-pointer">
                    <div className={cn(
                      "h-10 w-10 rounded-full flex items-center justify-center shrink-0",
                      hub.type === "rail" ? "bg-blue-100 text-blue-600" : "bg-purple-100 text-purple-600"
                    )}>
                      {hub.type === "rail" ? <Train className="h-5 w-5" /> : <Bus className="h-5 w-5" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex justify-between items-start">
                        <p className="font-bold text-sm truncate">{hub.name}</p>
                        <span className="text-[10px] font-bold text-blue-600 shrink-0">{Math.round(hub.catchment_probability * 100)}%</span>
                      </div>
                      <p className="text-[10px] text-gray-500 mt-0.5">{hub.distance_km}km | {hub.city}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Traffic Density</span>
                        <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500" style={{ width: `${(hub.daily_traffic / 750000) * 100}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full text-xs text-gray-600 border-gray-200">
                  Notify Hub Security Teams
                </Button>
              </CardContent>
            </Card>

            {/* Heat Zone Intensity */}
            <Card className="border-none shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2 font-heading">
                  <Waves className="h-5 w-5 text-orange-500" />
                  Live Search Intensity
                </CardTitle>
                <CardDescription>Sighting & match density by case</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {heatZones.map((zone, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "h-2 w-2 rounded-full",
                          zone.intensity >= 80 ? "bg-red-500 animate-pulse" :
                          zone.intensity >= 60 ? "bg-orange-500" : "bg-yellow-500"
                        )} />
                        <span className="font-bold text-gray-700">{zone.name}</span>
                      </div>
                      <span className="font-bold text-gray-400 uppercase text-[10px]">{zone.intensity} Intensity</span>
                    </div>
                    <Progress value={zone.intensity} className="h-2" />
                    <div className="flex gap-3 text-[9px] font-bold text-gray-400 uppercase tracking-tight pl-4">
                      <span>{zone.sightings} Sightings</span>
                      <span>{zone.approved_matches} Matches</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Prediction Engine Tips */}
            <div className="p-5 rounded-[12px] bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-lg relative overflow-hidden">
              <div className="absolute -top-4 -right-4 p-8 opacity-20">
                <Shield className="h-24 w-24 rotate-12" />
              </div>
              <h3 className="font-bold mb-2 flex items-center gap-2">
                <Info className="h-4 w-4" />
                Intelligence Advisory
              </h3>
              <p className="text-xs text-blue-100 leading-relaxed mb-4">
                Predictions indicate a high probability of transport hub transit in the next 12 hours. Recommend increasing surveillance at major rail terminals.
              </p>
              <Button size="sm" className="w-full bg-white text-blue-700 hover:bg-blue-50 font-bold border-none shadow-md">
                DEPLOY SURVEILLANCE UNIT
              </Button>
            </div>

            <Card className="border-none shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-bold text-gray-500 uppercase tracking-widest">Model Meta-data</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-[10px]">
                  <span className="text-gray-500">Algorithm</span>
                  <span className="font-bold">LSTM v1.5.2</span>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span className="text-gray-500">Confidence Decay</span>
                  <span className="font-bold">0.89/day</span>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span className="text-gray-500">Last Sequence Sync</span>
                  <span className="font-bold">Today, 10:45 PM</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}
