import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { useTaskFlow } from '../../context/TaskFlowContext';
import { useLanguage } from '../../i18n/LanguageContext';

export const ConfirmationModal: React.FC = () => {
  const { confirmDialog, closeConfirmDialog } = useTaskFlow();
  const { t } = useLanguage();

  if (!confirmDialog.isOpen) return null;

  const isDanger = confirmDialog.variant !== 'primary';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-xl overflow-hidden p-6 text-start"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-lg ${
                isDanger
                  ? 'bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400'
                  : 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400'
              }`}
            >
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
              {confirmDialog.title}
            </h3>
          </div>
          <button
            onClick={closeConfirmDialog}
            className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6 leading-relaxed">
          {confirmDialog.message}
        </p>

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={closeConfirmDialog}
            className="px-4 py-2 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
          >
            {t('cancel')}
          </button>
          <button
            type="button"
            onClick={confirmDialog.onConfirm}
            className={`px-4 py-2 text-xs font-medium text-white rounded-lg transition-colors shadow-xs ${
              isDanger
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {confirmDialog.confirmText || t('confirm')}
          </button>
        </div>
      </div>
    </div>
  );
};
