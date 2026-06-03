import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import DataLineageGraph from '../components/DataLineageGraph';
import ExportButtons from '../components/ExportButtons';

/**
 * BuildSummary Page - Phase G
 *
 * Comprehensive "What was generated" summary page showing:
 * - Overview stats
 * - Data lineage visualization
 * - Architecture, Schema, KPIs, Dashboards, CRUD, API details
 * - Privacy & ownership messaging
 * - Export buttons (README, PDF)
 */
export default function BuildSummary() {
  const { id: runId } = useParams();
  const navigate = useNavigate();
  const { authFetch } = useAuth();

  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    architecture: true,
    schema: false,
    kpis: false,
    dashboards: false,
    crud: false,
    api: false,
    deployment: false
  });

  useEffect(() => {
    loadSummary();
  }, [runId]);

  const loadSummary = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await authFetch(`/orchestrated-runs/${runId}/summary`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load summary');
      }

      setSummary(data);
    } catch (err) {
      console.error('Error loading summary:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Build Summary...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <svg className="w-12 h-12 text-red-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h2 className="text-xl font-semibold text-red-800 mb-2">Cannot Load Summary</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!summary) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 text-white">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <button
                onClick={() => navigate(-1)}
                className="text-indigo-200 hover:text-white mb-2 flex items-center gap-1 text-sm"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>
              <h1 className="text-3xl font-bold">{summary.run.name}</h1>
              <p className="text-indigo-200 mt-1">Build Summary - What was generated</p>
            </div>
            <ExportButtons runId={runId} />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* Overview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            icon={<DatabaseIcon />}
            value={summary.scan.totalFiles + summary.scan.totalTables}
            label="Data Sources"
            color="blue"
          />
          <StatCard
            icon={<ChartIcon />}
            value={summary.kpis.totalCount}
            label="KPIs Defined"
            color="green"
          />
          <StatCard
            icon={<LayoutIcon />}
            value={summary.dashboards.totalPages}
            label="Dashboard Pages"
            color="purple"
          />
          <StatCard
            icon={<CodeIcon />}
            value={summary.blueprint.apiEndpoints.length || summary.crudEntities.length * 4}
            label="API Endpoints"
            color="orange"
          />
        </div>

        {/* Data Lineage Visualization */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Data Lineage
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              How your data flows from sources to insights
            </p>
          </div>
          <div className="p-6">
            <DataLineageGraph lineage={summary.lineage} kpis={summary.kpis.items} />
          </div>
        </div>

        {/* Collapsible Sections */}
        <div className="space-y-4">
          {/* Architecture Section */}
          <CollapsibleSection
            title="Architecture Decision"
            icon={<ArchitectureIcon />}
            expanded={expandedSections.architecture}
            onToggle={() => toggleSection('architecture')}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-700 mb-3">Configuration</h4>
                <div className="space-y-2">
                  <InfoRow label="Architecture Type" value={summary.architecture.choiceLabel} />
                  <InfoRow label="Deployment Model" value={summary.architecture.deploymentLabel} />
                  <InfoRow label="Data Inclusion" value={`${summary.architecture.dataInclusionPercent}%`} />
                  <InfoRow label="Estimated Rows" value={summary.architecture.estimatedRows?.toLocaleString() || '0'} />
                  <InfoRow label="Estimated Storage" value={`${summary.architecture.estimatedStorageMb} MB`} />
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-700 mb-3">Tech Stack</h4>
                <div className="space-y-2">
                  <InfoRow label="Frontend" value={summary.blueprint.techStack.frontend} />
                  <InfoRow label="Backend" value={summary.blueprint.techStack.backend} />
                  <InfoRow label="Database" value={summary.blueprint.techStack.database} />
                </div>
              </div>
            </div>
          </CollapsibleSection>

          {/* Schema Section */}
          <CollapsibleSection
            title={`Database Schema (${summary.schema.totalTables} tables)`}
            icon={<TableIcon />}
            expanded={expandedSections.schema}
            onToggle={() => toggleSection('schema')}
          >
            <div className="space-y-4">
              {summary.schema.tables.map((table, idx) => (
                <div key={idx} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{table.name}</h4>
                    <span className="text-sm text-gray-500">{table.columnCount} columns</span>
                  </div>
                  {table.description && (
                    <p className="text-sm text-gray-600 mb-3">{table.description}</p>
                  )}
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-2 px-2 text-gray-500 font-medium">Column</th>
                          <th className="text-left py-2 px-2 text-gray-500 font-medium">Type</th>
                          <th className="text-left py-2 px-2 text-gray-500 font-medium">Key</th>
                        </tr>
                      </thead>
                      <tbody>
                        {table.columns.slice(0, 10).map((col, cIdx) => (
                          <tr key={cIdx} className="border-b border-gray-100">
                            <td className="py-2 px-2 font-mono text-gray-900">{col.name}</td>
                            <td className="py-2 px-2 text-gray-600">{col.type}</td>
                            <td className="py-2 px-2">
                              {col.primaryKey && <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-xs">PK</span>}
                              {col.foreignKey && <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">FK</span>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {table.columns.length > 10 && (
                      <p className="text-sm text-gray-500 mt-2">+ {table.columns.length - 10} more columns</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CollapsibleSection>

          {/* KPIs Section */}
          <CollapsibleSection
            title={`KPIs & Metrics (${summary.kpis.totalCount})`}
            icon={<ChartIcon />}
            expanded={expandedSections.kpis}
            onToggle={() => toggleSection('kpis')}
          >
            <div className="space-y-3">
              {summary.kpis.items.map((kpi, idx) => (
                <div key={idx} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <ChartIcon className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-gray-900">{kpi.name}</h4>
                      {kpi.category && (
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">{kpi.category}</span>
                      )}
                    </div>
                    {kpi.description && <p className="text-sm text-gray-600 mt-1">{kpi.description}</p>}
                    {kpi.formula && (
                      <code className="text-xs bg-gray-200 px-2 py-1 rounded mt-2 inline-block font-mono">{kpi.formula}</code>
                    )}
                  </div>
                  {kpi.confidence && (
                    <div className="text-right">
                      <span className="text-sm font-medium text-gray-700">{kpi.confidence}%</span>
                      <p className="text-xs text-gray-500">confidence</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CollapsibleSection>

          {/* Dashboards Section */}
          <CollapsibleSection
            title={`Dashboard Pages (${summary.dashboards.totalPages})`}
            icon={<LayoutIcon />}
            expanded={expandedSections.dashboards}
            onToggle={() => toggleSection('dashboards')}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {summary.dashboards.pages.map((page, idx) => (
                <div key={idx} className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900">{page.name}</h4>
                  {page.description && <p className="text-sm text-gray-600 mt-1">{page.description}</p>}
                  <div className="mt-3 flex items-center gap-2">
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-sm">
                      {page.kpiCount} KPIs
                    </span>
                  </div>
                </div>
              ))}
              {summary.dashboards.pages.length === 0 && (
                <p className="text-gray-500 col-span-2">No dashboard pages defined yet.</p>
              )}
            </div>
          </CollapsibleSection>

          {/* CRUD Section */}
          <CollapsibleSection
            title={`CRUD Entities (${summary.crudEntities.length})`}
            icon={<CRUDIcon />}
            expanded={expandedSections.crud}
            onToggle={() => toggleSection('crud')}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {summary.crudEntities.map((entity, idx) => (
                <div key={idx} className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900">{entity.name}</h4>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {(entity.operations || ['create', 'read', 'update', 'delete']).map((op, oIdx) => (
                      <span key={oIdx} className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs capitalize">
                        {op}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
              {summary.crudEntities.length === 0 && (
                <p className="text-gray-500 col-span-3">No CRUD entities defined yet.</p>
              )}
            </div>
          </CollapsibleSection>

          {/* API Section */}
          <CollapsibleSection
            title={`API Endpoints (${summary.blueprint.apiEndpoints.length || summary.crudEntities.length * 4})`}
            icon={<CodeIcon />}
            expanded={expandedSections.api}
            onToggle={() => toggleSection('api')}
          >
            {summary.blueprint.apiEndpoints.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 px-3 text-gray-500 font-medium">Method</th>
                      <th className="text-left py-2 px-3 text-gray-500 font-medium">Path</th>
                      <th className="text-left py-2 px-3 text-gray-500 font-medium">Purpose</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.blueprint.apiEndpoints.map((endpoint, idx) => (
                      <tr key={idx} className="border-b border-gray-100">
                        <td className="py-2 px-3">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                            endpoint.method === 'GET' ? 'bg-green-100 text-green-700' :
                            endpoint.method === 'POST' ? 'bg-blue-100 text-blue-700' :
                            endpoint.method === 'PUT' ? 'bg-amber-100 text-amber-700' :
                            endpoint.method === 'DELETE' ? 'bg-red-100 text-red-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {endpoint.method}
                          </span>
                        </td>
                        <td className="py-2 px-3 font-mono text-gray-900">{endpoint.path}</td>
                        <td className="py-2 px-3 text-gray-600">{endpoint.purpose || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500">API endpoints will be auto-generated based on CRUD entities.</p>
            )}
          </CollapsibleSection>

          {/* Deployment Section */}
          <CollapsibleSection
            title="Deployment"
            icon={<DeployIcon />}
            expanded={expandedSections.deployment}
            onToggle={() => toggleSection('deployment')}
          >
            {summary.deployment ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">Type</p>
                    <p className="font-medium text-gray-900">{summary.deployment.type}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">Status</p>
                    <p className="font-medium text-gray-900 capitalize">{summary.deployment.status}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">Environment</p>
                    <p className="font-medium text-gray-900 capitalize">{summary.deployment.environment}</p>
                  </div>
                  {summary.deployment.expiresAt && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500">Expires</p>
                      <p className="font-medium text-gray-900">
                        {new Date(summary.deployment.expiresAt).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
                {summary.deployment.url && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-700 mb-2">Deployment URL:</p>
                    <a
                      href={summary.deployment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-600 hover:text-green-800 font-mono text-sm break-all"
                    >
                      {summary.deployment.url}
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500">No deployment configured yet.</p>
            )}
          </CollapsibleSection>
        </div>

        {/* Privacy & Ownership Section */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Data Ownership & Privacy
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <PrivacyCard
              icon={<ShieldIcon />}
              title="Your Data, Your Control"
              description="All data is processed in your environment. No data is retained by Skatalyst after processing completes."
            />
            <PrivacyCard
              icon={<KeyIcon />}
              title="Generated Code Ownership"
              description="100% of generated code belongs to you. Use, modify, and distribute freely with no restrictions."
            />
            <PrivacyCard
              icon={<LockIcon />}
              title="Privacy by Design"
              description="Generated applications contain no telemetry, analytics, or callbacks. Fully self-contained."
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({ icon, value, label, color }) {
  const colors = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600'
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colors[color]}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  );
}

// Collapsible Section Component
function CollapsibleSection({ title, icon, expanded, onToggle, children }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600">
            {icon}
          </div>
          <h3 className="font-semibold text-gray-900">{title}</h3>
        </div>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {expanded && (
        <div className="px-6 pb-6 border-t border-gray-100 pt-4">
          {children}
        </div>
      )}
    </div>
  );
}

// Info Row Component
function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-100">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-900">{value}</span>
    </div>
  );
}

// Privacy Card Component
function PrivacyCard({ icon, title, description }) {
  return (
    <div className="bg-white rounded-lg p-5 border border-blue-100">
      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 mb-3">
        {icon}
      </div>
      <h4 className="font-medium text-gray-900 mb-2">{title}</h4>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
}

// Icons
function DatabaseIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
    </svg>
  );
}

function ChartIcon({ className = "w-6 h-6" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );
}

function LayoutIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
    </svg>
  );
}

function CodeIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
  );
}

function ArchitectureIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
  );
}

function TableIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  );
}

function CRUDIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

function DeployIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  );
}

function KeyIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  );
}
