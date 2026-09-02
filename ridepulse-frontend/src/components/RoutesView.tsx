import React, { useState } from 'react';
import { useShuttles } from '../context/ShuttleContext';
import { Route as RouteIcon, Bus, ArrowRight } from 'lucide-react';
import { calculateHaversineDistance, formatDistance } from '../utils/geoUtils';

export const RoutesView: React.FC = () => {
  const { routes, shuttles, setSelectedShuttleId } = useShuttles();
  const [selectedRouteId, setSelectedRouteId] = useState<string>(routes[0].id);

  const activeRoute = routes.find((r) => r.id === selectedRouteId) || routes[0];
  const assignedShuttle = shuttles.find((s) => s.routeId === activeRoute.id);

  return (
    <div className="space-y-6 pb-16">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-400 font-semibold text-xs uppercase tracking-wider">
            <RouteIcon className="w-4 h-4" />
            Campus Transit Map & Sequence
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
            Campus Shuttle Routes
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Inspect stop sequences, distance breakdowns, and active shuttles assigned to each route.
          </p>
        </div>
      </div>

      {/* Route Selector Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {routes.map((route) => {
          const shuttle = shuttles.find((s) => s.routeId === route.id);
          const isSelected = route.id === selectedRouteId;

          return (
            <div
              key={route.id}
              onClick={() => setSelectedRouteId(route.id)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer space-y-3 ${
                isSelected
                  ? 'bg-slate-850 border-blue-500 shadow-xl shadow-blue-500/10 ring-2 ring-blue-500/30'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-black text-lg text-white">{route.code}</span>
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: route.color }}
                ></span>
              </div>
              <h3 className="font-bold text-sm text-blue-300">{route.name}</h3>
              <p className="text-xs text-slate-400 line-clamp-2">{route.description}</p>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <span>{route.stops.length} Stops</span>
                <span>{shuttle ? shuttle.shuttleNumber : 'Unassigned'}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Route Inspector */}
      {activeRoute && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div>
              <div className="flex items-center gap-3">
                <span className="text-2xl font-black text-white">{activeRoute.code}</span>
                <h2 className="text-xl font-bold text-blue-400">{activeRoute.name}</h2>
              </div>
              <p className="text-xs text-slate-400 mt-1">{activeRoute.description}</p>
            </div>

            {assignedShuttle && (
              <button
                onClick={() => setSelectedShuttleId(assignedShuttle.id)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-2"
              >
                <Bus className="w-4 h-4" />
                <span>Track {assignedShuttle.shuttleNumber}</span>
              </button>
            )}
          </div>

          {/* Sequential Route Stop Timeline */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Route Waypoint Sequence & Distances
            </h3>

            <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-blue-500/40">
              {activeRoute.stops.map((stop, index) => {
                const nextStop = activeRoute.stops[index + 1];
                const interDistance = nextStop
                  ? calculateHaversineDistance(
                      stop.latitude,
                      stop.longitude,
                      nextStop.latitude,
                      nextStop.longitude
                    )
                  : 0;

                const isShuttleHere = assignedShuttle?.currentStopName === stop.stopName;

                return (
                  <div key={stop.stopId} className="relative group">
                    {/* Node Dot */}
                    <div
                      className={`absolute -left-6 sm:-left-8 top-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white border-2 ${
                        isShuttleHere
                          ? 'bg-emerald-500 border-white ring-4 ring-emerald-500/40 animate-pulse'
                          : 'bg-slate-900 border-blue-500'
                      }`}
                    >
                      {index + 1}
                    </div>

                    <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-sm text-white flex items-center gap-2">
                          <span>{stop.stopName}</span>
                          {isShuttleHere && (
                            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              🚌 Shuttle Currently Here
                            </span>
                          )}
                        </h4>
                        <p className="text-slate-400 text-xs mt-0.5">
                          GPS: {stop.latitude.toFixed(6)}, {stop.longitude.toFixed(6)}
                        </p>
                      </div>

                      {nextStop && (
                        <div className="text-xs text-slate-400 flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800/80">
                          <span>To next:</span>
                          <span className="font-bold text-blue-400">
                            {formatDistance(interDistance)}
                          </span>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
