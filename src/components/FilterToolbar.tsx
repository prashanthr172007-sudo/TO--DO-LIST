import { ArrowUpDown, Search, X } from 'lucide-react';
import type { PriorityFilter, SortOption } from '../types/task';

interface FilterToolbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  priorityFilter: PriorityFilter;
  onPriorityChange: (priority: PriorityFilter) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  resultCount: number;
}

const PRIORITY_OPTIONS: { id: PriorityFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'high', label: 'High' },
  { id: 'medium', label: 'Medium' },
  { id: 'low', label: 'Low' },
];

export function FilterToolbar({
  searchQuery,
  onSearchChange,
  priorityFilter,
  onPriorityChange,
  sortBy,
  onSortChange,
  resultCount,
}: FilterToolbarProps) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 bg-white border border-slate-200/90 rounded-xl p-3 sm:p-4">
      {/* Search Input */}
      <div className="relative flex-1 min-w-0 lg:max-w-sm">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"
          aria-hidden="true"
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search tasks by title or description..."
          aria-label="Search tasks"
          className="w-full h-10 pl-9 pr-9 rounded-lg border border-slate-200 bg-slate-50/50 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-colors"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            aria-label="Clear search"
            className="absolute right-2 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Priority Segmented Filter & Sort Controls */}
      <div className="flex flex-wrap items-center justify-between lg:justify-end gap-3">
        <div
          role="group"
          aria-label="Filter by priority"
          className="inline-flex items-center gap-1 p-1 rounded-lg bg-slate-100"
        >
          {PRIORITY_OPTIONS.map((option) => {
            const isSelected = priorityFilter === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => onPriorityChange(option.id)}
                aria-pressed={isSelected}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-150 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 ${
                  isSelected
                    ? 'bg-white text-indigo-700 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex items-center">
            <ArrowUpDown
              className="pointer-events-none absolute left-3 h-3.5 w-3.5 text-slate-400"
              aria-hidden="true"
            />
            <select
              aria-label="Sort tasks"
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
              className="h-9 pl-8 pr-7 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:border-slate-300 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
            >
              <option value="due_date">Sort: Due Date</option>
              <option value="priority">Sort: Priority</option>
              <option value="created_at">Sort: Recently Added</option>
            </select>
          </div>

          <span className="hidden sm:inline text-xs text-slate-500 tabular-nums whitespace-nowrap shrink-0 pl-1">
            {resultCount} {resultCount === 1 ? 'task' : 'tasks'}
          </span>
        </div>
      </div>
    </div>
  );
}
