import React, { useState, useEffect } from 'react';
import { AlertTriangle, Bell, Navigation, X, Users, MapPin } from 'lucide-react';

/**
 * Evacuation Alert System Component
 * Broadcasts alerts to users in danger zones and shows evacuation routes
 */
export default function EvacuationAlertSystem({
  disasters,
  onAlertBroadcast,
  userLocation,
  evacuationRoute,
  onRequestRoute
}) {
  const [activeAlerts, setActiveAlerts] = useState([]);
  const [notificationPermission, setNotificationPermission] = useState('default');
  const [showAlertPanel, setShowAlertPanel] = useState(false);

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window) {
      Notification.requestPermission().then(permission => {
        setNotificationPermission(permission);
      });
    }
  }, []);

  // Monitor active disasters and trigger alerts
  useEffect(() => {
    const activeDisasters = disasters.filter(d => d.status === 'ACTIVE');

    activeDisasters.forEach(disaster => {
      // Check if user is in danger zone (simplified - within affected area)
      const isDangerZone = checkIfInDangerZone(userLocation, disaster);

      if (isDangerZone) {
        triggerEvacuationAlert(disaster);
      }
    });

    setActiveAlerts(activeDisasters);
  }, [disasters, userLocation]);

  const checkIfInDangerZone = (userLoc, disaster) => {
    // Simplified danger zone check
    // In production, this would use geofencing with actual coordinates
    if (!userLoc || !disaster.affected_area) return false;

    // For demo: check if disaster affects user's area
    return disaster.intensity > 0.6; // High intensity disasters affect wider areas
  };

  const triggerEvacuationAlert = (disaster) => {
    // Browser notification
    if (notificationPermission === 'granted') {
      new Notification('🚨 EVACUATION ALERT', {
        body: `${disaster.disaster_type}: ${disaster.description}. Check evacuation route immediately.`,
        icon: '/alert-icon.png',
        badge: '/badge-icon.png',
        requireInteraction: true,
        tag: `disaster-${disaster.id}`
      });
    }

    // Audio alert
    playAlertSound();

    // Show alert panel
    setShowAlertPanel(true);
  };

  const playAlertSound = () => {
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIFWm98OScTgwOUKfl7bVkHAU2kdfy0HotBSJ1xu/gkUELElyx6OyrWBUIRp/h8r9sIQYqgc/y2Yk3CBVpvfDknE4MDlCn5e21ZBwENI/U8NF8LgUhc8Tv4pJCCw9br+jur1sXB0ed4fK/bSMGKIDO8tiJNggTaLzx5Z5PDA9Rp+Xtt2UdBTOP1PDQfC4GIG/D7+GTRAsPWKzn7bBdGAZGnOLzwW4kByla');
      audio.play().catch(() => {}); // Ignore if audio fails
    } catch (e) {
      console.log('Audio alert not available');
    }
  };

  const handleDismissAlert = (alertId) => {
    setActiveAlerts(prev => prev.filter(a => a.id !== alertId));
    if (activeAlerts.length <= 1) {
      setShowAlertPanel(false);
    }
  };

  if (activeAlerts.length === 0) return null;

  return (
    <>
      {/* Floating Alert Badge */}
      <button
        onClick={() => setShowAlertPanel(!showAlertPanel)}
        className="fixed top-20 right-4 z-50 bg-red-600 text-white p-4 rounded-full shadow-2xl animate-pulse hover:bg-red-700 transition-all"
        title="Active evacuation alerts"
      >
        <Bell className="w-6 h-6" />
        <span className="absolute -top-2 -right-2 bg-yellow-400 text-red-900 text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
          {activeAlerts.length}
        </span>
      </button>

      {/* Alert Panel */}
      {showAlertPanel && (
        <div className="fixed top-24 right-4 z-50 w-96 max-h-[600px] bg-white dark:bg-gray-800 rounded-lg shadow-2xl border-2 border-red-500 overflow-hidden">
          {/* Header */}
          <div className="bg-red-600 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 animate-pulse" />
              <h2 className="font-bold text-lg">EVACUATION ALERTS</h2>
            </div>
            <button
              onClick={() => setShowAlertPanel(false)}
              className="hover:bg-red-700 p-1 rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Alert List */}
          <div className="overflow-y-auto max-h-[500px] p-4 space-y-3">
            {activeAlerts.map(alert => (
              <div
                key={alert.id}
                className="bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-700 rounded-lg p-4 space-y-3"
              >
                {/* Alert Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                    <div>
                      <h3 className="font-bold text-red-900 dark:text-red-100">
                        {alert.disaster_type?.toUpperCase()}
                      </h3>
                      <p className="text-sm text-red-700 dark:text-red-300">
                        Severity: {(alert.intensity * 100).toFixed(0)}%
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDismissAlert(alert.id)}
                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Alert Description */}
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {alert.description}
                </p>

                {/* Affected Area */}
                {alert.affected_area && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <MapPin className="w-4 h-4" />
                    <span>Area: {alert.affected_area}</span>
                  </div>
                )}

                {/* People Count */}
                {alert.people_count && alert.people_count > 0 && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Users className="w-4 h-4" />
                    <span>{alert.people_count} people affected</span>
                  </div>
                )}

                {/* Evacuation Action Button */}
                <button
                  onClick={() => onRequestRoute && onRequestRoute(alert)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  <Navigation className="w-4 h-4" />
                  Show Evacuation Route
                </button>

                {/* Route Preview */}
                {evacuationRoute && (
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-300 dark:border-green-700 rounded p-3 text-sm">
                    <p className="font-bold text-green-800 dark:text-green-200 mb-1">
                      ✓ Evacuation Route Ready
                    </p>
                    <p className="text-green-700 dark:text-green-300">
                      Distance: {evacuationRoute.total_distance?.toFixed(2)} km
                    </p>
                    <p className="text-green-700 dark:text-green-300">
                      Safety Score: {(evacuationRoute.safety_score * 100)?.toFixed(0)}%
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Footer Instructions */}
          <div className="bg-gray-100 dark:bg-gray-900 p-3 text-xs text-gray-600 dark:text-gray-400 border-t border-gray-300 dark:border-gray-700">
            <p>⚠️ Follow evacuation routes immediately. Stay calm and help others.</p>
          </div>
        </div>
      )}
    </>
  );
}
