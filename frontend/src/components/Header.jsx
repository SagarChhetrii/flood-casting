import React from 'react';
import { AlertTriangle, Menu, Radio, User, Shield, Wifi, WifiOff } from 'lucide-react';

export default function Header({
  userRole = 'admin',
  onRoleToggle = () => {},
  onOpenReportModal = () => {},
  apiConnected = false,
  activeTab = 'analysis',
  pendingDisastersCount = 0,
  activeRoutingMode = 'offline',
  isSyncing = false,
  onToggleMobileMenu = () => {},
}) {
  const pageTitles = {
    overview: ['PRAVAHA-X Overview', 'Decision support for urban flood preparedness'],
    analysis: ['Route Analysis', 'Risk-aware evacuation planning'],
    disasters: ['Incident Command', 'Review hazards and coordinate alerts'],
    closures: ['Road Closures', 'Monitor and simulate network disruption'],
    health: ['System Health', 'Backend readiness and recovery indicators'],
  };
  const [title, subtitle] = pageTitles[activeTab] || pageTitles.analysis;

  return (
    <header className="app-header">
      <div className="flex min-w-0 items-center gap-3">
        <button
          onClick={onToggleMobileMenu}
          className="icon-button md:hidden"
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="brand-mark">
          <Radio className="h-5 w-5 text-white" />
        </div>
        <div className="min-w-0">
          <p className="eyebrow text-sky-300">PRAVAHA-X / CHENNAI</p>
          <h1 className="truncate text-base font-bold text-white">{title}</h1>
          <p className="hidden truncate text-xs text-slate-400 sm:block">{subtitle}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <div className={`connection-pill ${apiConnected ? 'connection-pill-live' : 'connection-pill-offline'}`}>
          {apiConnected ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
          <span>{apiConnected ? 'Backend live' : 'Offline mode'}</span>
          <span className="hidden text-slate-500 sm:inline">· {activeRoutingMode}</span>
          {isSyncing && <span className="ml-1 animate-pulse text-sky-300">syncing</span>}
        </div>

        <div className="hidden items-center gap-2 text-xs text-slate-400 lg:flex">
          <span className="status-dot status-dot-amber" />
          {pendingDisastersCount} pending review
        </div>

        <div className="role-switcher">
          <button
            onClick={() => onRoleToggle('user')}
            className={userRole === 'user' ? 'role-button role-button-user-active' : 'role-button'}
            aria-label="Use civilian mode"
          >
            <User className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Civilian</span>
          </button>
          <button
            onClick={() => onRoleToggle('admin')}
            className={userRole === 'admin' ? 'role-button role-button-admin-active' : 'role-button'}
            aria-label="Use administrator mode"
          >
            <Shield className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Admin</span>
          </button>
        </div>

        <button onClick={onOpenReportModal} className="primary-action">
          <AlertTriangle className="h-4 w-4" />
          <span className="hidden sm:inline">Report hazard</span>
          <span className="sm:hidden">Report</span>
        </button>
      </div>
    </header>
  );
}
