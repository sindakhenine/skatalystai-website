/**
 * Databricks Wizard - 4-Phase Ingestion Flow
 *
 * Follows the strict 4-phase ingestion UX pattern:
 * 1. EXPLAIN - Tell user what they're about to do
 * 2. VISUAL GUIDANCE - Show what credentials are needed (Databricks UI)
 * 3. ACTION - Enter Databricks credentials
 * 4. CONFIRMATION - Confirm catalog selection + preview
 */

import { useState, useEffect, useCallback } from 'react';

const Icons = {
  Databricks: () => (
    <svg className="w-8 h-8" viewBox="0 0 24 24">
      <path fill="#FF3621" d="M12 2L3 7v10l9 5 9-5V7l-9-5zm0 2.18l6.63 3.68L12 11.54 5.37 7.86 12 4.18z"/>
      <path fill="#FF3621" d="M12 12.82l6.63-3.68v7.36L12 20.18l-6.63-3.68v-7.36l6.63 3.68z" opacity="0.6"/>
    </svg>
  ),
  Catalog: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
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
  Link: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
    </svg>
  ),
};

function PhaseIndicator({ currentPhase, phases }) {
  return (
    <div className="flex gap-2 mt-4">
      {phases.map((phase, i) => <div key={phase} className={`h-1.5 flex-1 rounded-full transition-colors ${i <= currentPhase ? 'bg-slate' : 'bg-gray-200'}`} />)}
    </div>
  );
}

function DatabricksUIPreview() {
  return (
    <div className="relative" data-tour="databricks-credential-guide">
      <div className="bg-[#1B1B1B] rounded-lg overflow-hidden">
        <div className="px-4 py-2 flex items-center gap-3 border-b border-gray-700">
          <Icons.Databricks />
          <span className="text-white text-sm">Databricks Workspace</span>
          <span className="text-gray-400 text-xs">→ User Settings → Access Tokens</span>
        </div>
        <div className="p-4 text-sm font-mono text-gray-300 space-y-3">
          <div className="bg-gray-800/50 rounded p-3 space-y-2">
            <div className="flex gap-2"><span className="text-orange-400 w-28">Workspace URL:</span><span className="text-yellow-300">https://adb-1234567890.1.azuredatabricks.net</span></div>
            <div className="flex gap-2"><span className="text-orange-400 w-28">Access Token:</span><span className="text-yellow-300">dapi1234567890abcdef...</span></div>
          </div>
          <div className="text-gray-500 text-xs">Generate a new token under User Settings → Developer → Access Tokens</div>
        </div>
      </div>
      <div className="absolute -top-3 -right-3 bg-slate text-white text-xs px-2 py-1 rounded-full shadow-lg">Example</div>
    </div>
  );
}

