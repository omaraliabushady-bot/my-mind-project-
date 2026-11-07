import React, { useState } from 'react';
import {
  Settings,
  Globe,
  Sun,
  Moon,
  Bell,
  Database,
  Download,
  RotateCcw,
  Copy,
  Check,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Volume2
} from 'lucide-react';
import { useTaskFlow } from '../../context/TaskFlowContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { SUPABASE_SQL_SCHEMA, testSupabaseConnection } from '../../services/supabaseClient';
import { playTaskCompletionSound } from '../../utils/sound';

export const SettingsView: React.FC = () => {
  const { settings, updateSettings, showConfirmDialog, resetAllData } = useTaskFlow();
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const { currentUser } = useAuth();

  const [supabaseUrl, setSupabaseUrl] = useState(settings.supabaseUrl || '');
  const [supabaseKey, setSupabaseKey] = useState(settings.supabaseAnonKey || '');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [showSql, setShowSql] = useState(false);
  const [sqlCopied, setSqlCopied] = useState(false);

  const handleTestSupabase = async () => {
    setIsTesting(true);
    setTestResult(null);
    const result = await testSupabaseConnection(supabaseUrl.trim(), supabaseKey.trim());
    setIsTesting(false);
    setTestResult(result);
    if (result.success) {
      updateSettings({
        supabaseUrl: supabaseUrl.trim(),
        supabaseAnonKey: supabaseKey.trim(),
        isSupabaseConnected: true,
      });
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setSqlCopied(true);
    setTimeout(() => setSqlCopied(false), 3000);
  };

  const handleExportJson = () => {
    if (!currentUser) return;
    const raw = localStorage.getItem(`tf_data_${currentUser.id}`);
    if (!raw) return;

    const blob = new Blob([raw], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MyMind_Backup_${currentUser.email}_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleResetDataClick = () => {
    showConfirmDialog({
      title: t('resetAllData'),
      message: t('resetConfirm'),
      confirmText: t('resetAllData'),
      variant: 'danger',
      onConfirm: () => resetAllData(),
    });
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl text-start">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
          {t('settingsTitle')}
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500">
          {t('settingsSubtitle')}
        </p>
      </div>

      {/* 1. Language & Localization */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-neutral-100 dark:border-neutral-800">
          <Globe className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
            {t('languageSettings')}
          </h2>
        </div>

        <div className="space-y-3">
          <p className="text-xs text-neutral-500">
            Select your preferred display language. Switching to Arabic automatically flips the layout direction to Right-to-Left (RTL) with localized typography.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md">
            <button
              onClick={() => setLanguage('en')}
              className={`p-3.5 rounded-lg border text-xs font-semibold flex items-center justify-between transition-all ${
                language === 'en'
                  ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 text-neutral-900 dark:text-neutral-100 shadow-xs'
                  : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
              }`}
            >
              <span>{t('english')}</span>
              {language === 'en' && <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
            </button>

            <button
              onClick={() => setLanguage('ar')}
              className={`p-3.5 rounded-lg border text-xs font-semibold flex items-center justify-between transition-all ${
                language === 'ar'
                  ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 text-neutral-900 dark:text-neutral-100 shadow-xs'
                  : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
              }`}
            >
              <span className="font-arabic">{t('arabic')}</span>
              {language === 'ar' && <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
            </button>
          </div>
        </div>
      </div>

      {/* 2. Visual Appearance (Theme) */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-neutral-100 dark:border-neutral-800">
          <Sun className="w-5 h-5 text-amber-500" />
          <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
            {t('themeSettings')}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md">
          <button
            onClick={() => setTheme('light')}
            className={`p-3.5 rounded-lg border text-xs font-semibold flex items-center justify-between transition-all ${
              theme === 'light'
                ? 'border-indigo-600 bg-indigo-50/60 text-neutral-900 shadow-xs'
                : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 text-neutral-600 dark:text-neutral-400'
            }`}
          >
            <div className="flex items-center gap-2">
              <Sun className="w-4 h-4 text-amber-500" />
              <span>{t('lightMode')}</span>
            </div>
            {theme === 'light' && <Check className="w-4 h-4 text-indigo-600" />}
          </button>

          <button
            onClick={() => setTheme('dark')}
            className={`p-3.5 rounded-lg border text-xs font-semibold flex items-center justify-between transition-all ${
              theme === 'dark'
                ? 'border-indigo-600 bg-indigo-950/40 text-neutral-100 shadow-xs'
                : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
            }`}
          >
            <div className="flex items-center gap-2">
              <Moon className="w-4 h-4 text-indigo-400" />
              <span>{t('darkMode')}</span>
            </div>
            {theme === 'dark' && <Check className="w-4 h-4 text-indigo-400" />}
          </button>
        </div>
      </div>

      {/* 3. Notification Preferences */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-neutral-100 dark:border-neutral-800">
          <Bell className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
            {t('notificationPreferences')}
          </h2>
        </div>

        <div className="space-y-3">
          <label className="flex items-center justify-between p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/40 cursor-pointer">
            <span className="text-xs font-medium text-neutral-800 dark:text-neutral-200">
              {t('enableDeadlineAlerts')}
            </span>
            <input
              type="checkbox"
              checked={settings.notifyDeadlines}
              onChange={e => updateSettings({ notifyDeadlines: e.target.checked })}
              className="w-4 h-4 rounded-sm text-indigo-600 border-neutral-300 dark:border-neutral-700"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/40 cursor-pointer">
            <span className="text-xs font-medium text-neutral-800 dark:text-neutral-200">
              {t('enableOverdueAlerts')}
            </span>
            <input
              type="checkbox"
              checked={settings.notifyOverdue}
              onChange={e => updateSettings({ notifyOverdue: e.target.checked })}
              className="w-4 h-4 rounded-sm text-indigo-600 border-neutral-300 dark:border-neutral-700"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/40 cursor-pointer">
            <span className="text-xs font-medium text-neutral-800 dark:text-neutral-200">
              {t('enableAchievementAlerts')}
            </span>
            <input
              type="checkbox"
              checked={settings.notifyAchievements}
              onChange={e => updateSettings({ notifyAchievements: e.target.checked })}
              className="w-4 h-4 rounded-sm text-indigo-600 border-neutral-300 dark:border-neutral-700"
            />
          </label>

          <div className="flex items-center justify-between p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/40">
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.enableSound}
                  onChange={e => updateSettings({ enableSound: e.target.checked })}
                  className="w-4 h-4 rounded-sm text-indigo-600 border-neutral-300 dark:border-neutral-700"
                />
                <span className="text-xs font-medium text-neutral-800 dark:text-neutral-200">
                  {t('enableSoundEffects')}
                </span>
              </label>
            </div>
            <button
              type="button"
              onClick={() => playTaskCompletionSound(true)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900 rounded-md transition-colors"
              title="Test completion chime"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'تجربة الصوت' : 'Test Sound'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. Supabase Database Configuration & PostgreSQL Schema */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
              {t('databaseConnection')}
            </h2>
          </div>
          <span
            className={`text-[11px] font-mono px-2 py-0.5 rounded-sm font-semibold ${
              settings.isSupabaseConnected
                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400'
                : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'
            }`}
          >
            {settings.isSupabaseConnected ? t('supabaseConnected') : t('supabaseNotConnected')}
          </span>
        </div>

        <p className="text-xs text-neutral-500 leading-relaxed">
          {t('supabaseSetupNotice')}
        </p>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              {t('supabaseUrl')}
            </label>
            <input
              type="text"
              value={supabaseUrl}
              onChange={e => setSupabaseUrl(e.target.value)}
              placeholder="https://xyzcompany.supabase.co"
              className="w-full px-3 py-2 text-xs font-mono bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              {t('supabaseKey')}
            </label>
            <input
              type="password"
              value={supabaseKey}
              onChange={e => setSupabaseKey(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              className="w-full px-3 py-2 text-xs font-mono bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100"
            />
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={handleTestSupabase}
              disabled={isTesting}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors disabled:opacity-60"
            >
              {isTesting ? t('loading') : t('testConnection')}
            </button>

            <button
              onClick={() => setShowSql(prev => !prev)}
              className="px-3 py-2 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg transition-colors"
            >
              {showSql ? 'Hide SQL Schema' : t('viewSqlSchema')}
            </button>
          </div>

          {testResult && (
            <div
              className={`p-3 rounded-lg text-xs font-mono ${
                testResult.success
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                  : 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300'
              }`}
            >
              {testResult.message}
            </div>
          )}

          {/* Collapsible SQL Schema viewer */}
          {showSql && (
            <div className="mt-4 p-4 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-mono font-semibold">PostgreSQL DDL & RLS Policies Script</span>
                </div>
                <button
                  onClick={handleCopySql}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono font-semibold text-white bg-neutral-800 hover:bg-neutral-700 rounded-md transition-colors"
                >
                  {sqlCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{sqlCopied ? t('sqlCopied') : t('copySqlSchema')}</span>
                </button>
              </div>

              <pre className="text-[11px] font-mono overflow-x-auto max-h-72 p-3 bg-neutral-900 rounded-lg text-neutral-300 leading-relaxed">
                {SUPABASE_SQL_SCHEMA}
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* 5. Data Backup & Reset */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-xs space-y-4">
        <div className="pb-3 border-b border-neutral-100 dark:border-neutral-800">
          <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
            {t('dataManagement')}
          </h2>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <button
            onClick={handleExportJson}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>{t('exportJsonBackup')}</span>
          </button>

          <button
            onClick={handleResetDataClick}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-lg transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{t('resetAllData')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
