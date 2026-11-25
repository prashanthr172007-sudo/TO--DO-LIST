import {
  CheckCircle2,
  Clock,
  LayoutDashboard,
  ListTodo,
  LogOut,
  X,
} from 'lucide-react';
import type { SidebarView, TaskStats } from '../types/task';

interface SidebarProps {
  activeView: SidebarView;
  onSelectView: (view: SidebarView) => void;
  stats: TaskStats;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  displayName: string;
  displayEmail: string;
  onOpenAccount: () => void;
  onSignOut: () => void;
  isSigningOut: boolean;
}

interface NavItem {
  id: SidebarView;
  label: string;
  icon: typeof LayoutDashboard;
  count?: number;
}

export function Sidebar({
  activeView,
  onSelectView,
  stats,
  isOpenMobile,
  onCloseMobile,
  displayName,
  displayEmail,
  onOpenAccount,
  onSignOut,
  isSigningOut,
}: SidebarProps) {
  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'all',
      label: 'All Tasks',
      icon: ListTodo,
      count: stats.total,
    },
    {
      id: 'pending',
      label: 'Pending Tasks',
      icon: Clock,
      count: stats.pending,
    },
    {
      id: 'completed',
      label: 'Completed Tasks',
      icon: CheckCircle2,
      count: stats.completed,
    },
  ];

  const handleSelect = (view: SidebarView) => {
    onSelectView(view);
    onCloseMobile();
  };

  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

  const sidebarContent = (
    <div className="flex h-full flex-col bg-slate-50/70 border-r border-slate-200/90">
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between px-5 border-b border-slate-200/80 bg-white">
        <button
          type="button"
          onClick={() => handleSelect('dashboard')}
          className="flex items-center gap-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 rounded-lg"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-blue-600 text-white shadow-xs">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M9 11l3 3L22 4" />
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
          </span>
          <span className="font-display text-[15px] font-bold tracking-tight text-slate-900 whitespace-nowrap">
            Smart Task Manager
          </span>
        </button>

        <button
          type="button"
          onClick={onCloseMobile}
          aria-label="Close navigation menu"
          className="lg:hidden flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Primary Navigation */}
      <nav aria-label="Primary Sidebar" className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
        <p className="px-3 pb-2 text-xs font-medium text-slate-500">
          Workspace
        </p>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleSelect(item.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700 font-semibold'
                  : 'text-slate-600 font-medium hover:bg-slate-100/90 hover:text-slate-900'
              }`}
            >
              <span className="flex items-center gap-3 min-w-0">
                <Icon
                  className={`h-[18px] w-[18px] shrink-0 ${
                    isActive ? 'text-indigo-600' : 'text-slate-400'
                  }`}
                />
                <span className="truncate whitespace-nowrap">{item.label}</span>
              </span>

              {typeof item.count === 'number' && (
                <span
                  className={`text-xs tabular-nums shrink-0 ${
                    isActive ? 'text-indigo-700 font-semibold' : 'text-slate-400 font-medium'
                  }`}
                >
                  {item.count}
                </span>
              )}
            </button>
          );
        })}

        {/* Compact Progress Summary */}
        <div className="pt-6 px-3">
          <div className="border-t border-slate-200/80 pt-5">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-medium text-slate-600">Completion progress</span>
              <span className="font-mono font-semibold text-slate-900 tabular-nums">
                {stats.completionRate}%
              </span>
            </div>
            <div
              className="h-2 w-full rounded-full bg-slate-200/80 overflow-hidden"
              role="progressbar"
              aria-valuenow={stats.completionRate}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Task completion progress"
            >
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-blue-600 transition-all duration-300"
                style={{ width: `${stats.completionRate}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-slate-500 tabular-nums">
              {stats.completed} of {stats.total} tasks completed
            </p>
          </div>
        </div>
      </nav>

      {/* Account & Sign Out Footer */}
      <div className="p-3 border-t border-slate-200/80 bg-white flex items-center gap-1">
        <button
          type="button"
          onClick={onOpenAccount}
          className="flex-1 min-w-0 flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700 font-display text-xs font-bold border border-indigo-100">
            {initials || 'WU'}
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900 truncate">
              {displayName}
            </p>
            <p className="text-xs text-slate-500 truncate">{displayEmail}</p>
          </div>
        </button>

        <button
          type="button"
          onClick={onSignOut}
          disabled={isSigningOut}
          title="Sign out"
          aria-label="Sign out"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600"
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:block lg:w-[260px] lg:shrink-0 lg:sticky lg:top-0 lg:h-screen">
        {sidebarContent}
      </aside>

      {/* Mobile / Tablet Slide-over Sidebar */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/35 backdrop-blur-[1px] transition-opacity"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <aside className="relative z-10 w-[280px] max-w-[85vw] h-full bg-white shadow-xl">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
