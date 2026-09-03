import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ShuttleProvider } from './context/ShuttleContext';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { StudentDashboard } from './components/StudentDashboard';
import { CampusMap } from './components/CampusMap';
import { DriverDashboard } from './components/DriverDashboard';
import { DriverLoginPage } from './components/DriverLoginPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { RoutesView } from './components/RoutesView';
import { AlertsView } from './components/AlertsView';
import { Bus } from 'lucide-react';

const StudentLayout: React.FC<{ children: React.ReactNode; tab: string }> = ({ children, tab }) => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Main Navbar */}
      <Navbar activeTab={tab} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800/80 py-6 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
              <Bus className="w-3.5 h-3.5" />
            </div>
            <span className="font-extrabold text-white">RidePulse Transit System</span>
            <span className="text-slate-500">| Simulated GPS Campus Shuttle Network</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span>Latitude: 17.450000 • Longitude: 78.380000</span>
            <span className="text-slate-600">•</span>
            <span>SH-101 • SH-102 • SH-103</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ShuttleProvider>
          <Routes>
            {/* Student View Routes */}
            <Route
              path="/"
              element={
                <StudentLayout tab="dashboard">
                  <StudentDashboard />
                </StudentLayout>
              }
            />
            <Route
              path="/map"
              element={
                <StudentLayout tab="map">
                  <div className="h-[calc(100vh-140px)] w-full py-2">
                    <CampusMap />
                  </div>
                </StudentLayout>
              }
            />
            <Route
              path="/routes"
              element={
                <StudentLayout tab="routes">
                  <RoutesView />
                </StudentLayout>
              }
            />
            <Route
              path="/alerts"
              element={
                <StudentLayout tab="alerts">
                  <AlertsView />
                </StudentLayout>
              }
            />

            {/* Public Driver Login Route */}
            <Route path="/driver/login" element={<DriverLoginPage />} />

            {/* Protected Driver Panel Route */}
            <Route
              path="/driver"
              element={
                <ProtectedRoute>
                  <DriverDashboard />
                </ProtectedRoute>
              }
            />

            {/* Fallback Catch-All Route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ShuttleProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