function CatalogSelector({ catalogs, selectedCatalogs, onToggle }) {
  if (!catalogs || catalogs.length === 0) return <div className="p-6 text-center text-gray-500"><Icons.Catalog className="w-8 h-8 mx-auto mb-2 opacity-50" /><p>No catalogs available</p></div>;

  return (
    <div className="space-y-2" data-tour="databricks-catalog-select">
      {catalogs.map((catalog) => {
        const catalogName = catalog.name || catalog;
        const isSelected = selectedCatalogs.includes(catalogName);
        return (
          <button key={catalogName} onClick={() => onToggle(catalogName)} className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all ${isSelected ? 'border-slate/40 bg-slate/5' : 'border-gray-200 hover:border-slate/30'}`}>
            <div className={`p-1.5 rounded ${isSelected ? 'bg-slate text-white' : 'bg-gray-100 text-gray-500'}`}><Icons.Catalog /></div>
            <div className="flex-1 text-left">
              <p className="font-medium text-gray-900">{catalogName}</p>
              {catalog.comment && <p className="text-xs text-gray-500">{catalog.comment}</p>}
            </div>
            {isSelected && <div className="text-slate"><Icons.Check /></div>}
          </button>
        );
      })}
    </div>
  );
}

function ScanPreview({ preview, isLoading }) {
  if (isLoading) return <div className="p-8 text-center"><div className="w-8 h-8 border-2 border-slate border-t-transparent rounded-full animate-spin mx-auto mb-4" /><p className="text-gray-500">Calculating estimates...</p></div>;
  if (!preview) return <div className="p-6 text-center text-gray-500"><p>Select catalogs to see scan preview</p></div>;

  return (
    <div className="space-y-4" data-tour="databricks-preview">
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 bg-gray-50 rounded-lg text-center border border-gray-100"><p className="text-xl font-bold text-slate">{preview.estimates?.totalTables || 0}</p><p className="text-xs text-gray-500">Tables</p></div>
        <div className="p-3 bg-gray-50 rounded-lg text-center border border-gray-100"><p className="text-xl font-bold text-slate">{preview.estimates?.schemas || 0}</p><p className="text-xs text-gray-500">Schemas</p></div>
        <div className="p-3 bg-gray-50 rounded-lg text-center border border-gray-100"><p className="text-xl font-bold text-slate">{preview.estimates?.catalogs || 0}</p><p className="text-xs text-gray-500">Catalogs</p></div>
      </div>
      {preview.budget && (
        <div className={`p-3 rounded-lg border ${preview.budget.withinBudget ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <div className="flex items-center gap-2">{preview.budget.withinBudget ? <><span className="text-green-600"><Icons.Check /></span><span className="text-sm font-medium text-green-700">Within budget limits</span></> : <><span className="text-red-600"><Icons.Warning /></span><span className="text-sm font-medium text-red-700">Would exceed {preview.budget.exceededType} limit</span></>}</div>
        </div>
      )}
      {preview.sampleTables?.length > 0 && (
        <div><h4 className="text-sm font-medium text-gray-700 mb-2">Sample Tables</h4><div className="bg-gray-50 rounded-lg divide-y divide-gray-100 border border-gray-200">{preview.sampleTables.slice(0, 4).map((table, i) => <div key={i} className="flex items-center gap-3 px-3 py-2"><span className="text-gray-400"><Icons.Table /></span><span className="flex-1 text-sm text-gray-900 truncate">{table.catalog}.{table.schema}.{table.name}</span><span className="text-xs text-gray-500">{table.type}</span></div>)}</div></div>
      )}
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg"><h4 className="text-sm font-medium text-blue-800 mb-1">Source Context</h4><p className="text-xs text-blue-700">Provider: Databricks | Read-only: Yes | Structure: Unity Catalog (3-level namespace)</p></div>
    </div>
  );
}

export default function DatabricksWizard({ existingConnector, onComplete, onCancel, authFetch: propAuthFetch }) {
  // If there's an existing connector, start at catalogs phase (resume setup)
  const initialPhase = existingConnector?.id ? 'catalogs' : 'explain';
  const [phase, setPhase] = useState(initialPhase);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showToken, setShowToken] = useState(false);

  const [connectorId, setConnectorId] = useState(existingConnector?.id || null);
  const [credentials, setCredentials] = useState({ workspaceUrl: '', accessToken: '' });
  const [connectionInfo, setConnectionInfo] = useState(
    existingConnector?.id ? { workspaceUrl: existingConnector.workspaceUrl || 'Connected Workspace' } : null
  );

  const [catalogs, setCatalogs] = useState([]);
  const [selectedCatalogs, setSelectedCatalogs] = useState(existingConnector?.catalogs || []);
  const [preview, setPreview] = useState(null);
  const [confirmed, setConfirmed] = useState(false);
  const [schemaError, setSchemaError] = useState(null);

  const authFetch = propAuthFetch || ((url, options = {}) => fetch(`/api${url}`, { ...options, headers: { 'Content-Type': 'application/json', ...options.headers }, credentials: 'include' }));

  const phaseLabels = ['explain', 'visual-guide', 'credentials', 'confirm', 'catalogs', 'preview'];
  const currentPhaseIndex = phaseLabels.indexOf(phase);

  const connectDatabricks = async () => {
    setIsLoading(true); setError(null);
    try {
      const createRes = await authFetch('/connectors/enterprise', { method: 'POST', body: JSON.stringify({ enterpriseType: 'databricks', displayName: 'Databricks Workspace', scopeConfig: {}, budgetConfig: { max_bytes: 1073741824, max_rows: 1000000, max_cost_usd: 10.0, warn_at_percent: 80 } }) });
      if (!createRes.ok) throw new Error((await createRes.json()).error || 'Failed to create connector');
      const connector = await createRes.json();
      setConnectorId(connector.id);

      const connectRes = await authFetch(`/connectors/databricks/${connector.id}/connect`, { method: 'POST', body: JSON.stringify(credentials) });
      if (!connectRes.ok) throw new Error((await connectRes.json()).error || 'Failed to connect');
      setConnectionInfo({ workspaceUrl: credentials.workspaceUrl });
      setPhase('confirm');
    } catch (err) { setError(err.message); } finally { setIsLoading(false); }
  };

  const isEditing = !!existingConnector?.id;

  const loadCatalogs = useCallback(async () => {
    if (!connectorId) return;
    setIsLoading(true);
    setSchemaError(null);
    try {
      const res = await authFetch(`/connectors/databricks/${connectorId}/catalogs`);
      if (res.ok) {
        const data = await res.json();
        setCatalogs(data.catalogs || []);
      } else {
        const errorData = await res.json().catch(() => ({}));
        setSchemaError(errorData.error || errorData.message || 'Failed to load catalogs');
      }
    } catch (err) {
      console.error('Failed to load catalogs:', err);
      setSchemaError(err.message || 'Network error loading catalogs');
    } finally {
      setIsLoading(false);
    }
  }, [connectorId, authFetch]);

  const loadPreview = useCallback(async () => {
    if (!connectorId || selectedCatalogs.length === 0) { setPreview(null); return; }
    setIsLoading(true);
    try {
      const res = await authFetch(`/connectors/databricks/${connectorId}/preview-scan`, { method: 'POST', body: JSON.stringify({ catalogs: selectedCatalogs }) });
      if (res.ok) setPreview(await res.json());
    } catch (err) { console.error('Preview error:', err); } finally { setIsLoading(false); }
  }, [connectorId, selectedCatalogs, authFetch]);

  useEffect(() => { if (phase === 'catalogs' && connectorId) loadCatalogs(); }, [phase, connectorId, loadCatalogs]);
  useEffect(() => { if (phase === 'preview' && connectorId) loadPreview(); }, [phase, connectorId, loadPreview]);

  const toggleCatalog = (name) => setSelectedCatalogs(prev => prev.includes(name) ? prev.filter(c => c !== name) : [...prev, name]);

  const confirmAndComplete = async () => {
    if (!confirmed) return;
    setIsLoading(true);
    setError(null);
    try {
      // 1. Update scope config with selected catalogs
      const scopeRes = await authFetch(`/connectors/databricks/${connectorId}/scope`, {
        method: 'PUT',
        body: JSON.stringify({ catalogs: selectedCatalogs }),
      });
      if (!scopeRes.ok) throw new Error((await scopeRes.json()).error || 'Failed to update scope');

      // 2. Confirm scope with consent
      const confirmRes = await authFetch(`/connectors/databricks/${connectorId}/confirm`, {
        method: 'POST',
        body: JSON.stringify({ confirmed: true }),
      });
      if (!confirmRes.ok) throw new Error((await confirmRes.json()).error || 'Failed to confirm scope');

      // 3. Complete the wizard
      onComplete?.({ id: connectorId, type: 'databricks', connection: connectionInfo, catalogs: selectedCatalogs });
    } catch (err) { setError(err.message); } finally { setIsLoading(false); }
  };

  const renderPhase = () => {
    switch (phase) {
      case 'explain':
        return (
          <div className="space-y-6" data-tour="databricks-explain">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-[#FF3621]/10 flex items-center justify-center mb-4"><Icons.Databricks /></div>
              <h2 className="text-xl font-semibold text-gray-900">Connect Databricks</h2>
              <p className="text-gray-500 mt-2">Access Unity Catalog metadata and table schemas</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-5 space-y-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2"><Icons.Info className="text-slate" />What you'll need</h3>
              <div className="space-y-3 text-sm">
                <div className="flex gap-3"><div className="w-6 h-6 rounded-full bg-[#FF3621]/10 flex items-center justify-center flex-shrink-0"><Icons.Link className="w-3.5 h-3.5 text-[#FF3621]" /></div><div><p className="font-medium text-gray-900">Workspace URL</p><p className="text-gray-500">Your Databricks workspace URL (e.g., https://adb-xxx.azuredatabricks.net)</p></div></div>
                <div className="flex gap-3"><div className="w-6 h-6 rounded-full bg-[#FF3621]/10 flex items-center justify-center flex-shrink-0"><Icons.Key className="w-3.5 h-3.5 text-[#FF3621]" /></div><div><p className="font-medium text-gray-900">Personal Access Token</p><p className="text-gray-500">Generated from User Settings in your workspace</p></div></div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg"><Icons.Shield className="text-green-600 flex-shrink-0" /><div className="text-sm"><p className="font-medium text-green-800">Read-only metadata access</p><p className="text-green-700">Skatalyst only reads catalog metadata and table schemas. No data rows are accessed or modified.</p></div></div>
            <div className="flex gap-3"><button onClick={onCancel} className="flex-1 py-3 px-4 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">Cancel</button><button onClick={() => setPhase('visual-guide')} className="flex-1 py-3 px-4 rounded-lg bg-slate text-white font-medium hover:bg-slate/90 flex items-center justify-center gap-2">Continue<Icons.ArrowRight /></button></div>
          </div>
        );

      case 'visual-guide':
        return (
          <div className="space-y-6" data-tour="databricks-visual-guide">
            <div className="text-center"><div className="w-12 h-12 mx-auto rounded-xl bg-slate/10 flex items-center justify-center text-slate mb-3"><Icons.Eye /></div><h2 className="text-xl font-semibold text-gray-900">Where to find your credentials</h2><p className="text-gray-500 mt-2">In your Databricks workspace:</p></div>
            <DatabricksUIPreview />
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4"><div className="flex items-start gap-3"><Icons.Info className="text-blue-600 flex-shrink-0 mt-0.5" /><div className="text-sm text-blue-800"><p className="font-medium">How to generate a token</p><ul className="mt-1 space-y-1 list-disc list-inside text-blue-700"><li>Go to your Databricks workspace</li><li>Click your profile → User Settings</li><li>Developer → Access Tokens → Generate New Token</li><li>Copy the token (you won't see it again)</li></ul></div></div></div>
            <div className="flex gap-3"><button onClick={() => setPhase('explain')} className="flex-1 py-3 px-4 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">Back</button><button onClick={() => setPhase('credentials')} className="flex-1 py-3 px-4 rounded-lg bg-slate text-white font-medium hover:bg-slate/90 flex items-center justify-center gap-2">Enter Credentials<Icons.ArrowRight /></button></div>
          </div>
        );

      case 'credentials':
        return (
          <div className="space-y-6" data-tour="databricks-credentials">
            <div className="text-center"><div className="w-12 h-12 mx-auto rounded-xl bg-[#FF3621]/10 flex items-center justify-center mb-3"><Icons.Key className="w-6 h-6 text-[#FF3621]" /></div><h2 className="text-xl font-semibold text-gray-900">Enter Databricks Credentials</h2><p className="text-gray-500 mt-2">Provide your workspace URL and access token</p></div>
            <div className="space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Workspace URL</label><input type="url" value={credentials.workspaceUrl} onChange={(e) => setCredentials({...credentials, workspaceUrl: e.target.value})} placeholder="https://adb-1234567890.1.azuredatabricks.net" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate/20 focus:border-slate" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Personal Access Token</label><div className="relative"><input type={showToken ? 'text' : 'password'} value={credentials.accessToken} onChange={(e) => setCredentials({...credentials, accessToken: e.target.value})} placeholder="dapi1234567890abcdef..." className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate/20 focus:border-slate font-mono" /><button type="button" onClick={() => setShowToken(!showToken)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">{showToken ? <Icons.EyeOff /> : <Icons.Eye />}</button></div></div>
            </div>
            {error && <div className="p-4 bg-red-50 border border-red-200 rounded-lg"><div className="flex items-center gap-2 text-red-700"><Icons.Warning /><span className="text-sm font-medium">{error}</span></div></div>}
            <div className="flex gap-3"><button onClick={() => setPhase('visual-guide')} disabled={isLoading} className="flex-1 py-3 px-4 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50">Back</button><button onClick={connectDatabricks} disabled={isLoading || !credentials.workspaceUrl || !credentials.accessToken} className="flex-1 py-3 px-4 rounded-lg bg-slate text-white font-medium hover:bg-slate/90 disabled:opacity-50 flex items-center justify-center gap-2">{isLoading ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Connecting...</> : <>Connect<Icons.ArrowRight /></>}</button></div>
          </div>
        );

      case 'confirm':
        return (
          <div className="space-y-6" data-tour="databricks-confirm">
            <div className="text-center"><div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center text-green-600 mb-4"><Icons.Check /></div><h2 className="text-xl font-semibold text-gray-900">Connected!</h2><p className="text-gray-500 mt-2">Successfully connected to Databricks workspace</p></div>
            <div className="bg-gray-50 rounded-xl p-5"><div className="flex items-center gap-4"><div className="w-14 h-14 rounded-full bg-[#FF3621]/20 flex items-center justify-center"><Icons.Databricks /></div><div className="flex-1"><p className="font-semibold text-gray-900">Databricks Workspace</p><p className="text-sm text-gray-500 truncate">{connectionInfo?.workspaceUrl}</p></div><div className="text-green-600"><Icons.Check /></div></div></div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4"><div className="flex items-start gap-3"><Icons.Info className="text-blue-600 flex-shrink-0 mt-0.5" /><div className="text-sm text-blue-800"><p className="font-medium">Next: Select catalogs to scan</p><p className="mt-1">Choose which Unity Catalog catalogs to include. Only selected catalogs will be accessed.</p></div></div></div>
            <div className="flex gap-3"><button onClick={onCancel} className="flex-1 py-3 px-4 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">Cancel</button><button onClick={() => setPhase('catalogs')} className="flex-1 py-3 px-4 rounded-lg bg-slate text-white font-medium hover:bg-slate/90 flex items-center justify-center gap-2">Select Catalogs<Icons.ArrowRight /></button></div>
          </div>
        );

      case 'catalogs':
        return (
          <div className="space-y-6">
            <div><h2 className="text-xl font-semibold text-gray-900">{isEditing ? 'Edit Catalog Selection' : 'Select Catalogs'}</h2><p className="text-gray-500 mt-1">Choose which Unity Catalog catalogs to scan</p></div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"><Icons.Databricks className="text-[#FF3621]" /><span className="text-sm text-gray-600 truncate">{connectionInfo?.workspaceUrl}</span></div>
            {schemaError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-2 text-red-700">
                  <Icons.Warning className="flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium">Failed to load catalogs</p>
                    <p className="mt-1">{schemaError.includes('No running cluster') ? 'No running cluster available. Start a cluster in your Databricks workspace to browse catalogs.' : schemaError}</p>
                    <button onClick={loadCatalogs} className="mt-2 underline hover:no-underline">Retry</button>
                  </div>
                </div>
              </div>
            )}
            <div className="max-h-64 overflow-y-auto">{isLoading && catalogs.length === 0 ? <div className="p-8 text-center"><div className="w-8 h-8 border-2 border-[#FF3621] border-t-transparent rounded-full animate-spin mx-auto mb-3" /><p className="text-gray-500">Loading catalogs...</p></div> : <CatalogSelector catalogs={catalogs} selectedCatalogs={selectedCatalogs} onToggle={toggleCatalog} />}</div>
            {selectedCatalogs.length > 0 && <div className="p-3 bg-slate/5 rounded-lg border border-slate/20"><p className="text-sm text-slate"><span className="font-medium">{selectedCatalogs.length}</span> catalog{selectedCatalogs.length !== 1 ? 's' : ''} selected</p></div>}
            <div className="flex gap-3"><button onClick={isEditing ? onCancel : () => setPhase('confirm')} className="flex-1 py-3 px-4 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">{isEditing ? 'Cancel' : 'Back'}</button><button onClick={() => setPhase('preview')} disabled={selectedCatalogs.length === 0} className="flex-1 py-3 px-4 rounded-lg bg-slate text-white font-medium hover:bg-slate/90 disabled:opacity-50 disabled:cursor-not-allowed">Preview Scan</button></div>
          </div>
        );

      case 'preview':
        return (
          <div className="space-y-6">
            <div><h2 className="text-xl font-semibold text-gray-900">Review & Confirm</h2><p className="text-gray-500 mt-1">Preview what will be scanned before confirming</p></div>
            <ScanPreview preview={preview} isLoading={isLoading} />
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg"><label className="flex items-start gap-3 cursor-pointer"><input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} className="mt-1 w-5 h-5 rounded border-gray-300 text-slate focus:ring-slate/20" /><span className="text-sm text-gray-700">I confirm I want to scan these catalogs. Only catalog metadata and table schemas will be accessed (no data rows).</span></label></div>
            {error && <div className="p-4 bg-red-50 border border-red-200 rounded-lg"><div className="flex items-center gap-2 text-red-700"><Icons.Warning /><span className="text-sm font-medium">{error}</span></div></div>}
            <div className="flex gap-3"><button onClick={() => setPhase('catalogs')} disabled={isLoading} className="flex-1 py-3 px-4 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50">Back</button><button onClick={confirmAndComplete} disabled={!confirmed || isLoading || (preview && !preview.budget?.withinBudget)} className="flex-1 py-3 px-4 rounded-lg bg-slate text-white font-medium hover:bg-slate/90 disabled:opacity-50 disabled:cursor-not-allowed">{isLoading ? 'Confirming...' : 'Confirm & Connect'}</button></div>
          </div>
        );

      default: return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/50" onClick={onCancel} />
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg">
          <div className="border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3"><div className="p-2 bg-[#FF3621]/10 rounded-xl"><Icons.Databricks /></div><div><h2 className="font-semibold text-gray-900">Databricks</h2><p className="text-xs text-gray-500">Data Lakehouse Connector</p></div></div>
              <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 transition-colors"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <PhaseIndicator currentPhase={currentPhaseIndex} phases={phaseLabels} />
          </div>
          <div className="p-6">{renderPhase()}</div>
        </div>
      </div>
    </div>
  );
}
