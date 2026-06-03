import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import mermaid from 'mermaid';

/**
 * Organization Preview Page (/app/runs/:id/organization-preview)
 *
 * Phase B2.5 - Data Organization & Architecture Preview
 *
 * This page shows users how their messy data will become structured
 * before allowing dashboard/app generation.
 *
 * Sections:
 * 1. Chaos → Structure visualization
 * 2. Data Inclusion Report
 * 3. Architecture Options (3 choices)
 * 4. Visual Previews (ER diagram, folder tree, sample data)
 * 5. Deployment Choice
 * 6. Confirm button
 */

// Initialize mermaid
mermaid.initialize({
  startOnLoad: false,
  theme: 'neutral',
  securityLevel: 'loose',
  er: {
    useMaxWidth: true,
    fontSize: 12
  }
});

// Icons
const ArrowRightIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
  </svg>
);

const DatabaseIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
  </svg>
);

const DocumentIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const FolderIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
  </svg>
);

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

const CloudIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
  </svg>
);

const ServerIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
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

// Format bytes
const formatBytes = (bytes) => {
  if (!bytes || bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
};

// Architecture option icons
const getArchitectureIcon = (id) => {
  if (id === 'relational') return <DatabaseIcon />;
  if (id === 'document') return <DocumentIcon />;
  return <FolderIcon />;
};

export default function OrganizationPreview() {
  const { t } = useTranslation();
  const { id: runId } = useParams();
  const navigate = useNavigate();
  const { authFetch } = useAuth();

  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirming, setConfirming] = useState(false);

  // Selection state
  const [selectedArchitecture, setSelectedArchitecture] = useState(null);
  const [selectedDeployment, setSelectedDeployment] = useState(null);

  // Mermaid diagram state
  const [mermaidSvg, setMermaidSvg] = useState(null);
  const [mermaidError, setMermaidError] = useState(false);

  // Document generation state
  const [generatingDocs, setGeneratingDocs] = useState(false);
  const [generatedDocs, setGeneratedDocs] = useState(null);

  // Fetch preview data
  const fetchPreview = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await authFetch(`/orchestrated-runs/${runId}/architecture-preview`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to fetch architecture preview');
      }

      const data = await res.json();
      setPreview(data);

      // Set default selections
      if (data.options?.recommended) {
        setSelectedArchitecture(data.options.recommended);
      }
      if (data.currentSelection?.architectureChoice) {
        setSelectedArchitecture(data.currentSelection.architectureChoice);
      }
      if (data.currentSelection?.deploymentChoice) {
        setSelectedDeployment(data.currentSelection.deploymentChoice);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [authFetch, runId]);

  useEffect(() => {
    fetchPreview();
  }, [fetchPreview]);

  // Render mermaid diagram
  useEffect(() => {
    if (preview?.visualPreviews?.erDiagram?.mermaid) {
      const renderMermaid = async () => {
        try {
          const { svg } = await mermaid.render('er-diagram', preview.visualPreviews.erDiagram.mermaid);
          setMermaidSvg(svg);
          setMermaidError(false);
        } catch (err) {
          console.error('Mermaid render error:', err);
          setMermaidError(true);
        }
      };
      renderMermaid();
    }
  }, [preview?.visualPreviews?.erDiagram?.mermaid]);

  // Get selected option details
  const selectedOption = useMemo(() => {
    if (!preview?.options?.items || !selectedArchitecture) return null;
    return preview.options.items.find(o => o.id === selectedArchitecture);
  }, [preview?.options?.items, selectedArchitecture]);

  // Handle confirmation
  const handleConfirm = async () => {
    if (!selectedArchitecture || !selectedDeployment) {
      setError('Please select both an architecture option and deployment choice');
      return;
    }

    setConfirming(true);
    setError(null);

    try {
      const res = await authFetch(`/orchestrated-runs/${runId}/architecture-preview/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          architectureChoice: selectedArchitecture,
          deploymentChoice: selectedDeployment
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to confirm architecture');
      }

      // Navigate to KPI discovery (Phase E)
      navigate(`/app/runs/${runId}/kpi-discovery`, {
        state: {
          showSuccessBanner: true,
          message: 'Architecture confirmed! Now let\'s discover your KPIs and use cases.'
        }
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setConfirming(false);
    }
  };

  // Generate document records from files
  const handleGenerateDocuments = async () => {
    setGeneratingDocs(true);
    setError(null);

    try {
      const res = await authFetch(`/orchestrated-runs/${runId}/generate-documents`, {
        method: 'POST'
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to generate documents');
      }

      const data = await res.json();
      setGeneratedDocs(data.documents);

      // Refresh preview to get updated document count
      fetchPreview();
    } catch (err) {
      setError(err.message);
    } finally {
      setGeneratingDocs(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="xl" />
      </div>
    );
  }

  if (error && !preview) {
    return (
      <div className="p-6 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
          <XIcon />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Preview</h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={() => navigate(`/app/runs/${runId}/plan`)}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Back to Plan
        </button>
      </div>
    );
  }

  const { chaosToStructure, inclusionReport, options, visualPreviews } = preview || {};

  // Check for 0 tables
  const totalTables = chaosToStructure?.chaos?.totalTables || chaosToStructure?.structure?.totalTables || 0;
  const hasNoTables = totalTables === 0;

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <button
              onClick={() => navigate(`/app/runs/${runId}/plan`)}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-2xl font-bold text-gray-900">
              Data Organization & Architecture
            </h1>
          </div>
          <p className="text-gray-600 ml-8">
            Review how your data will be transformed before building apps
          </p>
        </div>

        {/* No Tables Warning */}
        {hasNoTables && (
          <div className="mb-6 p-6 bg-amber-50 border border-amber-200 rounded-xl">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-amber-800 mb-2">
                  No Structured Tables Detected
                </h3>
                <p className="text-amber-700 mb-4">
                  KPIs and dashboards require at least one structured table (from CSV, XLSX, JSON, or database).
                  Your current data sources only contain unstructured files (documents, images, etc.).
                </p>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => navigate('/app/connectors')}
                    className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium"
                  >
                    Upload CSV/XLSX Sample
                  </button>
                  <button
                    onClick={() => navigate(`/app/runs/${runId}/inventory`)}
                    className="px-4 py-2 bg-white border border-amber-300 text-amber-700 rounded-lg hover:bg-amber-50 transition-colors"
                  >
                    View Inventory
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error banner */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Section 1: Chaos → Structure */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Data Transformation Preview
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Chaos */}
            <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl">
              <h3 className="font-semibold text-red-800 mb-3 flex items-center gap-2">
                <span className="text-xl">📁</span>
                Your Current Data
              </h3>
              <ul className="space-y-2 text-sm text-red-700">
                <li className="flex justify-between">
                  <span>Total files:</span>
                  <span className="font-semibold">{chaosToStructure?.chaos?.totalFiles || 0}</span>
                </li>
                <li className="flex justify-between">
                  <span>Total tables:</span>
                  <span className="font-semibold">{chaosToStructure?.chaos?.totalTables || 0}</span>
                </li>
                <li className="flex justify-between">
                  <span>Data sources:</span>
                  <span className="font-semibold">{chaosToStructure?.chaos?.connectors || 0}</span>
                </li>
                <li className="flex justify-between">
                  <span>Total size:</span>
                  <span className="font-semibold">{formatBytes(chaosToStructure?.chaos?.totalSize)}</span>
                </li>
                {chaosToStructure?.chaos?.fileFormats?.length > 0 && (
                  <li className="pt-2 border-t border-red-200">
                    <span className="block mb-1">Formats:</span>
                    <div className="flex flex-wrap gap-1">
                      {chaosToStructure.chaos.fileFormats.slice(0, 6).map(fmt => (
                        <span key={fmt} className="px-2 py-0.5 bg-red-100 text-red-600 rounded text-xs">
                          .{fmt}
                        </span>
                      ))}
                    </div>
                  </li>
                )}
              </ul>
              <p className="mt-3 text-xs text-red-600 italic">
                {chaosToStructure?.chaos?.description}
              </p>
            </div>

            {/* Arrow */}
            <div className="hidden md:flex items-center justify-center absolute left-1/2 transform -translate-x-1/2">
              <div className="p-3 bg-green-100 rounded-full text-green-600">
                <ArrowRightIcon />
              </div>
            </div>

            {/* Right: Structure */}
            <div className="p-4 bg-green-50 border-2 border-green-200 rounded-xl">
              <h3 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                <span className="text-xl">🏗️</span>
                Proposed Structure
              </h3>
              <ul className="space-y-2 text-sm text-green-700">
                <li className="flex justify-between">
                  <span>SQL tables:</span>
                  <span className="font-semibold">{chaosToStructure?.structure?.sqlTables || 0}</span>
                </li>
                <li className="flex justify-between">
                  <span>Blob containers:</span>
                  <span className="font-semibold">{chaosToStructure?.structure?.blobContainers || 0}</span>
                </li>
                <li className="flex justify-between">
                  <span>Relationships:</span>
                  <span className="font-semibold">{chaosToStructure?.structure?.relationships || 0}</span>
                </li>
                <li className="flex justify-between">
                  <span>Indexes:</span>
                  <span className="font-semibold">{chaosToStructure?.structure?.indexes || 0}</span>
                </li>
              </ul>
              <p className="mt-3 text-xs text-green-600 italic">
                {chaosToStructure?.structure?.description}
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: Data Inclusion Report */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Data Inclusion Report
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="p-4 bg-gray-50 rounded-lg text-center">
              <p className="text-2xl font-bold text-gray-900">{inclusionReport?.totalScanned || 0}</p>
              <p className="text-sm text-gray-600">Total Scanned</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg text-center">
              <p className="text-2xl font-bold text-blue-600">{inclusionReport?.relevantPercent || 0}%</p>
              <p className="text-sm text-gray-600">Relevant to Context</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg text-center">
              <p className="text-2xl font-bold text-green-600">{inclusionReport?.includedPercent || 0}%</p>
              <p className="text-sm text-gray-600">Included in DB</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg text-center">
              <p className="text-2xl font-bold text-gray-500">{inclusionReport?.archivedPercent || 0}%</p>
              <p className="text-sm text-gray-600">Archived/Ignored</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="p-3 border border-gray-200 rounded-lg">
              <p className="text-sm text-gray-600">Estimated Rows</p>
              <p className="text-lg font-semibold text-gray-900">~{(inclusionReport?.estimatedRows || 0).toLocaleString()}</p>
            </div>
            <div className="p-3 border border-gray-200 rounded-lg">
              <p className="text-sm text-gray-600">Estimated Storage</p>
              <p className="text-lg font-semibold text-gray-900">~{inclusionReport?.estimatedStorageMb || 0} MB</p>
            </div>
            <div className="p-3 border border-gray-200 rounded-lg">
              <p className="text-sm text-gray-600">Structured Files</p>
              <p className="text-lg font-semibold text-gray-900">{inclusionReport?.breakdown?.structuredFiles || 0}</p>
            </div>
          </div>
        </div>

        {/* Section 3: Architecture Options */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Choose Your Architecture
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {options?.items?.map((option) => (
              <button
                key={option.id}
                onClick={() => setSelectedArchitecture(option.id)}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  selectedArchitecture === option.id
                    ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200'
                    : option.recommended
                    ? 'border-green-300 bg-green-50 hover:border-green-400'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2 rounded-lg ${
                    selectedArchitecture === option.id
                      ? 'bg-indigo-100 text-indigo-600'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {getArchitectureIcon(option.id)}
                  </div>
                  {option.recommended && (
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                      Recommended
                    </span>
                  )}
                </div>

                <h3 className="font-semibold text-gray-900 mb-1">{option.shortName}</h3>
                <p className="text-sm text-gray-600 mb-3">{option.description}</p>

                {/* Pros */}
                <div className="mb-3">
                  {option.pros?.slice(0, 3).map((pro, i) => (
                    <div key={i} className="flex items-center gap-1 text-xs text-green-600">
                      <CheckIcon className="w-3 h-3" />
                      <span>{pro}</span>
                    </div>
                  ))}
                </div>

                {/* Features */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {option.features?.dashboards && (
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-xs rounded">Dashboards</span>
                  )}
                  {option.features?.crud && (
                    <span className="px-2 py-0.5 bg-purple-100 text-purple-600 text-xs rounded">CRUD</span>
                  )}
                  {option.features?.chatbot && (
                    <span className="px-2 py-0.5 bg-green-100 text-green-600 text-xs rounded">Chatbot</span>
                  )}
                </div>

                {/* Cost */}
                <div className="pt-3 border-t border-gray-200">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Est. cost:</span>
                    <span className="font-semibold text-gray-900">{option.estimatedCost}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Data included:</span>
                    <span className="font-semibold text-gray-900">{option.dataIncluded}%</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Section 4: Visual Preview */}
        {selectedArchitecture && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Visual Preview: {selectedOption?.shortName}
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* ER Diagram */}
              {selectedArchitecture === 'relational' && (
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-3">ER Diagram</h3>
                  {mermaidSvg && !mermaidError ? (
                    <div
                      className="overflow-auto max-h-[400px]"
                      dangerouslySetInnerHTML={{ __html: mermaidSvg }}
                    />
                  ) : (
                    <div className="space-y-2">
                      {visualPreviews?.erDiagram?.fallback?.map((table, i) => (
                        <div key={i} className="p-2 bg-gray-50 rounded">
                          <p className="font-mono text-sm font-semibold text-gray-900">{table.name}</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {table.columns?.slice(0, 5).map((col, j) => (
                              <span key={j} className="px-1 py-0.5 bg-gray-200 text-gray-600 text-xs rounded">
                                {col.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Document Preview */}
              {selectedArchitecture === 'document' && (
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-3">Document Structure</h3>
                  {/* Check if we have documents or generated docs */}
                  {(visualPreviews?.documentPreview?.documents?.length > 0 || generatedDocs?.length > 0) ? (
                    <div className="space-y-3">
                      {/* Show sample documents (3-5) */}
                      {(generatedDocs || visualPreviews?.documentPreview?.documents || []).slice(0, 5).map((doc, i) => (
                        <div key={doc.id || i} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">
                                {doc.type === 'pdf' ? '📄' : doc.type === 'docx' ? '📝' : doc.type === 'image' ? '🖼️' : doc.type === 'video' ? '🎬' : '📁'}
                              </span>
                              <span className="font-medium text-gray-900 text-sm truncate max-w-[200px]">{doc.filename}</span>
                            </div>
                            <span className="px-2 py-0.5 bg-gray-200 text-gray-600 text-xs rounded">{doc.mimeType || doc.type}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                            <div>Size: <span className="font-medium">{formatBytes(doc.size)}</span></div>
                            <div>Source: <span className="font-medium">{doc.sourceConnector || 'upload'}</span></div>
                          </div>
                          {doc.extractedText && (
                            <div className="mt-2 p-2 bg-white rounded border border-gray-100 text-xs text-gray-500 truncate">
                              {doc.extractedText.substring(0, 100)}...
                            </div>
                          )}
                          {doc.tags?.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {doc.tags.map((tag, j) => (
                                <span key={j} className="px-1.5 py-0.5 bg-blue-100 text-blue-600 text-xs rounded">{tag}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                      {(generatedDocs || visualPreviews?.documentPreview?.documents || []).length > 5 && (
                        <p className="text-xs text-gray-500 text-center">
                          + {(generatedDocs || visualPreviews?.documentPreview?.documents || []).length - 5} more documents
                        </p>
                      )}
                    </div>
                  ) : (
                    /* Empty state for Document DB */
                    <div className="p-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 text-center">
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                        <DocumentIcon />
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-2">No Documents Generated Yet</h4>
                      <p className="text-sm text-gray-600 mb-4 max-w-md mx-auto">
                        Document DB stores each file as a structured document with metadata.
                        Generate document records to see what will be stored:
                      </p>
                      <ul className="text-xs text-gray-500 mb-4 space-y-1 text-left inline-block">
                        <li className="flex items-center gap-2">
                          <span className="text-green-500">✓</span>
                          <strong>PDFs/DOCX:</strong> Extracted text content
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-green-500">✓</span>
                          <strong>Images:</strong> OCR text (if applicable)
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-green-500">✓</span>
                          <strong>Videos:</strong> Duration, codec, resolution metadata
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-green-500">✓</span>
                          <strong>All files:</strong> ID, filename, type, size, source, timestamps
                        </li>
                      </ul>
                      <div className="flex justify-center gap-3">
                        <button
                          onClick={handleGenerateDocuments}
                          disabled={generatingDocs}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400 text-sm font-medium flex items-center gap-2"
                        >
                          {generatingDocs ? (
                            <>
                              <LoadingSpinner size="sm" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <span>⚡</span>
                              Generate Documents
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => navigate('/app/connectors')}
                          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm"
                        >
                          Upload JSON
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Folder Tree */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3">Folder Structure</h3>
                <pre className="p-3 bg-gray-50 rounded text-sm font-mono overflow-auto max-h-[400px]">
                  {visualPreviews?.folderTree?.tree || '/ (empty)'}
                </pre>
              </div>

              {/* Sample Data */}
              {selectedArchitecture === 'relational' && visualPreviews?.sampleRows?.length > 0 && (
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-3">Sample Data</h3>
                  {visualPreviews.sampleRows.slice(0, 1).map((table, i) => (
                    <div key={i}>
                      <p className="text-sm font-semibold text-gray-700 mb-2">{table.tableName}</p>
                      <div className="overflow-auto">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="border-b border-gray-200">
                              {table.columns?.map((col, j) => (
                                <th key={j} className="text-left py-1 px-2 font-medium text-gray-600">
                                  {col}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {table.rows?.map((row, j) => (
                              <tr key={j} className="border-b border-gray-100">
                                {table.columns?.map((col, k) => (
                                  <td key={k} className="py-1 px-2 text-gray-900">
                                    {String(row[col] ?? '')}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Section 5: Deployment Choice */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Deployment Choice
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Self Deploy */}
            <button
              onClick={() => setSelectedDeployment('self')}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                selectedDeployment === 'self'
                  ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 rounded-lg ${
                  selectedDeployment === 'self' ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-600'
                }`}>
                  <ServerIcon />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Deploy Myself</h3>
                  <p className="text-sm text-gray-500">Guided setup on your infrastructure</p>
                </div>
              </div>
              <ul className="space-y-1 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <CheckIcon className="w-4 h-4 text-green-500" />
                  Full control over your data
                </li>
                <li className="flex items-center gap-2">
                  <CheckIcon className="w-4 h-4 text-green-500" />
                  Downloadable SQL/JSON schemas
                </li>
                <li className="flex items-center gap-2">
                  <CheckIcon className="w-4 h-4 text-green-500" />
                  Step-by-step instructions
                </li>
              </ul>
              <p className="mt-3 text-xs text-gray-500">
                Supports: Azure, AWS, GCP, Local
              </p>
            </button>

            {/* Skatalyst Deploy */}
            <button
              onClick={() => setSelectedDeployment('skatalyst')}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                selectedDeployment === 'skatalyst'
                  ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 rounded-lg ${
                  selectedDeployment === 'skatalyst' ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-600'
                }`}>
                  <CloudIcon />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Deploy with Skatalyst AI</h3>
                  <p className="text-sm text-gray-500">Fully managed, hosted environment</p>
                </div>
              </div>
              <ul className="space-y-1 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <CheckIcon className="w-4 h-4 text-green-500" />
                  Automatic provisioning
                </li>
                <li className="flex items-center gap-2">
                  <CheckIcon className="w-4 h-4 text-green-500" />
                  Managed backups & security
                </li>
                <li className="flex items-center gap-2">
                  <CheckIcon className="w-4 h-4 text-green-500" />
                  No infrastructure management
                </li>
              </ul>
              <p className="mt-3 text-xs text-gray-500">
                Pricing based on usage
              </p>
            </button>
          </div>
        </div>

        {/* Section 6: Confirm Button */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">Ready to proceed?</h3>
              <p className="text-sm text-gray-600">
                {selectedArchitecture && selectedDeployment
                  ? `You've selected: ${selectedOption?.shortName} with ${selectedDeployment === 'self' ? 'self-deployment' : 'Skatalyst hosting'}`
                  : 'Please select an architecture option and deployment choice above'}
              </p>
            </div>
            <button
              onClick={handleConfirm}
              disabled={!selectedArchitecture || !selectedDeployment || confirming}
              className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {confirming ? (
                <>
                  <LoadingSpinner size="sm" />
                  Confirming...
                </>
              ) : (
                <>
                  <CheckIcon />
                  Confirm Architecture
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
