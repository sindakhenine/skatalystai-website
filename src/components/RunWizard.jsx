import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * RunWizard - Multi-step wizard for creating orchestrated runs
 *
 * Steps:
 * 1. Select Sources - Choose data sources (connectors) to scan
 * 2. Select Context - Choose existing or describe context
 * 3. Configure Options - OCR, visual understanding settings
 * 4. Review & Start - Summary and start scan
 */

// Icons
const XIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const FolderIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
  </svg>
);

const DatabaseIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
  </svg>
);

const CloudIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
  </svg>
);

const DocumentIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const SearchIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const TagIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
  </svg>
);

// Context taxonomy - must match backend contextTaxonomy.js exactly
const SUGGESTED_CONTEXTS = [
  {
    id: 'products',
    label: 'Products',
    description: 'Product catalogs, specifications, datasheets, manuals, warranty info',
    keywords: 'oven, hob, microwave, cooker, fridge, freezer, dishwasher, appliance, model, sku, product, specs, specifications, dimensions, installation, manual, warranty, features, capacity, wattage, voltage, energy, rating, catalog, datasheet, technical, parts, components, accessories'
  },
  {
    id: 'marketing',
    label: 'Marketing',
    description: 'Campaigns, brochures, promotions, brand content, social media',
    keywords: 'campaign, brochure, promo, promotion, launch, brand, branding, ads, advertisement, slogan, social, influencer, influencers, creative, content, marketing, audience, targeting, engagement, awareness, positioning, messaging, tagline, logo, visual, banner, email, newsletter'
  },
  {
    id: 'compliance',
    label: 'Compliance',
    description: 'Regulations, certifications, audits, safety standards',
    keywords: 'ce, fcc, iso, regulation, regulations, standard, standards, audit, test, testing, certification, certified, safety, requirements, directive, rohs, weee, reach, ul, csa, approval, conformity, declaration, marking, label'
  },
  {
    id: 'finance',
    label: 'Finance',
    description: 'Invoices, budgets, payments, financial reports, accounting',
    keywords: 'invoice, invoices, receipt, cost, costs, price, pricing, budget, payment, payments, tax, taxes, accounting, revenue, expense, expenses, profit, margin, forecast, financial, billing, transaction, ledger, statement'
  },
  {
    id: 'support',
    label: 'Support',
    description: 'Tickets, FAQs, troubleshooting, customer help guides',
    keywords: 'ticket, tickets, issue, issues, bug, bugs, complaint, complaints, troubleshooting, faq, faqs, customer, support, help, helpdesk, resolution, escalation, feedback, query, question, answer, guide, howto, tutorial, walkthrough'
  },
  {
    id: 'legal',
    label: 'Legal',
    description: 'Contracts, agreements, policies, terms, compliance docs',
    keywords: 'contract, contracts, agreement, agreements, policy, policies, privacy, terms, conditions, gdpr, nda, legal, liability, indemnity, warranty, disclaimer, intellectual, property, trademark, copyright, patent, license, licensing'
  },
  {
    id: 'hr',
    label: 'HR',
    description: 'Employee records, payroll, recruitment, training, benefits',
    keywords: 'payroll, employee, employees, hiring, candidate, candidates, cv, resume, salary, salaries, benefits, hr, human, resources, recruitment, onboarding, training, performance, review, vacation, leave, attendance, workforce'
  },
  {
    id: 'engineering',
    label: 'Engineering',
    description: 'Design docs, architecture, code, APIs, technical specs',
    keywords: 'design, architecture, code, coding, repo, repository, api, apis, requirements, spec, specification, diagrams, diagram, schema, database, software, hardware, firmware, development, developer, debug, testing, deployment, cicd'
  },
  {
    id: 'operations',
    label: 'Operations',
    description: 'Logistics, supply chain, inventory, warehouse, manufacturing',
    keywords: 'logistics, supply, chain, plant, manufacturing, production, delivery, deliveries, shipping, warehouse, inventory, stock, procurement, vendor, suppliers, operations, ops, scheduling, capacity, workflow, process, sop'
  },
  {
    id: 'data',
    label: 'Data/Analytics',
    description: 'Datasets, reports, dashboards, metrics, KPIs, analysis',
    keywords: 'dataset, datasets, csv, analytics, dashboard, dashboards, kpi, kpis, metrics, metric, sql, databricks, report, reports, reporting, analysis, insight, insights, trend, trends, visualization, chart, charts, statistics, data'
  }
];

const PlayIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const LoadingSpinner = ({ size = 'md' }) => {
  const sizes = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-8 w-8' };
  return (
    <svg className={`animate-spin ${sizes[size]}`} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
};

// Step indicator
const StepIndicator = ({ steps, currentStep }) => (
  <div className="flex items-center justify-center px-4 py-3 bg-gray-50 border-b border-gray-200">
    {steps.map((step, index) => (
      <React.Fragment key={step.id}>
        <div className="flex items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
              index < currentStep
                ? 'bg-green-500 text-white'
                : index === currentStep
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-500'
            }`}
          >
            {index < currentStep ? <CheckIcon /> : index + 1}
          </div>
          <span className={`ml-2 text-sm font-medium hidden sm:block ${
            index === currentStep ? 'text-blue-600' : index < currentStep ? 'text-green-600' : 'text-gray-400'
          }`}>
            {step.label}
          </span>
        </div>
        {index < steps.length - 1 && (
          <div className={`w-12 h-1 mx-2 rounded-full ${
            index < currentStep ? 'bg-green-500' : 'bg-gray-200'
          }`} />
        )}
      </React.Fragment>
    ))}
  </div>
);

// Get connector icon based on type
const getConnectorIcon = (type) => {
  if (['postgresql', 'mysql', 'sqlserver', 'databricks'].includes(type)) {
    return <DatabaseIcon />;
  }
  if (['onedrive', 'sharepoint', 'google_drive', 'dropbox', 's3', 'azure_blob'].includes(type)) {
    return <CloudIcon />;
  }
  if (type === 'local_server_agent') {
    return <FolderIcon />;
  }
  return <DocumentIcon />;
};

// Get connector display name
const getConnectorName = (type) => {
  const names = {
    onedrive: 'OneDrive',
    sharepoint: 'SharePoint',
    google_drive: 'Google Drive',
    dropbox: 'Dropbox',
    s3: 'Amazon S3',
    aws_s3: 'Amazon S3',
    azure_blob: 'Azure Blob',
    postgresql: 'PostgreSQL',
    mysql: 'MySQL',
    sqlserver: 'SQL Server',
    databricks: 'Databricks',
    local_server_agent: 'Local Server',
  };
  return names[type] || type;
};

// Format bytes to human readable
const formatBytes = (bytes) => {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

export default function RunWizard({ projectId, onClose, onRunCreated }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { authFetch } = useAuth();

  // Wizard state
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Data
  const [connectors, setConnectors] = useState([]);
  const [uploads, setUploads] = useState([]);
  const [agents, setAgents] = useState([]);
  const [contexts, setContexts] = useState([]);

  // Selection state
  const [selectedConnectorIds, setSelectedConnectorIds] = useState([]);
  const [selectedUploadIds, setSelectedUploadIds] = useState([]);
  const [selectedAgentIds, setSelectedAgentIds] = useState([]);
  const [selectedContextId, setSelectedContextId] = useState(null);
  const [selectedSuggestedContext, setSelectedSuggestedContext] = useState(null);
  const [contextText, setContextText] = useState('');
  const [useCustomContext, setUseCustomContext] = useState(false);
  const [options, setOptions] = useState({
    ocrEnabled: true,
    visualUnderstandingEnabled: false,
    includeMetadata: true,
  });

  const steps = [
    { id: 'sources', label: t('runWizard.steps.sources', 'Sources') },
    { id: 'context', label: t('runWizard.steps.context', 'Context') },
    { id: 'options', label: t('runWizard.steps.options', 'Options') },
    { id: 'review', label: t('runWizard.steps.review', 'Review') },
  ];

  // Fetch connectors, uploads, agents, and contexts
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch all data sources in parallel
        const [connectorsRes, uploadsRes, agentsRes, contextsRes] = await Promise.all([
          authFetch('/connectors'),
          authFetch('/uploads?status=completed'),
          authFetch('/agents'),
          authFetch(`/contexts?projectId=${projectId}`)
        ]);

        // Process connectors
        if (connectorsRes.ok) {
          const data = await connectorsRes.json();
          const allConnectors = data.connectors || data || [];
          // Include connectors that are active, connected, or have completed scope setup
          const usableConnectors = allConnectors.filter(c =>
            c.status === 'active' ||
            c.status === 'connected' ||
            c.scope_confirmed === true
          );
          console.log('[RunWizard] Found connectors:', allConnectors.length, 'usable:', usableConnectors.length);
          setConnectors(usableConnectors);
        }

        // Process uploads (completed ones with files)
        if (uploadsRes.ok) {
          const data = await uploadsRes.json();
          const allUploads = data.uploads || data || [];
          // Only show uploads with at least one file (endpoint returns fileCount in camelCase)
          const usableUploads = allUploads.filter(u =>
            u.status === 'completed' && (u.fileCount > 0 || u.file_count > 0)
          );
          console.log('[RunWizard] Found uploads:', allUploads.length, 'usable:', usableUploads.length);
          setUploads(usableUploads);
        }

        // Process agents (active and paired)
        if (agentsRes.ok) {
          const data = await agentsRes.json();
          const allAgents = data.agents || data || [];
          // Only show active agents
          const usableAgents = allAgents.filter(a =>
            a.status === 'active'
          );
          console.log('[RunWizard] Found agents:', allAgents.length, 'usable:', usableAgents.length);
          setAgents(usableAgents);
        }

        // Process contexts
        if (contextsRes.ok) {
          const data = await contextsRes.json();
          setContexts(data.contexts || data || []);
        }
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError('Failed to load data sources');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [authFetch, projectId]);

  // Toggle connector selection
  const toggleConnector = (connectorId) => {
    setSelectedConnectorIds(prev =>
      prev.includes(connectorId)
        ? prev.filter(id => id !== connectorId)
        : [...prev, connectorId]
    );
    setError(null);
  };

  // Toggle upload selection
  const toggleUpload = (uploadId) => {
    setSelectedUploadIds(prev =>
      prev.includes(uploadId)
        ? prev.filter(id => id !== uploadId)
        : [...prev, uploadId]
    );
    setError(null);
  };

  // Toggle agent selection
  const toggleAgent = (agentId) => {
    setSelectedAgentIds(prev =>
      prev.includes(agentId)
        ? prev.filter(id => id !== agentId)
        : [...prev, agentId]
    );
    setError(null);
  };

  // Select all sources
  const selectAllSources = () => {
    setSelectedConnectorIds(connectors.map(c => c.id));
    setSelectedUploadIds(uploads.map(u => u.id));
    setSelectedAgentIds(agents.map(a => a.id));
    setError(null);
  };

  // Clear all sources
  const clearAllSources = () => {
    setSelectedConnectorIds([]);
    setSelectedUploadIds([]);
    setSelectedAgentIds([]);
  };

  // Count total selected sources
  const totalSelectedSources = selectedConnectorIds.length + selectedUploadIds.length + selectedAgentIds.length;
  const totalAvailableSources = connectors.length + uploads.length + agents.length;

  // Handle existing context selection
  const handleContextSelect = (contextId) => {
    setSelectedContextId(contextId);
    setSelectedSuggestedContext(null);
    setUseCustomContext(false);
    setContextText('');
    setError(null);
  };

  // Handle suggested context selection
  const handleSuggestedContextSelect = (suggestedContext) => {
    setSelectedSuggestedContext(suggestedContext);
    setSelectedContextId(null);
    setUseCustomContext(false);
    setContextText('');
    setError(null);
  };

  // Handle custom context
  const handleCustomContext = () => {
    setSelectedContextId(null);
    setSelectedSuggestedContext(null);
    setUseCustomContext(true);
  };

  // Navigation
  const canProceed = () => {
    switch (currentStep) {
      case 0: // Sources
        // At least one source must be selected (connector, upload, or agent)
        return totalSelectedSources > 0;
      case 1: // Context
        // Allow proceeding with suggested context, existing context, custom context, or even skipping
        return true;
      case 2: // Options
        return true;
      case 3: // Review
        return true;
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (canProceed() && currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      setError(null);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setError(null);
    }
  };

  // Create run and start scan
  const startScan = async () => {
    setLoading(true);
    setError(null);
    try {
      // Determine context text based on selection type
      let effectiveContextText = undefined;
      if (useCustomContext && contextText) {
        effectiveContextText = contextText;
      } else if (selectedSuggestedContext) {
        // Use the suggested context's description and keywords as context
        effectiveContextText = `${selectedSuggestedContext.label}: ${selectedSuggestedContext.description}. Keywords: ${selectedSuggestedContext.keywords}`;
      }

      // Create the run with all selected sources
      const createRes = await authFetch('/orchestrated-runs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          connectorIds: selectedConnectorIds,
          uploadIds: selectedUploadIds,
          agentIds: selectedAgentIds,
          contextId: selectedContextId,
          options: {
            ...options,
            contextText: effectiveContextText,
            suggestedContextCategory: selectedSuggestedContext?.id,
          },
        }),
      });

      if (!createRes.ok) {
        const data = await createRes.json();
        throw new Error(data.error || 'Failed to create run');
      }

      const run = await createRes.json();

      // Start the scan
      const scanRes = await authFetch(`/orchestrated-runs/${run.id}/scan`, {
        method: 'POST',
      });

      if (!scanRes.ok) {
        const data = await scanRes.json();
        throw new Error(data.error || 'Failed to start scan');
      }

      // Notify parent
      if (onRunCreated) {
        onRunCreated(run);
      }

      // Close the wizard and redirect to the run's inventory page
      onClose();
      navigate(`/app/runs/${run.id}/inventory`, {
        state: {
          showSuccessBanner: true,
          message: t('runWizard.scanStartedSuccess', 'Scan started successfully! Scanning your data sources...')
        }
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Select Sources
        return (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {t('runWizard.selectSources', 'Select Data Sources')}
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={selectAllSources}
                  className="text-sm text-blue-600 hover:text-blue-700"
                  disabled={totalAvailableSources === 0}
                >
                  {t('runWizard.selectAll', 'Select All')}
                </button>
                <span className="text-gray-300">|</span>
                <button
                  onClick={clearAllSources}
                  className="text-sm text-gray-600 hover:text-gray-700"
                  disabled={totalSelectedSources === 0}
                >
                  {t('runWizard.clearAll', 'Clear')}
                </button>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              {t('runWizard.selectSourcesDesc', 'Choose the data sources to include in this scan. The scan is READ-ONLY and will not modify your data.')}
            </p>

            {/* No sources warning */}
            {totalAvailableSources === 0 ? (
              <div className="text-center py-8 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="text-amber-500 flex justify-center mb-2">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <p className="font-medium text-amber-800 mb-1">
                  {t('runWizard.noSources', 'No Data Sources Available')}
                </p>
                <p className="text-sm text-amber-700">
                  {t('runWizard.noSourcesHint', 'Connect a data source, upload files, or pair a local agent first.')}
                </p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[400px] overflow-y-auto">
                {/* Connectors Section */}
                {connectors.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <CloudIcon />
                      {t('runWizard.connectors', 'Connected Sources')} ({connectors.length})
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {connectors.map((connector) => (
                        <div
                          key={connector.id}
                          onClick={() => toggleConnector(connector.id)}
                          className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                            selectedConnectorIds.includes(connector.id)
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${
                              selectedConnectorIds.includes(connector.id)
                                ? 'bg-blue-100 text-blue-600'
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {getConnectorIcon(connector.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-gray-900 truncate text-sm">
                                {connector.display_name || connector.name || getConnectorName(connector.type)}
                              </h4>
                              <p className="text-xs text-gray-500">
                                {getConnectorName(connector.type)}
                              </p>
                            </div>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              selectedConnectorIds.includes(connector.id)
                                ? 'border-blue-500 bg-blue-500 text-white'
                                : 'border-gray-300'
                            }`}>
                              {selectedConnectorIds.includes(connector.id) && <CheckIcon />}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Uploads Section */}
                {uploads.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <DocumentIcon />
                      {t('runWizard.uploads', 'Uploaded Files')} ({uploads.length})
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {uploads.map((upload) => (
                        <div
                          key={upload.id}
                          onClick={() => toggleUpload(upload.id)}
                          className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                            selectedUploadIds.includes(upload.id)
                              ? 'border-green-500 bg-green-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${
                              selectedUploadIds.includes(upload.id)
                                ? 'bg-green-100 text-green-600'
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              <DocumentIcon />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-gray-900 truncate text-sm">
                                {/* Show first file names or context as title */}
                                {upload.context
                                  ? upload.context.slice(0, 40) + (upload.context.length > 40 ? '...' : '')
                                  : upload.files?.length > 0
                                    ? upload.files.slice(0, 2).map(f => f.name || f.originalName).join(', ') + (upload.files.length > 2 ? '...' : '')
                                    : `Upload #${upload.id.slice(0, 8)}`}
                              </h4>
                              <p className="text-xs text-gray-500">
                                {upload.fileCount || upload.file_count} {t('runWizard.files', 'files')} • {formatBytes(upload.totalBytes || upload.total_bytes)}
                                {upload.createdAt && ` • ${new Date(upload.createdAt).toLocaleDateString()}`}
                              </p>
                            </div>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              selectedUploadIds.includes(upload.id)
                                ? 'border-green-500 bg-green-500 text-white'
                                : 'border-gray-300'
                            }`}>
                              {selectedUploadIds.includes(upload.id) && <CheckIcon />}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Agents Section */}
                {agents.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <FolderIcon />
                      {t('runWizard.agents', 'Local Agents')} ({agents.length})
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {agents.map((agent) => (
                        <div
                          key={agent.id}
                          onClick={() => toggleAgent(agent.id)}
                          className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                            selectedAgentIds.includes(agent.id)
                              ? 'border-purple-500 bg-purple-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${
                              selectedAgentIds.includes(agent.id)
                                ? 'bg-purple-100 text-purple-600'
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              <FolderIcon />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-gray-900 truncate text-sm">
                                {agent.name || agent.hostname || 'Local Agent'}
                              </h4>
                              <p className="text-xs text-gray-500">
                                {agent.platform || 'Unknown'} • {agent.status}
                              </p>
                            </div>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              selectedAgentIds.includes(agent.id)
                                ? 'border-purple-500 bg-purple-500 text-white'
                                : 'border-gray-300'
                            }`}>
                              {selectedAgentIds.includes(agent.id) && <CheckIcon />}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Selection summary */}
            {totalSelectedSources > 0 ? (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700">
                  {t('runWizard.selectedCount', '{{count}} source(s) selected', { count: totalSelectedSources })}
                  {selectedConnectorIds.length > 0 && ` • ${selectedConnectorIds.length} connector(s)`}
                  {selectedUploadIds.length > 0 && ` • ${selectedUploadIds.length} upload(s)`}
                  {selectedAgentIds.length > 0 && ` • ${selectedAgentIds.length} agent(s)`}
                </p>
              </div>
            ) : totalAvailableSources > 0 && (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-700">
                  {t('runWizard.selectAtLeastOne', 'Select at least one data source to continue.')}
                </p>
              </div>
            )}
          </div>
        );

      case 1: // Select Context
        return (
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {t('runWizard.selectContext', 'Select Context')}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              {t('runWizard.selectContextDesc', 'Choose a context category to help the system understand your data better.')}
            </p>

            {/* Suggested context categories */}
            <div className="space-y-2 mb-4">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <TagIcon />
                {t('runWizard.suggestedContexts', 'Suggested Categories')}
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                {SUGGESTED_CONTEXTS.map((ctx) => (
                  <div
                    key={ctx.id}
                    onClick={() => handleSuggestedContextSelect(ctx)}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all text-center ${
                      selectedSuggestedContext?.id === ctx.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                    title={ctx.description}
                  >
                    <h4 className={`font-medium text-sm ${
                      selectedSuggestedContext?.id === ctx.id ? 'text-blue-700' : 'text-gray-900'
                    }`}>
                      {ctx.label}
                    </h4>
                  </div>
                ))}
              </div>
              {selectedSuggestedContext && (
                <p className="text-xs text-blue-600 mt-1 pl-1">
                  {selectedSuggestedContext.description}
                </p>
              )}
            </div>

            {/* Existing contexts */}
            {contexts.length > 0 && (
              <div className="space-y-2 mb-4">
                <label className="text-sm font-medium text-gray-700">
                  {t('runWizard.existingContexts', 'Your Saved Contexts')}
                </label>
                <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto">
                  {contexts.map((context) => (
                    <div
                      key={context.id}
                      onClick={() => handleContextSelect(context.id)}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedContextId === context.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">{context.name}</h4>
                          {context.description && (
                            <p className="text-sm text-gray-500 truncate">{context.description}</p>
                          )}
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          selectedContextId === context.id
                            ? 'border-blue-500 bg-blue-500 text-white'
                            : 'border-gray-300'
                        }`}>
                          {selectedContextId === context.id && <CheckIcon />}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Custom context option */}
            <div className="mt-4">
              <div
                onClick={handleCustomContext}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  useCustomContext
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    useCustomContext ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                  }`}>
                    <DocumentIcon />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">
                      {t('runWizard.customContext', 'Describe Custom Context')}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {t('runWizard.customContextDesc', 'Provide your own context description for this scan')}
                    </p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    useCustomContext
                      ? 'border-blue-500 bg-blue-500 text-white'
                      : 'border-gray-300'
                  }`}>
                    {useCustomContext && <CheckIcon />}
                  </div>
                </div>
              </div>

              {useCustomContext && (
                <div className="mt-3">
                  <textarea
                    value={contextText}
                    onChange={(e) => setContextText(e.target.value)}
                    placeholder={t('runWizard.contextPlaceholder', 'Describe the business context, purpose of this data, target audience, or any other relevant information...')}
                    className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {contextText.length} {t('runWizard.characters', 'characters')}
                  </p>
                </div>
              )}
            </div>

            {/* Skip context option */}
            {!selectedContextId && !selectedSuggestedContext && !useCustomContext && (
              <p className="text-sm text-gray-500 mt-4 text-center">
                {t('runWizard.skipContext', 'You can also proceed without context - the scan will still work.')}
              </p>
            )}
          </div>
        );

      case 2: // Options
        // Calculate estimated costs based on selected options
        const baseProcessingCost = 0; // Base scan is free
        const ocrCostPerFile = 0.001; // $0.001 per file with OCR
        const visualCostPerFile = 0.01; // $0.01 per image with Visual AI
        const estimatedFileCount = selectedConnectorIds.length * 50; // Rough estimate
        const estimatedImageCount = Math.round(estimatedFileCount * 0.2); // ~20% images

        const ocrCost = options.ocrEnabled ? (estimatedFileCount * ocrCostPerFile) : 0;
        const visualCost = options.visualUnderstandingEnabled ? (estimatedImageCount * visualCostPerFile) : 0;
        const totalEstimatedCost = baseProcessingCost + ocrCost + visualCost;

        return (
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {t('runWizard.configureOptions', 'Configure Options')}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              {t('runWizard.configureOptionsDesc', 'Set scan options to control how your data is processed.')}
            </p>

            <div className="space-y-4">
              {/* OCR */}
              <label className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                options.ocrEnabled
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}>
                <input
                  type="checkbox"
                  checked={options.ocrEnabled}
                  onChange={(e) => setOptions({ ...options, ocrEnabled: e.target.checked })}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-gray-900">
                      {t('runWizard.ocrEnabled', 'OCR (Text Recognition)')}
                    </h4>
                    <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                      Included
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    {t('runWizard.ocrDesc', 'Extract text from images and scanned documents')}
                  </p>
                </div>
              </label>

              {/* Visual Understanding */}
              <label className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                options.visualUnderstandingEnabled
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}>
                <input
                  type="checkbox"
                  checked={options.visualUnderstandingEnabled}
                  onChange={(e) => setOptions({ ...options, visualUnderstandingEnabled: e.target.checked })}
                  className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-gray-900">
                      {t('runWizard.visualUnderstanding', 'Visual Understanding')}
                    </h4>
                    <span className="px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-700 rounded-full">
                      BYOK Required
                    </span>
                    <span className="px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-700 rounded-full">
                      ~$0.01/image
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    {t('runWizard.visualUnderstandingDesc', 'AI-powered analysis of images, diagrams, and charts')}
                  </p>
                </div>
              </label>

              {/* Include Metadata */}
              <label className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                options.includeMetadata
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}>
                <input
                  type="checkbox"
                  checked={options.includeMetadata}
                  onChange={(e) => setOptions({ ...options, includeMetadata: e.target.checked })}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-gray-900">
                      {t('runWizard.includeMetadata', 'Include Metadata')}
                    </h4>
                    <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                      Included
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    {t('runWizard.includeMetadataDesc', 'Capture file metadata, timestamps, and properties')}
                  </p>
                </div>
              </label>
            </div>

            {/* Cost Preview */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                {t('runWizard.costPreview', 'Estimated Cost Preview')}
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Base Processing</span>
                  <span className="font-medium text-green-600">Free</span>
                </div>
                {options.ocrEnabled && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">OCR Processing</span>
                    <span className="font-medium text-green-600">Included</span>
                  </div>
                )}
                {options.visualUnderstandingEnabled && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Visual AI (~{estimatedImageCount} images)</span>
                    <span className="font-medium text-amber-600">~${visualCost.toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t border-gray-300 pt-2 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-900">Estimated Total</span>
                    <span className={`font-bold ${totalEstimatedCost > 0 ? 'text-amber-600' : 'text-green-600'}`}>
                      {totalEstimatedCost > 0 ? `~$${totalEstimatedCost.toFixed(2)}` : 'Free'}
                    </span>
                  </div>
                </div>
                {options.visualUnderstandingEnabled && (
                  <p className="text-xs text-gray-500 mt-2">
                    * Visual AI uses your BYOK API key. Actual cost depends on your provider's pricing.
                  </p>
                )}
              </div>
            </div>
          </div>
        );

      case 3: // Review
        const selectedConnectors = connectors.filter(c => selectedConnectorIds.includes(c.id));
        const selectedUploadsData = uploads.filter(u => selectedUploadIds.includes(u.id));
        const selectedAgentsData = agents.filter(a => selectedAgentIds.includes(a.id));
        const selectedContext = contexts.find(c => c.id === selectedContextId);

        return (
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {t('runWizard.reviewScan', 'Review & Start Scan')}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              {t('runWizard.reviewDesc', 'Review your settings before starting the scan. This is a READ-ONLY operation.')}
            </p>

            <div className="space-y-4">
              {/* Sources summary */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">
                  {t('runWizard.sources', 'Data Sources')} ({totalSelectedSources})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {/* Connectors */}
                  {selectedConnectors.map((connector) => (
                    <span
                      key={connector.id}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                    >
                      {getConnectorIcon(connector.type)}
                      {connector.display_name || connector.name || getConnectorName(connector.type)}
                    </span>
                  ))}
                  {/* Uploads */}
                  {selectedUploadsData.map((upload) => (
                    <span
                      key={upload.id}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm"
                      title={upload.files?.map(f => f.name || f.originalName).join(', ')}
                    >
                      <DocumentIcon />
                      {upload.context
                        ? upload.context.slice(0, 20) + (upload.context.length > 20 ? '...' : '')
                        : upload.files?.length > 0
                          ? upload.files[0].name || upload.files[0].originalName
                          : 'Upload'} ({upload.fileCount || upload.file_count} files)
                    </span>
                  ))}
                  {/* Agents */}
                  {selectedAgentsData.map((agent) => (
                    <span
                      key={agent.id}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                    >
                      <FolderIcon />
                      {agent.name || agent.hostname || 'Local Agent'}
                    </span>
                  ))}
                </div>
              </div>

              {/* Context summary */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">
                  {t('runWizard.context', 'Context')}
                </h4>
                {selectedSuggestedContext ? (
                  <div>
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm mb-1">
                      <TagIcon />
                      {selectedSuggestedContext.label}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">{selectedSuggestedContext.description}</p>
                  </div>
                ) : selectedContext ? (
                  <p className="text-sm text-gray-600">{selectedContext.name}</p>
                ) : useCustomContext && contextText ? (
                  <p className="text-sm text-gray-600 line-clamp-3">{contextText}</p>
                ) : (
                  <p className="text-sm text-gray-400 italic">
                    {t('runWizard.noContext', 'No context selected')}
                  </p>
                )}
              </div>

              {/* Options summary */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">
                  {t('runWizard.options', 'Options')}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {options.ocrEnabled && (
                    <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                      OCR
                    </span>
                  )}
                  {options.visualUnderstandingEnabled && (
                    <span className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                      Visual AI
                    </span>
                  )}
                  {options.includeMetadata && (
                    <span className="inline-flex items-center px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm">
                      Metadata
                    </span>
                  )}
                </div>
              </div>

              {/* Read-only notice */}
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <SearchIcon />
                  <div>
                    <h4 className="font-medium text-green-800">
                      {t('runWizard.readOnlyTitle', 'Read-Only Scan')}
                    </h4>
                    <p className="text-sm text-green-700 mt-1">
                      {t('runWizard.readOnlyDesc', 'This scan will only READ your data sources to create an inventory. No changes will be made to your data.')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {t('runWizard.title', 'New Scan')}
            </h2>
            <p className="text-sm text-gray-500">
              {t('runWizard.subtitle', 'Create a unified inventory from your data sources')}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XIcon />
          </button>
        </div>

        {/* Step indicator */}
        <StepIndicator steps={steps} currentStep={currentStep} />

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading && currentStep === 0 ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            renderStepContent()
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="px-6 py-3 bg-red-50 border-t border-red-100">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              currentStep === 0
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-700 hover:bg-gray-200'
            }`}
          >
            {t('runWizard.back', 'Back')}
          </button>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
            >
              {t('runWizard.cancel', 'Cancel')}
            </button>

            {currentStep < steps.length - 1 ? (
              <button
                onClick={nextStep}
                disabled={!canProceed()}
                className={`px-6 py-2 text-sm font-medium rounded-lg transition-colors ${
                  canProceed()
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                {t('runWizard.next', 'Next')}
              </button>
            ) : (
              <button
                onClick={startScan}
                disabled={loading || !canProceed()}
                className={`inline-flex items-center gap-2 px-6 py-2 text-sm font-medium rounded-lg transition-colors ${
                  loading || !canProceed()
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {loading ? (
                  <>
                    <LoadingSpinner size="sm" />
                    {t('runWizard.starting', 'Starting...')}
                  </>
                ) : (
                  <>
                    <PlayIcon />
                    {t('runWizard.startScan', 'Start Scan')}
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
