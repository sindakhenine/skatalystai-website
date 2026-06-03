import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';

/**
 * KPIDiscovery Page - Phase E
 *
 * Chat-assisted KPI discovery that uses confirmed architecture
 * to propose KPIs, dashboard pages, CRUD views, and chatbot intents.
 */
export default function KPIDiscovery() {
  const { id: runId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { authFetch } = useAuth();
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  // State
  const [discovery, setDiscovery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [proposing, setProposing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('chat'); // chat, kpis, dashboards, output

  // Add KPI form state
  const [showAddKpiForm, setShowAddKpiForm] = useState(false);
  const [addingKpi, setAddingKpi] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [kpiForm, setKpiForm] = useState({
    name: '',
    description: '',
    category: 'General',
    formula: '',
    aggregation: 'sum',
    unit: ''
  });

  // Success banner from navigation
  const showSuccessBanner = location.state?.showSuccessBanner;

  // Load discovery on mount
  useEffect(() => {
    loadDiscovery();
  }, [runId]);

  // Scroll to bottom of chat
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [discovery?.chatHistory]);

  const loadDiscovery = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await authFetch(`/orchestrated-runs/${runId}/kpi-discovery`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load KPI discovery');
      }

      setDiscovery(data);
    } catch (err) {
      console.error('Error loading discovery:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e) => {
    e?.preventDefault();
    if (!message.trim() || sending) return;

    try {
      setSending(true);
      setError(null);

      const response = await authFetch(`/orchestrated-runs/${runId}/kpi-discovery/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: message.trim() })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to send message');
      }

      setDiscovery(data.discovery);
      setMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err.message);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const autoPropose = async () => {
    try {
      setProposing(true);
      setError(null);

      const response = await authFetch(`/orchestrated-runs/${runId}/kpi-discovery/auto-propose`, {
        method: 'POST'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to auto-propose KPIs');
      }

      setDiscovery(data);
      setActiveTab('kpis');
    } catch (err) {
      console.error('Error auto-proposing:', err);
      setError(err.message);
    } finally {
      setProposing(false);
    }
  };

  const confirmDiscovery = async () => {
    if (discovery?.kpis?.length === 0) {
      setError('Cannot confirm without any KPIs defined');
      return;
    }

    try {
      setConfirming(true);
      setError(null);

      const response = await authFetch(`/orchestrated-runs/${runId}/kpi-discovery/confirm`, {
        method: 'POST'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to confirm KPI discovery');
      }

      // Navigate to analytics preview page
      navigate(`/app/runs/${runId}/analytics-preview`, {
        state: { showSuccessBanner: true, message: 'KPIs confirmed! Preview your analytics before building.' }
      });
    } catch (err) {
      console.error('Error confirming:', err);
      setError(err.message);
    } finally {
      setConfirming(false);
    }
  };

  const removeKpi = async (kpiId) => {
    try {
      const response = await authFetch(`/orchestrated-runs/${runId}/kpi-discovery/kpis/${kpiId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to remove KPI');
      }

      // Reload discovery
      loadDiscovery();
    } catch (err) {
      console.error('Error removing KPI:', err);
      setError(err.message);
    }
  };

  const addKpi = async (e) => {
    e?.preventDefault();
    if (!kpiForm.name.trim() || addingKpi) return;

    try {
      setAddingKpi(true);
      setError(null);

      const response = await authFetch(`/orchestrated-runs/${runId}/kpi-discovery/kpis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(kpiForm)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add KPI');
      }

      setDiscovery(data);
      setKpiForm({
        name: '',
        description: '',
        category: 'General',
        formula: '',
        aggregation: 'sum',
        unit: ''
      });
      setShowAddKpiForm(false);
    } catch (err) {
      console.error('Error adding KPI:', err);
      setError(err.message);
    } finally {
      setAddingKpi(false);
    }
  };

  const refreshDataAnalysis = async () => {
    try {
      setRefreshing(true);
      setError(null);

      const response = await authFetch(`/orchestrated-runs/${runId}/kpi-discovery/refresh`, {
        method: 'POST'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to refresh data analysis');
      }

      setDiscovery(data);
    } catch (err) {
      console.error('Error refreshing:', err);
      setError(err.message);
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading KPI Discovery...</p>
        </div>
      </div>
    );
  }

  if (error && !discovery) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading KPI Discovery</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate(`/app/runs/${runId}`)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Back to Run
          </button>
        </div>
      </div>
    );
  }

  const isConfirmed = discovery?.status === 'confirmed';
  const isProposed = discovery?.status === 'proposed';
  const kpiCount = discovery?.kpis?.length || 0;
  const dashboardCount = discovery?.dashboardPages?.length || 0;

  // Check for 0 tables case
  const totalTables = discovery?.dataAnalysis?.totalTables || 0;
  const hasNoTables = totalTables === 0;
  const totalFiles = discovery?.dataAnalysis?.totalFiles || 0;

  // File-based KPI suggestions when no structured tables
  const fileBasedKpiSuggestions = [
    { name: 'Document Count', description: 'Total number of documents processed', category: 'Operations', aggregation: 'count' },
    { name: 'Document Types Distribution', description: 'Breakdown of document types (PDF, DOCX, etc.)', category: 'Operations', aggregation: 'count' },
    { name: 'Processing Success Rate', description: 'Percentage of files successfully processed', category: 'Quality', aggregation: 'custom', formula: '(successful_files / total_files) * 100' },
    { name: 'Average Document Size', description: 'Average file size across all documents', category: 'Operations', aggregation: 'avg' },
    { name: 'Content Volume', description: 'Total text content extracted (characters/words)', category: 'Operations', aggregation: 'sum' },
  ];

  const chatbotIntentSuggestions = [
    'Search documents by keyword',
    'Find documents by date range',
    'Summarize document content',
    'Extract key information from specific file',
    'List all documents of a specific type',
    'Compare content across documents',
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate(`/app/runs`)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div>
              <h1 className="text-2xl font-bold">KPI & Use-Case Discovery</h1>
              <p className="text-indigo-200 mt-1">Phase E: Define what to measure before building dashboards</p>
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex items-center gap-4">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              isConfirmed ? 'bg-green-500/20 text-green-100' :
              isProposed ? 'bg-amber-500/20 text-amber-100' :
              'bg-white/20 text-white'
            }`}>
              {isConfirmed ? 'Confirmed' : isProposed ? 'Proposed - Review Required' : 'In Progress'}
            </span>
            {kpiCount > 0 && (
              <span className="text-indigo-200">{kpiCount} KPIs discovered</span>
            )}
          </div>
        </div>
      </div>

      {/* Success Banner */}
      {showSuccessBanner && (
        <div className="bg-green-50 border-b border-green-200 px-6 py-3">
          <p className="text-green-800 text-center font-medium">
            {location.state?.message || 'Architecture confirmed! Now let\'s discover your KPIs.'}
          </p>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border-b border-red-200 px-6 py-3">
          <p className="text-red-800 text-center">{error}</p>
        </div>
      )}

      {/* No Tables Warning */}
      {hasNoTables && !loading && (
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-amber-800 font-semibold">No Structured Tables Detected</h3>
                <p className="text-amber-700 text-sm mt-1">
                  {totalFiles > 0
                    ? `Your run has ${totalFiles} files, but no CSV, XLSX, or JSON tables were extracted. Advanced KPI auto-proposal requires structured data.`
                    : 'No structured data tables were found in this run. Upload CSV, XLSX, or JSON files to enable full KPI discovery.'}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    onClick={() => navigate('/app/connectors')}
                    className="px-3 py-1.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 text-sm font-medium"
                  >
                    Upload CSV/XLSX Sample
                  </button>
                  <span className="px-3 py-1.5 text-amber-700 text-sm">
                    or use file-based KPIs below
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <nav className="flex gap-8">
            {[
              { id: 'chat', label: 'Discovery Chat', icon: '💬' },
              { id: 'kpis', label: `KPIs (${kpiCount})`, icon: '📊' },
              { id: 'dashboards', label: `Dashboards (${dashboardCount})`, icon: '📈' },
              { id: 'output', label: 'Full Output', icon: '📋' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 border-b-2 font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Chat Tab */}
        {activeTab === 'chat' && (
          <div className="grid grid-cols-3 gap-6">
            {/* Chat Panel */}
            <div className="col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-[600px]">
              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {/* Initial System Message */}
                {discovery?.chatHistory?.length === 0 && (
                  <div className={`rounded-lg p-4 ${hasNoTables ? 'bg-amber-50 text-amber-800' : 'bg-indigo-50 text-indigo-800'}`}>
                    <h4 className="font-semibold mb-2">
                      {hasNoTables ? 'Welcome to File-Based KPI Discovery!' : 'Welcome to KPI Discovery!'}
                    </h4>
                    {hasNoTables ? (
                      <>
                        <p className="text-sm mb-3">
                          No structured tables were found in your data. However, you can still define
                          file-based KPIs and chatbot intents based on your {totalFiles || 0} files.
                        </p>
                        <ul className="text-sm space-y-1">
                          <li>• <strong>Document metrics</strong>: Track counts, types, and processing stats</li>
                          <li>• <strong>Content analysis</strong>: Measure text volume and complexity</li>
                          <li>• <strong>Chatbot intents</strong>: Enable document search and summarization</li>
                        </ul>
                        <p className="text-sm mt-3">
                          Switch to the "KPIs" tab to see suggested file-based KPIs, or upload CSV/XLSX files
                          to enable full structured KPI discovery.
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-sm mb-3">
                          I've analyzed your data structure and can help you define meaningful KPIs.
                          Based on your {discovery?.dataAnalysis?.totalTables || 0} tables and{' '}
                          {discovery?.dataAnalysis?.totalMeasures || 0} measureable columns, here's what I found:
                        </p>
                        <ul className="text-sm space-y-1">
                          {discovery?.dataAnalysis?.potentialCategories?.map((cat, i) => (
                            <li key={i}>• <strong>{cat.name}</strong>: {cat.description}</li>
                          ))}
                        </ul>
                        <p className="text-sm mt-3">
                          You can ask me questions like "What KPIs can I track?" or click
                          "Auto-Propose KPIs" to get a complete recommendation.
                        </p>
                      </>
                    )}
                  </div>
                )}

                {/* Chat History */}
                {discovery?.chatHistory?.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[80%] rounded-lg p-4 ${
                      msg.role === 'user'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      <div className="whitespace-pre-wrap text-sm">{msg.content}</div>
                      {msg.extractedKpis?.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-gray-200/30">
                          <span className="text-xs opacity-75">
                            +{msg.extractedKpis.length} KPIs extracted
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Sending indicator */}
                {sending && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-gray-500">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={chatEndRef} />
              </div>

              {/* Chat Input */}
              <div className="border-t border-gray-200 p-4">
                <form onSubmit={sendMessage} className="flex gap-3">
                  <input
                    ref={inputRef}
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={isConfirmed ? 'KPIs are confirmed' : 'Ask about KPIs, metrics, or use cases...'}
                    disabled={sending || isConfirmed}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                  />
                  <button
                    type="submit"
                    disabled={!message.trim() || sending || isConfirmed}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    Send
                  </button>
                </form>
              </div>
            </div>

            {/* Side Panel */}
            <div className="space-y-4">
              {/* Data Summary */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Data Summary</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Architecture</span>
                    <span className="font-medium">{discovery?.dataAnalysis?.architectureChoice || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Tables</span>
                    <span className={`font-medium ${hasNoTables ? 'text-amber-600' : ''}`}>
                      {totalTables}
                      {hasNoTables && ' (file-based mode)'}
                    </span>
                  </div>
                  {totalFiles > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Files</span>
                      <span className="font-medium">{totalFiles}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-500">Measureable Fields</span>
                    <span className="font-medium">{discovery?.dataAnalysis?.totalMeasures || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Dimensions</span>
                    <span className="font-medium">{discovery?.dataAnalysis?.totalDimensions || 0}</span>
                  </div>
                </div>
                {hasNoTables && (
                  <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-xs text-amber-700">
                      No structured tables detected. Use the KPIs tab for file-based suggestions.
                    </p>
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  {/* Refresh Data Analysis Button */}
                  <button
                    onClick={refreshDataAnalysis}
                    disabled={refreshing || isConfirmed}
                    className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 font-medium flex items-center justify-center gap-2"
                  >
                    {refreshing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
                        Refreshing...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Refresh Data Analysis
                      </>
                    )}
                  </button>

                  <div className="relative">
                    <button
                      onClick={autoPropose}
                      disabled={proposing || isConfirmed || hasNoTables}
                      className={`w-full px-4 py-3 rounded-lg font-medium flex items-center justify-center gap-2 ${
                        hasNoTables
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50'
                      }`}
                    >
                      {proposing ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <span>✨</span>
                          Auto-Propose KPIs
                        </>
                      )}
                    </button>
                    {hasNoTables && (
                      <p className="text-xs text-gray-500 mt-2 text-center">
                        Requires structured tables (CSV/XLSX/JSON)
                      </p>
                    )}
                  </div>

                  {kpiCount > 0 && !isConfirmed && (
                    <button
                      onClick={confirmDiscovery}
                      disabled={confirming}
                      className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium flex items-center justify-center gap-2"
                    >
                      {confirming ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Confirming...
                        </>
                      ) : (
                        <>
                          <span>✓</span>
                          Confirm {kpiCount} KPIs
                        </>
                      )}
                    </button>
                  )}

                  {isConfirmed && (
                    <button
                      onClick={() => navigate(`/app/runs/${runId}/build`)}
                      className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                    >
                      Continue to Build App →
                    </button>
                  )}
                </div>
              </div>

              {/* Confidence Score */}
              {discovery?.confidenceScore != null && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Confidence Score</h3>
                  <div className="flex items-center gap-4">
                    <div className="relative w-16 h-16">
                      <svg className="w-16 h-16 transform -rotate-90">
                        <circle
                          cx="32"
                          cy="32"
                          r="28"
                          fill="none"
                          stroke="#e5e7eb"
                          strokeWidth="8"
                        />
                        <circle
                          cx="32"
                          cy="32"
                          r="28"
                          fill="none"
                          stroke={discovery.confidenceScore >= 70 ? '#22c55e' : discovery.confidenceScore >= 40 ? '#f59e0b' : '#ef4444'}
                          strokeWidth="8"
                          strokeDasharray={`${discovery.confidenceScore * 1.76} 176`}
                        />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center font-bold text-lg">
                        {discovery.confidenceScore}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      Based on data availability and coverage for proposed KPIs
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* KPIs Tab */}
        {activeTab === 'kpis' && (
          <div className="space-y-4">
            {/* Add KPI Button */}
            {!isConfirmed && (
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">
                  {kpiCount === 0 ? 'Define Your KPIs' : `${kpiCount} KPIs Defined`}
                </h3>
                <button
                  onClick={() => setShowAddKpiForm(!showAddKpiForm)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
                >
                  {showAddKpiForm ? (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Cancel
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add KPI Manually
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Add KPI Form */}
            {showAddKpiForm && !isConfirmed && (
              <form onSubmit={addKpi} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h4 className="font-semibold text-gray-900 mb-4">Add New KPI</h4>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">KPI Name *</label>
                    <input
                      type="text"
                      value={kpiForm.name}
                      onChange={(e) => setKpiForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Total Revenue"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      value={kpiForm.category}
                      onChange={(e) => setKpiForm(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="General">General</option>
                      <option value="Financial">Financial</option>
                      <option value="Sales">Sales</option>
                      <option value="Operations">Operations</option>
                      <option value="Customer">Customer</option>
                      <option value="Marketing">Marketing</option>
                      <option value="HR">HR</option>
                    </select>
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={kpiForm.description}
                    onChange={(e) => setKpiForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="What does this KPI measure and why is it important?"
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Formula/Calculation</label>
                    <input
                      type="text"
                      value={kpiForm.formula}
                      onChange={(e) => setKpiForm(prev => ({ ...prev, formula: e.target.value }))}
                      placeholder="e.g., SUM(revenue)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Aggregation</label>
                    <select
                      value={kpiForm.aggregation}
                      onChange={(e) => setKpiForm(prev => ({ ...prev, aggregation: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="sum">Sum</option>
                      <option value="avg">Average</option>
                      <option value="count">Count</option>
                      <option value="min">Minimum</option>
                      <option value="max">Maximum</option>
                      <option value="custom">Custom</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                    <input
                      type="text"
                      value={kpiForm.unit}
                      onChange={(e) => setKpiForm(prev => ({ ...prev, unit: e.target.value }))}
                      placeholder="e.g., $, %, units"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddKpiForm(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={addingKpi || !kpiForm.name.trim()}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {addingKpi ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Adding...
                      </>
                    ) : (
                      'Add KPI'
                    )}
                  </button>
                </div>
              </form>
            )}

            {kpiCount === 0 && !showAddKpiForm ? (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">📊</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No KPIs Defined Yet</h3>
                  <p className="text-gray-500 mb-4">
                    {hasNoTables
                      ? 'No structured tables detected. Use file-based KPIs below or upload CSV/XLSX data for full KPI discovery.'
                      : 'Add KPIs manually using the button above, or use "Auto-Propose KPIs" (requires API key).'}
                  </p>
                  <div className="flex justify-center gap-3">
                    <button
                      onClick={() => setShowAddKpiForm(true)}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                      Add KPI Manually
                    </button>
                    <button
                      onClick={() => setActiveTab('chat')}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      Go to Chat
                    </button>
                  </div>
                </div>

                {/* File-Based KPI Suggestions (when no tables) */}
                {hasNoTables && (
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-200 p-6">
                    <h4 className="text-lg font-semibold text-amber-900 mb-2 flex items-center gap-2">
                      <span>📁</span>
                      Suggested File-Based KPIs
                    </h4>
                    <p className="text-amber-700 text-sm mb-4">
                      Since no structured tables were found, here are KPIs that work with file-level data:
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      {fileBasedKpiSuggestions.map((suggestion, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            setKpiForm({
                              name: suggestion.name,
                              description: suggestion.description,
                              category: suggestion.category,
                              formula: suggestion.formula || '',
                              aggregation: suggestion.aggregation,
                              unit: ''
                            });
                            setShowAddKpiForm(true);
                          }}
                          className="text-left p-3 bg-white rounded-lg border border-amber-200 hover:border-amber-400 hover:shadow-sm transition-all"
                        >
                          <div className="font-medium text-gray-900 text-sm">{suggestion.name}</div>
                          <div className="text-xs text-gray-500 mt-1">{suggestion.description}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Chatbot Intent Suggestions (when no tables) */}
                {hasNoTables && (
                  <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border border-purple-200 p-6">
                    <h4 className="text-lg font-semibold text-purple-900 mb-2 flex items-center gap-2">
                      <span>💬</span>
                      Suggested Chatbot Intents
                    </h4>
                    <p className="text-purple-700 text-sm mb-4">
                      Enable users to interact with your documents through natural language:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {chatbotIntentSuggestions.map((intent, i) => (
                        <span
                          key={i}
                          className="px-3 py-1.5 bg-white border border-purple-200 rounded-full text-sm text-purple-800"
                        >
                          {intent}
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-purple-600 mt-4">
                      These intents will be available when you build a Chatbot app in the next phase.
                    </p>
                  </div>
                )}
              </div>
            ) : kpiCount > 0 && (
              <div className="grid grid-cols-2 gap-4">
                {discovery?.kpis?.map((kpi) => (
                  <div key={kpi.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-900">{kpi.name}</h4>
                        <span className="text-xs px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full">
                          {kpi.category || 'General'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {kpi.confidence && (
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            kpi.confidence >= 70 ? 'bg-green-100 text-green-700' :
                            kpi.confidence >= 40 ? 'bg-amber-100 text-amber-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {kpi.confidence}% conf
                          </span>
                        )}
                        {!isConfirmed && (
                          <button
                            onClick={() => removeKpi(kpi.id)}
                            className="p-1 text-gray-400 hover:text-red-600"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mb-3">{kpi.description}</p>

                    <div className="space-y-2 text-sm">
                      {kpi.formula && (
                        <div className="bg-gray-50 rounded p-2 font-mono text-xs">
                          {kpi.formula}
                        </div>
                      )}

                      {kpi.sourceTables?.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          <span className="text-gray-500 text-xs">Tables:</span>
                          {kpi.sourceTables.map((t, i) => (
                            <span key={i} className="text-xs px-1.5 py-0.5 bg-gray-100 rounded">
                              {t}
                            </span>
                          ))}
                        </div>
                      )}

                      {kpi.aggregation && (
                        <div className="text-xs text-gray-500">
                          Aggregation: <span className="font-medium">{kpi.aggregation}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Confirm Button */}
            {kpiCount > 0 && !isConfirmed && (
              <div className="flex justify-end">
                <button
                  onClick={confirmDiscovery}
                  disabled={confirming}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium flex items-center gap-2"
                >
                  {confirming ? 'Confirming...' : `Confirm ${kpiCount} KPIs & Continue`}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Dashboards Tab */}
        {activeTab === 'dashboards' && (
          <div className="space-y-4">
            {dashboardCount === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">📈</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Dashboard Pages Yet</h3>
                <p className="text-gray-500 mb-4">
                  Dashboard pages will be suggested based on your KPIs.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {discovery?.dashboardPages?.map((page, i) => (
                  <div key={page.id || i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h4 className="font-semibold text-gray-900 mb-2">{page.name}</h4>
                    <p className="text-sm text-gray-600 mb-4">{page.description}</p>

                    {page.kpiIds?.length > 0 && (
                      <div>
                        <span className="text-sm text-gray-500">KPIs included:</span>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {page.kpiIds.map(kpiId => {
                            const kpi = discovery.kpis.find(k => k.id === kpiId);
                            return kpi ? (
                              <span key={kpiId} className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs">
                                {kpi.name}
                              </span>
                            ) : null;
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Additional outputs */}
            {(discovery?.crudViews?.length > 0 || discovery?.chatbotIntents?.length > 0) && (
              <div className="grid grid-cols-2 gap-4 mt-6">
                {discovery?.crudViews?.length > 0 && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h4 className="font-semibold text-gray-900 mb-3">CRUD Views</h4>
                    <div className="flex flex-wrap gap-2">
                      {discovery.crudViews.map((view, i) => (
                        <span key={i} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                          {view}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {discovery?.chatbotIntents?.length > 0 && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h4 className="font-semibold text-gray-900 mb-3">Chatbot Intents</h4>
                    <div className="flex flex-wrap gap-2">
                      {discovery.chatbotIntents.map((intent, i) => (
                        <span key={i} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                          {intent}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Output Tab */}
        {activeTab === 'output' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Full Discovery Output</h3>
            <pre className="bg-gray-50 rounded-lg p-4 overflow-auto text-xs max-h-[600px]">
              {JSON.stringify({
                status: discovery?.status,
                kpis: discovery?.kpis,
                dashboardPages: discovery?.dashboardPages,
                crudViews: discovery?.crudViews,
                chatbotIntents: discovery?.chatbotIntents,
                confidenceScore: discovery?.confidenceScore,
                dataAnalysis: discovery?.dataAnalysis
              }, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
