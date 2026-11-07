import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider, useLanguage } from './i18n/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TaskFlowProvider, useTaskFlow } from './context/TaskFlowContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { MobileNav } from './components/layout/MobileNav';
import { DashboardView } from './components/dashboard/DashboardView';
import { TasksView } from './components/tasks/TasksView';
import { ProjectsView } from './components/projects/ProjectsView';
import { CalendarView } from './components/calendar/CalendarView';
import { ArchiveView } from './components/archive/ArchiveView';
import { AchievementsView } from './components/gamification/AchievementsView';
import { ProfileView } from './components/profile/ProfileView';
import { SettingsView } from './components/settings/SettingsView';
import { TaskModal } from './components/tasks/TaskModal';
import { ProjectModal } from './components/projects/ProjectModal';
import { ConfirmationModal } from './components/common/ConfirmationModal';
import { AuthModal } from './components/auth/AuthModal';

const AppContent: React.FC = () => {
  const { activeTab } = useTaskFlow();
  const { isAuthenticated, openAuthModal } = useAuth();
  const { t } = useLanguage();

  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'tasks':
        return <TasksView />;
      case 'projects':
        return <ProjectsView />;
      case 'calendar':
        return <CalendarView />;
      case 'archive':
        return <ArchiveView />;
      case 'achievements':
        return <AchievementsView />;
      case 'profile':
        return <ProfileView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 transition-colors">
      {/* Desktop Sidebar (Fixed 256px) */}
      <div className="hidden md:flex h-full shrink-0">
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        {/* Top Header */}
        <Header onToggleMobileNav={() => setIsMobileNavOpen(true)} />

        {/* Scrollable Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {renderActiveView()}
          </div>
        </main>
      </div>

      {/* Mobile Nav Drawer & Floating Bottom Nav */}
      <MobileNav
        isOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
      />

      {/* Modals & Dialogs */}
      <TaskModal />
      <ProjectModal />
      <ConfirmationModal />
      <AuthModal />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <TaskFlowProvider>
            <AppContent />
          </TaskFlowProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
