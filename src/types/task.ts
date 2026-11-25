export type TaskPriority = 'high' | 'medium' | 'low';

export type TaskStatus = 'pending' | 'completed';

export type SidebarView = 'dashboard' | 'all' | 'pending' | 'completed';

export type PriorityFilter = 'all' | TaskPriority;

export type SortOption = 'due_date' | 'priority' | 'created_at';

/**
 * Matches standard Supabase `tasks` table columns without altering schema.
 */
export interface Task {
  id: string;
  user_id?: string | null;
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  due_date: string; // ISO date string YYYY-MM-DD
  created_at: string;
  updated_at: string;
}

export interface TaskInput {
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  due_date: string;
}

export interface TaskStats {
  total: number;
  pending: number;
  completed: number;
  highPriority: number;
  highPriorityPending: number;
  completionRate: number;
}
