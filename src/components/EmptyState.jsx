import React from 'react';
import { useTranslation } from 'react-i18next';

// Illustration SVGs
const NoDataIllustration = () => (
  <svg className="w-32 h-32 text-gray-300" fill="none" viewBox="0 0 128 128">
    <circle cx="64" cy="64" r="60" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
    <path d="M44 52h40M44 64h28M44 76h36" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <circle cx="84" cy="84" r="20" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="2" />
    <path d="M78 84l4 4 8-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ConnectorIllustration = () => (
  <svg className="w-32 h-32 text-gray-300" fill="none" viewBox="0 0 128 128">
    <circle cx="40" cy="64" r="24" stroke="currentColor" strokeWidth="2" />
    <circle cx="88" cy="64" r="24" stroke="currentColor" strokeWidth="2" />
    <path d="M64 64h0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="4 4" />
    <path d="M32 56l8 8-8 8M96 56l-8 8 8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const LockedIllustration = () => (
  <svg className="w-32 h-32 text-gray-300" fill="none" viewBox="0 0 128 128">
    <rect x="32" y="56" width="64" height="48" rx="8" stroke="currentColor" strokeWidth="2" />
    <path d="M48 56V44c0-8.837 7.163-16 16-16s16 7.163 16 16v12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <circle cx="64" cy="76" r="6" fill="currentColor" fillOpacity="0.3" />
    <path d="M64 82v8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const AnalysisIllustration = () => (
  <svg className="w-32 h-32 text-gray-300" fill="none" viewBox="0 0 128 128">
    <rect x="24" y="32" width="80" height="64" rx="4" stroke="currentColor" strokeWidth="2" />
    <path d="M24 48h80" stroke="currentColor" strokeWidth="2" />
    <path d="M40 64l12 16 16-24 20 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="32" cy="40" r="4" fill="currentColor" fillOpacity="0.3" />
    <circle cx="44" cy="40" r="4" fill="currentColor" fillOpacity="0.3" />
    <circle cx="56" cy="40" r="4" fill="currentColor" fillOpacity="0.3" />
  </svg>
);

// Empty state component
export default function EmptyState({
  type = 'default',
  title,
  description,
  actionLabel,
  onAction,
  locked = false,
  lockedReason,
  onLockedClick
}) {
  const { t } = useTranslation();

  const illustrations = {
    default: <NoDataIllustration />,
    connectors: <ConnectorIllustration />,
    locked: <LockedIllustration />,
    analysis: <AnalysisIllustration />
  };

  const defaults = {
    dashboard: {
      illustration: 'default',
      title: t('emptyState.dashboard.title'),
      description: t('emptyState.dashboard.description'),
      actionLabel: t('emptyState.dashboard.action')
    },
    connectors: {
      illustration: 'connectors',
      title: t('emptyState.connectors.title'),
      description: t('emptyState.connectors.description'),
      actionLabel: t('emptyState.connectors.action')
    },
    ingest: {
      illustration: 'locked',
      title: t('emptyState.ingest.title'),
      description: t('emptyState.ingest.description'),
      actionLabel: t('emptyState.ingest.action'),
      locked: true,
      lockedReason: t('emptyState.ingest.lockedReason')
    },
    metrics: {
      illustration: 'analysis',
      title: t('emptyState.metrics.title'),
      description: t('emptyState.metrics.description'),
      actionLabel: null
    },
    blueprints: {
      illustration: 'analysis',
      title: t('emptyState.blueprints.title'),
      description: t('emptyState.blueprints.description'),
      actionLabel: null
    },
    organized: {
      illustration: 'analysis',
      title: t('emptyState.organized.title'),
      description: t('emptyState.organized.description'),
      actionLabel: null
    },
    contexts: {
      illustration: 'default',
      title: t('emptyState.contexts.title'),
      description: t('emptyState.contexts.description'),
      actionLabel: t('emptyState.contexts.action')
    }
  };

  const config = defaults[type] || {};
  const displayTitle = title || config.title;
  const displayDescription = description || config.description;
  const displayActionLabel = actionLabel || config.actionLabel;
  const isLocked = locked || config.locked;
  const displayLockedReason = lockedReason || config.lockedReason;
  const illustration = illustrations[config.illustration] || illustrations.default;

  const handleClick = () => {
    if (isLocked && onLockedClick) {
      onLockedClick();
    } else if (onAction) {
      onAction();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
      <div className="mb-6">
        {isLocked ? illustrations.locked : illustration}
      </div>

      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        {displayTitle}
      </h3>

      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mb-6">
        {displayDescription}
      </p>

      {isLocked && displayLockedReason && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg px-4 py-3 mb-6 max-w-md">
          <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="text-sm">{displayLockedReason}</span>
          </div>
        </div>
      )}

      {displayActionLabel && (
        <button
          onClick={handleClick}
          className={`px-6 py-2.5 rounded-lg font-medium text-sm transition-colors ${
            isLocked
              ? 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              : 'bg-ion text-white hover:opacity-90 shadow-lg'
          }`}
        >
          {isLocked && (
            <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          )}
          {displayActionLabel}
        </button>
      )}

      {!isLocked && config.illustration === 'analysis' && (
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg max-w-sm">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {t('emptyState.analysisPreview')}
          </p>
          <div className="mt-3 flex items-center gap-2">
            <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full w-0 bg-ion rounded-full" />
            </div>
            <span className="text-xs text-gray-400">0%</span>
          </div>
        </div>
      )}
    </div>
  );
}

// Locked Feature Card - for sidebar items that are locked
export function LockedFeatureCard({ title, reason, onUnlock }) {
  const { t } = useTranslation();

  return (
    <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 text-center">
      <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      </div>
      <h4 className="font-medium text-gray-900 dark:text-white mb-2">{title}</h4>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{reason}</p>
      {onUnlock && (
        <button
          onClick={onUnlock}
          className="text-sm text-ion hover:underline"
        >
          {t('emptyState.unlockNow')}
        </button>
      )}
    </div>
  );
}
