import React, { useState } from 'react';
import { useShuttles } from '../context/ShuttleContext';
import { getCrowdColorClasses } from '../utils/geoUtils';
import {
  Bus,
  Users,
  Plus,
  Minus,
  CheckCircle2,
  AlertTriangle,
  Wrench,
  Clock,
  MapPin,
  RefreshCw,
} from 'lucide-react';

export const DriverDashboard: React.FC = () => {
  const {
    shuttles,
    selectedShuttleId,
    setSelectedShuttleId,
    updatePassengers,
    reportDelay,
    reportIssue,
  } = useShuttles();

  // Active driver shuttle
  const shuttle = shuttles.find((s) => s.id === selectedShuttleId) || shuttles[0];

  // Driver counter states
  const [studentsIn, setStudentsIn] = useState<number>(0);
  const [studentsOut, setStudentsOut] = useState<number>(0);

  // Feedback toast state
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Modal states
  const [showDelayModal, setShowDelayModal] = useState<boolean>(false);
  const [delayMinutes, setDelayMinutes] = useState<number>(5);
  const [delayReason, setDelayReason] = useState<string>('Traffic delay near Gate 2');

  const [showIssueModal, setShowIssueModal] = useState<boolean>(false);
  const [issueText, setIssueText] = useState<string>('Tire pressure check required');

  const crowdStyle = getCrowdColorClasses(shuttle.crowdLevel);

  // Passenger update handler
  const handlePassengerUpdate = () => {
    const result = updatePassengers(shuttle.id, studentsIn, studentsOut);

    if (result.success) {
      setFeedback({
        type: 'success',
        message: `${result.message} New count: ${result.newCount} / ${shuttle.capacity} (${result.crowdLevel})`,
      });
      // Reset counters on success
      setStudentsIn(0);
      setStudentsOut(0);
    } else {
      setFeedback({
        type: 'error',
        message: result.message,
      });
    }

    setTimeout(() => {
      setFeedback(null);
    }, 4000);
  };

  const handleReportDelay = (e: React.FormEvent) => {
    e.preventDefault();
    reportDelay(shuttle.id, delayMinutes, delayReason);
    setShowDelayModal(false);
    setFeedback({
      type: 'success',
      message: `Delay report broadcasted: ${delayMinutes} minutes (${delayReason})`,
    });
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleReportIssue = (e: React.FormEvent) => {
    e.preventDefault();
    reportIssue(shuttle.id, issueText);
    setShowIssueModal(false);
    setFeedback({
      type: 'error',
      message: `Vehicle issue reported: ${issueText}`,
    });
    setTimeout(() => setFeedback(null), 4000);
  };

  // Preview calculated new passenger count
  const calculatedPreview = Math.max(0, shuttle.currentPassengers + studentsIn - studentsOut);
  const isOverflow = calculatedPreview > shuttle.capacity;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs uppercase tracking-wider">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Driver Control Terminal
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
            Driver Dashboard
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Real-time passenger counter and operational terminal for shuttle operators.
          </p>
        </div>

        {/* Shuttle Switcher dropdown for driver testing */}
        <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
          <label className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
            Assigned Shuttle
          </label>
          <select
            value={shuttle.id}
            onChange={(e) => setSelectedShuttleId(e.target.value)}
            className="bg-slate-900 text-white font-bold text-sm px-3 py-1.5 rounded-lg border border-slate-700 focus:outline-none"
          >
            {shuttles.map((s) => (
              <option key={s.id} value={s.id}>
                {s.shuttleNumber} — {s.routeName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Shuttle Overview Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Bus className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-black text-white">{shuttle.shuttleNumber}</h2>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-extrabold ${crowdStyle.badge}`}
                >
                  {shuttle.crowdLevel} CROWD
                </span>
              </div>
              <p className="text-sm font-medium text-blue-400 mt-0.5">{shuttle.routeName}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                Status
              </span>
              <span
                className={`font-extrabold text-sm ${
                  shuttle.status === 'ON_TIME'
                    ? 'text-emerald-400'
                    : shuttle.status === 'DELAYED'
                    ? 'text-amber-400'
                    : 'text-rose-400'
                }`}
              >
                ● {shuttle.status.replace('_', ' ')}
              </span>
            </div>
          </div>
        </div>

        {/* Current & Next Stop Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center gap-3">
            <MapPin className="w-5 h-5 text-emerald-400" />
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">
                Current Stop
              </span>
              <p className="font-bold text-white text-sm">{shuttle.currentStopName}</p>
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center gap-3">
            <Clock className="w-5 h-5 text-blue-400" />
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Next Stop</span>
              <p className="font-bold text-blue-300 text-sm">{shuttle.nextStopName}</p>
            </div>
          </div>
        </div>

        {/* Passenger Update Section */}
        <div className="bg-slate-950/80 border-2 border-slate-800 rounded-3xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-400" />
              <h3 className="font-extrabold text-lg text-white">Passenger Count Update</h3>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400">Current Occupancy: </span>
              <span className="font-black text-base text-white">
                {shuttle.currentPassengers} / {shuttle.capacity}
              </span>
            </div>
          </div>

          {/* Feedback Alert Toast */}
          {feedback && (
            <div
              className={`p-4 rounded-xl border flex items-center gap-3 text-sm font-semibold transition-all ${
                feedback.type === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              }`}
            >
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0" />
              )}
              <span>{feedback.message}</span>
            </div>
          )}

          {/* Counter Controls Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* STUDENTS GOT IN */}
            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center justify-between">
                <span>Students Got In</span>
                <span>[ + ]</span>
              </span>
              <div className="flex items-center justify-between bg-slate-950 p-2 rounded-xl border border-slate-800">
                <button
                  onClick={() => setStudentsIn(Math.max(0, studentsIn - 1))}
                  className="w-12 h-12 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-lg flex items-center justify-center transition-colors"
                >
                  <Minus className="w-5 h-5" />
                </button>
                <span className="text-3xl font-black text-emerald-400">{studentsIn}</span>
                <button
                  onClick={() => setStudentsIn(studentsIn + 1)}
                  className="w-12 h-12 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-lg flex items-center justify-center transition-colors shadow-lg shadow-emerald-600/30"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* STUDENTS GOT OUT */}
            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center justify-between">
                <span>Students Got Out</span>
                <span>[ − ]</span>
              </span>
              <div className="flex items-center justify-between bg-slate-950 p-2 rounded-xl border border-slate-800">
                <button
                  onClick={() => setStudentsOut(Math.max(0, studentsOut - 1))}
                  className="w-12 h-12 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-lg flex items-center justify-center transition-colors"
                >
                  <Minus className="w-5 h-5" />
                </button>
                <span className="text-3xl font-black text-rose-400">{studentsOut}</span>
                <button
                  onClick={() => setStudentsOut(studentsOut + 1)}
                  className="w-12 h-12 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-lg flex items-center justify-center transition-colors shadow-lg shadow-rose-600/30"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Automatic Calculation Calculation Preview Box */}
          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 flex items-center justify-between text-xs sm:text-sm">
            <div className="text-slate-400">
              Formula Preview:
              <span className="font-mono text-slate-200 ml-2 font-bold">
                {shuttle.currentPassengers} + {studentsIn} - {studentsOut} = {calculatedPreview}
              </span>
            </div>
            {isOverflow && (
              <span className="text-rose-400 font-bold flex items-center gap-1">
                <AlertTriangle className="w-4 h-4" /> Exceeds capacity ({shuttle.capacity})
              </span>
            )}
          </div>

          {/* UPDATE PASSENGER COUNT BUTTON */}
          <button
            onClick={handlePassengerUpdate}
            disabled={isOverflow}
            className={`w-full py-4 rounded-2xl font-black text-base uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-xl ${
              isOverflow
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-600/30 active:scale-[0.99]'
            }`}
          >
            <RefreshCw className="w-5 h-5" />
            <span>UPDATE PASSENGER COUNT</span>
          </button>

          {/* Last Updated Timestamp & Location Footer */}
          <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80">
            <div>
              Last updated: <span className="text-slate-200 font-semibold">{shuttle.lastUpdated}</span>
            </div>
            <div>
              {shuttle.lastUpdatedLocation || `Updated at ${shuttle.currentStopName}`}
            </div>
          </div>
        </div>

        {/* Action Buttons: Report Delay / Report Issue */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => setShowDelayModal(true)}
            className="py-3.5 px-4 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 font-bold text-xs rounded-2xl transition-colors flex items-center justify-center gap-2"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>REPORT DELAY</span>
          </button>

          <button
            onClick={() => setShowIssueModal(true)}
            className="py-3.5 px-4 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 font-bold text-xs rounded-2xl transition-colors flex items-center justify-center gap-2"
          >
            <Wrench className="w-4 h-4" />
            <span>REPORT VEHICLE ISSUE</span>
          </button>
        </div>
      </div>

      {/* Delay Modal */}
      {showDelayModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              Report Shuttle Delay
            </h3>
            <form onSubmit={handleReportDelay} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Delay Duration (Minutes)</label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={delayMinutes}
                  onChange={(e) => setDelayMinutes(parseInt(e.target.value) || 5)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-bold"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Reason for Delay</label>
                <textarea
                  value={delayReason}
                  onChange={(e) => setDelayReason(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  placeholder="e.g. Heavy pedestrian traffic near Gate 2..."
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDelayModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl"
                >
                  Broadcast Delay Alert
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Maintenance Issue Modal */}
      {showIssueModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Wrench className="w-5 h-5 text-rose-400" />
              Report Vehicle Maintenance Issue
            </h3>
            <form onSubmit={handleReportIssue} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Issue Details</label>
                <textarea
                  value={issueText}
                  onChange={(e) => setIssueText(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  placeholder="Describe vehicle or mechanical issue..."
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowIssueModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl"
                >
                  Notify Maintenance Crew
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
