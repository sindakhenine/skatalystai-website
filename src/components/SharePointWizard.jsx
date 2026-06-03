/**
 * SharePoint Wizard - 4-Phase Ingestion Flow
 *
 * Follows the strict 4-phase ingestion UX pattern:
 * 1. EXPLAIN - Tell user what they're about to do
 * 2. VISUAL GUIDANCE - Show what the Microsoft popup will look like
 * 3. ACTION - OAuth redirect to Microsoft
 * 4. CONFIRMATION - Confirm scope (sites/libraries) + budget
 *
 * OAuth is the SINGLE SOURCE OF TRUTH for account identity.
 */

import { useState, useEffect, useCallback } from 'react';

// Icons
const Icons = {
  SharePoint: () => (
    <svg className="w-8 h-8" viewBox="0 0 24 24">
      <circle cx="12" cy="8" r="6" fill="#038387"/>
      <circle cx="7" cy="14" r="5" fill="#37a987"/>
      <circle cx="17" cy="15" r="4" fill="#1a9ba1"/>
    </svg>
  ),
  Microsoft: () => (
    <svg className="w-5 h-5" viewBox="0 0 21 21">
      <rect x="1" y="1" width="9" height="9" fill="#f25022"/>
      <rect x="1" y="11" width="9" height="9" fill="#00a4ef"/>
      <rect x="11" y="1" width="9" height="9" fill="#7fba00"/>
      <rect x="11" y="11" width="9" height="9" fill="#ffb900"/>
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
  Site: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" />
    </svg>
  ),
  Library: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
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
  ChevronRight: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  ),
  ChevronDown: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  ),
  Image: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  Document: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  Spinner: () => (
    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  ),
  Folder: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
    </svg>
  ),
};

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Get file icon based on mime type or extension
function getFileIcon(mimeType, name) {
  const ext = name?.split('.').pop()?.toLowerCase() || '';
  const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'];

  if (mimeType?.startsWith('image/') || imageExts.includes(ext)) {
    return <Icons.Image />;
  }
  return <Icons.Document />;
}

