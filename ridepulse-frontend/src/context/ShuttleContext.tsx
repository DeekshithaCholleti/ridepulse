import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import type {
  Shuttle,
  ShuttleRoute,
  CampusLocation,
  ServiceAlert,
  UserRole,
  CrowdLevel,
  ShuttleStatus,
} from '../types';
import {
  INITIAL_SHUTTLES,
  SHUTTLE_ROUTES,
  CAMPUS_LOCATIONS,
  INITIAL_ALERTS,
} from '../data/campusData';
import {
  calculateCrowdLevel,
  interpolateCoordinates,
} from '../utils/geoUtils';

interface PassengerUpdateResult {
  success: boolean;
  message: string;
  newCount?: number;
  crowdLevel?: CrowdLevel;
}

interface ShuttleContextType {
  shuttles: Shuttle[];
  routes: ShuttleRoute[];
  locations: CampusLocation[];
  alerts: ServiceAlert[];
  selectedShuttleId: string | null;
  selectedLocationId: string | null;
  userRole: UserRole;
  simulationActive: boolean;
  activeShuttle: Shuttle | null;
  selectedLocation: CampusLocation | null;
  activeRoute: ShuttleRoute | null;
  
  // Actions
  setSelectedShuttleId: (id: string | null) => void;
  setSelectedLocationId: (id: string | null) => void;
  setUserRole: (role: UserRole) => void;
  setSimulationActive: (active: boolean) => void;
  updateShuttleStatus: (shuttleId: string, status: ShuttleStatus) => void;
  updatePassengers: (shuttleId: string, countIn: number, countOut: number) => PassengerUpdateResult;
  reportDelay: (shuttleId: string, delayMinutes: number, reason: string) => void;
  reportIssue: (shuttleId: string, issueText: string) => void;
  addAlert: (alertData: Omit<ServiceAlert, 'id' | 'timestamp' | 'active'>) => void;
  dismissAlert: (id: string) => void;
}

const ShuttleContext = createContext<ShuttleContextType | undefined>(undefined);

const BROADCAST_CHANNEL_NAME = 'ridepulse_state_sync';

