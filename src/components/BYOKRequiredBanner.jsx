/**
 * BYOK Required Banner Component
 *
 * Displays a blocking message when a feature requires BYOK (LLM API keys)
 * but the tenant has no keys configured.
 *
 * Usage:
 * <BYOKRequiredBanner
 *   show={!hasByokKeys}
 *   featureName="AI Classification"
 * />
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const KeyIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
  </svg>
);

export default function BYOKRequiredBanner({ show, featureName, inline = false }) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  if (!show) return null;

  const handleConfigureClick = () => {
    navigate('/settings', { state: { scrollTo: 'byok' } });
  };

  // Inline variant - smaller, for embedding in forms/cards
  if (inline) {
    return (
      <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              {t('settings.byok.requiredMessage')}
            </p>
          </div>
          <button
            onClick={handleConfigureClick}
            className="flex-shrink-0 px-3 py-1.5 text-sm font-medium text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-800/50 rounded hover:bg-amber-200 dark:hover:bg-amber-800 transition-colors"
          >
            {t('settings.byok.requiredAction')}
          </button>
        </div>
      </div>
    );
  }

  // Full-page blocking variant
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
      <div className="max-w-md text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
          <KeyIcon />
        </div>

        <h2 className="text-xl font-semibold text-text-primary dark:text-text-dark-primary mb-2">
          {t('settings.byok.requiredTitle')}
        </h2>

        {featureName && (
          <p className="text-sm text-text-secondary dark:text-text-dark-secondary mb-2">
            {featureName}
          </p>
        )}

        <p className="text-text-secondary dark:text-text-dark-secondary mb-6">
          {t('settings.byok.noKeysMessage')}
        </p>

        <button
          onClick={handleConfigureClick}
          className="inline-flex items-center gap-2 px-6 py-3 bg-ion text-white font-medium rounded-lg hover:bg-ion/90 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {t('settings.byok.requiredAction')}
        </button>

        <p className="mt-6 text-xs text-text-tertiary dark:text-text-dark-tertiary">
          {t('settings.byok.costBanner')}
        </p>
      </div>
    </div>
  );
}

/**
 * Hook to check BYOK status for the current tenant
 */
export function useBYOKStatus() {
  const [status, setStatus] = React.useState({
    loading: true,
    configured: false,
    providers: [],
    defaultProvider: null
  });

  React.useEffect(() => {
    const checkStatus = async () => {
      try {
        // This would typically use authFetch from AuthContext
        const response = await fetch('/api/byok/keys', {
          credentials: 'include'
        });

        if (response.ok) {
          const data = await response.json();
          const activeKeys = (data.keys || []).filter(k => k.isActive);
          setStatus({
            loading: false,
            configured: activeKeys.length > 0,
            providers: activeKeys.map(k => k.provider),
            defaultProvider: data.defaultProvider
          });
        } else {
          setStatus({
            loading: false,
            configured: false,
            providers: [],
            defaultProvider: null
          });
        }
      } catch (error) {
        console.error('Failed to check BYOK status:', error);
        setStatus({
          loading: false,
          configured: false,
          providers: [],
          defaultProvider: null
        });
      }
    };

    checkStatus();
  }, []);

  return status;
}
