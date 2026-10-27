import React from 'react';
import { AlertTriangle, Radio, User, Shield } from 'lucide-react';

export default function Header({
  userRole = 'admin',
  onRoleToggle = () => {},
  onOpenReportModal = () => {},
  apiConnected = true,
}) {
  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between shadow-sm">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
          <Radio className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Flood Casting
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Emergency Evacuation System
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        {/* API Status */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <div className={`w-2 h-2 rounded-full ${apiConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
            {apiConnected ? 'Online' : 'Offline'}
          </span>
        </div>

        {/* Role Toggle */}
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
          <button
            onClick={() => onRoleToggle('user')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
              userRole === 'user'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <User className="w-4 h-4" />
            Civilian
          </button>
          <button
            onClick={() => onRoleToggle('admin')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
              userRole === 'admin'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Shield className="w-4 h-4" />
            Admin
          </button>
        </div>

        {/* Report Button */}
        <button
          onClick={onOpenReportModal}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors shadow-sm"
        >
          <AlertTriangle className="w-4 h-4" />
          <span className="hidden sm:inline">Report Disaster</span>
        </button>
      </div>
    </header>
  );
}
