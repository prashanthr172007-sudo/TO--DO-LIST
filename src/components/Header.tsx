import { Menu, Plus } from 'lucide-react';
import type { SidebarView } from '../types/task';

interface HeaderProps {
  activeView: SidebarView;
  onOpenMobileSidebar: () => void;
  onOpenAddTask: () => void;
}

const VIEW_LABELS: Record<SidebarView, string> = {
  dashboard: 'Dashboard',
  all: 'All Tasks',
  pending: 'Pending Tasks',
  completed: 'Completed Tasks',
};

export function Header({
  activeView,
  onOpenMobileSidebar,
  onOpenAddTask,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-sm border-b border-slate-200/90 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          aria-label="Open navigation menu"
          className="lg:hidden flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2 text-sm min-w-0">
          <span className="hidden sm:inline text-slate-500 whitespace-nowrap shrink-0">
            Smart Task Manager
          </span>
          <span className="hidden sm:inline text-slate-300" aria-hidden="true">
            /
          </span>
          <h1 className="font-display text-base sm:text-lg font-bold text-slate-900 truncate">
            {VIEW_LABELS[activeView]}
          </h1>
        </div>
      </div>

      <button
        type="button"
        onClick={onOpenAddTask}
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs hover:from-indigo-700 hover:to-blue-700 active:scale-[0.99] transition-all duration-150 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2"
      >
        <Plus className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span>Add Task</span>
      </button>
    </header>
  );
}
