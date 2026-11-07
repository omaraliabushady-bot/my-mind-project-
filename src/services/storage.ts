import * as XLSX from 'xlsx';
import {
  Task,
  Project,
  Category,
  UserProfile,
  UserSettings,
  PointsTransaction,
  Achievement,
  UserAchievement,
  UserNotification,
  Priority,
  WeeklyChallenge
} from '../types';

// Pre-defined achievements catalog
export const ACHIEVEMENTS_CATALOG: Achievement[] = [
  {
    id: 'ach_1',
    code: 'first_task',
    titleEn: 'First Step',
    titleAr: 'الخطوة الأولى',
    descriptionEn: 'Complete your first task and begin your productivity journey.',
    descriptionAr: 'أنجز مهمتك الأولى وابدأ مسيرتك نحو الإنتاجية العالية.',
    icon: 'Sparkles',
    category: 'completion',
    targetCount: 1,
    pointsReward: 50,
  },
  {
    id: 'ach_2',
    code: 'task_10',
    titleEn: 'Momentum Builder',
    titleAr: 'باني الزخم',
    descriptionEn: 'Successfully complete 10 tasks.',
    descriptionAr: 'أنجز 10 مهام بنجاح وحافظ على وتيرة عملك.',
    icon: 'CheckCircle2',
    category: 'completion',
    targetCount: 10,
    pointsReward: 100,
  },
  {
    id: 'ach_3',
    code: 'task_50',
    titleEn: 'Focus Champion',
    titleAr: 'بطل التركيز',
    descriptionEn: 'Successfully complete 50 tasks across projects.',
    descriptionAr: 'أنجز 50 مهمة بنجاح عبر مختلف مشاريعك.',
    icon: 'Award',
    category: 'completion',
    targetCount: 50,
    pointsReward: 250,
  },
  {
    id: 'ach_4',
    code: 'task_100',
    titleEn: 'Productivity Centurion',
    titleAr: 'قائد المائة',
    descriptionEn: 'Reach a milestone of 100 completed tasks.',
    descriptionAr: 'حقق إنجاز الوصول إلى 100 مهمة مكتملة.',
    icon: 'Trophy',
    category: 'completion',
    targetCount: 100,
    pointsReward: 500,
  },
  {
    id: 'ach_5',
    code: 'streak_7',
    titleEn: '7-Day Streak Master',
    titleAr: 'سيد الأيام السبعة',
    descriptionEn: 'Maintain a 7-day consecutive task completion streak.',
    descriptionAr: 'حافظ على سلسلة إنجاز يومية متتالية لمدة 7 أيام.',
    icon: 'Flame',
    category: 'streak',
    targetCount: 7,
    pointsReward: 300,
  },
  {
    id: 'ach_6',
    code: 'urgent_conqueror',
    titleEn: 'Crisis Commander',
    titleAr: 'قاهر الأزمات',
    descriptionEn: 'Complete 5 Urgent priority tasks on time.',
    descriptionAr: 'أنجز 5 مهام ذات أولوية عاجلة في الوقت المحدد.',
    icon: 'Zap',
    category: 'mastery',
    targetCount: 5,
    pointsReward: 150,
  },
  {
    id: 'ach_7',
    code: 'project_closer',
    titleEn: 'Project Finisher',
    titleAr: 'مختتم المشاريع',
    descriptionEn: 'Complete all assigned tasks in an active project.',
    descriptionAr: 'أكمل جميع المهام التابعة لمشروع نشط بالكامل.',
    icon: 'FolderCheck',
    category: 'project',
    targetCount: 1,
    pointsReward: 200,
  },
];

export const WEEKLY_CHALLENGES: WeeklyChallenge[] = [
  {
    id: 'w_1',
    titleEn: 'Weekly Momentum',
    titleAr: 'زخم الأسبوع',
    descriptionEn: 'Complete at least 8 tasks this week.',
    descriptionAr: 'أكمل 8 مهام على الأقل خلال هذا الأسبوع.',
    target: 8,
    type: 'complete_tasks',
    rewardPoints: 80,
  },
  {
    id: 'w_2',
    titleEn: 'High Priority Blitz',
    titleAr: 'اقتحام الأولويات العالية',
    descriptionEn: 'Resolve 3 High or Urgent priority tasks.',
    descriptionAr: 'أنجز 3 مهام ذات أولوية عالية أو عاجلة.',
    target: 3,
    type: 'high_priority',
    rewardPoints: 120,
  },
];

export const LEVEL_THRESHOLDS = [
  { level: 1, nameEn: 'Novice Planner', nameAr: 'مخطط مبتدئ', minXp: 0, maxXp: 99 },
  { level: 2, nameEn: 'Task Apprentice', nameAr: 'متدرب المهام', minXp: 100, maxXp: 249 },
  { level: 3, nameEn: 'Focus Achiever', nameAr: 'منجز مركز', minXp: 250, maxXp: 499 },
  { level: 4, nameEn: 'Execution Specialist', nameAr: 'أخصائي التنفيذ', minXp: 500, maxXp: 999 },
  { level: 5, nameEn: 'Workflow Master', nameAr: 'خبير مسارات العمل', minXp: 1000, maxXp: 1999 },
  { level: 6, nameEn: 'Productivity Grandmaster', nameAr: 'أستاذ الإنتاجية الفائقة', minXp: 2000, maxXp: 999999 },
];

