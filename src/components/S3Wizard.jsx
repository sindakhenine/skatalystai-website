/**
 * Amazon S3 Wizard - 4-Phase Ingestion Flow
 *
 * Follows the strict 4-phase ingestion UX pattern:
 * 1. EXPLAIN - Tell user what they're about to do
 * 2. VISUAL GUIDANCE - Show what credentials are needed (AWS Console)
 * 3. ACTION - Enter AWS credentials
 * 4. CONFIRMATION - Confirm bucket selection + preview
 */

import { useState, useEffect, useCallback } from 'react';

const Icons = {
  S3: () => (
    <svg className="w-8 h-8" viewBox="0 0 24 24">
      <path fill="#569A31" d="M12 2L2 7l10 5 10-5-10-5z"/>
      <path fill="#4B8F29" d="M2 17l10 5 10-5"/>
      <path fill="#569A31" d="M2 12l10 5 10-5"/>
    </svg>
  ),
  AWS: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#FF9900">
      <path d="M6.763 10.036c0 .296.032.535.088.71.064.176.144.368.256.576.04.063.056.127.056.183 0 .08-.048.16-.152.24l-.503.335a.383.383 0 0 1-.208.072c-.08 0-.16-.04-.239-.112a2.47 2.47 0 0 1-.287-.375 6.18 6.18 0 0 1-.248-.471c-.622.734-1.405 1.101-2.347 1.101-.67 0-1.205-.191-1.596-.574-.391-.384-.59-.894-.59-1.533 0-.678.239-1.23.726-1.644.487-.415 1.133-.623 1.955-.623.272 0 .551.024.846.064.296.04.6.104.918.176v-.583c0-.607-.127-1.03-.375-1.277-.255-.248-.686-.367-1.3-.367-.28 0-.568.031-.863.103-.296.064-.583.16-.863.28a2.13 2.13 0 0 1-.263.12c-.08.032-.136.048-.176.048-.152 0-.224-.11-.224-.336v-.392c0-.168.016-.296.064-.367a.67.67 0 0 1 .239-.2 4.81 4.81 0 0 1 1.02-.343 5.12 5.12 0 0 1 1.229-.152c.927 0 1.596.21 2.027.63.423.423.638 1.062.638 1.923v2.539h-.016zm-3.24 1.206c.263 0 .534-.047.822-.144.287-.096.55-.273.775-.527a1.4 1.4 0 0 0 .335-.63c.04-.16.064-.352.064-.576v-.28a6.02 6.02 0 0 0-.734-.136 5.73 5.73 0 0 0-.75-.048c-.535 0-.926.104-1.19.32-.263.215-.39.518-.39.917 0 .375.095.654.295.838.191.192.478.287.773.287zm6.41 1.07c-.2 0-.335-.031-.415-.096-.08-.056-.151-.176-.215-.352L6.985 5.373a1.37 1.37 0 0 1-.096-.415c0-.16.08-.248.239-.248h.783c.207 0 .35.032.422.096.08.056.144.176.2.352l1.94 7.648 1.8-7.648c.048-.176.112-.296.192-.352.08-.064.222-.096.422-.096h.639c.207 0 .35.032.422.096.08.056.152.176.2.352l1.822 7.735 2-7.735c.056-.176.127-.296.2-.352.079-.064.214-.096.414-.096h.742c.16 0 .248.08.248.248 0 .048-.008.096-.016.152a1.58 1.58 0 0 1-.08.271l-2.79 6.491c-.063.176-.135.296-.215.352-.08.064-.214.096-.415.096h-.686c-.207 0-.35-.032-.422-.104-.08-.063-.151-.184-.2-.36l-1.79-7.44-1.782 7.44c-.048.184-.112.304-.192.36-.08.072-.223.104-.43.104h-.686z"/>
    </svg>
  ),
  Bucket: () => (
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
      {phases.map((phase, i) => (
        <div key={phase} className={`h-1.5 flex-1 rounded-full transition-colors ${i <= currentPhase ? 'bg-slate' : 'bg-gray-200'}`} />
      ))}
    </div>
  );
}

