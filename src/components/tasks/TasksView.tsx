import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  LayoutList,
  Columns3,
  Calendar,
  CheckCircle2,
  Trash2,
  Edit3,
  Clock,
  AlertTriangle,
  FolderKanban,
  Flag,
  Sparkles
} from 'lucide-react';
import { useTaskFlow } from '../../context/TaskFlowContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { Task, Priority, TaskStatus } from '../../types';
import { PRIORITY_POINTS } from '../../services/storage';

export const TasksView: React.FC = () => {
  const {
    tasks,
    projects,
    categories,
    openTaskModal,
    deleteTask,
    toggleTaskCompletion,
    showConfirmDialog,
    searchQuery,
    setSearchQuery,
    filterProject,
    setFilterProject,
    filterPriority,
    setFilterPriority,
    filterStatus,
    setFilterStatus,
    filterCategory,
    setFilterCategory,
    sortBy,
    setSortBy,
  } = useTaskFlow();
  const { language, t } = useLanguage();

  const [viewMode, setViewMode] = useState<'list' | 'board'>('list');
  const todayStr = new Date().toISOString().split('T')[0];

  // Projects map
  const projectMap = useMemo(() => {
    const map = new Map<string, { name: string; color: string }>();
    projects.forEach(p => map.set(p.id, { name: p.name, color: p.color }));
    return map;
  }, [projects]);

  // Filtered & Sorted Tasks
  const processedTasks = useMemo(() => {
    let result = [...tasks];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        t =>
          t.title.toLowerCase().includes(q) ||
          (t.description && t.description.toLowerCase().includes(q)) ||
          (t.tags && t.tags.some(tag => tag.toLowerCase().includes(q)))
      );
    }

    // Filter project
    if (filterProject !== 'all') {
      result = result.filter(t => t.projectId === filterProject);
    }

    // Filter priority
    if (filterPriority !== 'all') {
      result = result.filter(t => t.priority === filterPriority);
    }

    // Filter status
    if (filterStatus !== 'all') {
      result = result.filter(t => t.status === filterStatus);
    }

    // Filter category
    if (filterCategory !== 'all') {
      result = result.filter(t => t.category === filterCategory);
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'dueDateAsc') return a.dueDate.localeCompare(b.dueDate);
      if (sortBy === 'dueDateDesc') return b.dueDate.localeCompare(a.dueDate);
      if (sortBy === 'priorityDesc') {
        const order: Record<Priority, number> = { urgent: 4, high: 3, medium: 2, low: 1 };
        return order[b.priority] - order[a.priority];
      }
      if (sortBy === 'titleAsc') return a.title.localeCompare(b.title);
      if (sortBy === 'createdDesc') return b.createdAt.localeCompare(a.createdAt);
      return 0;
    });

    return result;
  }, [tasks, searchQuery, filterProject, filterPriority, filterStatus, filterCategory, sortBy]);

  const handleDeleteClick = (taskId: string, title: string) => {
    showConfirmDialog({
      title: t('deleteTaskTitle'),
      message: `${t('deleteTaskPrompt')} ("${title}")`,
      confirmText: t('delete'),
      variant: 'danger',
      onConfirm: () => deleteTask(taskId),
    });
  };

  const getPriorityBadge = (priority: Priority) => {
    switch (priority) {
      case 'urgent':
        return {
          bg: 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400',
          label: t('priorityUrgent'),
          pts: PRIORITY_POINTS.urgent,
        };
      case 'high':
        return {
          bg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400',
          label: t('priorityHigh'),
          pts: PRIORITY_POINTS.high,
        };
      case 'medium':
        return {
          bg: 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400',
          label: t('priorityMedium'),
          pts: PRIORITY_POINTS.medium,
        };
      case 'low':
      default:
        return {
          bg: 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400',
          label: t('priorityLow'),
          pts: PRIORITY_POINTS.low,
        };
    }
  };

  // Kanban status columns
  const kanbanColumns: Array<{ id: TaskStatus; label: string; tasks: Task[] }> = [
    { id: 'pending', label: t('statusPending'), tasks: processedTasks.filter(t => t.status === 'pending') },
    { id: 'in_progress', label: t('statusInProgress'), tasks: processedTasks.filter(t => t.status === 'in_progress') },
    { id: 'overdue', label: t('statusOverdue'), tasks: processedTasks.filter(t => t.status === 'overdue' || (t.dueDate < todayStr && t.status !== 'completed')) },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            {t('tasksTitle')}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500">
            {t('tasksSubtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center p-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md text-xs font-medium transition-colors ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100'
              }`}
              title={t('viewList')}
            >
              <LayoutList className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('board')}
              className={`p-1.5 rounded-md text-xs font-medium transition-colors ${
                viewMode === 'board'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100'
              }`}
              title={t('viewBoard')}
            >
              <Columns3 className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => openTaskModal()}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>{t('newTask')}</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute top-1/2 -translate-y-1/2 start-3 w-4 h-4 text-neutral-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={t('searchTasks')}
              className="w-full ps-9 pe-4 py-2 text-xs bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:border-indigo-500 focus:outline-hidden text-neutral-900 dark:text-neutral-100 placeholder-neutral-400"
            />
          </div>

          {/* Project Filter */}
          <select
            value={filterProject}
            onChange={e => setFilterProject(e.target.value)}
            className="px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:border-indigo-500 focus:outline-hidden text-neutral-900 dark:text-neutral-100 shrink-0"
          >
            <option value="all">{t('filterByProject')}</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          {/* Priority Filter */}
          <select
            value={filterPriority}
            onChange={e => setFilterPriority(e.target.value)}
            className="px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:border-indigo-500 focus:outline-hidden text-neutral-900 dark:text-neutral-100 shrink-0"
          >
            <option value="all">{t('filterByPriority')}</option>
            <option value="low">{t('priorityLow')}</option>
            <option value="medium">{t('priorityMedium')}</option>
            <option value="high">{t('priorityHigh')}</option>
            <option value="urgent">{t('priorityUrgent')}</option>
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:border-indigo-500 focus:outline-hidden text-neutral-900 dark:text-neutral-100 shrink-0"
          >
            <option value="all">{t('filterByStatus')}</option>
            <option value="pending">{t('statusPending')}</option>
            <option value="in_progress">{t('statusInProgress')}</option>
            <option value="overdue">{t('statusOverdue')}</option>
          </select>

          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            className="px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:border-indigo-500 focus:outline-hidden text-neutral-900 dark:text-neutral-100 shrink-0"
          >
            <option value="all">{t('filterByCategory')}</option>
            {categories.map(c => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Sort By */}
          <div className="relative shrink-0">
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:border-indigo-500 focus:outline-hidden text-neutral-900 dark:text-neutral-100"
            >
              <option value="dueDateAsc">{t('sortByDueDateAsc')}</option>
              <option value="dueDateDesc">{t('sortByDueDateDesc')}</option>
              <option value="priorityDesc">{t('sortByPriorityDesc')}</option>
              <option value="titleAsc">{t('sortByTitleAsc')}</option>
              <option value="createdDesc">{t('sortByCreatedDesc')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Tasks List View */}
      {viewMode === 'list' ? (
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-xs overflow-hidden">
          {processedTasks.length === 0 ? (
            <div className="py-16 text-center">
              <CheckCircle2 className="w-10 h-10 text-neutral-300 dark:text-neutral-700 mx-auto mb-3" />
              <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                {t('noTasksFound')}
              </p>
              <p className="text-xs text-neutral-400 mt-1">
                {t('createFirstTask')}
              </p>
              <button
                onClick={() => openTaskModal()}
                className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
              >
                + {t('newTask')}
              </button>
            </div>
          ) : (
            <div className="divide-y divide-neutral-100 dark:divide-neutral-800/80">
              {processedTasks.map(task => {
                const priorityBadge = getPriorityBadge(task.priority);
                const proj = projectMap.get(task.projectId);
                const isOverdue = task.dueDate < todayStr;
                const isToday = task.dueDate === todayStr;

                return (
                  <div
                    key={task.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors group"
                  >
                    {/* Left: Checkbox & Info */}
                    <div className="flex items-start gap-3.5 min-w-0 flex-1">
                      <div className="pt-0.5">
                        <input
                          type="checkbox"
                          checked={false}
                          onChange={() => toggleTaskCompletion(task.id)}
                          className="w-4 h-4 rounded-sm text-indigo-600 border-neutral-300 dark:border-neutral-700 focus:ring-indigo-500 cursor-pointer"
                          title="Mark complete & move to archive"
                        />
                      </div>

                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs sm:text-sm font-semibold text-neutral-900 dark:text-neutral-100 hover:text-indigo-600 transition-colors cursor-pointer" onClick={() => openTaskModal(task)}>
                            {task.title}
                          </span>
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-sm uppercase ${priorityBadge.bg}`}
                          >
                            {priorityBadge.label} (+{priorityBadge.pts} XP)
                          </span>
                        </div>

                        {task.description && (
                          <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-1">
                            {task.description}
                          </p>
                        )}

                        {/* Metadata row without pills (Zero-Pill Discipline) */}
                        <div className="flex items-center gap-2 text-[11px] text-neutral-500 dark:text-neutral-400 flex-wrap">
                          {proj && (
                            <span className="flex items-center gap-1 font-medium text-neutral-700 dark:text-neutral-300">
                              <span
                                className="w-2 h-2 rounded-full shrink-0"
                                style={{ backgroundColor: proj.color }}
                              />
                              <span>{proj.name}</span>
                            </span>
                          )}

                          <span aria-hidden="true">·</span>
                          <span>{task.category}</span>

                          <span aria-hidden="true">·</span>
                          <span
                            className={`flex items-center gap-1 font-mono ${
                              isOverdue
                                ? 'text-red-600 dark:text-red-400 font-semibold'
                                : isToday
                                ? 'text-amber-600 dark:text-amber-400 font-semibold'
                                : ''
                            }`}
                          >
                            <Calendar className="w-3 h-3" />
                            <span>{task.dueDate}</span>
                            {isOverdue && <span>({t('statusOverdue')})</span>}
                            {isToday && <span>(Today)</span>}
                          </span>

                          {task.tags && task.tags.length > 0 && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="text-neutral-400">
                                {task.tags.map(t => `#${t}`).join(' ')}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <button
                        onClick={() => openTaskModal(task)}
                        className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                        title={t('edit')}
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(task.id, task.title)}
                        className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors"
                        title={t('delete')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* Kanban Board View */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {kanbanColumns.map(col => (
            <div
              key={col.id}
              className="bg-neutral-100/70 dark:bg-neutral-900/60 rounded-xl p-4 border border-neutral-200 dark:border-neutral-800 flex flex-col min-h-[400px]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                    {col.label}
                  </h3>
                  <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                    {col.tasks.length}
                  </span>
                </div>
              </div>

              {/* Column Cards */}
              <div className="space-y-3 flex-1 overflow-y-auto">
                {col.tasks.length === 0 ? (
                  <div className="py-8 text-center text-xs text-neutral-400">
                    No tasks
                  </div>
                ) : (
                  col.tasks.map(task => {
                    const priorityBadge = getPriorityBadge(task.priority);
                    const proj = projectMap.get(task.projectId);

                    return (
                      <div
                        key={task.id}
                        className="bg-white dark:bg-neutral-800/90 rounded-lg border border-neutral-200 dark:border-neutral-700/80 p-3.5 shadow-xs hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors space-y-2.5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={false}
                              onChange={() => toggleTaskCompletion(task.id)}
                              className="w-3.5 h-3.5 rounded-sm text-indigo-600 border-neutral-300 dark:border-neutral-700 focus:ring-indigo-500 cursor-pointer"
                              title="Mark complete"
                            />
                            <span
                              onClick={() => openTaskModal(task)}
                              className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 hover:text-indigo-600 cursor-pointer line-clamp-1"
                            >
                              {task.title}
                            </span>
                          </div>
                          <span
                            className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-xs uppercase shrink-0 ${priorityBadge.bg}`}
                          >
                            {priorityBadge.label}
                          </span>
                        </div>

                        {task.description && (
                          <p className="text-[11px] text-neutral-500 dark:text-neutral-400 line-clamp-2">
                            {task.description}
                          </p>
                        )}

                        <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-1 border-t border-neutral-100 dark:border-neutral-700/60">
                          {proj ? (
                            <span className="flex items-center gap-1 font-medium text-neutral-700 dark:text-neutral-300 truncate max-w-[120px]">
                              <span
                                className="w-2 h-2 rounded-full shrink-0"
                                style={{ backgroundColor: proj.color }}
                              />
                              <span className="truncate">{proj.name}</span>
                            </span>
                          ) : (
                            <span>General</span>
                          )}

                          <span className="font-mono text-neutral-500">{task.dueDate}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
