import React from 'react';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  FolderKanban,
  Calendar,
  Sparkles,
  TrendingUp,
  Plus,
  Flame,
  ArrowUpRight
} from 'lucide-react';
import { useTaskFlow } from '../../context/TaskFlowContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { calculateLevelInfo } from '../../services/storage';

export const DashboardView: React.FC = () => {
  const {
    tasks,
    archivedTasks,
    projects,
    toggleTaskCompletion,
    openTaskModal,
    setActiveTab,
  } = useTaskFlow();
  const { currentUser } = useAuth();
  const { language, t } = useLanguage();

  const isAr = language === 'ar';
  const todayStr = new Date().toISOString().split('T')[0];

  // Calculated metrics
  const totalTasksCount = tasks.length + archivedTasks.length;
  const pendingTasksCount = tasks.filter(t => t.status === 'pending' || t.status === 'in_progress').length;
  const completedTasksCount = archivedTasks.length;
  const overdueTasks = tasks.filter(t => t.status === 'overdue' || (t.dueDate < todayStr && t.status !== 'completed'));
  const activeProjectsCount = projects.length;

  const todayTasks = tasks.filter(t => t.dueDate === todayStr);

  const next7DaysStr = new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0];
  const upcomingTasks = tasks
    .filter(t => t.dueDate > todayStr && t.dueDate <= next7DaysStr)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  const completionRate = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;
  const totalPoints = currentUser?.points || 0;
  const levelInfo = calculateLevelInfo(totalPoints);

  // Daily productivity for the past 7 days (including today)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    const dayLabel = d.toLocaleDateString(isAr ? 'ar-EG' : 'en-US', { weekday: 'short' });

    // count tasks completed on this date
    const count = archivedTasks.filter(t => t.completedAt && t.completedAt.startsWith(dateStr)).length;
    return { dateStr, dayLabel, count };
  });

  const maxDailyCount = Math.max(...last7Days.map(d => d.count), 4);

  // Tasks by priority count
  const priorityBreakdown = {
    urgent: tasks.filter(t => t.priority === 'urgent').length,
    high: tasks.filter(t => t.priority === 'high').length,
    medium: tasks.filter(t => t.priority === 'medium').length,
    low: tasks.filter(t => t.priority === 'low').length,
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Welcome & Level Progress Strip */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                {t('welcomeBack')}, {currentUser?.fullName || 'User'}
              </h1>
              <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 text-xs font-semibold">
                <Flame className="w-3.5 h-3.5 fill-amber-500" />
                <span>{currentUser?.currentStreak || 0} {t('streakDays')}</span>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
              {t('dashboardSubtitle')}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            {/* Level Card */}
            <div className="bg-neutral-50 dark:bg-neutral-800/60 rounded-lg p-3 min-w-[240px]">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <div className="flex items-center gap-1.5 font-semibold text-neutral-900 dark:text-neutral-100">
                  <Sparkles className="w-4 h-4 text-indigo-500" />
                  <span>{isAr ? levelInfo.titleAr : levelInfo.titleEn}</span>
                </div>
                <span className="font-mono text-neutral-500">Lvl {levelInfo.level}</span>
              </div>
              <div className="w-full bg-neutral-200 dark:bg-neutral-700 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${levelInfo.progress}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-[10px] text-neutral-400 mt-1 font-mono">
                <span>{totalPoints} XP</span>
                <span>{levelInfo.xpNeeded > 0 ? `${levelInfo.xpNeeded} ${t('xpToNextLevel')}` : 'Max Level'}</span>
              </div>
            </div>

            <button
              onClick={() => openTaskModal()}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>{t('newTask')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 8 Metric KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Tasks */}
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-medium">{t('totalTasks')}</span>
            <span className="p-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-bold font-mono tracking-tight text-neutral-900 dark:text-neutral-100 tabular-nums">
            {totalTasksCount}
          </p>
          <span className="text-[11px] text-neutral-400 mt-1 block">
            {completedTasksCount} {t('completedTasks').toLowerCase()}
          </span>
        </div>

        {/* Pending Tasks */}
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-medium">{t('pendingTasks')}</span>
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-bold font-mono tracking-tight text-neutral-900 dark:text-neutral-100 tabular-nums">
            {pendingTasksCount}
          </p>
          <span className="text-[11px] text-blue-600 dark:text-blue-400 mt-1 block">
            {tasks.filter(t => t.status === 'in_progress').length} {t('statusInProgress')}
          </span>
        </div>

        {/* Completed Tasks (Archive) */}
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-medium">{t('completedTasks')}</span>
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-bold font-mono tracking-tight text-neutral-900 dark:text-neutral-100 tabular-nums">
            {completedTasksCount}
          </p>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 block">
            {completionRate}% {t('completionRate')}
          </span>
        </div>

        {/* Overdue Tasks */}
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-medium">{t('overdueTasks')}</span>
            <span className="p-1.5 rounded-lg bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400">
              <AlertTriangle className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-bold font-mono tracking-tight text-red-600 dark:text-red-400 tabular-nums">
            {overdueTasks.length}
          </p>
          <span className="text-[11px] text-neutral-400 mt-1 block">
            {overdueTasks.length > 0 ? 'Requires attention' : 'All on track'}
          </span>
        </div>

        {/* Active Projects */}
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-medium">{t('activeProjects')}</span>
            <span className="p-1.5 rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400">
              <FolderKanban className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-bold font-mono tracking-tight text-neutral-900 dark:text-neutral-100 tabular-nums">
            {activeProjectsCount}
          </p>
          <button
            onClick={() => setActiveTab('projects')}
            className="text-[11px] text-indigo-600 dark:text-indigo-400 mt-1 hover:underline flex items-center gap-0.5"
          >
            <span>{t('viewDetails')}</span>
            <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>

        {/* Today's Tasks */}
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-medium">{t('todayTasks')}</span>
            <span className="p-1.5 rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
              <Calendar className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-bold font-mono tracking-tight text-neutral-900 dark:text-neutral-100 tabular-nums">
            {todayTasks.length}
          </p>
          <span className="text-[11px] text-neutral-400 mt-1 block">
            {todayTasks.length === 0 ? 'No tasks scheduled' : 'Scheduled today'}
          </span>
        </div>

        {/* Upcoming Deadlines */}
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-medium">{t('upcomingDeadlines')}</span>
            <span className="p-1.5 rounded-lg bg-sky-50 text-sky-600 dark:bg-sky-950/50 dark:text-sky-400">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-bold font-mono tracking-tight text-neutral-900 dark:text-neutral-100 tabular-nums">
            {upcomingTasks.length}
          </p>
          <span className="text-[11px] text-neutral-400 mt-1 block">
            Next 7 days
          </span>
        </div>

        {/* Total Points */}
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-medium">{t('totalPoints')}</span>
            <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
              <Sparkles className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-bold font-mono tracking-tight text-indigo-600 dark:text-indigo-400 tabular-nums">
            {totalPoints} XP
          </p>
          <button
            onClick={() => setActiveTab('achievements')}
            className="text-[11px] text-indigo-600 dark:text-indigo-400 mt-1 hover:underline flex items-center gap-0.5"
          >
            <span>Level {levelInfo.level}</span>
            <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Visual Analytics Strip: Daily Velocity Chart & Completion Rate */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Velocity Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                {t('dailyProductivity')}
              </h3>
              <p className="text-xs text-neutral-500">
                {t('productivityTrend')} (7-day window)
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-neutral-500">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <span>{completedTasksCount} Completed</span>
            </div>
          </div>

          {/* Bar Chart Visualization */}
          <div className="h-44 flex items-end justify-between gap-3 pt-4">
            {last7Days.map((day, idx) => {
              const heightPercent = Math.max(12, Math.round((day.count / maxDailyCount) * 100));
              const isToday = day.dateStr === todayStr;

              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <div className="text-[11px] font-mono text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    {day.count}
                  </div>
                  <div className="w-full max-w-[48px] bg-neutral-100 dark:bg-neutral-800 rounded-t-md overflow-hidden flex items-end h-32">
                    <div
                      className={`w-full rounded-t-md transition-all duration-500 ${
                        isToday
                          ? 'bg-indigo-600 dark:bg-indigo-500'
                          : 'bg-indigo-300 dark:bg-indigo-900/80 group-hover:bg-indigo-400'
                      }`}
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>
                  <span
                    className={`text-[11px] font-medium whitespace-nowrap ${
                      isToday
                        ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                        : 'text-neutral-500'
                    }`}
                  >
                    {day.dayLabel}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Task Completion Rate & Priority Breakdown */}
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
              {t('completionRate')}
            </h3>
            <p className="text-xs text-neutral-500 mb-4">
              Overall tasks completed vs total workload
            </p>

            {/* Circular Gauge / Percentage Display */}
            <div className="flex items-center justify-center my-3">
              <div className="relative w-32 h-32 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-neutral-200 dark:text-neutral-800"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-indigo-600 dark:text-indigo-500 transition-all duration-1000"
                    strokeDasharray={`${completionRate}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-2xl font-bold font-mono tracking-tight text-neutral-900 dark:text-neutral-100">
                    {completionRate}%
                  </span>
                  <span className="text-[10px] text-neutral-400 uppercase tracking-wider">
                    Ratio
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Priority Distribution */}
          <div className="space-y-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
            <div className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              {t('tasksByPriority')}
            </div>
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="p-1.5 rounded-lg bg-red-50 dark:bg-red-950/30">
                <span className="block text-[10px] text-red-600 dark:text-red-400 font-medium">Urgent</span>
                <span className="text-xs font-bold font-mono text-red-700 dark:text-red-300">{priorityBreakdown.urgent}</span>
              </div>
              <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/30">
                <span className="block text-[10px] text-amber-600 dark:text-amber-400 font-medium">High</span>
                <span className="text-xs font-bold font-mono text-amber-700 dark:text-amber-300">{priorityBreakdown.high}</span>
              </div>
              <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/30">
                <span className="block text-[10px] text-blue-600 dark:text-blue-400 font-medium">Medium</span>
                <span className="text-xs font-bold font-mono text-blue-700 dark:text-blue-300">{priorityBreakdown.medium}</span>
              </div>
              <div className="p-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800">
                <span className="block text-[10px] text-neutral-600 dark:text-neutral-400 font-medium">Low</span>
                <span className="text-xs font-bold font-mono text-neutral-800 dark:text-neutral-200">{priorityBreakdown.low}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Section: Today's Tasks & Project Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Tasks List with Checkbox */}
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                {t('todayTasks')}
              </h3>
              <p className="text-xs text-neutral-500">
                Tasks due for completion today ({todayStr})
              </p>
            </div>
            <button
              onClick={() => setActiveTab('tasks')}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <span>{t('allTasks')}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2">
            {todayTasks.length === 0 ? (
              <div className="py-8 text-center border border-dashed border-neutral-200 dark:border-neutral-800 rounded-lg">
                <p className="text-xs text-neutral-500">
                  {t('noTasksToday')}
                </p>
                <button
                  onClick={() => openTaskModal(null, todayStr)}
                  className="mt-2 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  + Add task for today
                </button>
              </div>
            ) : (
              todayTasks.map(task => (
                <div
                  key={task.id}
                  className="flex items-center justify-between gap-3 p-3 rounded-lg border border-neutral-100 dark:border-neutral-800/80 hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <input
                      type="checkbox"
                      checked={false}
                      onChange={() => toggleTaskCompletion(task.id)}
                      className="w-4 h-4 rounded-sm text-indigo-600 border-neutral-300 dark:border-neutral-700 focus:ring-indigo-500 cursor-pointer"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-neutral-900 dark:text-neutral-100 truncate">
                        {task.title}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-neutral-500 mt-0.5">
                        <span className="capitalize">{task.priority}</span>
                        <span aria-hidden="true">·</span>
                        <span>{task.category}</span>
                      </div>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-sm uppercase ${
                      task.priority === 'urgent'
                        ? 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400'
                        : task.priority === 'high'
                        ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400'
                        : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'
                    }`}
                  >
                    {task.priority}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Project Progress Tracker */}
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                {t('projectProgress')}
              </h3>
              <p className="text-xs text-neutral-500">
                Milestone completion across active projects
              </p>
            </div>
            <button
              onClick={() => setActiveTab('projects')}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <span>{t('projects')}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-4">
            {projects.length === 0 ? (
              <div className="py-8 text-center text-xs text-neutral-400">
                {t('noProjectsFound')}
              </div>
            ) : (
              projects.map(project => {
                const projectTasks = tasks.filter(t => t.projectId === project.id);
                const projectArchived = archivedTasks.filter(t => t.projectId === project.id);
                const totalProjTasks = projectTasks.length + projectArchived.length;
                const completedProjTasks = projectArchived.length;
                const progress = totalProjTasks > 0 ? Math.round((completedProjTasks / totalProjTasks) * 100) : 0;

                return (
                  <div key={project.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 font-medium text-neutral-800 dark:text-neutral-200">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: project.color }}
                        />
                        <span className="truncate max-w-[200px]">{project.name}</span>
                      </div>
                      <div className="flex items-center gap-2 font-mono text-[11px] text-neutral-500">
                        <span>{completedProjTasks}/{totalProjTasks}</span>
                        <span className="font-semibold text-neutral-700 dark:text-neutral-300">{progress}%</span>
                      </div>
                    </div>

                    <div className="w-full bg-neutral-100 dark:bg-neutral-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${progress}%`,
                          backgroundColor: project.color || '#4f46e5',
                        }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
