"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MapPin, Navigation, Search, Crosshair } from "lucide-react";

interface LocationPickerProps {
  latitude?: number;
  longitude?: number;
  onLocationChange: (lat: number, lng: number, address: string) => void;
  readonly?: boolean;
  height?: string;
  className?: string;
  label?: string;
  zoom?: number;
}

export function LocationPicker({
  latitude = 40.7829,
  longitude = -73.9654,
  onLocationChange,
  readonly = false,
  height = "300px",
  className,
  label = "Location",
  zoom = 13,
}: LocationPickerProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markerInstance = useRef<any>(null);
  const [address, setAddress] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [mapReady, setMapReady] = useState(false);
  const [leafletLoaded, setLeafletLoaded] = useState(false);

  useEffect(() => {
    // Load Leaflet dynamically
    import("leaflet").then((L) => {
      // Fix default icon paths
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      setLeafletLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (!leafletLoaded || !mapContainer.current || mapInstance.current) return;

    const initMap = async () => {
      const L = await import("leaflet");

      const map = L.map(mapContainer.current!, {
        center: [latitude, longitude],
        zoom,
        zoomControl: !readonly,
        attributionControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      const marker = L.marker([latitude, longitude], {
        draggable: !readonly,
      }).addTo(map);

      marker.bindPopup("Last seen location").openPopup();
      markerInstance.current = marker;
      mapInstance.current = map;
      setMapReady(true);

      // Reverse geocode initial position
      reverseGeocode(latitude, longitude);

      if (!readonly) {
        marker.on("dragend", () => {
          const pos = marker.getLatLng();
          onLocationChange(pos.lat, pos.lng, "");
          reverseGeocode(pos.lat, pos.lng);
        });

        map.on("click", (e: any) => {
          marker.setLatLng(e.latlng);
          onLocationChange(e.latlng.lat, e.latlng.lng, "");
          reverseGeocode(e.latlng.lat, e.latlng.lng);
        });
      }

      // Fix map rendering after container is visible
      setTimeout(() => map.invalidateSize(), 100);
    };

    initMap();

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
        markerInstance.current = null;
      }
    };
  }, [leafletLoaded]);

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
        { headers: { "Accept-Language": "en" } }
      );
      const data = await res.json();
      const displayName = data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      setAddress(displayName.split(",").slice(0, 3).join(", "));
      onLocationChange(lat, lng, displayName);
    } catch {
      setAddress(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`,
        { headers: { "Accept-Language": "en" } }
      );
      const data = await res.json();
      if (data.length > 0 && mapInstance.current) {
        const { lat, lon, display_name } = data[0];
        const latNum = parseFloat(lat);
        const lonNum = parseFloat(lon);
        mapInstance.current.setView([latNum, lonNum], 15);

        if (markerInstance.current) {
          markerInstance.current.setLatLng([latNum, lonNum]);
        }
        setAddress(display_name?.split(",").slice(0, 3).join(", ") || "");
        onLocationChange(latNum, lonNum, display_name || "");
      }
    } catch {
      // Search failed silently
    }
  };

  const handleGetCurrentPosition = () => {
    if (!navigator.geolocation || !mapInstance.current) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        mapInstance.current.setView([lat, lng], 15);
        if (markerInstance.current) {
          markerInstance.current.setLatLng([lat, lng]);
        }
        reverseGeocode(lat, lng);
        onLocationChange(lat, lng, "Current location");
      },
      () => alert("Unable to get current location. Please check your browser permissions."),
    );
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <label className="text-sm font-medium text-gray-700" id="location-picker-label">
          {label}
        </label>
      )}

      {!readonly && (
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" aria-hidden="true" />
            <Input
              type="text"
              placeholder="Search location..."
              className="pl-10 h-9 text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              aria-label="Search for a location"
            />
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleSearch}
            className="h-9 whitespace-nowrap"
            aria-label="Search location"
          >
            <Search className="h-4 w-4 mr-1" />
            Search
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleGetCurrentPosition}
            className="h-9 w-9 shrink-0"
            aria-label="Use current location"
          >
            <Crosshair className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Map container */}
      <div
        ref={mapContainer}
        className="rounded-[12px] border overflow-hidden"
        style={{ height, width: "100%" }}
        role="application"
        aria-label="Interactive map for location selection"
        tabIndex={0}
      />

      {/* Address display */}
      {address && (
        <div className="flex items-center gap-2 p-2 rounded-[8px] bg-gray-50 text-xs text-gray-600" aria-live="polite">
          <MapPin className="h-3.5 w-3.5 text-[#1428A0] shrink-0" />
          <span className="truncate">{address}</span>
        </div>
      )}

      {/* GPS Button (mobile fallback) */}
      {readonly && (
        <div className="flex items-center gap-2 p-2 rounded-[8px] bg-blue-50 text-xs text-blue-700">
          <Navigation className="h-3.5 w-3.5" />
          <span>GPS: {latitude.toFixed(4)}, {longitude.toFixed(4)}</span>
        </div>
      )}
    </div>
  );
}
