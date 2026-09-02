import React, { useState } from 'react';
import { useShuttles } from '../context/ShuttleContext';
import { CampusMap } from './CampusMap';
import {
  calculateHaversineDistance,
  formatDistance,
  formatETA,
  getCrowdColorClasses,
  getUpcomingStopsTimeline,
} from '../utils/geoUtils';
import {
  Bus,
  Clock,
  Users,
  Search,
  TrendingUp,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const {
    shuttles,
    locations,
    selectedShuttleId,
    setSelectedShuttleId,
    setSelectedLocationId,
    activeShuttle,
    selectedLocation,
    activeRoute,
  } = useShuttles();

  const [searchQuery, setSearchQuery] = useState('');

  // Filter locations and shuttles based on search query
  const filteredShuttles = shuttles.filter(
    (s) =>
      s.shuttleNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.routeName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredLocations = locations.filter((l) =>
    l.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate upcoming stops timeline for the active shuttle
  const upcomingTimeline =
    activeShuttle && activeRoute
      ? getUpcomingStopsTimeline(activeShuttle, activeRoute).slice(0, 4)
      : [];

  // Active crowd style
  const activeCrowdStyle = activeShuttle
    ? getCrowdColorClasses(activeShuttle.crowdLevel)
    : null;

  // Active shuttle distance to next stop
  const nextStopObj = activeRoute?.stops.find(
    (s) => s.stopName === activeShuttle?.nextStopName
  );
  const distanceToNextStopMeters =
    activeShuttle && nextStopObj
      ? calculateHaversineDistance(
          activeShuttle.latitude,
          activeShuttle.longitude,
          nextStopObj.latitude,
          nextStopObj.longitude
        )
      : 650;

  // Operational Statistics
  const totalCapacity = shuttles.reduce((acc, s) => acc + s.capacity, 0);
  const totalCurrentPassengers = shuttles.reduce((acc, s) => acc + s.currentPassengers, 0);
  const mostCrowdedShuttle = [...shuttles].sort((a, b) => {
    const ratioA = a.currentPassengers / a.capacity;
    const ratioB = b.currentPassengers / b.capacity;
    return ratioB - ratioA;
  })[0];

  return (
    <div className="space-y-6 pb-12">
      {/* Hero Search Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Live Campus Transport Intelligence</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Where is your shuttle?
          </h1>
          <p className="text-sm sm:text-base text-slate-300">
            Track campus shuttles in real time, monitor passenger crowd levels, and view precise arrival ETAs.
          </p>

          {/* Quick Search Input */}
          <div className="relative pt-2 max-w-xl">
            <Search className="absolute left-4 top-5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search shuttle (e.g. SH-101) or location (e.g. Central Library)..."
              className="w-full pl-11 pr-4 py-3 bg-slate-950/80 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-5 text-xs text-slate-400 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>

          {/* Quick search suggestions */}
          {searchQuery && (
            <div className="bg-slate-900 border border-slate-700 rounded-xl p-3 max-w-xl mt-2 max-h-48 overflow-y-auto z-20 relative space-y-1">
              <p className="text-[11px] font-semibold uppercase text-slate-400 px-2">
                Matching Shuttles & Locations
              </p>
              {filteredShuttles.map((s) => (
                <div
                  key={s.id}
                  onClick={() => {
                    setSelectedShuttleId(s.id);
                    setSearchQuery('');
                  }}
                  className="flex items-center justify-between p-2 hover:bg-slate-800 rounded-lg cursor-pointer text-xs"
                >
                  <div className="flex items-center gap-2 text-white font-semibold">
                    <span>🚌</span>
                    <span>{s.shuttleNumber} — {s.routeName}</span>
                  </div>
                  <span className="text-blue-400 font-medium">Select Shuttle</span>
                </div>
              ))}
              {filteredLocations.map((l) => (
                <div
                  key={l.id}
                  onClick={() => {
                    setSelectedLocationId(l.id);
                    setSearchQuery('');
                  }}
                  className="flex items-center justify-between p-2 hover:bg-slate-800 rounded-lg cursor-pointer text-xs"
                >
                  <div className="flex items-center gap-2 text-slate-300">
                    <span>📍</span>
                    <span>{l.name}</span>
                  </div>
                  <span className="text-slate-400 font-medium">Inspect Location</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Dashboard Layout: Left Map + Right Live Fleet Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Interactive Campus Map Container */}
        <div className="lg:col-span-8 h-[520px] sm:h-[600px] relative">
          <CampusMap />

          {/* Floating Selected Building Inspector Card (Overlay on Map) */}
          {selectedLocation && (
            <div className="absolute top-4 right-4 z-[450] bg-slate-900/95 backdrop-blur-md p-4 rounded-2xl border border-slate-700 shadow-2xl max-w-xs text-xs space-y-2 text-slate-200">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
                    Location Inspector
                  </span>
                  <h3 className="font-bold text-sm text-white">{selectedLocation.name}</h3>
                </div>
                <button
                  onClick={() => setSelectedLocationId(null)}
                  className="text-slate-400 hover:text-white p-1"
                >
                  ✕
                </button>
              </div>

              <p className="text-slate-400 text-[11px] line-clamp-2">
                {selectedLocation.description}
              </p>

              {activeShuttle && (
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 space-y-1 mt-2">
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-400">Nearest Shuttle:</span>
                    <span className="font-bold text-blue-400">{activeShuttle.shuttleNumber}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-400">Distance:</span>
                    <span>
                      {formatDistance(
                        calculateHaversineDistance(
                          activeShuttle.latitude,
                          activeShuttle.longitude,
                          selectedLocation.latitude,
                          selectedLocation.longitude
                        )
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-400">Est. Arrival:</span>
                    <span className="font-semibold text-emerald-400">
                      {formatETA(
                        calculateHaversineDistance(
                          activeShuttle.latitude,
                          activeShuttle.longitude,
                          selectedLocation.latitude,
                          selectedLocation.longitude
                        )
                      )}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Sidebar: Live Shuttle Cards & Detailed Shuttle Floating Card */}
        <div className="lg:col-span-4 space-y-4">
          {/* Active Floating Shuttle Info Card */}
          {activeShuttle && activeRoute && activeCrowdStyle && (
            <div className="bg-slate-900 border-2 border-blue-500/40 rounded-2xl p-5 shadow-xl space-y-4 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-black text-white tracking-tight">
                      {activeShuttle.shuttleNumber}
                    </h2>
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      {activeShuttle.routeName}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {activeShuttle.assignedDriver || 'Assigned Shuttle Operator'}
                  </p>
                </div>

                <div className="flex flex-col items-end">
                  <span className={`px-2.5 py-1 rounded-full text-xs ${activeCrowdStyle.badge}`}>
                    {activeShuttle.crowdLevel} CROWD
                  </span>
                  <span className="text-[10px] text-slate-400 mt-1">
                    {activeShuttle.currentPassengers} / {activeShuttle.capacity} passengers
                  </span>
                </div>
              </div>

              {/* Passenger Occupancy Visual Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Occupancy</span>
                  <span className="font-bold text-slate-200">
                    {Math.round((activeShuttle.currentPassengers / activeShuttle.capacity) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                  <div
                    className="h-full transition-all duration-500 rounded-full"
                    style={{
                      width: `${(activeShuttle.currentPassengers / activeShuttle.capacity) * 100}%`,
                      backgroundColor: activeCrowdStyle.hex,
                    }}
                  ></div>
                </div>
              </div>

              {/* Status Details Grid */}
              <div className="grid grid-cols-2 gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                    Current Location
                  </span>
                  <span className="font-semibold text-slate-100 truncate block">
                    Near {activeShuttle.currentStopName}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                    Next Stop
                  </span>
                  <span className="font-semibold text-blue-400 truncate block">
                    {activeShuttle.nextStopName}
                  </span>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-900">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                    Distance to Next
                  </span>
                  <span className="font-semibold text-slate-200">
                    {formatDistance(distanceToNextStopMeters)}
                  </span>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-900">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                    Est. Arrival
                  </span>
                  <span className="font-bold text-emerald-400">
                    {formatETA(distanceToNextStopMeters, activeShuttle.speedKmH)}
                  </span>
                </div>
              </div>

              {/* Upcoming Stops Timeline */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase tracking-wider">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-blue-400" />
                    Upcoming Stops Timeline
                  </span>
                </div>
                <div className="space-y-1.5 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                  {upcomingTimeline.map((stop, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-xs py-1 px-2 hover:bg-slate-800/40 rounded transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                        <span className="text-slate-200 font-medium">{stop.stopName}</span>
                      </div>
                      <span className="text-emerald-400 font-semibold">{stop.etaFormatted}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Live Shuttles Sidebar List */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Bus className="w-4 h-4 text-blue-400" />
                Live Campus Shuttles
              </h3>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {shuttles.length} Active
              </span>
            </div>

            <div className="space-y-2">
              {shuttles.map((shuttle) => {
                const isSelected = shuttle.id === selectedShuttleId;
                const crowdStyle = getCrowdColorClasses(shuttle.crowdLevel);
                return (
                  <div
                    key={shuttle.id}
                    onClick={() => setSelectedShuttleId(shuttle.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-850 border-blue-500 shadow-lg shadow-blue-500/10'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-white text-base">
                          {shuttle.shuttleNumber}
                        </span>
                        <span className="text-xs text-slate-400">{shuttle.routeName}</span>
                      </div>
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold rounded ${crowdStyle.badge}`}
                      >
                        {shuttle.crowdLevel}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            shuttle.status === 'ON_TIME'
                              ? 'bg-emerald-400'
                              : shuttle.status === 'DELAYED'
                              ? 'bg-amber-400'
                              : 'bg-rose-400'
                          }`}
                        ></span>
                        <span className="text-slate-400 uppercase font-semibold text-[10px]">
                          {shuttle.status.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-slate-400">
                          {shuttle.currentPassengers}/{shuttle.capacity}
                        </span>
                        <span className="text-emerald-400 font-bold">
                          ETA: {formatETA(400, shuttle.speedKmH)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Campus Shuttle Operational Analytics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center gap-3 shadow-md">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
            <Bus className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-medium text-slate-400 block uppercase">
              Total Fleet
            </span>
            <span className="text-lg font-bold text-white">{shuttles.length} Shuttles</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center gap-3 shadow-md">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-medium text-slate-400 block uppercase">
              Average ETA
            </span>
            <span className="text-lg font-bold text-emerald-400">3.8 mins</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center gap-3 shadow-md">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-medium text-slate-400 block uppercase">
              Current Occupancy
            </span>
            <span className="text-lg font-bold text-white">
              {totalCurrentPassengers} / {totalCapacity}
            </span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center gap-3 shadow-md">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-medium text-slate-400 block uppercase">
              Daily Rides
            </span>
            <span className="text-lg font-bold text-amber-400">486 Students</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center gap-3 shadow-md col-span-2 sm:col-span-1">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-medium text-slate-400 block uppercase">
              Peak Crowded
            </span>
            <span className="text-sm font-bold text-rose-400 truncate block">
              {mostCrowdedShuttle?.shuttleNumber} ({mostCrowdedShuttle?.crowdLevel})
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
