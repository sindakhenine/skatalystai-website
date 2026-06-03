import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Structuring Plan Review Page (/app/runs/:id/plan)
 *
 * Displays the generated structuring plan including:
 * - Proposed database schema
 * - Proposed folder/blob taxonomy
 * - Destination recommendations
 *
 * User can review, modify, and confirm the plan.
 */

// Icons
const CheckIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const XIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const DatabaseIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
  </svg>
);

const FolderIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
  </svg>
);

const CloudIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
  </svg>
);

const TableIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);

const KeyIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
  </svg>
);

const LoadingSpinner = ({ size = 'md' }) => {
  const sizes = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-8 w-8', xl: 'h-12 w-12' };
  return (
    <svg className={`animate-spin ${sizes[size]}`} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
};

// Get status badge color
const getStatusColor = (status) => {
  const colors = {
    draft: 'bg-yellow-100 text-yellow-700',
    reviewed: 'bg-blue-100 text-blue-700',
    confirmed: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
  };
  return colors[status] || 'bg-gray-100 text-gray-700';
};

// Get destination icon
const getDestinationIcon = (type) => {
  if (type === 'postgresql') return <DatabaseIcon />;
  if (type === 'blob' || type === 'azure_blob' || type === 's3') return <CloudIcon />;
  return <FolderIcon />;
};

// Get destination label
const getDestinationLabel = (type) => {
  const labels = {
    postgresql: 'PostgreSQL Database',
    mysql: 'MySQL Database',
    blob: 'Blob Storage',
    azure_blob: 'Azure Blob Storage',
    s3: 'Amazon S3',
    local: 'Local Storage',
  };
  return labels[type] || type;
};

export default function StructuringPlan() {
  const { t } = useTranslation();
  const { id: runId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { authFetch } = useAuth();

  const [run, setRun] = useState(null);
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirming, setConfirming] = useState(false);
  const [expandedTables, setExpandedTables] = useState({});
  const [successBanner, setSuccessBanner] = useState(null);

  // Handle success banner from navigation state
  useEffect(() => {
    if (location.state?.showSuccessBanner) {
      setSuccessBanner(location.state.message || t('plan.planGenerated', 'Structuring plan generated!'));
      // Clear the state to prevent showing banner on refresh
      navigate(location.pathname, { replace: true, state: {} });
      // Auto-dismiss after 8 seconds
      const timer = setTimeout(() => setSuccessBanner(null), 8000);
      return () => clearTimeout(timer);
    }
  }, [location.state, location.pathname, navigate, t]);

  // Fetch run and plan
  const fetchData = useCallback(async () => {
    try {
      // Fetch run
      const runRes = await authFetch(`/orchestrated-runs/${runId}`);
      if (!runRes.ok) {
        const data = await runRes.json();
        throw new Error(data.error || 'Failed to fetch run');
      }
      const runData = await runRes.json();
      setRun(runData);

      // Fetch plan
      const planRes = await authFetch(`/orchestrated-runs/${runId}/structuring-plan`);
      if (planRes.ok) {
        const planData = await planRes.json();
        setPlan(planData);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [authFetch, runId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Toggle table expansion
  const toggleTable = (tableName) => {
    setExpandedTables(prev => ({
      ...prev,
      [tableName]: !prev[tableName],
    }));
  };

  // Confirm the plan and redirect to organization preview (Phase B2.5)
  const handleConfirm = async () => {
    setConfirming(true);
    setError(null);
    try {
      const res = await authFetch(`/orchestrated-runs/${runId}/confirm-plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to confirm plan');
      }

      // Navigate to organization preview (Phase B2.5 - must confirm architecture before building)
      navigate(`/app/runs/${runId}/organization-preview`, {
        state: {
          showSuccessBanner: true,
          message: t('plan.confirmSuccess', 'Plan confirmed! Please review your data architecture.')
        }
      });
    } catch (err) {
      setError(err.message);
      setConfirming(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="xl" />
      </div>
    );
  }

  if (error && !plan) {
    return (
      <div className="p-6 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
          <XIcon />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          {t('plan.errorTitle', 'Error Loading Plan')}
        </h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={() => navigate(`/app/runs/${runId}/inventory`)}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          {t('plan.backToInventory', 'Back to Inventory')}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Success Banner */}
      {successBanner && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-full text-green-600">
              <CheckIcon />
            </div>
            <p className="text-green-800 font-medium">{successBanner}</p>
          </div>
          <button
            onClick={() => setSuccessBanner(null)}
            className="p-1 text-green-600 hover:bg-green-100 rounded-full transition-colors"
          >
            <XIcon />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <button
              onClick={() => navigate(`/app/runs/${runId}/inventory`)}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-2xl font-bold text-gray-900">
              {t('plan.title', 'Structuring Plan')}
            </h1>
            {plan && (
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(plan.status)}`}>
                {plan.status}
              </span>
            )}
          </div>
          <p className="text-gray-600 ml-8">
            {t('plan.subtitle', 'Review the proposed structure for your data')}
          </p>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>{t('plan.method', 'Method')}:</span>
          <span className="font-medium capitalize">{plan?.generationMethod || plan?.generation_method || 'heuristic'}</span>
        </div>
      </div>

      {/* No plan yet */}
      {!plan && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {t('plan.noPlan', 'No Structuring Plan Generated')}
          </h3>
          <p className="text-gray-600 mb-4">
            {t('plan.noPlanDesc', 'A structuring plan has not been generated for this run yet.')}
          </p>
          <button
            onClick={() => navigate(`/app/runs/${runId}/inventory`)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t('plan.goToInventory', 'Go to Inventory')}
          </button>
        </div>
      )}

      {/* Plan exists but is empty (no tables or taxonomy) */}
      {plan && !(plan.schemaProposal || plan.schema_proposal)?.tables?.length && !(plan.taxonomyProposal || plan.taxonomy_proposal)?.folders?.length && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-amber-100 rounded-xl text-amber-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-amber-900">
                {t('plan.emptyPlan', 'No Structure Detected')}
              </h3>
              <p className="text-amber-700 mt-1">
                {t('plan.emptyPlanDesc', 'The inventory contains no extractable tables (CSV, XLSX, JSON) or database sources. The plan was generated but has no schema or taxonomy proposals.')}
              </p>
              <div className="mt-4 p-3 bg-amber-100 rounded-lg text-sm">
                <strong className="text-amber-900">Debug Info:</strong>
                <ul className="mt-1 text-amber-800 space-y-1">
                  <li>Plan ID: {plan.id || 'N/A'}</li>
                  <li>Plan Status: {plan.status || 'N/A'}</li>
                  <li>Schema Tables: {(plan.schemaProposal || plan.schema_proposal)?.tables?.length || 0}</li>
                  <li>Taxonomy Folders: {(plan.taxonomyProposal || plan.taxonomy_proposal)?.folders?.length || 0}</li>
                  <li>Destinations: {(plan.destinationRecommendations || plan.destination_recommendations)?.length || 0}</li>
                </ul>
              </div>
              <div className="mt-3 flex gap-3">
                <button
                  onClick={() => navigate(`/app/runs/${runId}/inventory`)}
                  className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 text-sm"
                >
                  View Inventory
                </button>
                <button
                  onClick={() => navigate('/app/connectors')}
                  className="px-4 py-2 border border-amber-400 text-amber-700 rounded-lg hover:bg-amber-100 text-sm"
                >
                  Upload CSV/XLSX
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {plan && (
        <>
          {/* Destination Recommendations */}
          {(plan.destinationRecommendations || plan.destination_recommendations)?.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <CloudIcon />
                {t('plan.recommendedDestinations', 'Recommended Destinations')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(plan.destinationRecommendations || plan.destination_recommendations).map((rec, i) => (
                  <div
                    key={i}
                    className={`p-4 rounded-xl border-2 ${
                      i === 0 ? 'border-green-500 bg-green-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`p-2 rounded-lg ${i === 0 ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}>
                        {getDestinationIcon(rec.destinationType)}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {getDestinationLabel(rec.destinationType)}
                        </h4>
                        {i === 0 && (
                          <span className="text-xs text-green-600 font-medium">
                            {t('plan.recommended', 'Recommended')}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                      <span>{t('plan.confidence', 'Confidence')}:</span>
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${i === 0 ? 'bg-green-500' : 'bg-blue-500'}`}
                          style={{ width: `${(rec.confidence || 0.5) * 100}%` }}
                        />
                      </div>
                      <span className="font-medium">{Math.round((rec.confidence || 0.5) * 100)}%</span>
                    </div>
                    <p className="text-sm text-gray-600">{rec.reasoning}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Schema Proposal */}
          {(plan.schemaProposal || plan.schema_proposal) && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <DatabaseIcon />
                {t('plan.schemaProposal', 'Database Schema Proposal')}
              </h2>

              {(plan.schemaProposal || plan.schema_proposal)?.reasoning && (
                <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700">{(plan.schemaProposal || plan.schema_proposal).reasoning}</p>
                </div>
              )}

              {/* Tables */}
              {(plan.schemaProposal || plan.schema_proposal)?.tables?.length > 0 && (
                <div className="space-y-4">
                  {(plan.schemaProposal || plan.schema_proposal).tables.map((table, i) => (
                    <div key={i} className="border border-gray-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => toggleTable(table.name)}
                        className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <TableIcon />
                          <span className="font-semibold text-gray-900">{table.name}</span>
                          {table.description && (
                            <span className="text-sm text-gray-500">- {table.description}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <span>{table.columns?.length || 0} columns</span>
                          <svg
                            className={`w-5 h-5 transition-transform ${expandedTables[table.name] ? 'rotate-180' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </button>

                      {expandedTables[table.name] && table.columns && (
                        <div className="p-4 border-t border-gray-200">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-gray-200">
                                <th className="text-left py-2 px-2 font-medium text-gray-700">Column</th>
                                <th className="text-left py-2 px-2 font-medium text-gray-700">Type</th>
                                <th className="text-center py-2 px-2 font-medium text-gray-700">Nullable</th>
                                <th className="text-center py-2 px-2 font-medium text-gray-700">Key</th>
                              </tr>
                            </thead>
                            <tbody>
                              {table.columns.map((col, j) => (
                                <tr key={j} className="border-b border-gray-100">
                                  <td className="py-2 px-2 font-medium text-gray-900">{col.name}</td>
                                  <td className="py-2 px-2 text-gray-600 font-mono text-xs">{col.type}</td>
                                  <td className="py-2 px-2 text-center">
                                    {col.nullable ? (
                                      <span className="text-gray-400">Yes</span>
                                    ) : (
                                      <span className="text-gray-600">No</span>
                                    )}
                                  </td>
                                  <td className="py-2 px-2 text-center">
                                    {col.primaryKey && (
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded text-xs">
                                        <KeyIcon />
                                        PK
                                      </span>
                                    )}
                                    {col.foreignKey && (
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                                        FK
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>

                          {/* Indexes */}
                          {table.indexes && table.indexes.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                              <h5 className="text-sm font-medium text-gray-700 mb-2">Indexes</h5>
                              <div className="flex flex-wrap gap-2">
                                {table.indexes.map((idx, k) => (
                                  <span
                                    key={k}
                                    className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-mono"
                                  >
                                    {typeof idx === 'string' ? idx : idx.columns?.join(', ')}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Taxonomy Proposal */}
          {(plan.taxonomyProposal || plan.taxonomy_proposal) && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FolderIcon />
                {t('plan.taxonomyProposal', 'Folder Taxonomy Proposal')}
              </h2>

              {(plan.taxonomyProposal || plan.taxonomy_proposal)?.reasoning && (
                <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700">{(plan.taxonomyProposal || plan.taxonomy_proposal).reasoning}</p>
                </div>
              )}

              {(plan.taxonomyProposal || plan.taxonomy_proposal)?.namingConvention && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Naming Convention: </span>
                  <span className="text-sm text-gray-600">{(plan.taxonomyProposal || plan.taxonomy_proposal).namingConvention}</span>
                </div>
              )}

              {/* Folders */}
              {(plan.taxonomyProposal || plan.taxonomy_proposal)?.folders?.length > 0 && (
                <div className="space-y-3">
                  {(plan.taxonomyProposal || plan.taxonomy_proposal).folders.map((folder, i) => (
                    <div key={i} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-3 mb-2">
                        <FolderIcon />
                        <span className="font-mono text-gray-900">{folder.path}</span>
                      </div>
                      {folder.purpose && (
                        <p className="text-sm text-gray-600 ml-8 mb-2">{folder.purpose}</p>
                      )}
                      {folder.filePatterns && folder.filePatterns.length > 0 && (
                        <div className="ml-8 flex flex-wrap gap-2">
                          {folder.filePatterns.map((pattern, j) => (
                            <span
                              key={j}
                              className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-mono"
                            >
                              {pattern}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          {plan.status === 'draft' && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-yellow-100 rounded-xl text-yellow-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {t('plan.reviewPlan', 'Review & Confirm Plan')}
                  </h3>
                  <p className="text-gray-600 mt-1">
                    {t('plan.confirmDesc', 'Review the proposed structure above. When satisfied, confirm to prepare for execution.')}
                  </p>
                  {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
                </div>
                <button
                  onClick={handleConfirm}
                  disabled={confirming}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-300"
                >
                  {confirming ? (
                    <>
                      <LoadingSpinner size="sm" />
                      {t('plan.confirming', 'Confirming...')}
                    </>
                  ) : (
                    <>
                      <CheckIcon />
                      {t('plan.confirmPlan', 'Confirm Plan')}
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Confirmed - Review Architecture (Phase B2.5) */}
          {(plan.status === 'confirmed' && run?.status === 'ready_for_architecture') && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-amber-100 rounded-xl text-amber-600">
                  <CheckIcon />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-amber-900">
                    {t('plan.planConfirmed', 'Plan Confirmed')}
                  </h3>
                  <p className="text-amber-700 mt-1">
                    {t('plan.reviewArchitecture', 'Please review and confirm your data architecture before building apps.')}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => navigate('/app/runs')}
                    className="inline-flex items-center gap-2 px-4 py-2 text-amber-700 bg-amber-100 font-medium rounded-lg hover:bg-amber-200 transition-colors"
                  >
                    {t('plan.viewRuns', 'View Runs')}
                  </button>
                  <button
                    onClick={() => navigate(`/app/runs/${runId}/organization-preview`)}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-amber-600 text-white font-medium rounded-lg hover:bg-amber-700 transition-colors"
                  >
                    {t('plan.reviewArchitecture', 'Review Architecture')}
                    <ArrowRightIcon />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Ready - Can Build Apps */}
          {run?.status === 'ready' && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-green-100 rounded-xl text-green-600">
                  <CheckIcon />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-green-900">
                    {t('plan.readyToBuild', 'Ready to Build')}
                  </h3>
                  <p className="text-green-700 mt-1">
                    {t('plan.readyForExecution', 'Architecture confirmed. You can now build dashboards, CRUD apps, and chatbots.')}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => navigate('/app/runs')}
                    className="inline-flex items-center gap-2 px-4 py-2 text-green-700 bg-green-100 font-medium rounded-lg hover:bg-green-200 transition-colors"
                  >
                    {t('plan.viewRuns', 'View Runs')}
                  </button>
                  <button
                    onClick={() => navigate(`/app/runs/${runId}/build`)}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
                  >
                    {t('plan.buildApp', 'Build App')}
                    <ArrowRightIcon />
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
