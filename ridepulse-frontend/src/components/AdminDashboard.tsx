import React, { useState } from 'react';
import { useShuttles } from '../context/ShuttleContext';
import { Shield, Bus, Bell, Plus, CheckCircle2 } from 'lucide-react';
import type { AlertType } from '../types';

export const AdminDashboard: React.FC = () => {
  const { shuttles, addAlert, simulationActive, setSimulationActive } = useShuttles();

  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<AlertType>('info');
  const [targetShuttleId, setTargetShuttleId] = useState<string>('');
  const [submittedMessage, setSubmittedMessage] = useState<string | null>(null);

  const handleBroadcastAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) return;

    addAlert({
      title,
      message,
      type,
      affectedShuttleId: targetShuttleId || undefined,
    });

    setSubmittedMessage('Service alert broadcasted successfully to all campus users.');
    setTitle('');
    setMessage('');
    setTimeout(() => setSubmittedMessage(null), 4000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-purple-400 font-semibold text-xs uppercase tracking-wider">
            <Shield className="w-4 h-4" />
            Operations Command Center
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
            Admin Fleet Control Panel
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Broadcast emergency alerts, monitor campus-wide shuttle occupancy, and manage transport operations.
          </p>
        </div>

        <button
          onClick={() => setSimulationActive(!simulationActive)}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
            simulationActive
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
          }`}
        >
          {simulationActive ? '● Real-Time Simulation Running' : '|| Simulation Paused'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Broadcast Alert Form */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Bell className="w-5 h-5 text-purple-400" />
            <h2 className="font-extrabold text-lg text-white">Broadcast Service Alert</h2>
          </div>

          {submittedMessage && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{submittedMessage}</span>
            </div>
          )}

          <form onSubmit={handleBroadcastAlert} className="space-y-4 text-xs">
            <div>
              <label className="text-slate-400 block mb-1 font-semibold">Alert Headline Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Hostels Line Extended Service"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-slate-400 block mb-1 font-semibold">Alert Priority Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as AlertType)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-semibold"
                >
                  <option value="info">ℹ️ System Info</option>
                  <option value="delay">⚠️ Delay Notice</option>
                  <option value="route_change">🚧 Detour / Maintenance</option>
                  <option value="emergency">🚨 Critical Emergency</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-semibold">Target Shuttle (Optional)</label>
                <select
                  value={targetShuttleId}
                  onChange={(e) => setTargetShuttleId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-semibold"
                >
                  <option value="">All Shuttles</option>
                  {shuttles.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.shuttleNumber}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-slate-400 block mb-1 font-semibold">Alert Message Description</label>
              <textarea
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Provide details of the service change or delay..."
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-extrabold rounded-xl transition-all shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>BROADCAST ALERT</span>
            </button>
          </form>
        </div>

        {/* Live Fleet Status Grid */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h2 className="font-extrabold text-lg text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Bus className="w-5 h-5 text-blue-400" />
              Fleet Status Monitor
            </h2>

            <div className="space-y-3">
              {shuttles.map((shuttle) => (
                <div
                  key={shuttle.id}
                  className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-white text-base">
                        {shuttle.shuttleNumber}
                      </span>
                      <span className="text-slate-400">{shuttle.routeName}</span>
                    </div>
                    <span className="font-bold text-slate-200">
                      {shuttle.currentPassengers} / {shuttle.capacity} Pax
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-400">
                    <span>Driver: {shuttle.assignedDriver}</span>
                    <span className="text-emerald-400 font-semibold">{shuttle.crowdLevel} Crowd</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
