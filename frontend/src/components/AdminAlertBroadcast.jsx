import React, { useState } from 'react';
import { Radio, Send, Users, MapPin, AlertTriangle } from 'lucide-react';

/**
 * Admin Alert Broadcast Panel
 * Allows admins to send evacuation alerts to affected areas
 */
export default function AdminAlertBroadcast({ disasters, onBroadcastAlert }) {
  const [selectedDisaster, setSelectedDisaster] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [estimatedAffected, setEstimatedAffected] = useState(0);
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  const activeDisasters = disasters.filter(d => d.status === 'ACTIVE');

  const handleBroadcast = async () => {
    if (!selectedDisaster) {
      alert('Please select a disaster to broadcast alert for');
      return;
    }

    setIsBroadcasting(true);

    const disaster = activeDisasters.find(d => d.id === selectedDisaster);

    // Simulate broadcast
    await new Promise(resolve => setTimeout(resolve, 1500));

    if (onBroadcastAlert) {
      onBroadcastAlert({
        disaster,
        message: customMessage || disaster.description,
        timestamp: new Date().toISOString(),
        affected_count: estimatedAffected || disaster.people_count
      });
    }

    setIsBroadcasting(false);
    setCustomMessage('');
    alert(`✓ Alert broadcast sent to ${estimatedAffected || disaster.people_count || 'affected'} users in ${disaster.affected_area}`);
  };

  if (activeDisasters.length === 0) {
    return (
      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 text-center">
        <Radio className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600 dark:text-gray-400">
          No active disasters. Broadcast system on standby.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 pb-3 border-b border-gray-200 dark:border-gray-700">
        <Radio className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Emergency Alert Broadcast
        </h2>
      </div>

      {/* Disaster Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Select Active Disaster
        </label>
        <select
          value={selectedDisaster}
          onChange={(e) => {
            setSelectedDisaster(e.target.value);
            const disaster = activeDisasters.find(d => d.id === e.target.value);
            if (disaster) {
              setEstimatedAffected(disaster.people_count || 0);
            }
          }}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
        >
          <option value="">-- Select Disaster --</option>
          {activeDisasters.map(disaster => (
            <option key={disaster.id} value={disaster.id}>
              {disaster.disaster_type} - {disaster.affected_area} (Severity: {(disaster.intensity * 100).toFixed(0)}%)
            </option>
          ))}
        </select>
      </div>

      {/* Selected Disaster Info */}
      {selectedDisaster && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 space-y-2">
          {(() => {
            const disaster = activeDisasters.find(d => d.id === selectedDisaster);
            return (
              <>
                <div className="flex items-center gap-2 text-red-800 dark:text-red-200">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="font-bold">{disaster.disaster_type?.toUpperCase()}</span>
                </div>
                <p className="text-sm text-red-700 dark:text-red-300">{disaster.description}</p>
                <div className="flex items-center gap-4 text-sm text-red-600 dark:text-red-400">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{disaster.affected_area}</span>
                  </div>
                  {disaster.people_count > 0 && (
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{disaster.people_count} people</span>
                    </div>
                  )}
                </div>
              </>
            );
          })()}
        </div>
      )}

      {/* Custom Message */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Custom Alert Message (Optional)
        </label>
        <textarea
          value={customMessage}
          onChange={(e) => setCustomMessage(e.target.value)}
          placeholder="Enter additional instructions for evacuation..."
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      {/* Estimated Affected Users */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Estimated Affected Users
        </label>
        <input
          type="number"
          value={estimatedAffected}
          onChange={(e) => setEstimatedAffected(parseInt(e.target.value) || 0)}
          min="0"
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Broadcast Button */}
      <button
        onClick={handleBroadcast}
        disabled={!selectedDisaster || isBroadcasting}
        className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:cursor-not-allowed"
      >
        {isBroadcasting ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            Broadcasting...
          </>
        ) : (
          <>
            <Send className="w-5 h-5" />
            Broadcast Evacuation Alert
          </>
        )}
      </button>

      {/* Warning Note */}
      <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
        Alert will be sent via browser notifications, SMS, and in-app notifications to all users in the affected area.
      </p>
    </div>
  );
}
