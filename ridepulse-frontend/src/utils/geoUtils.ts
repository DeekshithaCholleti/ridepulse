import type { CrowdLevel, Shuttle, ShuttleRoute, UpcomingStopETA } from '../types';

/**
 * Calculates geographic distance in meters between two lat/lng points using Haversine formula
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

/**
 * Formats distance in meters into human-readable text ("650 m" or "1.2 km")
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
}

/**
 * Calculates ETA in minutes based on distance and speed (default 20 km/h)
 */
export function calculateETAInMinutes(distanceMeters: number, speedKmH: number = 20): number {
  if (distanceMeters <= 20) return 0;
  const effectiveSpeed = Math.max(speedKmH, 10); // Minimum speed floor 10 km/h
  const metersPerMinute = (effectiveSpeed * 1000) / 60;
  const minutes = distanceMeters / metersPerMinute;
  return Math.max(1, Math.round(minutes));
}

/**
 * Formats ETA into human readable string ("Arriving in 2 min", "ARRIVED")
 */
export function formatETA(distanceMeters: number, speedKmH: number = 20): string {
  const minutes = calculateETAInMinutes(distanceMeters, speedKmH);
  if (minutes <= 0 || distanceMeters <= 30) {
    return 'Arriving now';
  }
  if (minutes === 1) {
    return '1 min';
  }
  return `${minutes} min`;
}

/**
 * Calculates crowd level based on occupancy percentage:
 * 0–40% occupancy -> LOW
 * 41–75% occupancy -> MEDIUM
 * 76–100% occupancy -> HIGH
 */
export function calculateCrowdLevel(passengers: number, capacity: number): CrowdLevel {
  if (capacity <= 0) return 'LOW';
  const ratio = passengers / capacity;
  if (ratio <= 0.40) return 'LOW';
  if (ratio <= 0.75) return 'MEDIUM';
  return 'HIGH';
}

/**
 * Returns Tailwind color style classes for crowd level
 */
export function getCrowdColorClasses(level: CrowdLevel) {
  switch (level) {
    case 'LOW':
      return {
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/30',
        text: 'text-emerald-400',
        badge: 'bg-emerald-500 text-slate-950 font-semibold',
        dot: 'bg-emerald-500',
        hex: '#10b981',
      };
    case 'MEDIUM':
      return {
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/30',
        text: 'text-amber-400',
        badge: 'bg-amber-500 text-slate-950 font-semibold',
        dot: 'bg-amber-500',
        hex: '#f59e0b',
      };
    case 'HIGH':
      return {
        bg: 'bg-rose-500/10',
        border: 'border-rose-500/30',
        text: 'text-rose-400',
        badge: 'bg-rose-500 text-white font-semibold',
        dot: 'bg-rose-500',
        hex: '#ef4444',
      };
  }
}

/**
 * Linear interpolation between two coordinates
 */
export function interpolateCoordinates(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
  progress: number
) {
  const latitude = lat1 + (lat2 - lat1) * progress;
  const longitude = lon1 + (lon2 - lon1) * progress;

  // Calculate compass heading angle in degrees
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const lat1Rad = lat1 * (Math.PI / 180);
  const lat2Rad = lat2 * (Math.PI / 180);
  const y = Math.sin(dLon) * Math.cos(lat2Rad);
  const x =
    Math.cos(lat1Rad) * Math.sin(lat2Rad) -
    Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLon);
  const heading = ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;

  return { latitude, longitude, heading };
}

/**
 * Calculates upcoming stops timeline and cumulative ETAs from shuttle's current position
 */
export function getUpcomingStopsTimeline(
  shuttle: Shuttle,
  route: ShuttleRoute
): UpcomingStopETA[] {
  if (!route || route.stops.length === 0) return [];

  const timeline: UpcomingStopETA[] = [];
  const totalStops = route.stops.length;
  const currentIndex = shuttle.currentStopIndex;

  let cumulativeDistance = 0;
  let prevLat = shuttle.latitude;
  let prevLon = shuttle.longitude;

  // Loop through upcoming stops starting from current next stop
  for (let i = 0; i < totalStops; i++) {
    const stopIdx = (currentIndex + i) % totalStops;
    const stop = route.stops[stopIdx];

    const distMeters = calculateHaversineDistance(prevLat, prevLon, stop.latitude, stop.longitude);
    cumulativeDistance += distMeters;

    const etaMin = calculateETAInMinutes(cumulativeDistance, shuttle.speedKmH);
    const etaFormatted = formatETA(cumulativeDistance, shuttle.speedKmH);

    timeline.push({
      stopName: stop.stopName,
      latitude: stop.latitude,
      longitude: stop.longitude,
      distanceMeters: cumulativeDistance,
      etaMinutes: etaMin,
      etaFormatted,
    });

    prevLat = stop.latitude;
    prevLon = stop.longitude;
  }

  return timeline;
}