// Expandable site tree item for SharePoint
function SiteTreeItem({ site, selectedSites, onToggle, authFetch, connectorId }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [libraries, setLibraries] = useState(null);
  const [expandedLibraries, setExpandedLibraries] = useState({});
  const [libraryContents, setLibraryContents] = useState({});

  const isSelected = selectedSites.includes(site.id);

  const handleExpand = async (e) => {
    e.stopPropagation();

    if (isExpanded) {
      setIsExpanded(false);
      return;
    }

    if (libraries === null) {
      setIsLoading(true);
      try {
        // Load libraries for this site
        const res = await authFetch(`/connectors/sharepoint/${connectorId}/sites/${encodeURIComponent(site.id)}/libraries`);
        if (res.ok) {
          const data = await res.json();
          setLibraries(data.libraries || data.value || []);
        }
      } catch (err) {
        console.error('Failed to load libraries:', err);
      } finally {
        setIsLoading(false);
      }
    }

    setIsExpanded(true);
  };

  const handleExpandLibrary = async (libraryId, driveId) => {
    if (expandedLibraries[libraryId]) {
      setExpandedLibraries(prev => ({ ...prev, [libraryId]: false }));
      return;
    }

    if (!libraryContents[libraryId]) {
      setExpandedLibraries(prev => ({ ...prev, [libraryId]: 'loading' }));
      try {
        // Load files in this library
        const res = await authFetch(`/connectors/sharepoint/${connectorId}/drives/${encodeURIComponent(driveId)}/items`);
        if (res.ok) {
          const data = await res.json();
          setLibraryContents(prev => ({ ...prev, [libraryId]: data.items || data.value || [] }));
        }
      } catch (err) {
        console.error('Failed to load library contents:', err);
      }
    }

    setExpandedLibraries(prev => ({ ...prev, [libraryId]: true }));
  };

  return (
    <div>
      <div
        className={`flex items-center gap-2 p-3 rounded-lg transition-all cursor-pointer ${
          isSelected
            ? 'bg-slate/10 border border-slate/30'
            : 'hover:bg-gray-50 border border-transparent'
        }`}
      >
        {/* Expand/collapse button */}
        <button
          onClick={handleExpand}
          className="p-0.5 hover:bg-gray-200 rounded text-gray-400"
        >
          {isLoading ? <Icons.Spinner /> : isExpanded ? <Icons.ChevronDown /> : <Icons.ChevronRight />}
        </button>

        {/* Site icon + selection */}
        <button
          onClick={() => onToggle(site.id)}
          className={`p-1.5 rounded ${isSelected ? 'bg-slate text-white' : 'bg-gray-100 text-gray-500'}`}
        >
          <Icons.Site />
        </button>

        {/* Site info */}
        <div className="flex-1 min-w-0" onClick={() => onToggle(site.id)}>
          <p className="font-medium text-gray-900 text-sm truncate">{site.displayName || site.name}</p>
          <p className="text-xs text-gray-500 truncate">{site.webUrl}</p>
        </div>

        {/* Selected indicator */}
        {isSelected && (
          <div className="text-slate flex-shrink-0">
            <Icons.Check />
          </div>
        )}
      </div>

      {/* Expanded libraries */}
      {isExpanded && libraries && (
        <div className="ml-6 border-l border-gray-200">
          {libraries.length === 0 && (
            <p className="text-xs text-gray-400 italic pl-4 py-2">No document libraries found</p>
          )}
          {libraries.map((library) => (
            <div key={library.id}>
              <div
                className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer ml-2"
                onClick={() => handleExpandLibrary(library.id, library.driveId || library.id)}
              >
                <span className="p-0.5 text-gray-400">
                  {expandedLibraries[library.id] === 'loading' ? (
                    <Icons.Spinner />
                  ) : expandedLibraries[library.id] ? (
                    <Icons.ChevronDown />
                  ) : (
                    <Icons.ChevronRight />
                  )}
                </span>
                <span className="text-gray-500"><Icons.Library /></span>
                <span className="text-sm text-gray-700 truncate flex-1">{library.name || library.displayName}</span>
                {library.itemCount !== undefined && (
                  <span className="text-xs text-gray-400">{library.itemCount} items</span>
                )}
              </div>

              {/* Library contents */}
              {expandedLibraries[library.id] === true && libraryContents[library.id] && (
                <div className="ml-8 border-l border-gray-100">
                  {libraryContents[library.id].length === 0 && (
                    <p className="text-xs text-gray-400 italic pl-4 py-1">Empty library</p>
                  )}
                  {libraryContents[library.id].slice(0, 10).map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-2 py-1.5 px-3 text-sm text-gray-600"
                    >
                      <span className="text-gray-400">
                        {item.folder ? <Icons.Folder /> : getFileIcon(item.mimeType, item.name)}
                      </span>
                      <span className="truncate flex-1">{item.name}</span>
                      {item.size && <span className="text-xs text-gray-400">{formatBytes(item.size)}</span>}
                    </div>
                  ))}
                  {libraryContents[library.id].length > 10 && (
                    <p className="text-xs text-gray-400 pl-8 py-1">
                      +{libraryContents[library.id].length - 10} more items...
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

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

function MicrosoftPopupPreview() {
  return (
    <div className="relative" data-tour="sharepoint-popup-preview">
      <div className="bg-gray-100 rounded-t-lg px-3 py-2 flex items-center gap-2 border border-gray-200 border-b-0">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-400" />
          <div className="w-3 h-3 rounded-full bg-yellow-400" />
          <div className="w-3 h-3 rounded-full bg-green-400" />
        </div>
        <div className="flex-1 bg-white rounded px-3 py-1 text-xs text-gray-500 truncate">
          login.microsoftonline.com
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-b-lg p-6">
        <div className="max-w-xs mx-auto">
          <div className="flex justify-center mb-6">
            <Icons.Microsoft />
          </div>

          <h3 className="text-xl font-semibold text-gray-900 text-center mb-2">
            Sign in
          </h3>
          <p className="text-sm text-gray-500 text-center mb-6">
            to access SharePoint sites
          </p>

          <div className="space-y-2 mb-6">
            <div className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate/20 flex items-center justify-center">
                <span className="text-sm font-medium text-slate">JD</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">john.doe@company.com</p>
                <p className="text-xs text-gray-500">Work or school account</p>
              </div>
            </div>
          </div>

          <button className="w-full text-sm text-slate hover:underline">
            Use another account
          </button>
        </div>
      </div>

      <div className="absolute -top-3 -right-3 bg-slate text-white text-xs px-2 py-1 rounded-full shadow-lg">
        Preview
      </div>
    </div>
  );
}

function SiteSelector({ sites, selectedSites, onToggle, authFetch, connectorId }) {
  if (!sites || sites.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">
        <Icons.Site className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>No sites available</p>
      </div>
    );
  }

  return (
    <div className="space-y-1" data-tour="sharepoint-site-select">
      <p className="text-xs text-gray-500 mb-2">Click arrow to expand and see libraries/files, click site to select</p>
      {sites.map((site) => (
        <SiteTreeItem
          key={site.id}
          site={site}
          selectedSites={selectedSites}
          onToggle={onToggle}
          authFetch={authFetch}
          connectorId={connectorId}
        />
      ))}
    </div>
  );
}

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
        <p>Select sites to see scan preview</p>
      </div>
    );
  }

  return (
    <div className="space-y-4" data-tour="sharepoint-preview">
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 bg-gray-50 rounded-lg text-center border border-gray-100">
          <p className="text-xl font-bold text-slate">{preview.estimates?.totalItems || 0}</p>
          <p className="text-xs text-gray-500">Documents</p>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg text-center border border-gray-100">
          <p className="text-xl font-bold text-slate">{preview.estimates?.libraries || 0}</p>
          <p className="text-xs text-gray-500">Libraries</p>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg text-center border border-gray-100">
          <p className="text-xl font-bold text-slate">{preview.estimates?.totalBytesFormatted || formatBytes(preview.estimates?.totalBytes || 0)}</p>
          <p className="text-xs text-gray-500">Total Size</p>
        </div>
      </div>

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

      {preview.sampleFiles?.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Sample Documents</h4>
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

      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="text-sm font-medium text-blue-800 mb-1">Source Context</h4>
        <p className="text-xs text-blue-700">
          Provider: Microsoft SharePoint | Read-only: Yes | Objects: sites, libraries, documents
        </p>
      </div>
    </div>
  );
}

export default function SharePointWizard({ existingConnectorId, onComplete, onCancel, authFetch: propAuthFetch }) {
  // If existingConnectorId is provided, we're in "scope-only" mode (completing setup for existing connector)
  const isScopeOnlyMode = !!existingConnectorId;

  const [phase, setPhase] = useState(isScopeOnlyMode ? 'sites' : 'explain');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [connectedAccount, setConnectedAccount] = useState(null);
  const [connectorId, setConnectorId] = useState(existingConnectorId || null);

  const [sites, setSites] = useState([]);
  const [selectedSites, setSelectedSites] = useState([]);
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

  const phaseLabels = ['explain', 'visual-guide', 'oauth', 'confirm', 'sites', 'preview'];
  const currentPhaseIndex = phaseLabels.indexOf(phase);

  // Load connector info when in scope-only mode
  useEffect(() => {
    if (isScopeOnlyMode && existingConnectorId) {
      loadConnectorInfo();
    }
  }, [existingConnectorId]);

  const loadConnectorInfo = async () => {
    setIsLoading(true);
    try {
      const res = await authFetch(`/connectors/enterprise/${existingConnectorId}`);
      if (res.ok) {
        const connector = await res.json();
        // Extract account info from oauth_token_ref if available
        let tokenData = null;
        try {
          if (connector.oauth_token_ref) {
            tokenData = JSON.parse(connector.oauth_token_ref);
          }
        } catch (e) {
          console.warn('[SharePoint] Could not parse oauth_token_ref');
        }

        // Check if OAuth hasn't been completed yet
        if (!tokenData) {
          console.log('[SharePoint] No OAuth tokens found - need to authenticate first');
          // Need to go through OAuth flow, not scope-only mode
          setPhase('explain');
          setConnectorId(existingConnectorId);
          setError('SharePoint not connected. Please complete the authentication first.');
          return;
        }

        setConnectedAccount({
          email: tokenData?.userEmail || connector.display_name || 'Connected Account',
          name: tokenData?.displayName || connector.display_name,
          tenant: tokenData?.tenantName || 'SharePoint',
          isPreview: false,
        });

        // Load existing scope if any
        if (connector.scope_config?.sites) {
          setSelectedSites(connector.scope_config.sites);
        }
      } else {
        throw new Error('Failed to load connector info');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const startOAuth = async () => {
    setIsLoading(true);
    setError(null);

    try {
      let activeConnectorId = connectorId;

      // Only create a new connector if we don't have one already
      if (!activeConnectorId) {
        const createRes = await authFetch('/connectors/enterprise', {
          method: 'POST',
          body: JSON.stringify({
            enterpriseType: 'sharepoint',
            displayName: 'My SharePoint',
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
        activeConnectorId = connector.id;
        setConnectorId(connector.id);
      }

      // Get OAuth URL (use existing connector if reconnecting)
      const authRes = await authFetch(`/connectors/sharepoint/${activeConnectorId}/auth-url`);

      if (!authRes.ok) {
        throw new Error('Failed to get authorization URL');
      }

      const { url, isPlaceholder, message } = await authRes.json();

      if (isPlaceholder) {
        console.log('[SharePoint] Preview mode:', message);
        setConnectedAccount({
          email: 'preview@company.com',
          name: 'Preview User',
          tenant: 'company.sharepoint.com',
          isPreview: true,
        });
        setPhase('confirm');
      } else {
        window.location.href = url;
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

    if (code && state && state.includes('sharepoint')) {
      handleOAuthCallback(code, state);
    }
  }, []);

  const handleOAuthCallback = async (code, state) => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await authFetch('/connectors/sharepoint/callback', {
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
        tenant: data.tenant,
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

  const loadSites = useCallback(async () => {
    if (!connectorId) return;

    setIsLoading(true);
    setError(null);
    try {
      console.log('[SharePointWizard] Loading sites for connector:', connectorId);
      const res = await authFetch(`/connectors/sharepoint/${connectorId}/sites`);
      const data = await res.json();
      console.log('[SharePointWizard] Sites response:', data);

      // Set sites first if available (even if there's also an error/warning)
      const sitesData = data.sites || data.value || [];
      if (sitesData.length > 0) {
        console.log('[SharePointWizard] Setting', sitesData.length, 'sites');
        setSites(sitesData);
      }

      // Then check for errors
      if (data.error) {
        setError(data.error.message + (data.error.action ? ' ' + data.error.action : ''));
        // Only clear sites if we got no sites
        if (sitesData.length === 0) {
          setSites([]);
        }
      } else if (!res.ok) {
        setError(data.error || 'Failed to load SharePoint sites');
      }
    } catch (err) {
      console.error('Failed to load sites:', err);
      setError(err.message || 'Failed to load SharePoint sites');
    } finally {
      setIsLoading(false);
    }
  }, [connectorId, authFetch]);

  const loadPreview = useCallback(async () => {
    if (!connectorId || selectedSites.length === 0) {
      setPreview(null);
      return;
    }

    setIsLoading(true);
    try {
      const res = await authFetch(`/connectors/sharepoint/${connectorId}/preview-scan`, {
        method: 'POST',
        body: JSON.stringify({ sites: selectedSites }),
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
  }, [connectorId, selectedSites, authFetch]);

  const toggleSite = (id) => {
    setSelectedSites((prev) =>
      prev.includes(id)
        ? prev.filter((s) => s !== id)
        : [...prev, id]
    );
  };

  useEffect(() => {
    if (phase === 'sites' && connectorId) {
      loadSites();
    }
  }, [phase, connectorId, loadSites]);

  useEffect(() => {
    if (phase === 'preview' && connectorId) {
      loadPreview();
    }
  }, [phase, connectorId, loadPreview]);

  const confirmAndComplete = async () => {
    if (!confirmed) return;

    setIsLoading(true);
    try {
      // Map selected site IDs to full site objects (with id, name, displayName)
      const selectedSiteObjects = selectedSites.map(siteId => {
        const site = sites.find(s => s.id === siteId);
        return site ? { id: site.id, name: site.name, displayName: site.displayName } : { id: siteId };
      });

      await authFetch(`/connectors/sharepoint/${connectorId}/confirm`, {
        method: 'POST',
        body: JSON.stringify({ sites: selectedSiteObjects }),
      });

      onComplete?.({
        id: connectorId,
        type: 'sharepoint',
        account: connectedAccount,
        sites: selectedSiteObjects,
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
          <div className="space-y-6" data-tour="sharepoint-explain">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-slate/10 flex items-center justify-center mb-4">
                <Icons.SharePoint />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                Connect SharePoint
              </h2>
              <p className="text-gray-500 mt-2">
                Access documents from SharePoint sites and libraries
              </p>
            </div>

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
                    <p className="font-medium text-gray-900">Microsoft popup appears</p>
                    <p className="text-gray-500">Sign in with your work or school account</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-slate/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-slate">2</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Consent to read access</p>
                    <p className="text-gray-500">Your admin may need to approve if required by your organization</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-slate/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-slate">3</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Select SharePoint sites</p>
                    <p className="text-gray-500">Choose which sites and document libraries to scan</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-slate/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-slate">4</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Preview before confirming</p>
                    <p className="text-gray-500">See exactly what will be scanned before proceeding</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <Icons.Warning className="text-amber-600 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-amber-800">Organization approval may be required</p>
                <p className="text-amber-700">
                  Some organizations require admin consent for apps accessing SharePoint.
                  Contact your IT admin if you see a consent error.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
              <Icons.Shield className="text-green-600 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-green-800">Your data is protected</p>
                <p className="text-green-700">
                  Skatalyst uses OAuth 2.0 and only requests read-only access.
                  We never modify or delete your documents.
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
          <div className="space-y-6" data-tour="sharepoint-visual-guide">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto rounded-xl bg-slate/10 flex items-center justify-center text-slate mb-3">
                <Icons.Eye />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                Here's what you'll see
              </h2>
              <p className="text-gray-500 mt-2">
                A Microsoft sign-in popup will appear:
              </p>
            </div>

            <MicrosoftPopupPreview />

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Icons.Info className="text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium">Use your work or school account</p>
                  <p className="mt-1">
                    SharePoint requires a Microsoft 365 work or school account.
                    Personal Microsoft accounts don't have SharePoint access.
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
          <div className="space-y-6" data-tour="sharepoint-oauth">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto rounded-xl bg-slate/10 flex items-center justify-center text-slate mb-3">
                <Icons.Microsoft />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                Connect to SharePoint
              </h2>
              <p className="text-gray-500 mt-2">
                Click below to open the Microsoft sign-in window
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 text-center">
              {isLoading ? (
                <div className="py-4">
                  <div className="w-8 h-8 border-2 border-slate border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-gray-500">Opening Microsoft sign-in...</p>
                </div>
              ) : (
                <>
                  <p className="text-sm text-gray-600 mb-4">
                    You'll be redirected to Microsoft's secure login page.
                    After signing in, you'll return here automatically.
                  </p>
                  <button
                    onClick={startOAuth}
                    className="inline-flex items-center gap-3 px-6 py-3 bg-slate text-white rounded-lg font-medium hover:bg-slate/90 transition-colors"
                  >
                    <Icons.Microsoft />
                    Sign in with Microsoft
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
          <div className="space-y-6" data-tour="sharepoint-confirm">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center text-green-600 mb-4">
                <Icons.Check />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                Account Connected!
              </h2>
              <p className="text-gray-500 mt-2">
                SharePoint is now linked to Skatalyst
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-slate/20 flex items-center justify-center">
                  <span className="text-lg font-bold text-slate">
                    {connectedAccount?.name?.charAt(0) || connectedAccount?.email?.charAt(0) || '?'}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">
                    {connectedAccount?.name || 'Microsoft Account'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {connectedAccount?.email || 'Connected'}
                  </p>
                  {connectedAccount?.tenant && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      Tenant: {connectedAccount.tenant}
                    </p>
                  )}
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
                  <p className="font-medium">Next: Select SharePoint sites</p>
                  <p className="mt-1">
                    You'll choose which sites and document libraries to scan.
                    Only selected content will be accessed.
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
                onClick={() => setPhase('sites')}
                className="flex-1 py-3 px-4 rounded-lg bg-slate text-white font-medium hover:bg-slate/90 transition-colors flex items-center justify-center gap-2"
              >
                Select Sites
                <Icons.ArrowRight />
              </button>
            </div>
          </div>
        );

      case 'sites':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Select Sites
              </h2>
              <p className="text-gray-500 mt-1">
                Choose which SharePoint sites to scan
              </p>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <Icons.SharePoint className="text-slate" />
              <span className="text-sm text-gray-600">
                Connected as <span className="font-medium text-gray-900">{connectedAccount?.email}</span>
              </span>
            </div>

            <div className="max-h-64 overflow-y-auto">
              {isLoading && sites.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="w-8 h-8 border-2 border-slate border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-gray-500">Loading sites...</p>
                </div>
              ) : (
                <SiteSelector
                  sites={sites}
                  selectedSites={selectedSites}
                  onToggle={toggleSite}
                  authFetch={authFetch}
                  connectorId={connectorId}
                />
              )}
            </div>

            {selectedSites.length > 0 && (
              <div className="p-3 bg-slate/5 rounded-lg border border-slate/20">
                <p className="text-sm text-slate">
                  <span className="font-medium">{selectedSites.length}</span> site{selectedSites.length !== 1 ? 's' : ''} selected
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
                disabled={selectedSites.length === 0}
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
                  I confirm I want to scan these sites. I understand only the selected sites will be accessed.
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
                onClick={() => setPhase('sites')}
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
                <div className="p-2 bg-slate/10 rounded-xl">
                  <Icons.SharePoint />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">SharePoint</h2>
                  <p className="text-xs text-gray-500">Document Library Connector</p>
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
