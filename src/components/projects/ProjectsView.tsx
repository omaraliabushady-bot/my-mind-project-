import React, { useState } from 'react';
import {
  FolderKanban,
  Plus,
  Edit3,
  Trash2,
  CheckCircle2,
  Clock,
  ArrowRight,
  ListTodo,
  Calendar
} from 'lucide-react';
import { useTaskFlow } from '../../context/TaskFlowContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { Project, Task } from '../../types';

export const ProjectsView: React.FC = () => {
  const {
    projects,
    tasks,
    archivedTasks,
    openProjectModal,
    deleteProject,
    showConfirmDialog,
    openTaskModal,
    setActiveTab,
    setFilterProject,
    toggleTaskCompletion,
  } = useTaskFlow();
  const { language, t } = useLanguage();

  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const handleDeleteProject = (p: Project) => {
    showConfirmDialog({
      title: t('deleteProjectTitle'),
      message: `${t('deleteProjectConfirm')} ("${p.name}")`,
      confirmText: t('delete'),
      variant: 'danger',
      onConfirm: () => {
        deleteProject(p.id);
        if (selectedProjectId === p.id) {
          setSelectedProjectId(null);
        }
      },
    });
  };

  const handleViewTasksInTasksTab = (projectId: string) => {
    setFilterProject(projectId);
    setActiveTab('tasks');
  };

  const activeProject = projects.find(p => p.id === selectedProjectId);
  const activeProjTasks = activeProject
    ? tasks.filter(t => t.projectId === activeProject.id)
    : [];
  const activeProjArchived = activeProject
    ? archivedTasks.filter(t => t.projectId === activeProject.id)
    : [];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            {t('projectsTitle')}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500">
            {t('projectsSubtitle')}
          </p>
        </div>

        <button
          onClick={() => openProjectModal()}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{t('newProject')}</span>
        </button>
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-12 text-center shadow-xs">
          <FolderKanban className="w-10 h-10 text-neutral-300 dark:text-neutral-700 mx-auto mb-3" />
          <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
            {t('noProjectsFound')}
          </p>
          <p className="text-xs text-neutral-400 mt-1">
            {t('createFirstProject')}
          </p>
          <button
            onClick={() => openProjectModal()}
            className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
          >
            + {t('newProject')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map(project => {
            const projectActiveTasks = tasks.filter(t => t.projectId === project.id);
            const projectCompletedTasks = archivedTasks.filter(t => t.projectId === project.id);
            const total = projectActiveTasks.length + projectCompletedTasks.length;
            const completed = projectCompletedTasks.length;
            const pending = projectActiveTasks.length;
            const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
            const isSelected = selectedProjectId === project.id;

            return (
              <div
                key={project.id}
                className={`bg-white dark:bg-neutral-900 rounded-xl border p-5 shadow-xs transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'border-indigo-600 ring-2 ring-indigo-500/20'
                    : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
                }`}
              >
                <div>
                  {/* Color bar & Actions */}
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs"
                      style={{ backgroundColor: project.color || '#4f46e5' }}
                    />
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openProjectModal(project)}
                        className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                        title={t('edit')}
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteProject(project)}
                        className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors"
                        title={t('delete')}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 mb-1">
                    {project.name}
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2 mb-4 leading-relaxed">
                    {project.description || 'No description provided.'}
                  </p>
                </div>

                {/* Progress & Metrics */}
                <div className="space-y-3 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-neutral-500">{t('projectProgressLabel')}</span>
                    <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                      {progress}%
                    </span>
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

                  {/* Task counts: total, pending, completed */}
                  <div className="grid grid-cols-3 gap-2 text-center text-[11px] pt-1 font-mono">
                    <div className="p-1.5 rounded-lg bg-neutral-50 dark:bg-neutral-800/60">
                      <span className="block text-neutral-400 text-[10px] uppercase font-sans">
                        {t('projectTasksCount')}
                      </span>
                      <span className="font-bold text-neutral-900 dark:text-neutral-100">{total}</span>
                    </div>
                    <div className="p-1.5 rounded-lg bg-neutral-50 dark:bg-neutral-800/60">
                      <span className="block text-blue-600 dark:text-blue-400 text-[10px] uppercase font-sans">
                        {t('projectPending')}
                      </span>
                      <span className="font-bold text-neutral-900 dark:text-neutral-100">{pending}</span>
                    </div>
                    <div className="p-1.5 rounded-lg bg-neutral-50 dark:bg-neutral-800/60">
                      <span className="block text-emerald-600 dark:text-emerald-400 text-[10px] uppercase font-sans">
                        {t('projectCompleted')}
                      </span>
                      <span className="font-bold text-neutral-900 dark:text-neutral-100">{completed}</span>
                    </div>
                  </div>

                  {/* Filter action button */}
                  <div className="pt-2 flex items-center justify-between">
                    <button
                      onClick={() => setSelectedProjectId(isSelected ? null : project.id)}
                      className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                    >
                      {isSelected ? 'Hide Task List' : 'View Task List'}
                    </button>
                    <button
                      onClick={() => handleViewTasksInTasksTab(project.id)}
                      className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                    >
                      <span>Manage Tasks</span>
                      <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Selected Project Expanded Task List Drawer */}
      {activeProject && (
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-xs animate-in fade-in duration-200 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-100 dark:border-neutral-800">
            <div className="flex items-center gap-2.5">
              <span
                className="w-3.5 h-3.5 rounded-full shrink-0"
                style={{ backgroundColor: activeProject.color }}
              />
              <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                Tasks in &ldquo;{activeProject.name}&rdquo;
              </h2>
            </div>

            <button
              onClick={() => openTaskModal(null, undefined)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Task to Project</span>
            </button>
          </div>

          {activeProjTasks.length === 0 && activeProjArchived.length === 0 ? (
            <div className="py-8 text-center text-xs text-neutral-400">
              No tasks currently associated with this project.
            </div>
          ) : (
            <div className="space-y-4">
              {/* Active Tasks in Project */}
              {activeProjTasks.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">
                    Active Tasks ({activeProjTasks.length})
                  </h4>
                  <div className="divide-y divide-neutral-100 dark:divide-neutral-800 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">
                    {activeProjTasks.map(task => (
                      <div
                        key={task.id}
                        className="flex items-center justify-between p-3 bg-neutral-50/50 dark:bg-neutral-800/40 hover:bg-neutral-100/60 dark:hover:bg-neutral-800/80 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={false}
                            onChange={() => toggleTaskCompletion(task.id)}
                            className="w-4 h-4 rounded-sm text-indigo-600 border-neutral-300 dark:border-neutral-700 focus:ring-indigo-500 cursor-pointer"
                          />
                          <div>
                            <p className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                              {task.title}
                            </p>
                            <span className="text-[10px] text-neutral-500">
                              Due: {task.dueDate} · {task.priority.toUpperCase()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Completed Tasks in Project */}
              {activeProjArchived.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">
                    Completed & Archived ({activeProjArchived.length})
                  </h4>
                  <div className="divide-y divide-neutral-100 dark:divide-neutral-800 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">
                    {activeProjArchived.map(task => (
                      <div
                        key={task.id}
                        className="flex items-center justify-between p-3 opacity-70 bg-neutral-50/30 dark:bg-neutral-800/20"
                      >
                        <div className="flex items-center gap-3">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                          <div>
                            <p className="text-xs font-medium line-through text-neutral-500">
                              {task.title}
                            </p>
                            <span className="text-[10px] text-neutral-400">
                              Completed on {task.completedAt ? new Date(task.completedAt).toLocaleDateString() : ''}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
