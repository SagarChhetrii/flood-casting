import React from 'react';
import { Activity, AlertTriangle, BarChart3, ChevronLeft, ChevronRight, LayoutDashboard, ShieldCheck, X } from 'lucide-react';

const navIcons = {
  overview: LayoutDashboard,
  analysis: BarChart3,
  disasters: AlertTriangle,
  closures: ShieldCheck,
  health: Activity,
};

export function Sidebar({
  activeTab = 'analysis',
  onTabChange,
  pendingDisastersCount = 0,
  userRole = 'admin',
  isCollapsed = false,
  onToggleCollapse,
  isMobileOpen = false,
  onCloseMobile = () => { },
}) {
  const navItems = [
    { id: 'overview', label: 'PRAVAHA-X Overview', icon: 'dashboard' },
    { id: 'analysis', label: 'Route Analysis', icon: 'analytics' },
    { id: 'disasters', label: 'Disaster Manager', icon: 'warning', badge: pendingDisastersCount },
    { id: 'closures', label: 'Road Closures', icon: 'block' },
    { id: 'health', label: 'System Health', icon: 'health_metrics' },
  ];

  return (
    <>
      {/* Mobile Slide-Over Overlay Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-xs" onClick={onCloseMobile} />
          <nav className="relative flex h-full w-72 flex-col border-r border-slate-800 bg-slate-950 p-4 text-slate-100 shadow-2xl animate-fade-in">
            {/* Header */}
            <div className="flex justify-between items-center pb-4 border-b border-outline-variant mb-4">
              <div>
                <h2 className="text-sm font-bold">Command Center</h2>
                <p className="text-xs text-slate-500">Chennai flood operations</p>
              </div>
              <button
                onClick={onCloseMobile}
                className="p-1 rounded-full text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Nav Items */}
            <div className="flex-1 flex flex-col gap-2">
              {navItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={`mobile-${item.id}`}
                    onClick={() => {
                      onTabChange(item.id);
                      onCloseMobile();
                    }}
                    className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold transition-all ${isActive
                        ? 'bg-sky-500/15 text-sky-300'
                        : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      {React.createElement(navIcons[item.id], { className: 'h-5 w-5' })}
                      <span>{item.label}</span>
                    </div>
                    {item.badge > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-500 text-black text-xs font-extrabold">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Role Footer */}
            <div className="mt-auto border-t border-slate-800 pt-4 text-xs text-slate-500">
              <span className="font-semibold block">Active Mode:</span>
              <span className="mt-0.5 block font-bold capitalize text-slate-200">
                {userRole === 'admin' ? 'Administrator' : 'Civilian / Responder'}
              </span>
            </div>
          </nav>
        </div>
      )}

      {/* Desktop Sidebar Navigation */}
      <nav
        className={`fixed left-0 top-0 z-30 hidden h-full flex-col border-r border-slate-800 bg-slate-950 pt-16 text-slate-100 shadow-xl transition-all duration-300 md:flex ${isCollapsed ? 'w-16' : 'w-60'
          }`}
      >
        {/* Brand Header & Toggle */}
        <div className={`border-b border-slate-800 py-4 ${isCollapsed ? 'flex justify-center px-2' : 'flex items-center justify-between px-4'}`}>
          {!isCollapsed && (
            <div className="overflow-hidden">
              <h2 className="truncate text-xs font-bold tracking-tight">COMMAND CENTER</h2>
              <p className="mt-1 truncate text-[10px] text-slate-500">Chennai · operational view</p>
            </div>
          )}
          <button
            onClick={onToggleCollapse}
            className="rounded-lg p-1 text-slate-500 transition-colors hover:bg-slate-900 hover:text-white"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        {/* Nav Links */}
        <div className="flex flex-1 flex-col gap-1.5 overflow-y-auto px-3 py-5">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange && onTabChange(item.id)}
                title={isCollapsed ? item.label : undefined}
                className={`flex items-center rounded-xl py-2.5 text-left text-xs font-semibold transition-all duration-150 active:scale-[0.98] ${isCollapsed ? 'justify-center px-0' : 'justify-between px-3'
                  } ${isActive
                    ? 'bg-sky-500/15 font-bold text-sky-300 shadow-sm'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                  }`}
              >
                <div className="flex items-center gap-2.5 relative">
                  {React.createElement(navIcons[item.id], { className: 'h-[18px] w-[18px] shrink-0' })}
                  {!isCollapsed && <span className="text-xs truncate">{item.label}</span>}

                  {/* Badge for Collapsed View */}
                  {isCollapsed && item.badge > 0 && (
                    <span className="absolute -right-1 -top-1 h-2.5 w-2.5 animate-pulse rounded-full border border-slate-950 bg-amber-400" />
                  )}
                </div>

                {!isCollapsed && item.badge > 0 && (
                  <span className="animate-pulse rounded-full bg-amber-400 px-1.5 py-0.5 text-[10px] font-extrabold text-slate-950">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer / Active Role Indicator */}
        <div className={`mt-auto border-t border-slate-800 pt-4 ${isCollapsed ? 'px-1 text-center' : 'px-3'}`}>
          {!isCollapsed ? (
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-3 text-xs text-slate-400">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Active mode</span>
              <span className="mt-1 block truncate text-xs font-semibold capitalize text-slate-200">
                {userRole === 'admin' ? 'Administrator (Full Access)' : 'Civilian / Responder'}
              </span>
            </div>
          ) : (
            <div className="flex justify-center rounded-lg border border-slate-800 bg-slate-900 p-2 text-sky-300" title={`Active Mode: ${userRole === 'admin' ? 'Administrator' : 'Civilian'}`}>
              {userRole === 'admin' ? <ShieldCheck className="h-4 w-4" /> : <Activity className="h-4 w-4" />}
            </div>
          )}
        </div>
      </nav>
    </>
  );
}

export default Sidebar;
