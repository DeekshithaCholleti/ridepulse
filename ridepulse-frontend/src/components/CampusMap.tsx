import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useShuttles } from '../context/ShuttleContext';
import { CAMPUS_CENTER } from '../data/campusData';
import { getCrowdColorClasses, calculateHaversineDistance } from '../utils/geoUtils';
import { Navigation } from 'lucide-react';

// Helper component to smoothly center map on selected items
const MapRecenter: React.FC<{ center: [number, number]; zoom?: number }> = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom || map.getZoom(), { duration: 1.2 });
  }, [center, zoom, map]);
  return null;
};

export const CampusMap: React.FC = () => {
  const {
    shuttles,
    routes,
    locations,
    selectedShuttleId,
    selectedLocationId,
    setSelectedShuttleId,
    setSelectedLocationId,
    activeShuttle,
    selectedLocation,
  } = useShuttles();

  // Create custom Leaflet DivIcon for Shuttle Markers
  const createShuttleIcon = (shuttle: any, isSelected: boolean) => {
    const crowdStyle = getCrowdColorClasses(shuttle.crowdLevel);
    const borderColor = crowdStyle.hex;

    const html = `
      <div class="relative flex items-center justify-center cursor-pointer transition-transform transform hover:scale-110">
        ${
          isSelected
            ? `<div class="absolute -inset-3 rounded-full opacity-75 animate-ping" style="background-color: ${borderColor}"></div>`
            : ''
        }
        <div class="relative flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border-2 shadow-2xl text-white text-xs font-bold"
             style="border-color: ${borderColor}">
          <span class="text-sm">🚌</span>
          <span>${shuttle.shuttleNumber}</span>
          <span class="w-2 h-2 rounded-full" style="background-color: ${borderColor}"></span>
        </div>
      </div>
    `;

    return L.divIcon({
      html,
      className: 'custom-shuttle-marker',
      iconSize: [100, 36],
      iconAnchor: [50, 18],
    });
  };

  // Create custom Leaflet DivIcon for Campus Buildings / Stops
  const createLocationIcon = (loc: any, isSelected: boolean) => {
    let bgColor = 'bg-blue-600';
    let iconChar = '🏢';

    switch (loc.category) {
      case 'gate':
        bgColor = 'bg-purple-600';
        iconChar = '🚪';
        break;
      case 'hostel':
        bgColor = 'bg-amber-600';
        iconChar = '🏠';
        break;
      case 'sports':
        bgColor = 'bg-emerald-600';
        iconChar = '⚽';
        break;
      case 'facility':
        bgColor = 'bg-indigo-600';
        iconChar = '🏛️';
        break;
      case 'parking':
        bgColor = 'bg-slate-600';
        iconChar = '🅿️';
        break;
      default:
        bgColor = 'bg-blue-600';
        iconChar = '📍';
    }

    const html = `
      <div class="relative group cursor-pointer">
        <div class="flex items-center justify-center w-7 h-7 rounded-full ${bgColor} text-white shadow-lg border-2 ${
      isSelected ? 'border-white ring-4 ring-blue-500/50 scale-125' : 'border-slate-800'
    } transition-all">
          <span class="text-xs">${iconChar}</span>
        </div>
      </div>
    `;

    return L.divIcon({
      html,
      className: 'custom-location-marker',
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });
  };

  // Determine map focal center
  let mapCenter: [number, number] = [CAMPUS_CENTER.latitude, CAMPUS_CENTER.longitude];
  if (activeShuttle) {
    mapCenter = [activeShuttle.latitude, activeShuttle.longitude];
  } else if (selectedLocation) {
    mapCenter = [selectedLocation.latitude, selectedLocation.longitude];
  }

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950">
      <MapContainer
        center={mapCenter}
        zoom={CAMPUS_CENTER.zoom}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        {/* Smooth Map Pan Controller */}
        <MapRecenter center={mapCenter} />

        {/* Watermark-Free OpenStreetMap Tiles */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Render Route Polylines */}
        {routes.map((route) => {
          const isSelected = activeShuttle?.routeId === route.id;
          const positions: [number, number][] = route.stops.map((stop) => [
            stop.latitude,
            stop.longitude,
          ]);

          return (
            <Polyline
              key={route.id}
              positions={positions}
              pathOptions={{
                color: route.color,
                weight: isSelected ? 6 : 3,
                opacity: isSelected ? 0.9 : 0.4,
                dashArray: isSelected ? undefined : '6, 8',
              }}
            />
          );
        })}

        {/* Render Campus Location Markers */}
        {locations.map((loc) => {
          const isSelected = loc.id === selectedLocationId;
          return (
            <Marker
              key={loc.id}
              position={[loc.latitude, loc.longitude]}
              icon={createLocationIcon(loc, isSelected)}
              eventHandlers={{
                click: () => {
                  setSelectedLocationId(loc.id);
                },
              }}
            >
              <Popup>
                <div className="p-2 min-w-[200px]">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-base">📍</span>
                    <h4 className="font-bold text-sm text-slate-100">{loc.name}</h4>
                  </div>
                  <p className="text-xs text-slate-400 mb-2">{loc.description}</p>
                  
                  {/* Nearest shuttle info calculation */}
                  {activeShuttle && (
                    <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800 text-xs">
                      <div className="flex justify-between text-slate-300">
                        <span>Nearest Shuttle:</span>
                        <span className="font-semibold text-blue-400">{activeShuttle.shuttleNumber}</span>
                      </div>
                      <div className="flex justify-between text-slate-400 mt-1">
                        <span>Distance:</span>
                        <span>
                          {calculateHaversineDistance(
                            activeShuttle.latitude,
                            activeShuttle.longitude,
                            loc.latitude,
                            loc.longitude
                          )}{' '}
                          m
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Render Live Animated Shuttle Markers */}
        {shuttles.map((shuttle) => {
          const isSelected = shuttle.id === selectedShuttleId;
          const crowdStyle = getCrowdColorClasses(shuttle.crowdLevel);

          return (
            <Marker
              key={shuttle.id}
              position={[shuttle.latitude, shuttle.longitude]}
              icon={createShuttleIcon(shuttle, isSelected)}
              eventHandlers={{
                click: () => {
                  setSelectedShuttleId(shuttle.id);
                },
              }}
            >
              <Popup>
                <div className="p-3 min-w-[240px]">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
                    <div>
                      <span className="font-bold text-base text-white">{shuttle.shuttleNumber}</span>
                      <p className="text-xs text-blue-400 font-medium">{shuttle.routeName}</p>
                    </div>
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${crowdStyle.badge}`}>
                      {shuttle.crowdLevel}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Current Location:</span>
                      <span className="font-medium text-slate-200">{shuttle.currentStopName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Next Stop:</span>
                      <span className="font-medium text-blue-300">{shuttle.nextStopName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Passengers:</span>
                      <span className="font-bold text-slate-100">
                        {shuttle.currentPassengers} / {shuttle.capacity}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Status:</span>
                      <span
                        className={`font-semibold ${
                          shuttle.status === 'ON_TIME'
                            ? 'text-emerald-400'
                            : shuttle.status === 'DELAYED'
                            ? 'text-amber-400'
                            : 'text-rose-400'
                        }`}
                      >
                        {shuttle.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedShuttleId(shuttle.id)}
                    className="w-full mt-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-1"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Focus Shuttle</span>
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Map Legend Overlay */}
      <div className="absolute bottom-4 left-4 z-[400] bg-slate-900/90 backdrop-blur-md p-3 rounded-xl border border-slate-800 shadow-xl text-xs space-y-2 hidden sm:block max-w-xs">
        <div className="font-bold text-slate-200 border-b border-slate-800 pb-1 flex items-center justify-between">
          <span>Campus Map Legend</span>
          <span className="text-[10px] text-slate-500 font-normal">GPS Simulated</span>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-slate-300">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
            <span>Academic</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span>Hostels</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
            <span>Facilities</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span>Sports</span>
          </div>
          <div className="flex items-center gap-1.5 col-span-2 border-t border-slate-800 pt-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
            <span className="text-[11px]">Low Crowd (&lt;40%)</span>
          </div>
          <div className="flex items-center gap-1.5 col-span-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
            <span className="text-[11px]">Med Crowd (41-75%)</span>
          </div>
          <div className="flex items-center gap-1.5 col-span-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            <span className="text-[11px]">High Crowd (&gt;75%)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