export const ShuttleProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [shuttles, setShuttles] = useState<Shuttle[]>(INITIAL_SHUTTLES);
  const [routes] = useState<ShuttleRoute[]>(SHUTTLE_ROUTES);
  const [locations] = useState<CampusLocation[]>(CAMPUS_LOCATIONS);
  const [alerts, setAlerts] = useState<ServiceAlert[]>(INITIAL_ALERTS);
  const [selectedShuttleId, setSelectedShuttleId] = useState<string | null>('sh-101');
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<UserRole>('student');
  const [simulationActive, setSimulationActive] = useState<boolean>(true);

  // Sync across browser tabs using BroadcastChannel if supported
  useEffect(() => {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      const channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
      channel.onmessage = (event) => {
        if (event.data?.type === 'PASSENGER_UPDATE') {
          const { shuttleId, newCount, crowdLevel, lastUpdated, lastUpdatedLocation } = event.data.payload;
          setShuttles((prev) =>
            prev.map((s) =>
              s.id === shuttleId
                ? {
                    ...s,
                    currentPassengers: newCount,
                    crowdLevel,
                    lastUpdated,
                    lastUpdatedLocation: lastUpdatedLocation || s.lastUpdatedLocation,
                  }
                : s
            )
          );
        } else if (event.data?.type === 'STATUS_UPDATE') {
          const { shuttleId, status } = event.data.payload;
          setShuttles((prev) =>
            prev.map((s) => (s.id === shuttleId ? { ...s, status } : s))
          );
        } else if (event.data?.type === 'ALERT_ADDED') {
          setAlerts((prev) => [event.data.payload, ...prev]);
        }
      };
      return () => channel.close();
    }
  }, []);

  const broadcastEvent = (type: string, payload: any) => {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        const channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
        channel.postMessage({ type, payload });
        channel.close();
      } catch (err) {
        console.warn('BroadcastChannel error:', err);
      }
    }
  };

  // Driver action: update shuttle operational status (e.g. ON_TIME vs OFF_SERVICE)
  const updateShuttleStatus = useCallback((shuttleId: string, status: ShuttleStatus) => {
    setShuttles((prev) =>
      prev.map((s) => (s.id === shuttleId ? { ...s, status } : s))
    );
    broadcastEvent('STATUS_UPDATE', { shuttleId, status });
  }, []);

  // Driver action: update passenger count with bound validation
  const updatePassengers = useCallback(
    (shuttleId: string, countIn: number, countOut: number): PassengerUpdateResult => {
      const shuttle = shuttles.find((s) => s.id === shuttleId);
      if (!shuttle) {
        return { success: false, message: 'Shuttle not found' };
      }

      const calculated = shuttle.currentPassengers + countIn - countOut;

      if (calculated < 0) {
        return {
          success: false,
          message: 'Invalid passenger count. Cannot result in negative passengers.',
        };
      }

      if (calculated > shuttle.capacity) {
        return {
          success: false,
          message: `Cannot update passenger count. Shuttle capacity is ${shuttle.capacity}.`,
        };
      }

      const newCrowdLevel = calculateCrowdLevel(calculated, shuttle.capacity);
      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const updatedLocation = `Updated at ${shuttle.currentStopName}`;

      setShuttles((prev) =>
        prev.map((s) =>
          s.id === shuttleId
            ? {
                ...s,
                currentPassengers: calculated,
                crowdLevel: newCrowdLevel,
                lastUpdated: timestamp,
                lastUpdatedLocation: updatedLocation,
              }
            : s
        )
      );

      broadcastEvent('PASSENGER_UPDATE', {
        shuttleId,
        newCount: calculated,
        crowdLevel: newCrowdLevel,
        lastUpdated: timestamp,
        lastUpdatedLocation: updatedLocation,
      });

      return {
        success: true,
        message: 'Passenger count updated successfully.',
        newCount: calculated,
        crowdLevel: newCrowdLevel,
      };
    },
    [shuttles]
  );

  // Driver action: report delay
  const reportDelay = useCallback(
    (shuttleId: string, delayMinutes: number, reason: string) => {
      const shuttle = shuttles.find((s) => s.id === shuttleId);
      if (!shuttle) return;

      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const newAlert: ServiceAlert = {
        id: `alt-${Date.now()}`,
        title: `${shuttle.shuttleNumber} Delayed`,
        message: `${shuttle.shuttleNumber} is delayed by approximately ${delayMinutes} minutes due to ${reason}.`,
        type: 'delay',
        affectedShuttleId: shuttleId,
        affectedRouteId: shuttle.routeId,
        timestamp: timeStr,
        active: true,
        expectedArrival: `${delayMinutes}m delay`,
      };

      setShuttles((prev) =>
        prev.map((s) => (s.id === shuttleId ? { ...s, status: 'DELAYED' } : s))
      );

      setAlerts((prev) => [newAlert, ...prev]);
      broadcastEvent('ALERT_ADDED', newAlert);
    },
    [shuttles]
  );

  // Driver action: report vehicle issue
  const reportIssue = useCallback(
    (shuttleId: string, issueText: string) => {
      const shuttle = shuttles.find((s) => s.id === shuttleId);
      if (!shuttle) return;

      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const newAlert: ServiceAlert = {
        id: `alt-issue-${Date.now()}`,
        title: `⚠️ ${shuttle.shuttleNumber} Maintenance Alert`,
        message: `${shuttle.shuttleNumber} reported vehicle issue: ${issueText}. Maintenance crew notified.`,
        type: 'emergency',
        affectedShuttleId: shuttleId,
        affectedRouteId: shuttle.routeId,
        timestamp: timeStr,
        active: true,
      };

      setShuttles((prev) =>
        prev.map((s) => (s.id === shuttleId ? { ...s, status: 'MAINTENANCE' } : s))
      );

      setAlerts((prev) => [newAlert, ...prev]);
      broadcastEvent('ALERT_ADDED', newAlert);
    },
    [shuttles]
  );

  const addAlert = useCallback((alertData: Omit<ServiceAlert, 'id' | 'timestamp' | 'active'>) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newAlert: ServiceAlert = {
      ...alertData,
      id: `alt-${Date.now()}`,
      timestamp: timeStr,
      active: true,
    };
    setAlerts((prev) => [newAlert, ...prev]);
    broadcastEvent('ALERT_ADDED', newAlert);
  }, []);

  const dismissAlert = useCallback((id: string) => {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, active: false } : a)));
  }, []);

  // Real-time GPS movement simulation loop
  useEffect(() => {
    if (!simulationActive) return;

    const interval = setInterval(() => {
      setShuttles((prevShuttles) =>
        prevShuttles.map((shuttle) => {
          const route = routes.find((r) => r.id === shuttle.routeId);
          if (!route || route.stops.length < 2 || shuttle.status === 'MAINTENANCE' || shuttle.status === 'OFF_SERVICE') {
            return shuttle;
          }

          const totalStops = route.stops.length;
          const currentStopIndex = shuttle.currentStopIndex;
          const nextStopIndex = (currentStopIndex + 1) % totalStops;

          // Increment progress step (speed dependent)
          const stepSpeed = shuttle.status === 'DELAYED' ? 0.015 : 0.03;
          let newProgress = shuttle.progressToNextStop + stepSpeed;
          let newStopIndex = currentStopIndex;

          if (newProgress >= 1) {
            newProgress = 0;
            newStopIndex = nextStopIndex;
          }

          const activeStartStop = route.stops[newStopIndex];
          const activeEndStop = route.stops[(newStopIndex + 1) % totalStops];

          const { latitude, longitude, heading } = interpolateCoordinates(
            activeStartStop.latitude,
            activeStartStop.longitude,
            activeEndStop.latitude,
            activeEndStop.longitude,
            newProgress
          );

          return {
            ...shuttle,
            latitude,
            longitude,
            heading,
            currentStopIndex: newStopIndex,
            currentStopName: activeStartStop.stopName,
            nextStopName: activeEndStop.stopName,
            progressToNextStop: newProgress,
          };
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [simulationActive, routes]);

  const activeShuttle = shuttles.find((s) => s.id === selectedShuttleId) || null;
  const selectedLocation = locations.find((l) => l.id === selectedLocationId) || null;
  const activeRoute = activeShuttle
    ? routes.find((r) => r.id === activeShuttle.routeId) || null
    : null;

  return (
    <ShuttleContext.Provider
      value={{
        shuttles,
        routes,
        locations,
        alerts,
        selectedShuttleId,
        selectedLocationId,
        userRole,
        simulationActive,
        activeShuttle,
        selectedLocation,
        activeRoute,
        setSelectedShuttleId,
        setSelectedLocationId,
        setUserRole,
        setSimulationActive,
        updateShuttleStatus,
        updatePassengers,
        reportDelay,
        reportIssue,
        addAlert,
        dismissAlert,
      }}
    >
      {children}
    </ShuttleContext.Provider>
  );
};

export const useShuttles = () => {
  const context = useContext(ShuttleContext);
  if (!context) {
    throw new Error('useShuttles must be used within a ShuttleProvider');
  }
  return context;
};
