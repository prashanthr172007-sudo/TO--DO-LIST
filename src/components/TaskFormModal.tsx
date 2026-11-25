import { useEffect, useState, type FormEvent } from 'react';
import { X } from 'lucide-react';
import type { Task, TaskInput, TaskPriority, TaskStatus } from '../types/task';
import { addDaysToTodayIso, getTodayIsoDate } from '../utils/taskUtils';

interface TaskFormModalProps {
  isOpen: boolean;
  editingTask: Task | null;
  onClose: () => void;
  onSubmit: (input: TaskInput) => Promise<void> | void;
}

const PRIORITIES: { id: TaskPriority; label: string; activeClass: string }[] = [
  {
    id: 'low',
    label: 'Low',
    activeClass: 'bg-blue-50 text-blue-700 border-blue-200 font-semibold',
  },
  {
    id: 'medium',
    label: 'Medium',
    activeClass: 'bg-amber-50 text-amber-700 border-amber-200 font-semibold',
  },
  {
    id: 'high',
    label: 'High',
    activeClass: 'bg-rose-50 text-rose-700 border-rose-200 font-semibold',
  },
];

export function TaskFormModal({
  isOpen,
  editingTask,
  onClose,
  onSubmit,
}: TaskFormModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [status, setStatus] = useState<TaskStatus>('pending');
  const [dueDate, setDueDate] = useState(getTodayIsoDate());
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (editingTask) {
      setTitle(editingTask.title);
      setDescription(editingTask.description);
      setPriority(editingTask.priority);
      setStatus(editingTask.status);
      setDueDate(editingTask.due_date || getTodayIsoDate());
    } else {
      setTitle('');
      setDescription('');
      setPriority('medium');
      setStatus('pending');
      setDueDate(addDaysToTodayIso(1));
    }
    setError('');
    setIsSaving(false);
  }, [isOpen, editingTask]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please enter a task title.');
      return;
    }
    if (!dueDate) {
      setError('Please select a due date.');
      return;
    }

    setIsSaving(true);
    setError('');
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        priority,
        status,
        due_date: dueDate,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save task.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="task-modal-title"
    >
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-[1px]"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-lg rounded-2xl bg-white border border-slate-200 shadow-xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2
            id="task-modal-title"
            className="font-display text-lg font-bold text-slate-900"
          >
            {editingTask ? 'Edit Task' : 'Add New Task'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div
              role="alert"
              className="rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm text-rose-700"
            >
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="task-title"
              className="block text-sm font-medium text-slate-700 mb-1.5"
            >
              Task Title <span className="text-rose-600">*</span>
            </label>
            <input
              id="task-title"
              type="text"
              autoFocus
              required
              maxLength={120}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Review weekly sprint priorities"
              className="w-full h-11 px-3.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div>
            <label
              htmlFor="task-description"
              className="block text-sm font-medium text-slate-700 mb-1.5"
            >
              Description
            </label>
            <textarea
              id="task-description"
              rows={3}
              maxLength={500}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add helpful context, acceptance criteria, or notes..."
              className="w-full p-3.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-y"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Priority Selector */}
            <div>
              <span className="block text-sm font-medium text-slate-700 mb-1.5">
                Priority
              </span>
              <div className="grid grid-cols-3 gap-2">
                {PRIORITIES.map((item) => {
                  const isSelected = priority === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setPriority(item.id)}
                      aria-pressed={isSelected}
                      className={`h-10 rounded-lg border text-xs transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 ${
                        isSelected
                          ? item.activeClass
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 font-medium'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Due Date Picker */}
            <div>
              <label
                htmlFor="task-due-date"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                Due Date <span className="text-rose-600">*</span>
              </label>
              <input
                id="task-due-date"
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 tabular-nums focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          {/* Quick Date Shortcuts */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-500">Quick date:</span>
            {[
              { label: 'Today', days: 0 },
              { label: 'Tomorrow', days: 1 },
              { label: 'In 3 days', days: 3 },
              { label: 'Next week', days: 7 },
            ].map((preset) => {
              const target = addDaysToTodayIso(preset.days);
              const active = dueDate === target;
              return (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setDueDate(target)}
                  className={`px-2.5 py-1 rounded-md border transition-colors whitespace-nowrap shrink-0 ${
                    active
                      ? 'border-indigo-200 bg-indigo-50 text-indigo-700 font-medium'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>

          {/* Status Selector when editing */}
          {editingTask && (
            <div>
              <span className="block text-sm font-medium text-slate-700 mb-1.5">
                Status
              </span>
              <div className="grid grid-cols-2 gap-2">
                {(['pending', 'completed'] as TaskStatus[]).map((s) => {
                  const isSelected = status === s;
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setStatus(s)}
                      aria-pressed={isSelected}
                      className={`h-10 rounded-lg border text-xs font-medium capitalize transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 ${
                        isSelected
                          ? s === 'completed'
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-700 font-semibold'
                            : 'border-indigo-200 bg-indigo-50 text-indigo-700 font-semibold'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-indigo-600 to-blue-600 text-sm font-semibold text-white shadow-xs hover:from-indigo-700 hover:to-blue-700 disabled:opacity-60 transition-all whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2"
            >
              {isSaving
                ? 'Saving...'
                : editingTask
                ? 'Save Changes'
                : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
