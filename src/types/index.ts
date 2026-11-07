export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'overdue';

export interface Task {
  id: string;
  userId: string;
  title: string;
  description: string;
  notes?: string;
  priority: Priority;
  status: TaskStatus;
  category: string;
  projectId: string;
  tags: string[];
  startDate?: string; // YYYY-MM-DD
  dueDate: string;    // YYYY-MM-DD
  createdAt: string;  // ISO string
  completedAt?: string; // ISO string
  isArchived: boolean;
  pointsAwarded?: number;
}

export interface Project {
  id: string;
  userId: string;
  name: string;
  description: string;
  color: string;
  createdAt: string;
}

export interface Category {
  id: string;
  userId: string;
  name: string;
  color: string;
}

export interface Tag {
  id: string;
  userId: string;
  name: string;
}

export interface PointsTransaction {
  id: string;
  userId: string;
  taskId?: string;
  points: number;
  reason: string;
  type: 'earned' | 'reversed' | 'bonus';
  createdAt: string;
}

export interface Achievement {
  id: string;
  code: string;
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  icon: string;
  category: 'completion' | 'streak' | 'mastery' | 'project';
  targetCount: number;
  pointsReward: number;
}

export interface UserAchievement {
  id: string;
  userId: string;
  achievementCode: string;
  unlockedAt: string;
}

export interface UserNotification {
  id: string;
  userId: string;
  titleEn: string;
  titleAr: string;
  messageEn: string;
  messageAr: string;
  type: 'deadline' | 'overdue' | 'completion' | 'achievement' | 'level_up' | 'project';
  isRead: boolean;
  createdAt: string;
  linkTab?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string;
  createdAt: string;
  points: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string;
  preferredLanguage: 'en' | 'ar';
  preferredTheme: 'light' | 'dark';
}

export interface UserSettings {
  language: 'en' | 'ar';
  theme: 'light' | 'dark';
  enableSound: boolean;
  notifyDeadlines: boolean;
  notifyOverdue: boolean;
  notifyAchievements: boolean;
  supabaseUrl?: string;
  supabaseAnonKey?: string;
  isSupabaseConnected?: boolean;
}

export interface WeeklyChallenge {
  id: string;
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  target: number;
  type: 'complete_tasks' | 'high_priority' | 'projects';
  rewardPoints: number;
}