export const calculateLevelInfo = (xp: number) => {
  const current = LEVEL_THRESHOLDS.find(t => xp >= t.minXp && xp <= t.maxXp) || LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
  const next = LEVEL_THRESHOLDS.find(t => t.level === current.level + 1);

  let progress = 100;
  let xpNeeded = 0;

  if (next) {
    const range = next.minXp - current.minXp;
    const currentInLevel = xp - current.minXp;
    progress = Math.min(100, Math.max(0, Math.round((currentInLevel / range) * 100)));
    xpNeeded = next.minXp - xp;
  }

  return {
    level: current.level,
    titleEn: current.nameEn,
    titleAr: current.nameAr,
    progress,
    xpNeeded,
    nextLevel: next ? next.level : current.level,
  };
};

export const PRIORITY_POINTS: Record<Priority, number> = {
  low: 5,
  medium: 10,
  high: 20,
  urgent: 30,
};

// Storage keys
const USERS_KEY = 'tf_users';
const CURRENT_USER_KEY = 'tf_active_user_id';
const DATA_PREFIX = 'tf_data_';

interface UserStoreData {
  profile: UserProfile;
  tasks: Task[];
  projects: Project[];
  categories: Category[];
  transactions: PointsTransaction[];
  userAchievements: UserAchievement[];
  notifications: UserNotification[];
  settings: UserSettings;
}

