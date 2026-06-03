/**
 * Dropbox Wizard - 4-Phase Ingestion Flow
 *
 * Follows the strict 4-phase ingestion UX pattern:
 * 1. EXPLAIN - Tell user what they're about to do
 * 2. VISUAL GUIDANCE - Show what the Dropbox popup will look like
 * 3. ACTION - OAuth redirect to Dropbox
 * 4. CONFIRMATION - Confirm scope + budget
 *
 * OAuth is the SINGLE SOURCE OF TRUTH for account identity.
 */

import { useState, useEffect, useCallback } from 'react';

// Icons
const Icons = {
  Dropbox: () => (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="#0061FF">
      <path d="M6 2l6 3.75L6 9.5 0 5.75 6 2zm12 0l6 3.75-6 3.75-6-3.75L18 2zM0 13.25L6 9.5l6 3.75-6 3.75-6-3.75zm18-3.75l6 3.75-6 3.75-6-3.75 6-3.75zM6 18.25l6-3.75 6 3.75-6 3.75-6-3.75z"/>
    </svg>
  ),
  DropboxSmall: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#0061FF">
      <path d="M6 2l6 3.75L6 9.5 0 5.75 6 2zm12 0l6 3.75-6 3.75-6-3.75L18 2zM0 13.25L6 9.5l6 3.75-6 3.75-6-3.75zm18-3.75l6 3.75-6 3.75-6-3.75 6-3.75zM6 18.25l6-3.75 6 3.75-6 3.75-6-3.75z"/>
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

// Dropbox popup preview component (visual guidance)
function DropboxPopupPreview() {
  return (
    <div className="relative" data-tour="dropbox-popup-preview">
      {/* Browser frame */}
      <div className="bg-gray-100 rounded-t-lg px-3 py-2 flex items-center gap-2 border border-gray-200 border-b-0">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-400" />
          <div className="w-3 h-3 rounded-full bg-yellow-400" />
          <div className="w-3 h-3 rounded-full bg-green-400" />
        </div>
        <div className="flex-1 bg-white rounded px-3 py-1 text-xs text-gray-500 truncate">
          www.dropbox.com/oauth2/authorize
        </div>
      </div>

      {/* Dropbox login content */}
      <div className="bg-white border border-gray-200 rounded-b-lg p-6">
        <div className="max-w-xs mx-auto">
          {/* Dropbox logo */}
          <div className="flex justify-center mb-6">
            <Icons.DropboxSmall />
          </div>

          {/* Sign in header */}
          <h3 className="text-xl font-semibold text-gray-900 text-center mb-2">
            Sign in to Dropbox
          </h3>
          <p className="text-sm text-gray-500 text-center mb-6">
            to connect with Skatalyst
          </p>

          {/* Mock email input */}
          <div className="space-y-4 mb-6">
            <div className="border border-gray-300 rounded-lg px-4 py-3">
              <p className="text-sm text-gray-400">Email</p>
            </div>
            <button className="w-full py-3 bg-[#0061FF] text-white rounded-lg font-medium">
              Continue
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">or</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Social buttons */}
          <div className="space-y-2">
            <button className="w-full py-2.5 border border-gray-300 rounded-lg text-sm flex items-center justify-center gap-2 hover:bg-gray-50">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>
            <button className="w-full py-2.5 border border-gray-300 rounded-lg text-sm flex items-center justify-center gap-2 hover:bg-gray-50">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#000">
                <path d="M16.365 1.43c0 1.14-.493 2.27-1.177 3.08-.744.9-1.99 1.57-2.987 1.57-.12 0-.23-.02-.3-.03-.01-.06-.04-.22-.04-.39 0-1.15.572-2.27 1.206-2.98.804-.94 2.142-1.64 3.248-1.68.03.13.05.28.05.43zm4.565 17.3c-.42.96-.62 1.39-1.16 2.25-.75 1.2-1.81 2.69-3.12 2.7-1.17.02-1.47-.77-3.05-.76-1.59.01-1.92.78-3.09.76-1.31-.02-2.31-1.35-3.06-2.55-2.11-3.37-2.33-7.33-1.03-9.44.92-1.5 2.38-2.38 3.93-2.38 1.46 0 2.38.78 3.59.78 1.17 0 1.88-.79 3.57-.79 1.38 0 2.67.75 3.55 2.04-3.12 1.71-2.62 6.17.97 7.39z"/>
              </svg>
              Continue with Apple
            </button>
          </div>
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
    <div className="space-y-2" data-tour="dropbox-folder-select">
      {folders.map((folder) => {
        const folderPath = folder.path_lower || folder.path;
        const isSelected = checkSelected ? checkSelected(folderPath) : selectedFolders.some(f => f.path === folderPath);
        return (
          <button
            key={folder.id || folder.path_lower}
            onClick={() => onToggle(folderPath)}
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
              <p className="text-xs text-gray-500">{folder.path_display || folder.path}</p>
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
    <div className="space-y-4" data-tour="dropbox-preview">
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
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="text-sm font-medium text-blue-800 mb-1">Source Context</h4>
        <p className="text-xs text-blue-700">
          Provider: Dropbox | Read-only: Yes | Objects: files, folders
        </p>
      </div>
    </div>
  );
}

/**
 * Main Dropbox Wizard Component - 4-Phase Flow
 */
export default function DropboxWizard({ onComplete, onCancel, authFetch: propAuthFetch, existingConnector }) {
  // If existingConnector is provided, skip to folders phase (OAuth already done)
  const [phase, setPhase] = useState(existingConnector ? 'folders' : 'explain');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [connectedAccount, setConnectedAccount] = useState(
    existingConnector ? { email: existingConnector.email, name: existingConnector.email } : null
  );
  const [connectorId, setConnectorId] = useState(existingConnector?.id || null);

  const [folders, setFolders] = useState([]);
  const [selectedFolders, setSelectedFolders] = useState([]);
  const [preview, setPreview] = useState(null);
  const [confirmed, setConfirmed] = useState(false);

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

  const phaseLabels = ['explain', 'visual-guide', 'oauth', 'confirm', 'folders', 'preview'];
  const currentPhaseIndex = phaseLabels.indexOf(phase);

  const startOAuth = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const createRes = await authFetch('/connectors/enterprise', {
        method: 'POST',
        body: JSON.stringify({
          enterpriseType: 'dropbox',
          displayName: 'My Dropbox',
          scopeConfig: {},
          budgetConfig: {
            max_bytes: 1073741824,
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

      const authRes = await authFetch(`/connectors/dropbox/${connector.id}/auth-url`);

      if (!authRes.ok) {
        throw new Error('Failed to get authorization URL');
      }

      const authData = await authRes.json();

      if (authData.error) {
        throw new Error(authData.message || authData.error || 'Failed to get authorization URL');
      }

      const { url, isPlaceholder, message } = authData;

      if (isPlaceholder) {
        console.log('[Dropbox] Preview mode:', message);
        setConnectedAccount({
          email: 'preview@dropbox.com',
          name: 'Preview User',
          isPreview: true,
        });
        setPhase('confirm');
      } else if (url) {
        window.location.href = url;
      } else {
        throw new Error('Dropbox OAuth is not configured. Please check your Dropbox app credentials.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');

    if (code && state && state.includes('dropbox')) {
      handleOAuthCallback(code, state);
    }
  }, []);

  const handleOAuthCallback = async (code, state) => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await authFetch('/connectors/dropbox/callback', {
        method: 'POST',
        body: JSON.stringify({ code, state }),
      });

      if (!res.ok) {
        throw new Error('OAuth callback failed');
      }

      const data = await res.json();
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

  const loadFolders = useCallback(async () => {
    if (!connectorId) return;

    setIsLoading(true);
    try {
      const res = await authFetch(`/connectors/dropbox/${connectorId}/folders`);
      if (res.ok) {
        const data = await res.json();
        setFolders(data.folders || data.entries || []);
      }
    } catch (err) {
      console.error('Failed to load folders:', err);
    } finally {
      setIsLoading(false);
    }
  }, [connectorId, authFetch]);

  const loadPreview = useCallback(async () => {
    if (!connectorId || selectedFolders.length === 0) {
      setPreview(null);
      return;
    }

    setIsLoading(true);
    try {
      const res = await authFetch(`/connectors/dropbox/${connectorId}/preview-scan`, {
        method: 'POST',
        body: JSON.stringify({ paths: selectedFolders }),
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

  // Toggle folder selection - store full folder objects, not just paths
  const toggleFolder = (folderPath) => {
    setSelectedFolders((prev) => {
      const exists = prev.some(f => f.path === folderPath);
      if (exists) {
        return prev.filter((f) => f.path !== folderPath);
      } else {
        // Find the folder object from the folders list
        const folderObj = folders.find(f => (f.path_lower || f.path) === folderPath);
        if (folderObj) {
          return [...prev, { path: folderPath, name: folderObj.name }];
        }
        return prev;
      }
    });
  };

  // Check if a folder path is selected
  const isFolderSelected = (folderPath) => {
    return selectedFolders.some(f => f.path === folderPath);
  };

  useEffect(() => {
    if (phase === 'folders' && connectorId) {
      loadFolders();
    }
  }, [phase, connectorId, loadFolders]);

  useEffect(() => {
    if (phase === 'preview' && connectorId) {
      loadPreview();
    }
  }, [phase, connectorId, loadPreview]);

  const confirmAndComplete = async () => {
    if (!confirmed) return;

    setIsLoading(true);
    try {
      // Save folder selection to backend
      const res = await authFetch(`/connectors/dropbox/${connectorId}/confirm`, {
        method: 'POST',
        body: JSON.stringify({ folders: selectedFolders }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save folder selection');
      }

      onComplete?.({
        id: connectorId,
        type: 'dropbox',
        account: connectedAccount,
        folders: selectedFolders,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const renderPhase = () => {
    switch (phase) {
      case 'explain':
        return (
          <div className="space-y-6" data-tour="dropbox-explain">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-[#0061FF]/10 flex items-center justify-center mb-4">
                <Icons.Dropbox />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                Connect Dropbox
              </h2>
              <p className="text-gray-500 mt-2">
                Let's walk through what will happen next
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-5 space-y-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Icons.Info className="text-slate" />
                What happens when you connect?
              </h3>

              <div className="space-y-3 text-sm">
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#0061FF]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-[#0061FF]">1</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Dropbox popup appears</p>
                    <p className="text-gray-500">A Dropbox sign-in window will open in your browser</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#0061FF]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-[#0061FF]">2</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Sign in to your account</p>
                    <p className="text-gray-500">Use email, Google, or Apple to sign in to Dropbox</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#0061FF]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-[#0061FF]">3</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Grant read-only access</p>
                    <p className="text-gray-500">Skatalyst only requests permission to read files, never modify</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#0061FF]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-[#0061FF]">4</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Return here to select folders</p>
                    <p className="text-gray-500">After signing in, you'll choose exactly which folders to scan</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
              <Icons.Shield className="text-green-600 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-green-800">Your data is protected</p>
                <p className="text-green-700">
                  Skatalyst uses OAuth 2.0 - we never see or store your password.
                  You can revoke access anytime from your Dropbox settings.
                </p>
              </div>
            </div>

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

      case 'visual-guide':
        return (
          <div className="space-y-6" data-tour="dropbox-visual-guide">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto rounded-xl bg-slate/10 flex items-center justify-center text-slate mb-3">
                <Icons.Eye />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                Here's what you'll see
              </h2>
              <p className="text-gray-500 mt-2">
                A Dropbox sign-in popup will appear like this:
              </p>
            </div>

            <DropboxPopupPreview />

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Icons.Info className="text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium">Sign in with your preferred method</p>
                  <p className="mt-1">
                    You can use email, Google, or Apple to sign in. Choose the method
                    linked to the Dropbox account with the files you want to scan.
                  </p>
                </div>
              </div>
            </div>

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

      case 'oauth':
        return (
          <div className="space-y-6" data-tour="dropbox-oauth">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto rounded-xl bg-[#0061FF]/10 flex items-center justify-center mb-3">
                <Icons.DropboxSmall />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                Connect to Dropbox
              </h2>
              <p className="text-gray-500 mt-2">
                Click below to open the Dropbox sign-in window
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 text-center">
              {isLoading ? (
                <div className="py-4">
                  <div className="w-8 h-8 border-2 border-[#0061FF] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-gray-500">Opening Dropbox sign-in...</p>
                </div>
              ) : (
                <>
                  <p className="text-sm text-gray-600 mb-4">
                    You'll be redirected to Dropbox's secure login page.
                    After signing in, you'll return here automatically.
                  </p>
                  <button
                    onClick={startOAuth}
                    className="inline-flex items-center gap-3 px-6 py-3 bg-[#0061FF] text-white rounded-lg font-medium hover:bg-[#0061FF]/90 transition-colors"
                  >
                    <Icons.DropboxSmall />
                    Sign in with Dropbox
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

      case 'confirm':
        return (
          <div className="space-y-6" data-tour="dropbox-confirm">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center text-green-600 mb-4">
                <Icons.Check />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                Account Connected!
              </h2>
              <p className="text-gray-500 mt-2">
                Dropbox is now linked to Skatalyst
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-[#0061FF]/20 flex items-center justify-center">
                  <span className="text-lg font-bold text-[#0061FF]">
                    {connectedAccount?.name?.charAt(0) || connectedAccount?.email?.charAt(0) || '?'}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">
                    {connectedAccount?.name || 'Dropbox Account'}
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

      case 'folders':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Select Folders
              </h2>
              <p className="text-gray-500 mt-1">
                Choose which folders to include in the scan
              </p>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <Icons.DropboxSmall className="text-[#0061FF]" />
              <span className="text-sm text-gray-600">
                Connected as <span className="font-medium text-gray-900">{connectedAccount?.email}</span>
              </span>
            </div>

            <div className="max-h-64 overflow-y-auto">
              {isLoading && folders.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="w-8 h-8 border-2 border-[#0061FF] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-gray-500">Loading folders...</p>
                </div>
              ) : (
                <FolderSelector
                  folders={folders}
                  selectedFolders={selectedFolders}
                  onToggle={toggleFolder}
                  checkSelected={isFolderSelected}
                />
              )}
            </div>

            {selectedFolders.length > 0 && (
              <div className="p-3 bg-slate/5 rounded-lg border border-slate/20">
                <p className="text-sm text-slate">
                  <span className="font-medium">{selectedFolders.length}</span> folder{selectedFolders.length !== 1 ? 's' : ''} selected
                </p>
              </div>
            )}

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

      case 'preview':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Review & Confirm
              </h2>
              <p className="text-gray-500 mt-1">
                Preview what will be scanned before confirming
              </p>
            </div>

            <ScanPreview preview={preview} isLoading={isLoading} />

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
          <div className="border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#0061FF]/10 rounded-xl">
                  <Icons.Dropbox />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">Dropbox</h2>
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
            <PhaseIndicator currentPhase={currentPhaseIndex} phases={phaseLabels} />
          </div>

          <div className="p-6">
            {renderPhase()}
          </div>
        </div>
      </div>
    </div>
  );
}
