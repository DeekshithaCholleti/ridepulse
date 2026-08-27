import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Bell, Bus, MapPin, Clock, Users, AlertTriangle, Navigation, Search, Info, Loader2 } from 'lucide-react';
import { useAuth, API_URL } from '../context/AuthContext';
import { socket } from '../socket';

// Import Leaflet CSS in standard React way
import 'leaflet/dist/leaflet.css';

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

// Campus simulation route (Anurag University loop)
const simulationPath = [
  { lat: 17.4190, lng: 78.6550, name: 'Anurag Main Entrance (Gate 1)' },
  { lat: 17.4200, lng: 78.6560, name: 'Way to Engineering Block' },
  { lat: 17.4210, lng: 78.6570, name: 'Engineering & Pharmacy Block' },
  { lat: 17.4225, lng: 78.6580, name: 'Way to Hostel' },
  { lat: 17.4240, lng: 78.6585, name: 'Anurag Hostel & Sports Complex' },
  { lat: 17.4230, lng: 78.6565, name: 'Library Entrance' },
  { lat: 17.4225, lng: 78.6545, name: 'Anurag Central Library & Admin' },
  { lat: 17.4205, lng: 78.6540, name: 'Returning to Main Entrance' }
];

export default function Dashboard() {
  const { user, token, logout, getHeaders } = useAuth();
  
  // Dashboard state
  const [routes, setRoutes] = useState([]);
  const [stops, setStops] = useState([]);
  const [liveShuttles, setLiveShuttles] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // View states
  const [selectedSource, setSelectedSource] = useState('');
  const [selectedDest, setSelectedDest] = useState('');
  const [activeTab, setActiveTab] = useState('tracking'); // 'tracking', 'alerts'
  const [notificationIndex, setNotificationIndex] = useState(0);

  // Driver simulation states
  const [isSimulating, setIsSimulating] = useState(false);
  const [simIndex, setSimIndex] = useState(0);
  const [driverStatus, setDriverStatus] = useState('active');
  const [driverCrowd, setDriverCrowd] = useState('LOW');
  const [driverShuttleInfo, setDriverShuttleInfo] = useState(null);

  // Fetch initial REST data from Backend
  const fetchBackendData = async () => {
    try {
      const headers = getHeaders();

      // 1. Fetch Routes & Stops
      const routesRes = await fetch(`${API_URL}/routes`, { headers });
      if (routesRes.ok) {
        const routesData = await routesRes.json();
        setRoutes(routesData);

        // Extract unique stops across all routes
        const allStops = [];
        const seenStopIds = new Set();
        routesData.forEach(route => {
          route.stops.forEach(stop => {
            const stopId = stop._id || stop.stopName;
            if (!seenStopIds.has(stopId)) {
              seenStopIds.add(stopId);
              allStops.push({
                id: stopId,
                name: stop.stopName,
                lat: stop.latitude,
                lng: stop.longitude
              });
            }
          });
        });
        setStops(allStops);
      }

      // 2. Fetch Shuttles
      const shuttlesRes = await fetch(`${API_URL}/shuttles`, { headers });
      if (shuttlesRes.ok) {
        const shuttlesData = await shuttlesRes.json();
        const formattedShuttles = shuttlesData.map(s => {
          const sLat = s.currentLocation?.latitude || 17.4210;
          const sLng = s.currentLocation?.longitude || 78.6560;
          return {
            id: s._id,
            shuttleNumber: s.shuttleNumber,
            routeId: s.route?._id || s.route,
            routeName: s.route?.routeName || 'Unassigned Route',
            lat: sLat,
            lng: sLng,
            status: s.status,
            crowdLevel: s.crowdLevel,
            capacity: s.capacity,
            // Dynamic helpers computed locally
            eta: 'Calculating...',
            nextStop: s.route?.stops?.[0]?.stopName || 'Gate 1'
          };
        });
        setLiveShuttles(formattedShuttles);
      }

      // 3. Fetch Alerts
      const alertsRes = await fetch(`${API_URL}/alerts`, { headers });
      if (alertsRes.ok) {
        const alertsData = await alertsRes.json();
        setAlerts(alertsData);
      }

      // 4. Fetch Driver shuttle info if user is a driver
      if (user && user.role === 'driver' && user.assignedShuttle) {
        const dShuttleRes = await fetch(`${API_URL}/shuttles/${user.assignedShuttle}`, { headers });
        if (dShuttleRes.ok) {
          const dShuttleData = await dShuttleRes.json();
          setDriverShuttleInfo(dShuttleData);
          setDriverStatus(dShuttleData.status);
          setDriverCrowd(dShuttleData.crowdLevel);
        }
      }

    } catch (err) {
      console.error('Error fetching backend data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchBackendData();
    }
  }, [token, user]);

  // Connect to Sockets and register listeners
  useEffect(() => {
    socket.connect();

    // Listen for live GPS coordinate updates
    socket.on('shuttle:location', (locationData) => {
      console.log('Live location socket event:', locationData);
      setLiveShuttles(prev => prev.map(shuttle => {
        if (String(shuttle.id) === String(locationData.shuttleId)) {
          return {
            ...shuttle,
            lat: locationData.latitude,
            lng: locationData.longitude,
            updatedAt: locationData.timestamp
          };
        }
        return shuttle;
      }));
    });

    // Listen for status/crowd level updates
    socket.on('shuttle:update', (updatedShuttle) => {
      console.log('Live status socket event:', updatedShuttle);
      setLiveShuttles(prev => prev.map(shuttle => {
        if (String(shuttle.id) === String(updatedShuttle._id)) {
          return {
            ...shuttle,
            status: updatedShuttle.status,
            crowdLevel: updatedShuttle.crowdLevel
          };
        }
        return shuttle;
      }));
      // Also update driver console info if it matches the current driver's shuttle
      if (user && user.role === 'driver' && String(user.assignedShuttle) === String(updatedShuttle._id)) {
        setDriverShuttleInfo(updatedShuttle);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  // Join rooms when shuttles list becomes available
  useEffect(() => {
    if (liveShuttles.length > 0) {
      liveShuttles.forEach(shuttle => {
        socket.emit('join-shuttle', shuttle.id);
        console.log(`Socket client joined room: shuttle:${shuttle.id}`);
      });
    }
  }, [liveShuttles.map(s => s.id).join(',')]);

  // Driver GPS simulation timer
  useEffect(() => {
    let simInterval = null;
    if (isSimulating && user?.assignedShuttle) {
      simInterval = setInterval(async () => {
        const nextIndex = (simIndex + 1) % simulationPath.length;
        setSimIndex(nextIndex);
        const nextPoint = simulationPath[nextIndex];
        
        try {
          const res = await fetch(`${API_URL}/location/update`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({
              shuttleId: user.assignedShuttle,
              latitude: nextPoint.lat,
              longitude: nextPoint.lng,
              speed: 20
            })
          });
          if (!res.ok) {
            console.error('Simulation coordinate submission failed.');
          }
        } catch (err) {
          console.error('GPS simulator connection error:', err);
        }
      }, 4000);
    }
    return () => {
      if (simInterval) clearInterval(simInterval);
    };
  }, [isSimulating, simIndex, user]);

  // Floating notification cycle interval
  useEffect(() => {
    const notifInterval = setInterval(() => {
      const activeNotifications = getFloatingNotifications();
      if (activeNotifications.length > 0) {
        setNotificationIndex(prev => (prev + 1) % activeNotifications.length);
      }
    }, 8000);

    return () => clearInterval(notifInterval);
  }, [alerts]);

  // Helper: Find closest stop for dynamic popup display
  const getNextStop = (shuttle) => {
    if (!routes || routes.length === 0) return 'Gate 1';
    const matchingRoute = routes.find(r => String(r._id) === String(shuttle.routeId));
    if (!matchingRoute || !matchingRoute.stops || matchingRoute.stops.length === 0) return 'Gate 1';

    let closest = matchingRoute.stops[0];
    let minDistance = Infinity;
    matchingRoute.stops.forEach(stop => {
      const dist = Math.hypot(stop.latitude - shuttle.lat, stop.longitude - shuttle.lng);
      if (dist < minDistance) {
        minDistance = dist;
        closest = stop;
      }
    });
    return closest.stopName;
  };

  // Helper: Estimate dynamic ETA to nearest stop
  const getDynamicETA = (shuttle) => {
    if (!routes || routes.length === 0) return '5 mins';
    const matchingRoute = routes.find(r => String(r._id) === String(shuttle.routeId));
    if (!matchingRoute || !matchingRoute.stops || matchingRoute.stops.length === 0) return '5 mins';

    let minDistance = Infinity;
    matchingRoute.stops.forEach(stop => {
      const dist = Math.hypot(stop.latitude - shuttle.lat, stop.longitude - shuttle.lng);
      if (dist < minDistance) {
        minDistance = dist;
      }
    });

    const minutes = Math.max(1, Math.round(minDistance * 400));
    return minutes === 1 ? '1 min' : `${minutes} mins`;
  };

  // Helper: Fetch notifications list
  const getFloatingNotifications = () => {
    if (alerts && alerts.length > 0) {
      return alerts.map(alert => ({
        id: alert._id,
        text: alert.message,
        type: alert.type === 'emergency' ? 'warning' : 'info'
      }));
    }
    return [
      { id: 1, text: "Shuttle #RP-101 arriving at Anurag Main Entrance (Gate 1) in 3 minutes!", type: "success" },
      { id: 2, text: "Delay on Uppal-Anurag Connector near Ghatkesar Bypass.", type: "warning" },
      { id: 3, text: "Notice: Route diversion inside Anurag University campus.", type: "info" }
    ];
  };

  const getAlertTime = (alert) => {
    if (!alert.createdAt) return 'Just now';
    const date = new Date(alert.createdAt);
    const diffMins = Math.round((new Date() - date) / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} mins ago`;
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getAlertStyle = (type) => {
    switch (type) {
      case 'emergency':
        return {
          bg: 'bg-red-100 border-red-300',
          text: 'text-red-900 font-bold',
          icon: <AlertTriangle size={20} className="text-red-600 mt-0.5" />
        };
      case 'delay':
        return {
          bg: 'bg-orange-50 border-orange-100',
          text: 'text-orange-800',
          icon: <Clock size={20} className="text-orange-500 mt-0.5" />
        };
      case 'route_change':
      case 'diversion':
        return {
          bg: 'bg-yellow-50 border-yellow-100',
          text: 'text-yellow-800',
          icon: <Navigation size={20} className="text-yellow-500 mt-0.5" />
        };
      case 'unavailable':
      case 'maintenance':
        return {
          bg: 'bg-gray-100 border-gray-200',
          text: 'text-gray-700',
          icon: <AlertTriangle size={20} className="text-gray-500 mt-0.5" />
        };
      default:
        return {
          bg: 'bg-blue-50 border-blue-100',
          text: 'text-blue-800',
          icon: <Info size={20} className="text-blue-500 mt-0.5" />
        };
    }
  };

  const getCrowdColor = (level) => {
    switch(level?.toUpperCase()) {
      case 'LOW': return 'text-green-600 bg-green-100';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-100';
      case 'HIGH': return 'text-red-600 bg-red-100';
      default: return 'text-gray-500 bg-gray-100';
    }
  };

  // Driver update shuttle info handler
  const handleUpdateShuttle = async (e) => {
    e.preventDefault();
    if (!user?.assignedShuttle) return;
    try {
      const res = await fetch(`${API_URL}/shuttles/${user.assignedShuttle}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({
          status: driverStatus,
          crowdLevel: driverCrowd
        })
      });
      if (res.ok) {
        const updated = await res.json();
        setDriverShuttleInfo(updated);
        alert('Shuttle information updated successfully!');
      } else {
        const data = await res.json();
        alert(`Failed to update shuttle: ${data.message}`);
      }
    } catch (err) {
      console.error('Error updating driver shuttle:', err);
      alert('Error updating shuttle details.');
    }
  };

  // Trip planner logic
  const getPlannedTripResult = () => {
    if (!selectedSource || !selectedDest) return null;
    
    // Find a route that contains source and destination in correct order
    const matchingRoute = routes.find(route => {
      const sourceIndex = route.stops.findIndex(s => String(s._id) === String(selectedSource));
      const destIndex = route.stops.findIndex(s => String(s._id) === String(selectedDest));
      return sourceIndex !== -1 && destIndex !== -1 && sourceIndex < destIndex;
    });

    if (!matchingRoute) {
      return { error: 'No direct shuttle route found between these stops.' };
    }

    // Find shuttles running on this route
    const matchingShuttles = liveShuttles.filter(s => String(s.routeId) === String(matchingRoute._id));
    if (matchingShuttles.length === 0) {
      return { 
        routeName: matchingRoute.routeName,
        message: 'Route found, but no active shuttles are currently running on it.' 
      };
    }

    const recommendedShuttle = matchingShuttles[0];
    return {
      shuttleNumber: recommendedShuttle.shuttleNumber,
      routeName: matchingRoute.routeName,
      eta: getDynamicETA(recommendedShuttle)
    };
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col gap-4 items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-indigo-600" size={48} />
        <p className="font-semibold text-gray-600">Connecting to RidePulse services...</p>
      </div>
    );
  }

  const activeNotifications = getFloatingNotifications();

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
            <Navigation size={18} /> {user?.role === 'driver' ? 'Driver Panel' : 'Tracking'}
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
            user?.role === 'driver' ? (
              /* Driver console view */
              <div className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 shadow-sm space-y-4">
                  <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                    <Bus className="text-indigo-600" size={24} />
                    <div>
                      <h2 className="font-bold text-gray-800">Shuttle Update</h2>
                      <p className="text-xs text-gray-500">Shuttle: {driverShuttleInfo?.shuttleNumber || 'RP-101'}</p>
                    </div>
                  </div>

                  <form onSubmit={handleUpdateShuttle} className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Shuttle Status</label>
                      <select 
                        value={driverStatus} 
                        onChange={(e) => setDriverStatus(e.target.value)}
                        className="w-full mt-1 p-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 text-sm bg-white text-gray-800"
                      >
                        <option value="active">Active (On Service)</option>
                        <option value="maintenance">Under Maintenance</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Crowd Level</label>
                      <select 
                        value={driverCrowd} 
                        onChange={(e) => setDriverCrowd(e.target.value)}
                        className="w-full mt-1 p-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 text-sm bg-white text-gray-800"
                      >
                        <option value="LOW">Low Crowd</option>
                        <option value="MEDIUM">Medium Crowd</option>
                        <option value="HIGH">High Crowd</option>
                      </select>
                    </div>

                    <button 
                      type="submit" 
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-lg text-sm transition-all duration-200 shadow-sm"
                    >
                      Update Shuttle Info
                    </button>
                  </form>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-gray-800 flex items-center gap-1.5 border-b border-gray-100 pb-3">
                    <Navigation className="text-indigo-500" size={16} /> Live GPS Simulator
                  </h3>
                  <p className="text-xs text-gray-600">
                    Submit periodic location updates to simulate the shuttle moving in a loop around Anurag University campus.
                  </p>

                  {isSimulating ? (
                    <div className="space-y-3">
                      <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3 text-xs text-indigo-800 space-y-1.5">
                        <p className="font-semibold flex justify-between">
                          <span>Simulator Status:</span> <span className="animate-pulse text-green-600 font-bold">● Running</span>
                        </p>
                        <p><span>Coordinates:</span> <span className="font-mono font-medium">{simulationPath[simIndex].lat.toFixed(5)}, {simulationPath[simIndex].lng.toFixed(5)}</span></p>
                        <p className="truncate"><span>Current Stop:</span> <span className="font-medium">{simulationPath[simIndex].name}</span></p>
                      </div>
                      <button 
                        onClick={() => setIsSimulating(false)}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-lg text-sm transition-all"
                      >
                        Stop GPS Simulator
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setIsSimulating(true)}
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 rounded-lg text-sm transition-all"
                    >
                      Start GPS Simulator
                    </button>
                  )}
                </div>
              </div>
            ) : (
              /* Student/Viewer tracking view */
              <div className="space-y-6">
                {/* Route Selection / Trip Planner */}
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-sm">
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Search size={18} className="text-indigo-500" /> Plan Your Trip
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-gray-500 font-medium">Source Stop</label>
                      <select 
                        className="w-full mt-1 p-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm bg-white"
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
                        className="w-full mt-1 p-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm bg-white"
                        value={selectedDest}
                        onChange={(e) => setSelectedDest(e.target.value)}
                      >
                        <option value="">Select destination...</option>
                        {stops.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                    </div>
                  </div>
                  
                  {selectedSource && selectedDest && (() => {
                    const result = getPlannedTripResult();
                    if (!result) return null;
                    if (result.error) {
                      return (
                        <div className="mt-3 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-700">
                          {result.error}
                        </div>
                      );
                    }
                    if (result.message) {
                      return (
                        <div className="mt-3 p-3 bg-yellow-50 border border-yellow-100 rounded-lg text-sm text-yellow-700">
                          <span className="font-semibold">{result.routeName}:</span> {result.message}
                        </div>
                      );
                    }
                    return (
                      <div className="mt-3 p-3 bg-indigo-50 border border-indigo-100 rounded-lg text-sm">
                        <span className="font-semibold text-indigo-700">Relevant Shuttle:</span> Shuttle {result.shuttleNumber} (<span className="font-medium text-gray-800">{result.routeName}</span>) - ETA: <span className="font-bold text-indigo-600">{result.eta}</span>
                      </div>
                    );
                  })()}
                </div>

                {/* Active Routes Overview */}
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3">Active Routes</h3>
                  <div className="space-y-2">
                    {routes.map((route, idx) => {
                      const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500'];
                      const colorClass = colors[idx % colors.length];
                      return (
                        <div key={route._id} className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                          <div className={`w-3 h-3 rounded-full ${colorClass}`}></div>
                          <span className="text-sm font-medium text-gray-700">{route.routeName}</span>
                        </div>
                      );
                    })}
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
                            <Bus size={16} className="text-indigo-500" /> Shuttle #{shuttle.shuttleNumber}
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${getCrowdColor(shuttle.crowdLevel)}`}>
                            {shuttle.crowdLevel} Crowd
                          </span>
                        </div>
                        
                        <div className="text-sm text-gray-600 space-y-1 mt-2">
                          <div className="flex items-center gap-2">
                            <MapPin size={14} className="text-gray-400" /> Route: <span className="font-medium text-gray-800 truncate max-w-[200px]">{shuttle.routeName}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock size={14} className="text-gray-400" /> Next: <span className="font-medium text-gray-800">{getNextStop(shuttle)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Info size={14} className="text-gray-400" /> Status: <span className={`font-medium ${shuttle.status === 'active' || shuttle.status === 'On Time' ? 'text-green-600' : 'text-red-500'}`}>{shuttle.status}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock size={14} className="text-gray-400" /> ETA: <span className="font-medium text-indigo-600">{getDynamicETA(shuttle)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )
          ) : (
            /* Alerts tab view */
            <div className="space-y-4">
              {alerts.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-sm">
                  <Info className="mx-auto text-gray-300 mb-2" size={32} />
                  No alerts are currently active.
                </div>
              ) : (
                alerts.map(alert => {
                  const style = getAlertStyle(alert.type);
                  return (
                    <div key={alert._id} className={`p-4 rounded-xl border ${style.bg}`}>
                      <div className="flex items-start gap-3">
                        {style.icon}
                        <div className="flex-1">
                          <h4 className={`text-sm font-bold ${style.text}`}>{alert.title}</h4>
                          <p className={`text-xs mt-1 ${style.text}`}>
                            {alert.message}
                          </p>
                          <p className="text-[10px] text-gray-500 mt-2 font-medium">{getAlertTime(alert)}</p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Sidebar Footer Account info */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="truncate max-w-[150px]">
              <p className="text-xs font-semibold text-gray-800 truncate">{user?.name}</p>
              <p className="text-[10px] text-gray-500 capitalize truncate">{user?.role}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="text-xs text-red-600 hover:text-red-800 font-semibold px-2.5 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
          >
            Sign Out
          </button>
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
                <div className="p-1 min-w-[160px]">
                  <div className="font-bold text-indigo-700 border-b border-gray-100 pb-1 mb-2 flex justify-between">
                    <span>Shuttle #{shuttle.shuttleNumber}</span>
                  </div>
                  <div className="text-xs space-y-1 text-gray-700">
                    <p className="flex justify-between gap-2"><span className="text-gray-400">Route:</span> <span className="font-medium text-right truncate max-w-[100px]">{shuttle.routeName}</span></p>
                    <p className="flex justify-between gap-2"><span className="text-gray-400">Status:</span> <span className={`font-semibold text-right ${shuttle.status === 'active' || shuttle.status === 'On Time' ? 'text-green-600' : 'text-red-500'}`}>{shuttle.status}</span></p>
                    <p className="flex justify-between gap-2"><span className="text-gray-400">Next Stop:</span> <span className="font-medium text-right">{getNextStop(shuttle)}</span></p>
                    <p className="flex justify-between gap-2"><span className="text-gray-400">ETA:</span> <span className="font-bold text-indigo-600 text-right">{getDynamicETA(shuttle)}</span></p>
                    <p className="flex justify-between gap-2"><span className="text-gray-400">Crowd:</span> <span className={`font-semibold text-right ${shuttle.crowdLevel === 'HIGH' ? 'text-red-500' : shuttle.crowdLevel === 'MEDIUM' ? 'text-yellow-500' : 'text-green-500'}`}>{shuttle.crowdLevel}</span></p>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Floating Notification */}
        {activeNotifications.length > 0 && (
          <div className="absolute top-6 left-6 right-6 flex justify-center z-[400] pointer-events-none">
            <div className="bg-white/95 backdrop-blur-md shadow-lg rounded-full px-6 py-3 border border-indigo-100 flex items-center gap-3 animate-bounce transition-all duration-500">
              {activeNotifications[notificationIndex].type === 'success' && (
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
                </span>
              )}
              {activeNotifications[notificationIndex].type === 'warning' && (
                <AlertTriangle size={16} className="text-orange-500 animate-pulse" />
              )}
              {activeNotifications[notificationIndex].type === 'info' && (
                <Navigation size={16} className="text-indigo-500" />
              )}
              <span className="text-sm font-semibold text-gray-800">
                {activeNotifications[notificationIndex].text}
              </span>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
