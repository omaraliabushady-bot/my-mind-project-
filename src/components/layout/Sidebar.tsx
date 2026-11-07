import React from 'react';
import {
  LayoutDashboard,
  CheckSquare,
  FolderKanban,
  Calendar,
  Archive,
  Trophy,
  User,
  Settings,
  LogOut,
  Sparkles,
  Flame,
  Brain
} from 'lucide-react';
import { useTaskFlow, NavigationTab } from '../../context/TaskFlowContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { calculateLevelInfo } from '../../services/storage';

interface SidebarProps {
  onItemClick?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onItemClick }) => {
  const { activeTab, setActiveTab, tasks, archivedTasks } = useTaskFlow();
  const { currentUser, logout, openAuthModal } = useAuth();
  const { language, t } = useLanguage();

  const isAr = language === 'ar';

  const navItems: Array<{
    id: NavigationTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    count?: number;
  }> = [
    {
      id: 'dashboard',
      label: t('dashboard'),
      icon: LayoutDashboard,
    },
    {
      id: 'tasks',
      label: t('tasks'),
      icon: CheckSquare,
      count: tasks.length,
    },
    {
      id: 'projects',
      label: t('projects'),
      icon: FolderKanban,
    },
    {
      id: 'calendar',
      label: t('calendar'),
      icon: Calendar,
    },
    {
      id: 'archive',
      label: t('archive'),
      icon: Archive,
      count: archivedTasks.length,
    },
    {
      id: 'achievements',
      label: t('achievements'),
      icon: Trophy,
    },
    {
      id: 'profile',
      label: t('profile'),
      icon: User,
    },
    {
      id: 'settings',
      label: t('settings'),
      icon: Settings,
    },
  ];

  const handleNavClick = (tabId: NavigationTab) => {
    setActiveTab(tabId);
    if (onItemClick) {
      onItemClick();
    }
  };

  const levelInfo = currentUser ? calculateLevelInfo(currentUser.points) : null;

  return (
    <aside className="w-64 h-full flex flex-col bg-white dark:bg-neutral-900 border-e border-neutral-200 dark:border-neutral-800 transition-colors select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center gap-3 px-6 border-b border-neutral-200 dark:border-neutral-800 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs">
          <Brain className="w-4 h-4" />
        </div>
        <div className="flex flex-col">
          <span className="text-base font-bold tracking-tight text-neutral-900 dark:text-neutral-100 whitespace-nowrap">
            {t('appName')}
          </span>
          <span className="text-[10px] text-neutral-400 font-mono tracking-wider uppercase">
            Productivity OS
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 font-semibold'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100/70 dark:hover:bg-neutral-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive
                      ? 'text-indigo-600 dark:text-indigo-400'
                      : 'text-neutral-400 dark:text-neutral-500'
                  }`}
                />
                <span className="whitespace-nowrap">{item.label}</span>
              </div>

              {typeof item.count === 'number' && item.count > 0 && (
                <span
                  className={`text-[11px] font-mono px-1.5 py-0.5 rounded-md ${
                    isActive
                      ? 'bg-indigo-200/60 text-indigo-800 dark:bg-indigo-900/80 dark:text-indigo-200'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400'
                  }`}
                >
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* User Card & Gamification Status at bottom */}
      <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 shrink-0">
        {currentUser ? (
          <div className="space-y-3">
            {/* Streak & XP Quick Indicators */}
            <div className="flex items-center justify-between px-2 py-1.5 bg-neutral-50 dark:bg-neutral-800/60 rounded-lg text-[11px]">
              <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-semibold">
                <Flame className="w-3.5 h-3.5 fill-amber-500" />
                <span>{currentUser.currentStreak} {t('streakDays')}</span>
              </div>
              <div className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-mono font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{currentUser.points} XP</span>
              </div>
            </div>

            {/* User Profile Bar */}
            <div className="flex items-center justify-between gap-2 pt-1">
              <div
                className="flex items-center gap-2.5 min-w-0 cursor-pointer"
                onClick={() => handleNavClick('profile')}
              >
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.fullName}
                  referrerPolicy="no-referrer"
                  className="w-8 h-8 rounded-full object-cover border border-neutral-200 dark:border-neutral-700 shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                    {currentUser.fullName}
                  </p>
                  <p className="text-[10px] text-neutral-400 truncate">
                    {isAr && levelInfo ? levelInfo.titleAr : levelInfo?.titleEn || 'Level 1'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => logout()}
                className="p-1.5 text-neutral-400 hover:text-red-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md transition-colors shrink-0"
                title={t('logout')}
                aria-label="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => openAuthModal('login')}
            className="w-full py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
          >
            {t('login')}
          </button>
        )}
      </div>
    </aside>
  );
};
