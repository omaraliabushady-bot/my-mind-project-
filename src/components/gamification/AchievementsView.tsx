import React from 'react';
import {
  Trophy,
  Flame,
  Sparkles,
  Award,
  CheckCircle2,
  Lock,
  Zap,
  Target,
  History,
  ShieldCheck,
  FolderCheck
} from 'lucide-react';
import { useTaskFlow } from '../../context/TaskFlowContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../i18n/LanguageContext';
import {
  calculateLevelInfo,
  LEVEL_THRESHOLDS,
  WEEKLY_CHALLENGES,
  PRIORITY_POINTS
} from '../../services/storage';

export const AchievementsView: React.FC = () => {
  const {
    achievementsCatalog,
    userAchievements,
    transactions,
    tasks,
    archivedTasks,
  } = useTaskFlow();
  const { currentUser } = useAuth();
  const { language, t } = useLanguage();

  const isAr = language === 'ar';
  const totalPoints = currentUser?.points || 0;
  const levelInfo = calculateLevelInfo(totalPoints);

  const getAchievementIcon = (iconName: string) => {
    switch (iconName) {
      case 'Sparkles':
        return <Sparkles className="w-5 h-5" />;
      case 'CheckCircle2':
        return <CheckCircle2 className="w-5 h-5" />;
      case 'Award':
        return <Award className="w-5 h-5" />;
      case 'Trophy':
        return <Trophy className="w-5 h-5" />;
      case 'Flame':
        return <Flame className="w-5 h-5" />;
      case 'Zap':
        return <Zap className="w-5 h-5" />;
      case 'FolderCheck':
        return <FolderCheck className="w-5 h-5" />;
      default:
        return <Award className="w-5 h-5" />;
    }
  };

  const unlockedMap = new Map<string, string>();
  userAchievements.forEach(ua => unlockedMap.set(ua.achievementCode, ua.unlockedAt));

  // Compute challenge progress
  const completedThisWeek = archivedTasks.length; // simplified proxy
  const urgentThisWeek = archivedTasks.filter(t => t.priority === 'urgent' || t.priority === 'high').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
          {t('achievementsTitle')}
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500">
          {t('achievementsSubtitle')}
        </p>
      </div>

      {/* Hero Strip: Current Level & Streak Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Level Progress Card */}
        <div className="md:col-span-2 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-xs flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                  <Trophy className="w-5 h-5" />
                </span>
                <div>
                  <span className="text-xs text-neutral-400 uppercase tracking-wider font-mono">
                    {t('currentLevel')} {levelInfo.level}
                  </span>
                  <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                    {isAr ? levelInfo.titleAr : levelInfo.titleEn}
                  </h2>
                </div>
              </div>

              <div className="text-end">
                <span className="text-2xl font-bold font-mono text-indigo-600 dark:text-indigo-400">
                  {totalPoints} XP
                </span>
                <span className="block text-[11px] text-neutral-400">
                  {t('totalPoints')}
                </span>
              </div>
            </div>

            {/* Progress Bar to next level */}
            <div className="pt-4 space-y-1.5">
              <div className="flex items-center justify-between text-xs text-neutral-600 dark:text-neutral-400 font-mono">
                <span>Level {levelInfo.level}</span>
                <span>
                  {levelInfo.xpNeeded > 0
                    ? `${levelInfo.xpNeeded} XP ${t('xpToNextLevel')}`
                    : 'Max Tier Achieved'}
                </span>
                <span>Level {levelInfo.nextLevel}</span>
              </div>
              <div className="w-full bg-neutral-100 dark:bg-neutral-800 h-3 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-600 dark:bg-indigo-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${levelInfo.progress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Point System Legend */}
          <div className="pt-4 mt-4 border-t border-neutral-100 dark:border-neutral-800 grid grid-cols-4 gap-2 text-center text-[11px]">
            <div className="p-1.5 rounded-lg bg-neutral-50 dark:bg-neutral-800/60">
              <span className="block text-neutral-400 text-[10px]">Low Priority</span>
              <span className="font-mono font-bold text-neutral-700 dark:text-neutral-300">+{PRIORITY_POINTS.low} XP</span>
            </div>
            <div className="p-1.5 rounded-lg bg-neutral-50 dark:bg-neutral-800/60">
              <span className="block text-blue-500 text-[10px]">Medium</span>
              <span className="font-mono font-bold text-blue-600 dark:text-blue-400">+{PRIORITY_POINTS.medium} XP</span>
            </div>
            <div className="p-1.5 rounded-lg bg-neutral-50 dark:bg-neutral-800/60">
              <span className="block text-amber-500 text-[10px]">High</span>
              <span className="font-mono font-bold text-amber-600 dark:text-amber-400">+{PRIORITY_POINTS.high} XP</span>
            </div>
            <div className="p-1.5 rounded-lg bg-neutral-50 dark:bg-neutral-800/60">
              <span className="block text-red-500 text-[10px]">Urgent</span>
              <span className="font-mono font-bold text-red-600 dark:text-red-400">+{PRIORITY_POINTS.urgent} XP</span>
            </div>
          </div>
        </div>

        {/* Daily Streak Card */}
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                <Flame className="w-5 h-5 fill-amber-500" />
              </span>
              <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                {t('streakTitle')}
              </h3>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
              {t('streakSubtitle')}
            </p>
          </div>

          <div className="my-4 text-center">
            <span className="text-4xl font-extrabold font-mono text-amber-600 dark:text-amber-400 tabular-nums">
              {currentUser?.currentStreak || 0}
            </span>
            <span className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider mt-1">
              {t('streakDays')}
            </span>
          </div>

          <div className="text-center text-[11px] text-neutral-400 font-mono pt-3 border-t border-neutral-100 dark:border-neutral-800">
            <span>Longest Record: {currentUser?.longestStreak || 0} days</span>
          </div>
        </div>
      </div>

      {/* Weekly Challenges */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
              {t('weeklyChallengesTitle')}
            </h3>
          </div>
          <span className="text-xs font-mono text-neutral-400">Resets weekly</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {WEEKLY_CHALLENGES.map(challenge => {
            const current = challenge.type === 'complete_tasks' ? completedThisWeek : urgentThisWeek;
            const progress = Math.min(100, Math.round((current / challenge.target) * 100));
            const isCompleted = current >= challenge.target;

            return (
              <div
                key={challenge.id}
                className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/40 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                    {isAr ? challenge.titleAr : challenge.titleEn}
                  </h4>
                  <span className="text-xs font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                    +{challenge.rewardPoints} XP
                  </span>
                </div>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  {isAr ? challenge.descriptionAr : challenge.descriptionEn}
                </p>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-mono text-neutral-500">
                    <span>Progress</span>
                    <span>{Math.min(current, challenge.target)} / {challenge.target}</span>
                  </div>
                  <div className="w-full bg-neutral-200 dark:bg-neutral-700 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isCompleted ? 'bg-emerald-500' : 'bg-indigo-600'
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Badges Collection */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
            {t('badgesCollectionTitle')}
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievementsCatalog.map(ach => {
            const unlockedAt = unlockedMap.get(ach.code);
            const isUnlocked = !!unlockedAt;

            return (
              <div
                key={ach.id}
                className={`p-4 rounded-xl border transition-all flex items-start gap-3.5 ${
                  isUnlocked
                    ? 'border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/20 dark:bg-indigo-950/20 shadow-xs'
                    : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50/40 dark:bg-neutral-900/40 opacity-60'
                }`}
              >
                <div
                  className={`p-2.5 rounded-xl shrink-0 ${
                    isUnlocked
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-400'
                  }`}
                >
                  {isUnlocked ? getAchievementIcon(ach.icon) : <Lock className="w-5 h-5" />}
                </div>

                <div className="min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-1">
                    <h4 className="text-xs font-bold text-neutral-900 dark:text-neutral-100 truncate">
                      {isAr ? ach.titleAr : ach.titleEn}
                    </h4>
                    <span className="text-[10px] font-mono font-semibold text-indigo-600 dark:text-indigo-400 shrink-0">
                      +{ach.pointsReward} XP
                    </span>
                  </div>

                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 line-clamp-2 leading-relaxed">
                    {isAr ? ach.descriptionAr : ach.descriptionEn}
                  </p>

                  <div className="text-[10px] font-mono pt-1 text-neutral-400">
                    {isUnlocked ? (
                      <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-semibold">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{t('unlockedOn')} {new Date(unlockedAt).toLocaleDateString()}</span>
                      </span>
                    ) : (
                      <span>{t('lockedBadge')}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Points Transactions Audit Log */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-neutral-500" />
          <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
            {t('pointsHistory')}
          </h3>
        </div>

        <div className="divide-y divide-neutral-100 dark:divide-neutral-800 max-h-64 overflow-y-auto">
          {transactions.length === 0 ? (
            <div className="py-8 text-center text-xs text-neutral-400">
              No points transactions recorded yet.
            </div>
          ) : (
            transactions.map((tx, idx) => (
              <div key={`${tx.id}_${idx}`} className="py-2.5 flex items-center justify-between text-xs font-mono">
                <div className="min-w-0 flex-1 pe-3">
                  <p className="text-neutral-800 dark:text-neutral-200 font-sans truncate">
                    {tx.reason}
                  </p>
                  <span className="text-[10px] text-neutral-400">
                    {new Date(tx.createdAt).toLocaleString()}
                  </span>
                </div>
                <span
                  className={`font-bold shrink-0 ${
                    tx.type === 'reversed'
                      ? 'text-red-500'
                      : tx.type === 'bonus'
                      ? 'text-amber-500'
                      : 'text-emerald-500'
                  }`}
                >
                  {tx.type === 'reversed' ? '-' : '+'}{tx.points} XP
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
