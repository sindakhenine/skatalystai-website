import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Execution Preview Page (/app/runs/:id/preview)
 *
 * SAFE MODE: Shows what WILL happen during implementation without executing.
 * WRITE MODE (Local Only): Execute implementation to local filesystem with confirmation.
 *
 * Features:
 * - Destination type selection
 * - Detailed preview of all actions
 * - Clear "PREVIEW ONLY" messaging
 * - Local execution with confirmation gate (Phase B1)
 * - Progress tracking and rollback support
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

const DatabaseIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
  </svg>
);

const CloudIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
  </svg>
);

const FolderIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
  </svg>
);

const DocumentIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const TableIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);

const AlertIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

const RocketIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

// Helper functions
const formatBytes = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatDuration = (ms) => {
  if (!ms) return '-';
  if (ms < 1000) return `${ms}ms`;
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
};

// Destination type options
const DESTINATION_TYPES = [
  {
    id: 'local',
    name: 'Local Storage',
    description: 'Save files to local filesystem',
    icon: FolderIcon,
    available: true,
  },
  {
    id: 'postgresql',
    name: 'PostgreSQL',
    description: 'Write to PostgreSQL database',
    icon: DatabaseIcon,
    available: false,
    comingSoon: true,
  },
  {
    id: 'azure_blob',
    name: 'Azure Blob Storage',
    description: 'Upload to Azure Blob container',
    icon: CloudIcon,
    available: false,
    comingSoon: true,
  },
  {
    id: 's3',
    name: 'Amazon S3',
    description: 'Upload to S3 bucket',
    icon: CloudIcon,
    available: false,
    comingSoon: true,
  },
];

