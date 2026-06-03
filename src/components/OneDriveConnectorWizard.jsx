/**
 * OneDrive Connector Wizard (PREVIEW)
 *
 * OneDrive-specific wizard that integrates with the enterprise connector framework.
 * Shows mock folder selection and preview indicators.
 *
 * Per TASK3_CHECKLIST.md Section 3.1: OneDrive Connector
 *
 * WARNING: This is a PREVIEW connector.
 * - OAuth flow is placeholder only
 * - Folder list is mocked
 * - No files are downloaded
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';

// Icons
const Icons = {
  OneDrive: () => (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.5 6c2.3 0 4.3 1.6 4.9 3.8.1.4.2.8.2 1.2 0 .1 0 .3-.1.4 1.7.4 3 1.9 3 3.6 0 2.1-1.7 3.8-3.8 3.8H7.8c-2.1 0-3.8-1.7-3.8-3.8 0-1.8 1.2-3.3 2.9-3.7-.1-.2-.1-.5-.1-.7 0-2.5 2-4.6 4.5-4.6h1.2z"/>
    </svg>
  ),
  Folder: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
    </svg>
  ),
  FolderOpen: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
    </svg>
  ),
  Check: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  Warning: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  Info: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Eye: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ),
  File: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
};

// Preview banner component - uses slate/gray (dashboard DNA)
function PreviewBanner() {
  return (
    <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-xl">
      <div className="flex items-start gap-3">
        <div className="p-1.5 bg-slate/10 text-slate rounded-lg">
          <Icons.Eye />
        </div>
        <div>
          <h4 className="font-semibold text-gray-900">
            Preview Connector
          </h4>
          <p className="text-sm text-gray-600 mt-1">
            This is a preview connector. <strong>No files are downloaded yet.</strong>
            {' '}Folder list and estimates are simulated for demonstration.
          </p>
        </div>
      </div>
    </div>
  );
}

// Format bytes
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Folder selection component - uses slate (dashboard DNA)
function FolderSelector({ folders, selectedFolders, onToggle }) {
  return (
    <div className="space-y-2">
      {folders.map((folder) => {
        const isSelected = selectedFolders.includes(folder.path);

        return (
          <button
            key={folder.id}
            onClick={() => onToggle(folder.path)}
            className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all ${
              isSelected
                ? 'border-slate/40 bg-slate/5'
                : 'border-gray-200 hover:border-slate/30'
            }`}
          >
            <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-slate text-white' : 'bg-gray-100 text-gray-500'}`}>
              {isSelected ? <Icons.FolderOpen /> : <Icons.Folder />}
            </div>
            <div className="flex-1 text-left">
              <p className="font-medium text-gray-900">
                {folder.name}
              </p>
              <p className="text-xs text-gray-500">
                {folder.childCount} items · {formatBytes(folder.size)}
              </p>
            </div>
            {isSelected && (
              <div className="text-slate">
                <Icons.Check />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}

// Scan preview component - uses slate/gray (dashboard DNA)
function ScanPreview({ preview, isLoading }) {
  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <div className="w-8 h-8 border-2 border-slate border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-500">
          Generating preview...
        </p>
      </div>
    );
  }

  if (!preview) {
    return (
      <div className="p-8 text-center text-gray-500">
        <p>Select folders above to see a preview of what will be scanned.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Estimates */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 bg-gray-50 rounded-lg text-center border border-gray-100">
          <p className="text-2xl font-bold text-slate">{preview.estimates.totalItems}</p>
          <p className="text-sm text-gray-500">Files</p>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg text-center border border-gray-100">
          <p className="text-2xl font-bold text-slate">{preview.estimates.folders}</p>
          <p className="text-sm text-gray-500">Folders</p>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg text-center border border-gray-100">
          <p className="text-2xl font-bold text-slate">{preview.estimates.totalBytesFormatted}</p>
          <p className="text-sm text-gray-500">Total Size</p>
        </div>
      </div>

      {/* Budget status */}
      {preview.budget && (
        <div className={`p-4 rounded-lg border ${
          preview.budget.withinBudget
            ? 'bg-success-bg border-success/20'
            : 'bg-error-bg border-error/20'
        }`}>
          <div className="flex items-center gap-2">
            {preview.budget.withinBudget ? (
              <>
                <Icons.Check />
                <span className="font-medium text-success">Within budget limits</span>
              </>
            ) : (
              <>
                <Icons.Warning />
                <span className="font-medium text-error">
                  Would exceed {preview.budget.exceededType} limit
                </span>
              </>
            )}
          </div>
          <div className="mt-2 text-sm text-gray-500">
            Data: {Math.round(preview.budget.percentUsed.bytes)}% ·
            Cost: {Math.round(preview.budget.percentUsed.costUsd)}%
          </div>
        </div>
      )}

      {/* Warnings */}
      {preview.warnings?.length > 0 && (
        <div className="p-3 bg-warning-bg border border-warning/20 rounded-lg">
          <div className="flex items-start gap-2">
            <Icons.Warning />
            <div className="text-sm text-warning">
              {preview.warnings.map((w, i) => (
                <p key={i}>{w}</p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sample files */}
      {preview.sampleFiles?.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-2">
            Sample Files (Preview)
          </h4>
          <div className="bg-gray-50 rounded-lg divide-y divide-gray-100 border border-gray-200">
            {preview.sampleFiles.map((file, i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-2">
                <Icons.File />
                <span className="flex-1 text-sm text-gray-700 truncate">
                  {file.name}
                </span>
                <span className="text-xs text-gray-500">
                  {formatBytes(file.size)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No files downloaded message */}
      <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="flex items-center gap-2 text-slate">
          <Icons.Info />
          <span className="text-sm font-medium">No files are downloaded yet</span>
        </div>
        <p className="text-xs text-gray-500 mt-1 ml-7">
          This preview shows estimates only. Actual file access requires OAuth authentication.
        </p>
      </div>
    </div>
  );
}

// Main OneDrive Wizard Component
export default function OneDriveConnectorWizard({
  projectId = 'default', // Default project ID if not provided
  connectorId = null, // If provided, editing existing connector
  onComplete,
  onCancel,
}) {
  const { t } = useTranslation();
  const { authFetch } = useAuth();

  // State
  const [step, setStep] = useState(connectorId ? 'folders' : 'create');
  const [displayName, setDisplayName] = useState('My OneDrive');
  const [folders, setFolders] = useState([]);
  const [selectedFolders, setSelectedFolders] = useState([]);
  const [preview, setPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState(null);
  const [currentConnectorId, setCurrentConnectorId] = useState(connectorId);
  const [confirmed, setConfirmed] = useState(false);

  // Load folders when we have a connector
  const loadFolders = useCallback(async () => {
    if (!currentConnectorId) return;

    setIsLoading(true);
    try {
      const response = await authFetch(`/connectors/onedrive/${currentConnectorId}/folders`);
      if (response.ok) {
        const data = await response.json();
        setFolders(data.folders || []);
      }
    } catch (err) {
      setError('Failed to load folders');
    } finally {
      setIsLoading(false);
    }
  }, [currentConnectorId, authFetch]);

  // Load preview when folders change
  const loadPreview = useCallback(async () => {
    if (!currentConnectorId || selectedFolders.length === 0) {
      setPreview(null);
      return;
    }

    setIsLoading(true);
    try {
      // First update scope
      await authFetch(`/connectors/onedrive/${currentConnectorId}/scope`, {
        method: 'PUT',
        body: JSON.stringify({ folders: selectedFolders }),
      });

      // Then get preview
      const response = await authFetch(`/connectors/onedrive/${currentConnectorId}/preview-scan`, {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        setPreview(data);
      }
    } catch (err) {
      console.error('Preview error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [currentConnectorId, selectedFolders, authFetch]);

  // Create connector
  const createConnector = async () => {
    setIsCreating(true);
    setError(null);

    try {
      const response = await authFetch('/connectors/enterprise', {
        method: 'POST',
        body: JSON.stringify({
          projectId,
          enterpriseType: 'onedrive',
          displayName,
          scopeConfig: {},
          budgetConfig: {
            max_bytes: 1073741824, // 1 GB
            max_rows: 100000,
            max_cost_usd: 10.0,
            warn_at_percent: 80,
          },
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create connector');
      }

      const connector = await response.json();
      setCurrentConnectorId(connector.id);
      setStep('folders');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsCreating(false);
    }
  };

  // Confirm and complete
  const confirmAndComplete = async () => {
    if (!confirmed) return;

    setIsCreating(true);
    try {
      const response = await authFetch(`/connectors/onedrive/${currentConnectorId}/confirm`, {
        method: 'POST',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to confirm');
      }

      const result = await response.json();
      onComplete(result.connector);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsCreating(false);
    }
  };

  // Toggle folder selection
  const toggleFolder = (path) => {
    setSelectedFolders((prev) =>
      prev.includes(path)
        ? prev.filter((p) => p !== path)
        : [...prev, path]
    );
  };

  // Load folders when step changes
  useEffect(() => {
    if (step === 'folders' && currentConnectorId) {
      loadFolders();
    }
  }, [step, currentConnectorId, loadFolders]);

  // Load preview when selection changes
  useEffect(() => {
    if (step === 'preview' && currentConnectorId) {
      loadPreview();
    }
  }, [step, currentConnectorId, loadPreview]);

  // Render based on step
  const renderStep = () => {
    switch (step) {
      case 'create':
        return (
          <div>
            <PreviewBanner />

            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-gray-100 rounded-xl text-slate">
                <Icons.OneDrive />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Connect Microsoft OneDrive
                </h3>
                <p className="text-sm text-gray-500">
                  Preview mode - mock data only
                </p>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Connector Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="My OneDrive"
                className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-slate/20 focus:border-slate transition-colors"
              />
            </div>

            {error && (
              <div className="mb-4 p-3 bg-error-bg border border-error/20 rounded-lg text-error text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={onCancel}
                className="flex-1 py-3 px-4 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createConnector}
                disabled={!displayName || isCreating}
                className="flex-1 py-3 px-4 rounded-lg bg-slate text-white font-medium hover:bg-slate/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isCreating ? 'Creating...' : 'Continue'}
              </button>
            </div>
          </div>
        );

      case 'folders':
        return (
          <div>
            <PreviewBanner />

            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Select Folders
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Choose which folders to include in the scan. (Mock data for preview)
            </p>

            {isLoading && folders.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-8 h-8 border-2 border-slate border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              </div>
            ) : (
              <FolderSelector
                folders={folders}
                selectedFolders={selectedFolders}
                onToggle={toggleFolder}
              />
            )}

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setStep('create')}
                className="flex-1 py-3 px-4 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => setStep('preview')}
                disabled={selectedFolders.length === 0}
                className="flex-1 py-3 px-4 rounded-lg bg-slate text-white font-medium hover:bg-slate/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Preview Scan
              </button>
            </div>
          </div>
        );

      case 'preview':
        return (
          <div>
            <PreviewBanner />

            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Scan Preview
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Review what will be scanned before confirming.
            </p>

            <ScanPreview preview={preview} isLoading={isLoading} />

            {/* Confirmation checkbox */}
            <div className="mt-6 p-4 border border-gray-200 bg-gray-50 rounded-lg">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={confirmed}
                  onChange={(e) => setConfirmed(e.target.checked)}
                  className="mt-1 w-5 h-5 rounded border-gray-300 text-slate focus:ring-slate/20"
                />
                <span className="text-sm text-gray-700">
                  I understand this is a <strong>preview connector</strong>.
                  No files will be downloaded until OAuth is configured with production credentials.
                </span>
              </label>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-error-bg border border-error/20 rounded-lg text-error text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setStep('folders')}
                className="flex-1 py-3 px-4 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                onClick={confirmAndComplete}
                disabled={!confirmed || isCreating || (preview && !preview.budget?.withinBudget)}
                className="flex-1 py-3 px-4 rounded-lg bg-slate text-white font-medium hover:bg-slate/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isCreating ? 'Confirming...' : 'Confirm & Create'}
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      {renderStep()}
    </div>
  );
}
