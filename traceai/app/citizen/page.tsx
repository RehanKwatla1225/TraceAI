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
import { Separator } from "@/components/ui/separator";
import { TextInput, TextAreaInput, SelectInput } from "@/components/ui/form-field";
import { FileUpload } from "@/components/ui/file-upload";
import {
  Search,
  MapPin,
  Camera,
  Video,
  Send,
  Eye,
  CheckCircle2,
  Info,
  History,
  Navigation,
  Shield,
  Crosshair,
  Upload,
} from "lucide-react";
import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { mockSightings, mockCases } from "@/lib/mock-data";
import { sightingSchema, type SightingFormData } from "@/lib/validations";

const LocationPicker = dynamic(
  () => import("@/components/map/location-picker").then((m) => ({ default: m.LocationPicker })),
  {
    ssr: false,
    loading: () => (
      <div
        className="h-[300px] rounded-[12px] bg-gray-100 animate-pulse flex items-center justify-center text-sm text-gray-400"
        role="status"
        aria-label="Loading map"
      >
        Loading map...
      </div>
    ),
  }
);

export default function CitizenPortal() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof SightingFormData, string>>>({});
  const [formData, setFormData] = useState({
    caseId: "",
    locationName: "",
    latitude: 40.758,
    longitude: -73.9855,
    description: "",
    witnessName: "",
    witnessContact: "",
    isAnonymous: true,
    reportedAt: new Date().toISOString().slice(0, 16),
  });
  const [photos, setPhotos] = useState<File[]>([]);
  const [videos, setVideos] = useState<File[]>([]);

  const sightings = mockSightings.slice(0, 3);
  const featuredCases = mockCases.slice(0, 2);

  const updateField = useCallback((field: keyof typeof formData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error on change
    if (errors[field as keyof SightingFormData]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[field as keyof SightingFormData];
        return copy;
      });
    }
  }, [errors]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate with Zod
    const result = sightingSchema.safeParse({
      ...formData,
      isAnonymous: formData.isAnonymous,
    });

    if (!result.success) {
      const fieldErrors: Partial<Record<keyof SightingFormData, string>> = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof SightingFormData;
        if (!fieldErrors[field]) {
          fieldErrors[field] = issue.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 1500));
    alert("Sighting submitted successfully! Authorities will review it and AI analysis will begin automatically.");
    setIsSubmitting(false);
    // Reset form
    setFormData({
      caseId: "",
      locationName: "",
      latitude: 40.758,
      longitude: -73.9855,
      description: "",
      witnessName: "",
      witnessContact: "",
      isAnonymous: true,
      reportedAt: new Date().toISOString().slice(0, 16),
    });
    setPhotos([]);
    setVideos([]);
  };

  const caseOptions = mockCases
    .filter((c) => c.status === "active" || c.status === "under-review")
    .map((c) => ({ value: c.id, label: `${c.name} (${c.id})` }));

  return (
    <PortalLayout role="citizen">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 font-heading" id="citizen-title">
              Citizen Portal
            </h1>
            <p className="text-gray-500" id="citizen-desc">
              Help your community find missing people.
            </p>
          </div>
          <Badge
            variant="outline"
            className="h-10 px-4 bg-green-50 text-green-700 border-green-200"
            role="status"
          >
            Verified Contributor (Rank: Silver)
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main: Report Sighting */}
          <div className="lg:col-span-2 space-y-8">
            <Card
              className="border-none shadow-lg overflow-hidden ring-2 ring-[#1428A0]/10"
              role="form"
              aria-label="Report a sighting form"
            >
              <CardHeader className="gradient-primary text-white p-6">
                <CardTitle className="text-xl flex items-center gap-2" id="sighting-form-title">
                  <Camera className="h-5 w-5" aria-hidden="true" />
                  Report a Sighting
                </CardTitle>
                <CardDescription className="text-blue-100" id="sighting-form-desc">
                  Seen someone? Submit details instantly. AI analysis runs automatically on submission.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <form onSubmit={handleSubmit} noValidate aria-labelledby="sighting-form-title">
                  <div className="space-y-6">
                    {/* Case Selection */}
                    <SelectInput
                      label="Who did you see?"
                      value={formData.caseId}
                      onChange={(val) => updateField("caseId", val)}
                      error={errors.caseId}
                      options={caseOptions}
                      placeholder="Search missing persons..."
                      required
                      id="case-select"
                    />

                    {/* Location with Map */}
                    <LocationPicker
                      label="Location"
                      latitude={formData.latitude}
                      longitude={formData.longitude}
                      onLocationChange={(lat, lng, address) => {
                        updateField("latitude", lat.toString());
                        updateField("longitude", lng.toString());
                        if (address) updateField("locationName", address);
                      }}
                    />

                    {/* Hidden lat/lon fields for validation */}
                    <input type="hidden" name="latitude" value={formData.latitude} />
                    <input type="hidden" name="longitude" value={formData.longitude} />
                    {errors.locationName && (
                      <p className="text-xs text-red-500 font-medium" role="alert">{errors.locationName}</p>
                    )}

                    {/* Description */}
                    <TextAreaInput
                      label="Details of Sighting"
                      value={formData.description}
                      onChange={(val) => updateField("description", val)}
                      error={errors.description}
                      placeholder="Describe what they were wearing, who they were with, and what they were doing..."
                      required
                      id="sighting-desc"
                    />

                    {/* Photo & Video Upload */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <FileUpload
                        label="Photo Evidence"
                        description="Upload photos of the sighting"
                        fileType="image"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        maxSizeMB={50}
                        onUpload={(files) => setPhotos(files)}
                        onRemove={(i) => setPhotos((prev) => prev.filter((_, idx) => idx !== i))}
                      />
                      <FileUpload
                        label="Video Evidence"
                        description="Upload video footage if available"
                        fileType="video"
                        accept="video/mp4,video/webm,video/quicktime"
                        maxSizeMB={100}
                        multiple={false}
                        onUpload={(files) => setVideos(files)}
                        onRemove={(i) => setVideos((prev) => prev.filter((_, idx) => idx !== i))}
                      />
                    </div>

                    {/* Time of Sighting */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label htmlFor="sighting-time" className="text-sm font-medium text-gray-700">
                          Time of Sighting *
                        </label>
                        <input
                          id="sighting-time"
                          type="datetime-local"
                          value={formData.reportedAt}
                          onChange={(e) => updateField("reportedAt", e.target.value)}
                          className="flex h-10 w-full rounded-[10px] border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1428A0] focus-visible:ring-offset-2"
                          aria-required="true"
                          aria-invalid={!!errors.reportedAt}
                        />
                        {errors.reportedAt && (
                          <p className="text-xs text-red-500 font-medium" role="alert">{errors.reportedAt}</p>
                        )}
                      </div>

                      <div className="p-3 bg-blue-50 border border-blue-100 rounded-[10px] flex gap-3">
                        <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" aria-hidden="true" />
                        <p className="text-xs text-blue-700 leading-relaxed">
                          Your sighting will be analyzed by our AI ensemble (FaceNet + YOLOv8). False reports are subject to account suspension.
                        </p>
                      </div>
                    </div>

                    {/* Anonymous toggle */}
                    <div className="flex items-center gap-3 p-3 rounded-[10px] bg-gray-50">
                      <input
                        type="checkbox"
                        id="anonymous-toggle"
                        checked={formData.isAnonymous}
                        onChange={(e) => updateField("isAnonymous", e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-[#1428A0] focus:ring-[#1428A0]"
                      />
                      <label htmlFor="anonymous-toggle" className="text-sm font-medium text-gray-700 cursor-pointer">
                        Report anonymously (my name and contact will not be shared)
                      </label>
                    </div>

                    {!formData.isAnonymous && (
                      <div className="grid md:grid-cols-2 gap-6 animate-fade-in">
                        <TextInput
                          label="Your Name"
                          value={formData.witnessName}
                          onChange={(val) => updateField("witnessName", val)}
                          placeholder="For authority follow-up"
                          icon={Eye}
                          id="witness-name"
                        />
                        <TextInput
                          label="Contact"
                          value={formData.witnessContact}
                          onChange={(val) => updateField("witnessContact", val)}
                          placeholder="Phone or email"
                          id="witness-contact"
                        />
                      </div>
                    )}

                    <Separator />

                    <div className="flex justify-end gap-3">
                      <Button variant="outline" type="button">
                        Cancel
                      </Button>
                      <Button type="submit" className="px-8" disabled={isSubmitting} aria-label="Submit sighting report">
                        {isSubmitting ? (
                          <>Submitting...</>
                        ) : (
                          <>
                            Submit Sighting
                            <Send className="ml-2 h-4 w-4" aria-hidden="true" />
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Active searches */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold font-heading">High Priority Searches</h2>
                <Button variant="ghost" size="sm" className="text-[#1428A0]" aria-label="View map of all cases">
                  View Map
                </Button>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {featuredCases.map((c) => (
                  <Card
                    key={c.id}
                    className="overflow-hidden border-none shadow-sm hover:shadow-md transition-all group cursor-pointer"
                    tabIndex={0}
                    role="article"
                    aria-label={`Missing person: ${c.name}`}
                  >
                    <div className="aspect-video bg-gray-200 flex items-center justify-center relative">
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" aria-hidden="true" />
                      <Eye className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-all scale-50 group-hover:scale-100" aria-hidden="true" />
                      <div className="absolute top-3 left-3">
                        <Badge className="bg-red-500" aria-label="Urgent case">URGENT</Badge>
                      </div>
                    </div>
                    <CardHeader className="p-4">
                      <CardTitle className="text-lg">{c.name}</CardTitle>
                      <CardDescription className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                        {c.lastSeenLocation}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-lg font-bold font-heading">My History</h2>
              <div className="space-y-4">
                {sightings.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-8">No sightings reported yet</p>
                ) : (
                  sightings.map((s) => (
                    <Card key={s.id} className="border-none shadow-sm p-4">
                      <div className="flex justify-between items-start mb-2">
                        <StatusBadge status={s.status} />
                        <span className="text-[10px] font-bold text-gray-400">
                          {new Date(s.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold truncate">Sighting: {s.caseId}</h3>
                      <p className="text-xs text-gray-500 line-clamp-2 mt-1">{s.description}</p>
                      {s.status === "verified" && (
                        <div className="mt-3 pt-3 border-t flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center">
                            <CheckCircle2 className="h-3.5 w-3.5 text-green-600" aria-hidden="true" />
                          </div>
                          <span className="text-xs font-bold text-green-700">+50 Contribution Points</span>
                        </div>
                      )}
                    </Card>
                  ))
                )}
              </div>
              <Button variant="ghost" className="w-full text-gray-500 gap-2">
                <History className="h-4 w-4" aria-hidden="true" />
                Full History
              </Button>
            </div>

            <Card className="gradient-primary text-white border-none shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="h-5 w-5" aria-hidden="true" />
                  Become a Verified Citizen
                </CardTitle>
                <CardDescription className="text-blue-100">
                  Verify your identity to increase your report priority.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-white text-[#1428A0] hover:bg-blue-50">
                  Complete Verification
                </Button>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <h2 className="text-lg font-bold font-heading">Reporting Safety</h2>
              <nav aria-label="Safety tips">
                <ul className="space-y-3">
                  {[
                    "Do not approach suspects",
                    "Keep a safe distance",
                    "Prioritize photo quality",
                    "Report to local police too",
                  ].map((tip, i) => (
                    <li key={i}>
                      <div className="flex items-center gap-3 p-3 rounded-[10px] bg-white border shadow-sm">
                        <div className="h-2 w-2 rounded-full bg-[#1428A0]" aria-hidden="true" />
                        <span className="text-xs font-medium text-gray-700">{tip}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}
