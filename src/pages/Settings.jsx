import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import BYOKSettings from '../components/BYOKSettings';

// Icons
const UserIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const KeyIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
  </svg>
);

const DatabaseIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
  </svg>
);

const BellIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);

const TrashIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const CopyIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);

const EyeIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const EyeOffIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
  </svg>
);

const PlusIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const SettingsIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

// Section card wrapper
function SettingsSection({ icon, title, description, children }) {
  return (
    <div className="bg-light-surface dark:bg-dark-surface rounded-xl border border-light-border dark:border-dark-border overflow-hidden">
      <div className="px-6 py-4 border-b border-light-border dark:border-dark-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-ion/10 flex items-center justify-center text-ion">
            {icon}
          </div>
          <div>
            <h3 className="font-semibold text-text-primary dark:text-text-dark-primary">{title}</h3>
            <p className="text-sm text-text-secondary dark:text-text-dark-secondary">{description}</p>
          </div>
        </div>
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  );
}

// Toggle switch
function Toggle({ enabled, onChange, label }) {
  return (
    <label className="flex items-center justify-between cursor-pointer">
      <span className="text-sm text-text-primary dark:text-text-dark-primary">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-ion focus:ring-offset-2 ${
          enabled ? 'bg-ion' : 'bg-gray-200 dark:bg-gray-700'
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            enabled ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </label>
  );
}

// API Key row
function ApiKeyRow({ apiKey, onRevoke, t }) {
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(apiKey.key);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const maskedKey = apiKey.key.substring(0, 8) + '...' + apiKey.key.substring(apiKey.key.length - 4);

  return (
    <div className="flex items-center justify-between p-3 bg-light-soft dark:bg-dark-soft rounded-lg">
      <div className="flex-1 min-w-0">
        <p className="font-medium text-text-primary dark:text-text-dark-primary">{apiKey.name}</p>
        <p className="text-sm font-mono text-text-secondary dark:text-text-dark-secondary">
          {showKey ? apiKey.key : maskedKey}
        </p>
        <p className="text-xs text-text-secondary dark:text-text-dark-secondary mt-1">
          {t('settings.apiKeys.created')}: {new Date(apiKey.createdAt).toLocaleDateString()}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowKey(!showKey)}
          className="p-2 text-text-secondary hover:text-text-primary dark:text-text-dark-secondary dark:hover:text-text-dark-primary transition-colors"
          title={showKey ? t('settings.apiKeys.hide') : t('settings.apiKeys.show')}
        >
          {showKey ? <EyeOffIcon /> : <EyeIcon />}
        </button>
        <button
          onClick={handleCopy}
          className="p-2 text-text-secondary hover:text-text-primary dark:text-text-dark-secondary dark:hover:text-text-dark-primary transition-colors"
          title={t('common.copy')}
        >
          {copied ? '✓' : <CopyIcon />}
        </button>
        <button
          onClick={() => onRevoke(apiKey.id)}
          className="p-2 text-error hover:bg-error-bg rounded transition-colors"
          title={t('settings.apiKeys.revoke')}
        >
          <TrashIcon />
        </button>
      </div>
    </div>
  );
}

