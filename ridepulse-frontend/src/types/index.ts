export type CrowdLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export type ShuttleStatus = 'ON_TIME' | 'DELAYED' | 'MAINTENANCE' | 'OFF_SERVICE';

export type AlertType = 'info' | 'delay' | 'route_change' | 'emergency';

export type LocationType = 
  | 'gate' 
  | 'academic' 
  | 'facility' 
  | 'hostel' 
  | 'sports' 
  | 'parking' 
  | 'service';

export interface LocationCoordinate {
  latitude: number;
  longitude: number;
}

export interface CampusLocation {
  id: string;
  name: string;
  category: LocationType;
  latitude: number;
  longitude: number;
  description?: string;
  code?: string;
  iconName?: string;
}

export interface ShuttleStop {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  locationId?: string;
}

export interface RouteStop {
  stopId: string;
  stopName: string;
  latitude: number;
  longitude: number;
  order: number;
}

export interface ShuttleRoute {
  id: string;
  code: string;
  name: string;
  description: string;
  color: string;
  stops: RouteStop[];
  totalDistanceMeters: number;
}

export interface Shuttle {
  id: string;
  shuttleNumber: string;
  name: string;
  routeId: string;
  routeName: string;
  capacity: number;
  currentPassengers: number;
  crowdLevel: CrowdLevel;
  latitude: number;
  longitude: number;
  speedKmH: number;
  heading: number;
  status: ShuttleStatus;
  currentStopIndex: number;
  currentStopName: string;
  nextStopName: string;
  progressToNextStop: number; // 0 to 1
  lastUpdated: string;
  lastUpdatedLocation?: string;
  assignedDriver?: string;
}

export interface ServiceAlert {
  id: string;
  title: string;
  message: string;
  type: AlertType;
  affectedShuttleId?: string;
  affectedRouteId?: string;
  timestamp: string;
  active: boolean;
  expectedArrival?: string;
}

export interface UpcomingStopETA {
  stopName: string;
  latitude: number;
  longitude: number;
  distanceMeters: number;
  etaMinutes: number;
  etaFormatted: string;
}

export type UserRole = 'student' | 'driver' | 'admin';
