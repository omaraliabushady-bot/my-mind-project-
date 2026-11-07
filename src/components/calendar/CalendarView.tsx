import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Flag
} from 'lucide-react';
import { useTaskFlow } from '../../context/TaskFlowContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { Task } from '../../types';

export const CalendarView: React.FC = () => {
  const {
    tasks,
    archivedTasks,
    openTaskModal,
    toggleTaskCompletion,
    projects,
  } = useTaskFlow();
  const { language, t } = useLanguage();

  const isAr = language === 'ar';
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth()); // 0-indexed
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  const projectMap = useMemo(() => {
    const map = new Map<string, { name: string; color: string }>();
    projects.forEach(p => map.set(p.id, { name: p.name, color: p.color }));
    return map;
  }, [projects]);

  const monthNamesEn = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const monthNamesAr = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ];

  const daysOfWeekEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const daysOfWeekAr = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const handleJumpToToday = () => {
    const now = new Date();
    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth());
    setSelectedDate(todayStr);
  };

  // Calendar matrix calculation
  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
    const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

    const days: Array<{
      dateStr: string;
      dayNumber: number;
      isCurrentMonth: boolean;
      isToday: boolean;
    }> = [];

    // Prev month padding
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const prevM = currentMonth === 0 ? 11 : currentMonth - 1;
      const prevY = currentMonth === 0 ? currentYear - 1 : currentYear;
      const dStr = `${prevY}-${String(prevM + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      days.push({
        dateStr: dStr,
        dayNumber: dayNum,
        isCurrentMonth: false,
        isToday: dStr === todayStr,
      });
    }

    // Current month days
    for (let dayNum = 1; dayNum <= daysInCurrentMonth; dayNum++) {
      const dStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      days.push({
        dateStr: dStr,
        dayNumber: dayNum,
        isCurrentMonth: true,
        isToday: dStr === todayStr,
      });
    }

    // Next month padding to reach 35 or 42 cells
    const remaining = 42 - days.length;
    for (let dayNum = 1; dayNum <= remaining; dayNum++) {
      const nextM = currentMonth === 11 ? 0 : currentMonth + 1;
      const nextY = currentMonth === 11 ? currentYear + 1 : currentYear;
      const dStr = `${nextY}-${String(nextM + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      days.push({
        dateStr: dStr,
        dayNumber: dayNum,
        isCurrentMonth: false,
        isToday: dStr === todayStr,
      });
    }

    return days;
  }, [currentYear, currentMonth, todayStr]);

  // Tasks mapped by date
  const tasksByDate = useMemo(() => {
    const map = new Map<string, { active: Task[]; completed: Task[] }>();

    tasks.forEach(t => {
      const dateKey = t.dueDate;
      if (!map.has(dateKey)) {
        map.set(dateKey, { active: [], completed: [] });
      }
      map.get(dateKey)!.active.push(t);
    });

    archivedTasks.forEach(t => {
      const dateKey = t.dueDate;
      if (!map.has(dateKey)) {
        map.set(dateKey, { active: [], completed: [] });
      }
      map.get(dateKey)!.completed.push(t);
    });

    return map;
  }, [tasks, archivedTasks]);

  // Selected date tasks
  const selectedDayData = tasksByDate.get(selectedDate) || { active: [], completed: [] };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            {t('calendarTitle')}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500">
            {t('calendarSubtitle')}
          </p>
        </div>

        {/* Calendar Nav Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleJumpToToday}
            className="px-3 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg transition-colors"
          >
            {t('today')}
          </button>
          <div className="flex items-center p-0.5 bg-neutral-100 dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
            <button
              onClick={handlePrevMonth}
              className="p-1 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 rounded-md"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-4 h-4 rtl:rotate-180" />
            </button>
            <span className="px-3 text-xs font-semibold text-neutral-900 dark:text-neutral-100 min-w-[120px] text-center">
              {isAr ? monthNamesAr[currentMonth] : monthNamesEn[currentMonth]} {currentYear}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 rounded-md"
              aria-label="Next month"
            >
              <ChevronRight className="w-4 h-4 rtl:rotate-180" />
            </button>
          </div>
          <button
            onClick={() => openTaskModal(null, selectedDate)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>{t('newTask')}</span>
          </button>
        </div>
      </div>

      {/* Grid: 7-column Calendar View + Selected Date Task Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Month Grid */}
        <div className="lg:col-span-2 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-xs overflow-hidden">
          {/* Day Names Header */}
          <div className="grid grid-cols-7 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/40 text-center py-2.5">
            {(isAr ? daysOfWeekAr : daysOfWeekEn).map((day, idx) => (
              <span
                key={idx}
                className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider"
              >
                {day}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 divide-x divide-y divide-neutral-100 dark:divide-neutral-800/60 text-start">
            {calendarDays.map((cell, idx) => {
              const dayTasks = tasksByDate.get(cell.dateStr);
              const activeCount = dayTasks?.active.length || 0;
              const completedCount = dayTasks?.completed.length || 0;
              const hasOverdue = dayTasks?.active.some(t => cell.dateStr < todayStr);
              const isSelected = selectedDate === cell.dateStr;

              return (
                <div
                  key={idx}
                  onClick={() => setSelectedDate(cell.dateStr)}
                  className={`min-h-[85px] sm:min-h-[100px] p-2 transition-colors cursor-pointer flex flex-col justify-between ${
                    !cell.isCurrentMonth
                      ? 'bg-neutral-50/30 dark:bg-neutral-900/30 text-neutral-400'
                      : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/40'
                  } ${
                    isSelected
                      ? 'bg-indigo-50/50 dark:bg-indigo-950/30 ring-1 ring-inset ring-indigo-500'
                      : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-mono font-semibold w-6 h-6 flex items-center justify-center rounded-full ${
                        cell.isToday
                          ? 'bg-indigo-600 text-white'
                          : isSelected
                          ? 'text-indigo-600 dark:text-indigo-400'
                          : 'text-neutral-700 dark:text-neutral-300'
                      }`}
                    >
                      {cell.dayNumber}
                    </span>

                    {/* Indicators */}
                    {activeCount > 0 && (
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.2 rounded-xs font-semibold ${
                          hasOverdue
                            ? 'bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400'
                            : 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400'
                        }`}
                      >
                        {activeCount}
                      </span>
                    )}
                  </div>

                  {/* Micro Task preview bars */}
                  <div className="space-y-1 mt-1 overflow-hidden">
                    {dayTasks?.active.slice(0, 2).map(t => (
                      <div
                        key={t.id}
                        className="text-[10px] truncate px-1 py-0.5 rounded-xs bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200"
                      >
                        {t.title}
                      </div>
                    ))}
                    {activeCount > 2 && (
                      <span className="text-[9px] text-neutral-400 block ps-1">
                        +{activeCount - 2} more
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Selected Day Tasks Inspector */}
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <div>
                <span className="text-xs text-neutral-400 uppercase tracking-wider block">
                  {t('tasksForDay')}
                </span>
                <h3 className="text-sm font-bold font-mono text-neutral-900 dark:text-neutral-100">
                  {selectedDate} {selectedDate === todayStr ? '(Today)' : ''}
                </h3>
              </div>

              <button
                onClick={() => openTaskModal(null, selectedDate)}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-semibold"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Task</span>
              </button>
            </div>

            {/* Tasks for the selected day */}
            <div className="space-y-3 max-h-[460px] overflow-y-auto">
              {selectedDayData.active.length === 0 && selectedDayData.completed.length === 0 ? (
                <div className="py-12 text-center text-xs text-neutral-400">
                  {t('noTasksOnDate')}
                  <button
                    onClick={() => openTaskModal(null, selectedDate)}
                    className="block mx-auto mt-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    + {t('quickAddTaskOnDate')}
                  </button>
                </div>
              ) : (
                <>
                  {/* Active tasks */}
                  {selectedDayData.active.map(task => {
                    const isOverdue = task.dueDate < todayStr;
                    const proj = projectMap.get(task.projectId);

                    return (
                      <div
                        key={task.id}
                        className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/40 space-y-2"
                      >
                        <div className="flex items-start gap-2.5">
                          <input
                            type="checkbox"
                            checked={false}
                            onChange={() => toggleTaskCompletion(task.id)}
                            className="w-4 h-4 mt-0.5 rounded-sm text-indigo-600 border-neutral-300 dark:border-neutral-700 cursor-pointer"
                          />
                          <div className="min-w-0 flex-1">
                            <p
                              onClick={() => openTaskModal(task)}
                              className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 hover:text-indigo-600 cursor-pointer"
                            >
                              {task.title}
                            </p>
                            <div className="flex items-center gap-2 text-[10px] text-neutral-500 mt-1">
                              <span className="uppercase font-semibold">{task.priority}</span>
                              {proj && <span>· {proj.name}</span>}
                              {isOverdue && (
                                <span className="text-red-600 dark:text-red-400 font-semibold">
                                  ({t('statusOverdue')})
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Completed tasks */}
                  {selectedDayData.completed.map(task => (
                    <div
                      key={task.id}
                      className="p-2.5 rounded-lg border border-neutral-100 dark:border-neutral-800 bg-neutral-50/30 dark:bg-neutral-800/20 opacity-70 flex items-center gap-2.5"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span className="text-xs text-neutral-500 line-through">
                        {task.title}
                      </span>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
