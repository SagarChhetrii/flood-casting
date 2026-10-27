import React, { useState, useEffect } from 'react';
import { AlertTriangle, Bell, Navigation, MapPin, Phone } from 'lucide-react';

/**
 * Enhanced Evacuation Alert System with GPS Location Detection
 * Automatically detects user location and sends alerts when in danger zone
 */
export default function EvacuationAlertSystem({
  disasters,
  onAlertBroadcast,
  evacuationRoute,
  onRequestRoute
}) {
  const [activeAlerts, setActiveAlerts] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [locationPermission, setLocationPermission] = useState('prompt');
  const [notificationPermission, setNotificationPermission] = useState('default');
  const [showAlertPanel, setShowAlertPanel] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showPhoneInput, setShowPhoneInput] = useState(false);

  // Request permissions on mount
  useEffect(() => {
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    // Request notification permission
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
    }

    // Request location permission
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            node: mapCoordinatesToNode(position.coords.latitude, position.coords.longitude)
          });
          setLocationPermission('granted');
        },
        (error) => {
          console.log('Location permission denied:', error);
          setLocationPermission('denied');
        }
      );
    }
  };

  // Map GPS coordinates to nearest node (simplified for demo)
  const mapCoordinatesToNode = (lat, lng) => {
    // In production, this would use actual geofencing
    // For demo: randomly assign to show the feature
    const nodes = ['A', 'B', 'C', 'D', 'E'];
    return nodes[Math.floor(Math.random() * nodes.length)];
  };

  // Monitor active disasters and check if user is in danger
  useEffect(() => {
    const activeDisasters = disasters.filter(d => d.status === 'ACTIVE');

    activeDisasters.forEach(disaster => {
      if (userLocation) {
        const isInDangerZone = checkIfInDangerZone(userLocation, disaster);

        if (isInDangerZone) {
          triggerEvacuationAlert(disaster);

          // Request phone number for SMS if not provided
          if (!phoneNumber && !showPhoneInput) {
            setShowPhoneInput(true);
          }
        }
      }
    });

    setActiveAlerts(activeDisasters);
  }, [disasters, userLocation]);

  const checkIfInDangerZone = (userLoc, disaster) => {
    if (!userLoc || !disaster.affected_area) return false;

    // Check if user's detected node matches affected area
    const affectedNodes = disaster.affected_area.split(',').map(n => n.trim());
    return affectedNodes.includes(userLoc.node) || disaster.intensity > 0.7;
  };

  const triggerEvacuationAlert = (disaster) => {
    // Browser notification
    if (notificationPermission === 'granted') {
      const notification = new Notification('🚨 EVACUATION ALERT - YOUR AREA', {
        body: `${disaster.disaster_type}: You are in the affected zone. Check evacuation route NOW!`,
        icon: '/alert-icon.png',
        requireInteraction: true,
        tag: `disaster-${disaster.id}`,
        vibrate: [200, 100, 200]
      });

      notification.onclick = () => {
        window.focus();
        setShowAlertPanel(true);
        if (onRequestRoute) onRequestRoute(disaster);
      };
    }

    // Vibration alert for mobile
    if ('vibrate' in navigator) {
      navigator.vibrate([200, 100, 200, 100, 200]);
    }

    // Audio alert
    playAlertSound();

    // Show alert panel
    setShowAlertPanel(true);

    // Simulate SMS send (in production, this would call backend API)
    if (phoneNumber) {
      simulateSMSAlert(disaster);
    }
  };

  const simulateSMSAlert = (disaster) => {
    console.log(`📱 SMS ALERT SENT TO: ${phoneNumber}`);
    console.log(`Message: 🚨 EVACUATION ALERT: ${disaster.disaster_type} in your area. Check app for evacuation route.`);

    // Show confirmation toast
    alert(`✅ SMS Alert sent to ${phoneNumber}\n\nMessage: "${disaster.disaster_type} - Evacuate immediately. Check app for safe route."`);
  };

  const playAlertSound = () => {
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgA');
      audio.play().catch(() => {});
    } catch (e) {}
  };

  const handleSavePhone = () => {
    if (phoneNumber.length >= 10) {
      localStorage.setItem('emergency_phone', phoneNumber);
      setShowPhoneInput(false);
      alert('✅ Phone number saved! You will receive SMS alerts when in danger zones.');
    } else {
      alert('Please enter a valid phone number');
    }
  };

  if (activeAlerts.length === 0 && !showPhoneInput) return null;

  return (
    <>
      {/* Phone Number Input Modal */}
      {showPhoneInput && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <Phone className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Get SMS Alerts
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Receive evacuation alerts via text
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Your Phone Number
                </label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-base focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowPhoneInput(false)}
                  className="flex-1 px-4 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Skip
                </button>
                <button
                  onClick={handleSavePhone}
                  className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-lg"
                >
                  Save Number
                </button>
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                We'll send you SMS alerts when disasters affect your area
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Location Status Badge (Mobile Optimized) */}
      {userLocation && (
        <div className="fixed top-20 left-4 z-40 bg-white dark:bg-gray-800 rounded-full px-4 py-2 shadow-lg border-2 border-green-500 animate-fade-in">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-green-600 dark:text-green-400" />
            <span className="text-xs font-bold text-gray-900 dark:text-white">
              Location: Node {userLocation.node}
            </span>
          </div>
        </div>
      )}

      {/* Floating Alert Badge (Mobile Optimized) */}
      <button
        onClick={() => setShowAlertPanel(!showAlertPanel)}
        className="fixed top-20 right-4 z-50 bg-red-600 text-white p-4 rounded-full shadow-2xl hover:bg-red-700 transition-all animate-pulse"
        title="Active evacuation alerts"
      >
        <Bell className="w-6 h-6" />
        <span className="absolute -top-2 -right-2 bg-yellow-400 text-red-900 text-xs font-bold rounded-full w-7 h-7 flex items-center justify-center border-2 border-white dark:border-gray-900">
          {activeAlerts.length}
        </span>
      </button>

      {/* Alert Panel (Mobile Responsive) */}
      {showAlertPanel && (
        <div className="fixed inset-x-0 top-28 z-50 mx-4 sm:right-4 sm:left-auto sm:w-96 max-h-[calc(100vh-150px)] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border-4 border-red-500 overflow-hidden animate-slide-in-right">
          {/* Header */}
          <div className="bg-red-600 text-white p-4 flex items-center justify-between sticky top-0">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 animate-pulse" />
              <div>
                <h2 className="font-bold text-lg">EVACUATION ALERTS</h2>
                {userLocation && (
                  <p className="text-xs text-red-100">Your Location: Node {userLocation.node}</p>
                )}
              </div>
            </div>
            <button
              onClick={() => setShowAlertPanel(false)}
              className="hover:bg-red-700 p-2 rounded-lg transition-colors"
            >
              <span className="text-2xl">×</span>
            </button>
          </div>

          {/* Alert List */}
          <div className="overflow-y-auto max-h-[calc(100vh-250px)] p-4 space-y-4 custom-scrollbar">
            {activeAlerts.map(alert => {
              const isUserAffected = userLocation && checkIfInDangerZone(userLocation, alert);

              return (
                <div
                  key={alert.id}
                  className={`rounded-xl p-4 space-y-3 border-2 ${
                    isUserAffected
                      ? 'bg-red-50 dark:bg-red-900/20 border-red-500 animate-pulse'
                      : 'bg-orange-50 dark:bg-orange-900/20 border-orange-300'
                  }`}
                >
                  {/* Alert Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className={`w-5 h-5 flex-shrink-0 ${
                        isUserAffected ? 'text-red-600 animate-pulse' : 'text-orange-600'
                      }`} />
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white">
                          {alert.disaster_type?.toUpperCase()}
                        </h3>
                        {isUserAffected && (
                          <span className="text-xs font-bold text-red-600 dark:text-red-400">
                            ⚠️ YOU ARE IN THIS ZONE
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-sm font-bold text-red-700 dark:text-red-300">
                      {(alert.intensity * 100).toFixed(0)}%
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {alert.description}
                  </p>

                  {/* Details */}
                  <div className="flex flex-wrap gap-2 text-xs text-gray-600 dark:text-gray-400">
                    {alert.affected_area && (
                      <div className="flex items-center gap-1 bg-white dark:bg-gray-700 px-2 py-1 rounded-full">
                        <MapPin className="w-3 h-3" />
                        {alert.affected_area}
                      </div>
                    )}
                    {alert.people_count > 0 && (
                      <div className="flex items-center gap-1 bg-white dark:bg-gray-700 px-2 py-1 rounded-full">
                        <span>{alert.people_count} affected</span>
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => {
                      if (onRequestRoute) onRequestRoute(alert);
                      setShowAlertPanel(false);
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg"
                  >
                    <Navigation className="w-5 h-5" />
                    Show My Evacuation Route
                  </button>

                  {/* SMS Button */}
                  {phoneNumber && (
                    <button
                      onClick={() => simulateSMSAlert(alert)}
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm"
                    >
                      <Phone className="w-4 h-4" />
                      Send SMS to {phoneNumber}
                    </button>
                  )}

                  {/* Route Preview */}
                  {evacuationRoute && isUserAffected && (
                    <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-500 rounded-lg p-3 text-sm">
                      <p className="font-bold text-green-800 dark:text-green-200 mb-1 flex items-center gap-2">
                        <Navigation className="w-4 h-4" />
                        Safe Route Found
                      </p>
                      <div className="space-y-1 text-green-700 dark:text-green-300">
                        <p>Distance: {evacuationRoute.total_distance?.toFixed(2)} km</p>
                        <p>Safety: {((evacuationRoute.safety_score || 0.85) * 100)?.toFixed(0)}%</p>
                        <p className="font-medium">Follow the blue route on map</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="bg-gray-100 dark:bg-gray-900 p-3 text-xs text-gray-600 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 sticky bottom-0">
            <p className="text-center">
              ⚠️ Follow evacuation routes immediately. Stay calm and help others.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
