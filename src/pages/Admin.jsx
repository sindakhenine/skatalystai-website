/**
 * Platform Admin Page (V2.2 Admin & Ops)
 *
 * Super admin dashboard for platform-wide data and controlled operations.
 * Requires SUPER_ADMIN role - regular users see access denied.
 *
 * Features (V2.1 - READ):
 * - View all tenants across platform
 * - View all users across platform
 * - View all agents across platform
 * - View platform-wide audit log
 * - System health status
 *
 * Features (V2.2 - WRITE):
 * - Agent: Revoke, Reactivate, Update excluded patterns
 * - User: Disable, Enable, Force logout
 * - Safety: Kill switch toggle, Read-only mode toggle
 *
 * Security:
 * - Requires is_super_admin flag on user
 * - All access is logged
 * - Every write requires confirmation modal with reason
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';

// Icons
const AdminIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const UsersIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const BuildingIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);

const ServerIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
  </svg>
);

const LogIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
  </svg>
);

const HeartIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);

const RefreshIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

const LockIcon = () => (
  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const XCircleIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const XIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const BanIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
  </svg>
);

const PlayIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const LogoutIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

const SettingsIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const AlertTriangleIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

// Live data badge
function LiveDataBadge() {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
      LIVE DATA
    </span>
  );
}

// Stats card
function StatsCard({ icon, label, value, sublabel }) {
  return (
    <div className="bg-light-surface dark:bg-dark-surface rounded-xl border border-light-border dark:border-dark-border p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-ion/10 flex items-center justify-center text-ion">
          {icon}
        </div>
        <span className="text-sm text-text-secondary dark:text-text-dark-secondary">{label}</span>
      </div>
      <p className="text-2xl font-bold text-text-primary dark:text-text-dark-primary">{value}</p>
      {sublabel && (
        <p className="text-xs text-text-secondary dark:text-text-dark-secondary mt-1">{sublabel}</p>
      )}
    </div>
  );
}

// Confirmation modal for V2.2 write operations
function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  confirmStyle = 'danger', // 'danger' | 'warning' | 'primary'
  requiresReason = true,
  loading = false
}) {
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (!isOpen) setReason('');
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (requiresReason && !reason.trim()) return;
    onConfirm(reason.trim());
  };

  const buttonStyles = {
    danger: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
    warning: 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500',
    primary: 'bg-ion hover:bg-ion/90 focus:ring-ion'
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={onClose} />

        {/* Modal */}
        <div className="relative bg-light-surface dark:bg-dark-surface rounded-xl shadow-xl max-w-md w-full p-6 border border-light-border dark:border-dark-border">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-text-secondary dark:text-text-dark-secondary hover:text-text-primary dark:hover:text-text-dark-primary"
          >
            <XIcon />
          </button>

          {/* Icon */}
          <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-4 ${
            confirmStyle === 'danger' ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' :
            confirmStyle === 'warning' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' :
            'bg-ion/10 text-ion'
          }`}>
            <AlertTriangleIcon />
          </div>

          {/* Title */}
          <h3 className="text-lg font-semibold text-center text-text-primary dark:text-text-dark-primary mb-2">
            {title}
          </h3>

          {/* Message */}
          <p className="text-sm text-center text-text-secondary dark:text-text-dark-secondary mb-4">
            {message}
          </p>

          {/* Reason input */}
          {requiresReason && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-text-primary dark:text-text-dark-primary mb-1">
                Reason (required)
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Enter a reason for this action..."
                className="w-full px-3 py-2 text-sm border border-light-border dark:border-dark-border rounded-lg bg-light-bg dark:bg-dark-bg text-text-primary dark:text-text-dark-primary placeholder-text-secondary dark:placeholder-text-dark-secondary focus:outline-none focus:ring-2 focus:ring-ion"
                rows={3}
              />
              <p className="text-xs text-text-secondary dark:text-text-dark-secondary mt-1">
                This action will be logged to the audit trail.
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 text-sm font-medium text-text-primary dark:text-text-dark-primary bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading || (requiresReason && !reason.trim())}
              className={`flex-1 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-2 ${buttonStyles[confirmStyle]}`}
            >
              {loading ? 'Processing...' : confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Access denied component
function AccessDenied() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 mx-auto rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400 mb-6">
          <LockIcon />
        </div>
        <h2 className="text-xl font-semibold text-text-primary dark:text-text-dark-primary mb-2">
          Access Denied
        </h2>
        <p className="text-text-secondary dark:text-text-dark-secondary mb-4">
          Platform Admin access requires Super Admin privileges. This page is restricted to platform operators only.
        </p>
        <p className="text-xs text-text-secondary dark:text-text-dark-secondary">
          If you believe you should have access, contact your platform administrator.
        </p>
      </div>
    </div>
  );
}

// Main Admin page
export default function Admin() {
  const { t } = useTranslation();
  const { user, authFetch } = useAuth();

  // Access state
  const [isSuperAdmin, setIsSuperAdmin] = useState(null); // null = checking, false = denied, true = granted
  const [checkingAccess, setCheckingAccess] = useState(true);

  // Data state
  const [activeTab, setActiveTab] = useState('overview');
  const [tenants, setTenants] = useState([]);
  const [users, setUsers] = useState([]);
  const [agents, setAgents] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [systemHealth, setSystemHealth] = useState(null);
  const [platformSettings, setPlatformSettings] = useState({});
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Modal state for V2.2 write operations
  const [modal, setModal] = useState({
    isOpen: false,
    type: null, // 'revokeAgent' | 'reactivateAgent' | 'disableUser' | 'enableUser' | 'forceLogout' | 'killSwitch' | 'readOnlyMode'
    target: null, // The entity being acted upon
    title: '',
    message: '',
    confirmLabel: '',
    confirmStyle: 'danger'
  });

  // Pagination
  const [tenantsPage, setTenantsPage] = useState(1);
  const [usersPage, setUsersPage] = useState(1);
  const [agentsPage, setAgentsPage] = useState(1);
  const [tenantsPagination, setTenantsPagination] = useState(null);
  const [usersPagination, setUsersPagination] = useState(null);
  const [agentsPagination, setAgentsPagination] = useState(null);

  // Check super admin access
  useEffect(() => {
    const checkAccess = async () => {
      try {
        const res = await authFetch('/admin/check');
        if (res.ok) {
          const data = await res.json();
          setIsSuperAdmin(data.isSuperAdmin === true);
        } else {
          setIsSuperAdmin(false);
        }
      } catch (err) {
        console.error('Access check failed:', err);
        setIsSuperAdmin(false);
      } finally {
        setCheckingAccess(false);
      }
    };

    checkAccess();
  }, [authFetch]);

  // Fetch tenants
  const fetchTenants = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const res = await authFetch(`/admin/tenants?page=${page}&limit=20`);
      if (res.ok) {
        const data = await res.json();
        setTenants(data.tenants || []);
        setTenantsPagination(data.pagination);
      }
    } catch (err) {
      setError('Failed to fetch tenants');
    } finally {
      setLoading(false);
    }
  }, [authFetch]);

  // Fetch users
  const fetchUsers = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const res = await authFetch(`/admin/users?page=${page}&limit=20`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
        setUsersPagination(data.pagination);
      }
    } catch (err) {
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, [authFetch]);

  // Fetch agents
  const fetchAgents = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const res = await authFetch(`/admin/agents?page=${page}&limit=20`);
      if (res.ok) {
        const data = await res.json();
        setAgents(data.agents || []);
        setAgentsPagination(data.pagination);
      }
    } catch (err) {
      setError('Failed to fetch agents');
    } finally {
      setLoading(false);
    }
  }, [authFetch]);

  // Fetch audit logs
  const fetchAuditLogs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await authFetch('/admin/audit?limit=50');
      if (res.ok) {
        const data = await res.json();
        setAuditLogs(data.logs || []);
      }
    } catch (err) {
      setError('Failed to fetch audit logs');
    } finally {
      setLoading(false);
    }
  }, [authFetch]);

  // Fetch system health
  const fetchSystemHealth = useCallback(async () => {
    try {
      const res = await authFetch('/admin/system/health');
      if (res.ok) {
        const data = await res.json();
        setSystemHealth(data);
      }
    } catch (err) {
      console.error('Failed to fetch system health:', err);
    }
  }, [authFetch]);

  // Fetch platform settings (V2.2)
  const fetchPlatformSettings = useCallback(async () => {
    try {
      const res = await authFetch('/admin/settings');
      if (res.ok) {
        const data = await res.json();
        setPlatformSettings(data.settings || {});
      }
    } catch (err) {
      console.error('Failed to fetch platform settings:', err);
    }
  }, [authFetch]);

  // V2.2 Action Handlers

  // Open confirmation modal
  const openModal = (type, target, options) => {
    setModal({
      isOpen: true,
      type,
      target,
      ...options
    });
  };

  // Close modal
  const closeModal = () => {
    setModal(prev => ({ ...prev, isOpen: false }));
  };

  // Show success/error message
  const showMessage = (message, isError = false) => {
    if (isError) {
      setError(message);
      setTimeout(() => setError(null), 5000);
    } else {
      setSuccessMessage(message);
      setTimeout(() => setSuccessMessage(null), 5000);
    }
  };

  // Handle modal confirmation
  const handleModalConfirm = async (reason) => {
    setActionLoading(true);
    try {
      let endpoint, method, body;

      switch (modal.type) {
        case 'revokeAgent':
          endpoint = `/admin/agents/${modal.target.id}/revoke`;
          method = 'POST';
          body = { reason };
          break;
        case 'reactivateAgent':
          endpoint = `/admin/agents/${modal.target.id}/reactivate`;
          method = 'POST';
          body = { reason };
          break;
        case 'disableUser':
          endpoint = `/admin/users/${modal.target.id}/disable`;
          method = 'POST';
          body = { reason };
          break;
        case 'enableUser':
          endpoint = `/admin/users/${modal.target.id}/enable`;
          method = 'POST';
          body = { reason };
          break;
        case 'forceLogout':
          endpoint = `/admin/users/${modal.target.id}/force-logout`;
          method = 'POST';
          body = { reason };
          break;
        case 'killSwitch':
          endpoint = '/admin/kill-switch';
          method = 'POST';
          body = { enabled: modal.target.enable, reason };
          break;
        case 'readOnlyMode':
          endpoint = '/admin/read-only-mode';
          method = 'POST';
          body = { enabled: modal.target.enable, reason };
          break;
        default:
          throw new Error('Unknown action type');
      }

      const res = await authFetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await res.json();

      if (res.ok) {
        showMessage(data.message || 'Action completed successfully');
        // Refresh relevant data
        if (['revokeAgent', 'reactivateAgent'].includes(modal.type)) {
          fetchAgents(agentsPage);
        } else if (['disableUser', 'enableUser', 'forceLogout'].includes(modal.type)) {
          fetchUsers(usersPage);
        } else if (['killSwitch', 'readOnlyMode'].includes(modal.type)) {
          fetchPlatformSettings();
        }
        closeModal();
      } else {
        showMessage(data.message || 'Action failed', true);
      }
    } catch (err) {
      showMessage('Failed to perform action: ' + err.message, true);
    } finally {
      setActionLoading(false);
    }
  };

  // Agent actions
  const handleRevokeAgent = (agent) => {
    openModal('revokeAgent', agent, {
      title: 'Revoke Agent',
      message: `Are you sure you want to revoke agent "${agent.name}"? This will immediately disconnect the agent and prevent it from operating.`,
      confirmLabel: 'Revoke Agent',
      confirmStyle: 'danger'
    });
  };

  const handleReactivateAgent = (agent) => {
    openModal('reactivateAgent', agent, {
      title: 'Reactivate Agent',
      message: `Are you sure you want to reactivate agent "${agent.name}"? This will allow the agent to resume operations.`,
      confirmLabel: 'Reactivate',
      confirmStyle: 'primary'
    });
  };

  // User actions
  const handleDisableUser = (targetUser) => {
    openModal('disableUser', targetUser, {
      title: 'Disable User',
      message: `Are you sure you want to disable user "${targetUser.email}"? They will be unable to log in until re-enabled.`,
      confirmLabel: 'Disable User',
      confirmStyle: 'danger'
    });
  };

  const handleEnableUser = (targetUser) => {
    openModal('enableUser', targetUser, {
      title: 'Enable User',
      message: `Are you sure you want to re-enable user "${targetUser.email}"? They will be able to log in again.`,
      confirmLabel: 'Enable User',
      confirmStyle: 'primary'
    });
  };

  const handleForceLogout = (targetUser) => {
    openModal('forceLogout', targetUser, {
      title: 'Force Logout',
      message: `Are you sure you want to force logout user "${targetUser.email}"? Their current session will be invalidated.`,
      confirmLabel: 'Force Logout',
      confirmStyle: 'warning'
    });
  };

  // Safety controls
  const handleToggleKillSwitch = (enable) => {
    openModal('killSwitch', { enable }, {
      title: enable ? 'Enable Kill Switch' : 'Disable Kill Switch',
      message: enable
        ? 'WARNING: Enabling the kill switch will immediately block ALL agent operations platform-wide. This is an emergency measure.'
        : 'Are you sure you want to disable the kill switch? Agent operations will resume.',
      confirmLabel: enable ? 'ENABLE KILL SWITCH' : 'Disable Kill Switch',
      confirmStyle: enable ? 'danger' : 'primary'
    });
  };

  const handleToggleReadOnlyMode = (enable) => {
    openModal('readOnlyMode', { enable }, {
      title: enable ? 'Enable Read-Only Mode' : 'Disable Read-Only Mode',
      message: enable
        ? 'Enabling read-only mode will prevent all data modifications platform-wide. Agents can still read data but cannot write.'
        : 'Are you sure you want to disable read-only mode? Data modifications will be allowed again.',
      confirmLabel: enable ? 'Enable Read-Only' : 'Disable Read-Only',
      confirmStyle: enable ? 'warning' : 'primary'
    });
  };

  // Initial data fetch when access granted
  useEffect(() => {
    if (isSuperAdmin) {
      fetchTenants(1);
      fetchUsers(1);
      fetchAgents(1);
      fetchSystemHealth();
      fetchPlatformSettings();
    }
  }, [isSuperAdmin, fetchTenants, fetchUsers, fetchAgents, fetchSystemHealth, fetchPlatformSettings]);

  // Fetch audit logs when tab changes
  useEffect(() => {
    if (isSuperAdmin && activeTab === 'audit') {
      fetchAuditLogs();
    }
  }, [isSuperAdmin, activeTab, fetchAuditLogs]);

  // Format relative time
  const formatRelativeTime = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  // Loading state
  if (checkingAccess) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ion"></div>
      </div>
    );
  }

  // Access denied
  if (!isSuperAdmin) {
    return <AccessDenied />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-ion/10 flex items-center justify-center text-ion">
              <AdminIcon />
            </div>
            <h1 className="text-2xl font-bold text-text-primary dark:text-text-dark-primary">
              Platform Admin
            </h1>
            <LiveDataBadge />
          </div>
          <p className="text-text-secondary dark:text-text-dark-secondary ml-13">
            Platform-wide administration and controlled operations (V2.2 Admin & Ops)
          </p>
        </div>
        <button
          onClick={() => {
            fetchTenants(1);
            fetchUsers(1);
            fetchAgents(1);
            fetchSystemHealth();
            fetchPlatformSettings();
          }}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-text-primary dark:text-text-dark-primary bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          <RefreshIcon className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Error banner */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
          <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
        </div>
      )}

      {/* Success banner */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
          <p className="text-sm text-emerald-800 dark:text-emerald-300">{successMessage}</p>
        </div>
      )}

      {/* System Health Summary */}
      {systemHealth && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatsCard
            icon={<BuildingIcon />}
            label="Total Tenants"
            value={systemHealth.stats?.tenants || 0}
          />
          <StatsCard
            icon={<UsersIcon />}
            label="Total Users"
            value={systemHealth.stats?.users || 0}
          />
          <StatsCard
            icon={<ServerIcon />}
            label="Total Agents"
            value={systemHealth.stats?.agents?.total || 0}
            sublabel={`${systemHealth.stats?.agents?.active || 0} active`}
          />
          <StatsCard
            icon={systemHealth.status === 'healthy' ? <CheckCircleIcon /> : <XCircleIcon />}
            label="System Status"
            value={systemHealth.status === 'healthy' ? 'Healthy' : 'Degraded'}
          />
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-light-soft dark:bg-dark-soft rounded-xl">
        {[
          { id: 'overview', label: 'Overview', icon: <BuildingIcon /> },
          { id: 'users', label: 'Users', icon: <UsersIcon /> },
          { id: 'agents', label: 'Agents', icon: <ServerIcon /> },
          { id: 'settings', label: 'Safety', icon: <SettingsIcon /> },
          { id: 'audit', label: 'Audit Log', icon: <LogIcon /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-light-surface dark:bg-dark-surface text-text-primary dark:text-text-dark-primary shadow-sm'
                : 'text-text-secondary dark:text-text-dark-secondary hover:text-text-primary dark:hover:text-text-dark-primary'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="bg-light-surface dark:bg-dark-surface rounded-xl border border-light-border dark:border-dark-border overflow-hidden">
          <div className="p-4 border-b border-light-border dark:border-dark-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BuildingIcon className="text-ion" />
              <h2 className="font-semibold text-text-primary dark:text-text-dark-primary">
                All Tenants
              </h2>
            </div>
            <span className="text-xs text-text-secondary dark:text-text-dark-secondary">
              {tenantsPagination?.total || 0} total
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-light-border dark:divide-dark-border">
              <thead className="bg-light-bg dark:bg-dark-bg">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary dark:text-text-dark-secondary uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary dark:text-text-dark-secondary uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary dark:text-text-dark-secondary uppercase">Plan</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary dark:text-text-dark-secondary uppercase">Members</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary dark:text-text-dark-secondary uppercase">Storage</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary dark:text-text-dark-secondary uppercase">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-light-border dark:divide-dark-border">
                {tenants.map((tenant) => (
                  <tr key={tenant.id} className="hover:bg-light-bg dark:hover:bg-dark-bg">
                    <td className="px-4 py-3 text-sm font-medium text-text-primary dark:text-text-dark-primary">{tenant.name}</td>
                    <td className="px-4 py-3 text-sm text-text-secondary dark:text-text-dark-secondary">{tenant.type}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                        tenant.plan === 'enterprise' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' :
                        tenant.plan === 'pro' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                      }`}>
                        {tenant.plan || 'free'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-text-secondary dark:text-text-dark-secondary">{tenant.member_count || 0}</td>
                    <td className="px-4 py-3 text-sm text-text-secondary dark:text-text-dark-secondary">
                      {tenant.storage_used_gb ? `${parseFloat(tenant.storage_used_gb).toFixed(2)} GB` : '0 GB'}
                    </td>
                    <td className="px-4 py-3 text-sm text-text-secondary dark:text-text-dark-secondary">
                      {formatRelativeTime(tenant.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {tenants.length === 0 && !loading && (
            <div className="p-8 text-center text-text-secondary dark:text-text-dark-secondary">
              No tenants found
            </div>
          )}
        </div>
      )}

      {activeTab === 'users' && (
        <div className="bg-light-surface dark:bg-dark-surface rounded-xl border border-light-border dark:border-dark-border overflow-hidden">
          <div className="p-4 border-b border-light-border dark:border-dark-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UsersIcon className="text-ion" />
              <h2 className="font-semibold text-text-primary dark:text-text-dark-primary">
                All Users
              </h2>
            </div>
            <span className="text-xs text-text-secondary dark:text-text-dark-secondary">
              {usersPagination?.total || 0} total
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-light-border dark:divide-dark-border">
              <thead className="bg-light-bg dark:bg-dark-bg">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary dark:text-text-dark-secondary uppercase">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary dark:text-text-dark-secondary uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary dark:text-text-dark-secondary uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary dark:text-text-dark-secondary uppercase">Super Admin</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary dark:text-text-dark-secondary uppercase">Created</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-text-secondary dark:text-text-dark-secondary uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-light-border dark:divide-dark-border">
                {users.map((targetUser) => (
                  <tr key={targetUser.id} className="hover:bg-light-bg dark:hover:bg-dark-bg">
                    <td className="px-4 py-3">
                      <div>
                        <div className="text-sm font-medium text-text-primary dark:text-text-dark-primary">{targetUser.email}</div>
                        <div className="text-xs text-text-secondary dark:text-text-dark-secondary">{targetUser.auth_provider}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-text-secondary dark:text-text-dark-secondary">{targetUser.name || '—'}</td>
                    <td className="px-4 py-3">
                      {targetUser.is_disabled ? (
                        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                          Disabled
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {targetUser.is_super_admin ? (
                        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
                          Yes
                        </span>
                      ) : (
                        <span className="text-xs text-text-secondary dark:text-text-dark-secondary">No</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-text-secondary dark:text-text-dark-secondary">
                      {formatRelativeTime(targetUser.created_at)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {!targetUser.is_super_admin && (
                          <>
                            {targetUser.is_disabled ? (
                              <button
                                onClick={() => handleEnableUser(targetUser)}
                                className="p-1.5 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 rounded-lg transition-colors"
                                title="Enable User"
                              >
                                <PlayIcon />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleDisableUser(targetUser)}
                                className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                title="Disable User"
                              >
                                <BanIcon />
                              </button>
                            )}
                            <button
                              onClick={() => handleForceLogout(targetUser)}
                              className="p-1.5 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/30 rounded-lg transition-colors"
                              title="Force Logout"
                            >
                              <LogoutIcon />
                            </button>
                          </>
                        )}
                        {targetUser.is_super_admin && (
                          <span className="text-xs text-text-secondary dark:text-text-dark-secondary italic">Protected</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {users.length === 0 && !loading && (
            <div className="p-8 text-center text-text-secondary dark:text-text-dark-secondary">
              No users found
            </div>
          )}
        </div>
      )}

      {activeTab === 'agents' && (
        <div className="bg-light-surface dark:bg-dark-surface rounded-xl border border-light-border dark:border-dark-border overflow-hidden">
          <div className="p-4 border-b border-light-border dark:border-dark-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ServerIcon className="text-ion" />
              <h2 className="font-semibold text-text-primary dark:text-text-dark-primary">
                All Agents
              </h2>
            </div>
            <span className="text-xs text-text-secondary dark:text-text-dark-secondary">
              {agentsPagination?.total || 0} total
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-light-border dark:divide-dark-border">
              <thead className="bg-light-bg dark:bg-dark-bg">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary dark:text-text-dark-secondary uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary dark:text-text-dark-secondary uppercase">Tenant</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary dark:text-text-dark-secondary uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary dark:text-text-dark-secondary uppercase">Platform</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary dark:text-text-dark-secondary uppercase">Last Seen</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-text-secondary dark:text-text-dark-secondary uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-light-border dark:divide-dark-border">
                {agents.map((agent) => (
                  <tr key={agent.id} className="hover:bg-light-bg dark:hover:bg-dark-bg">
                    <td className="px-4 py-3">
                      <div>
                        <div className="text-sm font-medium text-text-primary dark:text-text-dark-primary">{agent.name}</div>
                        <div className="text-xs text-text-secondary dark:text-text-dark-secondary">{agent.hostname || 'Unknown host'}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-text-secondary dark:text-text-dark-secondary">{agent.tenant_name || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                        agent.status === 'active' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' :
                        agent.status === 'pending' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' :
                        'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {agent.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-text-secondary dark:text-text-dark-secondary">{agent.platform || '—'}</td>
                    <td className="px-4 py-3 text-sm text-text-secondary dark:text-text-dark-secondary">
                      {formatRelativeTime(agent.last_seen_at)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {agent.status === 'revoked' ? (
                          <button
                            onClick={() => handleReactivateAgent(agent)}
                            className="p-1.5 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 rounded-lg transition-colors"
                            title="Reactivate Agent"
                          >
                            <PlayIcon />
                          </button>
                        ) : agent.status === 'active' ? (
                          <button
                            onClick={() => handleRevokeAgent(agent)}
                            className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                            title="Revoke Agent"
                          >
                            <BanIcon />
                          </button>
                        ) : (
                          <span className="text-xs text-text-secondary dark:text-text-dark-secondary italic">Pending</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {agents.length === 0 && !loading && (
            <div className="p-8 text-center text-text-secondary dark:text-text-dark-secondary">
              No agents found
            </div>
          )}
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="space-y-6">
          {/* Kill Switch */}
          <div className="bg-light-surface dark:bg-dark-surface rounded-xl border border-light-border dark:border-dark-border overflow-hidden">
            <div className="p-4 border-b border-light-border dark:border-dark-border">
              <div className="flex items-center gap-2">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  platformSettings.kill_switch?.enabled
                    ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                }`}>
                  <AlertTriangleIcon />
                </div>
                <div>
                  <h2 className="font-semibold text-text-primary dark:text-text-dark-primary">
                    Kill Switch
                  </h2>
                  <p className="text-xs text-text-secondary dark:text-text-dark-secondary">
                    Emergency shutdown of all agent operations
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-primary dark:text-text-dark-primary">
                    Current Status: {' '}
                    <span className={`font-semibold ${
                      platformSettings.kill_switch?.enabled
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-emerald-600 dark:text-emerald-400'
                    }`}>
                      {platformSettings.kill_switch?.enabled ? 'ENABLED' : 'Disabled'}
                    </span>
                  </p>
                  {platformSettings.kill_switch?.reason && (
                    <p className="text-xs text-text-secondary dark:text-text-dark-secondary mt-1">
                      Reason: {platformSettings.kill_switch.reason}
                    </p>
                  )}
                </div>
                {platformSettings.kill_switch?.enabled ? (
                  <button
                    onClick={() => handleToggleKillSwitch(false)}
                    className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
                  >
                    Disable Kill Switch
                  </button>
                ) : (
                  <button
                    onClick={() => handleToggleKillSwitch(true)}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                  >
                    ENABLE KILL SWITCH
                  </button>
                )}
              </div>
              {platformSettings.kill_switch?.enabled && (
                <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                  <p className="text-sm text-red-800 dark:text-red-300">
                    All agent operations are currently blocked platform-wide.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Read-Only Mode */}
          <div className="bg-light-surface dark:bg-dark-surface rounded-xl border border-light-border dark:border-dark-border overflow-hidden">
            <div className="p-4 border-b border-light-border dark:border-dark-border">
              <div className="flex items-center gap-2">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  platformSettings.read_only_mode?.enabled
                    ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                }`}>
                  <LockIcon className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-semibold text-text-primary dark:text-text-dark-primary">
                    Read-Only Mode
                  </h2>
                  <p className="text-xs text-text-secondary dark:text-text-dark-secondary">
                    Prevent all data modifications platform-wide
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-primary dark:text-text-dark-primary">
                    Current Status: {' '}
                    <span className={`font-semibold ${
                      platformSettings.read_only_mode?.enabled
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-emerald-600 dark:text-emerald-400'
                    }`}>
                      {platformSettings.read_only_mode?.enabled ? 'ENABLED' : 'Disabled'}
                    </span>
                  </p>
                  {platformSettings.read_only_mode?.reason && (
                    <p className="text-xs text-text-secondary dark:text-text-dark-secondary mt-1">
                      Reason: {platformSettings.read_only_mode.reason}
                    </p>
                  )}
                </div>
                {platformSettings.read_only_mode?.enabled ? (
                  <button
                    onClick={() => handleToggleReadOnlyMode(false)}
                    className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
                  >
                    Disable Read-Only
                  </button>
                ) : (
                  <button
                    onClick={() => handleToggleReadOnlyMode(true)}
                    className="px-4 py-2 text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors"
                  >
                    Enable Read-Only Mode
                  </button>
                )}
              </div>
              {platformSettings.read_only_mode?.enabled && (
                <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                  <p className="text-sm text-amber-800 dark:text-amber-300">
                    Data modifications are currently blocked. Agents can read but cannot write.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'audit' && (
        <div className="bg-light-surface dark:bg-dark-surface rounded-xl border border-light-border dark:border-dark-border overflow-hidden">
          <div className="p-4 border-b border-light-border dark:border-dark-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <LogIcon className="text-ion" />
              <h2 className="font-semibold text-text-primary dark:text-text-dark-primary">
                Platform Audit Log
              </h2>
            </div>
            <button
              onClick={fetchAuditLogs}
              disabled={loading}
              className="flex items-center gap-1 px-3 py-1 text-xs font-medium text-text-secondary dark:text-text-dark-secondary hover:text-text-primary dark:hover:text-text-dark-primary"
            >
              <RefreshIcon className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>
          <div className="divide-y divide-light-border dark:divide-dark-border max-h-[600px] overflow-y-auto">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-4 hover:bg-light-bg dark:hover:bg-dark-bg">
                <div className="flex items-start justify-between">
                  <div>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      log.log_type === 'admin' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' :
                      log.log_type === 'agent' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                      log.log_type === 'login' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                    }`}>
                      {log.log_type}
                    </span>
                    <span className="ml-2 text-sm text-text-primary dark:text-text-dark-primary">
                      {log.action}
                    </span>
                  </div>
                  <span className="text-xs text-text-secondary dark:text-text-dark-secondary">
                    {formatRelativeTime(log.created_at)}
                  </span>
                </div>
                {log.ip_address && (
                  <p className="text-xs text-text-secondary dark:text-text-dark-secondary mt-1">
                    IP: {log.ip_address}
                  </p>
                )}
              </div>
            ))}
          </div>
          {auditLogs.length === 0 && !loading && (
            <div className="p-8 text-center text-text-secondary dark:text-text-dark-secondary">
              No audit logs found
            </div>
          )}
        </div>
      )}

      {/* V2.2 Notice */}
      <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
        <div className="flex items-start gap-3">
          <AdminIcon className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-purple-800 dark:text-purple-300">V2.2 Admin & Ops Platform</h4>
            <p className="text-xs text-purple-700 dark:text-purple-400 mt-1">
              Admin interface with controlled write operations. All actions are logged to the audit trail.
              Each write operation requires a reason and confirmation.
            </p>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={modal.isOpen}
        onClose={closeModal}
        onConfirm={handleModalConfirm}
        title={modal.title}
        message={modal.message}
        confirmLabel={modal.confirmLabel}
        confirmStyle={modal.confirmStyle}
        loading={actionLoading}
      />
    </div>
  );
}
