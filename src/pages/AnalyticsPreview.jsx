import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';

/**
 * AnalyticsPreview Page - Phase E.5
 *
 * Visual KPI & Data Preview (Read-Only)
 * Shows users how their data becomes structured, feeds KPIs, and appears in dashboards.
 *
 * Access requires:
 *   - architecture_status === 'confirmed'
 *   - kpi_status === 'confirmed'
 *
 * NO execution, NO billing, NO deployment, NO data writing.
 */
export default function AnalyticsPreview() {
  const { id: runId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { authFetch } = useAuth();

  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('tables');
  const [run, setRun] = useState(null);
  const [discovery, setDiscovery] = useState(null);
  const [plan, setPlan] = useState(null);

  // Load all data on mount
  useEffect(() => {
    loadData();
  }, [runId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch run first
      const runRes = await authFetch(`/orchestrated-runs/${runId}`);
      if (!runRes.ok) {
        const data = await runRes.json();
        throw new Error(data.error || 'Failed to fetch run');
      }
      const runData = await runRes.json();

      // Check architecture gating
      if (runData.architecture_status !== 'confirmed') {
        setError('Architecture must be confirmed to view analytics preview. Please complete the architecture selection first.');
        setRun(runData);
        return;
      }

      // Fetch discovery and plan
      let discoveryData = null;
      let planData = null;

      try {
        const discoveryRes = await authFetch(`/orchestrated-runs/${runId}/kpi-discovery`);
        if (discoveryRes.ok) {
          discoveryData = await discoveryRes.json();
        }
      } catch (e) {
        console.warn('Could not fetch discovery:', e);
      }

      try {
        const planRes = await authFetch(`/orchestrated-runs/${runId}/structuring-plan`);
        if (planRes.ok) {
          planData = await planRes.json();
        }
      } catch (e) {
        console.warn('Could not fetch plan:', e);
      }

      // Check KPI gating - allow if run.kpi_status OR discovery.status is confirmed
      // Also allow if run.status is 'kpis_confirmed'
      const kpisConfirmed =
        runData.kpi_status === 'confirmed' ||
        runData.status === 'kpis_confirmed' ||
        discoveryData?.status === 'confirmed';

      if (!kpisConfirmed) {
        setError('KPIs must be confirmed to view analytics preview. Please complete KPI discovery first.');
        setRun(runData);
        return;
      }

      setRun(runData);
      setDiscovery(discoveryData);
      setPlan(planData);
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Parse inventory and schema
  const inventory = run?.inventory || {};
  const schema = plan?.schemaProposal || plan?.schema_proposal || {};
  const tables = schema?.tables || [];
  const kpis = discovery?.kpis || [];
  const dashboardPages = discovery?.dashboardPages || [];
  const crudViews = discovery?.crudViews || [];
  const chatbotIntents = discovery?.chatbotIntents || [];
  const dataAnalysis = discovery?.dataAnalysis || {};
  const inclusionReport = run?.data_inclusion_report || {};

  // Get source files info
  const sources = inventory?.sources || [];
  const totalFiles = sources.reduce((sum, s) => sum + (s.files?.length || s.tables?.length || 0), 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Analytics Preview...</p>
        </div>
      </div>
    );
  }

  if (error) {
    // Determine the appropriate next action based on current state
    const needsArchitecture = run && run.architecture_status !== 'confirmed';
    const needsKpis = run && run.architecture_status === 'confirmed' && run.kpi_status !== 'confirmed';

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-lg text-center">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Prerequisites Not Met</h2>
          <p className="text-gray-600 mb-6">{error}</p>

          <div className="flex flex-col gap-3">
            {needsArchitecture && (
              <button
                onClick={() => navigate(`/app/runs/${runId}/organization-preview`)}
                className="px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
              >
                Review Architecture
              </button>
            )}
            {needsKpis && (
              <button
                onClick={() => navigate(`/app/runs/${runId}/kpi-discovery`)}
                className="px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
              >
                Discover KPIs
              </button>
            )}
            <button
              onClick={() => navigate(`/app/runs/${runId}`)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              View Run Details
            </button>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'tables', label: 'Data → Tables', icon: '🗄️' },
    { id: 'kpis', label: 'KPI Traceability', icon: '📊' },
    { id: 'dashboard', label: 'Dashboard Preview', icon: '📈' },
    { id: 'crud', label: 'CRUD Preview', icon: '📝' },
    { id: 'chatbot', label: 'Chatbot Preview', icon: '💬' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(`/app/runs`)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-bold">Analytics Preview</h1>
                <p className="text-purple-200 mt-1">Phase E.5: Visual preview before building</p>
              </div>
            </div>
            <button
              onClick={() => navigate(`/app/runs/${runId}/build`)}
              className="px-6 py-3 bg-white text-indigo-600 font-semibold rounded-lg hover:bg-indigo-50 transition-colors flex items-center gap-2"
            >
              <span>🚀</span>
              Build App
            </button>
          </div>
        </div>
      </div>

      {/* Preview Warning Banner */}
      <div className="bg-amber-50 border-b border-amber-200 px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <svg className="w-5 h-5 text-amber-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-amber-800 text-sm">
            <strong>PREVIEW MODE</strong> — This is a read-only visualization. No data has been written, no apps have been deployed.
            All values shown are examples based on your data structure.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6">
          <nav className="flex gap-1 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-4 border-b-2 font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
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

        {/* TAB 1: Data → Tables Preview */}
        {activeTab === 'tables' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              {/* Left: Source Data */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="text-2xl">📁</span>
                  Your Raw Data
                </h3>
                <div className="space-y-2">
                  {sources.length > 0 ? sources.map((source, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <span className="text-xl">
                        {source.type === 'upload' ? '📄' :
                         source.type === 'connector' ? '🔗' :
                         source.type === 'agent' ? '🤖' : '📁'}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{source.name || source.type}</p>
                        <p className="text-xs text-gray-500">
                          {source.files?.length || source.tables?.length || 0} items
                        </p>
                      </div>
                    </div>
                  )) : (
                    <p className="text-gray-500 text-sm">No source data available</p>
                  )}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Total sources</span>
                    <span className="font-medium">{sources.length}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-gray-500">Data included</span>
                    <span className="font-medium text-green-600">
                      {inclusionReport?.included?.percentage || dataAnalysis?.dataInclusion?.included?.percentage || '~87'}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: Structured Tables */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="text-2xl">🗄️</span>
                  Structured Tables
                </h3>
                <div className="space-y-3">
                  {tables.length > 0 ? tables.map((table, i) => (
                    <div key={i} className="p-4 border border-gray-200 rounded-lg hover:border-indigo-300 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">{table.name}</h4>
                        <span className="text-xs px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full">
                          {table.columns?.length || 0} cols
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mb-2">{table.description || 'No description'}</p>
                      <div className="flex gap-4 text-xs text-gray-400">
                        <span>~{table.estimatedRows || table.rowCount || '1,000'} rows</span>
                        {table.source && <span>From: {table.source}</span>}
                      </div>
                    </div>
                  )) : (
                    <p className="text-gray-500 text-sm">No tables defined in schema</p>
                  )}
                </div>
              </div>
            </div>

            {/* Sample Data Preview */}
            {tables.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <h3 className="font-semibold text-gray-900">Sample Data: {tables[0]?.name || 'Table'}</h3>
                  <p className="text-sm text-gray-500">Preview of how your data will be structured (sanitized)</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        {(tables[0]?.columns || []).slice(0, 6).map((col, i) => (
                          <th key={i} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            {col.name}
                            {kpis.some(k => k.sourceColumns?.includes(`${tables[0]?.name}.${col.name}`)) && (
                              <span className="ml-1 text-indigo-500" title="Feeds a KPI">📊</span>
                            )}
                          </th>
                        ))}
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Feeds KPIs
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {[1, 2, 3, 4, 5].map((row) => (
                        <tr key={row} className="hover:bg-gray-50">
                          {(tables[0]?.columns || []).slice(0, 6).map((col, i) => (
                            <td key={i} className="px-4 py-3 text-sm text-gray-600">
                              {generateMockValue(col.type, col.name, row)}
                            </td>
                          ))}
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-1">
                              {kpis.filter(k => k.sourceTables?.includes(tables[0]?.name)).slice(0, 2).map((kpi, i) => (
                                <span key={i} className="text-xs px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded">
                                  {kpi.name?.substring(0, 15)}
                                </span>
                              ))}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="px-6 py-3 bg-gray-50 text-sm text-gray-500">
                  Showing 5 sample rows (data is illustrative, not actual)
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: KPI → Data Traceability */}
        {activeTab === 'kpis' && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">KPI Traceability Matrix</h3>
              <p className="text-sm text-gray-500">
                See exactly how each KPI connects to your data sources.
              </p>
            </div>

            {kpis.length > 0 ? kpis.map((kpi, i) => (
              <div key={kpi.id || i} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">📊</span>
                    <div>
                      <h4 className="font-semibold text-gray-900">{kpi.name}</h4>
                      <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                        {kpi.category || 'General'}
                      </span>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    (kpi.confidence || 70) >= 80 ? 'bg-green-100 text-green-700' :
                    (kpi.confidence || 70) >= 50 ? 'bg-amber-100 text-amber-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {kpi.confidence || 70}% confidence
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <p className="text-gray-600">{kpi.description}</p>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase">Formula</label>
                      <div className="mt-1 p-3 bg-gray-50 rounded-lg font-mono text-sm">
                        {kpi.formula || 'COUNT(*)'}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase">Aggregation</label>
                      <div className="mt-1 p-3 bg-gray-50 rounded-lg text-sm">
                        {kpi.aggregation || 'daily'}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Source Tables</label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {(kpi.sourceTables || ['orders']).map((table, j) => (
                        <span key={j} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                          {table}
                        </span>
                      ))}
                    </div>
                  </div>

                  {kpi.sourceColumns?.length > 0 && (
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase">Source Columns</label>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {kpi.sourceColumns.map((col, j) => (
                          <span key={j} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-mono">
                            {col}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-4 border-t border-gray-200">
                    <label className="text-xs font-medium text-gray-500 uppercase">Used In Dashboard</label>
                    <p className="mt-1 text-sm text-indigo-600">
                      {dashboardPages.find(p => p.kpiIds?.includes(kpi.id))?.name || 'Main Dashboard'} → KPI Card
                    </p>
                  </div>

                  {/* Data Flow Visualization */}
                  <div className="pt-4 border-t border-gray-200">
                    <label className="text-xs font-medium text-gray-500 uppercase mb-2 block">Data Flow</label>
                    <div className="flex items-center gap-2 text-sm overflow-x-auto pb-2">
                      <span className="px-3 py-1 bg-gray-100 rounded-full whitespace-nowrap">
                        📁 Source Data
                      </span>
                      <span className="text-gray-400">→</span>
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full whitespace-nowrap">
                        🗄️ {(kpi.sourceTables || ['table'])[0]}
                      </span>
                      <span className="text-gray-400">→</span>
                      <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full whitespace-nowrap">
                        ⚙️ {kpi.formula?.split('(')[0] || 'CALC'}
                      </span>
                      <span className="text-gray-400">→</span>
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full whitespace-nowrap">
                        📊 {kpi.name}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <span className="text-4xl mb-4 block">📊</span>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No KPIs Defined</h3>
                <p className="text-gray-500">KPIs will appear here after KPI discovery.</p>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Dashboard Mock Preview */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">Dashboard: {dashboardPages[0]?.name || 'Sales Overview'}</h3>
                  <p className="text-sm text-gray-500">{dashboardPages[0]?.description || 'Main analytics dashboard'}</p>
                </div>
                <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                  PREVIEW - Static mockup
                </span>
              </div>

              <div className="p-6">
                {/* KPI Cards Row */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                  {(kpis.slice(0, 4).length > 0 ? kpis.slice(0, 4) : [
                    { name: 'Total Revenue', category: 'Sales' },
                    { name: 'Order Count', category: 'Sales' },
                    { name: 'Avg Order Value', category: 'Sales' },
                    { name: 'Customers', category: 'Customers' }
                  ]).map((kpi, i) => (
                    <div key={i} className="bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 p-4">
                      <p className="text-sm text-gray-500 mb-1">{kpi.name}</p>
                      <p className="text-2xl font-bold text-gray-900">$XX,XXX</p>
                      <p className="text-xs text-green-600 mt-1">↑ XX% vs last period</p>
                    </div>
                  ))}
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-2 gap-6 mb-6">
                  {/* Line Chart Placeholder */}
                  <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <h4 className="font-medium text-gray-900 mb-4">📈 Revenue Trend</h4>
                    <div className="h-48 bg-gray-50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-200">
                      <div className="text-center text-gray-400">
                        <svg className="w-12 h-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                        </svg>
                        <p className="text-sm">Line chart will render here</p>
                        <p className="text-xs">Based on time-series data</p>
                      </div>
                    </div>
                  </div>

                  {/* Pie Chart Placeholder */}
                  <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <h4 className="font-medium text-gray-900 mb-4">🥧 Distribution by Category</h4>
                    <div className="h-48 bg-gray-50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-200">
                      <div className="text-center text-gray-400">
                        <svg className="w-12 h-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                        </svg>
                        <p className="text-sm">Pie chart will render here</p>
                        <p className="text-xs">Based on category data</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Filters */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Available Filters</h4>
                  <div className="flex flex-wrap gap-3">
                    <div className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600">
                      Date Range: <span className="text-gray-900 font-medium">Last 30 Days ▼</span>
                    </div>
                    {(kpis[0]?.filters || ['status', 'category']).slice(0, 3).map((filter, i) => (
                      <div key={i} className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600">
                        {filter}: <span className="text-gray-900 font-medium">All ▼</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Data Table Preview */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                    <h4 className="font-medium text-gray-900">Recent Records</h4>
                  </div>
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {[1, 2, 3].map((row) => (
                        <tr key={row} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-600">#XXXX</td>
                          <td className="px-4 py-3 text-sm text-gray-600">XXXX-XX-XX</td>
                          <td className="px-4 py-3 text-sm text-gray-600">Sample Record {row}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">$XXX.XX</td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">Active</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: CRUD Preview */}
        {activeTab === 'crud' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-2">CRUD Views to be Generated</h3>
              <p className="text-sm text-gray-500 mb-4">
                These read/write interfaces will be created for managing your data entities.
              </p>
              <div className="flex flex-wrap gap-2">
                {(crudViews.length > 0 ? crudViews : tables.map(t => t.name)).map((view, i) => (
                  <span key={i} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                    {view}
                  </span>
                ))}
              </div>
            </div>

            {/* List View Preview */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{(crudViews[0] || tables[0]?.name || 'Records')} - List View</h3>
                  <span className="text-xs text-amber-600">Read-only preview</span>
                </div>
              </div>
              <div className="p-6">
                {/* Search & Actions Bar */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex-1 max-w-md">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search..."
                        disabled
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-400"
                      />
                      <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button disabled className="px-4 py-2 bg-gray-100 text-gray-400 rounded-lg text-sm cursor-not-allowed">
                      Export
                    </button>
                    <button disabled className="px-4 py-2 bg-indigo-100 text-indigo-400 rounded-lg text-sm cursor-not-allowed">
                      + New Record
                    </button>
                  </div>
                </div>

                {/* Table */}
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="w-10 px-4 py-3">
                          <input type="checkbox" disabled className="rounded border-gray-300" />
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Value</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {[1, 2, 3, 4].map((row) => (
                        <tr key={row} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <input type="checkbox" disabled className="rounded border-gray-300" />
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">#{1000 + row}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">Sample Item {row}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">${(row * 250).toFixed(2)}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              row % 2 === 0 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                            }`}>
                              {row % 2 === 0 ? 'Active' : 'Pending'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <button disabled className="text-gray-400 hover:text-gray-600">⋮</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between mt-4">
                  <span className="text-sm text-gray-500">Showing 1-4 of ~XXX records</span>
                  <div className="flex gap-1">
                    <button disabled className="px-3 py-1 border border-gray-200 rounded text-gray-400">←</button>
                    <button disabled className="px-3 py-1 border border-indigo-500 bg-indigo-50 text-indigo-600 rounded">1</button>
                    <button disabled className="px-3 py-1 border border-gray-200 rounded text-gray-400">2</button>
                    <button disabled className="px-3 py-1 border border-gray-200 rounded text-gray-400">3</button>
                    <button disabled className="px-3 py-1 border border-gray-200 rounded text-gray-400">→</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Detail View Preview */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">Record Detail View</h3>
                  <span className="text-xs text-amber-600">Read-only preview</span>
                </div>
                <div className="flex gap-2">
                  <button disabled className="px-3 py-1.5 border border-gray-200 rounded text-gray-400 text-sm cursor-not-allowed">
                    Edit
                  </button>
                  <button disabled className="px-3 py-1.5 border border-red-200 text-red-300 rounded text-sm cursor-not-allowed">
                    Delete
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Record ID</label>
                    <p className="mt-1 text-gray-900 font-medium">#1001</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Created</label>
                    <p className="mt-1 text-gray-900">2024-01-15 10:30 AM</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Name</label>
                    <p className="mt-1 text-gray-900">Sample Record Name</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Status</label>
                    <p className="mt-1">
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-sm rounded-full">Active</span>
                    </p>
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs font-medium text-gray-500 uppercase">Description</label>
                    <p className="mt-1 text-gray-600">
                      This is a sample description field showing how detail views will display longer text content.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: Chatbot Preview */}
        {activeTab === 'chatbot' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-2">AI Chatbot Capabilities</h3>
              <p className="text-sm text-gray-500">
                Based on your data, the chatbot will be able to answer questions like these:
              </p>
            </div>

            {/* Example Q&A */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-indigo-50">
                <h3 className="font-semibold text-gray-900">💬 Example Questions & Answers</h3>
                <span className="text-xs text-amber-600">Static preview - responses are illustrative</span>
              </div>
              <div className="p-6 space-y-6">
                {/* Q&A 1 */}
                <div className="space-y-3">
                  <div className="flex justify-end">
                    <div className="bg-indigo-600 text-white rounded-2xl rounded-br-md px-4 py-3 max-w-md">
                      "What was our total revenue last month?"
                    </div>
                  </div>
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-3 max-w-lg">
                      <p className="text-gray-800 mb-2">
                        Based on your <strong>ORDERS</strong> table, total revenue for the last month was <strong>$127,450</strong>.
                        This represents a 12% increase from the previous month.
                      </p>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        📊 Data source: orders.total ({tables[0]?.estimatedRows || '5,200'} records)
                      </p>
                    </div>
                  </div>
                </div>

                {/* Q&A 2 */}
                <div className="space-y-3">
                  <div className="flex justify-end">
                    <div className="bg-indigo-600 text-white rounded-2xl rounded-br-md px-4 py-3 max-w-md">
                      "Who are our top 5 customers?"
                    </div>
                  </div>
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-3 max-w-lg">
                      <p className="text-gray-800 mb-2">Your top 5 customers by total spend are:</p>
                      <ol className="text-gray-800 text-sm space-y-1 mb-2">
                        <li>1. Acme Corporation - $45,200</li>
                        <li>2. Beta Industries - $38,100</li>
                        <li>3. Gamma LLC - $29,800</li>
                        <li>4. Delta Corp - $24,500</li>
                        <li>5. Epsilon Inc - $21,300</li>
                      </ol>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        📊 Data source: customers + orders (JOIN query)
                      </p>
                    </div>
                  </div>
                </div>

                {/* Q&A 3 */}
                <div className="space-y-3">
                  <div className="flex justify-end">
                    <div className="bg-indigo-600 text-white rounded-2xl rounded-br-md px-4 py-3 max-w-md">
                      "Show me pending orders over $1000"
                    </div>
                  </div>
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-3 max-w-lg">
                      <p className="text-gray-800 mb-2">Found 12 pending orders over $1,000:</p>
                      <div className="bg-white rounded border border-gray-200 p-2 mb-2 text-sm">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="text-gray-500">
                              <th className="text-left py-1">Order</th>
                              <th className="text-left py-1">Customer</th>
                              <th className="text-right py-1">Amount</th>
                            </tr>
                          </thead>
                          <tbody className="text-gray-700">
                            <tr><td>#1052</td><td>Acme Corp</td><td className="text-right">$2,450</td></tr>
                            <tr><td>#1048</td><td>Beta Inc</td><td className="text-right">$1,890</td></tr>
                            <tr><td>...</td><td>...</td><td className="text-right">...</td></tr>
                          </tbody>
                        </table>
                      </div>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        📊 Query: orders WHERE status='pending' AND total &gt; 1000
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Supported Query Types */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h4 className="font-semibold text-gray-900 mb-4">Supported Query Types</h4>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: '∑', label: 'Aggregations', desc: 'SUM, COUNT, AVG, MIN, MAX' },
                  { icon: '🔍', label: 'Filtering', desc: 'WHERE conditions, date ranges' },
                  { icon: '🏆', label: 'Top N queries', desc: 'Best, worst, highest, lowest' },
                  { icon: '📅', label: 'Time comparisons', desc: 'vs last month, year over year' },
                  { icon: '🔗', label: 'Join queries', desc: 'Across related tables' },
                  { icon: '📊', label: 'Drill-down', desc: 'Follow-up questions' }
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <span className="text-xl">{item.icon}</span>
                    <div>
                      <p className="font-medium text-gray-900">{item.label}</p>
                      <p className="text-sm text-gray-500">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chatbot Intents */}
            {chatbotIntents.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h4 className="font-semibold text-gray-900 mb-4">Detected Intents from Your Data</h4>
                <div className="flex flex-wrap gap-2">
                  {chatbotIntents.map((intent, i) => (
                    <span key={i} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                      {intent}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Bottom CTA */}
        <div className="mt-8 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Ready to build?</h3>
              <p className="text-sm text-gray-600">
                This will create your dashboard, CRUD views, and chatbot based on the configurations shown above.
              </p>
            </div>
            <button
              onClick={() => navigate(`/app/runs/${runId}/build`)}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-colors flex items-center gap-2 shadow-lg"
            >
              <span>🚀</span>
              Build App
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to generate mock values for sample data
function generateMockValue(type, name, rowIndex) {
  const typeLower = (type || '').toLowerCase();
  const nameLower = (name || '').toLowerCase();

  if (nameLower.includes('id')) {
    return `#${1000 + rowIndex}`;
  }
  if (nameLower.includes('date') || typeLower.includes('date') || typeLower.includes('timestamp')) {
    return `2024-01-${10 + rowIndex}`;
  }
  if (nameLower.includes('email')) {
    return `user${rowIndex}@example.com`;
  }
  if (nameLower.includes('name')) {
    return `Sample ${rowIndex}`;
  }
  if (nameLower.includes('amount') || nameLower.includes('total') || nameLower.includes('price')) {
    return `$${(rowIndex * 250 + 100).toFixed(2)}`;
  }
  if (nameLower.includes('status')) {
    return rowIndex % 2 === 0 ? 'Active' : 'Pending';
  }
  if (typeLower.includes('int') || typeLower.includes('number')) {
    return (rowIndex * 10 + 5).toString();
  }
  if (typeLower.includes('bool')) {
    return rowIndex % 2 === 0 ? 'Yes' : 'No';
  }

  return `Value ${rowIndex}`;
}
