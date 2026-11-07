import React, { useState } from 'react';
import {
  User,
  Mail,
  Calendar,
  Sparkles,
  Trophy,
  CheckCircle2,
  FolderKanban,
  Edit2,
  Save,
  Check,
  TrendingUp,
  Flame
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTaskFlow } from '../../context/TaskFlowContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { calculateLevelInfo } from '../../services/storage';

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&h=256&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&h=256&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&h=256&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=256&h=256&q=80',
];

export const ProfileView: React.FC = () => {
  const { currentUser, updateProfile } = useAuth();
  const { tasks, archivedTasks, projects } = useTaskFlow();
  const { language, t } = useLanguage();

  const isAr = language === 'ar';

  const [fullName, setFullName] = useState(currentUser?.fullName || '');
  const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatarUrl || AVATAR_PRESETS[0]);
  const [isEditing, setIsEditing] = useState(false);
  const [successNotice, setSuccessNotice] = useState(false);

  const totalTasks = tasks.length + archivedTasks.length;
  const completedTasks = archivedTasks.length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const levelInfo = calculateLevelInfo(currentUser?.points || 0);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    updateProfile({
      fullName: fullName.trim(),
      avatarUrl,
    });

    setIsEditing(false);
    setSuccessNotice(true);
    setTimeout(() => setSuccessNotice(false), 3000);
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
          {t('profileTitle')}
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500">
          {t('profileSubtitle')}
        </p>
      </div>

      {successNotice && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold rounded-lg flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>{t('profileUpdatedSuccess')}</span>
        </div>
      )}

      {/* Profile Card */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-4">
            <img
              src={currentUser?.avatarUrl || avatarUrl}
              alt={currentUser?.fullName}
              referrerPolicy="no-referrer"
              className="w-16 h-16 rounded-full object-cover border-2 border-indigo-500/30"
            />
            <div>
              <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                {currentUser?.fullName}
              </h2>
              <p className="text-xs text-neutral-500 font-mono">
                {currentUser?.email}
              </p>
              <div className="flex items-center gap-2 mt-1 text-[11px] text-neutral-400">
                <Calendar className="w-3.5 h-3.5" />
                <span>
                  {t('accountCreated')}: {currentUser ? new Date(currentUser.createdAt).toLocaleDateString() : ''}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsEditing(prev => !prev)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg transition-colors self-start sm:self-auto"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>{isEditing ? t('cancel') : t('edit')}</span>
          </button>
        </div>

        {/* Edit Profile Form */}
        {isEditing && (
          <form onSubmit={handleSave} className="pt-6 space-y-4 border-b border-neutral-100 dark:border-neutral-800 pb-6">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                {t('fullName')}
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="w-full max-w-md px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
                {t('avatarSelection')}
              </label>
              <div className="flex items-center gap-3">
                {AVATAR_PRESETS.map((url, idx) => (
                  <img
                    key={idx}
                    src={url}
                    alt="Preset"
                    onClick={() => setAvatarUrl(url)}
                    className={`w-10 h-10 rounded-full object-cover cursor-pointer transition-transform ${
                      avatarUrl === url ? 'ring-2 ring-indigo-500 scale-110' : 'opacity-70 hover:opacity-100'
                    }`}
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{t('save')}</span>
            </button>
          </form>
        )}

        {/* Statistics Breakdown Grid */}
        <div className="pt-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-4">
            {t('statisticsBreakdown')}
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-800">
              <span className="text-[11px] text-neutral-400 block mb-1">{t('totalTasksCreated')}</span>
              <span className="text-xl font-bold font-mono text-neutral-900 dark:text-neutral-100">
                {totalTasks}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-800">
              <span className="text-[11px] text-neutral-400 block mb-1">{t('totalTasksCompleted')}</span>
              <span className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                {completedTasks}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-800">
              <span className="text-[11px] text-neutral-400 block mb-1">{t('completionRate')}</span>
              <span className="text-xl font-bold font-mono text-indigo-600 dark:text-indigo-400">
                {completionRate}%
              </span>
            </div>

            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-800">
              <span className="text-[11px] text-neutral-400 block mb-1">{t('activeProjectsCount')}</span>
              <span className="text-xl font-bold font-mono text-neutral-900 dark:text-neutral-100">
                {projects.length}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-800">
              <span className="text-[11px] text-neutral-400 block mb-1">{t('totalPoints')}</span>
              <span className="text-xl font-bold font-mono text-amber-600 dark:text-amber-400">
                {currentUser?.points || 0} XP
              </span>
            </div>

            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-800">
              <span className="text-[11px] text-neutral-400 block mb-1">{t('streakTitle')}</span>
              <span className="text-xl font-bold font-mono text-neutral-900 dark:text-neutral-100">
                {currentUser?.currentStreak || 0} days
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
