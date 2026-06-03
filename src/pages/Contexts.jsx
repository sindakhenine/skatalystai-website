import React from 'react';
import { useTranslation } from 'react-i18next';
import ContextLibrary from '../components/ContextLibrary';

// Icon
const DocumentTextIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

export default function Contexts() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
            <DocumentTextIcon />
          </div>
          <h1 className="text-2xl font-bold text-text-primary dark:text-text-dark-primary">
            {t('context.libraryTitle')}
          </h1>
        </div>
        <p className="text-text-secondary dark:text-text-dark-secondary ml-13">
          {t('context.pageSubtitle', 'Create and manage reusable context templates for your data analysis')}
        </p>
      </div>

      {/* Context Library */}
      <ContextLibrary />
    </div>
  );
}
