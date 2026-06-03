/**
 * Agents Admin Page (V2.1)
 *
 * Admin UI for managing Local Server Agents.
 *
 * Features:
 * - List all agents (pending, active, revoked)
 * - View agent details (paths, patterns, last heartbeat)
 * - View audit log per agent
 * - Revoke agents (kill switch)
 * - Role-based access (admin/owner: full, others: read-only)
 *
 * V2.1 Scope Only - No agent binary, installer, or download.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';

// ============================================================
// ICONS
// ============================================================

const ServerIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
  </svg>
);

const RefreshIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

const ShieldIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const FolderIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
  </svg>
);

const ClockIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const TrashIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const XIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const ExclamationIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

const DocumentIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const EyeIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

// ============================================================
// STATUS BADGE
// ============================================================

function StatusBadge({ status }) {
  const styles = {
    active: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
    pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
    revoked: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    offline: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
  };

  const labels = {
    active: 'Active',
    pending: 'Pending',
    revoked: 'Revoked',
    offline: 'Offline',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || styles.offline}`}>
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
        status === 'active' ? 'bg-emerald-500' :
        status === 'pending' ? 'bg-amber-500' :
        status === 'revoked' ? 'bg-red-500' : 'bg-gray-500'
      }`} />
      {labels[status] || status}
    </span>
  );
}

// ============================================================
// RELATIVE TIME
// ============================================================

function formatRelativeTime(dateString) {
  if (!dateString) return 'Never';

  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString();
}

// ============================================================
// REVOKE MODAL
// ============================================================

function RevokeAgentModal({ agent, onClose, onConfirm, isLoading }) {
  const [reason, setReason] = useState('');

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50" onClick={onClose} />

        <div className="relative bg-light-surface dark:bg-dark-surface rounded-xl shadow-xl max-w-md w-full p-6 border border-light-border dark:border-dark-border">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400">
              <ExclamationIcon />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-text-primary dark:text-text-dark-primary">
                Revoke Agent
              </h3>
              <p className="mt-1 text-sm text-text-secondary dark:text-text-dark-secondary">
                This will immediately revoke <strong>{agent?.name}</strong>. The agent will stop all operations on its next heartbeat (within 60 seconds).
              </p>
            </div>
          </div>

          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
            <p className="text-sm text-red-800 dark:text-red-300 font-medium">
              Kill Switch Warning
            </p>
            <p className="text-xs text-red-700 dark:text-red-400 mt-1">
              This action cannot be undone. The agent must be re-paired to regain access.
            </p>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-text-primary dark:text-text-dark-primary mb-1">
              Reason (optional)
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Security concern, decommissioned, etc."
              className="w-full px-3 py-2 rounded-lg border border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-bg text-text-primary dark:text-text-dark-primary placeholder-text-secondary dark:placeholder-text-dark-secondary focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          <div className="mt-6 flex gap-3 justify-end">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-text-primary dark:text-text-dark-primary bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => onConfirm(reason)}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Revoking...
                </>
              ) : (
                <>
                  <TrashIcon />
                  Revoke Agent
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// AGENT DETAIL PANEL
// ============================================================

function AgentDetailPanel({ agent, auditLogs, onClose, onRevoke, isAdmin }) {
  const [activeTab, setActiveTab] = useState('details');

  const allowedPaths = agent?.allowedPaths ?
    (typeof agent.allowedPaths === 'string' ? JSON.parse(agent.allowedPaths) : agent.allowedPaths) : [];

  const excludedPatterns = agent?.excludedPatterns ?
    (typeof agent.excludedPatterns === 'string' ? JSON.parse(agent.excludedPatterns) : agent.excludedPatterns) : [];

  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-lg z-40">
      <div className="fixed inset-0 bg-black/30" onClick={onClose} />

      <div className="absolute right-0 top-0 h-full w-full max-w-lg bg-light-surface dark:bg-dark-surface shadow-xl border-l border-light-border dark:border-dark-border overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-light-border dark:border-dark-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-ion/10 flex items-center justify-center text-ion">
              <ServerIcon />
            </div>
            <div>
              <h2 className="font-semibold text-text-primary dark:text-text-dark-primary">{agent?.name}</h2>
              <StatusBadge status={agent?.status} />
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-light-bg dark:hover:bg-dark-bg rounded-lg transition-colors text-text-secondary dark:text-text-dark-secondary"
          >
            <XIcon />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-6 border-b border-light-border dark:border-dark-border">
          <div className="flex gap-4">
            {['details', 'audit'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-3 px-1 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab
                    ? 'border-ion text-ion'
                    : 'border-transparent text-text-secondary dark:text-text-dark-secondary hover:text-text-primary dark:hover:text-text-dark-primary'
                }`}
              >
                {tab === 'details' ? 'Details' : 'Audit Log'}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'details' ? (
            <div className="space-y-6">
              {/* System Info */}
              <div>
                <h3 className="text-sm font-medium text-text-secondary dark:text-text-dark-secondary mb-3">System Information</h3>
                <div className="bg-light-bg dark:bg-dark-bg rounded-lg p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-text-secondary dark:text-text-dark-secondary">Hostname</span>
                    <span className="text-sm font-medium text-text-primary dark:text-text-dark-primary">{agent?.hostname || 'Unknown'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-text-secondary dark:text-text-dark-secondary">Platform</span>
                    <span className="text-sm font-medium text-text-primary dark:text-text-dark-primary">{agent?.platform || 'Unknown'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-text-secondary dark:text-text-dark-secondary">Agent Version</span>
                    <span className="text-sm font-medium text-text-primary dark:text-text-dark-primary">{agent?.agentVersion || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-text-secondary dark:text-text-dark-secondary">Last IP</span>
                    <span className="text-sm font-mono text-text-primary dark:text-text-dark-primary">{agent?.lastIp || 'Unknown'}</span>
                  </div>
                </div>
              </div>

              {/* Heartbeat */}
              <div>
                <h3 className="text-sm font-medium text-text-secondary dark:text-text-dark-secondary mb-3">Connectivity</h3>
                <div className="bg-light-bg dark:bg-dark-bg rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-text-secondary dark:text-text-dark-secondary flex items-center gap-2">
                      <ClockIcon />
                      Last Heartbeat
                    </span>
                    <span className="text-sm font-medium text-text-primary dark:text-text-dark-primary">
                      {formatRelativeTime(agent?.lastSeenAt)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-text-secondary dark:text-text-dark-secondary">Created</span>
                    <span className="text-sm text-text-primary dark:text-text-dark-primary">
                      {agent?.createdAt ? new Date(agent.createdAt).toLocaleDateString() : 'Unknown'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Allowed Paths */}
              <div>
                <h3 className="text-sm font-medium text-text-secondary dark:text-text-dark-secondary mb-3 flex items-center gap-2">
                  <FolderIcon />
                  Allowed Paths
                </h3>
                <div className="bg-light-bg dark:bg-dark-bg rounded-lg p-4">
                  {allowedPaths.length > 0 ? (
                    <ul className="space-y-2">
                      {allowedPaths.map((path, i) => (
                        <li key={i} className="text-sm font-mono text-text-primary dark:text-text-dark-primary bg-light-surface dark:bg-dark-surface px-3 py-2 rounded">
                          {path}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-text-secondary dark:text-text-dark-secondary italic">No paths configured</p>
                  )}
                </div>
              </div>

              {/* Excluded Patterns */}
              <div>
                <h3 className="text-sm font-medium text-text-secondary dark:text-text-dark-secondary mb-3 flex items-center gap-2">
                  <ShieldIcon />
                  Excluded Patterns
                </h3>
                <div className="bg-light-bg dark:bg-dark-bg rounded-lg p-4">
                  {excludedPatterns.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {excludedPatterns.map((pattern, i) => (
                        <span key={i} className="text-xs font-mono bg-light-surface dark:bg-dark-surface px-2 py-1 rounded text-text-primary dark:text-text-dark-primary">
                          {pattern}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-text-secondary dark:text-text-dark-secondary italic">Using default patterns</p>
                  )}
                </div>
              </div>

              {/* Last Scan */}
              {agent?.lastScan && (
                <div>
                  <h3 className="text-sm font-medium text-text-secondary dark:text-text-dark-secondary mb-3">Last Scan</h3>
                  <div className="bg-light-bg dark:bg-dark-bg rounded-lg p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-text-secondary dark:text-text-dark-secondary">Status</span>
                      <StatusBadge status={agent.lastScan.status} />
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-text-secondary dark:text-text-dark-secondary">Files Uploaded</span>
                      <span className="text-sm font-medium text-text-primary dark:text-text-dark-primary">{agent.lastScan.filesUploaded || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-text-secondary dark:text-text-dark-secondary">Date</span>
                      <span className="text-sm text-text-primary dark:text-text-dark-primary">
                        {formatRelativeTime(agent.lastScan.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Revocation Info (if revoked) */}
              {agent?.status === 'revoked' && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                  <h3 className="text-sm font-medium text-red-800 dark:text-red-300 mb-2">Revoked</h3>
                  <p className="text-sm text-red-700 dark:text-red-400">
                    {agent.revokeReason || 'No reason provided'}
                  </p>
                  {agent.revokedAt && (
                    <p className="text-xs text-red-600 dark:text-red-500 mt-2">
                      Revoked {formatRelativeTime(agent.revokedAt)}
                    </p>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* Audit Log Tab */
            <div className="space-y-3">
              {auditLogs.length > 0 ? (
                auditLogs.map((log, i) => (
                  <div
                    key={log.id || i}
                    className={`p-3 rounded-lg border ${
                      log.severity === 'warning' ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800' :
                      log.severity === 'error' ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' :
                      'bg-light-bg dark:bg-dark-bg border-light-border dark:border-dark-border'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                          log.severity === 'warning' ? 'bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200' :
                          log.severity === 'error' ? 'bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-200' :
                          'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                        }`}>
                          {log.event}
                        </span>
                        <p className="text-sm text-text-primary dark:text-text-dark-primary mt-1">
                          {log.message || log.event}
                        </p>
                      </div>
                      <span className="text-xs text-text-secondary dark:text-text-dark-secondary whitespace-nowrap">
                        {formatRelativeTime(log.created_at)}
                      </span>
                    </div>
                    {log.ip_address && (
                      <p className="text-xs text-text-secondary dark:text-text-dark-secondary mt-1">
                        IP: {log.ip_address}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-sm text-text-secondary dark:text-text-dark-secondary text-center py-8">
                  No audit entries for this agent
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {isAdmin && agent?.status === 'active' && (
          <div className="px-6 py-4 border-t border-light-border dark:border-dark-border">
            <button
              onClick={onRevoke}
              className="w-full px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <TrashIcon />
              Revoke Agent (Kill Switch)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function AgentsAdmin() {
  const { user, authFetch } = useAuth();
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [agentAuditLogs, setAgentAuditLogs] = useState([]);
  const [showRevokeModal, setShowRevokeModal] = useState(false);
  const [revoking, setRevoking] = useState(false);
  const [filter, setFilter] = useState('all');

  // Check if user is admin/owner
  const isAdmin = user?.role === 'owner' || user?.role === 'admin';

  // Fetch agents
  const fetchAgents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await authFetch('/agents');
      if (response.ok) {
        const data = await response.json();
        // Handle both array and object responses
        const agentsList = Array.isArray(data) ? data : (data.agents || []);
        setAgents(agentsList);
      } else {
        throw new Error('Failed to fetch agents');
      }
    } catch (err) {
      console.error('Fetch agents error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [authFetch]);

  // Fetch audit logs for selected agent
  const fetchAgentAuditLogs = useCallback(async (agentId) => {
    try {
      const response = await authFetch(`/agents/audit?agentId=${agentId}&limit=50`);
      if (response.ok) {
        const data = await response.json();
        setAgentAuditLogs(data.logs || []);
      }
    } catch (err) {
      console.error('Fetch audit logs error:', err);
    }
  }, [authFetch]);

  // Select agent
  const handleSelectAgent = async (agent) => {
    setSelectedAgent(agent);
    await fetchAgentAuditLogs(agent.id);
  };

  // Revoke agent
  const handleRevokeAgent = async (reason) => {
    if (!selectedAgent) return;

    try {
      setRevoking(true);
      const response = await authFetch(`/agents/${selectedAgent.id}`, {
        method: 'DELETE',
        body: JSON.stringify({ reason }),
      });

      if (response.ok) {
        setShowRevokeModal(false);
        setSelectedAgent(null);
        await fetchAgents();
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Failed to revoke agent');
      }
    } catch (err) {
      console.error('Revoke agent error:', err);
      alert(err.message);
    } finally {
      setRevoking(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  // Filter agents
  const filteredAgents = agents.filter(agent => {
    if (filter === 'all') return true;
    return agent.status === filter;
  });

  // Count by status
  const statusCounts = agents.reduce((acc, agent) => {
    acc[agent.status] = (acc[agent.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-text-primary dark:text-text-dark-primary flex items-center gap-3">
              <ServerIcon />
              Local Server Agents
            </h1>
            <p className="mt-1 text-text-secondary dark:text-text-dark-secondary">
              Manage on-premise agents for local file scanning
              {!isAdmin && (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-800 text-text-secondary dark:text-text-dark-secondary">
                  <EyeIcon />
                  <span className="ml-1">Read-only</span>
                </span>
              )}
            </p>
          </div>
          <button
            onClick={fetchAgents}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-text-primary dark:text-text-dark-primary bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            <RefreshIcon />
            Refresh
          </button>
        </div>

        {/* Status Filter */}
        <div className="flex gap-2 mb-6">
          {[
            { key: 'all', label: 'All', count: agents.length },
            { key: 'active', label: 'Active', count: statusCounts.active || 0 },
            { key: 'pending', label: 'Pending', count: statusCounts.pending || 0 },
            { key: 'revoked', label: 'Revoked', count: statusCounts.revoked || 0 },
          ].map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                filter === key
                  ? 'bg-ion text-white'
                  : 'bg-light-surface dark:bg-dark-surface text-text-secondary dark:text-text-dark-secondary hover:bg-gray-100 dark:hover:bg-gray-800 border border-light-border dark:border-dark-border'
              }`}
            >
              {label} ({count})
            </button>
          ))}
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
            <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <svg className="animate-spin h-8 w-8 text-ion" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
        ) : filteredAgents.length === 0 ? (
          /* Empty State */
          <div className="text-center py-12 bg-light-surface dark:bg-dark-surface rounded-xl border border-light-border dark:border-dark-border">
            <ServerIcon />
            <h3 className="mt-4 text-lg font-medium text-text-primary dark:text-text-dark-primary">No agents found</h3>
            <p className="mt-1 text-sm text-text-secondary dark:text-text-dark-secondary">
              {filter === 'all'
                ? 'No local server agents have been registered yet.'
                : `No ${filter} agents.`}
            </p>
            <p className="mt-4 text-xs text-text-secondary dark:text-text-dark-secondary max-w-md mx-auto">
              Local Server Agent binaries and installers will be available in V2.2. Currently, agent management is available for testing the backend infrastructure.
            </p>
          </div>
        ) : (
          /* Agent List */
          <div className="bg-light-surface dark:bg-dark-surface rounded-xl border border-light-border dark:border-dark-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-light-border dark:divide-dark-border">
                <thead className="bg-light-bg dark:bg-dark-bg">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary dark:text-text-dark-secondary uppercase tracking-wider">
                      Agent
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary dark:text-text-dark-secondary uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary dark:text-text-dark-secondary uppercase tracking-wider">
                      Last Heartbeat
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary dark:text-text-dark-secondary uppercase tracking-wider">
                      Platform
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary dark:text-text-dark-secondary uppercase tracking-wider">
                      Paths
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-text-secondary dark:text-text-dark-secondary uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-light-border dark:divide-dark-border">
                  {filteredAgents.map((agent) => {
                    const paths = agent.allowedPaths ?
                      (typeof agent.allowedPaths === 'string' ? JSON.parse(agent.allowedPaths) : agent.allowedPaths) : [];

                    return (
                      <tr
                        key={agent.id}
                        className="hover:bg-light-bg dark:hover:bg-dark-bg transition-colors cursor-pointer"
                        onClick={() => handleSelectAgent(agent)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-lg bg-ion/10 flex items-center justify-center text-ion">
                              <ServerIcon />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-text-primary dark:text-text-dark-primary">
                                {agent.name}
                              </div>
                              <div className="text-xs text-text-secondary dark:text-text-dark-secondary">
                                {agent.hostname || 'Unknown host'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={agent.status} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-text-primary dark:text-text-dark-primary">
                            {formatRelativeTime(agent.lastSeenAt)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-text-secondary dark:text-text-dark-secondary">
                            {agent.platform || 'Unknown'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-text-secondary dark:text-text-dark-secondary">
                            {paths.length > 0 ? `${paths.length} path${paths.length > 1 ? 's' : ''}` : 'None'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectAgent(agent);
                            }}
                            className="text-ion hover:text-ion/80 transition-colors"
                          >
                            <ChevronRightIcon />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* V2.1 Notice */}
        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-3">
            <DocumentIcon />
            <div>
              <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300">V2.1 Admin & Ops Platform</h4>
              <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
                This is the admin interface for managing Local Server Agents. Agent binaries, installers, and download buttons are planned for V2.2.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Detail Panel */}
      {selectedAgent && (
        <AgentDetailPanel
          agent={selectedAgent}
          auditLogs={agentAuditLogs}
          onClose={() => {
            setSelectedAgent(null);
            setAgentAuditLogs([]);
          }}
          onRevoke={() => setShowRevokeModal(true)}
          isAdmin={isAdmin}
        />
      )}

      {/* Revoke Modal */}
      {showRevokeModal && selectedAgent && (
        <RevokeAgentModal
          agent={selectedAgent}
          onClose={() => setShowRevokeModal(false)}
          onConfirm={handleRevokeAgent}
          isLoading={revoking}
        />
      )}
    </div>
  );
}
