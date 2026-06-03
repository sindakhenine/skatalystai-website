/**
 * Google Drive Wizard - 4-Phase Ingestion Flow
 *
 * Follows the strict 4-phase ingestion UX pattern:
 * 1. EXPLAIN - Tell user what they're about to do
 * 2. VISUAL GUIDANCE - Show what the Google popup will look like
 * 3. ACTION - OAuth redirect to Google
 * 4. CONFIRMATION - Confirm scope + budget
 *
 * OAuth is the SINGLE SOURCE OF TRUTH for account identity.
 */

import { useState, useEffect, useCallback } from 'react';

// Icons
const Icons = {
  GoogleDrive: () => (
    <svg className="w-8 h-8" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M12 11L7.5 3h9l-4.5 8z"/>
      <path fill="#34A853" d="M7.5 3L3 11l4.5 8h9l-4.5-8-4.5 8"/>
      <path fill="#FBBC05" d="M3 11l4.5 8h9l-4.5-8H3z"/>
      <path fill="#EA4335" d="M16.5 3h-9l4.5 8 4.5-8z"/>
    </svg>
  ),
  Google: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  ),
  Shield: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  Eye: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ),
  Check: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  ExternalLink: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
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
  File: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  Info: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Warning: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  ArrowRight: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
    </svg>
  ),
};

// Format bytes utility
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Phase indicator component
function PhaseIndicator({ currentPhase, phases }) {
  return (
    <div className="flex gap-2 mt-4">
      {phases.map((phase, i) => (
        <div
          key={phase}
          className={`h-1.5 flex-1 rounded-full transition-colors ${
            i <= currentPhase ? 'bg-slate' : 'bg-gray-200'
          }`}
        />
      ))}
    </div>
  );
}

// Google popup preview component (visual guidance)
function GooglePopupPreview() {
  return (
    <div className="relative" data-tour="google-drive-popup-preview">
      {/* Browser frame */}
      <div className="bg-gray-100 rounded-t-lg px-3 py-2 flex items-center gap-2 border border-gray-200 border-b-0">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-400" />
          <div className="w-3 h-3 rounded-full bg-yellow-400" />
          <div className="w-3 h-3 rounded-full bg-green-400" />
        </div>
        <div className="flex-1 bg-white rounded px-3 py-1 text-xs text-gray-500 truncate">
          accounts.google.com
        </div>
      </div>

      {/* Google login content */}
      <div className="bg-white border border-gray-200 rounded-b-lg p-6">
        <div className="max-w-xs mx-auto">
          {/* Google logo */}
          <div className="flex justify-center mb-6">
            <Icons.Google />
          </div>

          {/* Sign in header */}
          <h3 className="text-xl font-semibold text-gray-900 text-center mb-2">
            Sign in
          </h3>
          <p className="text-sm text-gray-500 text-center mb-6">
            to continue to Skatalyst
          </p>

          {/* Mock account selector */}
          <div className="space-y-2 mb-6">
            <div className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-sm font-medium text-blue-600">JD</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">john.doe@gmail.com</p>
                <p className="text-xs text-gray-500">Personal account</p>
              </div>
            </div>
            <div className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <span className="text-sm font-medium text-green-600">JD</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">john@company.com</p>
                <p className="text-xs text-gray-500">Google Workspace</p>
              </div>
            </div>
          </div>

          {/* Use another account */}
          <button className="w-full text-sm text-blue-600 hover:underline">
            Use another account
          </button>
        </div>
      </div>

      {/* Overlay indicator */}
      <div className="absolute -top-3 -right-3 bg-slate text-white text-xs px-2 py-1 rounded-full shadow-lg">
        Preview
      </div>
    </div>
  );
}

