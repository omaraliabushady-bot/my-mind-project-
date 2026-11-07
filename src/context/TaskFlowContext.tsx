import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { playTaskCompletionSound, playAchievementSound } from '../utils/sound';
import {
  Task,
  Project,
  Category,
  PointsTransaction,
  UserAchievement,
  UserNotification,
  UserSettings,
  Priority,
  TaskStatus,
  Achievement
} from '../types';
import { StorageService, ACHIEVEMENTS_CATALOG, calculateLevelInfo } from '../services/storage';
import { useAuth } from './AuthContext';
import { useLanguage } from '../i18n/LanguageContext';

export type NavigationTab =
  | 'dashboard'
  | 'tasks'
  | 'projects'
  | 'calendar'
  | 'archive'
  | 'achievements'
  | 'profile'
  | 'settings';

interface ConfirmDialogState {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  variant?: 'danger' | 'primary';
  onConfirm: () => void;
}

interface TaskFlowContextType {
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  // Data
  tasks: Task[];
  archivedTasks: Task[];
  projects: Project[];
  categories: Category[];
  transactions: PointsTransaction[];
  userAchievements: UserAchievement[];
  achievementsCatalog: Achievement[];
  notifications: UserNotification[];
  unreadNotificationsCount: number;
  settings: UserSettings;
  // Filter & Search states
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  filterProject: string;
  setFilterProject: (id: string) => void;
  filterPriority: string;
  setFilterPriority: (priority: string) => void;
  filterStatus: string;
  setFilterStatus: (status: string) => void;
  filterCategory: string;
  setFilterCategory: (cat: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  // Tasks Actions
  createTask: (taskInput: Omit<Task, 'id' | 'userId' | 'createdAt' | 'isArchived'>) => void;
  updateTask: (task: Task) => void;
  deleteTask: (taskId: string) => void;
  toggleTaskCompletion: (taskId: string) => void;
  restoreTask: (taskId: string) => void;
  permanentlyDeleteArchived: (taskId: string) => void;
  // Project Actions
  createProject: (name: string, description: string, color: string) => void;
  updateProject: (project: Project) => void;
  deleteProject: (projectId: string) => void;
  // Notifications
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  clearAllNotifications: () => void;
  // Settings
  updateSettings: (updates: Partial<UserSettings>) => void;
  // Modals
  isTaskModalOpen: boolean;
  taskToEdit: Task | null;
  defaultTaskDueDate?: string;
  openTaskModal: (task?: Task | null, defaultDueDate?: string) => void;
  closeTaskModal: () => void;
  isProjectModalOpen: boolean;
  projectToEdit: Project | null;
  openProjectModal: (project?: Project | null) => void;
  closeProjectModal: () => void;
  // Confirm Dialog
  confirmDialog: ConfirmDialogState;
  showConfirmDialog: (config: Omit<ConfirmDialogState, 'isOpen'>) => void;
  closeConfirmDialog: () => void;
  // Excel Export
  exportArchivedTasks: (options?: { projectId?: string; startDate?: string; endDate?: string }) => void;
  // Reset Data
  resetAllData: () => void;
  // Latest celebration message
  celebrationBanner: { message: string; points: number } | null;
  dismissCelebration: () => void;
}

const TaskFlowContext = createContext<TaskFlowContextType | undefined>(undefined);

export const TaskFlowProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, updateProfile } = useAuth();
  const { language, t } = useLanguage();

  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');

  // Core Data states
  const [tasks, setTasks] = useState<Task[]>([]);
  const [archivedTasks, setArchivedTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<PointsTransaction[]>([]);
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [settings, setSettings] = useState<UserSettings>({
    language: 'en',
    theme: 'dark',
    enableSound: true,
    notifyDeadlines: true,
    notifyOverdue: true,
    notifyAchievements: true,
  });

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterProject, setFilterProject] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('dueDateAsc');

  // Modals
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [defaultTaskDueDate, setDefaultTaskDueDate] = useState<string | undefined>(undefined);

  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);

  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const [celebrationBanner, setCelebrationBanner] = useState<{ message: string; points: number } | null>(null);

  // Load active user's data
  const loadUserData = useCallback(() => {
    if (!currentUser) {
      setTasks([]);
      setArchivedTasks([]);
      setProjects([]);
      setCategories([]);
      setTransactions([]);
      setUserAchievements([]);
      setNotifications([]);
      return;
    }

    const store = StorageService.getUserStore(currentUser.id);
    const { active, archived } = StorageService.getTasks(currentUser.id);

    setTasks(active);
    setArchivedTasks(archived);
    setProjects(store.projects);
    setCategories(store.categories);
    setTransactions(store.transactions);
    setUserAchievements(store.userAchievements);
    setNotifications(store.notifications);
    setSettings(store.settings);
  }, [currentUser]);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  // Tasks actions
  const createTask = (taskInput: Omit<Task, 'id' | 'userId' | 'createdAt' | 'isArchived'>) => {
    if (!currentUser) return;
    StorageService.createTask(currentUser.id, taskInput);
    loadUserData();
    closeTaskModal();
  };

  const updateTask = (task: Task) => {
    if (!currentUser) return;
    StorageService.updateTask(currentUser.id, task);
    loadUserData();
    closeTaskModal();
  };

  const deleteTask = (taskId: string) => {
    if (!currentUser) return;
    StorageService.deleteTask(currentUser.id, taskId);
    loadUserData();
  };

  const toggleTaskCompletion = (taskId: string) => {
    if (!currentUser) return;

    const res = StorageService.completeTask(currentUser.id, taskId);
    loadUserData();

    // Trigger audio chime for task completion
    if (res.leveledUp || res.newAchievements.length > 0) {
      playAchievementSound(settings.enableSound);
    } else {
      playTaskCompletionSound(settings.enableSound);
    }

    // Trigger celebration effects
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });
    } catch {
      // ignore
    }

    // Set celebration notice
    if (res.pointsEarned > 0) {
      setCelebrationBanner({
        message: t('taskCompletedCelebration', { points: res.pointsEarned }),
        points: res.pointsEarned,
      });
      setTimeout(() => {
        setCelebrationBanner(null);
      }, 5000);
    }

    // Update auth profile points & level
    updateProfile({
      points: res.store.profile.points,
      level: res.store.profile.level,
      currentStreak: res.store.profile.currentStreak,
      longestStreak: res.store.profile.longestStreak,
    });
  };

  const restoreTask = (taskId: string) => {
    if (!currentUser) return;
    const store = StorageService.restoreArchivedTask(currentUser.id, taskId);
    loadUserData();
    updateProfile({
      points: store.profile.points,
      level: store.profile.level,
    });
  };

  const permanentlyDeleteArchived = (taskId: string) => {
    if (!currentUser) return;
    StorageService.permanentlyDeleteArchivedTask(currentUser.id, taskId);
    loadUserData();
  };

  // Projects actions
  const createProject = (name: string, description: string, color: string) => {
    if (!currentUser) return;
    StorageService.createProject(currentUser.id, name, description, color);
    loadUserData();
    closeProjectModal();
  };

  const updateProject = (project: Project) => {
    if (!currentUser) return;
    StorageService.updateProject(currentUser.id, project);
    loadUserData();
    closeProjectModal();
  };

  const deleteProject = (projectId: string) => {
    if (!currentUser) return;
    StorageService.deleteProject(currentUser.id, projectId);
    loadUserData();
  };

  // Notifications
  const markNotificationAsRead = (id: string) => {
    if (!currentUser) return;
    StorageService.markNotificationAsRead(currentUser.id, id);
    loadUserData();
  };

  const markAllNotificationsAsRead = () => {
    if (!currentUser) return;
    StorageService.markAllNotificationsAsRead(currentUser.id);
    loadUserData();
  };

  const clearAllNotifications = () => {
    if (!currentUser) return;
    StorageService.clearAllNotifications(currentUser.id);
    loadUserData();
  };

  // Settings
  const updateSettings = (updates: Partial<UserSettings>) => {
    if (!currentUser) return;
    const store = StorageService.updateSettings(currentUser.id, updates);
    setSettings(store.settings);
  };

  // Modals
  const openTaskModal = (task?: Task | null, defaultDueDate?: string) => {
    setTaskToEdit(task || null);
    setDefaultTaskDueDate(defaultDueDate);
    setIsTaskModalOpen(true);
  };

  const closeTaskModal = () => {
    setTaskToEdit(null);
    setDefaultTaskDueDate(undefined);
    setIsTaskModalOpen(false);
  };

  const openProjectModal = (project?: Project | null) => {
    setProjectToEdit(project || null);
    setIsProjectModalOpen(true);
  };

  const closeProjectModal = () => {
    setProjectToEdit(null);
    setIsProjectModalOpen(false);
  };

  // Confirm dialog
  const showConfirmDialog = (config: Omit<ConfirmDialogState, 'isOpen'>) => {
    setConfirmDialog({
      isOpen: true,
      title: config.title,
      message: config.message,
      confirmText: config.confirmText,
      variant: config.variant || 'danger',
      onConfirm: () => {
        config.onConfirm();
        closeConfirmDialog();
      },
    });
  };

  const closeConfirmDialog = () => {
    setConfirmDialog(prev => ({ ...prev, isOpen: false }));
  };

  // Excel Export
  const exportArchivedTasks = (options?: { projectId?: string; startDate?: string; endDate?: string }) => {
    StorageService.exportArchivedTasksToExcel(archivedTasks, projects, language, options);
  };

  const resetAllData = () => {
    if (!currentUser) return;
    const store = StorageService.resetUserData(currentUser.id);
    loadUserData();
    updateProfile({
      points: store.profile.points,
      level: store.profile.level,
      currentStreak: store.profile.currentStreak,
      longestStreak: store.profile.longestStreak,
    });
  };

  const dismissCelebration = () => {
    setCelebrationBanner(null);
  };

  const unreadNotificationsCount = notifications.filter(n => !n.isRead).length;

  return (
    <TaskFlowContext.Provider
      value={{
        activeTab,
        setActiveTab,
        tasks,
        archivedTasks,
        projects,
        categories,
        transactions,
        userAchievements,
        achievementsCatalog: ACHIEVEMENTS_CATALOG,
        notifications,
        unreadNotificationsCount,
        settings,
        searchQuery,
        setSearchQuery,
        filterProject,
        setFilterProject,
        filterPriority,
        setFilterPriority,
        filterStatus,
        setFilterStatus,
        filterCategory,
        setFilterCategory,
        sortBy,
        setSortBy,
        createTask,
        updateTask,
        deleteTask,
        toggleTaskCompletion,
        restoreTask,
        permanentlyDeleteArchived,
        createProject,
        updateProject,
        deleteProject,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        clearAllNotifications,
        updateSettings,
        isTaskModalOpen,
        taskToEdit,
        defaultTaskDueDate,
        openTaskModal,
        closeTaskModal,
        isProjectModalOpen,
        projectToEdit,
        openProjectModal,
        closeProjectModal,
        confirmDialog,
        showConfirmDialog,
        closeConfirmDialog,
        exportArchivedTasks,
        resetAllData,
        celebrationBanner,
        dismissCelebration,
      }}
    >
      {children}
    </TaskFlowContext.Provider>
  );
};

export const useTaskFlow = (): TaskFlowContextType => {
  const context = useContext(TaskFlowContext);
  if (!context) {
    throw new Error('useTaskFlow must be used within a TaskFlowProvider');
  }
  return context;
};
