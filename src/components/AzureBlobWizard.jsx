/**
 * Azure Blob Storage Wizard - 4-Phase Ingestion Flow
 *
 * Follows the strict 4-phase ingestion UX pattern:
 * 1. EXPLAIN - Tell user what they're about to do
 * 2. VISUAL GUIDANCE - Show what credentials are needed (Azure Portal)
 * 3. ACTION - Enter Azure credentials
 * 4. CONFIRMATION - Confirm container selection + preview
 */

import { useState, useEffect, useCallback } from 'react';

const Icons = {
  Azure: () => (
    <svg className="w-8 h-8" viewBox="0 0 24 24">
      <path fill="#0089D6" d="M13.05 4.24l-5.52 15.52H4.48L10 4.24h3.05zm-1.93 5.38l4.89 10.14H22l-7.39-10.14h-3.49z"/>
    </svg>
  ),
  Container: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
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
  EyeOff: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
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

function PhaseIndicator({ currentPhase, phases }) {
  return (
    <div className="flex gap-2 mt-4">
      {phases.map((phase, i) => <div key={phase} className={`h-1.5 flex-1 rounded-full transition-colors ${i <= currentPhase ? 'bg-slate' : 'bg-gray-200'}`} />)}
    </div>
  );
}

function AzurePortalPreview() {
  return (
    <div className="relative" data-tour="azure-credential-guide">
      <div className="bg-[#0078d4] rounded-lg overflow-hidden">
        <div className="px-4 py-2 flex items-center gap-3 border-b border-blue-600">
          <Icons.Azure />
          <span className="text-white text-sm">Azure Portal</span>
          <span className="text-blue-200 text-xs">→ Storage Account → Access Keys</span>
        </div>
        <div className="bg-[#1b1b1b] p-4 text-sm font-mono text-gray-300 space-y-3">
          <div className="bg-gray-800/50 rounded p-3 space-y-2">
            <div className="flex gap-2"><span className="text-blue-400 w-32">Account Name:</span><span className="text-yellow-300">mystorageaccount</span></div>
            <div className="flex gap-2"><span className="text-blue-400 w-32">Connection String:</span><span className="text-yellow-300 truncate">DefaultEndpointsProtocol=https;Account...</span></div>
            <div className="text-gray-500 text-xs mt-2">— or use SAS Token —</div>
            <div className="flex gap-2"><span className="text-blue-400 w-32">SAS Token:</span><span className="text-yellow-300 truncate">?sv=2021-06-08&ss=b&srt=sco...</span></div>
          </div>
        </div>
      </div>
      <div className="absolute -top-3 -right-3 bg-slate text-white text-xs px-2 py-1 rounded-full shadow-lg">Example</div>
    </div>
  );
}

function ContainerSelector({ containers, selectedContainers, onToggle }) {
  if (!containers || containers.length === 0) return <div className="p-6 text-center text-gray-500"><Icons.Container className="w-8 h-8 mx-auto mb-2 opacity-50" /><p>No containers available</p></div>;

  return (
    <div className="space-y-2" data-tour="azure-container-select">
      {containers.map((container) => {
        const containerName = container.name || container;
        const isSelected = selectedContainers.includes(containerName);
        return (
          <button key={containerName} onClick={() => onToggle(containerName)} className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all ${isSelected ? 'border-slate/40 bg-slate/5' : 'border-gray-200 hover:border-slate/30'}`}>
            <div className={`p-1.5 rounded ${isSelected ? 'bg-slate text-white' : 'bg-gray-100 text-gray-500'}`}><Icons.Container /></div>
            <div className="flex-1 text-left"><p className="font-medium text-gray-900">{containerName}</p></div>
            {isSelected && <div className="text-slate"><Icons.Check /></div>}
          </button>
        );
      })}
    </div>
  );
}

function ScanPreview({ preview, isLoading }) {
  if (isLoading) return <div className="p-8 text-center"><div className="w-8 h-8 border-2 border-slate border-t-transparent rounded-full animate-spin mx-auto mb-4" /><p className="text-gray-500">Calculating estimates...</p></div>;
  if (!preview) return <div className="p-6 text-center text-gray-500"><p>Select containers to see scan preview</p></div>;

  return (
    <div className="space-y-4" data-tour="azure-preview">
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 bg-gray-50 rounded-lg text-center border border-gray-100"><p className="text-xl font-bold text-slate">{preview.estimates?.totalItems || preview.estimates?.totalBlobs || 0}</p><p className="text-xs text-gray-500">Blobs</p></div>
        <div className="p-3 bg-gray-50 rounded-lg text-center border border-gray-100"><p className="text-xl font-bold text-slate">{formatBytes(preview.estimates?.totalBytes || 0)}</p><p className="text-xs text-gray-500">Total Size</p></div>
        <div className="p-3 bg-gray-50 rounded-lg text-center border border-gray-100"><p className="text-xl font-bold text-slate">{preview.estimates?.containers || 0}</p><p className="text-xs text-gray-500">Containers</p></div>
      </div>
      {preview.budget && (
        <div className={`p-3 rounded-lg border ${preview.budget.withinBudget ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <div className="flex items-center gap-2">{preview.budget.withinBudget ? <><span className="text-green-600"><Icons.Check /></span><span className="text-sm font-medium text-green-700">Within budget limits</span></> : <><span className="text-red-600"><Icons.Warning /></span><span className="text-sm font-medium text-red-700">Would exceed {preview.budget.exceededType} limit</span></>}</div>
        </div>
      )}
      {preview.sampleFiles?.length > 0 && (
        <div><h4 className="text-sm font-medium text-gray-700 mb-2">Sample Blobs</h4><div className="bg-gray-50 rounded-lg divide-y divide-gray-100 border border-gray-200">{preview.sampleFiles.slice(0, 5).map((file, i) => <div key={i} className="flex items-center gap-3 px-3 py-2"><span className="text-gray-400"><Icons.File /></span><span className="flex-1 text-sm text-gray-900 truncate">{file.name}</span><span className="text-xs text-gray-500">{formatBytes(file.size || 0)}</span></div>)}</div></div>
      )}
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg"><h4 className="text-sm font-medium text-blue-800 mb-1">Source Context</h4><p className="text-xs text-blue-700">Provider: Azure Blob Storage | Read-only: Yes | Objects: containers, blobs</p></div>
    </div>
  );
}

export default function AzureBlobWizard({ existingConnector, onComplete, onCancel, authFetch: propAuthFetch }) {
  // If existingConnector is provided, start at containers phase (scope-only mode)
  const [phase, setPhase] = useState(existingConnector ? 'containers' : 'explain');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSecret, setShowSecret] = useState(false);

  const [connectorId, setConnectorId] = useState(existingConnector?.id || null);
  const [credentials, setCredentials] = useState({ connectionString: '', accountName: '', sasToken: '' });
  const [connectorName, setConnectorName] = useState('');
  const [authMethod, setAuthMethod] = useState('connectionString');
  const [connectionInfo, setConnectionInfo] = useState(existingConnector ? { accountName: 'Connected' } : null);

  const [containers, setContainers] = useState([]);
  const [selectedContainers, setSelectedContainers] = useState(existingConnector?.containers || []);
  const [preview, setPreview] = useState(null);
  const [confirmed, setConfirmed] = useState(false);

  const authFetch = propAuthFetch || ((url, options = {}) => fetch(`/api${url}`, { ...options, headers: { 'Content-Type': 'application/json', ...options.headers }, credentials: 'include' }));

  // Phase labels depend on whether we're in scope-only mode
  const phaseLabels = existingConnector
    ? ['containers', 'preview']
    : ['explain', 'visual-guide', 'credentials', 'confirm', 'containers', 'preview'];
  const currentPhaseIndex = phaseLabels.indexOf(phase);

  const connectAzure = async () => {
    setIsLoading(true); setError(null);
    try {
      // Use custom name or default to "Azure Blob Storage"
      const displayName = connectorName.trim() || 'Azure Blob Storage';
      const createRes = await authFetch('/connectors/enterprise', { method: 'POST', body: JSON.stringify({ enterpriseType: 'azure_blob', displayName, scopeConfig: {}, budgetConfig: { max_bytes: 1073741824, max_rows: 1000000, max_cost_usd: 10.0, warn_at_percent: 80 } }) });
      if (!createRes.ok) throw new Error((await createRes.json()).error || 'Failed to create connector');
      const connector = await createRes.json();
      setConnectorId(connector.id);

      const connectRes = await authFetch(`/connectors/azureblob/${connector.id}/connect`, { method: 'POST', body: JSON.stringify(credentials) });
      if (!connectRes.ok) throw new Error((await connectRes.json()).error || 'Failed to connect');
      setConnectionInfo({ accountName: credentials.accountName || 'Connected' });
      setPhase('confirm');
    } catch (err) { setError(err.message); } finally { setIsLoading(false); }
  };

  const loadContainers = useCallback(async () => {
    if (!connectorId) return;
    setIsLoading(true);
    try {
      const res = await authFetch(`/connectors/azureblob/${connectorId}/containers`);
      if (res.ok) setContainers((await res.json()).containers || []);
    } catch (err) { console.error('Failed to load containers:', err); } finally { setIsLoading(false); }
  }, [connectorId, authFetch]);

  const loadPreview = useCallback(async () => {
    if (!connectorId) { setPreview(null); return; }
    setIsLoading(true);
    try {
      // Backend will scan all containers if none are specified
      const res = await authFetch(`/connectors/azureblob/${connectorId}/preview-scan`, { method: 'POST', body: JSON.stringify({ containers: selectedContainers }) });
      if (res.ok) setPreview(await res.json());
    } catch (err) { console.error('Preview error:', err); } finally { setIsLoading(false); }
  }, [connectorId, selectedContainers, authFetch]);

  useEffect(() => { if (phase === 'containers' && connectorId) loadContainers(); }, [phase, connectorId, loadContainers]);
  useEffect(() => { if (phase === 'preview' && connectorId) loadPreview(); }, [phase, connectorId, loadPreview]);

  const toggleContainer = (name) => setSelectedContainers(prev => prev.includes(name) ? prev.filter(c => c !== name) : [...prev, name]);

  const confirmAndComplete = async () => {
    if (!confirmed) return;
    setIsLoading(true);
    try {
      // Update scope with selected containers
      const scopeRes = await authFetch(`/connectors/azureblob/${connectorId}/scope`, {
        method: 'PUT',
        body: JSON.stringify({ containers: selectedContainers, prefixes: [] })
      });
      if (!scopeRes.ok) throw new Error((await scopeRes.json()).error || 'Failed to update scope');

      // Confirm scope
      const confirmRes = await authFetch(`/connectors/azureblob/${connectorId}/confirm`, { method: 'POST' });
      if (!confirmRes.ok) throw new Error((await confirmRes.json()).error || 'Failed to confirm scope');

      onComplete?.({ id: connectorId, type: 'azure_blob', connection: connectionInfo, containers: selectedContainers });
    } catch (err) { setError(err.message); } finally { setIsLoading(false); }
  };

  const renderPhase = () => {
    switch (phase) {
      case 'explain':
        return (
          <div className="space-y-6" data-tour="azure-explain">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-[#0089D6]/10 flex items-center justify-center mb-4"><Icons.Azure /></div>
              <h2 className="text-xl font-semibold text-gray-900">Connect Azure Blob Storage</h2>
              <p className="text-gray-500 mt-2">Scan blobs from your Azure storage containers</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-5 space-y-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2"><Icons.Info className="text-slate" />What you'll need</h3>
              <div className="space-y-3 text-sm">
                <div className="flex gap-3"><div className="w-6 h-6 rounded-full bg-[#0089D6]/10 flex items-center justify-center flex-shrink-0"><Icons.Key className="w-3.5 h-3.5 text-[#0089D6]" /></div><div><p className="font-medium text-gray-900">Connection String or SAS Token</p><p className="text-gray-500">From your Storage Account in Azure Portal</p></div></div>
                <div className="flex gap-3"><div className="w-6 h-6 rounded-full bg-[#0089D6]/10 flex items-center justify-center flex-shrink-0"><Icons.Container className="w-3.5 h-3.5 text-[#0089D6]" /></div><div><p className="font-medium text-gray-900">Container access</p><p className="text-gray-500">Read permissions on the containers you want to scan</p></div></div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg"><Icons.Shield className="text-green-600 flex-shrink-0" /><div className="text-sm"><p className="font-medium text-green-800">Read-only access recommended</p><p className="text-green-700">Use a SAS token with only Read and List permissions for maximum security.</p></div></div>
            <div className="flex gap-3"><button onClick={onCancel} className="flex-1 py-3 px-4 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">Cancel</button><button onClick={() => setPhase('visual-guide')} className="flex-1 py-3 px-4 rounded-lg bg-slate text-white font-medium hover:bg-slate/90 flex items-center justify-center gap-2">Continue<Icons.ArrowRight /></button></div>
          </div>
        );

      case 'visual-guide':
        return (
          <div className="space-y-6" data-tour="azure-visual-guide">
            <div className="text-center"><div className="w-12 h-12 mx-auto rounded-xl bg-slate/10 flex items-center justify-center text-slate mb-3"><Icons.Eye /></div><h2 className="text-xl font-semibold text-gray-900">Where to find your credentials</h2><p className="text-gray-500 mt-2">In Azure Portal, go to your Storage Account:</p></div>
            <AzurePortalPreview />
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4"><div className="flex items-start gap-3"><Icons.Info className="text-blue-600 flex-shrink-0 mt-0.5" /><div className="text-sm text-blue-800"><p className="font-medium">Finding your credentials</p><ul className="mt-1 space-y-1 list-disc list-inside text-blue-700"><li>Azure Portal → Storage Accounts → Your Account</li><li>Access keys tab → Copy Connection String</li><li>Or: Shared access signature → Generate SAS Token</li></ul></div></div></div>
            <div className="flex gap-3"><button onClick={() => setPhase('explain')} className="flex-1 py-3 px-4 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">Back</button><button onClick={() => setPhase('credentials')} className="flex-1 py-3 px-4 rounded-lg bg-slate text-white font-medium hover:bg-slate/90 flex items-center justify-center gap-2">Enter Credentials<Icons.ArrowRight /></button></div>
          </div>
        );

      case 'credentials':
        return (
          <div className="space-y-6" data-tour="azure-credentials">
            <div className="text-center"><div className="w-12 h-12 mx-auto rounded-xl bg-[#0089D6]/10 flex items-center justify-center mb-3"><Icons.Key className="w-6 h-6 text-[#0089D6]" /></div><h2 className="text-xl font-semibold text-gray-900">Enter Azure Credentials</h2><p className="text-gray-500 mt-2">Provide your storage account credentials</p></div>

            <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
              <button onClick={() => setAuthMethod('connectionString')} className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${authMethod === 'connectionString' ? 'bg-white shadow text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}>Connection String</button>
              <button onClick={() => setAuthMethod('sasToken')} className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${authMethod === 'sasToken' ? 'bg-white shadow text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}>SAS Token</button>
            </div>

            <div className="space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Connector Name <span className="text-gray-400 font-normal">(optional)</span></label><input type="text" value={connectorName} onChange={(e) => setConnectorName(e.target.value)} placeholder="e.g., Production Storage" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate/20 focus:border-slate" /></div>
              {authMethod === 'connectionString' ? (
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Connection String</label><div className="relative"><textarea value={credentials.connectionString} onChange={(e) => setCredentials({...credentials, connectionString: e.target.value})} placeholder="DefaultEndpointsProtocol=https;AccountName=..." rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate/20 focus:border-slate font-mono text-sm" /></div></div>
              ) : (
                <>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Storage Account Name</label><input type="text" value={credentials.accountName} onChange={(e) => setCredentials({...credentials, accountName: e.target.value})} placeholder="mystorageaccount" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate/20 focus:border-slate" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">SAS Token</label><div className="relative"><textarea value={credentials.sasToken} onChange={(e) => setCredentials({...credentials, sasToken: e.target.value})} placeholder="?sv=2021-06-08&ss=b&srt=sco&sp=rl..." rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate/20 focus:border-slate font-mono text-sm" /></div></div>
                </>
              )}
            </div>

            {error && <div className="p-4 bg-red-50 border border-red-200 rounded-lg"><div className="flex items-center gap-2 text-red-700"><Icons.Warning /><span className="text-sm font-medium">{error}</span></div></div>}
            <div className="flex gap-3"><button onClick={() => setPhase('visual-guide')} disabled={isLoading} className="flex-1 py-3 px-4 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50">Back</button><button onClick={connectAzure} disabled={isLoading || (authMethod === 'connectionString' ? !credentials.connectionString : (!credentials.accountName || !credentials.sasToken))} className="flex-1 py-3 px-4 rounded-lg bg-slate text-white font-medium hover:bg-slate/90 disabled:opacity-50 flex items-center justify-center gap-2">{isLoading ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Connecting...</> : <>Connect<Icons.ArrowRight /></>}</button></div>
          </div>
        );

      case 'confirm':
        return (
          <div className="space-y-6" data-tour="azure-confirm">
            <div className="text-center"><div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center text-green-600 mb-4"><Icons.Check /></div><h2 className="text-xl font-semibold text-gray-900">Connected!</h2><p className="text-gray-500 mt-2">Successfully connected to Azure Blob Storage</p></div>
            <div className="bg-gray-50 rounded-xl p-5"><div className="flex items-center gap-4"><div className="w-14 h-14 rounded-full bg-[#0089D6]/20 flex items-center justify-center"><Icons.Azure /></div><div className="flex-1"><p className="font-semibold text-gray-900">Azure Blob Storage</p><p className="text-sm text-gray-500">{connectionInfo?.accountName}</p></div><div className="text-green-600"><Icons.Check /></div></div></div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4"><div className="flex items-start gap-3"><Icons.Info className="text-blue-600 flex-shrink-0 mt-0.5" /><div className="text-sm text-blue-800"><p className="font-medium">Next: Select containers to scan</p><p className="mt-1">Choose which containers to include. Only selected containers will be accessed.</p></div></div></div>
            <div className="flex gap-3"><button onClick={onCancel} className="flex-1 py-3 px-4 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">Cancel</button><button onClick={() => setPhase('containers')} className="flex-1 py-3 px-4 rounded-lg bg-slate text-white font-medium hover:bg-slate/90 flex items-center justify-center gap-2">Select Containers<Icons.ArrowRight /></button></div>
          </div>
        );

      case 'containers':
        return (
          <div className="space-y-6">
            <div><h2 className="text-xl font-semibold text-gray-900">Select Containers</h2><p className="text-gray-500 mt-1">Choose which containers to scan</p></div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"><Icons.Azure className="text-[#0089D6]" /><span className="text-sm text-gray-600">Account: <span className="font-medium text-gray-900">{connectionInfo?.accountName}</span></span></div>
            <div className="max-h-64 overflow-y-auto">{isLoading && containers.length === 0 ? <div className="p-8 text-center"><div className="w-8 h-8 border-2 border-[#0089D6] border-t-transparent rounded-full animate-spin mx-auto mb-3" /><p className="text-gray-500">Loading containers...</p></div> : <ContainerSelector containers={containers} selectedContainers={selectedContainers} onToggle={toggleContainer} />}</div>
            {selectedContainers.length > 0 && <div className="p-3 bg-slate/5 rounded-lg border border-slate/20"><p className="text-sm text-slate"><span className="font-medium">{selectedContainers.length}</span> container{selectedContainers.length !== 1 ? 's' : ''} selected</p></div>}
            <div className="flex gap-3"><button onClick={existingConnector ? onCancel : () => setPhase('confirm')} className="flex-1 py-3 px-4 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">{existingConnector ? 'Cancel' : 'Back'}</button><button onClick={() => setPhase('preview')} disabled={selectedContainers.length === 0} className="flex-1 py-3 px-4 rounded-lg bg-slate text-white font-medium hover:bg-slate/90 disabled:opacity-50 disabled:cursor-not-allowed">Preview Scan</button></div>
          </div>
        );

      case 'preview':
        return (
          <div className="space-y-6">
            <div><h2 className="text-xl font-semibold text-gray-900">Review & Confirm</h2><p className="text-gray-500 mt-1">Preview what will be scanned before confirming</p></div>
            <ScanPreview preview={preview} isLoading={isLoading} />
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg"><label className="flex items-start gap-3 cursor-pointer"><input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} className="mt-1 w-5 h-5 rounded border-gray-300 text-slate focus:ring-slate/20" /><span className="text-sm text-gray-700">I confirm I want to scan these containers. Only the selected containers will be accessed with read-only permissions.</span></label></div>
            {error && <div className="p-4 bg-red-50 border border-red-200 rounded-lg"><div className="flex items-center gap-2 text-red-700"><Icons.Warning /><span className="text-sm font-medium">{error}</span></div></div>}
            <div className="flex gap-3"><button onClick={() => setPhase('containers')} disabled={isLoading} className="flex-1 py-3 px-4 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50">Back</button><button onClick={confirmAndComplete} disabled={!confirmed || isLoading || (preview && !preview.budget?.withinBudget)} className="flex-1 py-3 px-4 rounded-lg bg-slate text-white font-medium hover:bg-slate/90 disabled:opacity-50 disabled:cursor-not-allowed">{isLoading ? 'Confirming...' : 'Confirm & Connect'}</button></div>
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
              <div className="flex items-center gap-3"><div className="p-2 bg-[#0089D6]/10 rounded-xl"><Icons.Azure /></div><div><h2 className="font-semibold text-gray-900">Azure Blob Storage</h2><p className="text-xs text-gray-500">Cloud Storage Connector</p></div></div>
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