// Folder selector component
function FolderSelector({ folders, selectedFolders, onToggle, checkSelected }) {
  if (!folders || folders.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">
        <Icons.Folder className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>No folders available</p>
      </div>
    );
  }

  return (
    <div className="space-y-2" data-tour="google-drive-folder-select">
      {folders.map((folder) => {
        // Use checkSelected function if provided, otherwise fall back to array includes
        const isSelected = checkSelected ? checkSelected(folder.id) : selectedFolders.some(f => f.id === folder.id);
        return (
          <button
            key={folder.id}
            onClick={() => onToggle(folder.id)}
            className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all ${
              isSelected
                ? 'border-slate/40 bg-slate/5'
                : 'border-gray-200 hover:border-slate/30'
            }`}
          >
            <div className={`p-1.5 rounded ${isSelected ? 'bg-slate text-white' : 'bg-gray-100 text-gray-500'}`}>
              {isSelected ? <Icons.FolderOpen /> : <Icons.Folder />}
            </div>
            <div className="flex-1 text-left">
              <p className="font-medium text-gray-900">{folder.name}</p>
              {folder.mimeType && (
                <p className="text-xs text-gray-500">
                  {folder.mimeType === 'application/vnd.google-apps.folder' ? 'Folder' : 'File'}
                </p>
              )}
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

// Scan preview component
function ScanPreview({ preview, isLoading }) {
  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <div className="w-8 h-8 border-2 border-slate border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-500">Calculating estimates...</p>
      </div>
    );
  }

  if (!preview) {
    return (
      <div className="p-6 text-center text-gray-500">
        <p>Select folders to see scan preview</p>
      </div>
    );
  }

  return (
    <div className="space-y-4" data-tour="google-drive-preview">
      {/* Estimates */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 bg-gray-50 rounded-lg text-center border border-gray-100">
          <p className="text-xl font-bold text-slate">{preview.estimates?.totalItems || 0}</p>
          <p className="text-xs text-gray-500">Files</p>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg text-center border border-gray-100">
          <p className="text-xl font-bold text-slate">{preview.estimates?.folders || 0}</p>
          <p className="text-xs text-gray-500">Folders</p>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg text-center border border-gray-100">
          <p className="text-xl font-bold text-slate">{preview.estimates?.totalBytesFormatted || formatBytes(preview.estimates?.totalBytes || 0)}</p>
          <p className="text-xs text-gray-500">Total Size</p>
        </div>
      </div>

      {/* Budget status */}
      {preview.budget && (
        <div className={`p-3 rounded-lg border ${
          preview.budget.withinBudget
            ? 'bg-green-50 border-green-200'
            : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-center gap-2">
            {preview.budget.withinBudget ? (
              <>
                <span className="text-green-600"><Icons.Check /></span>
                <span className="text-sm font-medium text-green-700">Within budget limits</span>
              </>
            ) : (
              <>
                <span className="text-red-600"><Icons.Warning /></span>
                <span className="text-sm font-medium text-red-700">
                  Would exceed {preview.budget.exceededType} limit
                </span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Sample files */}
      {preview.sampleFiles?.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Sample Files</h4>
          <div className="bg-gray-50 rounded-lg divide-y divide-gray-100 border border-gray-200">
            {preview.sampleFiles.slice(0, 4).map((file, i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-2">
                <span className="text-gray-400"><Icons.File /></span>
                <span className="flex-1 text-sm text-gray-900 truncate">{file.name}</span>
                <span className="text-xs text-gray-500">{formatBytes(file.size || 0)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Context display */}
      {preview.context && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="text-sm font-medium text-blue-800 mb-1">Source Context</h4>
          <p className="text-xs text-blue-700">
            Provider: {preview.context.source?.provider || 'Google Drive'} |
            Read-only: Yes |
            Objects: {preview.context.source?.objectTypes?.join(', ') || 'files, folders'}
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * Main Google Drive Wizard Component - 4-Phase Flow
 */
export default function GoogleDriveWizard({ onComplete, onCancel, authFetch: propAuthFetch, existingConnector }) {
  // Phases: explain, visual-guide, oauth, confirm, folders, preview
  // If existingConnector is provided, skip to 'confirm' phase (OAuth already done)
  const [phase, setPhase] = useState(existingConnector ? 'confirm' : 'explain');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // OAuth/account state
  const [connectedAccount, setConnectedAccount] = useState(
    existingConnector ? { email: existingConnector.email, name: existingConnector.email } : null
  );
  const [connectorId, setConnectorId] = useState(existingConnector?.id || null);

  // Folder selection state
  const [folders, setFolders] = useState([]);
  const [selectedFolders, setSelectedFolders] = useState([]);
  const [preview, setPreview] = useState(null);
  const [confirmed, setConfirmed] = useState(false);

  // Use provided authFetch or fallback to regular fetch
  const authFetch = propAuthFetch || ((url, options = {}) => {
    return fetch(`/api${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include',
    });
  });

  // Phase labels for indicator
  const phaseLabels = ['explain', 'visual-guide', 'oauth', 'confirm', 'folders', 'preview'];
  const currentPhaseIndex = phaseLabels.indexOf(phase);

  // Start OAuth flow
  const startOAuth = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Create connector first to get connectorId
      const createRes = await authFetch('/connectors/enterprise', {
        method: 'POST',
        body: JSON.stringify({
          enterpriseType: 'googledrive',
          displayName: 'My Google Drive',
          scopeConfig: {},
          budgetConfig: {
            max_bytes: 1073741824, // 1 GB
            max_rows: 100000,
            max_cost_usd: 10.0,
            warn_at_percent: 80,
          },
        }),
      });

      if (!createRes.ok) {
        const data = await createRes.json();
        throw new Error(data.error || 'Failed to create connector');
      }

      const connector = await createRes.json();
      setConnectorId(connector.id);

      // Get OAuth URL
      const authRes = await authFetch(`/connectors/googledrive/${connector.id}/auth-url`);

      if (!authRes.ok) {
        throw new Error('Failed to get authorization URL');
      }

      const { url, isPlaceholder, message } = await authRes.json();

      if (isPlaceholder) {
        // Preview mode - simulate OAuth completion
        console.log('[GoogleDrive] Preview mode:', message);

        setConnectedAccount({
          email: 'preview@gmail.com',
          name: 'Preview User',
          isPreview: true,
        });
        setPhase('confirm');
      } else {
        // Real OAuth - redirect to Google
        window.location.href = url;
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OAuth callback (check URL for code parameter)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');

    if (code && state && state.includes('googledrive')) {
      handleOAuthCallback(code, state);
    }
  }, []);

  const handleOAuthCallback = async (code, state) => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await authFetch('/connectors/googledrive/callback', {
        method: 'POST',
        body: JSON.stringify({ code, state }),
      });

      if (!res.ok) {
        throw new Error('OAuth callback failed');
      }

      const data = await res.json();

      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);

      setConnectedAccount({
        email: data.email || data.account?.email,
        name: data.name || data.account?.name,
        isPreview: data.isPreview,
      });
      setConnectorId(data.connectorId);
      setPhase('confirm');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Load folders after account confirmed
  const loadFolders = useCallback(async () => {
    if (!connectorId) {
      setError('No connector ID found. Please try reconnecting.');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const res = await authFetch(`/connectors/googledrive/${connectorId}/folders`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to load folders');
        return;
      }

      // Handle error response from connector service
      if (data.error) {
        setError(`${data.error.message || data.error}${data.error.action ? ` ${data.error.action}` : ''}`);
        return;
      }

      setFolders(data.folders || data.items || []);
    } catch (err) {
      console.error('Failed to load Google Drive folders:', err);
      setError('Failed to load folders. Please try reconnecting.');
    } finally {
      setIsLoading(false);
    }
  }, [connectorId, authFetch]);

  // Load preview when folders selected
  const loadPreview = useCallback(async () => {
    if (!connectorId || selectedFolders.length === 0) {
      setPreview(null);
      return;
    }

    setIsLoading(true);
    try {
      // Get preview
      const res = await authFetch(`/connectors/googledrive/${connectorId}/preview-scan`, {
        method: 'POST',
        body: JSON.stringify({ folders: selectedFolders }),
      });

      if (res.ok) {
        const data = await res.json();
        setPreview(data);
      }
    } catch (err) {
      console.error('Preview error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [connectorId, selectedFolders, authFetch]);

  // Toggle folder selection - store full folder objects, not just IDs
  const toggleFolder = (folderId) => {
    setSelectedFolders((prev) => {
      const exists = prev.some(f => f.id === folderId);
      if (exists) {
        return prev.filter((f) => f.id !== folderId);
      } else {
        // Find the folder object from the folders list
        const folderObj = folders.find(f => f.id === folderId);
        if (folderObj) {
          return [...prev, { id: folderObj.id, name: folderObj.name }];
        }
        return prev;
      }
    });
  };

  // Check if a folder ID is selected
  const isFolderSelected = (folderId) => {
    return selectedFolders.some(f => f.id === folderId);
  };

  // Load folders when entering folders phase
  useEffect(() => {
    if (phase === 'folders' && connectorId) {
      loadFolders();
    }
  }, [phase, connectorId, loadFolders]);

  // Load preview when entering preview phase
  useEffect(() => {
    if (phase === 'preview' && connectorId) {
      loadPreview();
    }
  }, [phase, connectorId, loadPreview]);

  // Confirm and complete
  const confirmAndComplete = async () => {
    if (!confirmed) return;

    setIsLoading(true);
    try {
      // Call confirm endpoint to save folder selection and update status
      const res = await authFetch(`/connectors/googledrive/${connectorId}/confirm`, {
        method: 'POST',
        body: JSON.stringify({ folders: selectedFolders }),
      });

      if (!res.ok) {
        throw new Error('Failed to confirm folder selection');
      }

      onComplete?.({
        id: connectorId,
        type: 'googledrive',
        account: connectedAccount,
        folders: selectedFolders,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Render phase content
  const renderPhase = () => {
    switch (phase) {
      // PHASE 1: EXPLAIN
      case 'explain':
        return (
          <div className="space-y-6" data-tour="google-drive-explain">
            {/* Header */}
            <div className="text-center">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-slate/10 flex items-center justify-center text-slate mb-4">
                <Icons.GoogleDrive />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                Connect Google Drive
              </h2>
              <p className="text-gray-500 mt-2">
                Let's walk through what will happen next
              </p>
            </div>

            {/* What will happen */}
            <div className="bg-gray-50 rounded-xl p-5 space-y-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Icons.Info className="text-slate" />
                What happens when you connect?
              </h3>

              <div className="space-y-3 text-sm">
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-slate/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-slate">1</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Google popup appears</p>
                    <p className="text-gray-500">A Google sign-in window will open in your browser</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-slate/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-slate">2</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Choose your account</p>
                    <p className="text-gray-500">Select which Google account to connect (personal or Workspace)</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-slate/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-slate">3</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Grant read-only access</p>
                    <p className="text-gray-500">Skatalyst only requests permission to read files, never modify</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-slate/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-slate">4</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Return here to select folders</p>
                    <p className="text-gray-500">After signing in, you'll choose exactly which folders to scan</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Security note */}
            <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
              <Icons.Shield className="text-green-600 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-green-800">Your data is protected</p>
                <p className="text-green-700">
                  Skatalyst uses OAuth 2.0 - we never see or store your password.
                  You can revoke access anytime from your Google Account settings.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={onCancel}
                className="flex-1 py-3 px-4 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setPhase('visual-guide')}
                className="flex-1 py-3 px-4 rounded-lg bg-slate text-white font-medium hover:bg-slate/90 transition-colors flex items-center justify-center gap-2"
              >
                Continue
                <Icons.ArrowRight />
              </button>
            </div>
          </div>
        );

      // PHASE 2: VISUAL GUIDANCE
      case 'visual-guide':
        return (
          <div className="space-y-6" data-tour="google-drive-visual-guide">
            {/* Header */}
            <div className="text-center">
              <div className="w-12 h-12 mx-auto rounded-xl bg-slate/10 flex items-center justify-center text-slate mb-3">
                <Icons.Eye />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                Here's what you'll see
              </h2>
              <p className="text-gray-500 mt-2">
                A Google sign-in popup will appear like this:
              </p>
            </div>

            {/* Google popup preview */}
            <GooglePopupPreview />

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Icons.Info className="text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium">Choose the account you want to connect</p>
                  <p className="mt-1">
                    Select your personal Gmail or Google Workspace account. If you have multiple accounts,
                    make sure you pick the one that has access to the files you want to scan.
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setPhase('explain')}
                className="flex-1 py-3 px-4 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => setPhase('oauth')}
                className="flex-1 py-3 px-4 rounded-lg bg-slate text-white font-medium hover:bg-slate/90 transition-colors flex items-center justify-center gap-2"
              >
                I'm ready, connect
                <Icons.ExternalLink />
              </button>
            </div>
          </div>
        );

      // PHASE 3: OAUTH ACTION
      case 'oauth':
        return (
          <div className="space-y-6" data-tour="google-drive-oauth">
            {/* Header */}
            <div className="text-center">
              <div className="w-12 h-12 mx-auto rounded-xl bg-slate/10 flex items-center justify-center text-slate mb-3">
                <Icons.Google />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                Connect to Google
              </h2>
              <p className="text-gray-500 mt-2">
                Click below to open the Google sign-in window
              </p>
            </div>

            {/* Main action */}
            <div className="bg-gray-50 rounded-xl p-6 text-center">
              {isLoading ? (
                <div className="py-4">
                  <div className="w-8 h-8 border-2 border-slate border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-gray-500">Opening Google sign-in...</p>
                </div>
              ) : (
                <>
                  <p className="text-sm text-gray-600 mb-4">
                    You'll be redirected to Google's secure login page.
                    After signing in, you'll return here automatically.
                  </p>
                  <button
                    onClick={startOAuth}
                    className="inline-flex items-center gap-3 px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors shadow-sm"
                  >
                    <Icons.Google />
                    Sign in with Google
                    <Icons.ExternalLink />
                  </button>
                </>
              )}
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 text-red-700">
                  <Icons.Warning />
                  <span className="text-sm font-medium">{error}</span>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setPhase('visual-guide')}
                disabled={isLoading}
                className="flex-1 py-3 px-4 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Back
              </button>
            </div>
          </div>
        );

      // PHASE 4: CONFIRMATION
      case 'confirm':
        return (
          <div className="space-y-6" data-tour="google-drive-confirm">
            {/* Success header */}
            <div className="text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center text-green-600 mb-4">
                <Icons.Check />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                Account Connected!
              </h2>
              <p className="text-gray-500 mt-2">
                Google Drive is now linked to Skatalyst
              </p>
            </div>

            {/* Connected account info */}
            <div className="bg-gray-50 rounded-xl p-5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-lg font-bold text-blue-600">
                    {connectedAccount?.name?.charAt(0) || connectedAccount?.email?.charAt(0) || '?'}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">
                    {connectedAccount?.name || 'Google Account'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {connectedAccount?.email || 'Connected'}
                  </p>
                  {connectedAccount?.isPreview && (
                    <span className="inline-block mt-1 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                      Preview Mode
                    </span>
                  )}
                </div>
                <div className="text-green-600">
                  <Icons.Check />
                </div>
              </div>
            </div>

            {/* What's next */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Icons.Info className="text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium">Next: Select folders to scan</p>
                  <p className="mt-1">
                    You'll choose exactly which folders Skatalyst should access.
                    We only scan what you explicitly select.
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={onCancel}
                className="flex-1 py-3 px-4 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setPhase('folders')}
                className="flex-1 py-3 px-4 rounded-lg bg-slate text-white font-medium hover:bg-slate/90 transition-colors flex items-center justify-center gap-2"
              >
                Select Folders
                <Icons.ArrowRight />
              </button>
            </div>
          </div>
        );

      // PHASE 5: FOLDER SELECTION
      case 'folders':
        return (
          <div className="space-y-6">
            {/* Header */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Select Folders
              </h2>
              <p className="text-gray-500 mt-1">
                Choose which folders to include in the scan
              </p>
            </div>

            {/* Connected account reminder */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <Icons.GoogleDrive className="text-slate" />
              <span className="text-sm text-gray-600">
                Connected as <span className="font-medium text-gray-900">{connectedAccount?.email}</span>
              </span>
            </div>

            {/* Error message */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-2 text-red-700">
                  <Icons.Warning className="flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-sm font-medium">{error}</span>
                    <p className="text-xs mt-1 text-red-600">
                      If this persists, try disconnecting and reconnecting your Google Drive.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Folder list */}
            <div className="max-h-64 overflow-y-auto">
              {isLoading && folders.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="w-8 h-8 border-2 border-slate border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-gray-500">Loading folders...</p>
                </div>
              ) : !error ? (
                <FolderSelector
                  folders={folders}
                  selectedFolders={selectedFolders}
                  onToggle={toggleFolder}
                  checkSelected={isFolderSelected}
                />
              ) : null}
            </div>

            {/* Selection summary */}
            {selectedFolders.length > 0 && (
              <div className="p-3 bg-slate/5 rounded-lg border border-slate/20">
                <p className="text-sm text-slate">
                  <span className="font-medium">{selectedFolders.length}</span> folder{selectedFolders.length !== 1 ? 's' : ''} selected
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setPhase('confirm')}
                className="flex-1 py-3 px-4 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => setPhase('preview')}
                disabled={selectedFolders.length === 0}
                className="flex-1 py-3 px-4 rounded-lg bg-slate text-white font-medium hover:bg-slate/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Preview Scan
              </button>
            </div>
          </div>
        );

      // PHASE 6: PREVIEW & CONFIRM
      case 'preview':
        return (
          <div className="space-y-6">
            {/* Header */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Review & Confirm
              </h2>
              <p className="text-gray-500 mt-1">
                Preview what will be scanned before confirming
              </p>
            </div>

            {/* Scan preview */}
            <ScanPreview preview={preview} isLoading={isLoading} />

            {/* Confirmation checkbox */}
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={confirmed}
                  onChange={(e) => setConfirmed(e.target.checked)}
                  className="mt-1 w-5 h-5 rounded border-gray-300 text-slate focus:ring-slate/20"
                />
                <span className="text-sm text-gray-700">
                  I confirm I want to scan these folders. I understand only the selected folders will be accessed.
                  {connectedAccount?.isPreview && (
                    <span className="block mt-1 text-amber-600">
                      Note: This is preview mode - no files will actually be downloaded.
                    </span>
                  )}
                </span>
              </label>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 text-red-700">
                  <Icons.Warning />
                  <span className="text-sm font-medium">{error}</span>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setPhase('folders')}
                disabled={isLoading}
                className="flex-1 py-3 px-4 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Back
              </button>
              <button
                onClick={confirmAndComplete}
                disabled={!confirmed || isLoading || (preview && !preview.budget?.withinBudget)}
                className="flex-1 py-3 px-4 rounded-lg bg-slate text-white font-medium hover:bg-slate/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Confirming...' : 'Confirm & Connect'}
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/50" onClick={onCancel} />
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg">
          {/* Header */}
          <div className="border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate/10 rounded-xl text-slate">
                  <Icons.GoogleDrive />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">Google Drive</h2>
                  <p className="text-xs text-gray-500">Cloud Storage Connector</p>
                </div>
              </div>
              <button
                onClick={onCancel}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Phase indicator */}
            <PhaseIndicator currentPhase={currentPhaseIndex} phases={phaseLabels} />
          </div>

          {/* Content */}
          <div className="p-6">
            {renderPhase()}
          </div>
        </div>
      </div>
    </div>
  );
}
