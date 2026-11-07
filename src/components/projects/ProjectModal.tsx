import React, { useState, useEffect } from 'react';
import { X, FolderKanban } from 'lucide-react';
import { useTaskFlow } from '../../context/TaskFlowContext';
import { useLanguage } from '../../i18n/LanguageContext';

const PRESET_COLORS = [
  '#4f46e5', // Indigo
  '#059669', // Emerald
  '#2563eb', // Blue
  '#d97706', // Amber
  '#dc2626', // Red
  '#7c3aed', // Purple
  '#db2777', // Pink
  '#0d9488', // Teal
];

export const ProjectModal: React.FC = () => {
  const { isProjectModalOpen, projectToEdit, closeProjectModal, createProject, updateProject } = useTaskFlow();
  const { t } = useLanguage();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#4f46e5');
  const [error, setError] = useState('');

  useEffect(() => {
    if (projectToEdit) {
      setName(projectToEdit.name);
      setDescription(projectToEdit.description || '');
      setColor(projectToEdit.color || '#4f46e5');
    } else {
      setName('');
      setDescription('');
      setColor('#4f46e5');
    }
    setError('');
  }, [projectToEdit, isProjectModalOpen]);

  if (!isProjectModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Project name is required');
      return;
    }

    if (projectToEdit) {
      updateProject({
        ...projectToEdit,
        name: name.trim(),
        description: description.trim(),
        color,
      });
    } else {
      createProject(name.trim(), description.trim(), color);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden text-start p-6"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <FolderKanban className="w-4 h-4" />
            </span>
            <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
              {projectToEdit ? t('editProject') : t('newProject')}
            </h3>
          </div>
          <button
            onClick={closeProjectModal}
            className="p-1.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-xs bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              {t('projectName')} *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Mobile App Redesign"
              className="w-full px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:border-indigo-500 focus:outline-hidden text-neutral-900 dark:text-neutral-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              {t('projectDescription')}
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Objectives and scope for this initiative..."
              className="w-full px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:border-indigo-500 focus:outline-hidden text-neutral-900 dark:text-neutral-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
              {t('projectColor')}
            </label>
            <div className="flex items-center gap-2.5 flex-wrap">
              {PRESET_COLORS.map(c => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full transition-transform ${
                    color === c ? 'scale-110 ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-neutral-900' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: c }}
                  aria-label={`Select color ${c}`}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">
            <button
              type="button"
              onClick={closeProjectModal}
              className="px-4 py-2 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg shadow-xs transition-colors"
            >
              {projectToEdit ? t('save') : t('create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
