import React from 'react';
import {
  LayoutDashboard,
  CheckSquare,
  FolderKanban,
  Calendar,
  X
} from 'lucide-react';
import { useTaskFlow, NavigationTab } from '../../context/TaskFlowContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { Sidebar } from './Sidebar';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ isOpen, onClose }) => {
  const { activeTab, setActiveTab } = useTaskFlow();
  const { t } = useLanguage();

  const quickNav: Array<{ id: NavigationTab; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: 'dashboard', label: t('dashboard'), icon: LayoutDashboard },
    { id: 'tasks', label: t('tasks'), icon: CheckSquare },
    { id: 'projects', label: t('projects'), icon: FolderKanban },
    { id: 'calendar', label: t('calendar'), icon: Calendar },
  ];

  return (
    <>
      {/* Slide-over Full Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex animate-in fade-in duration-200">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={onClose}
          />
          <div className="relative z-10 w-72 max-w-[85vw] h-full shadow-2xl animate-in slide-in-from-start duration-200">
            <button
              onClick={onClose}
              className="absolute top-4 end-4 p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 bg-neutral-100 dark:bg-neutral-800 transition-colors z-20"
              aria-label="Close menu"
            >
              <X className="w-4 h-4" />
            </button>
            <Sidebar onItemClick={onClose} />
          </div>
        </div>
      )}

      {/* Persistent Bottom Quick Navigation Bar for Mobile */}
      <nav className="fixed bottom-0 inset-x-0 z-30 md:hidden bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border-t border-neutral-200 dark:border-neutral-800 px-2 py-1.5 flex items-center justify-around shadow-lg">
        {quickNav.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg text-[10px] font-medium transition-colors ${
                isActive
                  ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
              }`}
            >
              <Icon className="w-4 h-4 mb-0.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
