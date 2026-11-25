import {
  AlertCircle,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Flag,
  Pencil,
  Trash2,
} from 'lucide-react';
import type { Task, TaskPriority } from '../types/task';
import { formatDueDate } from '../utils/taskUtils';

interface TaskCardProps {
  task: Task;
  onToggleComplete: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

const PRIORITY_META: Record<
  TaskPriority,
  { label: string; textClass: string; iconClass: string }
> = {
  high: {
    label: 'High Priority',
    textClass: 'text-rose-700 font-semibold',
    iconClass: 'text-rose-600',
  },
  medium: {
    label: 'Medium Priority',
    textClass: 'text-amber-700 font-medium',
    iconClass: 'text-amber-600',
  },
  low: {
    label: 'Low Priority',
    textClass: 'text-blue-700 font-medium',
    iconClass: 'text-blue-600',
  },
};

export function TaskCard({
  task,
  onToggleComplete,
  onEdit,
  onDelete,
}: TaskCardProps) {
  const isCompleted = task.status === 'completed';
  const priorityInfo = PRIORITY_META[task.priority];
  const dueInfo = formatDueDate(task.due_date);
  const showOverdue = !isCompleted && dueInfo.isOverdue;

  return (
    <article
      className={`group flex flex-col justify-between bg-white border rounded-xl p-5 transition-all duration-150 ${
        isCompleted
          ? 'border-slate-200/75 bg-slate-50/40'
          : 'border-slate-200/90 hover:border-indigo-300 hover:shadow-sm'
      }`}
    >
      <div>
        {/* Card Header: Completion Toggle + Title + Action Buttons */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3.5 min-w-0">
            <button
              type="button"
              onClick={() => onToggleComplete(task)}
              aria-label={
                isCompleted
                  ? `Mark "${task.title}" as pending`
                  : `Mark "${task.title}" as completed`
              }
              aria-pressed={isCompleted}
              className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-1 ${
                isCompleted
                  ? 'bg-gradient-to-br from-indigo-600 to-blue-600 border-indigo-600 text-white'
                  : 'border-slate-300 bg-white text-transparent hover:border-indigo-500'
              }`}
            >
              <Check className="h-3.5 w-3.5 stroke-[2.75]" aria-hidden="true" />
            </button>

            <h3
              className={`font-display text-[15px] font-semibold leading-snug break-words ${
                isCompleted
                  ? 'line-through text-slate-400'
                  : 'text-slate-900'
              }`}
            >
              {task.title}
            </h3>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => onEdit(task)}
              aria-label={`Edit "${task.title}"`}
              title="Edit task"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
            >
              <Pencil className="h-4 w-4" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={() => onDelete(task)}
              aria-label={`Delete "${task.title}"`}
              title="Delete task"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Description */}
        {task.description ? (
          <p
            className={`mt-2.5 pl-9 text-sm leading-relaxed line-clamp-2 ${
              isCompleted ? 'text-slate-400' : 'text-slate-600'
            }`}
          >
            {task.description}
          </p>
        ) : (
          <p className="mt-2.5 pl-9 text-sm italic text-slate-400">
            No description provided.
          </p>
        )}
      </div>

      {/* Footer Unboxed Metadata Row */}
      <div className="mt-4 pt-3.5 pl-9 border-t border-slate-100 flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-xs tabular-nums">
        <span className={`inline-flex items-center gap-1.5 ${priorityInfo.textClass}`}>
          <Flag className={`h-3.5 w-3.5 ${priorityInfo.iconClass}`} aria-hidden="true" />
          <span>{priorityInfo.label}</span>
        </span>

        <span className="text-slate-300" aria-hidden="true">
          ·
        </span>

        <span
          className={`inline-flex items-center gap-1.5 ${
            showOverdue
              ? 'text-rose-600 font-semibold'
              : dueInfo.isToday && !isCompleted
              ? 'text-indigo-600 font-medium'
              : 'text-slate-500'
          }`}
        >
          {showOverdue ? (
            <AlertCircle className="h-3.5 w-3.5 text-rose-600" aria-hidden="true" />
          ) : (
            <Calendar className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
          )}
          <span>
            {showOverdue ? `Overdue (${dueInfo.label})` : `Due ${dueInfo.label}`}
          </span>
        </span>

        <span className="text-slate-300" aria-hidden="true">
          ·
        </span>

        <span
          className={`inline-flex items-center gap-1.5 ${
            isCompleted ? 'text-emerald-700 font-medium' : 'text-slate-600 font-medium'
          }`}
        >
          {isCompleted ? (
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
          ) : (
            <Clock className="h-3.5 w-3.5 text-blue-600" aria-hidden="true" />
          )}
          <span>{isCompleted ? 'Completed' : 'Pending'}</span>
        </span>
      </div>
    </article>
  );
}