// Demo user seed data generator
const createDemoUserData = (userId: string, email: string, fullName: string): UserStoreData => {
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const yesterday = new Date(now.getTime() - 86400000).toISOString().split('T')[0];
  const tomorrow = new Date(now.getTime() + 86400000).toISOString().split('T')[0];
  const in3Days = new Date(now.getTime() + 86400000 * 3).toISOString().split('T')[0];
  const in5Days = new Date(now.getTime() + 86400000 * 5).toISOString().split('T')[0];
  const past3Days = new Date(now.getTime() - 86400000 * 3).toISOString().split('T')[0];

  const projects: Project[] = [
    {
      id: 'proj_1',
      userId,
      name: 'Website Redesign 2.0',
      description: 'Modernizing corporate portal with responsive design and speed optimizations',
      color: '#4f46e5', // Indigo
      createdAt: new Date(now.getTime() - 86400000 * 14).toISOString(),
    },
    {
      id: 'proj_2',
      userId,
      name: 'Mobile App Launch',
      description: 'Preparing iOS and Android stores submission and promotional assets',
      color: '#059669', // Emerald
      createdAt: new Date(now.getTime() - 86400000 * 10).toISOString(),
    },
    {
      id: 'proj_3',
      userId,
      name: 'Cloud Infrastructure & Security',
      description: 'PostgreSQL database scaling, RLS verification, and automated backups',
      color: '#d97706', // Amber
      createdAt: new Date(now.getTime() - 86400000 * 20).toISOString(),
    },
  ];

  const categories: Category[] = [
    { id: 'cat_1', userId, name: 'Design & UX', color: '#8b5cf6' },
    { id: 'cat_2', userId, name: 'Engineering', color: '#2563eb' },
    { id: 'cat_3', userId, name: 'Marketing', color: '#10b981' },
    { id: 'cat_4', userId, name: 'Operations', color: '#f59e0b' },
  ];

  const tasks: Task[] = [
    {
      id: 'task_1',
      userId,
      title: 'Review Brand Design System Guidelines',
      description: 'Audit typography scale, spacing tokens, and color contrast for WCAG AA compliance.',
      notes: 'Check Figma design tokens and Tailwind v4 custom properties.',
      priority: 'high',
      status: 'in_progress',
      category: 'Design & UX',
      projectId: 'proj_1',
      tags: ['Design', 'UI', 'Accessibility'],
      startDate: yesterday,
      dueDate: todayStr,
      createdAt: new Date(now.getTime() - 86400000 * 2).toISOString(),
      isArchived: false,
    },
    {
      id: 'task_2',
      userId,
      title: 'Configure PostgreSQL Row Level Security (RLS)',
      description: 'Verify all tenant isolation policies in Supabase SQL schema to prevent data leak.',
      notes: 'Make sure policies test auth.uid() matching user_id column.',
      priority: 'urgent',
      status: 'pending',
      category: 'Engineering',
      projectId: 'proj_3',
      tags: ['Security', 'Postgres', 'Backend'],
      startDate: todayStr,
      dueDate: tomorrow,
      createdAt: new Date(now.getTime() - 86400000 * 1).toISOString(),
      isArchived: false,
    },
    {
      id: 'task_3',
      userId,
      title: 'Prepare App Store Metadata & Screenshots',
      description: 'Capture 6.5 inch and 5.5 inch device screenshots for both English and Arabic locales.',
      notes: 'Export in 24-bit PNG without alpha channel.',
      priority: 'medium',
      status: 'pending',
      category: 'Marketing',
      projectId: 'proj_2',
      tags: ['Mobile', 'Store', 'Assets'],
      startDate: tomorrow,
      dueDate: in3Days,
      createdAt: new Date(now.getTime() - 86400000 * 3).toISOString(),
      isArchived: false,
    },
    {
      id: 'task_4',
      userId,
      title: 'Quarterly Cloud Cost Optimization Review',
      description: 'Analyze bandwidth metrics, serverless functions execution latency and cache hit ratios.',
      priority: 'low',
      status: 'pending',
      category: 'Operations',
      projectId: 'proj_3',
      tags: ['Cloud', 'DevOps'],
      startDate: tomorrow,
      dueDate: in5Days,
      createdAt: new Date(now.getTime() - 86400000 * 4).toISOString(),
      isArchived: false,
    },
    {
      id: 'task_5',
      userId,
      title: 'Submit Compliance Audit Checklist',
      description: 'Review data processing agreement and export policy documentation.',
      priority: 'urgent',
      status: 'overdue',
      category: 'Operations',
      projectId: 'proj_3',
      tags: ['Compliance', 'Audit'],
      startDate: past3Days,
      dueDate: yesterday,
      createdAt: new Date(now.getTime() - 86400000 * 6).toISOString(),
      isArchived: false,
    },
    // Archived tasks (completed earlier)
    {
      id: 'task_arch_1',
      userId,
      title: 'Initialize Next.js / Vite Architecture with TypeScript',
      description: 'Configured bundler, Tailwind CSS, path aliases and core folder layout.',
      priority: 'high',
      status: 'completed',
      category: 'Engineering',
      projectId: 'proj_1',
      tags: ['Architecture', 'Setup'],
      startDate: new Date(now.getTime() - 86400000 * 12).toISOString().split('T')[0],
      dueDate: new Date(now.getTime() - 86400000 * 8).toISOString().split('T')[0],
      createdAt: new Date(now.getTime() - 86400000 * 14).toISOString(),
      completedAt: new Date(now.getTime() - 86400000 * 8).toISOString(),
      isArchived: true,
      pointsAwarded: 20,
    },
    {
      id: 'task_arch_2',
      userId,
      title: 'Implement Internationalization (i18n) Engine',
      description: 'Built Arabic and English translation dictionaries and dynamic RTL/LTR direction switching.',
      priority: 'urgent',
      status: 'completed',
      category: 'Engineering',
      projectId: 'proj_1',
      tags: ['i18n', 'Arabic', 'RTL'],
      startDate: new Date(now.getTime() - 86400000 * 7).toISOString().split('T')[0],
      dueDate: new Date(now.getTime() - 86400000 * 4).toISOString().split('T')[0],
      createdAt: new Date(now.getTime() - 86400000 * 8).toISOString(),
      completedAt: new Date(now.getTime() - 86400000 * 4).toISOString(),
      isArchived: true,
      pointsAwarded: 30,
    },
    {
      id: 'task_arch_3',
      userId,
      title: 'Establish Excel Export Generator',
      description: 'Integrated SheetJS/XLSX for structured data tables export with custom filters.',
      priority: 'medium',
      status: 'completed',
      category: 'Engineering',
      projectId: 'proj_2',
      tags: ['Excel', 'Export'],
      startDate: new Date(now.getTime() - 86400000 * 4).toISOString().split('T')[0],
      dueDate: new Date(now.getTime() - 86400000 * 1).toISOString().split('T')[0],
      createdAt: new Date(now.getTime() - 86400000 * 5).toISOString(),
      completedAt: new Date(now.getTime() - 86400000 * 1).toISOString(),
      isArchived: true,
      pointsAwarded: 10,
    },
  ];

  const transactions: PointsTransaction[] = [
    {
      id: 'tx_1',
      userId,
      taskId: 'task_arch_1',
      points: 20,
      reason: 'Completed task: Initialize Next.js / Vite Architecture with TypeScript',
      type: 'earned',
      createdAt: new Date(now.getTime() - 86400000 * 8).toISOString(),
    },
    {
      id: 'tx_2',
      userId,
      taskId: 'task_arch_2',
      points: 30,
      reason: 'Completed task: Implement Internationalization (i18n) Engine',
      type: 'earned',
      createdAt: new Date(now.getTime() - 86400000 * 4).toISOString(),
    },
    {
      id: 'tx_3',
      userId,
      taskId: 'task_arch_3',
      points: 10,
      reason: 'Completed task: Establish Excel Export Generator',
      type: 'earned',
      createdAt: new Date(now.getTime() - 86400000 * 1).toISOString(),
    },
    {
      id: 'tx_4',
      userId,
      points: 50,
      reason: 'Achievement Unlocked: First Step',
      type: 'bonus',
      createdAt: new Date(now.getTime() - 86400000 * 8).toISOString(),
    },
  ];

  const totalPoints = transactions.reduce((acc, tx) => acc + (tx.type === 'reversed' ? -tx.points : tx.points), 0);
  const levelInfo = calculateLevelInfo(totalPoints);

  const profile: UserProfile = {
    id: userId,
    email,
    fullName,
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80',
    createdAt: new Date(now.getTime() - 86400000 * 30).toISOString(),
    points: totalPoints,
    level: levelInfo.level,
    currentStreak: 4,
    longestStreak: 9,
    lastActiveDate: todayStr,
    preferredLanguage: 'en',
    preferredTheme: 'dark',
  };

  const userAchievements: UserAchievement[] = [
    {
      id: 'uach_1',
      userId,
      achievementCode: 'first_task',
      unlockedAt: new Date(now.getTime() - 86400000 * 8).toISOString(),
    },
  ];

  const notifications: UserNotification[] = [
    {
      id: 'notif_1',
      userId,
      titleEn: 'Task Overdue',
      titleAr: 'مهمة متأخرة',
      messageEn: 'Task "Submit Compliance Audit Checklist" is overdue. Please review.',
      messageAr: 'المهمة "Submit Compliance Audit Checklist" تجاوزت موعد الاستحقاق.',
      type: 'overdue',
      isRead: false,
      createdAt: new Date(now.getTime() - 3600000 * 4).toISOString(),
      linkTab: 'tasks',
    },
    {
      id: 'notif_2',
      userId,
      titleEn: 'Deadline Approaching',
      titleAr: 'اقتراب موعد نهائي',
      messageEn: 'Task "Review Brand Design System Guidelines" is due today.',
      messageAr: 'المهمة "Review Brand Design System Guidelines" تستحق اليوم.',
      type: 'deadline',
      isRead: false,
      createdAt: new Date(now.getTime() - 3600000 * 8).toISOString(),
      linkTab: 'tasks',
    },
    {
      id: 'notif_3',
      userId,
      titleEn: 'Achievement Unlocked: First Step!',
      titleAr: 'تم فتح وسام: الخطوة الأولى!',
      messageEn: 'You earned 50 bonus XP for completing your first task.',
      messageAr: 'حصلت على 50 نقطة خبرة إضافية لإنجاز مهمتك الأولى.',
      type: 'achievement',
      isRead: true,
      createdAt: new Date(now.getTime() - 86400000 * 8).toISOString(),
      linkTab: 'achievements',
    },
  ];

  const settings: UserSettings = {
    language: 'en',
    theme: 'dark',
    enableSound: true,
    notifyDeadlines: true,
    notifyOverdue: true,
    notifyAchievements: true,
    isSupabaseConnected: false,
  };

  return {
    profile,
    tasks,
    projects,
    categories,
    transactions,
    userAchievements,
    notifications,
    settings,
  };
};

