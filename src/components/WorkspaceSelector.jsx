import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';

// Icons
const ChevronDownIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

const BuildingIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);

const UserIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const SettingsIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const PlusIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

// Workspace item in dropdown
function WorkspaceItem({ workspace, isActive, onSelect, userAvatar, userName }) {
  const isPersonal = workspace.type === 'personal';

  return (
    <button
      onClick={() => onSelect(workspace)}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
        isActive
          ? 'bg-ion/10 text-ion'
          : 'text-text-primary hover:bg-light-soft dark:hover:bg-dark-soft'
      }`}
    >
      {isPersonal && userAvatar ? (
        <img
          src={userAvatar}
          alt={userName || 'User'}
          className="w-8 h-8 rounded-lg object-cover"
        />
      ) : (
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
          isPersonal
            ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
            : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
        }`}>
          {isPersonal ? <UserIcon /> : <BuildingIcon />}
        </div>
      )}
      <div className="flex-1 text-left">
        <p className="text-sm font-medium truncate">{workspace.name}</p>
        <p className="text-xs text-text-secondary dark:text-text-dark-secondary capitalize">
          {workspace.type}
        </p>
      </div>
      {isActive && (
        <div className="text-ion">
          <CheckIcon />
        </div>
      )}
    </button>
  );
}

export default function WorkspaceSelector({ collapsed = false }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Current workspace from user context
  const currentWorkspace = {
    id: user?.tenant_id,
    name: user?.tenant_name || 'My Workspace',
    type: user?.tenant_type || 'personal',
    slug: user?.tenant_slug
  };

  // For now, user only has one workspace (future: support multiple)
  const workspaces = [currentWorkspace];

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (workspace) => {
    // For now, just close dropdown (future: switch workspace)
    setIsOpen(false);
  };

  const isPersonal = currentWorkspace.type === 'personal';
  const userAvatar = user?.picture || user?.avatar_url;

  if (collapsed) {
    return (
      <div className="px-2">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden ${
            isPersonal && !userAvatar
              ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
              : !isPersonal
              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
              : ''
          }`}
          title={currentWorkspace.name}
        >
          {isPersonal && userAvatar ? (
            <img src={userAvatar} alt={user?.name || 'User'} className="w-10 h-10 object-cover" />
          ) : isPersonal ? (
            <UserIcon />
          ) : (
            <BuildingIcon />
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-light-soft dark:hover:bg-dark-soft transition-colors"
      >
        {isPersonal && userAvatar ? (
          <img
            src={userAvatar}
            alt={user?.name || 'User'}
            className="w-10 h-10 rounded-lg object-cover"
          />
        ) : (
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            isPersonal
              ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
              : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
          }`}>
            {isPersonal ? <UserIcon /> : <BuildingIcon />}
          </div>
        )}
        <div className="flex-1 text-left min-w-0">
          <p className="text-sm font-medium text-text-primary dark:text-text-dark-primary truncate">
            {currentWorkspace.name}
          </p>
          <p className="text-xs text-text-secondary dark:text-text-dark-secondary capitalize">
            {currentWorkspace.type} workspace
          </p>
        </div>
        <div className={`text-text-secondary transition-transform ${isOpen ? 'rotate-180' : ''}`}>
          <ChevronDownIcon />
        </div>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute left-0 right-0 mt-2 bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-xl shadow-lg py-2 z-50">
          {/* Workspaces list */}
          <div className="px-2 space-y-1">
            {workspaces.map((workspace) => (
              <WorkspaceItem
                key={workspace.id}
                workspace={workspace}
                isActive={workspace.id === currentWorkspace.id}
                onSelect={handleSelect}
                userAvatar={userAvatar}
                userName={user?.name}
              />
            ))}
          </div>

          {/* Divider */}
          <div className="my-2 border-t border-light-border dark:border-dark-border" />

          {/* Actions */}
          <div className="px-2 space-y-1">
            <Link
              to="/app/workspace/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-text-secondary dark:text-text-dark-secondary hover:text-text-primary dark:hover:text-text-dark-primary hover:bg-light-soft dark:hover:bg-dark-soft rounded-lg transition-colors"
            >
              <SettingsIcon />
              {t('workspace.settings')}
            </Link>
            <button
              disabled
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-text-secondary dark:text-text-dark-secondary opacity-50 cursor-not-allowed rounded-lg"
            >
              <PlusIcon />
              {t('workspace.createNew')}
              <span className="ml-auto text-xs bg-light-soft dark:bg-dark-soft px-1.5 py-0.5 rounded">
                {t('common.soon')}
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
