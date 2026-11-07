import React, { useState } from 'react';
import {
  Plus,
  Search,
  Bell,
  Sun,
  Moon,
  Globe,
  Menu,
  CheckCircle2
} from 'lucide-react';
import { useTaskFlow, NavigationTab } from '../../context/TaskFlowContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { NotificationDropdown } from '../common/NotificationDropdown';

interface HeaderProps {
  onToggleMobileNav: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobileNav }) => {
  const {
    activeTab,
    openTaskModal,
    searchQuery,
    setSearchQuery,
    unreadNotificationsCount,
    celebrationBanner,
    dismissCelebration,
  } = useTaskFlow();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();

  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const getBreadcrumbTitle = (tab: NavigationTab) => {
    switch (tab) {
      case 'dashboard':
        return t('dashboard');
      case 'tasks':
        return t('tasks');
      case 'projects':
        return t('projects');
      case 'calendar':
        return t('calendar');
      case 'archive':
        return t('archive');
      case 'achievements':
        return t('achievements');
      case 'profile':
        return t('profile');
      case 'settings':
        return t('settings');
      default:
        return '';
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  };

  return (
    <header className="sticky top-0 z-30 flex flex-col w-full bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800 transition-colors">
      {/* Celebration top alert banner if active */}
      {celebrationBanner && (
        <div className="bg-emerald-600 text-white px-4 py-2 text-xs font-medium flex items-center justify-between animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{celebrationBanner.message}</span>
          </div>
          <button
            onClick={dismissCelebration}
            className="text-emerald-100 hover:text-white transition-colors text-xs font-semibold"
          >
            {t('close')}
          </button>
        </div>
      )}

      <div className="flex items-center justify-between gap-4 px-4 sm:px-6 h-16">
        {/* Left Zone: Mobile toggle & Breadcrumb */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onToggleMobileNav}
            className="md:hidden p-2 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 text-xs sm:text-sm font-medium">
            <span className="text-neutral-500 dark:text-neutral-400 hidden sm:inline">
              {t('appName')}
            </span>
            <span className="text-neutral-300 dark:text-neutral-700 hidden sm:inline" aria-hidden="true">
              /
            </span>
            <span className="font-semibold text-neutral-900 dark:text-neutral-100 whitespace-nowrap">
              {getBreadcrumbTitle(activeTab)}
            </span>
          </div>
        </div>

        {/* Center Zone: Quick Search */}
        <div className="hidden lg:flex items-center flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search className="absolute top-1/2 -translate-y-1/2 start-3 w-4 h-4 text-neutral-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="w-full ps-9 pe-4 py-1.5 text-xs bg-neutral-100 dark:bg-neutral-800/80 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 focus:bg-white dark:focus:bg-neutral-900 border border-transparent focus:border-indigo-500 rounded-lg text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-hidden transition-all"
            />
          </div>
        </div>

        {/* Right Zone: Actions & Utilities */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Primary Action Button */}
          <button
            onClick={() => openTaskModal()}
            className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg shadow-xs transition-colors whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>{t('newTask')}</span>
          </button>

          {/* Language Switcher */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1 px-2.5 py-2 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors whitespace-nowrap shrink-0"
            title={language === 'en' ? 'التبديل إلى العربية' : 'Switch to English'}
          >
            <Globe className="w-4 h-4 text-neutral-500" />
            <span className="hidden sm:inline font-mono">
              {language === 'en' ? 'عربي' : 'EN'}
            </span>
          </button>

          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            className="p-2 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors shrink-0"
            title={theme === 'dark' ? t('lightMode') : t('darkMode')}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-neutral-600" />
            )}
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setIsNotifOpen(prev => !prev)}
              className="relative p-2 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors shrink-0"
              title={t('notifications')}
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute top-1.5 end-1.5 w-2 h-2 bg-indigo-600 rounded-full" />
              )}
            </button>

            <NotificationDropdown
              isOpen={isNotifOpen}
              onClose={() => setIsNotifOpen(false)}
            />
          </div>
        </div>
      </div>
    </header>
  );
};
