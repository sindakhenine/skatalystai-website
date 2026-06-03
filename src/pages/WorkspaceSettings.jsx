import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';

// Icons
const BuildingIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);

const UserIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const UsersIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const TrashIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

// Section card component
function SettingsSection({ title, description, children }) {
  return (
    <div className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-2xl p-6">
      <h2 className="text-lg font-semibold text-text-primary dark:text-text-dark-primary mb-1">
        {title}
      </h2>
      {description && (
        <p className="text-sm text-text-secondary dark:text-text-dark-secondary mb-6">
          {description}
        </p>
      )}
      {children}
    </div>
  );
}

// Team member row
function TeamMemberRow({ member, isOwner, onRemove }) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-4 py-3 border-b border-light-border dark:border-dark-border last:border-0">
      <div className="w-10 h-10 rounded-full bg-light-soft dark:bg-dark-soft flex items-center justify-center">
        {member.avatar_url ? (
          <img src={member.avatar_url} alt={member.name} className="w-10 h-10 rounded-full" />
        ) : (
          <span className="text-sm font-medium text-text-secondary">
            {member.name?.charAt(0) || member.email?.charAt(0) || '?'}
          </span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text-primary dark:text-text-dark-primary truncate">
          {member.name || member.email}
        </p>
        <p className="text-xs text-text-secondary dark:text-text-dark-secondary truncate">
          {member.email}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <span className={`text-xs px-2 py-1 rounded-full capitalize ${
          member.role === 'owner'
            ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
            : member.role === 'admin'
            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
            : 'bg-light-soft dark:bg-dark-soft text-text-secondary'
        }`}>
          {member.role}
        </span>
        {!isOwner && member.role !== 'owner' && (
          <button
            onClick={() => onRemove(member)}
            className="p-1 text-text-secondary hover:text-error transition-colors"
            title={t('workspace.removeMember')}
          >
            <TrashIcon />
          </button>
        )}
      </div>
    </div>
  );
}

export default function WorkspaceSettings() {
  const { t } = useTranslation();
  const { user, authFetch } = useAuth();
  const [workspaceName, setWorkspaceName] = useState(user?.tenant_name || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);

  const isPersonal = user?.tenant_type === 'personal';
  const isOwner = user?.role === 'owner';

  // Mock team members for now (future: fetch from API)
  const [members] = useState([
    {
      id: user?.id,
      name: user?.name,
      email: user?.email,
      avatar_url: user?.avatar_url,
      role: 'owner'
    }
  ]);

  const handleSave = async () => {
    if (!workspaceName.trim()) return;

    setSaving(true);
    setSaved(false);

    try {
      await authFetch('/tenants/current', {
        method: 'PATCH',
        body: JSON.stringify({ name: workspaceName })
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Save error:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setInviting(true);
    try {
      await authFetch('/tenants/current/invite', {
        method: 'POST',
        body: JSON.stringify({ email: inviteEmail })
      });
      setInviteEmail('');
    } catch (err) {
      console.error('Invite error:', err);
    } finally {
      setInviting(false);
    }
  };

  const handleRemoveMember = async (member) => {
    if (!window.confirm(t('workspace.confirmRemove', { name: member.name || member.email }))) {
      return;
    }
    // Future: implement member removal
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-text-primary dark:text-text-dark-primary">
          {t('workspace.settingsTitle')}
        </h1>
        <p className="text-text-secondary dark:text-text-dark-secondary mt-1">
          {t('workspace.settingsSubtitle')}
        </p>
      </div>

      <div className="space-y-6">
        {/* Workspace Info */}
        <SettingsSection
          title={t('workspace.generalInfo')}
          description={t('workspace.generalInfoDesc')}
        >
          <div className="flex items-start gap-6">
            {/* Workspace icon */}
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
              isPersonal
                ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
            }`}>
              {isPersonal ? <UserIcon /> : <BuildingIcon />}
            </div>

            {/* Name field */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-text-primary dark:text-text-dark-primary mb-2">
                {t('workspace.name')}
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  className="flex-1 px-4 py-2 border border-light-border dark:border-dark-border rounded-button bg-light-surface dark:bg-dark-surface text-text-primary dark:text-text-dark-primary focus:outline-none focus:ring-2 focus:ring-ion/40 focus:border-ion transition-colors"
                />
                <button
                  onClick={handleSave}
                  disabled={saving || !workspaceName.trim()}
                  className={`px-4 py-2 rounded-button font-medium transition-colors flex items-center gap-2 ${
                    saved
                      ? 'bg-success text-white'
                      : 'bg-slate text-white hover:bg-slate-hover shadow-button'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {saved ? (
                    <>
                      <CheckIcon />
                      {t('common.saved')}
                    </>
                  ) : saving ? (
                    t('common.saving')
                  ) : (
                    t('common.save')
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Workspace type badge */}
          <div className="mt-6 flex items-center gap-2">
            <span className="text-sm text-text-secondary dark:text-text-dark-secondary">
              {t('workspace.type')}:
            </span>
            <span className={`text-sm px-2 py-1 rounded-full capitalize ${
              isPersonal
                ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
            }`}>
              {user?.tenant_type || 'personal'}
            </span>
          </div>
        </SettingsSection>

        {/* Team Members (only for company workspaces) */}
        {!isPersonal && (
          <SettingsSection
            title={t('workspace.teamMembers')}
            description={t('workspace.teamMembersDesc')}
          >
            {/* Members list */}
            <div className="mb-6">
              {members.map((member) => (
                <TeamMemberRow
                  key={member.id}
                  member={member}
                  isOwner={isOwner}
                  onRemove={handleRemoveMember}
                />
              ))}
            </div>

            {/* Invite form */}
            {isOwner && (
              <form onSubmit={handleInvite} className="flex gap-3">
                <div className="flex-1">
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder={t('workspace.invitePlaceholder')}
                    className="w-full px-4 py-2 border border-light-border dark:border-dark-border rounded-button bg-light-surface dark:bg-dark-surface text-text-primary dark:text-text-dark-primary focus:outline-none focus:ring-2 focus:ring-ion/40 focus:border-ion transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  disabled={inviting || !inviteEmail.trim()}
                  className="px-4 py-2 bg-ion text-white rounded-button font-medium hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <UsersIcon />
                  {inviting ? t('workspace.inviting') : t('workspace.invite')}
                </button>
              </form>
            )}
          </SettingsSection>
        )}

        {/* Danger Zone */}
        <SettingsSection
          title={t('workspace.dangerZone')}
          description={t('workspace.dangerZoneDesc')}
        >
          <div className="flex items-center justify-between p-4 bg-error-bg border border-error/20 rounded-xl">
            <div>
              <p className="text-sm font-medium text-error">
                {t('workspace.deleteWorkspace')}
              </p>
              <p className="text-xs text-error/80 mt-1">
                {t('workspace.deleteWorkspaceDesc')}
              </p>
            </div>
            <button
              disabled
              className="px-4 py-2 bg-error/10 text-error border border-error/20 rounded-button font-medium opacity-50 cursor-not-allowed"
            >
              {t('common.delete')}
            </button>
          </div>
        </SettingsSection>
      </div>
    </div>
  );
}