function AWSConsolePreview() {
  return (
    <div className="relative" data-tour="s3-credential-guide">
      <div className="bg-[#232f3e] rounded-lg overflow-hidden">
        <div className="px-4 py-2 flex items-center gap-3 border-b border-gray-600">
          <Icons.AWS />
          <span className="text-white text-sm">AWS Console</span>
          <span className="text-gray-400 text-xs">→ IAM → Security Credentials</span>
        </div>
        <div className="p-4 text-sm font-mono text-gray-300 space-y-3">
          <div className="bg-gray-700/50 rounded p-3 space-y-2">
            <div className="flex gap-2">
              <span className="text-orange-400 w-28">Access Key ID:</span>
              <span className="text-yellow-300">AKIAIOSFODNN7EXAMPLE</span>
            </div>
            <div className="flex gap-2">
              <span className="text-orange-400 w-28">Secret Key:</span>
              <span className="text-yellow-300">wJalrXUtnFEMI/K7MDENG/bPxRfi...</span>
            </div>
            <div className="flex gap-2">
              <span className="text-orange-400 w-28">Region:</span>
              <span className="text-yellow-300">us-east-1</span>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute -top-3 -right-3 bg-slate text-white text-xs px-2 py-1 rounded-full shadow-lg">Example</div>
    </div>
  );
}

