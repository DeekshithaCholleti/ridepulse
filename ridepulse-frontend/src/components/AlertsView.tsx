import React, { useState } from 'react';
import { useShuttles } from '../context/ShuttleContext';
import { AlertTriangle, Info, Bell, CheckCircle2, ShieldAlert } from 'lucide-react';
import type { AlertType } from '../types';

export const AlertsView: React.FC = () => {
  const { alerts, shuttles, dismissAlert } = useShuttles();
  const [filter, setFilter] = useState<string>('all');

  const filteredAlerts = alerts.filter((alert) => {
    if (filter === 'active') return alert.active;
    if (filter === 'delay') return alert.type === 'delay';
    if (filter === 'route_change') return alert.type === 'route_change';
    return true;
  });

  const getAlertBadge = (type: AlertType) => {
    switch (type) {
      case 'delay':
        return {
          bg: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
          icon: <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />,
          label: 'Service Delay',
        };
      case 'route_change':
        return {
          bg: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
          icon: <Info className="w-5 h-5 text-blue-400 flex-shrink-0" />,
          label: 'Route Change',
        };
      case 'emergency':
        return {
          bg: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
          icon: <ShieldAlert className="w-5 h-5 text-rose-400 flex-shrink-0" />,
          label: 'Critical Alert',
        };
      default:
        return {
          bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
          icon: <Info className="w-5 h-5 text-emerald-400 flex-shrink-0" />,
          label: 'System Update',
        };
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs uppercase tracking-wider">
            <Bell className="w-4 h-4" />
            Campus Broadcast System
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
            Service Alerts & Notifications
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Real-time updates regarding delays, route detours, maintenance, and extra shuttle schedules.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800 text-xs font-semibold">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              filter === 'all' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            All ({alerts.length})
          </button>
          <button
            onClick={() => setFilter('delay')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              filter === 'delay' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Delays
          </button>
          <button
            onClick={() => setFilter('route_change')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              filter === 'route_change' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Detours
          </button>
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {filteredAlerts.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-400 space-y-2">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
            <h3 className="font-bold text-white text-base">No active alerts</h3>
            <p className="text-xs">All campus shuttle routes are operating normally with zero reported delays.</p>
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const badge = getAlertBadge(alert.type);
            const affectedShuttle = shuttles.find((s) => s.id === alert.affectedShuttleId);

            return (
              <div
                key={alert.id}
                className={`bg-slate-900 border rounded-3xl p-6 shadow-xl transition-all space-y-3 ${
                  alert.active ? 'border-slate-800' : 'border-slate-800/40 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-2xl border ${badge.bg}`}>
                      {badge.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-extrabold text-base text-white">{alert.title}</h3>
                        <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${badge.bg}`}>
                          {badge.label}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Logged at {alert.timestamp}
                      </p>
                    </div>
                  </div>

                  {alert.active && (
                    <button
                      onClick={() => dismissAlert(alert.id)}
                      className="text-xs text-slate-500 hover:text-slate-300 font-semibold px-2 py-1"
                    >
                      Dismiss
                    </button>
                  )}
                </div>

                <p className="text-sm text-slate-200 pl-1">{alert.message}</p>

                {affectedShuttle && (
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs text-slate-300">
                    <div className="flex items-center gap-2">
                      <span>🚌 Affected Shuttle:</span>
                      <span className="font-bold text-blue-400">{affectedShuttle.shuttleNumber}</span>
                    </div>
                    {alert.expectedArrival && (
                      <span className="text-amber-400 font-semibold">
                        Est. Delay Impact: {alert.expectedArrival}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
