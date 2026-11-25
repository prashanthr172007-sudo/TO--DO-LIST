import { useCallback, useEffect, useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  createTask,
  deleteTask,
  fetchTasks,
  toggleTaskStatus,
  updateTask,
} from '../services/taskService';
import type {
  PriorityFilter,
  SidebarView,
  SortOption,
  Task,
  TaskInput,
} from '../types/task';
import { computeTaskStats, filterAndSortTasks } from '../utils/taskUtils';
import { AuthModal } from './AuthModal';
import { AuthScreen } from './AuthScreen';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { EmptyState } from './EmptyState';
import { FilterToolbar } from './FilterToolbar';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { StatCards } from './StatCards';
import { TaskCard } from './TaskCard';
import { TaskFormModal } from './TaskFormModal';

const VIEW_HEADERS: Record<
  SidebarView,
  { title: string; subtitle: string }
> = {
  dashboard: {
    title: 'Productivity Overview',
    subtitle: 'Track task progress, upcoming deadlines, and high-priority items.',
  },
  all: {
    title: 'All Tasks',
    subtitle: 'Complete list of tasks across every priority level and status.',
  },
  pending: {
    title: 'Pending Tasks',
    subtitle: 'Active work items awaiting completion.',
  },
  completed: {
    title: 'Completed Tasks',
    subtitle: 'Finished tasks archived for reference.',
  },
};