function BucketSelector({ buckets, selectedBuckets, onToggle }) {
  if (!buckets || buckets.length === 0) {
    return <div className="p-6 text-center text-gray-500"><Icons.Bucket className="w-8 h-8 mx-auto mb-2 opacity-50" /><p>No buckets available</p></div>;
  }

  return (
    <div className="space-y-2" data-tour="s3-bucket-select">
      {buckets.map((bucket) => {
        const bucketName = bucket.name || bucket;
        const isSelected = selectedBuckets.includes(bucketName);
        return (
          <button key={bucketName} onClick={() => onToggle(bucketName)} className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all ${isSelected ? 'border-slate/40 bg-slate/5' : 'border-gray-200 hover:border-slate/30'}`}>
            <div className={`p-1.5 rounded ${isSelected ? 'bg-slate text-white' : 'bg-gray-100 text-gray-500'}`}><Icons.Bucket /></div>
            <div className="flex-1 text-left">
              <p className="font-medium text-gray-900">{bucketName}</p>
              {bucket.region && <p className="text-xs text-gray-500">{bucket.region}</p>}
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
  if (!preview) return <div className="p-6 text-center text-gray-500"><p>Select buckets to see scan preview</p></div>;

  return (
    <div className="space-y-4" data-tour="s3-preview">
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 bg-gray-50 rounded-lg text-center border border-gray-100"><p className="text-xl font-bold text-slate">{preview.estimates?.totalObjects || 0}</p><p className="text-xs text-gray-500">Objects</p></div>
        <div className="p-3 bg-gray-50 rounded-lg text-center border border-gray-100"><p className="text-xl font-bold text-slate">{formatBytes(preview.estimates?.totalBytes || 0)}</p><p className="text-xs text-gray-500">Total Size</p></div>
        <div className="p-3 bg-gray-50 rounded-lg text-center border border-gray-100"><p className="text-xl font-bold text-slate">{preview.estimates?.folders || 0}</p><p className="text-xs text-gray-500">Prefixes</p></div>
      </div>
      {preview.budget && (
        <div className={`p-3 rounded-lg border ${preview.budget.withinBudget ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <div className="flex items-center gap-2">
            {preview.budget.withinBudget ? <><span className="text-green-600"><Icons.Check /></span><span className="text-sm font-medium text-green-700">Within budget limits</span></> : <><span className="text-red-600"><Icons.Warning /></span><span className="text-sm font-medium text-red-700">Would exceed {preview.budget.exceededType} limit</span></>}
          </div>
        </div>
      )}
      {preview.sampleFiles?.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Sample Objects</h4>
          <div className="bg-gray-50 rounded-lg divide-y divide-gray-100 border border-gray-200">
            {preview.sampleFiles.slice(0, 5).map((file, i) => <div key={i} className="flex items-center gap-3 px-3 py-2"><span className="text-gray-400"><Icons.File /></span><span className="flex-1 text-sm text-gray-900 truncate">{file.key || file.name}</span><span className="text-xs text-gray-500">{formatBytes(file.size || 0)}</span></div>)}
          </div>
        </div>
      )}
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg"><h4 className="text-sm font-medium text-blue-800 mb-1">Source Context</h4><p className="text-xs text-blue-700">Provider: Amazon S3 | Read-only: Yes | Objects: buckets, prefixes, objects</p></div>
    </div>
  );
}

export default function S3Wizard({ existingConnector, onComplete, onCancel, authFetch: propAuthFetch }) {
  // If there's an existing connector, start at buckets phase
  const [phase, setPhase] = useState(existingConnector ? 'buckets' : 'explain');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSecret, setShowSecret] = useState(false);

  const [connectorId, setConnectorId] = useState(existingConnector?.id || null);
  const [credentials, setCredentials] = useState({ accessKeyId: '', secretAccessKey: '', region: 'us-east-1' });
  const [connectorName, setConnectorName] = useState('');
  const [connectionInfo, setConnectionInfo] = useState(
    existingConnector ? { region: existingConnector.region || 'us-east-1' } : null
  );

  const [buckets, setBuckets] = useState([]);
  const [selectedBuckets, setSelectedBuckets] = useState(existingConnector?.buckets || []);
  const [preview, setPreview] = useState(null);
  const [confirmed, setConfirmed] = useState(false);

  // Update state when existingConnector prop changes
  useEffect(() => {
    if (existingConnector) {
      setPhase('buckets');
      setConnectorId(existingConnector.id);
      setConnectionInfo({ region: existingConnector.region || 'us-east-1' });
      setSelectedBuckets(existingConnector.buckets || []);
    }
  }, [existingConnector]);

  const authFetch = propAuthFetch || ((url, options = {}) => fetch(`/api${url}`, { ...options, headers: { 'Content-Type': 'application/json', ...options.headers }, credentials: 'include' }));

  // Different phase labels for new vs existing connector
  const phaseLabels = existingConnector
    ? ['buckets', 'preview']
    : ['explain', 'visual-guide', 'credentials', 'confirm', 'buckets', 'preview'];
  const currentPhaseIndex = phaseLabels.indexOf(phase);

  const connectS3 = async () => {
    setIsLoading(true); setError(null);
    try {
      // Use custom name or default to "Amazon S3 - region"
      const displayName = connectorName.trim() || `Amazon S3 - ${credentials.region}`;
      const createRes = await authFetch('/connectors/enterprise', { method: 'POST', body: JSON.stringify({ enterpriseType: 'aws_s3', displayName, scopeConfig: {}, budgetConfig: { max_bytes: 1073741824, max_rows: 1000000, max_cost_usd: 10.0, warn_at_percent: 80 } }) });
      if (!createRes.ok) throw new Error((await createRes.json()).error || 'Failed to create connector');
      const connector = await createRes.json();
      setConnectorId(connector.id);

      const connectRes = await authFetch(`/connectors/s3/${connector.id}/connect`, { method: 'POST', body: JSON.stringify(credentials) });
      if (!connectRes.ok) throw new Error((await connectRes.json()).error || 'Failed to connect');
      setConnectionInfo({ region: credentials.region, keyId: credentials.accessKeyId.slice(0, 8) + '...' });
      setPhase('confirm');
    } catch (err) { setError(err.message); } finally { setIsLoading(false); }
  };

  const loadBuckets = useCallback(async () => {
    if (!connectorId) return;
    setIsLoading(true);
    try {
      const res = await authFetch(`/connectors/s3/${connectorId}/buckets`);
      if (res.ok) setBuckets((await res.json()).buckets || []);
    } catch (err) { console.error('Failed to load buckets:', err); } finally { setIsLoading(false); }
  }, [connectorId, authFetch]);

  const loadPreview = useCallback(async () => {
    if (!connectorId || selectedBuckets.length === 0) { setPreview(null); return; }
    setIsLoading(true);
    try {
      const res = await authFetch(`/connectors/s3/${connectorId}/preview-scan`, { method: 'POST', body: JSON.stringify({ buckets: selectedBuckets }) });
      if (res.ok) setPreview(await res.json());
    } catch (err) { console.error('Preview error:', err); } finally { setIsLoading(false); }
  }, [connectorId, selectedBuckets, authFetch]);

  useEffect(() => { if (phase === 'buckets' && connectorId) loadBuckets(); }, [phase, connectorId, loadBuckets]);
  useEffect(() => { if (phase === 'preview' && connectorId) loadPreview(); }, [phase, connectorId, loadPreview]);

  const toggleBucket = (name) => setSelectedBuckets(prev => prev.includes(name) ? prev.filter(b => b !== name) : [...prev, name]);

  const confirmAndComplete = async () => {
    if (!confirmed) return;
    setIsLoading(true);
    setError(null);
    try {
      // 1. Update scope config with selected buckets
      const scopeRes = await authFetch(`/connectors/s3/${connectorId}/scope`, {
        method: 'PUT',
        body: JSON.stringify({ buckets: selectedBuckets, prefixes: [] }),
      });
      if (!scopeRes.ok) throw new Error((await scopeRes.json()).error || 'Failed to update scope');

      // 2. Confirm scope with consent
      const confirmRes = await authFetch(`/connectors/s3/${connectorId}/confirm`, {
        method: 'POST',
        body: JSON.stringify({ confirmed: true }),
      });
      if (!confirmRes.ok) throw new Error((await confirmRes.json()).error || 'Failed to confirm scope');

      // 3. Call onComplete callback
      onComplete?.({ id: connectorId, type: 's3', connection: connectionInfo, buckets: selectedBuckets });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const AWS_REGIONS = [
    'us-east-1', 'us-east-2', 'us-west-1', 'us-west-2',
    'eu-west-1', 'eu-west-2', 'eu-west-3', 'eu-central-1', 'eu-central-2', 'eu-north-1', 'eu-south-1', 'eu-south-2',
    'ap-southeast-1', 'ap-southeast-2', 'ap-southeast-3', 'ap-northeast-1', 'ap-northeast-2', 'ap-northeast-3', 'ap-south-1',
    'sa-east-1', 'ca-central-1', 'me-south-1', 'af-south-1'
  ];

  const renderPhase = () => {
    switch (phase) {
      case 'explain':
        return (
          <div className="space-y-6" data-tour="s3-explain">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-[#569A31]/10 flex items-center justify-center mb-4"><Icons.S3 /></div>
              <h2 className="text-xl font-semibold text-gray-900">Connect Amazon S3</h2>
              <p className="text-gray-500 mt-2">Scan objects from your S3 buckets</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-5 space-y-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2"><Icons.Info className="text-slate" />What you'll need</h3>
              <div className="space-y-3 text-sm">
                <div className="flex gap-3"><div className="w-6 h-6 rounded-full bg-[#569A31]/10 flex items-center justify-center flex-shrink-0"><Icons.Key className="w-3.5 h-3.5 text-[#569A31]" /></div><div><p className="font-medium text-gray-900">AWS Access Key ID</p><p className="text-gray-500">From IAM user security credentials</p></div></div>
                <div className="flex gap-3"><div className="w-6 h-6 rounded-full bg-[#569A31]/10 flex items-center justify-center flex-shrink-0"><Icons.Key className="w-3.5 h-3.5 text-[#569A31]" /></div><div><p className="font-medium text-gray-900">AWS Secret Access Key</p><p className="text-gray-500">The secret key paired with your access key</p></div></div>
                <div className="flex gap-3"><div className="w-6 h-6 rounded-full bg-[#569A31]/10 flex items-center justify-center flex-shrink-0"><Icons.Bucket className="w-3.5 h-3.5 text-[#569A31]" /></div><div><p className="font-medium text-gray-900">S3 bucket access</p><p className="text-gray-500">User needs s3:GetObject and s3:ListBucket permissions</p></div></div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg"><Icons.Shield className="text-green-600 flex-shrink-0" /><div className="text-sm"><p className="font-medium text-green-800">Read-only access recommended</p><p className="text-green-700">Create an IAM user with only s3:GetObject and s3:ListBucket permissions.</p></div></div>
            <div className="flex gap-3"><button onClick={onCancel} className="flex-1 py-3 px-4 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">Cancel</button><button onClick={() => setPhase('visual-guide')} className="flex-1 py-3 px-4 rounded-lg bg-slate text-white font-medium hover:bg-slate/90 flex items-center justify-center gap-2">Continue<Icons.ArrowRight /></button></div>
          </div>
        );

      case 'visual-guide':
        return (
          <div className="space-y-6" data-tour="s3-visual-guide">
            <div className="text-center"><div className="w-12 h-12 mx-auto rounded-xl bg-slate/10 flex items-center justify-center text-slate mb-3"><Icons.Eye /></div><h2 className="text-xl font-semibold text-gray-900">Where to find your credentials</h2><p className="text-gray-500 mt-2">In AWS Console, go to IAM → Security Credentials:</p></div>
            <AWSConsolePreview />
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4"><div className="flex items-start gap-3"><Icons.Info className="text-blue-600 flex-shrink-0 mt-0.5" /><div className="text-sm text-blue-800"><p className="font-medium">How to create credentials</p><ul className="mt-1 space-y-1 list-disc list-inside text-blue-700"><li>Go to AWS Console → IAM → Users</li><li>Create or select a user</li><li>Security credentials → Create access key</li><li>Copy both the Access Key ID and Secret</li></ul></div></div></div>
            <div className="flex gap-3"><button onClick={() => setPhase('explain')} className="flex-1 py-3 px-4 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">Back</button><button onClick={() => setPhase('credentials')} className="flex-1 py-3 px-4 rounded-lg bg-slate text-white font-medium hover:bg-slate/90 flex items-center justify-center gap-2">Enter Credentials<Icons.ArrowRight /></button></div>
          </div>
        );

      case 'credentials':
        return (
          <div className="space-y-6" data-tour="s3-credentials">
            <div className="text-center"><div className="w-12 h-12 mx-auto rounded-xl bg-[#569A31]/10 flex items-center justify-center mb-3"><Icons.Key className="w-6 h-6 text-[#569A31]" /></div><h2 className="text-xl font-semibold text-gray-900">Enter AWS Credentials</h2><p className="text-gray-500 mt-2">Provide your S3 access credentials</p></div>
            <div className="space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Connector Name <span className="text-gray-400 font-normal">(optional)</span></label><input type="text" value={connectorName} onChange={(e) => setConnectorName(e.target.value)} placeholder="e.g., Production Data Lake" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate/20 focus:border-slate" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Access Key ID</label><input type="text" value={credentials.accessKeyId} onChange={(e) => setCredentials({...credentials, accessKeyId: e.target.value})} placeholder="AKIAIOSFODNN7EXAMPLE" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate/20 focus:border-slate font-mono" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Secret Access Key</label><div className="relative"><input type={showSecret ? 'text' : 'password'} value={credentials.secretAccessKey} onChange={(e) => setCredentials({...credentials, secretAccessKey: e.target.value})} placeholder="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY" className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate/20 focus:border-slate font-mono" /><button type="button" onClick={() => setShowSecret(!showSecret)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">{showSecret ? <Icons.EyeOff /> : <Icons.Eye />}</button></div></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Region</label><select value={credentials.region} onChange={(e) => setCredentials({...credentials, region: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate/20 focus:border-slate">{AWS_REGIONS.map(r => <option key={r} value={r}>{r}</option>)}</select></div>
            </div>
            {error && <div className="p-4 bg-red-50 border border-red-200 rounded-lg"><div className="flex items-center gap-2 text-red-700"><Icons.Warning /><span className="text-sm font-medium">{error}</span></div></div>}
            <div className="flex gap-3"><button onClick={() => setPhase('visual-guide')} disabled={isLoading} className="flex-1 py-3 px-4 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50">Back</button><button onClick={connectS3} disabled={isLoading || !credentials.accessKeyId || !credentials.secretAccessKey} className="flex-1 py-3 px-4 rounded-lg bg-slate text-white font-medium hover:bg-slate/90 disabled:opacity-50 flex items-center justify-center gap-2">{isLoading ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Connecting...</> : <>Connect<Icons.ArrowRight /></>}</button></div>
          </div>
        );

      case 'confirm':
        return (
          <div className="space-y-6" data-tour="s3-confirm">
            <div className="text-center"><div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center text-green-600 mb-4"><Icons.Check /></div><h2 className="text-xl font-semibold text-gray-900">Connected!</h2><p className="text-gray-500 mt-2">Successfully connected to Amazon S3</p></div>
            <div className="bg-gray-50 rounded-xl p-5"><div className="flex items-center gap-4"><div className="w-14 h-14 rounded-full bg-[#569A31]/20 flex items-center justify-center"><Icons.S3 /></div><div className="flex-1"><p className="font-semibold text-gray-900">Amazon S3</p><p className="text-sm text-gray-500">Region: {connectionInfo?.region}</p><p className="text-xs text-gray-400">Key: {connectionInfo?.keyId}</p></div><div className="text-green-600"><Icons.Check /></div></div></div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4"><div className="flex items-start gap-3"><Icons.Info className="text-blue-600 flex-shrink-0 mt-0.5" /><div className="text-sm text-blue-800"><p className="font-medium">Next: Select buckets to scan</p><p className="mt-1">Choose which S3 buckets to include. Only selected buckets will be accessed.</p></div></div></div>
            <div className="flex gap-3"><button onClick={onCancel} className="flex-1 py-3 px-4 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">Cancel</button><button onClick={() => setPhase('buckets')} className="flex-1 py-3 px-4 rounded-lg bg-slate text-white font-medium hover:bg-slate/90 flex items-center justify-center gap-2">Select Buckets<Icons.ArrowRight /></button></div>
          </div>
        );

      case 'buckets':
        return (
          <div className="space-y-6">
            <div><h2 className="text-xl font-semibold text-gray-900">Select Buckets</h2><p className="text-gray-500 mt-1">Choose which S3 buckets to scan</p></div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"><Icons.S3 className="text-[#569A31]" /><span className="text-sm text-gray-600">Region: <span className="font-medium text-gray-900">{connectionInfo?.region}</span></span></div>
            <div className="max-h-64 overflow-y-auto">{isLoading && buckets.length === 0 ? <div className="p-8 text-center"><div className="w-8 h-8 border-2 border-[#569A31] border-t-transparent rounded-full animate-spin mx-auto mb-3" /><p className="text-gray-500">Loading buckets...</p></div> : <BucketSelector buckets={buckets} selectedBuckets={selectedBuckets} onToggle={toggleBucket} />}</div>
            {selectedBuckets.length > 0 && <div className="p-3 bg-slate/5 rounded-lg border border-slate/20"><p className="text-sm text-slate"><span className="font-medium">{selectedBuckets.length}</span> bucket{selectedBuckets.length !== 1 ? 's' : ''} selected</p></div>}
            <div className="flex gap-3"><button onClick={existingConnector ? onCancel : () => setPhase('confirm')} className="flex-1 py-3 px-4 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">{existingConnector ? 'Cancel' : 'Back'}</button><button onClick={() => setPhase('preview')} disabled={selectedBuckets.length === 0} className="flex-1 py-3 px-4 rounded-lg bg-slate text-white font-medium hover:bg-slate/90 disabled:opacity-50 disabled:cursor-not-allowed">Preview Scan</button></div>
          </div>
        );

      case 'preview':
        return (
          <div className="space-y-6">
            <div><h2 className="text-xl font-semibold text-gray-900">Review & Confirm</h2><p className="text-gray-500 mt-1">Preview what will be scanned before confirming</p></div>
            <ScanPreview preview={preview} isLoading={isLoading} />
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg"><label className="flex items-start gap-3 cursor-pointer"><input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} className="mt-1 w-5 h-5 rounded border-gray-300 text-slate focus:ring-slate/20" /><span className="text-sm text-gray-700">I confirm I want to scan these buckets. Only the selected buckets will be accessed with read-only permissions.</span></label></div>
            {error && <div className="p-4 bg-red-50 border border-red-200 rounded-lg"><div className="flex items-center gap-2 text-red-700"><Icons.Warning /><span className="text-sm font-medium">{error}</span></div></div>}
            <div className="flex gap-3"><button onClick={() => setPhase('buckets')} disabled={isLoading} className="flex-1 py-3 px-4 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50">Back</button><button onClick={confirmAndComplete} disabled={!confirmed || isLoading || (preview && !preview.budget?.withinBudget)} className="flex-1 py-3 px-4 rounded-lg bg-slate text-white font-medium hover:bg-slate/90 disabled:opacity-50 disabled:cursor-not-allowed">{isLoading ? 'Confirming...' : 'Confirm & Connect'}</button></div>
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
              <div className="flex items-center gap-3"><div className="p-2 bg-[#569A31]/10 rounded-xl"><Icons.S3 /></div><div><h2 className="font-semibold text-gray-900">Amazon S3</h2><p className="text-xs text-gray-500">Cloud Storage Connector</p></div></div>
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
