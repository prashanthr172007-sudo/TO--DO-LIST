import { getSupabase, initSupabase } from '../lib/supabase';
import type { Task, TaskInput, TaskPriority, TaskStatus } from '../types/task';

const TASKS_TABLE = 'tasks';

interface RawTaskRow {
  id: string;
  user_id?: string | null;
  title?: string | null;
  description?: string | null;
  priority?: string | null;
  status?: string | null;
  is_completed?: boolean | null;
  due_date?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

function normalizePriority(value?: string | null): TaskPriority {
  const lower = (value ?? '').toLowerCase();
  if (lower === 'high' || lower === 'medium' || lower === 'low') {
    return lower;
  }
  return 'medium';
}

function normalizeStatus(row: RawTaskRow): TaskStatus {
  if (typeof row.status === 'string') {
    return row.status.toLowerCase() === 'completed' ? 'completed' : 'pending';
  }
  if (typeof row.is_completed === 'boolean') {
    return row.is_completed ? 'completed' : 'pending';
  }
  return 'pending';
}

function normalizeTaskRow(row: RawTaskRow): Task {
  const createdAt = row.created_at ?? new Date().toISOString();
  return {
    id: String(row.id),
    user_id: row.user_id ?? null,
    title: row.title ?? '',
    description: row.description ?? '',
    priority: normalizePriority(row.priority),
    status: normalizeStatus(row),
    due_date: row.due_date ? String(row.due_date).slice(0, 10) : '',
    created_at: createdAt,
    updated_at: row.updated_at ?? createdAt,
  };
}

async function requireClientAndUser(userId?: string) {
  const client = getSupabase() ?? (await initSupabase());
  if (!client) {
    throw new Error(
      'Supabase client is not configured. Please check SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY.'
    );
  }
  if (!userId) {
    throw new Error('You must be signed in to access your tasks.');
  }
  return { client, userId };
}

function isMissingStatusColumnError(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes('status') &&
    (lower.includes('column') || lower.includes('schema cache'))
  );
}

export async function fetchTasks(userId: string): Promise<Task[]> {
  const { client } = await requireClientAndUser(userId);

  const { data, error } = await client
    .from(TASKS_TABLE)
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as RawTaskRow[]).map(normalizeTaskRow);
}

export async function createTask(
  input: TaskInput,
  userId: string
): Promise<Task> {
  const { client } = await requireClientAndUser(userId);

  const basePayload = {
    user_id: userId,
    title: input.title.trim(),
    description: input.description.trim() || null,
    priority: input.priority,
    due_date: input.due_date || null,
  };

  const { data, error } = await client
    .from(TASKS_TABLE)
    .insert({
      ...basePayload,
      status: input.status,
    })
    .select('*')
    .single();

  if (error) {
    if (isMissingStatusColumnError(error.message)) {
      const fallback = await client
        .from(TASKS_TABLE)
        .insert({
          ...basePayload,
          is_completed: input.status === 'completed',
        })
        .select('*')
        .single();

      if (fallback.error) {
        throw new Error(fallback.error.message);
      }
      return normalizeTaskRow(fallback.data as RawTaskRow);
    }
    throw new Error(error.message);
  }

  return normalizeTaskRow(data as RawTaskRow);
}

export async function updateTask(
  taskId: string,
  input: Partial<TaskInput>,
  userId: string
): Promise<Task> {
  const { client } = await requireClientAndUser(userId);

  const payload: Record<string, unknown> = {};
  if (input.title !== undefined) payload.title = input.title.trim();
  if (input.description !== undefined) {
    payload.description = input.description.trim() || null;
  }
  if (input.priority !== undefined) payload.priority = input.priority;
  if (input.due_date !== undefined) payload.due_date = input.due_date || null;
  if (input.status !== undefined) payload.status = input.status;

  const { data, error } = await client
    .from(TASKS_TABLE)
    .update(payload)
    .eq('id', taskId)
    .eq('user_id', userId)
    .select('*')
    .single();

  if (error) {
    if (input.status !== undefined && isMissingStatusColumnError(error.message)) {
      const fallbackPayload = { ...payload };
      delete fallbackPayload.status;
      fallbackPayload.is_completed = input.status === 'completed';

      const fallback = await client
        .from(TASKS_TABLE)
        .update(fallbackPayload)
        .eq('id', taskId)
        .eq('user_id', userId)
        .select('*')
        .single();

      if (fallback.error) {
        throw new Error(fallback.error.message);
      }
      return normalizeTaskRow(fallback.data as RawTaskRow);
    }
    throw new Error(error.message);
  }

  return normalizeTaskRow(data as RawTaskRow);
}

export async function toggleTaskStatus(
  taskId: string,
  nextStatus: TaskStatus,
  userId: string
): Promise<Task> {
  return updateTask(taskId, { status: nextStatus }, userId);
}

export async function deleteTask(taskId: string, userId: string): Promise<void> {
  const { client } = await requireClientAndUser(userId);

  const { error } = await client
    .from(TASKS_TABLE)
    .delete()
    .eq('id', taskId)
    .eq('user_id', userId);

  if (error) {
    throw new Error(error.message);
  }
}
