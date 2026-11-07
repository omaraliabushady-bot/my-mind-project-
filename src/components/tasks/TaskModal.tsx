import React, { useState, useEffect } from 'react';
import { X, Calendar, Flag, FolderKanban, Tag, FileText, Check } from 'lucide-react';
import { useTaskFlow } from '../../context/TaskFlowContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { Priority, TaskStatus } from '../../types';
import { PRIORITY_POINTS } from '../../services/storage';

export const TaskModal: React.FC = () => {
  const {
    isTaskModalOpen,
    taskToEdit,
    defaultTaskDueDate,
    closeTaskModal,
    createTask,
    updateTask,
    projects,
    categories,
    openProjectModal,
  } = useTaskFlow();
  const { language, t } = useLanguage();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [status, setStatus] = useState<TaskStatus>('pending');
  const [projectId, setProjectId] = useState('');
  const [category, setCategory] = useState('Engineering');
  const [startDate, setStartDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description || '');
      setNotes(taskToEdit.notes || '');
      setPriority(taskToEdit.priority);
      setStatus(taskToEdit.status);
      setProjectId(taskToEdit.projectId || '');
      setCategory(taskToEdit.category || 'General');
      setStartDate(taskToEdit.startDate || '');
      setDueDate(taskToEdit.dueDate || '');
      setTags(taskToEdit.tags || []);
    } else {
      const today = new Date().toISOString().split('T')[0];
      setTitle('');
      setDescription('');
      setNotes('');
      setPriority('medium');
      setStatus('pending');
      setProjectId(projects.length > 0 ? projects[0].id : '');
      setCategory(categories.length > 0 ? categories[0].name : 'General');
      setStartDate(today);
      setDueDate(defaultTaskDueDate || today);
      setTags([]);
    }
    setError('');
  }, [taskToEdit, isTaskModalOpen, defaultTaskDueDate, projects, categories]);

  if (!isTaskModalOpen) return null;

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const clean = tagInput.trim().replace(/^#/, '');
      if (!tags.includes(clean)) {
        setTags([...tags, clean]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Task title is required');
      return;
    }
    if (!dueDate) {
      setError('Due date is required');
      return;
    }

    if (taskToEdit) {
      updateTask({
        ...taskToEdit,
        title: title.trim(),
        description: description.trim(),
        notes: notes.trim(),
        priority,
        status,
        projectId,
        category,
        startDate: startDate || undefined,
        dueDate,
        tags,
      });
    } else {
      createTask({
        title: title.trim(),
        description: description.trim(),
        notes: notes.trim(),
        priority,
        status,
        projectId,
        category,
        startDate: startDate || undefined,
        dueDate,
        tags,
      });
    }
  };

  const priorityOptions: Array<{ value: Priority; label: string; points: number; color: string }> = [
    { value: 'low', label: t('priorityLow'), points: PRIORITY_POINTS.low, color: 'text-neutral-500' },
    { value: 'medium', label: t('priorityMedium'), points: PRIORITY_POINTS.medium, color: 'text-blue-500' },
    { value: 'high', label: t('priorityHigh'), points: PRIORITY_POINTS.high, color: 'text-amber-500' },
    { value: 'urgent', label: t('priorityUrgent'), points: PRIORITY_POINTS.urgent, color: 'text-red-500' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-2xl bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden text-start max-h-[92vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 shrink-0">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <FileText className="w-4 h-4" />
            </span>
            <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
              {taskToEdit ? t('edit') : t('newTask')}
            </h3>
          </div>
          <button
            onClick={closeTaskModal}
            className="p-1.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {error && (
            <div className="p-3 text-xs bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 rounded-lg">
              {error}
            </div>
          )}

          {/* Task Title */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              {t('colTitle')} *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder={t('taskTitlePlaceholder')}
              className="w-full px-3 py-2 text-sm bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:border-indigo-500 focus:outline-hidden text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 transition-colors"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              {t('colDescription')}
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder={t('taskDescPlaceholder')}
              className="w-full px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:border-indigo-500 focus:outline-hidden text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 transition-colors"
            />
          </div>

          {/* Priority Selection with XP Values */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
              {t('priority')} & Rewards
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {priorityOptions.map(opt => (
                <button
                  type="button"
                  key={opt.value}
                  onClick={() => setPriority(opt.value)}
                  className={`flex flex-col items-center justify-center p-2 rounded-lg border text-xs font-medium transition-all ${
                    priority === opt.value
                      ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 text-neutral-900 dark:text-neutral-100 shadow-xs'
                      : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <Flag className={`w-3.5 h-3.5 ${opt.color}`} />
                    <span>{opt.label}</span>
                  </div>
                  <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400">
                    +{opt.points} XP
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Project & Category Dual Columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Project */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  {t('colProject')}
                </label>
                <button
                  type="button"
                  onClick={() => openProjectModal()}
                  className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  + {t('newProject')}
                </button>
              </div>
              <div className="relative">
                <select
                  value={projectId}
                  onChange={e => setProjectId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:border-indigo-500 focus:outline-hidden text-neutral-900 dark:text-neutral-100 transition-colors"
                >
                  <option value="">{t('selectProject')} (Unassigned)</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                {t('colCategory')}
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:border-indigo-500 focus:outline-hidden text-neutral-900 dark:text-neutral-100 transition-colors"
              >
                {categories.map(c => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Dates: Start Date & Due Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                {t('startDate')}
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:border-indigo-500 focus:outline-hidden text-neutral-900 dark:text-neutral-100 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                {t('dueDate')} *
              </label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:border-indigo-500 focus:outline-hidden text-neutral-900 dark:text-neutral-100 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              {t('taskTags')}
            </label>
            <div className="flex flex-wrap items-center gap-1.5 p-2 bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 rounded-lg">
              {tags.map(tag => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-red-500 text-neutral-400"
                  >
                    ×
                  </button>
                </span>
              ))}
              <input
                type="text"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder={tags.length === 0 ? t('addTagPlaceholder') : 'Add tag...'}
                className="flex-1 min-w-[120px] bg-transparent text-xs text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              {t('taskNotes')}
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder={t('taskNotesPlaceholder')}
              className="w-full px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:border-indigo-500 focus:outline-hidden text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 transition-colors"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">
            <button
              type="button"
              onClick={closeTaskModal}
              className="px-4 py-2 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg shadow-xs transition-colors"
            >
              {taskToEdit ? t('save') : t('create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
