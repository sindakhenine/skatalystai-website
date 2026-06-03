import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Inventory Results Page (/app/runs/:id/inventory)
 *
 * Shows scan progress and inventory results for an orchestrated run.
 * Allows user to review and approve the inventory before generating a structuring plan.
 */

// Icons
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

const RefreshIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

const DocumentIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
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

const ArrowRightIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
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

// Format file size
const formatSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
};

// Get status badge color
const getStatusColor = (status) => {
  const colors = {
    pending: 'bg-gray-100 text-gray-700',
    scanning: 'bg-blue-100 text-blue-700',
    scanned: 'bg-green-100 text-green-700',
    approved: 'bg-green-100 text-green-700',
    planning: 'bg-yellow-100 text-yellow-700',
    planned: 'bg-purple-100 text-purple-700',
    ready: 'bg-indigo-100 text-indigo-700',
    executing: 'bg-orange-100 text-orange-700',
    completed: 'bg-green-100 text-green-700',
    failed: 'bg-red-100 text-red-700',
  };
  return colors[status] || 'bg-gray-100 text-gray-700';
};

export default function InventoryResults() {
  const { t } = useTranslation();
  const { id: runId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { authFetch } = useAuth();

  const [run, setRun] = useState(null);
  const [inventory, setInventory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [approving, setApproving] = useState(false);
  const [successBanner, setSuccessBanner] = useState(null);

  // Handle success banner from navigation state
  useEffect(() => {
    if (location.state?.showSuccessBanner) {
      setSuccessBanner(location.state.message || t('inventory.scanStarted', 'Scan started successfully!'));
      // Clear the state to prevent showing banner on refresh
      navigate(location.pathname, { replace: true, state: {} });
      // Auto-dismiss after 8 seconds
      const timer = setTimeout(() => setSuccessBanner(null), 8000);
      return () => clearTimeout(timer);
    }
  }, [location.state, location.pathname, navigate, t]);

  // Fetch run details
  const fetchRun = useCallback(async () => {
    try {
      const res = await authFetch(`/orchestrated-runs/${runId}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to fetch run');
      }
      const data = await res.json();
      setRun(data);

      // If scanned or beyond, fetch full inventory
      if (['scanned', 'approved', 'planning', 'planned', 'ready', 'executing', 'completed'].includes(data.status)) {
        const invRes = await authFetch(`/orchestrated-runs/${runId}/inventory`);
        if (invRes.ok) {
          const invData = await invRes.json();
          // Extract the actual inventory object from the wrapper
          setInventory(invData.inventory || invData);
        }
      }

      return data;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [authFetch, runId]);

  // Initial fetch and polling
  useEffect(() => {
    fetchRun();
  }, [fetchRun]);

  // Poll for progress while scanning
  useEffect(() => {
    let interval = null;

    if (run && run.status === 'scanning') {
      interval = setInterval(async () => {
        const data = await fetchRun();
        if (data && data.status !== 'scanning') {
          clearInterval(interval);
        }
      }, 3000); // Poll every 3 seconds
    }

    // Cleanup function - always clear on unmount or when status changes
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [run?.status]); // Remove fetchRun from deps to avoid infinite loops

  // Approve inventory and auto-generate plan
  const handleApprove = async () => {
    setApproving(true);
    setError(null);
    try {
      // Step 1: Approve the inventory
      const approveRes = await authFetch(`/orchestrated-runs/${runId}/approve-inventory`, {
        method: 'POST',
      });
      if (!approveRes.ok) {
        const data = await approveRes.json();
        throw new Error(data.error || 'Failed to approve inventory');
      }

      // Step 2: Automatically generate the structuring plan
      const planRes = await authFetch(`/orchestrated-runs/${runId}/generate-structuring-plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ method: 'heuristic' }),
      });
      if (!planRes.ok) {
        const data = await planRes.json();
        throw new Error(data.error || 'Failed to generate structuring plan');
      }

      // Step 3: Navigate to the plan page
      navigate(`/app/runs/${runId}/plan`, {
        state: {
          showSuccessBanner: true,
          message: t('inventory.planGenerated', 'Inventory approved! Structuring plan generated.')
        }
      });
    } catch (err) {
      setError(err.message);
      setApproving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="xl" />
      </div>
    );
  }

  if (error && !run) {
    return (
      <div className="p-6 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
          <XIcon />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          {t('inventory.errorTitle', 'Error Loading Run')}
        </h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={() => navigate('/app/runs')}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          {t('inventory.backToRuns', 'Back to Runs')}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Success Banner */}
      {successBanner && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center justify-between">
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

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <button
              onClick={() => navigate('/app/runs')}
              className="text-gray-500 hover:text-gray-700 transition-colors"
              title={t('inventory.backToRuns', 'Back to Runs')}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-2xl font-bold text-gray-900">
              {t('inventory.title', 'Scan Results')}
            </h1>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(run?.status)}`}>
              {run?.status}
            </span>
          </div>
          <p className="text-gray-600 ml-8">
            {run?.context_name && `Context: ${run.context_name}`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchRun}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
            title={t('inventory.refresh', 'Refresh')}
          >
            <RefreshIcon />
          </button>
        </div>
      </div>

      {/* Scanning Progress */}
      {run?.status === 'scanning' && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-center gap-4">
            <LoadingSpinner size="lg" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-blue-900">
                {t('inventory.scanning', 'Scanning Data Sources...')}
              </h3>
              <p className="text-blue-700 mt-1">
                {run.current_step || t('inventory.scanningDesc', 'Reading files and collecting metadata')}
              </p>
              {run.progress > 0 && (
                <div className="mt-3">
                  <div className="flex items-center justify-between text-sm text-blue-800 mb-1">
                    <span>{t('inventory.progress', 'Progress')}</span>
                    <span>{run.progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-blue-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 transition-all duration-300"
                      style={{ width: `${run.progress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Pending Status */}
      {run?.status === 'pending' && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {t('inventory.pending', 'Scan Not Started')}
          </h3>
          <p className="text-gray-600">
            {t('inventory.pendingDesc', 'This scan has been created but not yet started.')}
          </p>
        </div>
      )}

      {/* Error State */}
      {run?.errors && run.errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <h3 className="font-semibold text-red-900 mb-2">
            {t('inventory.errors', 'Errors')}
          </h3>
          <ul className="space-y-1">
            {run.errors.map((err, i) => (
              <li key={i} className="text-sm text-red-700">
                {err.phase}: {err.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Inventory Summary */}
      {inventory && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                  <DocumentIcon />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {inventory.summary?.totalFiles || 0}
                  </p>
                  <p className="text-sm text-gray-500">{t('inventory.files', 'Files')}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                  <DatabaseIcon />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {inventory.summary?.totalTables || 0}
                  </p>
                  <p className="text-sm text-gray-500">{t('inventory.tables', 'Tables')}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg text-green-600">
                  <FolderIcon />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatSize(inventory.summary?.totalSize || 0)}
                  </p>
                  <p className="text-sm text-gray-500">{t('inventory.totalSize', 'Total Size')}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {Object.keys(inventory.summary?.filesByType || {}).length}
                  </p>
                  <p className="text-sm text-gray-500">{t('inventory.fileTypes', 'File Types')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Source Breakdown */}
          {inventory.summary?.sourceSummaries && inventory.summary.sourceSummaries.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {t('inventory.sourceBreakdown', 'Source Breakdown')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {inventory.summary.sourceSummaries.map((source, i) => (
                  <div
                    key={i}
                    className={`p-4 rounded-lg border-2 ${
                      source.sourceType === 'connector'
                        ? 'border-blue-200 bg-blue-50'
                        : source.sourceType === 'upload'
                        ? 'border-green-200 bg-green-50'
                        : 'border-purple-200 bg-purple-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                        source.sourceType === 'connector'
                          ? 'bg-blue-100 text-blue-700'
                          : source.sourceType === 'upload'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-purple-100 text-purple-700'
                      }`}>
                        {source.sourceType === 'connector' ? 'Connector' : source.sourceType === 'upload' ? 'Upload' : 'Agent'}
                      </span>
                      {source.connectorType && source.sourceType === 'connector' && (
                        <span className="text-xs text-gray-500">{source.connectorType}</span>
                      )}
                    </div>
                    <h4 className="font-medium text-gray-900 truncate">{source.sourceName}</h4>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                      {source.filesScanned > 0 && (
                        <div>
                          <span className="text-gray-500">{t('inventory.files', 'Files')}:</span>
                          <span className="ml-1 font-medium text-gray-900">{source.filesScanned}</span>
                        </div>
                      )}
                      {source.tablesScanned > 0 && (
                        <div>
                          <span className="text-gray-500">{t('inventory.tables', 'Tables')}:</span>
                          <span className="ml-1 font-medium text-gray-900">{source.tablesScanned}</span>
                        </div>
                      )}
                      {source.totalSize > 0 && (
                        <div>
                          <span className="text-gray-500">{t('inventory.size', 'Size')}:</span>
                          <span className="ml-1 font-medium text-gray-900">{formatSize(source.totalSize)}</span>
                        </div>
                      )}
                      {source.totalRows > 0 && (
                        <div>
                          <span className="text-gray-500">{t('inventory.rows', 'Rows')}:</span>
                          <span className="ml-1 font-medium text-gray-900">{source.totalRows.toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Files by Type */}
          {inventory.summary?.filesByType && Object.keys(inventory.summary.filesByType).length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {t('inventory.filesByType', 'Files by Type')}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {Object.entries(inventory.summary.filesByType)
                  .sort(([, a], [, b]) => b - a)
                  .map(([type, count]) => (
                    <div
                      key={type}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <span className="text-sm font-medium text-gray-700 uppercase">{type}</span>
                      <span className="text-sm text-gray-500">{count}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Tables List */}
          {inventory.tables && inventory.tables.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {t('inventory.tablesFound', 'Database Tables')} ({inventory.tables.length})
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 px-3 font-medium text-gray-700">
                        {t('inventory.tableName', 'Table')}
                      </th>
                      <th className="text-left py-2 px-3 font-medium text-gray-700">
                        {t('inventory.schema', 'Schema')}
                      </th>
                      <th className="text-right py-2 px-3 font-medium text-gray-700">
                        {t('inventory.columns', 'Columns')}
                      </th>
                      <th className="text-right py-2 px-3 font-medium text-gray-700">
                        {t('inventory.rows', 'Rows')}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventory.tables.slice(0, 20).map((table, i) => (
                      <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-2 px-3 font-medium text-gray-900">{table.name}</td>
                        <td className="py-2 px-3 text-gray-600">{table.schema || '-'}</td>
                        <td className="py-2 px-3 text-right text-gray-600">
                          {table.columns?.length || 0}
                        </td>
                        <td className="py-2 px-3 text-right text-gray-600">
                          {table.rowCount?.toLocaleString() || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {inventory.tables.length > 20 && (
                  <p className="text-sm text-gray-500 mt-3 text-center">
                    {t('inventory.showingTables', 'Showing 20 of {{total}} tables', { total: inventory.tables.length })}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Files List */}
          {inventory.files && inventory.files.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {t('inventory.filesFound', 'Files')} ({inventory.files.length})
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 px-3 font-medium text-gray-700">
                        {t('inventory.fileName', 'Name')}
                      </th>
                      <th className="text-left py-2 px-3 font-medium text-gray-700">
                        {t('inventory.source', 'Source')}
                      </th>
                      <th className="text-left py-2 px-3 font-medium text-gray-700">
                        {t('inventory.type', 'Type')}
                      </th>
                      <th className="text-right py-2 px-3 font-medium text-gray-700">
                        {t('inventory.size', 'Size')}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventory.files.slice(0, 50).map((file, i) => (
                      <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-2 px-3">
                          <div className="font-medium text-gray-900">{file.name}</div>
                          <div className="text-xs text-gray-500 truncate max-w-xs" title={file.path}>
                            {file.path}
                          </div>
                        </td>
                        <td className="py-2 px-3">
                          <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${
                            file.sourceType === 'connector'
                              ? 'bg-blue-100 text-blue-700'
                              : file.sourceType === 'upload'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-purple-100 text-purple-700'
                          }`}>
                            {file.sourceName || file.sourceType || 'Unknown'}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-gray-600 uppercase text-xs">
                          {file.type || file.mimeType?.split('/')[1] || '-'}
                        </td>
                        <td className="py-2 px-3 text-right text-gray-600">{formatSize(file.size)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {inventory.files.length > 50 && (
                  <p className="text-sm text-gray-500 mt-3 text-center">
                    {t('inventory.showingFiles', 'Showing 50 of {{total}} files', { total: inventory.files.length })}
                  </p>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* Action Buttons */}
      {run?.status === 'scanned' && !run.inventory_approved && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-green-100 rounded-xl text-green-600">
              <CheckIcon />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">
                {t('inventory.readyForApproval', 'Ready for Approval')}
              </h3>
              <p className="text-gray-600 mt-1">
                {t('inventory.approvalDesc', 'Review the inventory above. When satisfied, approve to automatically generate a structuring plan.')}
              </p>
              {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
            </div>
            <button
              onClick={handleApprove}
              disabled={approving}
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-300"
            >
              {approving ? (
                <>
                  <LoadingSpinner size="sm" />
                  {t('inventory.generatingPlan', 'Generating Plan...')}
                </>
              ) : (
                <>
                  <CheckIcon />
                  {t('inventory.approveAndGeneratePlan', 'Approve & Generate Plan')}
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Approved - View Plan (fallback if plan wasn't auto-generated) */}
      {run?.inventory_approved && run?.status === 'approved' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-purple-100 rounded-xl text-purple-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">
                {t('inventory.inventoryApproved', 'Inventory Approved')}
              </h3>
              <p className="text-gray-600 mt-1">
                {t('inventory.generatePlanDesc', 'Generate a structuring plan to organize your data into a database schema and folder taxonomy.')}
              </p>
            </div>
            <button
              onClick={() => navigate(`/app/runs/${runId}/plan`)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors"
            >
              {t('inventory.viewPlan', 'View Plan')}
              <ArrowRightIcon />
            </button>
          </div>
        </div>
      )}

      {/* Already has plan - Go to Plan */}
      {(run?.status === 'planned' || run?.status === 'ready') && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-indigo-100 rounded-xl text-indigo-600">
              <CheckIcon />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">
                {t('inventory.planGenerated', 'Structuring Plan Generated')}
              </h3>
              <p className="text-gray-600 mt-1">
                {t('inventory.viewPlanDesc', 'A structuring plan has been generated. Review and confirm it to proceed.')}
              </p>
            </div>
            <button
              onClick={() => navigate(`/app/runs/${runId}/plan`)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
            >
              {t('inventory.viewPlan', 'View Plan')}
              <ArrowRightIcon />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
