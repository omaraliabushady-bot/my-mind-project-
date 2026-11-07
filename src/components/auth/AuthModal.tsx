import React, { useState } from 'react';
import { X, Lock, Mail, User, ShieldCheck, Sparkles, AlertCircle, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../i18n/LanguageContext';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    authModalMode,
    closeAuthModal,
    setAuthModalMode,
    login,
    register,
    resetPassword,
  } = useAuth();
  const { language, t } = useLanguage();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfoMessage('');
    setIsLoading(true);

    try {
      if (authModalMode === 'login') {
        const res = await login(email, password);
        if (!res.success) {
          setError(res.error || t('invalidCredentials'));
        }
      } else if (authModalMode === 'register') {
        if (password !== confirmPassword) {
          setError(t('passwordsDoNotMatch'));
          setIsLoading(false);
          return;
        }
        if (password.length < 6) {
          setError('Password must be at least 6 characters.');
          setIsLoading(false);
          return;
        }
        const res = await register(email, fullName, password);
        if (!res.success) {
          setError(res.error || 'Failed to create account.');
        }
      } else if (authModalMode === 'forgot') {
        const res = await resetPassword(email);
        setInfoMessage(t('passwordResetSent'));
      }
    } catch {
      setError('An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setEmail('alex@taskflow.dev');
    setPassword('demo1234');
    await login('alex@taskflow.dev', 'demo1234');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-2xl p-6 text-start"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-100 dark:border-neutral-800">
          <div>
            <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
              {authModalMode === 'login'
                ? t('login')
                : authModalMode === 'register'
                ? t('createYourAccount')
                : t('resetPasswordTitle')}
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              {authModalMode === 'login'
                ? t('loginSubtitle')
                : authModalMode === 'register'
                ? t('registerSubtitle')
                : t('resetPasswordSubtitle')}
            </p>
          </div>
          <button
            onClick={closeAuthModal}
            className="p-1.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Demo Account Quick Shortcut */}
        {authModalMode === 'login' && (
          <div className="mt-4 p-3 rounded-lg bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-900/60 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <div>
                <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100 block">
                  {t('demoAccount')}
                </span>
                <span className="text-[10px] text-neutral-500">
                  Pre-configured with active projects, tasks, & achievements.
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleDemoLogin}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors shrink-0"
            >
              Enter
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 mt-4">
          {error && (
            <div className="p-3 text-xs bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {infoMessage && (
            <div className="p-3 text-xs bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 rounded-lg flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>{infoMessage}</span>
            </div>
          )}

          {authModalMode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                {t('fullName')} *
              </label>
              <div className="relative">
                <User className="absolute top-1/2 -translate-y-1/2 start-3 w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="e.g. Alex Vance"
                  className="w-full ps-9 pe-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              {t('emailAddress')} *
            </label>
            <div className="relative">
              <Mail className="absolute top-1/2 -translate-y-1/2 start-3 w-4 h-4 text-neutral-400" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full ps-9 pe-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100"
              />
            </div>
          </div>

          {authModalMode !== 'forgot' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  {t('password')} *
                </label>
                {authModalMode === 'login' && (
                  <button
                    type="button"
                    onClick={() => setAuthModalMode('forgot')}
                    className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    {t('forgotPassword')}
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute top-1/2 -translate-y-1/2 start-3 w-4 h-4 text-neutral-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full ps-9 pe-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100"
                />
              </div>
            </div>
          )}

          {authModalMode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                {t('confirmPassword')} *
              </label>
              <div className="relative">
                <Lock className="absolute top-1/2 -translate-y-1/2 start-3 w-4 h-4 text-neutral-400" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full ps-9 pe-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg shadow-xs transition-colors disabled:opacity-60"
          >
            {isLoading
              ? t('loading')
              : authModalMode === 'login'
              ? t('login')
              : authModalMode === 'register'
              ? t('register')
              : t('sendResetLink')}
          </button>
        </form>

        {/* Privacy Note */}
        <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs text-neutral-500">
          {authModalMode === 'login' ? (
            <div>
              <span>{t('dontHaveAccount')} </span>
              <button
                type="button"
                onClick={() => setAuthModalMode('register')}
                className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                {t('register')}
              </button>
            </div>
          ) : (
            <div>
              <span>{t('alreadyHaveAccount')} </span>
              <button
                type="button"
                onClick={() => setAuthModalMode('login')}
                className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                {t('login')}
              </button>
            </div>
          )}
        </div>

        <div className="mt-3 text-[10px] text-neutral-400 flex items-center gap-1.5 leading-tight">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
          <span>{t('privateAccountNotice')}</span>
        </div>
      </div>
    </div>
  );
};
