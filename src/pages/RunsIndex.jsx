import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Runs Index Page (/app/runs)
 *
 * Lists all orchestrated runs with status, actions, and navigation to inventory/plan pages.
 */

// Icons
const PlayIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const RefreshIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

const EyeIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const DocumentIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const TrashIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const DatabaseIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
  </svg>
);

const FolderIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
  </svg>
);

const CloudIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
  </svg>
);

const UploadIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const XIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const RocketIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
  </svg>
);

const LoadingSpinner = ({ size = 'md' }) => {
  const sizes = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-8 w-8', xl: 'h-12 w-12' };
  return (
    <svg className={`animate-spin ${sizes[size]}`} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
};

// Status badge configuration
const STATUS_CONFIG = {
  pending: { label: 'Pending', color: 'bg-gray-100 text-gray-700', icon: '⏳' },
  scanning: { label: 'Scanning', color: 'bg-blue-100 text-blue-700', icon: '🔄' },
  scanned: { label: 'Scanned', color: 'bg-green-100 text-green-700', icon: '✅' },
  approved: { label: 'Approved', color: 'bg-green-100 text-green-700', icon: '✓' },
  planning: { label: 'Planning', color: 'bg-yellow-100 text-yellow-700', icon: '📋' },
  planned: { label: 'Planned', color: 'bg-purple-100 text-purple-700', icon: '📝' },
  ready_for_architecture: { label: 'Review Architecture', color: 'bg-amber-100 text-amber-700 font-semibold', icon: '🏗️' },
  ready: { label: 'Discover KPIs', color: 'bg-indigo-100 text-indigo-700 font-semibold', icon: '📊' },
  kpis_confirmed: { label: 'Ready to Build', color: 'bg-green-100 text-green-700 font-semibold', icon: '🚀' },
  executing: { label: 'Executing', color: 'bg-orange-100 text-orange-700', icon: '⚡' },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-700', icon: '✅' },
  failed: { label: 'Failed', color: 'bg-red-100 text-red-700', icon: '❌' },
};

// Format date
const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// Format size
const formatSize = (bytes) => {
  if (!bytes || bytes === 0) return '-';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
};

export default function RunsIndex() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { authFetch } = useAuth();

  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [deleting, setDeleting] = useState(null);
  const [successBanner, setSuccessBanner] = useState(null);

  // Handle success banner from navigation state
  useEffect(() => {
    if (location.state?.showSuccessBanner) {
      setSuccessBanner(location.state.message || t('runs.success', 'Operation completed successfully!'));
      // Clear the state to prevent showing banner on refresh
      navigate(location.pathname, { replace: true, state: {} });
      // Auto-dismiss after 8 seconds
      const timer = setTimeout(() => setSuccessBanner(null), 8000);
      return () => clearTimeout(timer);
    }
  }, [location.state, location.pathname, navigate, t]);

  // Fetch runs
  const fetchRuns = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await authFetch('/orchestrated-runs');
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to fetch runs');
      }
      const data = await res.json();
      // Handle both array and object responses
      const runsList = Array.isArray(data) ? data : (data.runs || []);
      setRuns(runsList);
    } catch (err) {
      console.error('Fetch runs error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [authFetch]);

  // Initial fetch
  useEffect(() => {
    fetchRuns();
  }, [fetchRuns]);

  // Delete run
  const handleDelete = async (runId) => {
    if (!window.confirm('Are you sure you want to delete this run? This cannot be undone.')) {
      return;
    }

    setDeleting(runId);
    try {
      const res = await authFetch(`/orchestrated-runs/${runId}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete run');
      }
      await fetchRuns();
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleting(null);
    }
  };

  // Filter runs
  const filteredRuns = runs.filter(run => {
    if (filter === 'all') return true;
    return run.status === filter;
  });

  // Count by status
  const statusCounts = runs.reduce((acc, run) => {
    acc[run.status] = (acc[run.status] || 0) + 1;
    return acc;
  }, {});

  // Get source info from run
  const getSourceInfo = (run) => {
    const connectorCount = run.connector_ids?.length || 0;
    const hasUploads = run.options?.includeUploads || false;
    return { connectorCount, hasUploads };
  };

  if (loading && runs.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="xl" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <PlayIcon />
              {t('runs.title', 'Runs & Ingestions')}
            </h1>
            <p className="mt-1 text-gray-500">
              {t('runs.description', 'View and manage your data scan runs')}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchRuns}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <RefreshIcon />
              {t('common.refresh', 'Refresh')}
            </button>
            <button
              onClick={() => navigate('/app/connectors')}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PlayIcon />
              {t('runs.newScan', 'New Scan')}
            </button>
          </div>
        </div>

        {/* Success Banner */}
        {successBanner && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-full text-green-600">
                <CheckIcon />
              </div>
              <p className="text-green-800 font-medium">{successBanner}</p>
            </div>
            <button
              onClick={() => setSuccessBanner(null)}
              className="p-1 text-green-600 hover:bg-green-100 rounded-full transition-colors"
            >
              <XIcon />
            </button>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Filter tabs */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap transition-colors ${
              filter === 'all'
                ? 'bg-gray-900 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            All ({runs.length})
          </button>
          {Object.entries(STATUS_CONFIG).map(([status, config]) => {
            const count = statusCounts[status] || 0;
            if (count === 0) return null;
            return (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap transition-colors ${
                  filter === status
                    ? 'bg-gray-900 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {config.icon} {config.label} ({count})
              </button>
            );
          })}
        </div>

        {/* Runs list */}
        {filteredRuns.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <FolderIcon className="mx-auto text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              {t('runs.noRuns', 'No runs found')}
            </h3>
            <p className="mt-2 text-gray-500">
              {t('runs.noRunsDesc', 'Start a new scan from the Data Sources page')}
            </p>
            <button
              onClick={() => navigate('/app/connectors')}
              className="mt-4 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              {t('runs.goToSources', 'Go to Data Sources')}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRuns.map((run) => {
              const statusConfig = STATUS_CONFIG[run.status] || STATUS_CONFIG.pending;
              const sourceInfo = getSourceInfo(run);
              const inventory = run.inventory || {};
              const summary = inventory.summary || {};

              return (
                <div
                  key={run.id}
                  className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    {/* Left side - Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${statusConfig.color}`}>
                          {statusConfig.icon} {statusConfig.label}
                        </span>
                        <span className="text-sm text-gray-500">
                          {formatDate(run.created_at)}
                        </span>
                      </div>

                      {/* Run ID - clickable to view details */}
                      <button
                        onClick={() => navigate(`/app/runs/${run.id}`)}
                        className="text-xs text-indigo-500 hover:text-indigo-700 font-mono mb-3 flex items-center gap-1 hover:underline"
                      >
                        <span>ID: {run.id.substring(0, 8)}...</span>
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </button>

                      {/* Sources */}
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                        {sourceInfo.connectorCount > 0 && (
                          <span className="flex items-center gap-1">
                            <CloudIcon />
                            {sourceInfo.connectorCount} connector{sourceInfo.connectorCount !== 1 ? 's' : ''}
                          </span>
                        )}
                        {sourceInfo.hasUploads && (
                          <span className="flex items-center gap-1">
                            <UploadIcon />
                            Uploaded files
                          </span>
                        )}
                      </div>

                      {/* Inventory summary (if scanned) */}
                      {['scanned', 'approved', 'planning', 'planned', 'ready', 'completed'].includes(run.status) && (
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          {summary.totalFiles > 0 && (
                            <span className="flex items-center gap-1">
                              <DocumentIcon />
                              {summary.totalFiles} files
                            </span>
                          )}
                          {summary.totalTables > 0 && (
                            <span className="flex items-center gap-1">
                              <DatabaseIcon />
                              {summary.totalTables} tables
                            </span>
                          )}
                          {summary.totalSize > 0 && (
                            <span>{formatSize(summary.totalSize)}</span>
                          )}
                        </div>
                      )}

                      {/* Context */}
                      {run.context_name && (
                        <p className="mt-2 text-sm text-gray-500">
                          Context: <span className="font-medium">{run.context_name}</span>
                        </p>
                      )}
                    </div>

                    {/* Right side - Actions */}
                    <div className="flex items-center gap-2 ml-4">
                      {/* View Inventory */}
                      {['scanned', 'approved', 'planning', 'planned', 'ready', 'executing', 'completed'].includes(run.status) && (
                        <button
                          onClick={() => navigate(`/app/runs/${run.id}/inventory`)}
                          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                          <EyeIcon />
                          Inventory
                        </button>
                      )}

                      {/* View Plan */}
                      {['planned', 'ready', 'executing', 'completed'].includes(run.status) && run.structuring_plan_id && (
                        <button
                          onClick={() => navigate(`/app/runs/${run.id}/plan`)}
                          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                        >
                          <DocumentIcon />
                          Plan
                        </button>
                      )}

                      {/* Confirm Plan (Planned runs - must confirm before building) */}
                      {run.status === 'planned' && (
                        <button
                          onClick={() => navigate(`/app/runs/${run.id}/plan`)}
                          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors shadow-sm"
                          title={t('runs.confirmPlanDesc', 'Review and confirm your structuring plan to enable app building')}
                        >
                          <CheckIcon />
                          {t('runs.confirmPlan', 'Confirm Plan')}
                        </button>
                      )}

                      {/* Review Architecture (Phase B2.5 - must confirm before building) */}
                      {run.status === 'ready_for_architecture' && (
                        <button
                          onClick={() => navigate(`/app/runs/${run.id}/organization-preview`)}
                          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-amber-600 rounded-lg hover:bg-amber-700 transition-colors shadow-sm"
                          title={t('runs.reviewArchitectureDesc', 'Review and confirm your data architecture before building apps')}
                        >
                          <DatabaseIcon />
                          {t('runs.reviewArchitecture', 'Review Architecture')}
                        </button>
                      )}

                      {/* Discover KPIs (Phase E - Ready runs) */}
                      {run.status === 'ready' && (
                        <button
                          onClick={() => navigate(`/app/runs/${run.id}/kpi-discovery`)}
                          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                          title={t('runs.discoverKPIs', 'Define KPIs and use cases before building dashboards')}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                          {t('runs.discoverKPIs', 'Discover KPIs')}
                        </button>
                      )}

                      {/* Preview Analytics (KPIs confirmed runs - Primary CTA) */}
                      {(run.status === 'kpis_confirmed' || run.kpi_status === 'confirmed') && (
                        <button
                          onClick={() => navigate(`/app/runs/${run.id}/analytics-preview`)}
                          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-colors shadow-sm"
                          title={t('runs.previewAnalytics', 'Preview your data tables, KPIs, dashboards, and chatbot capabilities')}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                          {t('runs.previewAnalytics', 'Preview Analytics')}
                        </button>
                      )}

                      {/* Build App (KPIs confirmed runs - Secondary CTA) */}
                      {(run.status === 'kpis_confirmed' || run.kpi_status === 'confirmed') && (
                        <button
                          onClick={() => navigate(`/app/runs/${run.id}/build`)}
                          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                          title={t('runs.buildApp', 'Skip preview and build dashboards, CRUD apps, or chatbots')}
                        >
                          <RocketIcon />
                          {t('runs.buildApp', 'Build App')}
                        </button>
                      )}

                      {/* Scanning indicator */}
                      {run.status === 'scanning' && (
                        <div className="flex items-center gap-2 px-3 py-2 text-sm text-blue-600">
                          <LoadingSpinner size="sm" />
                          Scanning...
                        </div>
                      )}

                      {/* Delete */}
                      {!['scanning', 'executing'].includes(run.status) && (
                        <button
                          onClick={() => handleDelete(run.id)}
                          disabled={deleting === run.id}
                          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        >
                          {deleting === run.id ? (
                            <LoadingSpinner size="sm" />
                          ) : (
                            <TrashIcon />
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Progress bar for scanning */}
                  {run.status === 'scanning' && run.progress > 0 && (
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                        <span>Progress</span>
                        <span>{run.progress}%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 transition-all duration-300"
                          style={{ width: `${run.progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
