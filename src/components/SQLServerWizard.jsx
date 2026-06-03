/**
 * SQL Server Wizard - 4-Phase Ingestion Flow
 *
 * Follows the strict 4-phase ingestion UX pattern:
 * 1. EXPLAIN - Tell user what they're about to do
 * 2. VISUAL GUIDANCE - Show what credentials are needed and where to find them
 * 3. ACTION - Enter database credentials
 * 4. CONFIRMATION - Confirm schema selection + preview
 *
 * Credential-based authentication for database access.
 */

import { useState, useEffect, useCallback } from 'react';

// Icons
const Icons = {
  SQLServer: () => (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="#CC2927">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
      <path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"/>
      <circle cx="12" cy="12" r="2"/>
    </svg>
  ),
  Database: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <ellipse cx="12" cy="5" rx="9" ry="3" strokeWidth="1.5"/>
      <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" strokeWidth="1.5"/>
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" strokeWidth="1.5"/>
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
  Key: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
    </svg>
  ),
  Server: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
    </svg>
  ),
  Table: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
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
  EyeOff: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  ),
  Lock: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  ),
};

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

function CredentialGuidePreview() {
  return (
    <div className="relative" data-tour="sqlserver-credential-guide">
      <div className="bg-gray-900 rounded-lg p-4 text-sm font-mono text-gray-300">
        <div className="flex items-center gap-2 mb-3 text-gray-500">
          <span className="text-green-400">$</span>
          <span>sqlcmd -S server,1433 -U username -P password -d database</span>
        </div>
        <div className="space-y-2 text-xs">
          <div className="flex gap-2">
            <span className="text-blue-400 w-20">Server:</span>
            <span className="text-yellow-300">your-server.database.windows.net</span>
          </div>
          <div className="flex gap-2">
            <span className="text-blue-400 w-20">Port:</span>
            <span className="text-yellow-300">1433</span>
            <span className="text-gray-500">(default)</span>
          </div>
          <div className="flex gap-2">
            <span className="text-blue-400 w-20">Database:</span>
            <span className="text-yellow-300">your_database</span>
          </div>
          <div className="flex gap-2">
            <span className="text-blue-400 w-20">Username:</span>
            <span className="text-yellow-300">readonly_user</span>
          </div>
          <div className="flex gap-2">
            <span className="text-blue-400 w-20">Password:</span>
            <span className="text-yellow-300">********</span>
          </div>
        </div>
      </div>
      <div className="absolute -top-3 -right-3 bg-slate text-white text-xs px-2 py-1 rounded-full shadow-lg">
        Example
      </div>
    </div>
  );
}

