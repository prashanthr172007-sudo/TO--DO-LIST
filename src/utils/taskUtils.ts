import type {
  PriorityFilter,
  SidebarView,
  SortOption,
  Task,
  TaskPriority,
  TaskStats,
} from '../types/task';

export function computeTaskStats(tasks: Task[]): TaskStats {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === 'completed').length;
  const pending = total - completed;
  const highPriority = tasks.filter((t) => t.priority === 'high').length;
  const highPriorityPending = tasks.filter(
    (t) => t.priority === 'high' && t.status === 'pending'
  ).length;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  return {
    total,
    pending,
    completed,
    highPriority,
    highPriorityPending,
    completionRate,
  };
}

const PRIORITY_WEIGHT: Record<TaskPriority, number> = {
  high: 0,
  medium: 1,
  low: 2,
};

export function filterAndSortTasks(
  tasks: Task[],
  options: {
    view: SidebarView;
    priority: PriorityFilter;
    searchQuery: string;
    sortBy: SortOption;
  }
): Task[] {
  const query = options.searchQuery.trim().toLowerCase();

  const filtered = tasks.filter((task) => {
    if (options.view === 'pending' && task.status !== 'pending') return false;
    if (options.view === 'completed' && task.status !== 'completed') return false;
    if (options.priority !== 'all' && task.priority !== options.priority) {
      return false;
    }
    if (query) {
      const haystack = `${task.title} ${task.description}`.toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    return true;
  });

  return [...filtered].sort((a, b) => {
    if (options.sortBy === 'priority') {
      const diff = PRIORITY_WEIGHT[a.priority] - PRIORITY_WEIGHT[b.priority];
      if (diff !== 0) return diff;
      return a.due_date.localeCompare(b.due_date);
    }
    if (options.sortBy === 'created_at') {
      return b.created_at.localeCompare(a.created_at);
    }
    // Default: due_date ascending, with pending tasks before completed when tied
    const dateDiff = a.due_date.localeCompare(b.due_date);
    if (dateDiff !== 0) return dateDiff;
    if (a.status !== b.status) {
      return a.status === 'pending' ? -1 : 1;
    }
    return PRIORITY_WEIGHT[a.priority] - PRIORITY_WEIGHT[b.priority];
  });
}

export function getTodayIsoDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function addDaysToTodayIso(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDueDate(isoDate: string): {
  label: string;
  isOverdue: boolean;
  isToday: boolean;
} {
  if (!isoDate) {
    return { label: 'No due date', isOverdue: false, isToday: false };
  }

  const today = getTodayIsoDate();
  const isToday = isoDate === today;
  const isOverdue = isoDate < today;

  const [year, month, day] = isoDate.split('-').map(Number);
  if (!year || !month || !day) {
    return { label: isoDate, isOverdue: false, isToday: false };
  }

  const parsed = new Date(year, month - 1, day);
  const formatted = parsed.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return {
    label: isToday ? `Today (${formatted})` : formatted,
    isOverdue,
    isToday,
  };
}
