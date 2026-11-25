import { AlertTriangle, CheckCircle2, Clock, Layers } from 'lucide-react';
import type { PriorityFilter, SidebarView, TaskStats } from '../types/task';

interface StatCardsProps {
  stats: TaskStats;
  onNavigateView: (view: SidebarView, priority?: PriorityFilter) => void;
}

export function StatCards({ stats, onNavigateView }: StatCardsProps) {
  const cards = [
    {
      id: 'total',
      label: 'Total Tasks',
      value: stats.total,
      sublabel: `${stats.completionRate}% overall completion`,
      icon: Layers,
      iconBg: 'bg-indigo-50 text-indigo-600',
      onClick: () => onNavigateView('all', 'all'),
    },
    {
      id: 'pending',
      label: 'Pending Tasks',
      value: stats.pending,
      sublabel: stats.pending === 1 ? '1 active task remaining' : `${stats.pending} active tasks remaining`,
      icon: Clock,
      iconBg: 'bg-blue-50 text-blue-600',
      onClick: () => onNavigateView('pending', 'all'),
    },
    {
      id: 'completed',
      label: 'Completed Tasks',
      value: stats.completed,
      sublabel: 'Finished & archived items',
      icon: CheckCircle2,
      iconBg: 'bg-emerald-50 text-emerald-600',
      onClick: () => onNavigateView('completed', 'all'),
    },
    {
      id: 'high',
      label: 'High Priority Tasks',
      value: stats.highPriority,
      sublabel:
        stats.highPriorityPending > 0
          ? `${stats.highPriorityPending} pending immediate focus`
          : 'All high priority tasks clear',
      icon: AlertTriangle,
      iconBg: 'bg-rose-50 text-rose-600',
      onClick: () => onNavigateView('all', 'high'),
    },
  ];

  return (
    <section aria-label="Task Overview Statistics" className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <button
            key={card.id}
            type="button"
            onClick={card.onClick}
            className="group text-left bg-white border border-slate-200/90 rounded-xl p-5 hover:border-indigo-300 hover:shadow-sm transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-600 truncate">
                  {card.label}
                </p>
                <p className="mt-2 font-display text-3xl font-bold tracking-tight text-slate-900 tabular-nums">
                  {card.value}
                </p>
              </div>
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${card.iconBg} transition-transform duration-150 group-hover:scale-105`}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
            </div>
            <p className="mt-3 text-xs text-slate-500 tabular-nums truncate">
              {card.sublabel}
            </p>
          </button>
        );
      })}
    </section>
  );
}
