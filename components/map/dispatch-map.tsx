'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useTheme } from '@/context/theme-context';
import {
  MapPin,
  Navigation,
  Crosshair,
  Loader2,
  Sparkles,
  Check,
  ArrowRight,
  ShieldCheck,
  Zap,
  Building,
  Clock,
  Compass,
  CheckCircle2,
} from 'lucide-react';
import 'leaflet/dist/leaflet.css';

export interface LocationSelection {
  lat: number;
  lng: number;
  distanceKm: number;
  etaMinutes: number;
  etaLabel: string;
  slaType: string;
  courier: string;
  fee: number;
  isServiceablePorter: boolean;
  tier: string;
  address?: string;
  area?: string;
  pincode?: string;
  city?: string;
}

export const WAREHOUSE_COORDS = {
  lat: 12.9698,
  lng: 77.6534,
  name: 'Dspace Central Hub (HAL 3rd Stage)',
  address: '1273, HAL 3rd Stage, New Thippasandra, Bengaluru 560075',
};



export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(1));
}

export function getDispatchEstimate(distanceKm: number) {
  if (distanceKm <= 5) {
    return {
      etaMinutes: 45,
      etaLabel: '45 – 60 Mins',
      slaType: 'Hyperlocal Porter Express',
      courier: 'Porter 2-Wheeler Direct',
      fee: 49,
      isServiceablePorter: true,
      tier: 'Direct Workbench Dispatch (<5km)',
    };
  } else if (distanceKm <= 12) {
    return {
      etaMinutes: 75,
      etaLabel: '60 – 90 Mins',
      slaType: 'Bengaluru Fast Courier',
      courier: 'Porter 2-Wheeler Dedicated',
      fee: 79,
      isServiceablePorter: true,
      tier: 'Bengaluru Core Hubs (5-12km)',
    };
  } else if (distanceKm <= 25) {
    return {
      etaMinutes: 150,
      etaLabel: '2 – 3 Hours',
      slaType: 'Metro Bengaluru Courier',
      courier: 'Porter 2-Wheeler Express',
      fee: 119,
      isServiceablePorter: true,
      tier: 'Greater Bengaluru Tech Parks (12-25km)',
    };
  } else if (distanceKm <= 45) {
    return {
      etaMinutes: 240,
      etaLabel: '3 – 5 Hours',
      slaType: 'Extended Bengaluru Porter',
      courier: 'Porter Priority Logistics',
      fee: 149,
      isServiceablePorter: true,
      tier: 'Outer Bengaluru & Suburbs (25-45km)',
    };
  } else {
    return {
      etaMinutes: 1440,
      etaLabel: '24 – 48 Hours',
      slaType: 'National Air Cargo',
      courier: 'Blue Dart / Delhivery Express',
      fee: 99,
      isServiceablePorter: false,
      tier: 'Interstate Air Dispatch (>45km)',
    };
  }
}

interface DispatchMapProps {
  initialLat?: number;
  initialLng?: number;
  onLocationSelect?: (selection: LocationSelection) => void;
  showCardDetails?: boolean;
  className?: string;
  height?: string;
  title?: string;
}