export default function ExecutionPreview() {
  const { t } = useTranslation();
  const { id: runId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { authFetch } = useAuth();

  const [step, setStep] = useState('destination'); // 'destination' | 'preview' | 'executing' | 'completed' | 'failed'
  const [destinationType, setDestinationType] = useState(null);
  const [destinationConfig, setDestinationConfig] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedActions, setExpandedActions] = useState({});

  // Execution state
  const [executing, setExecuting] = useState(false);
  const [execution, setExecution] = useState(null);
  const [progress, setProgress] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmInput, setConfirmInput] = useState('');
  const progressIntervalRef = useRef(null);

  // Cleanup progress polling on unmount
  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  // Generate preview
  const generatePreview = useCallback(async (destType) => {
    setLoading(true);
    setError(null);

    const config = {
      type: destType,
      basePath: '/output',
    };

    try {
      const res = await authFetch(`/orchestrated-runs/${runId}/preview-implementation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ destinationConfig: config }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to generate preview');
      }

      const data = await res.json();
      setPreview(data);
      setDestinationConfig(config);
      setStep('preview');
    } catch (err) {
      console.error('Preview error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [authFetch, runId]);

  // Poll for execution progress
  const pollProgress = useCallback(async () => {
    try {
      const res = await authFetch(`/orchestrated-runs/${runId}/execution-progress`);
      if (!res.ok) {
        if (res.status === 404) {
          // No execution found - stop polling
          clearInterval(progressIntervalRef.current);
          return;
        }
        throw new Error('Failed to fetch progress');
      }

      const data = await res.json();
      setProgress(data);

      // Check if execution completed
      if (data.status === 'completed') {
        clearInterval(progressIntervalRef.current);
        setStep('completed');
        setExecuting(false);
      } else if (data.status === 'failed') {
        clearInterval(progressIntervalRef.current);
        setStep('failed');
        setExecuting(false);
        setError(data.errorMessage || 'Execution failed');
      }
    } catch (err) {
      console.error('Progress poll error:', err);
    }
  }, [authFetch, runId]);

  // Start execution
  const handleExecute = useCallback(async () => {
    if (!preview?.confirmationToken || !destinationConfig) {
      setError('Missing confirmation token or destination config');
      return;
    }

    // Phase B1: Only allow local execution
    if (destinationConfig.type !== 'local') {
      setError('Only local filesystem execution is enabled. Cloud destinations coming soon.');
      return;
    }

    setExecuting(true);
    setError(null);
    setShowConfirmModal(false);
    setStep('executing');

    try {
      const res = await authFetch(`/orchestrated-runs/${runId}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          confirmationToken: preview.confirmationToken,
          destinationConfig,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || data.error || 'Execution failed');
      }

      const data = await res.json();
      setExecution(data.execution);

      // Start polling for progress
      progressIntervalRef.current = setInterval(pollProgress, 1000);
    } catch (err) {
      console.error('Execute error:', err);
      setError(err.message);
      setStep('failed');
      setExecuting(false);
    }
  }, [authFetch, runId, preview, destinationConfig, pollProgress]);

  // Rollback execution
  const handleRollback = useCallback(async () => {
    if (!execution?.id) return;

    setLoading(true);
    setError(null);

    try {
      const res = await authFetch(`/orchestrated-runs/${runId}/rollback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ executionId: execution.id }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || data.error || 'Rollback failed');
      }

      const data = await res.json();
      setProgress(prev => ({ ...prev, status: 'rolled_back' }));
      // Navigate back to runs list
      navigate('/app/runs', {
        state: { showSuccessBanner: true, message: 'Execution rolled back successfully.' }
      });
    } catch (err) {
      console.error('Rollback error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [authFetch, runId, execution, navigate]);

  // Handle destination selection
  const handleSelectDestination = (type) => {
    setDestinationType(type);
    generatePreview(type);
  };

  // Toggle action expansion
  const toggleAction = (type) => {
    setExpandedActions(prev => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  // Render destination selection step
  const renderDestinationStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          {t('preview.selectDestination', 'Select Destination')}
        </h2>
        <p className="text-gray-600">
          {t('preview.selectDestinationDesc', 'Choose where your organized data will be written')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {DESTINATION_TYPES.map((dest) => {
          const Icon = dest.icon;
          return (
            <button
              key={dest.id}
              onClick={() => dest.available && handleSelectDestination(dest.id)}
              disabled={!dest.available || loading}
              className={`p-6 rounded-xl border-2 text-left transition-all ${
                dest.available
                  ? 'border-gray-200 hover:border-blue-500 hover:shadow-lg cursor-pointer'
                  : 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-60'
              } ${destinationType === dest.id ? 'border-blue-500 bg-blue-50' : ''}`}
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl ${dest.available ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-400'}`}>
                  <Icon />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    {dest.name}
                    {dest.comingSoon && (
                      <span className="px-2 py-0.5 text-xs bg-gray-200 text-gray-600 rounded-full">
                        Coming Soon
                      </span>
                    )}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">{dest.description}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner size="lg" />
          <span className="ml-3 text-gray-600">Generating preview...</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      )}
    </div>
  );

  // Render preview step
  const renderPreviewStep = () => {
    if (!preview) return null;

    return (
      <div className="space-y-6">
        {/* Safe Mode Banner */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-100 rounded-full text-amber-600">
              <AlertIcon />
            </div>
            <div>
              <h3 className="font-semibold text-amber-800">
                {t('preview.safeMode', 'PREVIEW MODE - No Data Will Be Written')}
              </h3>
              <p className="text-sm text-amber-700 mt-1">
                {preview.disclaimer}
              </p>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {t('preview.summary', 'Execution Summary')}
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{preview.summary.totalFiles}</div>
              <div className="text-sm text-gray-600">Files</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{preview.summary.totalTables}</div>
              <div className="text-sm text-gray-600">Tables</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{preview.summary.totalSizeFormatted}</div>
              <div className="text-sm text-gray-600">Total Size</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{preview.estimatedDuration}</div>
              <div className="text-sm text-gray-600">Est. Duration</div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <span className="text-sm text-blue-700">
              <strong>Destination:</strong> {preview.destination.label}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {t('preview.plannedActions', 'Planned Actions')}
          </h3>

          {preview.actions.map((action) => (
            <div key={action.type} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <button
                onClick={() => toggleAction(action.type)}
                className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    action.type === 'files' ? 'bg-blue-100 text-blue-600' :
                    action.type === 'schema' ? 'bg-purple-100 text-purple-600' :
                    'bg-green-100 text-green-600'
                  }`}>
                    {action.type === 'files' ? <DocumentIcon /> :
                     action.type === 'schema' ? <TableIcon /> : <FolderIcon />}
                  </div>
                  <div className="text-left">
                    <h4 className="font-medium text-gray-900">{action.label}</h4>
                    <p className="text-sm text-gray-600">{action.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-gray-500">{action.count} items</span>
                  <svg
                    className={`w-5 h-5 text-gray-400 transition-transform ${expandedActions[action.type] ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              {expandedActions[action.type] && action.details && (
                <div className="p-4 border-t border-gray-100 bg-gray-50">
                  {/* File actions details */}
                  {action.type === 'files' && action.details.byCategory && (
                    <div className="space-y-3">
                      <h5 className="text-sm font-medium text-gray-700 mb-2">By Category:</h5>
                      {action.details.byCategory.map((cat, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-white rounded-lg">
                          <div>
                            <span className="font-medium text-gray-900">{cat.category}</span>
                            <span className="text-gray-500 ml-2">→ {cat.destinationPath}</span>
                          </div>
                          <div className="text-sm text-gray-600">
                            {cat.count} files ({cat.sizeFormatted})
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Schema actions details */}
                  {action.type === 'schema' && (
                    <div className="space-y-3">
                      {action.details.map((table, i) => (
                        <div key={i} className="p-3 bg-white rounded-lg">
                          <div className="font-medium text-gray-900 mb-2">
                            CREATE TABLE {table.tableName}
                          </div>
                          <div className="text-sm text-gray-600 font-mono">
                            {table.columns.map((col, j) => (
                              <div key={j} className="flex items-center gap-2">
                                <span className="text-blue-600">{col.name}</span>
                                <span className="text-gray-500">{col.type}</span>
                                {col.primaryKey && <span className="text-xs bg-yellow-100 text-yellow-700 px-1 rounded">PK</span>}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Folder actions details */}
                  {action.type === 'folders' && (
                    <div className="space-y-2">
                      {action.details.map((folder, i) => (
                        <div key={i} className="flex items-center gap-2 p-2 bg-white rounded">
                          <FolderIcon />
                          <span className="font-mono text-sm text-gray-700">{folder.fullPath}</span>
                          {folder.purpose && (
                            <span className="text-xs text-gray-500">- {folder.purpose}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {action.warning && (
                <div className="p-3 bg-amber-50 border-t border-amber-100 text-sm text-amber-700">
                  {action.warning}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Warnings */}
        {preview.warnings && preview.warnings.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <h4 className="font-medium text-amber-800 mb-2">Warnings</h4>
            <ul className="space-y-1">
              {preview.warnings.map((warning, i) => (
                <li key={i} className="text-sm text-amber-700 flex items-start gap-2">
                  <span>-</span> {warning}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between p-6 bg-gray-50 rounded-xl border border-gray-200">
          <button
            onClick={() => setStep('destination')}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            ← Back to Destination
          </button>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-gray-500">Token expires in</p>
              <p className="font-medium text-gray-900">{preview.expiresInSeconds}s</p>
            </div>

            {/* Local execution is enabled (Phase B1) */}
            {destinationType === 'local' ? (
              <button
                onClick={() => setShowConfirmModal(true)}
                disabled={executing}
                className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RocketIcon />
                {t('preview.executeImplementation', 'Execute Implementation')}
              </button>
            ) : (
              <button
                disabled
                className="inline-flex items-center gap-2 px-6 py-3 bg-gray-300 text-gray-500 font-medium rounded-lg cursor-not-allowed"
                title="Only local execution is enabled"
              >
                <RocketIcon />
                {t('preview.executeImplementation', 'Execute Implementation')}
                <span className="text-xs bg-gray-400 text-white px-2 py-0.5 rounded-full ml-2">
                  Coming Soon
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Render executing step (progress)
  const renderExecutingStep = () => (
    <div className="space-y-6">
      {/* Execution Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-100 rounded-full">
            <LoadingSpinner size="lg" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-blue-800">
              {t('execution.inProgress', 'Execution in Progress')}
            </h3>
            <p className="text-blue-600 mt-1">
              {progress?.currentStep || 'Starting execution...'}
            </p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium text-gray-900">Progress</span>
          <span className="text-sm text-gray-600">{progress?.progress || 0}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div
            className="bg-blue-600 h-4 rounded-full transition-all duration-300"
            style={{ width: `${progress?.progress || 0}%` }}
          />
        </div>

        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">
              {progress?.filesProcessed || 0} / {progress?.filesTotal || 0}
            </div>
            <div className="text-sm text-gray-600">Files</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">
              {formatBytes(progress?.bytesWritten || 0)}
            </div>
            <div className="text-sm text-gray-600">Written</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">
              {progress?.status || 'running'}
            </div>
            <div className="text-sm text-gray-600">Status</div>
          </div>
        </div>
      </div>

      <div className="text-center text-gray-500 text-sm">
        Do not close this page while execution is in progress.
      </div>
    </div>
  );

  // Render completed step
  const renderCompletedStep = () => (
    <div className="space-y-6">
      {/* Success Banner */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-green-100 rounded-full text-green-600">
            <CheckIcon />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-green-800">
              {t('execution.completed', 'Execution Completed Successfully!')}
            </h3>
            <p className="text-green-600 mt-1">
              All files have been written to your local filesystem.
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h4 className="font-medium text-gray-900 mb-4">Execution Summary</h4>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {progress?.filesProcessed || 0}
            </div>
            <div className="text-sm text-gray-600">Files Written</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {formatBytes(progress?.bytesWritten || 0)}
            </div>
            <div className="text-sm text-gray-600">Total Size</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {formatDuration(progress?.durationMs)}
            </div>
            <div className="text-sm text-gray-600">Duration</div>
          </div>
        </div>

        {progress?.manifestPath && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <span className="text-sm text-blue-700">
              <strong>Manifest:</strong> {progress.manifestPath}
            </span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-center gap-4">
        <button
          onClick={() => navigate('/app/runs')}
          className="px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
        >
          Back to Runs
        </button>
        {progress?.canRollback && (
          <button
            onClick={handleRollback}
            disabled={loading}
            className="px-6 py-3 bg-red-100 text-red-700 font-medium rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
          >
            {loading ? 'Rolling back...' : 'Rollback Execution'}
          </button>
        )}
      </div>
    </div>
  );

  // Render failed step
  const renderFailedStep = () => (
    <div className="space-y-6">
      {/* Error Banner */}
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-red-100 rounded-full text-red-600">
            <XIcon />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-red-800">
              {t('execution.failed', 'Execution Failed')}
            </h3>
            <p className="text-red-600 mt-1">
              {error || 'An error occurred during execution.'}
            </p>
          </div>
        </div>
      </div>

      {/* Partial Progress */}
      {progress && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h4 className="font-medium text-gray-900 mb-4">Partial Execution</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                {progress.filesProcessed || 0} / {progress.filesTotal || 0}
              </div>
              <div className="text-sm text-gray-600">Files Processed</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                {formatBytes(progress.bytesWritten || 0)}
              </div>
              <div className="text-sm text-gray-600">Bytes Written</div>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-center gap-4">
        <button
          onClick={() => navigate('/app/runs')}
          className="px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
        >
          Back to Runs
        </button>
        {progress?.canRollback && (
          <button
            onClick={handleRollback}
            disabled={loading}
            className="px-6 py-3 bg-amber-100 text-amber-700 font-medium rounded-lg hover:bg-amber-200 transition-colors disabled:opacity-50"
          >
            {loading ? 'Rolling back...' : 'Rollback Partial Execution'}
          </button>
        )}
        <button
          onClick={() => {
            setStep('preview');
            setError(null);
          }}
          className="px-6 py-3 bg-blue-100 text-blue-700 font-medium rounded-lg hover:bg-blue-200 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );

  // Confirmation Modal
  const renderConfirmModal = () => {
    if (!showConfirmModal) return null;

    const CONFIRM_TEXT = 'EXECUTE';

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-amber-100 rounded-full text-amber-600">
              <AlertIcon />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Confirm Execution
            </h3>
          </div>

          <div className="space-y-4">
            <p className="text-gray-600">
              This will write files to your local filesystem. This action can be rolled back if needed.
            </p>

            <div className="bg-gray-50 rounded-lg p-4 text-sm">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Files to write:</span>
                <span className="font-medium">{preview?.summary?.totalFiles || 0}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Total size:</span>
                <span className="font-medium">{preview?.summary?.totalSizeFormatted}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Destination:</span>
                <span className="font-medium">{preview?.destination?.label}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type <span className="font-mono bg-gray-100 px-1">{CONFIRM_TEXT}</span> to confirm:
              </label>
              <input
                type="text"
                value={confirmInput}
                onChange={(e) => setConfirmInput(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={CONFIRM_TEXT}
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => {
                setShowConfirmModal(false);
                setConfirmInput('');
              }}
              className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleExecute}
              disabled={confirmInput !== CONFIRM_TEXT}
              className="flex-1 px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Execute
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Determine current mode for header
  const isWriteMode = step === 'executing' || step === 'completed' || step === 'failed';
  const getStepTitle = () => {
    switch (step) {
      case 'executing': return t('execution.title', 'Executing Implementation');
      case 'completed': return t('execution.completedTitle', 'Implementation Complete');
      case 'failed': return t('execution.failedTitle', 'Implementation Failed');
      default: return t('preview.title', 'Implementation Preview');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            {!isWriteMode && (
              <button
                onClick={() => navigate(`/app/runs/${runId}/plan`)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <RocketIcon />
              {getStepTitle()}
            </h1>
            {!isWriteMode ? (
              <span className="px-3 py-1 text-sm font-medium bg-amber-100 text-amber-700 rounded-full">
                SAFE MODE
              </span>
            ) : step === 'executing' ? (
              <span className="px-3 py-1 text-sm font-medium bg-blue-100 text-blue-700 rounded-full">
                WRITE MODE
              </span>
            ) : step === 'completed' ? (
              <span className="px-3 py-1 text-sm font-medium bg-green-100 text-green-700 rounded-full">
                COMPLETED
              </span>
            ) : (
              <span className="px-3 py-1 text-sm font-medium bg-red-100 text-red-700 rounded-full">
                FAILED
              </span>
            )}
          </div>
          <p className="text-gray-600 ml-12">
            {isWriteMode
              ? t('execution.subtitle', 'Writing data to your local filesystem')
              : t('preview.subtitle', 'Preview what will happen when you execute implementation')}
          </p>
        </div>

        {/* Steps indicator - only show for destination/preview steps */}
        {!isWriteMode && (
          <div className="flex items-center gap-4 mb-8">
            <div className={`flex items-center gap-2 ${step === 'destination' ? 'text-blue-600' : 'text-gray-400'}`}>
              <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step === 'destination' ? 'bg-blue-100 text-blue-600' :
                step === 'preview' ? 'bg-green-100 text-green-600' : 'bg-gray-100'
              }`}>
                {step !== 'destination' ? <CheckIcon /> : '1'}
              </span>
              <span className="font-medium">Select Destination</span>
            </div>
            <div className="flex-1 h-0.5 bg-gray-200" />
            <div className={`flex items-center gap-2 ${step === 'preview' ? 'text-blue-600' : 'text-gray-400'}`}>
              <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step === 'preview' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100'
              }`}>
                2
              </span>
              <span className="font-medium">Review Preview</span>
            </div>
          </div>
        )}

        {/* Content */}
        {step === 'destination' && renderDestinationStep()}
        {step === 'preview' && renderPreviewStep()}
        {step === 'executing' && renderExecutingStep()}
        {step === 'completed' && renderCompletedStep()}
        {step === 'failed' && renderFailedStep()}
      </div>

      {/* Confirmation Modal */}
      {renderConfirmModal()}
    </div>
  );
}
