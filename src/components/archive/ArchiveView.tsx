import React, { useState, useMemo } from 'react';
import {
  Archive,
  Download,
  RotateCcw,
  Trash2,
  Search,
  Filter,
  Calendar,
  CheckCircle2,
  FileSpreadsheet,
  Clock,
  Sparkles,
  X
} from 'lucide-react';
import { useTaskFlow } from '../../context/TaskFlowContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { Task } from '../../types';

export const ArchiveView: React.FC = () => {
  const {
    archivedTasks,
    projects,
    restoreTask,
    permanentlyDeleteArchived,
    showConfirmDialog,
    exportArchivedTasks,
  } = useTaskFlow();
  const { language, t } = useLanguage();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Export modal state
  const [exportProjectFilter, setExportProjectFilter] = useState('all');
  const [exportDateFrom, setExportDateFrom] = useState('');
  const [exportDateTo, setExportDateTo] = useState('');

  const projectMap = useMemo(() => {
    const map = new Map<string, { name: string; color: string }>();
    projects.forEach(p => map.set(p.id, { name: p.name, color: p.color }));
    return map;
  }, [projects]);

  // Filtered archived tasks
  const filteredArchived = useMemo(() => {
    let result = [...archivedTasks];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        t =>
          t.title.toLowerCase().includes(q) ||
          (t.description && t.description.toLowerCase().includes(q)) ||
          (t.tags && t.tags.some(tag => tag.toLowerCase().includes(q)))
      );
    }

    if (selectedProjectId !== 'all') {
      result = result.filter(t => t.projectId === selectedProjectId);
    }

    if (dateFrom) {
      result = result.filter(t => {
        const cDate = t.completedAt ? t.completedAt.split('T')[0] : '';
        return cDate >= dateFrom;
      });
    }

    if (dateTo) {
      result = result.filter(t => {
        const cDate = t.completedAt ? t.completedAt.split('T')[0] : '';
        return cDate <= dateTo;
      });
    }

    // Sort by completion date newest first
    result.sort((a, b) => {
      const timeA = a.completedAt ? new Date(a.completedAt).getTime() : 0;
      const timeB = b.completedAt ? new Date(b.completedAt).getTime() : 0;
      return timeB - timeA;
    });

    return result;
  }, [archivedTasks, searchQuery, selectedProjectId, dateFrom, dateTo]);

  const handleRestore = (task: Task) => {
    showConfirmDialog({
      title: t('restore'),
      message: `${t('restoreTaskConfirm')} ("${task.title}")`,
      confirmText: t('restore'),
      variant: 'primary',
      onConfirm: () => restoreTask(task.id),
    });
  };

  const handlePermanentDelete = (task: Task) => {
    showConfirmDialog({
      title: t('deleteArchiveTitle'),
      message: `${t('deleteArchivePrompt')} ("${task.title}")`,
      confirmText: t('permanentDelete'),
      variant: 'danger',
      onConfirm: () => permanentlyDeleteArchived(task.id),
    });
  };

  const handleTriggerExport = () => {
    exportArchivedTasks({
      projectId: exportProjectFilter !== 'all' ? exportProjectFilter : undefined,
      startDate: exportDateFrom || undefined,
      endDate: exportDateTo || undefined,
    });
    setIsExportModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            {t('archiveTitle')}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500">
            {t('archiveSubtitle')}
          </p>
        </div>

        <button
          onClick={() => setIsExportModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-lg shadow-xs transition-colors shrink-0"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>{t('exportExcel')} (.xlsx)</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute top-1/2 -translate-y-1/2 start-3 w-4 h-4 text-neutral-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={t('searchArchive')}
              className="w-full ps-9 pe-4 py-2 text-xs bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:border-indigo-500 focus:outline-hidden text-neutral-900 dark:text-neutral-100 placeholder-neutral-400"
            />
          </div>

          {/* Project Filter */}
          <select
            value={selectedProjectId}
            onChange={e => setSelectedProjectId(e.target.value)}
            className="px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:border-indigo-500 focus:outline-hidden text-neutral-900 dark:text-neutral-100 shrink-0"
          >
            <option value="all">{t('filterArchiveByProject')} ({t('all')})</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          {/* Date Range: From */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-xs text-neutral-500">{t('filterByDateFrom')}:</span>
            <input
              type="date"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:border-indigo-500 focus:outline-hidden text-neutral-900 dark:text-neutral-100"
            />
          </div>

          {/* Date Range: To */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-xs text-neutral-500">{t('filterByDateTo')}:</span>
            <input
              type="date"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:border-indigo-500 focus:outline-hidden text-neutral-900 dark:text-neutral-100"
            />
          </div>

          {(searchQuery || selectedProjectId !== 'all' || dateFrom || dateTo) && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedProjectId('all');
                setDateFrom('');
                setDateTo('');
              }}
              className="text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 px-2 py-1.5 self-center"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Archived Tasks Table / List */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-xs overflow-hidden">
        {filteredArchived.length === 0 ? (
          <div className="py-16 text-center">
            <Archive className="w-10 h-10 text-neutral-300 dark:text-neutral-700 mx-auto mb-3" />
            <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
              {t('noArchivedTasks')}
            </p>
            <p className="text-xs text-neutral-400 mt-1 max-w-sm mx-auto">
              {t('archiveEmptyDesc')}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-100 dark:divide-neutral-800/80">
            {filteredArchived.map(task => {
              const proj = projectMap.get(task.projectId);
              const completedTimeStr = task.completedAt
                ? new Date(task.completedAt).toLocaleString()
                : 'Completed';

              return (
                <div
                  key={task.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors"
                >
                  <div className="flex items-start gap-3.5 min-w-0 flex-1">
                    <div className="pt-0.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    </div>

                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs sm:text-sm font-semibold text-neutral-800 dark:text-neutral-200 line-through decoration-neutral-400">
                          {task.title}
                        </span>
                        <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                          +{task.pointsAwarded || 10} XP
                        </span>
                      </div>

                      {task.description && (
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-1">
                          {task.description}
                        </p>
                      )}

                      {/* Clean metadata without pill badges */}
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
                        <span className="uppercase">{task.priority}</span>

                        <span aria-hidden="true">·</span>
                        <span className="flex items-center gap-1 font-mono text-emerald-600 dark:text-emerald-400">
                          <Clock className="w-3 h-3" />
                          <span>{t('completionDate')}: {completedTimeStr}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions: Restore & Permanent Delete */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <button
                      onClick={() => handleRestore(task)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                      title={t('restore')}
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>{t('restore')}</span>
                    </button>
                    <button
                      onClick={() => handlePermanentDelete(task)}
                      className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors"
                      title={t('permanentDelete')}
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

      {/* Excel Export Modal */}
      {isExportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-2xl p-6 text-start space-y-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                  {t('exportOptions')}
                </h3>
              </div>
              <button
                onClick={() => setIsExportModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-neutral-500">
              Select criteria for your Excel (.xlsx) file export. The generated workbook includes Task IDs, titles, descriptions, project provenance, completion timestamps, and points earned.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  {t('exportByProject')}
                </label>
                <select
                  value={exportProjectFilter}
                  onChange={e => setExportProjectFilter(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100"
                >
                  <option value="all">{t('exportAllArchived')}</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    {t('filterByDateFrom')}
                  </label>
                  <input
                    type="date"
                    value={exportDateFrom}
                    onChange={e => setExportDateFrom(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    {t('filterByDateTo')}
                  </label>
                  <input
                    type="date"
                    value={exportDateTo}
                    onChange={e => setExportDateTo(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-200 dark:border-neutral-800">
              <button
                type="button"
                onClick={() => setIsExportModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg"
              >
                {t('cancel')}
              </button>
              <button
                type="button"
                onClick={handleTriggerExport}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .xlsx</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
