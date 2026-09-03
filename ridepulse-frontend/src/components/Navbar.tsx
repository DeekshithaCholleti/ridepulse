import React from 'react';
import { useShuttles } from '../context/ShuttleContext';
import { useAuth } from '../context/AuthContext';
import {
  Bus,
  MapPin,
  Route,
  Bell,
  KeyRound,
  UserCheck,
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

interface NavbarProps {
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab = 'dashboard', setActiveTab }) => {
  const { alerts } = useShuttles();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const activeAlertCount = alerts.filter((a) => a.active).length;

  const handleTabClick = (tab: string) => {
    if (setActiveTab) {
      setActiveTab(tab);
    }
    if (tab === 'dashboard') navigate('/');
    else if (tab === 'map') navigate('/map');
    else if (tab === 'routes') navigate('/routes');
    else if (tab === 'alerts') navigate('/alerts');
  };

  // Determine current active section from location path or prop
  const currentTab = location.pathname === '/map' 
    ? 'map' 
    : location.pathname === '/routes' 
    ? 'routes' 
    : location.pathname === '/alerts' 
    ? 'alerts' 
    : activeTab;

  return (
    <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 shadow-xl font-sans">
      {/* Top Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Live Pulse */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => handleTabClick('dashboard')}
          >
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-transform">
              <Bus className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-slate-900"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-white">
                  Ride<span className="text-blue-400">Pulse</span>
                </span>
                <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  Student View
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">Real-Time Shuttle Tracker</p>
            </div>
          </div>

          {/* Student Main Navigation Links (ONLY Dashboard, Live Map, Routes, Alerts) */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-950/60 p-1.5 rounded-xl border border-slate-800/80">
            <button
              onClick={() => handleTabClick('dashboard')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                currentTab === 'dashboard'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Bus className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => handleTabClick('map')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                currentTab === 'map'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Live Map</span>
            </button>

            <button
              onClick={() => handleTabClick('routes')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                currentTab === 'routes'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Route className="w-3.5 h-3.5" />
              <span>Routes</span>
            </button>

            <button
              onClick={() => handleTabClick('alerts')}
              className={`relative flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                currentTab === 'alerts'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Alerts</span>
              {activeAlertCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-amber-500 text-slate-950">
                  {activeAlertCount}
                </span>
              )}
            </button>
          </nav>

          {/* Right Action Controls: Driver Access */}
          <div className="flex items-center gap-3">
            {/* Secure Driver Login Button (or Driver Panel if already logged in) */}
            {isAuthenticated ? (
              <button
                onClick={() => navigate('/driver')}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/30 transition-all"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Driver Panel</span>
              </button>
            ) : (
              <button
                onClick={() => navigate('/driver/login')}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md shadow-blue-600/25 transition-all active:scale-95"
              >
                <KeyRound className="w-3.5 h-3.5 text-blue-200" />
                <span>Driver Login</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
