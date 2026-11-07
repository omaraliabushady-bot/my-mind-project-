import React, { useRef, useEffect } from 'react';
import {
  Bell,
  CheckCheck,
  Trash2,
  Clock,
  AlertCircle,
  Trophy,
  Award,
  CheckCircle2,
  FolderKanban
} from 'lucide-react';
import { useTaskFlow, NavigationTab } from '../../context/TaskFlowContext';
import { useLanguage } from '../../i18n/LanguageContext';

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ isOpen, onClose }) => {
  const {
    notifications,
    unreadNotificationsCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearAllNotifications,
    setActiveTab,
  } = useTaskFlow();
  const { language, t } = useLanguage();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isAr = language === 'ar';

  const getIcon = (type: string) => {
    switch (type) {
      case 'deadline':
        return <Clock className="w-4 h-4 text-amber-500" />;
      case 'overdue':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'achievement':
        return <Award className="w-4 h-4 text-indigo-500" />;
      case 'level_up':
        return <Trophy className="w-4 h-4 text-emerald-500" />;
      case 'project':
        return <FolderKanban className="w-4 h-4 text-blue-500" />;
      default:
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
    }
  };

  const handleNotificationClick = (id: string, linkTab?: string) => {
    markNotificationAsRead(id);
    if (linkTab) {
      setActiveTab(linkTab as NavigationTab);
      onClose();
    }
  };

  return (
    <div
      ref={dropdownRef}
      className={`absolute top-full mt-2 w-80 sm:w-96 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-xl z-50 overflow-hidden text-start ${
        isAr ? 'left-0' : 'right-0'
      }`}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-neutral-500" />
          <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            {t('notifications')}
          </h4>
          {unreadNotificationsCount > 0 && (
            <span className="text-xs font-mono font-medium text-indigo-600 dark:text-indigo-400">
              ({unreadNotificationsCount})
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadNotificationsCount > 0 && (
            <button
              onClick={() => markAllNotificationsAsRead()}
              className="text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 flex items-center gap-1 transition-colors"
              title={t('markAllAsRead')}
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t('markAllAsRead')}</span>
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={() => clearAllNotifications()}
              className="text-xs text-neutral-400 hover:text-red-500 transition-colors p-1"
              title={t('clearAll')}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="max-h-80 overflow-y-auto divide-y divide-neutral-100 dark:divide-neutral-800/60">
        {notifications.length === 0 ? (
          <div className="py-8 text-center text-xs text-neutral-400">
            {t('noNotifications')}
          </div>
        ) : (
          notifications.map((notif, idx) => {
            const title = isAr ? notif.titleAr : notif.titleEn;
            const message = isAr ? notif.messageAr : notif.messageEn;
            const timeAgo = new Date(notif.createdAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={`${notif.id}_${idx}`}
                onClick={() => handleNotificationClick(notif.id, notif.linkTab)}
                className={`p-3.5 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 cursor-pointer transition-colors ${
                  !notif.isRead ? 'bg-indigo-50/40 dark:bg-indigo-950/20' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="p-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 shrink-0 mt-0.5">
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                        {title}
                      </span>
                      <span className="text-[10px] text-neutral-400 font-mono shrink-0">
                        {timeAgo}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2 leading-relaxed">
                      {message}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
