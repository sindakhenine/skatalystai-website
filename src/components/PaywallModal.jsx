import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// Icons
const StorageIcon = () => (
  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
  </svg>
);

const RunsIcon = () => (
  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const ConnectorsIcon = () => (
  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
  </svg>
);

const WarningIcon = () => (
  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-4 h-4 text-success" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
  </svg>
);

// Map API error codes to limit types
const errorCodeToLimitType = {
  QUOTA_EXCEEDED_GB: 'gb',
  QUOTA_EXCEEDED_RUNS: 'runs',
  QUOTA_EXCEEDED_CONNECTORS: 'connectors',
};

// Paywall modal component shown when free tier limits are reached
export default function PaywallModal({
  isOpen,
  onClose,
  errorCode,
  limitType: propLimitType,
  currentUsage = {},
}) {
  const { t } = useTranslation();

  if (!isOpen) return null;

  // Determine limit type from error code or prop
  const limitType = errorCode ? errorCodeToLimitType[errorCode] || 'generic' : propLimitType || 'generic';

  // Limit type messages with i18n
  const limitMessages = {
    gb: {
      title: t('paywall.gbTitle'),
      description: t('paywall.gbDescription'),
      icon: <StorageIcon />,
    },
    runs: {
      title: t('paywall.runsTitle'),
      description: t('paywall.runsDescription'),
      icon: <RunsIcon />,
    },
    connectors: {
      title: t('paywall.connectorsTitle'),
      description: t('paywall.connectorsDescription'),
      icon: <ConnectorsIcon />,
    },
    generic: {
      title: t('paywall.genericTitle'),
      description: t('paywall.genericDescription'),
      icon: <WarningIcon />,
    },
  };

  const { title, description, icon } = limitMessages[limitType] || limitMessages.generic;

  // Plan features comparison
  const plans = [
    {
      name: t('pricing.pro'),
      price: '$29',
      period: t('pricing.perMonth'),
      features: [
        t('paywall.proFeature1'),
        t('paywall.proFeature2'),
        t('paywall.proFeature3'),
      ],
      highlighted: true,
    },
    {
      name: t('pricing.business'),
      price: '$99',
      period: t('pricing.perMonth'),
      features: [
        t('paywall.businessFeature1'),
        t('paywall.businessFeature2'),
        t('paywall.businessFeature3'),
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-light-surface dark:bg-dark-surface rounded-2xl shadow-lg max-w-lg w-full p-8 border border-light-border dark:border-dark-border">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-text-secondary dark:text-text-dark-secondary hover:text-text-primary dark:hover:text-text-dark-primary transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-warning-bg dark:bg-warning/20 rounded-full flex items-center justify-center text-warning">
              {icon}
            </div>
          </div>

          {/* Title and description */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold text-text-primary dark:text-text-dark-primary mb-2">{title}</h2>
            <p className="text-text-secondary dark:text-text-dark-secondary">{description}</p>
          </div>

          {/* Current usage display */}
          {(currentUsage.gb !== undefined || currentUsage.runs !== undefined || currentUsage.connectors !== undefined) && (
            <div className="bg-light-soft dark:bg-dark-soft rounded-button p-4 mb-6">
              <p className="text-sm font-medium text-text-primary dark:text-text-dark-primary mb-2">
                {t('paywall.currentUsage')}
              </p>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-lg font-semibold text-text-primary dark:text-text-dark-primary">
                    {currentUsage.gb?.toFixed(2) || '0'} GB
                  </p>
                  <p className="text-xs text-text-secondary dark:text-text-dark-secondary">
                    {t('paywall.of')} {currentUsage.gbLimit || 1} GB
                  </p>
                </div>
                <div>
                  <p className="text-lg font-semibold text-text-primary dark:text-text-dark-primary">
                    {currentUsage.runs || 0}
                  </p>
                  <p className="text-xs text-text-secondary dark:text-text-dark-secondary">
                    {t('paywall.of')} {currentUsage.runsLimit || 5} {t('paywall.runs')}
                  </p>
                </div>
                <div>
                  <p className="text-lg font-semibold text-text-primary dark:text-text-dark-primary">
                    {currentUsage.connectors || 0}
                  </p>
                  <p className="text-xs text-text-secondary dark:text-text-dark-secondary">
                    {t('paywall.of')} {currentUsage.connectorsLimit || 2} {t('paywall.connectors')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Plan comparison */}
          <div className="space-y-3 mb-6">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`p-4 rounded-button border ${
                  plan.highlighted
                    ? 'border-ion bg-ion/10 dark:bg-ion/20'
                    : 'border-light-border dark:border-dark-border'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`font-semibold ${plan.highlighted ? 'text-slate dark:text-ion' : 'text-text-primary dark:text-text-dark-primary'}`}>
                    {plan.name}
                  </span>
                  <span className={`font-semibold ${plan.highlighted ? 'text-ion' : 'text-text-secondary dark:text-text-dark-secondary'}`}>
                    {plan.price}{plan.period}
                  </span>
                </div>
                <ul className="space-y-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-text-secondary dark:text-text-dark-secondary">
                      <CheckIcon />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Link
              to="/app/billing"
              onClick={onClose}
              className="block w-full text-center px-6 py-3 bg-slate text-white font-medium rounded-button shadow-button hover:bg-slate-hover transition-colors"
            >
              {t('paywall.upgradeNow')}
            </Link>
            <button
              onClick={onClose}
              className="w-full text-center px-6 py-3 text-text-secondary dark:text-text-dark-secondary font-medium hover:text-text-primary dark:hover:text-text-dark-primary transition-colors"
            >
              {t('paywall.maybeLater')}
            </button>
          </div>

          {/* Reset info */}
          <p className="mt-4 text-center text-xs text-text-secondary dark:text-text-dark-secondary">
            {t('paywall.resetInfo')}
          </p>
        </div>
      </div>
    </div>
  );
}