export class StorageService {
  private static getUserDataKey(userId: string): string {
    return `${DATA_PREFIX}${userId}`;
  }

  // --- Auth & Users Management ---
  public static getAllUsers(): Array<{ id: string; email: string; fullName: string; passwordHash: string }> {
    try {
      const raw = localStorage.getItem(USERS_KEY);
      if (!raw) {
        // initialize demo user
        const demo = [
          {
            id: 'usr_demo_1',
            email: 'alex@taskflow.dev',
            fullName: 'Alex Vance',
            passwordHash: 'demo1234',
          },
        ];
        localStorage.setItem(USERS_KEY, JSON.stringify(demo));
        // Also seed demo data
        const demoData = createDemoUserData('usr_demo_1', 'alex@taskflow.dev', 'Alex Vance');
        localStorage.setItem(this.getUserDataKey('usr_demo_1'), JSON.stringify(demoData));
        return demo;
      }
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  public static getActiveUserId(): string | null {
    const id = localStorage.getItem(CURRENT_USER_KEY);
    if (!id) {
      // Default to demo user if available
      const users = this.getAllUsers();
      if (users.length > 0) {
        localStorage.setItem(CURRENT_USER_KEY, users[0].id);
        return users[0].id;
      }
    }
    return id;
  }

  public static setActiveUserId(userId: string | null): void {
    if (userId) {
      localStorage.setItem(CURRENT_USER_KEY, userId);
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
    }
  }

  public static registerUser(email: string, fullName: string, password: string): { success: boolean; user?: UserProfile; error?: string } {
    const users = this.getAllUsers();
    const cleanEmail = email.trim().toLowerCase();

    if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
      return { success: false, error: 'Email already exists. Please log in instead.' };
    }

    const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newUserRecord = {
      id: userId,
      email: cleanEmail,
      fullName: fullName.trim(),
      passwordHash: password, // client-side simulation for sandbox environment
    };

    users.push(newUserRecord);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));

