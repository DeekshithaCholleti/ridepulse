import React, { useState } from 'react';
import { useShuttles } from '../context/ShuttleContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
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
  LogOut,
  UserCheck,
  Play,
  Pause,
  Radio,
} from 'lucide-react';

export const DriverDashboard: React.FC = () => {
  const {
    shuttles,
    selectedShuttleId,
    setSelectedShuttleId,
    updateShuttleStatus,
    updatePassengers,
    reportDelay,
    reportIssue,
  } = useShuttles();

  const { driverUser, logout } = useAuth();
  const navigate = useNavigate();

  // Active driver shuttle
  const shuttle = shuttles.find((s) => s.id === selectedShuttleId) || shuttles[0];

  // Driver counter states
  const [studentsIn, setStudentsIn] = useState<number>(0);
  const [studentsOut, setStudentsOut] = useState<number>(0);

  const isOffService = shuttle.status === 'OFF_SERVICE';

  // Toggle Shuttle Trip Status (Active ON_TIME vs OFF_SERVICE)
  const handleToggleTripStatus = () => {
    if (isOffService) {
      updateShuttleStatus(shuttle.id, 'ON_TIME');
      setFeedback({
        type: 'success',
        message: `${shuttle.shuttleNumber} trip started. Shuttle is now Active & In-Service.`,
      });
    } else {
      updateShuttleStatus(shuttle.id, 'OFF_SERVICE');
      setFeedback({
        type: 'error',
        message: `${shuttle.shuttleNumber} trip ended. Shuttle is now Off-Service.`,
      });
    }
    setTimeout(() => setFeedback(null), 4000);
  };

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

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

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
      {/* Top Driver Terminal Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-white text-lg">
                {driverUser?.name || 'Driver Terminal'}
              </span>
              <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Authenticated
              </span>
            </div>
            <p className="text-xs text-slate-400">{driverUser?.email || 'driver@gmail.com'}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Trip Status Toggle (Active vs Off-Service) */}
          <button
            onClick={handleToggleTripStatus}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all border flex items-center gap-1.5 ${
              !isOffService
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20'
            }`}
          >
            {!isOffService ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>End Trip (Set Off-Service)</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>Start Trip (Set Active)</span>
              </>
            )}
          </button>

          {/* LOGOUT BUTTON */}
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/30 font-extrabold text-xs rounded-xl transition-all flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Operational Card */}
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

          <div className="flex items-center gap-4">
            {/* Shuttle Switcher selector */}
            <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
              <label className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
                Assigned Shuttle
              </label>
              <select
                value={shuttle.id}
                onChange={(e) => setSelectedShuttleId(e.target.value)}
                className="bg-slate-900 text-white font-bold text-xs px-2.5 py-1 rounded-lg border border-slate-700 focus:outline-none"
              >
                {shuttles.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.shuttleNumber} — {s.routeName}
                  </option>
                ))}
              </select>
            </div>

            <div className="text-right hidden sm:block">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                GPS Device Status
              </span>
              <span className="font-bold text-xs text-emerald-400 flex items-center gap-1">
                <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-400" /> Receiving Live GPS
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
                Current Stop Location
              </span>
              <p className="font-bold text-white text-sm">{shuttle.currentStopName}</p>
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center gap-3">
            <Clock className="w-5 h-5 text-blue-400" />
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Next En-Route Stop</span>
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
                <span>Passengers Boarded</span>
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
                <span>Passengers Exited</span>
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

          {/* Formula Preview Box */}
          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 flex items-center justify-between text-xs sm:text-sm">
            <div className="text-slate-400">
              Updated Total Calculation:
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
            <span>REPORT SHUTTLE DELAY</span>
          </button>

          <button
            onClick={() => setShowIssueModal(true)}
            className="py-3.5 px-4 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 font-bold text-xs rounded-2xl transition-colors flex items-center justify-center gap-2"
          >
            <Wrench className="w-4 h-4" />
            <span>REPORT VEHICLE MAINTENANCE</span>
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
                  placeholder="e.g. Heavy traffic near Gate 2..."
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
                  placeholder="Describe vehicle issue..."
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