export function DispatchMap({
  initialLat = 12.9352, // default Koramangala
  initialLng = 77.6245,
  onLocationSelect,
  showCardDetails = true,
  className = '',
  height = '420px',
  title = 'Live Bengaluru Porter Dispatch Map',
}: DispatchMapProps) {
  const { isDark } = useTheme();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);
  const routeLineRef = useRef<any>(null);
  const coverageRingsRef = useRef<any[]>([]);

  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number }>({
    lat: initialLat,
    lng: initialLng,
  });
  const [isLocating, setIsLocating] = useState(false);
  const [reverseAddress, setReverseAddress] = useState<string>('');
  const [locationArea, setLocationArea] = useState<string>('Koramangala');
  const [locationPincode, setLocationPincode] = useState<string>('560034');
  const [geoError, setGeoError] = useState<string | null>(null);

  const distance = calculateDistanceKm(
    WAREHOUSE_COORDS.lat,
    WAREHOUSE_COORDS.lng,
    currentLocation.lat,
    currentLocation.lng
  );
  const estimate = getDispatchEstimate(distance);

  // Reverse geocoding helper
  const fetchAddress = useCallback(async (lat: number, lng: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      if (res.ok) {
        const data = await res.json();
        const addr = data.address || {};
        const road = addr.road || addr.street || addr.building || '';
        const areaName = addr.suburb || addr.neighbourhood || addr.city_district || addr.residential || road || 'Bengaluru';
        const cityName = addr.city || addr.town || addr.municipality || 'Bengaluru';
        const pcode = addr.postcode || '560001';
        const formatted = data.display_name || `${road ? road + ', ' : ''}${areaName}, ${cityName}`;

        setReverseAddress(formatted);
        setLocationArea(areaName);
        setLocationPincode(pcode);

        if (onLocationSelect) {
          const dist = calculateDistanceKm(WAREHOUSE_COORDS.lat, WAREHOUSE_COORDS.lng, lat, lng);
          onLocationSelect({
            lat,
            lng,
            distanceKm: dist,
            ...getDispatchEstimate(dist),
            address: formatted,
            area: areaName,
            pincode: pcode,
            city: cityName,
          });
        }
        return;
      }
    } catch (e) {
      console.warn('Reverse geocode lookup error:', e);
    }

    // Fallback
    const fallbackArea = 'Bengaluru';
    const fallbackPincode = '560001';
    setLocationArea(fallbackArea);
    setLocationPincode(fallbackPincode);
    setReverseAddress(`${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E`);

    if (onLocationSelect) {
      const dist = calculateDistanceKm(WAREHOUSE_COORDS.lat, WAREHOUSE_COORDS.lng, lat, lng);
      onLocationSelect({
        lat,
        lng,
        distanceKm: dist,
        ...getDispatchEstimate(dist),
        address: `${fallbackArea}, Bengaluru`,
        area: fallbackArea,
        pincode: fallbackPincode,
        city: 'Bengaluru',
      });
    }
  }, [onLocationSelect]);

  // Request user's current GPS location
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const newCoords = { lat: latitude, lng: longitude };
        setCurrentLocation(newCoords);
        setIsLocating(false);

        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([latitude, longitude], 14, { duration: 1.2 });
        }
        updateMarkersAndRoute(latitude, longitude);
        fetchAddress(latitude, longitude);
      },
      (err) => {
        setIsLocating(false);
        setGeoError(
          err.code === 1
            ? 'Location permission denied. You can tap on any area or select a hotspot below.'
            : 'Could not retrieve location. Please tap the map to set location.'
        );
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Update marker position and polyline
  const updateMarkersAndRoute = (destLat: number, destLng: number) => {
    if (!mapInstanceRef.current || !window) return;
    const L = (window as any).L;
    if (!L) return;

    // Update user marker
    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng([destLat, destLng]);
    }

    // Update animated route polyline
    if (routeLineRef.current) {
      routeLineRef.current.setLatLngs([
        [WAREHOUSE_COORDS.lat, WAREHOUSE_COORDS.lng],
        [destLat, destLng],
      ]);
    }
  };



  // Initialize Leaflet Map
  useEffect(() => {
    let isMounted = true;

    const initMap = async () => {
      if (!mapContainerRef.current) return;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }

      const L = (await import('leaflet')).default;
      (window as any).L = L;

      if (!isMounted || !mapContainerRef.current) return;

      // Create Leaflet map instance
      const map = L.map(mapContainerRef.current, {
        center: [12.955, 77.645],
        zoom: 12,
        zoomControl: true,
        scrollWheelZoom: false,
        attributionControl: false,
      });

      mapInstanceRef.current = map;

      // Official OpenStreetMap Tile Layer (100% Free, Zero Watermark, No API Key Required)
      const tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

      L.tileLayer(tileUrl, {
        maxZoom: 19,
        subdomains: ['a', 'b', 'c'],
      }).addTo(map);

      // 1. Warehouse Marker (HAL 3rd Stage)
      const warehouseIcon = L.divIcon({
        className: 'custom-warehouse-marker',
        html: `
          <div style="position: relative; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; width: 36px; height: 36px; background: rgba(229, 30, 43, 0.35); border-radius: 50%; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="width: 28px; height: 28px; background: #6366f1; border: 2.5px solid white; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(229,30,43,0.5); font-weight: bold; color: white; font-size: 11px; font-family: monospace;">
              HUB
            </div>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const warehouseMarker = L.marker([WAREHOUSE_COORDS.lat, WAREHOUSE_COORDS.lng], {
        icon: warehouseIcon,
      }).addTo(map);

      warehouseMarker.bindPopup(`
        <div style="font-family: sans-serif; padding: 4px; font-size: 12px;">
          <b style="color: #6366f1;">Dspace Silicon Dispatch Hub</b><br/>
          <span>${WAREHOUSE_COORDS.address}</span><br/>
          <small style="color: #10b981; font-weight: 600;">⚡ Active Porter Rider Bay</small>
        </div>
      `);

      // 2. Coverage Rings around Warehouse (5km Express, 12km Standard, 25km Metro)
      const ring5 = L.circle([WAREHOUSE_COORDS.lat, WAREHOUSE_COORDS.lng], {
        radius: 5000,
        color: '#10b981',
        fillColor: '#10b981',
        fillOpacity: isDark ? 0.08 : 0.05,
        weight: 1.5,
        dashArray: '4, 6',
      }).addTo(map);

      const ring12 = L.circle([WAREHOUSE_COORDS.lat, WAREHOUSE_COORDS.lng], {
        radius: 12000,
        color: '#3b82f6',
        fillColor: '#3b82f6',
        fillOpacity: isDark ? 0.05 : 0.03,
        weight: 1,
        dashArray: '4, 8',
      }).addTo(map);

      coverageRingsRef.current = [ring5, ring12];

      // 3. User Destination Marker
      const userIcon = L.divIcon({
        className: 'custom-user-marker',
        html: `
          <div style="position: relative; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; width: 32px; height: 32px; background: rgba(16, 185, 129, 0.4); border-radius: 50%; animation: pulse 1.5s ease-in-out infinite;"></div>
            <div style="width: 26px; height: 26px; background: #10b981; border: 2.5px solid white; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(16,185,129,0.5); color: white;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
            </div>
          </div>
        `,
        iconSize: [26, 26],
        iconAnchor: [13, 13],
      });

      const userMarker = L.marker([currentLocation.lat, currentLocation.lng], {
        icon: userIcon,
        draggable: true,
      }).addTo(map);

      userMarkerRef.current = userMarker;

      // When marker is dragged
      userMarker.on('dragend', (e: any) => {
        const pos = e.target.getLatLng();
        setCurrentLocation({ lat: pos.lat, lng: pos.lng });
        updateMarkersAndRoute(pos.lat, pos.lng);
        fetchAddress(pos.lat, pos.lng);
      });

      // 4. Live Route Line
      const routeLine = L.polyline(
        [
          [WAREHOUSE_COORDS.lat, WAREHOUSE_COORDS.lng],
          [currentLocation.lat, currentLocation.lng],
        ],
        {
          color: '#6366f1',
          weight: 3,
          opacity: 0.85,
          dashArray: '8, 8',
        }
      ).addTo(map);

      routeLineRef.current = routeLine;

      // 5. Click anywhere on map to move destination
      map.on('click', (e: any) => {
        const { lat, lng } = e.latlng;
        setCurrentLocation({ lat, lng });
        updateMarkersAndRoute(lat, lng);
        fetchAddress(lat, lng);
      });

      // Fit bounds to show both warehouse and destination
      const bounds = L.latLngBounds([
        [WAREHOUSE_COORDS.lat, WAREHOUSE_COORDS.lng],
        [currentLocation.lat, currentLocation.lng],
      ]);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });

      // Initial address lookup
      fetchAddress(currentLocation.lat, currentLocation.lng);
    };

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isDark]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Map Control Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-neutral-50 dark:bg-white/5 border border-neutral-200 dark:border-white/10 p-3 sm:p-4 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#6366f1]/10 border border-[#6366f1]/20 flex items-center justify-center text-[#6366f1] shrink-0">
            <Compass className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-neutral-950 dark:text-white flex items-center gap-2">
              <span>{title}</span>
              <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live Porter Dispatch
              </span>
            </h4>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Origin: <span className="font-semibold text-neutral-700 dark:text-neutral-300">HAL 3rd Stage Hub</span> • Tap anywhere to drop pin
            </p>
          </div>
        </div>

        {/* GPS Button */}
        <button
          type="button"
          onClick={handleUseCurrentLocation}
          disabled={isLocating}
          className="inline-flex items-center justify-center gap-2 bg-[#6366f1] hover:bg-[#4f46e5] text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-md shadow-[#6366f1]/20 transition-all cursor-pointer disabled:opacity-60 active:scale-95 shrink-0"
        >
          {isLocating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Detecting GPS...</span>
            </>
          ) : (
            <>
              <Crosshair className="w-4 h-4" />
              <span>Use Current Location</span>
            </>
          )}
        </button>
      </div>

      {geoError && (
        <div className="text-xs p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 flex items-center gap-2">
          <span>⚠️ {geoError}</span>
        </div>
      )}

      {/* Interactive Map Canvas */}
      <div className="relative rounded-2xl overflow-hidden border border-neutral-200 dark:border-white/10 shadow-lg">
        <div ref={mapContainerRef} style={{ height }} className="w-full z-0" />

        {/* Overlay Badges */}
        <div className="absolute top-3 left-3 z-[400] flex flex-col gap-1.5 pointer-events-none">
          <div className="inline-flex items-center gap-1.5 bg-neutral-950/80 backdrop-blur-md text-white px-2.5 py-1 rounded-lg text-[11px] font-mono border border-white/10 shadow-md">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <span>Origin: HAL 3rd Stage (560075)</span>
          </div>
          <div className="inline-flex items-center gap-1.5 bg-neutral-950/80 backdrop-blur-md text-emerald-400 px-2.5 py-1 rounded-lg text-[11px] font-mono border border-white/10 shadow-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Destination: {locationArea} ({distance} km)</span>
          </div>
        </div>
      </div>



      {/* Live Distance & Porter Dispatch Calculation Card */}
      {showCardDetails && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {/* Distance & SLA */}
          <div className="bg-white dark:bg-[#0e1117] border border-neutral-200 dark:border-white/10 p-4 rounded-2xl">
            <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 dark:text-neutral-500 block">
              Direct Road Distance
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-extrabold text-neutral-950 dark:text-white font-mono">{distance}</span>
              <span className="text-xs text-neutral-500 dark:text-neutral-400 font-bold">KM from Hub</span>
            </div>
            <span className="text-xs text-neutral-500 dark:text-neutral-400 block mt-1">
              Zone: <strong className="text-neutral-800 dark:text-neutral-200">{estimate.tier}</strong>
            </span>
          </div>

          {/* Porter ETA */}
          <div className="bg-white dark:bg-[#0e1117] border border-neutral-200 dark:border-white/10 p-4 rounded-2xl">
            <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 dark:text-neutral-500 block">
              Estimated Delivery Time
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                {estimate.etaLabel}
              </span>
            </div>
            <span className="text-xs text-neutral-500 dark:text-neutral-400 block mt-1">
              Courier: <strong className="text-neutral-800 dark:text-neutral-200">{estimate.courier}</strong>
            </span>
          </div>

          {/* Delivery Fee */}
          <div className="bg-white dark:bg-[#0e1117] border border-neutral-200 dark:border-white/10 p-4 rounded-2xl">
            <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 dark:text-neutral-500 block">
              Porter Courier Fee
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-extrabold text-neutral-950 dark:text-white font-mono">
                ₹{estimate.fee}
              </span>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">Free &gt; ₹1,499</span>
            </div>
            <span className="text-xs text-neutral-500 dark:text-neutral-400 block mt-1">
              SLA: <strong className="text-neutral-800 dark:text-neutral-200">{estimate.slaType}</strong>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
