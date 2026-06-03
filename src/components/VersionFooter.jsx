import React, { useState, useEffect } from 'react';

/**
 * VersionFooter Component
 *
 * Displays frontend and backend version information for deployment verification.
 * - Frontend: git_sha and build_time from env vars (set at build time)
 * - Backend: fetched from /api/version endpoint
 */

const API_BASE = `${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/api`;

// Frontend build info (injected at build time)
const FRONTEND_VERSION = {
  git_sha: process.env.REACT_APP_GIT_SHA || 'dev',
  build_time: process.env.REACT_APP_BUILD_TIME || new Date().toISOString()
};

export default function VersionFooter({ compact = false }) {
  const [backendVersion, setBackendVersion] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Fetch backend version
    fetch(`${API_BASE}/version`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => setBackendVersion(data))
      .catch(() => setBackendVersion({ git_sha: 'error', environment: 'unknown' }));
  }, []);

  const frontendSha = FRONTEND_VERSION.git_sha.substring(0, 7);
  const backendSha = backendVersion?.git_sha?.substring(0, 7) || '...';

  if (compact) {
    return (
      <div className="text-xs text-gray-500">
        <span title={`Frontend: ${FRONTEND_VERSION.git_sha}\nBackend: ${backendVersion?.git_sha || 'loading'}`}>
          v: fe:{frontendSha} be:{backendSha}
        </span>
      </div>
    );
  }

  return (
    <div className="p-4 border-t border-white/10">
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="text-xs text-gray-500 hover:text-gray-400 cursor-pointer w-full text-left"
      >
        v: fe:{frontendSha} / be:{backendSha}
      </button>

      {showDetails && (
        <div className="mt-2 p-2 bg-white/5 rounded text-xs font-mono space-y-1">
          <div className="text-gray-400">
            <span className="text-gray-500">Frontend:</span>
            <div className="ml-2">
              <div>sha: {FRONTEND_VERSION.git_sha}</div>
              <div>built: {formatTime(FRONTEND_VERSION.build_time)}</div>
            </div>
          </div>
          {backendVersion && (
            <div className="text-gray-400">
              <span className="text-gray-500">Backend:</span>
              <div className="ml-2">
                <div>sha: {backendVersion.git_sha}</div>
                <div>built: {formatTime(backendVersion.build_time)}</div>
                <div>env: {backendVersion.environment}</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function formatTime(isoString) {
  if (!isoString || isoString === 'dev') return 'local dev';
  try {
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return isoString;
  }
}