// Delete confirmation modal
function DeleteAccountModal({ isOpen, onClose, onConfirm, t }) {
  const [confirmText, setConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);

  if (!isOpen) return null;

  const handleDelete = async () => {
    if (confirmText !== 'DELETE') return;
    setDeleting(true);
    try {
      await onConfirm();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-md bg-light-surface dark:bg-dark-surface rounded-2xl shadow-xl">
          <div className="p-6">
            <div className="w-12 h-12 rounded-full bg-error-bg flex items-center justify-center text-error mx-auto mb-4">
              <TrashIcon />
            </div>
            <h2 className="text-xl font-bold text-text-primary dark:text-text-dark-primary text-center mb-2">
              {t('settings.deleteAccount.title')}
            </h2>
            <p className="text-text-secondary dark:text-text-dark-secondary text-center mb-6">
              {t('settings.deleteAccount.warning')}
            </p>
            <div className="mb-6">
              <label className="block text-sm font-medium text-text-primary dark:text-text-dark-primary mb-2">
                {t('settings.deleteAccount.confirmLabel')}
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="DELETE"
                className="w-full px-4 py-2 border border-light-border dark:border-dark-border rounded-button bg-light-surface dark:bg-dark-surface text-text-primary dark:text-text-dark-primary focus:outline-none focus:ring-2 focus:ring-error/40 focus:border-error"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-light-border dark:border-dark-border rounded-button text-text-primary dark:text-text-dark-primary hover:bg-light-soft dark:hover:bg-dark-soft transition-colors"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleDelete}
                disabled={confirmText !== 'DELETE' || deleting}
                className="flex-1 px-4 py-2 bg-error text-white rounded-button hover:bg-error/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {deleting ? t('settings.deleteAccount.deleting') : t('settings.deleteAccount.confirm')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main Settings component
export default function Settings() {
  const { t } = useTranslation();
  const { user, authFetch } = useAuth();
  const [saving, setSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const avatarInputRef = useRef(null);

  // Profile state
  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    avatar: user?.avatar_url || '',
  });

  // Handle avatar file selection
  const handleAvatarChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert(t('settings.profile.invalidImageType'));
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert(t('settings.profile.imageTooLarge'));
      return;
    }

    setUploadingAvatar(true);
    try {
      // Create a preview immediately
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfile({ ...profile, avatar: e.target.result });
      };
      reader.readAsDataURL(file);

      // Upload to server
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await authFetch('/settings/avatar', {
        method: 'POST',
        headers: {}, // Let browser set content-type for FormData
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setProfile({ ...profile, avatar: data.avatarUrl });
      } else {
        throw new Error('Upload failed');
      }
    } catch (err) {
      console.error('Avatar upload error:', err);
      // Keep the preview even if upload fails (for demo purposes)
    } finally {
      setUploadingAvatar(false);
    }
  };

  // API Keys state
  const [apiKeys, setApiKeys] = useState([]);
  const [newKeyName, setNewKeyName] = useState('');
  const [creatingKey, setCreatingKey] = useState(false);

  // Data retention state
  const [retention, setRetention] = useState({
    keepRuns: 30,
    keepReports: 90,
    autoDelete: false,
  });

  // Notification state
  const [notifications, setNotifications] = useState({
    emailRunComplete: true,
    emailWeeklySummary: false,
    emailProductUpdates: true,
    browserNotifications: false,
  });

  // Fetch settings on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        // Fetch API keys
        const keysResponse = await authFetch('/settings/api-keys');
        if (keysResponse.ok) {
          const data = await keysResponse.json();
          setApiKeys(data.keys || []);
        }

        // Fetch preferences
        const prefsResponse = await authFetch('/settings/preferences');
        if (prefsResponse.ok) {
          const data = await prefsResponse.json();
          if (data.retention) setRetention(data.retention);
          if (data.notifications) setNotifications(data.notifications);
        }
      } catch (err) {
        console.error('Failed to fetch settings:', err);
      }
    };

    // Use masked placeholders for demo data.
    setApiKeys([
      { id: '1', name: 'Production API', key: 'demo_live_************************', createdAt: '2024-11-15' },
      { id: '2', name: 'Development', key: 'demo_test_************************', createdAt: '2024-12-01' },
    ]);
  }, [authFetch]);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await authFetch('/settings/profile', {
        method: 'PUT',
        body: JSON.stringify(profile),
      });
    } catch (err) {
      console.error('Failed to save profile:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleCreateApiKey = async () => {
    if (!newKeyName.trim()) return;
    setCreatingKey(true);
    try {
      const response = await authFetch('/settings/api-keys', {
        method: 'POST',
        body: JSON.stringify({ name: newKeyName }),
      });
      if (response.ok) {
        const data = await response.json();
        setApiKeys([...apiKeys, data.key]);
        setNewKeyName('');
      }
    } catch (err) {
      console.error('Failed to create API key:', err);
    } finally {
      setCreatingKey(false);
    }
  };

  const handleRevokeApiKey = async (keyId) => {
    try {
      await authFetch(`/settings/api-keys/${keyId}`, { method: 'DELETE' });
      setApiKeys(apiKeys.filter((k) => k.id !== keyId));
    } catch (err) {
      console.error('Failed to revoke API key:', err);
    }
  };

  const handleSaveRetention = async () => {
    setSaving(true);
    try {
      await authFetch('/settings/preferences', {
        method: 'PUT',
        body: JSON.stringify({ retention }),
      });
    } catch (err) {
      console.error('Failed to save retention settings:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    setSaving(true);
    try {
      await authFetch('/settings/preferences', {
        method: 'PUT',
        body: JSON.stringify({ notifications }),
      });
    } catch (err) {
      console.error('Failed to save notification settings:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await authFetch('/settings/account', { method: 'DELETE' });
      // Redirect to login or home page
      window.location.href = '/';
    } catch (err) {
      console.error('Failed to delete account:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-ion/10 flex items-center justify-center text-ion">
            <SettingsIcon />
          </div>
          <h1 className="text-2xl font-bold text-text-primary dark:text-text-dark-primary">
            {t('settings.title')}
          </h1>
        </div>
        <p className="text-text-secondary dark:text-text-dark-secondary ml-13">
          {t('settings.subtitle')}
        </p>
      </div>

      {/* Profile Section */}
      <SettingsSection
        icon={<UserIcon />}
        title={t('settings.profile.title')}
        description={t('settings.profile.description')}
      >
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-ion/20 flex items-center justify-center text-ion text-3xl font-bold overflow-hidden ring-4 ring-light-border dark:ring-dark-border">
                {profile.avatar ? (
                  <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  profile.name?.charAt(0)?.toUpperCase() || 'U'
                )}
              </div>
              {uploadingAvatar && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                  <svg className="w-6 h-6 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                </div>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
              <button
                onClick={() => avatarInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="px-4 py-2 border border-light-border dark:border-dark-border rounded-button text-text-primary dark:text-text-dark-primary hover:bg-light-soft dark:hover:bg-dark-soft transition-colors disabled:opacity-50"
              >
                {uploadingAvatar ? t('common.loading') : t('settings.profile.changeAvatar')}
              </button>
              <p className="text-xs text-text-secondary dark:text-text-dark-secondary">
                {t('settings.profile.avatarHint')}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary dark:text-text-dark-primary mb-2">
                {t('settings.profile.name')}
              </label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full px-4 py-2 border border-light-border dark:border-dark-border rounded-button bg-light-surface dark:bg-dark-surface text-text-primary dark:text-text-dark-primary focus:outline-none focus:ring-2 focus:ring-ion/40 focus:border-ion"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary dark:text-text-dark-primary mb-2">
                {t('settings.profile.email')}
              </label>
              <input
                type="email"
                value={profile.email}
                disabled
                className="w-full px-4 py-2 border border-light-border dark:border-dark-border rounded-button bg-light-soft dark:bg-dark-soft text-text-secondary dark:text-text-dark-secondary cursor-not-allowed"
              />
              <p className="text-xs text-text-secondary dark:text-text-dark-secondary mt-1">
                {t('settings.profile.emailNote')}
              </p>
            </div>
          </div>
          <div className="flex justify-end">
            <button
              onClick={handleSaveProfile}
              disabled={saving}
              className="px-6 py-2 bg-slate text-white font-medium rounded-button shadow-button hover:bg-slate-hover disabled:opacity-50 transition-colors"
            >
              {saving ? t('common.saving') : t('common.save')}
            </button>
          </div>
        </div>
      </SettingsSection>

      {/* BYOK LLM API Keys Section */}
      <BYOKSettings />

      {/* SKatalyst API Keys Section */}
      <SettingsSection
        icon={<KeyIcon />}
        title={t('settings.apiKeys.title')}
        description={t('settings.apiKeys.description')}
      >
        <div className="space-y-4">
          {apiKeys.length > 0 ? (
            <div className="space-y-3">
              {apiKeys.map((key) => (
                <ApiKeyRow key={key.id} apiKey={key} onRevoke={handleRevokeApiKey} t={t} />
              ))}
            </div>
          ) : (
            <p className="text-text-secondary dark:text-text-dark-secondary text-sm">
              {t('settings.apiKeys.noKeys')}
            </p>
          )}
          <div className="flex gap-3 pt-4 border-t border-light-border dark:border-dark-border">
            <input
              type="text"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              placeholder={t('settings.apiKeys.namePlaceholder')}
              className="flex-1 px-4 py-2 border border-light-border dark:border-dark-border rounded-button bg-light-surface dark:bg-dark-surface text-text-primary dark:text-text-dark-primary focus:outline-none focus:ring-2 focus:ring-ion/40 focus:border-ion"
            />
            <button
              onClick={handleCreateApiKey}
              disabled={!newKeyName.trim() || creatingKey}
              className="flex items-center gap-2 px-4 py-2 bg-ion text-white font-medium rounded-button hover:bg-ion/90 disabled:opacity-50 transition-colors"
            >
              <PlusIcon />
              {creatingKey ? t('common.creating') : t('settings.apiKeys.create')}
            </button>
          </div>
          <p className="text-xs text-text-secondary dark:text-text-dark-secondary">
            {t('settings.apiKeys.warning')}
          </p>
        </div>
      </SettingsSection>

      {/* Data Retention Section */}
      <SettingsSection
        icon={<DatabaseIcon />}
        title={t('settings.retention.title')}
        description={t('settings.retention.description')}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary dark:text-text-dark-primary mb-2">
                {t('settings.retention.keepRuns')}
              </label>
              <select
                value={retention.keepRuns}
                onChange={(e) => setRetention({ ...retention, keepRuns: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-light-border dark:border-dark-border rounded-button bg-light-surface dark:bg-dark-surface text-text-primary dark:text-text-dark-primary focus:outline-none focus:ring-2 focus:ring-ion/40 focus:border-ion"
              >
                <option value={7}>{t('settings.retention.days', { count: 7 })}</option>
                <option value={30}>{t('settings.retention.days', { count: 30 })}</option>
                <option value={90}>{t('settings.retention.days', { count: 90 })}</option>
                <option value={365}>{t('settings.retention.days', { count: 365 })}</option>
                <option value={-1}>{t('settings.retention.forever')}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary dark:text-text-dark-primary mb-2">
                {t('settings.retention.keepReports')}
              </label>
              <select
                value={retention.keepReports}
                onChange={(e) => setRetention({ ...retention, keepReports: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-light-border dark:border-dark-border rounded-button bg-light-surface dark:bg-dark-surface text-text-primary dark:text-text-dark-primary focus:outline-none focus:ring-2 focus:ring-ion/40 focus:border-ion"
              >
                <option value={30}>{t('settings.retention.days', { count: 30 })}</option>
                <option value={90}>{t('settings.retention.days', { count: 90 })}</option>
                <option value={180}>{t('settings.retention.days', { count: 180 })}</option>
                <option value={365}>{t('settings.retention.days', { count: 365 })}</option>
                <option value={-1}>{t('settings.retention.forever')}</option>
              </select>
            </div>
          </div>
          <Toggle
            enabled={retention.autoDelete}
            onChange={(val) => setRetention({ ...retention, autoDelete: val })}
            label={t('settings.retention.autoDelete')}
          />
          <div className="flex justify-end">
            <button
              onClick={handleSaveRetention}
              disabled={saving}
              className="px-6 py-2 bg-slate text-white font-medium rounded-button shadow-button hover:bg-slate-hover disabled:opacity-50 transition-colors"
            >
              {saving ? t('common.saving') : t('common.save')}
            </button>
          </div>
        </div>
      </SettingsSection>

      {/* Notifications Section */}
      <SettingsSection
        icon={<BellIcon />}
        title={t('settings.notifications.title')}
        description={t('settings.notifications.description')}
      >
        <div className="space-y-4">
          <div className="space-y-3">
            <Toggle
              enabled={notifications.emailRunComplete}
              onChange={(val) => setNotifications({ ...notifications, emailRunComplete: val })}
              label={t('settings.notifications.runComplete')}
            />
            <Toggle
              enabled={notifications.emailWeeklySummary}
              onChange={(val) => setNotifications({ ...notifications, emailWeeklySummary: val })}
              label={t('settings.notifications.weeklySummary')}
            />
            <Toggle
              enabled={notifications.emailProductUpdates}
              onChange={(val) => setNotifications({ ...notifications, emailProductUpdates: val })}
              label={t('settings.notifications.productUpdates')}
            />
            <Toggle
              enabled={notifications.browserNotifications}
              onChange={(val) => setNotifications({ ...notifications, browserNotifications: val })}
              label={t('settings.notifications.browser')}
            />
          </div>
          <div className="flex justify-end">
            <button
              onClick={handleSaveNotifications}
              disabled={saving}
              className="px-6 py-2 bg-slate text-white font-medium rounded-button shadow-button hover:bg-slate-hover disabled:opacity-50 transition-colors"
            >
              {saving ? t('common.saving') : t('common.save')}
            </button>
          </div>
        </div>
      </SettingsSection>

      {/* Danger Zone */}
      <div className="bg-light-surface dark:bg-dark-surface rounded-xl border border-error/30 overflow-hidden">
        <div className="px-6 py-4 border-b border-error/30 bg-error-bg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-error/20 flex items-center justify-center text-error">
              <TrashIcon />
            </div>
            <div>
              <h3 className="font-semibold text-error">{t('settings.dangerZone.title')}</h3>
              <p className="text-sm text-error/80">{t('settings.dangerZone.description')}</p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-text-primary dark:text-text-dark-primary">
                {t('settings.deleteAccount.title')}
              </p>
              <p className="text-sm text-text-secondary dark:text-text-dark-secondary">
                {t('settings.deleteAccount.description')}
              </p>
            </div>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-4 py-2 bg-error text-white font-medium rounded-button hover:bg-error/90 transition-colors"
            >
              {t('settings.deleteAccount.button')}
            </button>
          </div>
        </div>
      </div>

      {/* Delete confirmation modal */}
      <DeleteAccountModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteAccount}
        t={t}
      />
    </div>
  );
}
