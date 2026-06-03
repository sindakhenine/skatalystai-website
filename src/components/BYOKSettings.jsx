/**
 * BYOK Settings Component
 *
 * Allows tenants to manage their own LLM API keys.
 *
 * SECURITY:
 * - Keys are never displayed in full
 * - Keys are cleared from state after submission
 * - Input fields are not autocompleted
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';

// Provider icons
const ClaudeIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
  </svg>
);

const OpenAIIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364l2.0201-1.1685a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6099-1.4997Z"/>
  </svg>
);

const GeminiIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
  </svg>
);

// Icons
const KeyIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const XIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const TrashIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const RefreshIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

const LoadingSpinner = () => (
  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
  </svg>
);

// Provider info
const PROVIDERS = {
  claude: {
    name: 'Anthropic Claude',
    icon: ClaudeIcon,
    placeholder: 'sk-ant-api...',
    helpUrl: 'https://console.anthropic.com/settings/keys'
  },
  openai: {
    name: 'OpenAI GPT',
    icon: OpenAIIcon,
    placeholder: 'sk-...',
    helpUrl: 'https://platform.openai.com/api-keys'
  },
  gemini: {
    name: 'Google Gemini',
    icon: GeminiIcon,
    placeholder: 'AI...',
    helpUrl: 'https://aistudio.google.com/apikey'
  }
};

// Provider key input component
function ProviderKeyInput({ provider, existingKey, onSave, onDelete, onTest }) {
  const { t } = useTranslation();
  const [apiKey, setApiKey] = useState('');
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [showInput, setShowInput] = useState(false);

  const providerInfo = PROVIDERS[provider];
  const Icon = providerInfo.icon;

  const handleSave = async () => {
    if (!apiKey.trim()) return;
    setSaving(true);
    setTestResult(null);
    try {
      await onSave(provider, apiKey);
      setApiKey('');
      setShowInput(false);
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    if (!apiKey.trim()) return;
    setTesting(true);
    setTestResult(null);
    try {
      const result = await onTest(provider, apiKey);
      setTestResult(result);
    } finally {
      setTesting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(t('settings.byok.confirmDelete', { provider: providerInfo.name }))) return;
    await onDelete(provider);
  };

  return (
    <div className="border border-light-border dark:border-dark-border rounded-lg overflow-hidden">
      <div className="flex items-center justify-between p-4 bg-light-soft dark:bg-dark-soft">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-light-surface dark:bg-dark-surface flex items-center justify-center text-text-primary dark:text-text-dark-primary">
            <Icon />
          </div>
          <div>
            <p className="font-medium text-text-primary dark:text-text-dark-primary">
              {providerInfo.name}
            </p>
            {existingKey ? (
              <p className="text-sm text-success font-mono">
                {existingKey.fingerprint}
                {existingKey.lastUsed && (
                  <span className="text-text-secondary dark:text-text-dark-secondary ml-2">
                    ({t('settings.byok.lastUsed')}: {new Date(existingKey.lastUsed).toLocaleDateString()})
                  </span>
                )}
              </p>
            ) : (
              <p className="text-sm text-text-secondary dark:text-text-dark-secondary">
                {t('settings.byok.notConfigured')}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {existingKey && (
            <button
              onClick={handleDelete}
              className="p-2 text-error hover:bg-error-bg rounded transition-colors"
              title={t('settings.byok.delete')}
            >
              <TrashIcon />
            </button>
          )}
          <button
            onClick={() => setShowInput(!showInput)}
            className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
              existingKey
                ? 'border border-light-border dark:border-dark-border text-text-primary dark:text-text-dark-primary hover:bg-light-soft dark:hover:bg-dark-soft'
                : 'bg-ion text-white hover:bg-ion/90'
            }`}
          >
            {existingKey ? t('settings.byok.rotate') : t('settings.byok.addKey')}
          </button>
        </div>
      </div>

      {showInput && (
        <div className="p-4 space-y-3 border-t border-light-border dark:border-dark-border">
          <div>
            <label className="block text-sm font-medium text-text-primary dark:text-text-dark-primary mb-1">
              {t('settings.byok.apiKey')}
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={providerInfo.placeholder}
              autoComplete="off"
              data-lpignore="true"
              className="w-full px-4 py-2 border border-light-border dark:border-dark-border rounded-button bg-light-surface dark:bg-dark-surface text-text-primary dark:text-text-dark-primary font-mono focus:outline-none focus:ring-2 focus:ring-ion/40 focus:border-ion"
            />
            <p className="text-xs text-text-secondary dark:text-text-dark-secondary mt-1">
              {t('settings.byok.getKey')}{' '}
              <a
                href={providerInfo.helpUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-ion hover:underline"
              >
                {providerInfo.name}
              </a>
            </p>
          </div>

          {testResult && (
            <div className={`p-3 rounded-lg ${testResult.valid ? 'bg-success-bg text-success' : 'bg-error-bg text-error'}`}>
              <div className="flex items-center gap-2">
                {testResult.valid ? <CheckIcon /> : <XIcon />}
                <span className="text-sm">
                  {testResult.valid ? t('settings.byok.testSuccess') : testResult.error}
                </span>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={handleTest}
              disabled={!apiKey.trim() || testing}
              className="flex items-center gap-2 px-4 py-2 border border-light-border dark:border-dark-border rounded-button text-text-primary dark:text-text-dark-primary hover:bg-light-soft dark:hover:bg-dark-soft disabled:opacity-50 transition-colors"
            >
              {testing ? <LoadingSpinner /> : <RefreshIcon />}
              {t('settings.byok.testKey')}
            </button>
            <button
              onClick={handleSave}
              disabled={!apiKey.trim() || saving}
              className="flex items-center gap-2 px-4 py-2 bg-slate text-white font-medium rounded-button hover:bg-slate-hover disabled:opacity-50 transition-colors"
            >
              {saving && <LoadingSpinner />}
              {existingKey ? t('settings.byok.rotateKey') : t('settings.byok.saveKey')}
            </button>
            <button
              onClick={() => {
                setShowInput(false);
                setApiKey('');
                setTestResult(null);
              }}
              className="px-4 py-2 border border-light-border dark:border-dark-border rounded-button text-text-secondary dark:text-text-dark-secondary hover:bg-light-soft dark:hover:bg-dark-soft transition-colors"
            >
              {t('common.cancel')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Main BYOK Settings component
export default function BYOKSettings() {
  const { t } = useTranslation();
  const { authFetch } = useAuth();
  const [keys, setKeys] = useState([]);
  const [defaultProvider, setDefaultProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch keys on mount
  useEffect(() => {
    fetchKeys();
  }, []);

  const fetchKeys = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await authFetch('/byok/keys');
      if (response.ok) {
        const data = await response.json();
        setKeys(data.keys || []);
        setDefaultProvider(data.defaultProvider);
      } else {
        throw new Error('Failed to fetch API keys');
      }
    } catch (err) {
      console.error('Failed to fetch BYOK keys:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveKey = async (provider, apiKey) => {
    try {
      const response = await authFetch('/byok/keys', {
        method: 'POST',
        body: JSON.stringify({ provider, apiKey })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save key');
      }

      await fetchKeys();
    } catch (err) {
      console.error('Failed to save key:', err);
      alert(err.message);
    }
  };

  const handleDeleteKey = async (provider) => {
    try {
      const response = await authFetch(`/byok/keys/${provider}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete key');
      }

      await fetchKeys();
    } catch (err) {
      console.error('Failed to delete key:', err);
      alert(err.message);
    }
  };

  const handleTestKey = async (provider, apiKey) => {
    try {
      const response = await authFetch('/byok/keys/test', {
        method: 'POST',
        body: JSON.stringify({ provider, apiKey })
      });

      return await response.json();
    } catch (err) {
      return { valid: false, error: err.message };
    }
  };

  const handleSetDefaultProvider = async (provider) => {
    try {
      const response = await authFetch('/byok/default-provider', {
        method: 'PUT',
        body: JSON.stringify({ provider })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to set default provider');
      }

      setDefaultProvider(provider);
    } catch (err) {
      console.error('Failed to set default provider:', err);
      alert(err.message);
    }
  };

  // Get existing key for a provider
  const getKeyForProvider = (provider) => {
    return keys.find(k => k.provider === provider && k.isActive);
  };

  if (loading) {
    return (
      <div className="bg-light-surface dark:bg-dark-surface rounded-xl border border-light-border dark:border-dark-border p-6">
        <div className="flex items-center justify-center">
          <LoadingSpinner />
          <span className="ml-2 text-text-secondary dark:text-text-dark-secondary">
            {t('common.loading')}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-light-surface dark:bg-dark-surface rounded-xl border border-light-border dark:border-dark-border overflow-hidden">
      <div className="px-6 py-4 border-b border-light-border dark:border-dark-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-ion/10 flex items-center justify-center text-ion">
            <KeyIcon />
          </div>
          <div>
            <h3 className="font-semibold text-text-primary dark:text-text-dark-primary">
              {t('settings.byok.title')}
            </h3>
            <p className="text-sm text-text-secondary dark:text-text-dark-secondary">
              {t('settings.byok.description')}
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Cost responsibility banner */}
        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-amber-800 dark:text-amber-200">
                {t('settings.byok.warningTitle')}
              </h4>
              <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                {t('settings.byok.warningText')}
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-error-bg border border-error/20 rounded-lg">
            <p className="text-sm text-error">{error}</p>
          </div>
        )}

        {/* Provider keys */}
        <div className="space-y-4">
          {Object.keys(PROVIDERS).map(provider => (
            <ProviderKeyInput
              key={provider}
              provider={provider}
              existingKey={getKeyForProvider(provider)}
              onSave={handleSaveKey}
              onDelete={handleDeleteKey}
              onTest={handleTestKey}
            />
          ))}
        </div>

        {/* Default provider selection */}
        {keys.filter(k => k.isActive).length > 0 && (
          <div className="pt-4 border-t border-light-border dark:border-dark-border">
            <label className="block text-sm font-medium text-text-primary dark:text-text-dark-primary mb-2">
              {t('settings.byok.defaultProvider')}
            </label>
            <select
              value={defaultProvider || ''}
              onChange={(e) => handleSetDefaultProvider(e.target.value)}
              className="w-full max-w-xs px-4 py-2 border border-light-border dark:border-dark-border rounded-button bg-light-surface dark:bg-dark-surface text-text-primary dark:text-text-dark-primary focus:outline-none focus:ring-2 focus:ring-ion/40 focus:border-ion"
            >
              <option value="">{t('settings.byok.selectDefault')}</option>
              {keys.filter(k => k.isActive).map(key => (
                <option key={key.provider} value={key.provider}>
                  {PROVIDERS[key.provider].name}
                </option>
              ))}
            </select>
            <p className="text-xs text-text-secondary dark:text-text-dark-secondary mt-1">
              {t('settings.byok.defaultProviderHelp')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