export function DashboardWorkspace() {
  const { user, isLoading: authLoading, displayName, displayEmail, signOut } =
    useAuth();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  const [activeView, setActiveView] = useState<SidebarView>('dashboard');
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('due_date');

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const loadTasks = useCallback(async () => {
    if (!user?.id) {
      setTasks([]);
      return;
    }

    setIsLoadingTasks(true);
    setErrorBanner(null);
    try {
      const data = await fetchTasks(user.id);
      setTasks(data);
    } catch (err) {
      setErrorBanner(
        err instanceof Error ? err.message : 'Unable to load your tasks.'
      );
    } finally {
      setIsLoadingTasks(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      void loadTasks();
    } else {
      setTasks([]);
      setErrorBanner(null);
    }
  }, [user?.id, loadTasks]);

  const stats = useMemo(() => computeTaskStats(tasks), [tasks]);

  const visibleTasks = useMemo(
    () =>
      filterAndSortTasks(tasks, {
        view: activeView,
        priority: priorityFilter,
        searchQuery,
        sortBy,
      }),
    [tasks, activeView, priorityFilter, searchQuery, sortBy]
  );

  if (authLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-3 px-4">
        <Loader2
          className="h-7 w-7 text-indigo-600 animate-spin"
          aria-hidden="true"
        />
        <p className="text-sm font-medium text-slate-600">
          Loading Smart Task Manager...
        </p>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  const hasActiveFilters =
    priorityFilter !== 'all' || searchQuery.trim().length > 0;

  const handleOpenAddModal = () => {
    setEditingTask(null);
    setIsTaskModalOpen(true);
  };

  const handleOpenEditModal = (task: Task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  const handleSaveTask = async (input: TaskInput) => {
    setErrorBanner(null);
    if (editingTask) {
      const updated = await updateTask(editingTask.id, input, user.id);
      setTasks((prev) =>
        prev.map((item) => (item.id === updated.id ? updated : item))
      );
    } else {
      const created = await createTask(input, user.id);
      setTasks((prev) => [created, ...prev]);
    }
  };

  const handleToggleComplete = async (task: Task) => {
    const nextStatus = task.status === 'completed' ? 'pending' : 'completed';
    setErrorBanner(null);
    setTasks((prev) =>
      prev.map((item) =>
        item.id === task.id ? { ...item, status: nextStatus } : item
      )
    );
    try {
      const updated = await toggleTaskStatus(task.id, nextStatus, user.id);
      setTasks((prev) =>
        prev.map((item) => (item.id === updated.id ? updated : item))
      );
    } catch (err) {
      setTasks((prev) =>
        prev.map((item) => (item.id === task.id ? task : item))
      );
      setErrorBanner(
        err instanceof Error ? err.message : 'Failed to update task status.'
      );
    }
  };

  const handleConfirmDelete = async (task: Task) => {
    setErrorBanner(null);
    try {
      await deleteTask(task.id, user.id);
      setTasks((prev) => prev.filter((item) => item.id !== task.id));
      setDeletingTask(null);
    } catch (err) {
      setErrorBanner(
        err instanceof Error ? err.message : 'Failed to delete task.'
      );
    }
  };

  const handleNavigateFromStatCard = (
    view: SidebarView,
    priority: PriorityFilter = 'all'
  ) => {
    setActiveView(view);
    setPriorityFilter(priority);
  };

  const handleClearFilters = () => {
    setPriorityFilter('all');
    setSearchQuery('');
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);
    const { error } = await signOut();
    if (error) {
      setErrorBanner(error);
    }
    setIsSigningOut(false);
  };

  const currentHeader = VIEW_HEADERS[activeView];

  return (
    <div className="min-h-screen bg-white text-slate-900 flex">
      <Sidebar
        activeView={activeView}
        onSelectView={setActiveView}
        stats={stats}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        displayName={displayName}
        displayEmail={displayEmail}
        onOpenAccount={() => setIsAuthModalOpen(true)}
        onSignOut={() => void handleSignOut()}
        isSigningOut={isSigningOut}
      />

      <div className="flex-1 min-w-0 flex flex-col bg-slate-50/40">
        <Header
          activeView={activeView}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onOpenAddTask={handleOpenAddModal}
        />

        <main className="flex-1 w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
          {/* Page Intro */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
            <div>
              <h2 className="font-display text-2xl sm:text-[28px] font-bold tracking-tight text-slate-900 text-balance">
                {currentHeader.title}
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                {currentHeader.subtitle}
              </p>
            </div>
          </div>

          {/* Error Banner */}
          {errorBanner && (
            <div
              role="alert"
              className="flex items-center justify-between gap-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
            >
              <span>{errorBanner}</span>
              <button
                type="button"
                onClick={() => void loadTasks()}
                className="font-semibold underline underline-offset-2 whitespace-nowrap shrink-0"
              >
                Retry
              </button>
            </div>
          )}

          {/* Dashboard 4 Statistic Cards */}
          {activeView === 'dashboard' && (
            <StatCards
              stats={stats}
              onNavigateView={handleNavigateFromStatCard}
            />
          )}

          {/* Task Filters & Task List Section */}
          <section aria-label="Task Workspace" className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <h3 className="font-display text-base font-bold text-slate-900">
                {activeView === 'dashboard'
                  ? 'Tasks & Action Items'
                  : `${currentHeader.title} (${visibleTasks.length})`}
              </h3>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 whitespace-nowrap shrink-0"
                >
                  Reset filters
                </button>
              )}
            </div>

            <FilterToolbar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              priorityFilter={priorityFilter}
              onPriorityChange={setPriorityFilter}
              sortBy={sortBy}
              onSortChange={setSortBy}
              resultCount={visibleTasks.length}
            />

            {isLoadingTasks ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((skeleton) => (
                  <div
                    key={skeleton}
                    className="h-[156px] rounded-xl border border-slate-200 bg-white p-5 animate-pulse"
                  >
                    <div className="h-5 w-2/3 rounded bg-slate-200" />
                    <div className="mt-3 h-4 w-full rounded bg-slate-100" />
                    <div className="mt-2 h-4 w-4/5 rounded bg-slate-100" />
                    <div className="mt-6 h-3 w-1/2 rounded bg-slate-100" />
                  </div>
                ))}
              </div>
            ) : visibleTasks.length === 0 ? (
              <EmptyState
                hasActiveFilters={hasActiveFilters}
                onClearFilters={handleClearFilters}
                onAddTask={handleOpenAddModal}
                viewLabel={VIEW_HEADERS[activeView].title}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {visibleTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onToggleComplete={handleToggleComplete}
                    onEdit={handleOpenEditModal}
                    onDelete={setDeletingTask}
                  />
                ))}
              </div>
            )}
          </section>
        </main>
      </div>

      {/* Add / Edit Task Modal */}
      <TaskFormModal
        isOpen={isTaskModalOpen}
        editingTask={editingTask}
        onClose={() => {
          setIsTaskModalOpen(false);
          setEditingTask(null);
        }}
        onSubmit={handleSaveTask}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        task={deletingTask}
        onCancel={() => setDeletingTask(null)}
        onConfirm={handleConfirmDelete}
      />

      {/* Supabase Account Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
}
