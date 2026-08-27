import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Bell, Bus, MapPin, Clock, Users, AlertTriangle, Navigation, Search, Info } from 'lucide-react';

// Custom icons for map
const busIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3448/3448339.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const stopIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
  iconSize: [24, 24],
  iconAnchor: [12, 24],
  popupAnchor: [0, -24],
});

// Mock Data (Anurag University, Venkatapur, Ghatkesar, Medchal-Malkajgiri, Telangana 500088)
const activeRoutes = [
  { id: 1, name: 'Anurag Campus Shuttle - Route A', color: 'bg-blue-500' },
  { id: 2, name: 'Ghatkesar Station - Anurag Express', color: 'bg-green-500' },
  { id: 3, name: 'Uppal Metro - Anurag Connector', color: 'bg-purple-500' },
];

const stops = [
  { id: 1, name: 'Anurag Main Entrance (Gate 1)', lat: 17.4190, lng: 78.6550 },
  { id: 2, name: 'Engineering & Pharmacy Block', lat: 17.4210, lng: 78.6570 },
  { id: 3, name: 'Anurag Central Library & Admin', lat: 17.4225, lng: 78.6545 },
  { id: 4, name: 'Anurag Hostel & Sports Complex', lat: 17.4240, lng: 78.6585 },
];

const shuttles = [
  { id: 101, routeId: 1, routeName: 'Anurag Campus Shuttle - Route A', lat: 17.4195, lng: 78.6555, status: 'On Time', crowdLevel: 'Low', eta: '3 mins', nextStop: 'Anurag Main Entrance (Gate 1)' },
  { id: 102, routeId: 2, routeName: 'Ghatkesar Station - Anurag Express', lat: 17.4215, lng: 78.6565, status: 'On Time', crowdLevel: 'Medium', eta: '6 mins', nextStop: 'Engineering & Pharmacy Block' },
  { id: 103, routeId: 3, routeName: 'Uppal Metro - Anurag Connector', lat: 17.4230, lng: 78.6580, status: 'Delayed', crowdLevel: 'High', eta: '10 mins', nextStop: 'Anurag Hostel & Sports Complex' },
];

const alerts = [
  { id: 1, type: 'emergency', message: 'ANURAG UNIV NOTICE: Campus shuttles operating on regular schedule.', time: '5 mins ago' },
  { id: 2, type: 'delay', message: 'Uppal-Anurag Connector delayed 10 mins at Ghatkesar bypass traffic.', time: '12 mins ago' },
  { id: 3, type: 'route_change', message: 'Gate 2 route diverted via Pharmacy block due to Anurag Fest setup.', time: '30 mins ago' },
  { id: 4, type: 'unavailable', message: 'Shuttle #104 undergoing maintenance at Anurag campus depot.', time: '1 hour ago' },
  { id: 5, type: 'info', message: 'Extra shuttle runs scheduled after 5 PM for Anurag University students.', time: '2 hours ago' },
];

const floatingNotifications = [
  { id: 1, text: "Shuttle #101 arriving at Anurag Main Entrance (Gate 1) in 3 minutes!", type: "success" },
  { id: 2, text: "Delay on Uppal-Anurag Connector near Ghatkesar Bypass.", type: "warning" },
  { id: 3, text: "Notice: Route diversion inside Anurag University campus.", type: "info" }
];

