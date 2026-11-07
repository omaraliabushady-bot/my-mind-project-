import { createClient, SupabaseClient } from '@supabase/supabase-js';

let cachedClient: SupabaseClient | null = null;
let currentUrl = '';
let currentKey = '';

export const getSupabaseClient = (url?: string, key?: string): SupabaseClient | null => {
  const finalUrl = url || import.meta.env.VITE_SUPABASE_URL || '';
  const finalKey = key || import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  if (!finalUrl || !finalKey) {
    return null;
  }

  if (cachedClient && currentUrl === finalUrl && currentKey === finalKey) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(finalUrl, finalKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
    currentUrl = finalUrl;
    currentKey = finalKey;
    return cachedClient;
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
    return null;
  }
};

export const testSupabaseConnection = async (url: string, key: string): Promise<{ success: boolean; message: string }> => {
  try {
    if (!url || !key) {
      return { success: false, message: 'Both Supabase URL and Anon Key are required.' };
    }
    const testClient = createClient(url, key);
    const { error } = await testClient.auth.getSession();
    if (error) {
      return { success: false, message: error.message };
    }
    return { success: true, message: 'Connected to Supabase successfully!' };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown connection error';
    return { success: false, message: errorMsg };
  }
};

/**
 * Complete, production-ready PostgreSQL + Supabase Row Level Security (RLS) SQL Script.
 * Users can copy and run this in the Supabase SQL Editor.
 */
export const SUPABASE_SQL_SCHEMA = `-- ====================================================================
-- TASKFLOW PRO: ENTERPRISE DATABASE SCHEMA & ROW LEVEL SECURITY (RLS)
-- Run this in your Supabase SQL Editor to initialize all tables and policies.
-- ====================================================================

-- 1. PROFILES TABLE (Linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  avatar_url TEXT DEFAULT '',
  points INTEGER DEFAULT 0 CHECK (points >= 0),
  level INTEGER DEFAULT 1 CHECK (level >= 1),
  current_streak INTEGER DEFAULT 0 CHECK (current_streak >= 0),
  longest_streak INTEGER DEFAULT 0 CHECK (longest_streak >= 0),
  last_active_date DATE DEFAULT CURRENT_DATE,
  preferred_language TEXT DEFAULT 'en' CHECK (preferred_language IN ('en', 'ar')),
  preferred_theme TEXT DEFAULT 'dark' CHECK (preferred_theme IN ('light', 'dark')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PROJECTS TABLE
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  color TEXT DEFAULT '#4f46e5',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#6b7280',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TASKS TABLE (Includes Active & Archived Tasks)
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'overdue')),
  category TEXT DEFAULT 'General',
  tags TEXT[] DEFAULT '{}',
  start_date DATE,
  due_date DATE NOT NULL,
  is_archived BOOLEAN DEFAULT FALSE,
  points_awarded INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. POINTS TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS public.points_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
  points INTEGER NOT NULL,
  reason TEXT NOT NULL,
  type TEXT DEFAULT 'earned' CHECK (type IN ('earned', 'reversed', 'bonus')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. ACHIEVEMENTS CATALOG
CREATE TABLE IF NOT EXISTS public.achievements (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  title_en TEXT NOT NULL,
  title_ar TEXT NOT NULL,
  description_en TEXT NOT NULL,
  description_ar TEXT NOT NULL,
  icon TEXT NOT NULL,
  category TEXT NOT NULL,
  target_count INTEGER NOT NULL,
  points_reward INTEGER DEFAULT 50
);

-- 7. USER ACHIEVEMENTS TABLE
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  achievement_code TEXT REFERENCES public.achievements(code) ON DELETE CASCADE NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, achievement_code)
);

-- 8. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title_en TEXT NOT NULL,
  title_ar TEXT NOT NULL,
  message_en TEXT NOT NULL,
  message_ar TEXT NOT NULL,
  type TEXT DEFAULT 'deadline' CHECK (type IN ('deadline', 'overdue', 'completion', 'achievement', 'level_up', 'project')),
  is_read BOOLEAN DEFAULT FALSE,
  link_tab TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. USER SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.user_settings (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  enable_sound BOOLEAN DEFAULT TRUE,
  notify_deadlines BOOLEAN DEFAULT TRUE,
  notify_overdue BOOLEAN DEFAULT TRUE,
  notify_achievements BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Ensures each user can only read, insert, update, or delete their own data.
-- ====================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.points_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can view and update their own profile
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Projects
CREATE POLICY "Users can manage own projects" ON public.projects FOR ALL USING (auth.uid() = user_id);

-- Categories
CREATE POLICY "Users can manage own categories" ON public.categories FOR ALL USING (auth.uid() = user_id);

-- Tasks
CREATE POLICY "Users can manage own tasks" ON public.tasks FOR ALL USING (auth.uid() = user_id);

-- Points Transactions
CREATE POLICY "Users can view and add own points" ON public.points_transactions FOR ALL USING (auth.uid() = user_id);

-- Achievements: Catalog is readable by all authenticated users
CREATE POLICY "Anyone can view achievements catalog" ON public.achievements FOR SELECT TO authenticated USING (true);

-- User Achievements
CREATE POLICY "Users can manage own achievements" ON public.user_achievements FOR ALL USING (auth.uid() = user_id);

-- Notifications
CREATE POLICY "Users can manage own notifications" ON public.notifications FOR ALL USING (auth.uid() = user_id);

-- User Settings
CREATE POLICY "Users can manage own settings" ON public.user_settings FOR ALL USING (auth.uid() = user_id);

-- ====================================================================
-- PERFORMANCE INDEXES
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_tasks_user_status ON public.tasks(user_id, status, is_archived);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON public.tasks(user_id, due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_project ON public.tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_projects_user ON public.projects(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, is_read);
`;