    // Create empty isolated data store for new user
    const now = new Date();
    const profile: UserProfile = {
      id: userId,
      email: cleanEmail,
      fullName: fullName.trim(),
      avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName)}`,
      createdAt: now.toISOString(),
      points: 0,
      level: 1,
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: now.toISOString().split('T')[0],
      preferredLanguage: (localStorage.getItem('taskflow_lang') as 'en' | 'ar') || 'en',
      preferredTheme: (localStorage.getItem('taskflow_theme') as 'light' | 'dark') || 'dark',
    };

    const initialData: UserStoreData = {
      profile,
      tasks: [],
      projects: [
        {
          id: `proj_${Date.now()}`,
          userId,
          name: 'General Tasks',
          description: 'Default project workspace for ongoing tasks and personal priorities',
          color: '#4f46e5',
          createdAt: now.toISOString(),
        },
      ],
      categories: [
        { id: `cat_${Date.now()}_1`, userId, name: 'Work', color: '#3b82f6' },
        { id: `cat_${Date.now()}_2`, userId, name: 'Personal', color: '#10b981' },
      ],
      transactions: [],
      userAchievements: [],
      notifications: [
        {
          id: `notif_${Date.now()}`,
          userId,
          titleEn: 'Welcome to My Mind',
          titleAr: 'مرحباً بك في ماي مايند',
          messageEn: 'Your private workspace is ready. Create tasks, organize projects, and start earning XP!',
          messageAr: 'مساحة عملك الخاصة جاهزة. أنشئ مهامك ونظم مشاريعك وابدأ بكسب نقاط الخبرة!',
          type: 'completion',
          isRead: false,
          createdAt: now.toISOString(),
          linkTab: 'tasks',
        },
      ],
      settings: {
        language: profile.preferredLanguage,
        theme: profile.preferredTheme,
        enableSound: true,
        notifyDeadlines: true,
        notifyOverdue: true,
        notifyAchievements: true,
        isSupabaseConnected: false,
      },
    };

    localStorage.setItem(this.getUserDataKey(userId), JSON.stringify(initialData));
    this.setActiveUserId(userId);

    return { success: true, user: profile };
  }

  public static loginUser(email: string, password: string): { success: boolean; user?: UserProfile; error?: string } {
    const users = this.getAllUsers();
    const cleanEmail = email.trim().toLowerCase();
    const found = users.find(u => u.email.toLowerCase() === cleanEmail && u.passwordHash === password);

    if (!found) {
      return { success: false, error: 'Invalid email or password.' };
    }

    this.setActiveUserId(found.id);
    const store = this.getUserStore(found.id);
    return { success: true, user: store.profile };
  }

  // --- Data Store Isolation ---
  public static getUserStore(userId: string): UserStoreData {
    const raw = localStorage.getItem(this.getUserDataKey(userId));
    if (!raw) {
      // If demo user data was not initialized, initialize it
      const users = this.getAllUsers();
      const user = users.find(u => u.id === userId);
      const data = createDemoUserData(userId, user?.email || 'user@taskflow.dev', user?.fullName || 'User');
      localStorage.setItem(this.getUserDataKey(userId), JSON.stringify(data));
      return data;
    }
    try {
      const data: UserStoreData = JSON.parse(raw);
      // Auto-sanitize existing data to guarantee all transaction and notification IDs are unique
      const seenTxIds = new Set<string>();
      if (Array.isArray(data.transactions)) {
        data.transactions = data.transactions.map((tx, idx) => {
          if (!tx.id || seenTxIds.has(tx.id)) {
            const uniqueId = `${tx.id || 'tx'}_${idx}_${Math.random().toString(36).substring(2, 7)}`;
            return { ...tx, id: uniqueId };
          }
          seenTxIds.add(tx.id);
          return tx;
        });
      }
      const seenNotifIds = new Set<string>();
      if (Array.isArray(data.notifications)) {
        data.notifications = data.notifications.map((notif, idx) => {
          if (!notif.id || seenNotifIds.has(notif.id)) {
            const uniqueId = `${notif.id || 'notif'}_${idx}_${Math.random().toString(36).substring(2, 7)}`;
            return { ...notif, id: uniqueId };
          }
          seenNotifIds.add(notif.id);
          return notif;
        });
      }
      return data;
    } catch {
      const data = createDemoUserData(userId, 'user@taskflow.dev', 'User');
      return data;
    }
  }

  public static saveUserStore(userId: string, data: UserStoreData): void {
    localStorage.setItem(this.getUserDataKey(userId), JSON.stringify(data));
  }

  // --- Tasks CRUD & Archive Logic ---
  public static getTasks(userId: string): { active: Task[]; archived: Task[] } {
    const store = this.getUserStore(userId);
    const today = new Date().toISOString().split('T')[0];

    // dynamically update overdue status for pending tasks
    const tasks = store.tasks.map(t => {
      if (!t.isArchived && t.status !== 'completed' && t.dueDate < today && t.status !== 'overdue') {
        return { ...t, status: 'overdue' as const };
      }
      return t;
    });

    const active = tasks.filter(t => !t.isArchived);
    const archived = tasks.filter(t => t.isArchived);

    return { active, archived };
  }

  public static createTask(userId: string, taskInput: Omit<Task, 'id' | 'userId' | 'createdAt' | 'isArchived'>): { task: Task; store: UserStoreData } {
    const store = this.getUserStore(userId);
    const taskId = `task_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    const newTask: Task = {
      ...taskInput,
      id: taskId,
      userId,
      createdAt: now,
      isArchived: false,
    };

    store.tasks.unshift(newTask);
    this.saveUserStore(userId, store);
    return { task: newTask, store };
  }

  public static updateTask(userId: string, task: Task): UserStoreData {
    const store = this.getUserStore(userId);
    store.tasks = store.tasks.map(t => (t.id === task.id ? task : t));
    this.saveUserStore(userId, store);
    return store;
  }

  public static deleteTask(userId: string, taskId: string): UserStoreData {
    const store = this.getUserStore(userId);
    store.tasks = store.tasks.filter(t => t.id !== taskId);
    this.saveUserStore(userId, store);
    return store;
  }

  /**
   * Complete a task:
   * 1. Moves to archive automatically.
   * 2. Sets completion date/time.
   * 3. Preserves project and category metadata.
   * 4. Awards points according to priority (Low: 5, Medium: 10, High: 20, Urgent: 30).
   * 5. Prevents duplicate points: only awards points if points have not yet been granted for this task.
   * 6. Checks streak and unlocks achievements.
   */
  public static completeTask(
    userId: string,
    taskId: string
  ): { store: UserStoreData; pointsEarned: number; newAchievements: Achievement[]; leveledUp: boolean } {
    const store = this.getUserStore(userId);
    const taskIndex = store.tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) {
      return { store, pointsEarned: 0, newAchievements: [], leveledUp: false };
    }

    const task = store.tasks[taskIndex];
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    // Determine points
    const pointsToAward = PRIORITY_POINTS[task.priority] || 10;
    let awarded = 0;

    // Check if points were already awarded for this task (anti-exploit)
    const existingTx = store.transactions.find(tx => tx.taskId === taskId && tx.type === 'earned');
    if (!existingTx) {
      awarded = pointsToAward;
      store.transactions.unshift({
        id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        userId,
        taskId,
        points: awarded,
        reason: `Completed task: ${task.title}`,
        type: 'earned',
        createdAt: now.toISOString(),
      });
      store.profile.points += awarded;
    }

    // Update task
    task.isArchived = true;
    task.status = 'completed';
    task.completedAt = now.toISOString();
    task.pointsAwarded = (task.pointsAwarded || 0) + awarded;
    store.tasks[taskIndex] = task;

    // Streak logic
    const lastActive = store.profile.lastActiveDate;
    if (lastActive !== todayStr) {
      const yesterday = new Date(now.getTime() - 86400000).toISOString().split('T')[0];
      if (lastActive === yesterday) {
        store.profile.currentStreak += 1;
      } else {
        store.profile.currentStreak = 1;
      }
      if (store.profile.currentStreak > store.profile.longestStreak) {
        store.profile.longestStreak = store.profile.currentStreak;
      }
      store.profile.lastActiveDate = todayStr;
    }

    // Check Level Up
    const previousLevel = store.profile.level;
    const levelInfo = calculateLevelInfo(store.profile.points);
    let leveledUp = false;
    if (levelInfo.level > previousLevel) {
      store.profile.level = levelInfo.level;
      leveledUp = true;
      store.notifications.unshift({
        id: `notif_lvl_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        userId,
        titleEn: `Level Up! Reached Level ${levelInfo.level}`,
        titleAr: `ترقية في المستوى! وصلت للمستوى ${levelInfo.level}`,
        messageEn: `Congratulations! You unlocked the title "${levelInfo.titleEn}".`,
        messageAr: `تهانينا! حصلت على لقب "${levelInfo.titleAr}".`,
        type: 'level_up',
        isRead: false,
        createdAt: now.toISOString(),
        linkTab: 'achievements',
      });
    }

    // Check Achievements
    const newAchievements: Achievement[] = [];
    const completedTasksCount = store.tasks.filter(t => t.status === 'completed').length;
    const urgentCompletedCount = store.tasks.filter(t => t.status === 'completed' && t.priority === 'urgent').length;

    ACHIEVEMENTS_CATALOG.forEach((ach, achIndex) => {
      const alreadyUnlocked = store.userAchievements.some(ua => ua.achievementCode === ach.code);
      if (alreadyUnlocked) return;

      let unlock = false;
      if (ach.code === 'first_task' && completedTasksCount >= 1) unlock = true;
      if (ach.code === 'task_10' && completedTasksCount >= 10) unlock = true;
      if (ach.code === 'task_50' && completedTasksCount >= 50) unlock = true;
      if (ach.code === 'task_100' && completedTasksCount >= 100) unlock = true;
      if (ach.code === 'streak_7' && store.profile.currentStreak >= 7) unlock = true;
      if (ach.code === 'urgent_conqueror' && urgentCompletedCount >= 5) unlock = true;

      // Project closer check
      if (ach.code === 'project_closer' && task.projectId) {
        const projectTasks = store.tasks.filter(t => t.projectId === task.projectId);
        if (projectTasks.length > 0 && projectTasks.every(t => t.status === 'completed')) {
          unlock = true;
        }
      }

      if (unlock) {
        const uniqueEntropy = `${Date.now()}_${achIndex}_${Math.random().toString(36).substring(2, 7)}`;
        store.userAchievements.push({
          id: `uach_${ach.code}_${uniqueEntropy}`,
          userId,
          achievementCode: ach.code,
          unlockedAt: now.toISOString(),
        });
        store.profile.points += ach.pointsReward;
        store.transactions.unshift({
          id: `tx_ach_${ach.code}_${uniqueEntropy}`,
          userId,
          points: ach.pointsReward,
          reason: `Achievement Unlocked: ${ach.titleEn}`,
          type: 'bonus',
          createdAt: now.toISOString(),
        });
        newAchievements.push(ach);

        store.notifications.unshift({
          id: `notif_ach_${ach.code}_${uniqueEntropy}`,
          userId,
          titleEn: `Achievement Unlocked: ${ach.titleEn}`,
          titleAr: `تم فتح وسام: ${ach.titleAr}`,
          messageEn: `${ach.descriptionEn} (+${ach.pointsReward} XP)`,
          messageAr: `${ach.descriptionAr} (+${ach.pointsReward} نقطة)`,
          type: 'achievement',
          isRead: false,
          createdAt: now.toISOString(),
          linkTab: 'achievements',
        });
      }
    });

    this.saveUserStore(userId, store);
    return { store, pointsEarned: awarded, newAchievements, leveledUp };
  }

  /**
   * Restore an archived task back to the active list:
   * 1. Re-sets isArchived to false and status to pending.
   * 2. Clears completedAt.
   * 3. Reverses the awarded points (records a reversed transaction) so users cannot repeatedly complete and restore tasks for endless points.
   */
  public static restoreArchivedTask(userId: string, taskId: string): UserStoreData {
    const store = this.getUserStore(userId);
    const taskIndex = store.tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) return store;

    const task = store.tasks[taskIndex];
    const pointsToDeduct = task.pointsAwarded || PRIORITY_POINTS[task.priority] || 10;

    // Deduct points safely
    if (pointsToDeduct > 0) {
      store.transactions.unshift({
        id: `tx_rev_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        userId,
        taskId,
        points: pointsToDeduct,
        reason: `Restored task: ${task.title}`,
        type: 'reversed',
        createdAt: new Date().toISOString(),
      });
      store.profile.points = Math.max(0, store.profile.points - pointsToDeduct);
      // Re-calculate level
      store.profile.level = calculateLevelInfo(store.profile.points).level;
    }

    task.isArchived = false;
    task.status = 'pending';
    task.completedAt = undefined;
    task.pointsAwarded = 0; // reset points awarded tracker
    store.tasks[taskIndex] = task;

    this.saveUserStore(userId, store);
    return store;
  }

  // Permanently delete archived task
  public static permanentlyDeleteArchivedTask(userId: string, taskId: string): UserStoreData {
    return this.deleteTask(userId, taskId);
  }

  // --- Projects CRUD ---
  public static createProject(userId: string, name: string, description: string, color: string): { project: Project; store: UserStoreData } {
    const store = this.getUserStore(userId);
    const newProj: Project = {
      id: `proj_${Date.now()}`,
      userId,
      name: name.trim(),
      description: description.trim(),
      color: color || '#4f46e5',
      createdAt: new Date().toISOString(),
    };
    store.projects.push(newProj);
    this.saveUserStore(userId, store);
    return { project: newProj, store };
  }

  public static updateProject(userId: string, project: Project): UserStoreData {
    const store = this.getUserStore(userId);
    store.projects = store.projects.map(p => (p.id === project.id ? project : p));
    this.saveUserStore(userId, store);
    return store;
  }

  public static deleteProject(userId: string, projectId: string): UserStoreData {
    const store = this.getUserStore(userId);
    store.projects = store.projects.filter(p => p.id !== projectId);
    // Unassign tasks belonging to this project
    store.tasks = store.tasks.map(t => (t.projectId === projectId ? { ...t, projectId: '' } : t));
    this.saveUserStore(userId, store);
    return store;
  }

  // --- Profile & Settings ---
  public static updateProfile(userId: string, updates: Partial<UserProfile>): UserStoreData {
    const store = this.getUserStore(userId);
    store.profile = { ...store.profile, ...updates };
    this.saveUserStore(userId, store);
    return store;
  }

  public static updateSettings(userId: string, updates: Partial<UserSettings>): UserStoreData {
    const store = this.getUserStore(userId);
    store.settings = { ...store.settings, ...updates };
    this.saveUserStore(userId, store);
    return store;
  }

  // --- Notifications ---
  public static markNotificationAsRead(userId: string, notifId: string): UserStoreData {
    const store = this.getUserStore(userId);
    store.notifications = store.notifications.map(n => (n.id === notifId ? { ...n, isRead: true } : n));
    this.saveUserStore(userId, store);
    return store;
  }

  public static markAllNotificationsAsRead(userId: string): UserStoreData {
    const store = this.getUserStore(userId);
    store.notifications = store.notifications.map(n => ({ ...n, isRead: true }));
    this.saveUserStore(userId, store);
    return store;
  }

  public static clearAllNotifications(userId: string): UserStoreData {
    const store = this.getUserStore(userId);
    store.notifications = [];
    this.saveUserStore(userId, store);
    return store;
  }

  // --- Excel Export Engine ---
  public static exportArchivedTasksToExcel(
    tasks: Task[],
    projects: Project[],
    lang: 'en' | 'ar',
    options?: { projectId?: string; startDate?: string; endDate?: string }
  ): void {
    let filtered = tasks.filter(t => t.isArchived);

    if (options?.projectId && options.projectId !== 'all') {
      filtered = filtered.filter(t => t.projectId === options.projectId);
    }

    if (options?.startDate) {
      filtered = filtered.filter(t => {
        const cDate = t.completedAt ? t.completedAt.split('T')[0] : '';
        return cDate >= (options.startDate || '');
      });
    }

    if (options?.endDate) {
      filtered = filtered.filter(t => {
        const cDate = t.completedAt ? t.completedAt.split('T')[0] : '';
        return cDate <= (options.endDate || '');
      });
    }

    const projectMap = new Map<string, string>();
    projects.forEach(p => projectMap.set(p.id, p.name));

    // Construct clean table rows
    const isAr = lang === 'ar';
    const rows = filtered.map(t => {
      const projName = projectMap.get(t.projectId) || (isAr ? 'بدون مشروع' : 'Unassigned');
      const completedFormatted = t.completedAt ? new Date(t.completedAt).toLocaleString() : '';
      const createdFormatted = t.createdAt ? new Date(t.createdAt).toLocaleDateString() : '';

      if (isAr) {
        return {
          'معرف المهمة': t.id,
          'عنوان المهمة': t.title,
          'الوصف': t.description || '',
          'الملاحظات': t.notes || '',
          'اسم المشروع': projName,
          'التصنيف': t.category || '',
          'الأولوية': t.priority.toUpperCase(),
          'الحالة': t.status,
          'تاريخ الإنشاء': createdFormatted,
          'تاريخ الاستحقاق': t.dueDate,
          'تاريخ الإنجاز': completedFormatted,
          'النقاط المكتسبة': t.pointsAwarded || 0,
          'الوسوم': (t.tags || []).join(', '),
        };
      }

      return {
        'Task ID': t.id,
        'Task Title': t.title,
        'Description': t.description || '',
        'Notes': t.notes || '',
        'Project Name': projName,
        'Category': t.category || '',
        'Priority': t.priority.toUpperCase(),
        'Status': t.status,
        'Creation Date': createdFormatted,
        'Due Date': t.dueDate,
        'Completion Date': completedFormatted,
        'Points Earned': t.pointsAwarded || 0,
        'Tags': (t.tags || []).join(', '),
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);

    // Auto-fit column widths
    const columnWidths = [
      { wch: 15 }, // ID
      { wch: 30 }, // Title
      { wch: 35 }, // Description
      { wch: 25 }, // Notes
      { wch: 20 }, // Project
      { wch: 15 }, // Category
      { wch: 12 }, // Priority
      { wch: 12 }, // Status
      { wch: 14 }, // Created
      { wch: 14 }, // Due
      { wch: 20 }, // Completed
      { wch: 14 }, // Points
      { wch: 25 }, // Tags
    ];
    worksheet['!cols'] = columnWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, isAr ? 'المهام المؤرشفة' : 'Archived Tasks');

    const dateStamp = new Date().toISOString().split('T')[0];
    const fileName = isAr
      ? `سجل_المهام_المؤرشفة_ماي_مايند_${dateStamp}.xlsx`
      : `MyMind_Archived_Tasks_${dateStamp}.xlsx`;

    XLSX.writeFile(workbook, fileName);
  }

  // Reset to initial demo data
  public static resetUserData(userId: string): UserStoreData {
    const users = this.getAllUsers();
    const user = users.find(u => u.id === userId);
    const data = createDemoUserData(userId, user?.email || 'alex@taskflow.dev', user?.fullName || 'Alex Vance');
    this.saveUserStore(userId, data);
    return data;
  }
}