export default function Dashboard() {
  const [selectedSource, setSelectedSource] = useState('');
  const [selectedDest, setSelectedDest] = useState('');
  const [activeTab, setActiveTab] = useState('tracking'); // 'tracking', 'alerts'
  const [notificationIndex, setNotificationIndex] = useState(0);
  
  // Simulation for live tracking (jiggling the bus positions slightly)
  const [liveShuttles, setLiveShuttles] = useState(shuttles);

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveShuttles(prev => prev.map(shuttle => ({
        ...shuttle,
        lat: shuttle.lat + (Math.random() - 0.5) * 0.0002,
        lng: shuttle.lng + (Math.random() - 0.5) * 0.0002
      })));
    }, 3000);

    const notifInterval = setInterval(() => {
      setNotificationIndex(prev => (prev + 1) % floatingNotifications.length);
    }, 8000);

    return () => {
      clearInterval(interval);
      clearInterval(notifInterval);
    };
  }, []);

  const getCrowdColor = (level) => {
    switch(level) {
      case 'Low': return 'text-green-500 bg-green-100';
      case 'Medium': return 'text-yellow-500 bg-yellow-100';
      case 'High': return 'text-red-500 bg-red-100';
      default: return 'text-gray-500 bg-gray-100';
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-96 bg-white shadow-xl z-10 flex flex-col h-full border-r border-gray-100">
        <div className="p-6 bg-indigo-600 text-white flex items-center gap-3">
          <Bus size={28} />
          <h1 className="text-2xl font-bold tracking-wide">RidePulse</h1>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200">
          <button 
            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 ${activeTab === 'tracking' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('tracking')}
          >
            <Navigation size={18} /> Tracking
          </button>
          <button 
            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 ${activeTab === 'alerts' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('alerts')}
          >
            <Bell size={18} /> Alerts
            {alerts.length > 0 && <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5">{alerts.length}</span>}
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === 'tracking' ? (
            <div className="space-y-6">
              {/* Route Selection */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-sm">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Search size={18} className="text-indigo-500" /> Plan Your Trip
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-500 font-medium">Source Stop</label>
                    <select 
                      className="w-full mt-1 p-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                      value={selectedSource}
                      onChange={(e) => setSelectedSource(e.target.value)}
                    >
                      <option value="">Select source...</option>
                      {stops.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 font-medium">Destination Stop</label>
                    <select 
                      className="w-full mt-1 p-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                      value={selectedDest}
                      onChange={(e) => setSelectedDest(e.target.value)}
                    >
                      <option value="">Select destination...</option>
                      {stops.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                </div>
                {selectedSource && selectedDest && (
                  <div className="mt-3 p-3 bg-indigo-50 border border-indigo-100 rounded-lg text-sm">
                    <span className="font-semibold text-indigo-700">Relevant Shuttle:</span> Shuttle #101 (<span className="font-medium text-gray-800">Anurag Campus Shuttle - Route A</span>) - ETA: <span className="font-bold text-indigo-600">3 mins</span>
                  </div>
                )}
              </div>

              {/* Active Routes Overview */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">Active Routes</h3>
                <div className="space-y-2">
                  {activeRoutes.map(route => (
                    <div key={route.id} className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                      <div className={`w-3 h-3 rounded-full ${route.color}`}></div>
                      <span className="text-sm font-medium text-gray-700">{route.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shuttle Details & ETA */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">Nearby Shuttles</h3>
                <div className="space-y-3">
                  {liveShuttles.map(shuttle => (
                    <div key={shuttle.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-bold text-gray-800 flex items-center gap-2">
                          <Bus size={16} className="text-indigo-500" /> Shuttle #{shuttle.id}
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${getCrowdColor(shuttle.crowdLevel)}`}>
                          {shuttle.crowdLevel} Crowd
                        </span>
                      </div>
                      
                      
                      <div className="text-sm text-gray-600 space-y-1 mt-2">
                        <div className="flex items-center gap-2">
                          <MapPin size={14} className="text-gray-400" /> Route: <span className="font-medium text-gray-800">{shuttle.routeName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock size={14} className="text-gray-400" /> Next: <span className="font-medium text-gray-800">{shuttle.nextStop}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Info size={14} className="text-gray-400" /> Status: <span className={`font-medium ${shuttle.status === 'On Time' ? 'text-green-600' : 'text-red-500'}`}>{shuttle.status}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock size={14} className="text-gray-400" /> ETA: <span className="font-medium text-indigo-600">{shuttle.eta}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {alerts.map(alert => {
                let bgStyle = 'bg-blue-50 border-blue-100';
                let textStyle = 'text-blue-800';
                let icon = <Info size={20} className="text-blue-500 mt-0.5" />;

                if (alert.type === 'emergency') {
                  bgStyle = 'bg-red-100 border-red-300';
                  textStyle = 'text-red-900 font-bold';
                  icon = <AlertTriangle size={20} className="text-red-600 mt-0.5" />;
                } else if (alert.type === 'delay') {
                  bgStyle = 'bg-orange-50 border-orange-100';
                  textStyle = 'text-orange-800';
                  icon = <Clock size={20} className="text-orange-500 mt-0.5" />;
                } else if (alert.type === 'route_change') {
                  bgStyle = 'bg-yellow-50 border-yellow-100';
                  textStyle = 'text-yellow-800';
                  icon = <Navigation size={20} className="text-yellow-500 mt-0.5" />;
                } else if (alert.type === 'unavailable') {
                  bgStyle = 'bg-gray-100 border-gray-200';
                  textStyle = 'text-gray-700';
                  icon = <AlertTriangle size={20} className="text-gray-500 mt-0.5" />;
                }

                return (
                  <div key={alert.id} className={`p-4 rounded-xl border ${bgStyle}`}>
                    <div className="flex items-start gap-3">
                      {icon}
                      <div>
                        <p className={`text-sm ${textStyle}`}>
                          {alert.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">{alert.time}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </aside>

      {/* Main Map Area */}
      <main className="flex-1 relative z-0">
        <MapContainer 
          center={[17.4210, 78.6560]} 
          zoom={16} 
          minZoom={10}
          maxZoom={18}
          className="w-full h-full"
          zoomControl={false}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          />

          {/* Stops */}
          {stops.map(stop => (
            <Marker key={stop.id} position={[stop.lat, stop.lng]} icon={stopIcon}>
              <Popup>
                <div className="font-semibold text-gray-800">{stop.name}</div>
              </Popup>
            </Marker>
          ))}

          {/* Live Shuttles */}
          {liveShuttles.map(shuttle => (
            <Marker key={shuttle.id} position={[shuttle.lat, shuttle.lng]} icon={busIcon}>
              <Popup className="custom-popup">
                <div className="p-1 min-w-[150px]">
                  <div className="font-bold text-indigo-700 border-b border-gray-100 pb-1 mb-2 flex justify-between">
                    <span>Shuttle #{shuttle.id}</span>
                  </div>
                  <div className="text-sm space-y-1">
                    <p className="flex justify-between"><span className="text-gray-500">Route:</span> <span className="font-medium text-right ml-2">{shuttle.routeName}</span></p>
                    <p className="flex justify-between"><span className="text-gray-500">Status:</span> <span className={`font-medium text-right ml-2 ${shuttle.status === 'On Time' ? 'text-green-600' : 'text-red-500'}`}>{shuttle.status}</span></p>
                    <p className="flex justify-between"><span className="text-gray-500">Next Stop:</span> <span className="font-medium text-right ml-2">{shuttle.nextStop}</span></p>
                    <p className="flex justify-between"><span className="text-gray-500">ETA:</span> <span className="font-medium text-indigo-600 text-right ml-2">{shuttle.eta}</span></p>
                    <p className="flex justify-between"><span className="text-gray-500">Crowd:</span> <span className={`font-medium text-right ml-2 ${shuttle.crowdLevel === 'High' ? 'text-red-500' : shuttle.crowdLevel === 'Medium' ? 'text-yellow-500' : 'text-green-500'}`}>{shuttle.crowdLevel}</span></p>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Floating Notification */}
        <div className="absolute top-6 left-6 right-6 flex justify-center z-[400] pointer-events-none">
          <div className="bg-white/95 backdrop-blur-md shadow-lg rounded-full px-6 py-3 border border-indigo-100 flex items-center gap-3 animate-bounce transition-all duration-500">
            {floatingNotifications[notificationIndex].type === 'success' && (
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
              </span>
            )}
            {floatingNotifications[notificationIndex].type === 'warning' && (
              <AlertTriangle size={16} className="text-orange-500" />
            )}
            {floatingNotifications[notificationIndex].type === 'info' && (
              <Navigation size={16} className="text-blue-500" />
            )}
            <span className="text-sm font-semibold text-gray-800">
              {floatingNotifications[notificationIndex].text}
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}