function SchemaSelector({ schemas, selectedSchemas, onToggle }) {
  if (!schemas || schemas.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">
        <Icons.Database className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>No schemas available</p>
      </div>
    );
  }

  return (
    <div className="space-y-2" data-tour="sqlserver-schema-select">
      {schemas.map((schema) => {
        const isSelected = selectedSchemas.includes(schema.name || schema);
        const schemaName = schema.name || schema;
        return (
          <button
            key={schemaName}
            onClick={() => onToggle(schemaName)}
            className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all ${
              isSelected
                ? 'border-slate/40 bg-slate/5'
                : 'border-gray-200 hover:border-slate/30'
            }`}
          >
            <div className={`p-1.5 rounded ${isSelected ? 'bg-slate text-white' : 'bg-gray-100 text-gray-500'}`}>
              <Icons.Database />
            </div>
            <div className="flex-1 text-left">
              <p className="font-medium text-gray-900">{schemaName}</p>
              {schema.tableCount && (
                <p className="text-xs text-gray-500">{schema.tableCount} tables</p>
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
        <p>Select schemas to see scan preview</p>
      </div>
    );
  }

  return (
    <div className="space-y-4" data-tour="sqlserver-preview">
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 bg-gray-50 rounded-lg text-center border border-gray-100">
          <p className="text-xl font-bold text-slate">{preview.estimates?.totalTables || 0}</p>
          <p className="text-xs text-gray-500">Tables</p>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg text-center border border-gray-100">
          <p className="text-xl font-bold text-slate">{preview.estimates?.totalRows?.toLocaleString() || 0}</p>
          <p className="text-xs text-gray-500">Rows</p>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg text-center border border-gray-100">
          <p className="text-xl font-bold text-slate">{preview.estimates?.totalColumns || 0}</p>
          <p className="text-xs text-gray-500">Columns</p>
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

      {preview.sampleTables?.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Sample Tables</h4>
          <div className="bg-gray-50 rounded-lg divide-y divide-gray-100 border border-gray-200">
            {preview.sampleTables.slice(0, 4).map((table, i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-2">
                <span className="text-gray-400"><Icons.Table /></span>
                <span className="flex-1 text-sm text-gray-900 truncate">{table.name}</span>
                <span className="text-xs text-gray-500">{table.rowCount?.toLocaleString() || 0} rows</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="text-sm font-medium text-blue-800 mb-1">Source Context</h4>
        <p className="text-xs text-blue-700">
          Provider: SQL Server | Read-only: Yes | Objects: schemas, tables, columns
        </p>
      </div>
    </div>
  );
}

export default function SQLServerWizard({ existingConnector, onComplete, onCancel, authFetch: propAuthFetch }) {
  // If there's an existing connector, start at schemas phase
  const [phase, setPhase] = useState(existingConnector ? 'schemas' : 'explain');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const [connectorId, setConnectorId] = useState(existingConnector?.id || null);
  const [credentials, setCredentials] = useState({
    server: '',
    port: '1433',
    database: '',
    username: '',
    password: '',
    encrypt: false,  // Default false for local; enable for Azure SQL
    trustServerCertificate: true,
  });
  const [connectionInfo, setConnectionInfo] = useState(
    existingConnector ? { server: existingConnector.server, database: existingConnector.database } : null
  );

  const [schemas, setSchemas] = useState([]);
  const [selectedSchemas, setSelectedSchemas] = useState([]);
  const [preview, setPreview] = useState(null);
  const [confirmed, setConfirmed] = useState(false);

  // Update state when existingConnector prop changes
  useEffect(() => {
    if (existingConnector) {
      setPhase('schemas');
      setConnectorId(existingConnector.id);
      setConnectionInfo({ server: existingConnector.server, database: existingConnector.database });
    }
  }, [existingConnector]);

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

  // Different phase labels for new vs existing connector
  const phaseLabels = existingConnector
    ? ['schemas', 'preview']
    : ['explain', 'visual-guide', 'credentials', 'confirm', 'schemas', 'preview'];
  const currentPhaseIndex = phaseLabels.indexOf(phase);

  const connectDatabase = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Create connector first
      const createRes = await authFetch('/connectors/enterprise', {
        method: 'POST',
        body: JSON.stringify({
          enterpriseType: 'mssql',
          displayName: `SQL Server - ${credentials.database}`,
          scopeConfig: {},
          budgetConfig: {
            max_bytes: 1073741824,
            max_rows: 1000000,
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

      // Connect with credentials
      const connectRes = await authFetch(`/connectors/sqlserver/${connector.id}/connect`, {
        method: 'POST',
        body: JSON.stringify(credentials),
      });

      if (!connectRes.ok) {
        const data = await connectRes.json();
        throw new Error(data.error || 'Failed to connect to database');
      }

      const result = await connectRes.json();
      setConnectionInfo({
        server: credentials.server,
        database: credentials.database,
        version: result.version,
      });
      setPhase('confirm');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSchemas = useCallback(async () => {
    if (!connectorId) return;

    setIsLoading(true);
    try {
      const res = await authFetch(`/connectors/sqlserver/${connectorId}/schemas`);
      if (res.ok) {
        const data = await res.json();
        setSchemas(data.schemas || []);
      }
    } catch (err) {
      console.error('Failed to load schemas:', err);
    } finally {
      setIsLoading(false);
    }
  }, [connectorId, authFetch]);

  const loadPreview = useCallback(async () => {
    if (!connectorId || selectedSchemas.length === 0) {
      setPreview(null);
      return;
    }

    setIsLoading(true);
    try {
      const res = await authFetch(`/connectors/sqlserver/${connectorId}/preview-scan`, {
        method: 'POST',
        body: JSON.stringify({ schemas: selectedSchemas }),
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
  }, [connectorId, selectedSchemas, authFetch]);

  const toggleSchema = (name) => {
    setSelectedSchemas((prev) =>
      prev.includes(name)
        ? prev.filter((s) => s !== name)
        : [...prev, name]
    );
  };

  useEffect(() => {
    if (phase === 'schemas' && connectorId) {
      loadSchemas();
    }
  }, [phase, connectorId, loadSchemas]);

  useEffect(() => {
    if (phase === 'preview' && connectorId) {
      loadPreview();
    }
  }, [phase, connectorId, loadPreview]);

  const confirmAndComplete = async () => {
    if (!confirmed) return;

    setIsLoading(true);
    setError(null);
    try {
      // 1. Update scope config with selected schemas
      const scopeRes = await authFetch(`/connectors/sqlserver/${connectorId}/scope`, {
        method: 'PUT',
        body: JSON.stringify({ schemas: selectedSchemas, tables: [] }),
      });
      if (!scopeRes.ok) throw new Error((await scopeRes.json()).error || 'Failed to update scope');

      // 2. Confirm scope with consent
      const confirmRes = await authFetch(`/connectors/sqlserver/${connectorId}/confirm`, {
        method: 'POST',
        body: JSON.stringify({ confirmed: true }),
      });
      if (!confirmRes.ok) throw new Error((await confirmRes.json()).error || 'Failed to confirm scope');

      // 3. Call onComplete callback
      onComplete?.({
        id: connectorId,
        type: 'sqlserver',
        connection: connectionInfo,
        schemas: selectedSchemas,
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
          <div className="space-y-6" data-tour="sqlserver-explain">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-[#CC2927]/10 flex items-center justify-center mb-4">
                <Icons.SQLServer />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                Connect SQL Server Database
              </h2>
              <p className="text-gray-500 mt-2">
                Scan schemas and tables from your SQL Server instance
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-5 space-y-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Icons.Info className="text-slate" />
                What you'll need
              </h3>

              <div className="space-y-3 text-sm">
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#CC2927]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icons.Server className="w-3.5 h-3.5 text-[#CC2927]" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Server and Port</p>
                    <p className="text-gray-500">The server address and port (default 1433)</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#CC2927]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icons.Database className="w-3.5 h-3.5 text-[#CC2927]" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Database name</p>
                    <p className="text-gray-500">The specific database to connect to</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#CC2927]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icons.Key className="w-3.5 h-3.5 text-[#CC2927]" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Username and Password</p>
                    <p className="text-gray-500">SQL Server authentication credentials</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
              <Icons.Shield className="text-green-600 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-green-800">Read-only access</p>
                <p className="text-green-700">
                  We recommend creating a read-only database user. Skatalyst only reads
                  schema metadata and table structures - no data modification.
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
          <div className="space-y-6" data-tour="sqlserver-visual-guide">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto rounded-xl bg-slate/10 flex items-center justify-center text-slate mb-3">
                <Icons.Eye />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                Where to find your credentials
              </h2>
              <p className="text-gray-500 mt-2">
                Here's an example of what you'll need:
              </p>
            </div>

            <CredentialGuidePreview />

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Icons.Info className="text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium">Where to find these credentials</p>
                  <ul className="mt-1 space-y-1 list-disc list-inside text-blue-700">
                    <li>Azure Portal for Azure SQL databases</li>
                    <li>SQL Server Management Studio (SSMS)</li>
                    <li>Your database administrator</li>
                  </ul>
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
                onClick={() => setPhase('credentials')}
                className="flex-1 py-3 px-4 rounded-lg bg-slate text-white font-medium hover:bg-slate/90 transition-colors flex items-center justify-center gap-2"
              >
                Enter Credentials
                <Icons.ArrowRight />
              </button>
            </div>
          </div>
        );

      case 'credentials':
        return (
          <div className="space-y-6" data-tour="sqlserver-credentials">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto rounded-xl bg-[#CC2927]/10 flex items-center justify-center mb-3">
                <Icons.Key className="w-6 h-6 text-[#CC2927]" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                Enter Connection Details
              </h2>
              <p className="text-gray-500 mt-2">
                Provide your SQL Server credentials
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Server</label>
                  <input
                    type="text"
                    value={credentials.server}
                    onChange={(e) => setCredentials({ ...credentials, server: e.target.value })}
                    placeholder="localhost or server.database.windows.net"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate/20 focus:border-slate"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Port</label>
                  <input
                    type="text"
                    value={credentials.port}
                    onChange={(e) => setCredentials({ ...credentials, port: e.target.value })}
                    placeholder="1433"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate/20 focus:border-slate"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Database</label>
                <input
                  type="text"
                  value={credentials.database}
                  onChange={(e) => setCredentials({ ...credentials, database: e.target.value })}
                  placeholder="your_database"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate/20 focus:border-slate"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <input
                  type="text"
                  value={credentials.username}
                  onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                  placeholder="sa or readonly_user"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate/20 focus:border-slate"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={credentials.password}
                    onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                    placeholder="********"
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate/20 focus:border-slate"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <Icons.EyeOff /> : <Icons.Eye />}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={credentials.encrypt}
                    onChange={(e) => setCredentials({ ...credentials, encrypt: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300 text-slate focus:ring-slate/20"
                  />
                  <span className="text-sm text-gray-700">Encrypt connection</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={credentials.trustServerCertificate}
                    onChange={(e) => setCredentials({ ...credentials, trustServerCertificate: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300 text-slate focus:ring-slate/20"
                  />
                  <span className="text-sm text-gray-700">Trust server certificate</span>
                </label>
              </div>
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
              <button
                onClick={connectDatabase}
                disabled={isLoading || !credentials.server || !credentials.database || !credentials.username}
                className="flex-1 py-3 px-4 rounded-lg bg-slate text-white font-medium hover:bg-slate/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    Connect
                    <Icons.ArrowRight />
                  </>
                )}
              </button>
            </div>
          </div>
        );

      case 'confirm':
        return (
          <div className="space-y-6" data-tour="sqlserver-confirm">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center text-green-600 mb-4">
                <Icons.Check />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                Connected!
              </h2>
              <p className="text-gray-500 mt-2">
                Successfully connected to SQL Server database
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-[#CC2927]/20 flex items-center justify-center">
                  <Icons.Database className="w-6 h-6 text-[#CC2927]" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{connectionInfo?.database}</p>
                  <p className="text-sm text-gray-500">{connectionInfo?.server}</p>
                  {connectionInfo?.version && (
                    <p className="text-xs text-gray-400">SQL Server {connectionInfo.version}</p>
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
                  <p className="font-medium">Next: Select schemas to scan</p>
                  <p className="mt-1">
                    Choose which schemas and tables to include. Only selected content
                    will be accessed.
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
                onClick={() => setPhase('schemas')}
                className="flex-1 py-3 px-4 rounded-lg bg-slate text-white font-medium hover:bg-slate/90 transition-colors flex items-center justify-center gap-2"
              >
                Select Schemas
                <Icons.ArrowRight />
              </button>
            </div>
          </div>
        );

      case 'schemas':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Select Schemas
              </h2>
              <p className="text-gray-500 mt-1">
                Choose which schemas to include in the scan
              </p>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <Icons.Database className="text-[#CC2927]" />
              <span className="text-sm text-gray-600">
                Connected to <span className="font-medium text-gray-900">{connectionInfo?.database}</span>
              </span>
            </div>

            <div className="max-h-64 overflow-y-auto">
              {isLoading && schemas.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="w-8 h-8 border-2 border-[#CC2927] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-gray-500">Loading schemas...</p>
                </div>
              ) : (
                <SchemaSelector
                  schemas={schemas}
                  selectedSchemas={selectedSchemas}
                  onToggle={toggleSchema}
                />
              )}
            </div>

            {selectedSchemas.length > 0 && (
              <div className="p-3 bg-slate/5 rounded-lg border border-slate/20">
                <p className="text-sm text-slate">
                  <span className="font-medium">{selectedSchemas.length}</span> schema{selectedSchemas.length !== 1 ? 's' : ''} selected
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={existingConnector ? onCancel : () => setPhase('confirm')}
                className="flex-1 py-3 px-4 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {existingConnector ? 'Cancel' : 'Back'}
              </button>
              <button
                onClick={() => setPhase('preview')}
                disabled={selectedSchemas.length === 0}
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
                  I confirm I want to scan these schemas. I understand only schema metadata
                  and table structures will be accessed (no actual data rows).
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
                onClick={() => setPhase('schemas')}
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
                <div className="p-2 bg-[#CC2927]/10 rounded-xl">
                  <Icons.SQLServer />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">SQL Server</h2>
                  <p className="text-xs text-gray-500">Database Connector</p>
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
