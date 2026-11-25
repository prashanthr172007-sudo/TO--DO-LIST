import { CheckCircle2, FilterX, Plus } from 'lucide-react';

interface EmptyStateProps {
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  onAddTask: () => void;
  viewLabel: string;
}

export function EmptyState({
  hasActiveFilters,
  onClearFilters,
  onAddTask,
  viewLabel,
}: EmptyStateProps) {
  return (
    <div className="bg-white border border-slate-200/90 rounded-xl py-14 px-6 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
        {hasActiveFilters ? (
          <FilterX className="h-6 w-6" aria-hidden="true" />
        ) : (
          <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
        )}
      </div>

      <h3 className="mt-4 font-display text-base font-bold text-slate-900">
        {hasActiveFilters ? 'No matching tasks found' : `No tasks in ${viewLabel}`}
      </h3>

      <p className="mt-1.5 mx-auto max-w-md text-sm text-slate-500">
        {hasActiveFilters
          ? 'Try adjusting your search keywords or priority filters to view other items.'
          : 'Create a new task with a priority level and due date to keep your schedule on track.'}
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            className="px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0"
          >
            Clear Filters
          </button>
        )}
        <button
          type="button"
          onClick={onAddTask}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-indigo-600 to-blue-600 text-sm font-semibold text-white hover:from-indigo-700 hover:to-blue-700 transition-all whitespace-nowrap shrink-0"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          <span>Add Task</span>
        </button>
      </div>
    </div>
  );
}
