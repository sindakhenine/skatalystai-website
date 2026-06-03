import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';

/**
 * Build App Page (/app/runs/:id/build)
 *
 * Entry point for app building (Phase C).
 * Only accessible when run.status === 'ready' (READY_TO_IMPLEMENT).
 *
 * Step C1: Route guard + entry point + create app_build record
 * Steps C2-C4: To be implemented
 */

// Icons
const ArrowLeftIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

const LockIcon = () => (
  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

const RocketIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
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

// Status badge helper
const getStatusColor = (status) => {
  const colors = {
    pending: 'bg-gray-100 text-gray-700',
    scanning: 'bg-blue-100 text-blue-700',
    scanned: 'bg-green-100 text-green-700',
    approved: 'bg-green-100 text-green-700',
    planning: 'bg-yellow-100 text-yellow-700',
    planned: 'bg-purple-100 text-purple-700',
    ready: 'bg-indigo-100 text-indigo-700',
    executing: 'bg-orange-100 text-orange-700',
    completed: 'bg-green-100 text-green-700',
    failed: 'bg-red-100 text-red-700',
  };
  return colors[status] || 'bg-gray-100 text-gray-700';
};

export default function BuildApp() {
  const { t } = useTranslation();
  const { id: runId } = useParams();
  const navigate = useNavigate();
  const { authFetch } = useAuth();

  const [run, setRun] = useState(null);
  const [build, setBuild] = useState(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState(null);
  const [canStart, setCanStart] = useState(false);
  const [canStartReason, setCanStartReason] = useState(null);

  // Step C2: App type selection
  const [selectedAppTypes, setSelectedAppTypes] = useState([]);
  const [saving, setSaving] = useState(false);

  // Step C3: Blueprint generation and chat
  const [generating, setGenerating] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [sendingChat, setSendingChat] = useState(false);
  const [activeTab, setActiveTab] = useState('technical');

  // Step C4: Confirmation
  const [advancingToConfirm, setAdvancingToConfirm] = useState(false);
  const [confirmPhrase, setConfirmPhrase] = useState('');
  const [confirming, setConfirming] = useState(false);

  // Phase D1: Preview
  const [preview, setPreview] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [generatingPreview, setGeneratingPreview] = useState(false);

  // Phase F: Build configuration state
  const [buildConfig, setBuildConfig] = useState({
    dashboard: true,
    crud: true,
    chatbot: true
  });
  const [buildingPhaseF, setBuildingPhaseF] = useState(false);
  const [buildProgress, setBuildProgress] = useState(null);

  // Fetch run and build status
  const fetchData = useCallback(async () => {
    try {
      setError(null);

      // Fetch run details
      const runRes = await authFetch(`/orchestrated-runs/${runId}`);
      if (!runRes.ok) {
        const data = await runRes.json();
        throw new Error(data.error || 'Failed to fetch run');
      }
      const runData = await runRes.json();
      setRun(runData);

      // Fetch build status
      const buildRes = await authFetch(`/orchestrated-runs/${runId}/build`);
      if (!buildRes.ok) {
        const data = await buildRes.json();
        throw new Error(data.error || 'Failed to fetch build status');
      }
      const buildData = await buildRes.json();

      if (buildData.exists) {
        setBuild(buildData.build);
      } else {
        setBuild(null);
        setCanStart(buildData.canStart);
        setCanStartReason(buildData.reason);
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

  // Start a new build
  const handleStartBuild = async () => {
    setStarting(true);
    setError(null);

    try {
      const res = await authFetch(`/orchestrated-runs/${runId}/build`, {
        method: 'POST',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to start build');
      }

      const data = await res.json();
      setBuild(data.build);
    } catch (err) {
      setError(err.message);
    } finally {
      setStarting(false);
    }
  };

  // Toggle app type selection
  const toggleAppType = (appType) => {
    setSelectedAppTypes(prev => {
      if (prev.includes(appType)) {
        return prev.filter(t => t !== appType);
      }
      return [...prev, appType];
    });
  };

  // Save app type selection and proceed to next step
  const handleSaveAppTypes = async () => {
    if (selectedAppTypes.length === 0) {
      setError('Please select at least one app type');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const res = await authFetch(`/orchestrated-runs/${runId}/build/app-types`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appTypes: selectedAppTypes }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save app types');
      }

      const data = await res.json();
      setBuild(data.build);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Generate blueprint
  const handleGenerateBlueprint = async (regenerate = false) => {
    setGenerating(true);
    setError(null);

    try {
      const res = await authFetch(`/orchestrated-runs/${runId}/build/generate-blueprint`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ regenerate }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to generate blueprint');
      }

      const data = await res.json();
      setBuild(data.build);
    } catch (err) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  // Send chat message
  const handleSendChat = async () => {
    if (!chatMessage.trim()) return;

    setSendingChat(true);
    setError(null);

    try {
      const res = await authFetch(`/orchestrated-runs/${runId}/build/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: chatMessage.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to send message');
      }

      const data = await res.json();
      setBuild(data.build);
      setChatMessage('');
    } catch (err) {
      setError(err.message);
    } finally {
      setSendingChat(false);
    }
  };

  // Advance to confirming status
  const handleAdvanceToConfirm = async () => {
    setAdvancingToConfirm(true);
    setError(null);

    try {
      const res = await authFetch(`/orchestrated-runs/${runId}/build/advance-to-confirming`, {
        method: 'POST',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to advance to confirm');
      }

      const data = await res.json();
      setBuild(data.build);
    } catch (err) {
      setError(err.message);
    } finally {
      setAdvancingToConfirm(false);
    }
  };

  // Confirm build
  const handleConfirmBuild = async () => {
    if (confirmPhrase !== 'CONFIRM BUILD') return;

    setConfirming(true);
    setError(null);

    try {
      const res = await authFetch(`/orchestrated-runs/${runId}/build/confirm`, {
        method: 'POST',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to confirm build');
      }

      const data = await res.json();
      setBuild(data.build);
      setConfirmPhrase('');
    } catch (err) {
      setError(err.message);
    } finally {
      setConfirming(false);
    }
  };

  // Fetch preview status
  const fetchPreview = useCallback(async () => {
    if (!build || build.status !== 'build_approved') return;

    setPreviewLoading(true);
    try {
      const res = await authFetch(`/orchestrated-runs/${runId}/build/preview`);
      if (res.ok) {
        const data = await res.json();
        if (data.exists) {
          setPreview(data.preview);
        }
      }
    } catch (err) {
      console.error('Failed to fetch preview:', err);
    } finally {
      setPreviewLoading(false);
    }
  }, [authFetch, runId, build]);

  // Fetch preview when build is approved
  useEffect(() => {
    if (build?.status === 'build_approved') {
      fetchPreview();
    }
  }, [build?.status, fetchPreview]);

  // Poll for preview status while generating
  useEffect(() => {
    if (preview?.status === 'generating') {
      const interval = setInterval(fetchPreview, 2000);
      return () => clearInterval(interval);
    }
  }, [preview?.status, fetchPreview]);

  // Generate preview
  const handleGeneratePreview = async () => {
    setGeneratingPreview(true);
    setError(null);

    try {
      const res = await authFetch(`/orchestrated-runs/${runId}/build/preview`, {
        method: 'POST',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to generate preview');
      }

      const data = await res.json();
      setPreview(data.preview);
    } catch (err) {
      setError(err.message);
    } finally {
      setGeneratingPreview(false);
    }
  };

  // Copy preview URL to clipboard
  const handleCopyPreviewUrl = () => {
    if (preview?.previewUrl) {
      const fullUrl = `${window.location.origin}${preview.previewUrl}`;
      navigator.clipboard.writeText(fullUrl);
    }
  };

  // App type definitions
  const APP_TYPE_OPTIONS = [
    {
      id: 'dashboard',
      name: t('build.dashboard', 'Dashboard'),
      description: t('build.dashboardDesc', 'Read-only data visualizations with charts, tables, and metrics'),
      dataNeeds: t('build.dashboardData', 'Tables, aggregations, time-series data'),
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      id: 'crud_app',
      name: t('build.crudApp', 'CRUD App'),
      description: t('build.crudAppDesc', 'Create, read, update, and delete operations on your data'),
      dataNeeds: t('build.crudAppData', 'Tables with primary keys, relationships'),
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
        </svg>
      ),
    },
    {
      id: 'chatbot',
      name: t('build.chatbot', 'Chatbot'),
      description: t('build.chatbotDesc', 'AI-powered Q&A interface over your structured data'),
      dataNeeds: t('build.chatbotData', 'All indexed content, embeddings'),
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
    },
  ];

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="xl" />
          <p className="mt-4 text-gray-600">{t('build.loading', 'Loading build status...')}</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !run) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-red-800 mb-2">
              {t('build.error', 'Error')}
            </h2>
            <p className="text-red-700">{error}</p>
            <Link
              to="/app/runs"
              className="mt-4 inline-flex items-center gap-2 text-red-700 hover:text-red-800"
            >
              <ArrowLeftIcon />
              {t('build.backToRuns', 'Back to Runs')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Guard: Run is not in 'ready' or 'kpis_confirmed' status
  if (run && run.status !== 'ready' && run.status !== 'kpis_confirmed') {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <Link
              to={`/app/runs/${runId}/plan`}
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeftIcon />
              {t('build.backToPlan', 'Back to Plan')}
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">
              {t('build.title', 'Build App')}
            </h1>
          </div>

          {/* Guard Message */}
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <LockIcon />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {t('build.notReady', 'This run is not ready for building')}
            </h2>
            <p className="text-gray-600 mb-4">
              {t('build.notReadyDescription', 'The run must be in "ready" status to start building an app.')}
            </p>

            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg mb-6">
              <span className="text-gray-600">{t('build.currentStatus', 'Current status')}:</span>
              <span className={`px-2 py-1 rounded-full text-sm font-medium ${getStatusColor(run.status)}`}>
                {run.status}
              </span>
            </div>

            <div className="text-left bg-gray-50 rounded-lg p-4 max-w-md mx-auto">
              <p className="text-sm font-medium text-gray-700 mb-2">
                {t('build.toStartBuilding', 'To proceed with app building:')}
              </p>
              <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                <li>{t('build.step1', 'Complete the inventory scan')}</li>
                <li>{t('build.step2', 'Approve the inventory')}</li>
                <li>{t('build.step3', 'Generate and confirm the structuring plan')}</li>
              </ol>
            </div>

            <div className="mt-6 flex justify-center gap-4">
              <Link
                to={`/app/runs/${runId}/inventory`}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                {t('build.viewInventory', 'View Inventory')}
              </Link>
              <Link
                to={`/app/runs/${runId}/plan`}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                {t('build.viewPlan', 'View Plan')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Handle Phase F Docker export build
  const handleStartPhaseFBuild = async () => {
    setBuildingPhaseF(true);
    setError(null);

    try {
      const res = await authFetch(`/orchestrated-runs/${runId}/build/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buildConfig,
          deploymentType: 'docker_export'
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to start build');
      }

      const result = await res.json();
      setBuildProgress(result);

      // Navigate to test environment page
      if (result.success) {
        navigate(`/app/runs/${runId}/test-environment`, {
          state: { buildId: result.buildId, showSuccessBanner: true }
        });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setBuildingPhaseF(false);
    }
  };

  // Run is ready but no build exists yet
  if (!build) {
    // Phase F flow: kpis_confirmed status
    if (run?.status === 'kpis_confirmed') {
      return (
        <div className="min-h-screen bg-gray-50">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
            <div className="max-w-4xl mx-auto px-6 py-8">
              <Link
                to={`/app/runs/${runId}/analytics-preview`}
                className="inline-flex items-center gap-2 text-green-100 hover:text-white mb-4"
              >
                <ArrowLeftIcon />
                Back to Analytics Preview
              </Link>
              <h1 className="text-2xl font-bold">Build Your App</h1>
              <p className="text-green-100 mt-1">Generate and download your application package</p>
            </div>
          </div>

          <div className="max-w-4xl mx-auto px-6 py-8">
            {/* Build Configuration */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">What to Build</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Dashboard Option */}
                <label className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  buildConfig.dashboard
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <input
                    type="checkbox"
                    checked={buildConfig.dashboard}
                    onChange={(e) => setBuildConfig(prev => ({ ...prev, dashboard: e.target.checked }))}
                    className="sr-only"
                  />
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      buildConfig.dashboard ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-500'
                    }`}>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Dashboard</h3>
                      <p className="text-sm text-gray-500">KPI cards & charts</p>
                    </div>
                  </div>
                  {buildConfig.dashboard && (
                    <div className="absolute top-2 right-2 w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </label>

                {/* CRUD Option */}
                <label className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  buildConfig.crud
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <input
                    type="checkbox"
                    checked={buildConfig.crud}
                    onChange={(e) => setBuildConfig(prev => ({ ...prev, crud: e.target.checked }))}
                    className="sr-only"
                  />
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      buildConfig.crud ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-500'
                    }`}>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">CRUD Views</h3>
                      <p className="text-sm text-gray-500">Data management</p>
                    </div>
                  </div>
                  {buildConfig.crud && (
                    <div className="absolute top-2 right-2 w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </label>

                {/* Chatbot Option */}
                <label className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  buildConfig.chatbot
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <input
                    type="checkbox"
                    checked={buildConfig.chatbot}
                    onChange={(e) => setBuildConfig(prev => ({ ...prev, chatbot: e.target.checked }))}
                    className="sr-only"
                  />
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      buildConfig.chatbot ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-500'
                    }`}>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Chatbot</h3>
                      <p className="text-sm text-gray-500">NL queries (BYOK)</p>
                    </div>
                  </div>
                  {buildConfig.chatbot && (
                    <div className="absolute top-2 right-2 w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Deployment Type */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Deployment Type</h2>
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">Docker Export</h3>
                    <p className="text-sm text-gray-600">Download a docker-compose package to run locally</p>
                  </div>
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                    Phase F1
                  </span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-3">
                Cloud-hosted deployment will be available in a future update.
              </p>
            </div>

            {/* Summary */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Build Summary</h2>
              <ul className="space-y-2 text-sm text-gray-600">
                {buildConfig.dashboard && (
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Dashboard with KPI cards and charts
                  </li>
                )}
                {buildConfig.crud && (
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    CRUD interfaces for all data entities
                  </li>
                )}
                {buildConfig.chatbot && (
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    AI Chatbot for natural language queries
                  </li>
                )}
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  PostgreSQL database with your schema
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  Sanitized sample data (max 10 rows/table)
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                  7-day test environment (extendable)
                </li>
              </ul>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                <p className="text-red-700">{error}</p>
              </div>
            )}

            {/* Build Button */}
            <div className="flex justify-end">
              <button
                onClick={handleStartPhaseFBuild}
                disabled={buildingPhaseF || (!buildConfig.dashboard && !buildConfig.crud && !buildConfig.chatbot)}
                className={`px-8 py-4 rounded-xl font-semibold inline-flex items-center gap-3 text-lg shadow-lg transition-all ${
                  buildingPhaseF || (!buildConfig.dashboard && !buildConfig.crud && !buildConfig.chatbot)
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700'
                }`}
              >
                {buildingPhaseF ? (
                  <>
                    <LoadingSpinner size="md" />
                    Building...
                  </>
                ) : (
                  <>
                    <RocketIcon />
                    Build & Download
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Legacy flow: ready status (pre-Phase F)
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <Link
              to={`/app/runs/${runId}/plan`}
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeftIcon />
              {t('build.backToPlan', 'Back to Plan')}
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">
              {t('build.title', 'Build App')}
            </h1>
          </div>

          {/* Start Build Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4 text-indigo-600">
              <RocketIcon />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {t('build.readyToBuild', 'Ready to Build')}
            </h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {t('build.readyDescription', 'Your run is ready. Start the app build process to create dashboards, CRUD apps, or chatbots from your structured data.')}
            </p>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-left">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {!canStart && canStartReason && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-left">
                <p className="text-sm text-yellow-700">{canStartReason}</p>
              </div>
            )}

            <button
              onClick={handleStartBuild}
              disabled={starting || !canStart}
              className={`px-6 py-3 rounded-lg font-medium inline-flex items-center gap-2 ${
                starting || !canStart
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              {starting && <LoadingSpinner size="sm" />}
              {starting
                ? t('build.starting', 'Starting...')
                : t('build.startBuild', 'Start Build Process')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Build exists - show current build status
  // (Steps C2-C4 will be implemented here)
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            to={`/app/runs/${runId}/plan`}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeftIcon />
            {t('build.backToPlan', 'Back to Plan')}
          </Link>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">
              {t('build.title', 'Build App')}
            </h1>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              build.status === 'selecting' ? 'bg-blue-100 text-blue-700' :
              build.status === 'blueprint_preview' ? 'bg-purple-100 text-purple-700' :
              build.status === 'confirming' ? 'bg-orange-100 text-orange-700' :
              build.status === 'build_approved' ? 'bg-green-100 text-green-700' :
              'bg-gray-100 text-gray-700'
            }`}>
              {build.status === 'confirming' ? t('build.statusConfirming', 'Confirming') :
               build.status === 'build_approved' ? t('build.statusApproved', 'Approved') :
               build.status}
            </span>
          </div>
        </div>

        {/* Build Progress Stepper */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            {/* Step 1: App Type Selection */}
            <div className="flex-1 text-center">
              <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center ${
                build.status === 'selecting' ? 'bg-blue-600 text-white' :
                ['blueprint_preview', 'confirming', 'build_approved'].includes(build.status) ? 'bg-green-600 text-white' :
                'bg-gray-200 text-gray-500'
              }`}>
                1
              </div>
              <p className="mt-2 text-sm font-medium text-gray-900">
                {t('build.step1Title', 'App Types')}
              </p>
            </div>

            <div className="flex-1 h-1 bg-gray-200 mx-2">
              <div className={`h-full ${
                ['blueprint_preview', 'confirming', 'build_approved'].includes(build.status) ? 'bg-green-600' : 'bg-gray-200'
              }`} />
            </div>

            {/* Step 2: Blueprint */}
            <div className="flex-1 text-center">
              <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center ${
                build.status === 'blueprint_preview' ? 'bg-blue-600 text-white' :
                ['confirming', 'build_approved'].includes(build.status) ? 'bg-green-600 text-white' :
                'bg-gray-200 text-gray-500'
              }`}>
                2
              </div>
              <p className="mt-2 text-sm font-medium text-gray-900">
                {t('build.step2Title', 'Blueprint')}
              </p>
            </div>

            <div className="flex-1 h-1 bg-gray-200 mx-2">
              <div className={`h-full ${
                ['confirming', 'build_approved'].includes(build.status) ? 'bg-green-600' : 'bg-gray-200'
              }`} />
            </div>

            {/* Step 3: Confirmation */}
            <div className="flex-1 text-center">
              <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center ${
                build.status === 'confirming' ? 'bg-blue-600 text-white' :
                build.status === 'build_approved' ? 'bg-green-600 text-white' :
                'bg-gray-200 text-gray-500'
              }`}>
                3
              </div>
              <p className="mt-2 text-sm font-medium text-gray-900">
                {t('build.step3Title', 'Confirm')}
              </p>
            </div>
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-xl border border-gray-200 p-8">
          {/* Step C2: App Type Selection */}
          {build.status === 'selecting' && (
            <div>
              <div className="text-center mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {t('build.selectAppTypes', 'Select App Types')}
                </h2>
                <p className="text-gray-600">
                  {t('build.selectAppTypesDesc', 'Choose one or more app types to build from your structured data')}
                </p>
              </div>

              {/* App Type Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {APP_TYPE_OPTIONS.map((appType) => {
                  const isSelected = selectedAppTypes.includes(appType.id);
                  return (
                    <button
                      key={appType.id}
                      onClick={() => toggleAppType(appType.id)}
                      className={`relative p-6 rounded-xl border-2 text-left transition-all ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200'
                          : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {/* Checkbox indicator */}
                      <div className={`absolute top-4 right-4 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-500'
                          : 'border-gray-300 bg-white'
                      }`}>
                        {isSelected && (
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>

                      {/* Icon */}
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${
                        isSelected ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {appType.icon}
                      </div>

                      {/* Content */}
                      <h3 className={`text-lg font-semibold mb-2 ${
                        isSelected ? 'text-indigo-900' : 'text-gray-900'
                      }`}>
                        {appType.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3">
                        {appType.description}
                      </p>
                      <div className="text-xs text-gray-500">
                        <span className="font-medium">{t('build.dataNeeds', 'Data needs')}:</span>{' '}
                        {appType.dataNeeds}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Error message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {/* Selection summary and Continue button */}
              <div className="flex items-center justify-between border-t border-gray-200 pt-6">
                <div className="text-sm text-gray-600">
                  {selectedAppTypes.length === 0 ? (
                    <span>{t('build.noSelection', 'No app types selected')}</span>
                  ) : (
                    <span>
                      {t('build.selectedCount', '{{count}} app type(s) selected', { count: selectedAppTypes.length })}:
                      {' '}
                      <span className="font-medium text-gray-900">
                        {selectedAppTypes.map(id =>
                          APP_TYPE_OPTIONS.find(o => o.id === id)?.name
                        ).join(', ')}
                      </span>
                    </span>
                  )}
                </div>
                <button
                  onClick={handleSaveAppTypes}
                  disabled={saving || selectedAppTypes.length === 0}
                  className={`px-6 py-3 rounded-lg font-medium inline-flex items-center gap-2 ${
                    saving || selectedAppTypes.length === 0
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}
                >
                  {saving && <LoadingSpinner size="sm" />}
                  {saving
                    ? t('build.saving', 'Saving...')
                    : t('build.continue', 'Continue')}
                  {!saving && (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Step C3: Blueprint Preview */}
          {build.status === 'blueprint_preview' && (
            <div>
              {/* No blueprint yet - show generate button */}
              {!build.blueprint && (
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4 text-purple-600">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    {t('build.generateBlueprint', 'Generate Blueprint')}
                  </h2>
                  <p className="text-gray-600 mb-4 max-w-md mx-auto">
                    {t('build.generateBlueprintDesc', 'Generate a detailed app blueprint based on your selected app types and data structure.')}
                  </p>

                  {/* Selected app types */}
                  <div className="flex flex-wrap justify-center gap-2 mb-6">
                    {build.selectedAppTypes.map(type => (
                      <span key={type} className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                        {type === 'dashboard' ? t('build.dashboard', 'Dashboard') :
                         type === 'crud_app' ? t('build.crudApp', 'CRUD App') :
                         type === 'chatbot' ? t('build.chatbot', 'Chatbot') : type}
                      </span>
                    ))}
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 max-w-md mx-auto text-left">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  )}

                  <button
                    onClick={() => handleGenerateBlueprint(false)}
                    disabled={generating}
                    className={`px-6 py-3 rounded-lg font-medium inline-flex items-center gap-2 ${
                      generating
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-purple-600 text-white hover:bg-purple-700'
                    }`}
                  >
                    {generating && <LoadingSpinner size="sm" />}
                    {generating
                      ? t('build.generating', 'Generating Blueprint...')
                      : t('build.generateNow', 'Generate Blueprint')}
                  </button>
                  <p className="text-xs text-gray-500 mt-3">
                    {t('build.requiresByok', 'Requires BYOK API key configured in Settings')}
                  </p>
                </div>
              )}

              {/* Blueprint exists - show preview */}
              {build.blueprint && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left: Blueprint Content */}
                  <div className="lg:col-span-2">
                    {/* Tab Navigation */}
                    <div className="flex border-b border-gray-200 mb-4">
                      {[
                        { id: 'technical', label: t('build.tabTechnical', 'Technical') },
                        { id: 'ui', label: t('build.tabUI', 'UI Structure') },
                        { id: 'api', label: t('build.tabAPI', 'API Outline') },
                        { id: 'data', label: t('build.tabData', 'Data Usage') },
                      ].map(tab => (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                            activeTab === tab.id
                              ? 'border-purple-600 text-purple-600'
                              : 'border-transparent text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    {/* Tab Content */}
                    <div className="bg-gray-50 rounded-lg p-4 min-h-[400px] overflow-auto">
                      {/* Technical Tab */}
                      {activeTab === 'technical' && (
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2">{t('build.architecture', 'Architecture')}</h4>
                            <p className="text-sm text-gray-700">{build.blueprint.technical?.architecture || 'Not specified'}</p>
                          </div>

                          {build.blueprint.technical?.components?.length > 0 && (
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-2">{t('build.components', 'Components')}</h4>
                              <div className="space-y-2">
                                {build.blueprint.technical.components.map((comp, i) => (
                                  <div key={i} className="bg-white p-3 rounded border border-gray-200">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="font-medium text-gray-900">{comp.name}</span>
                                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">{comp.type}</span>
                                    </div>
                                    <p className="text-sm text-gray-600">{comp.purpose}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {build.blueprint.technical?.dataAccess && (
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-2">{t('build.dataAccess', 'Data Access')}</h4>
                              <div className="bg-white p-3 rounded border border-gray-200 text-sm">
                                {build.blueprint.technical.dataAccess.readOperations?.length > 0 && (
                                  <div className="mb-2">
                                    <span className="font-medium">Read:</span>{' '}
                                    {build.blueprint.technical.dataAccess.readOperations.join(', ')}
                                  </div>
                                )}
                                {build.blueprint.technical.dataAccess.writeOperations?.length > 0 && (
                                  <div>
                                    <span className="font-medium">Write:</span>{' '}
                                    {build.blueprint.technical.dataAccess.writeOperations.join(', ')}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* UI Structure Tab */}
                      {activeTab === 'ui' && (
                        <div className="space-y-4">
                          {build.blueprint.uiStructure?.pages?.length > 0 && (
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-2">{t('build.pages', 'Pages')}</h4>
                              <div className="space-y-2">
                                {build.blueprint.uiStructure.pages.map((page, i) => (
                                  <div key={i} className="bg-white p-3 rounded border border-gray-200">
                                    <div className="flex items-center gap-2 mb-1">
                                      <code className="text-sm bg-gray-100 px-2 py-0.5 rounded">{page.path}</code>
                                      <span className="font-medium text-gray-900">{page.name}</span>
                                    </div>
                                    <p className="text-sm text-gray-600">{page.purpose}</p>
                                    {page.widgets?.length > 0 && (
                                      <div className="flex flex-wrap gap-1 mt-2">
                                        {page.widgets.map((w, j) => (
                                          <span key={j} className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded">{w}</span>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {build.blueprint.uiStructure?.widgets?.length > 0 && (
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-2">{t('build.widgets', 'Widgets')}</h4>
                              <div className="grid grid-cols-2 gap-2">
                                {build.blueprint.uiStructure.widgets.map((widget, i) => (
                                  <div key={i} className="bg-white p-3 rounded border border-gray-200">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="font-medium text-gray-900">{widget.name}</span>
                                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">{widget.type}</span>
                                    </div>
                                    <p className="text-xs text-gray-600">{widget.dataSource}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* API Outline Tab */}
                      {activeTab === 'api' && (
                        <div>
                          {build.blueprint.apiOutline?.endpoints?.length > 0 ? (
                            <div className="space-y-2">
                              {build.blueprint.apiOutline.endpoints.map((endpoint, i) => (
                                <div key={i} className="bg-white p-3 rounded border border-gray-200">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                                      endpoint.method === 'GET' ? 'bg-green-100 text-green-700' :
                                      endpoint.method === 'POST' ? 'bg-blue-100 text-blue-700' :
                                      endpoint.method === 'PUT' ? 'bg-yellow-100 text-yellow-700' :
                                      endpoint.method === 'DELETE' ? 'bg-red-100 text-red-700' :
                                      'bg-gray-100 text-gray-700'
                                    }`}>
                                      {endpoint.method}
                                    </span>
                                    <code className="text-sm font-mono">{endpoint.path}</code>
                                  </div>
                                  <p className="text-sm text-gray-600">{endpoint.purpose}</p>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-gray-500 text-center py-8">{t('build.noEndpoints', 'No API endpoints defined')}</p>
                          )}
                        </div>
                      )}

                      {/* Data Usage Tab */}
                      {activeTab === 'data' && (
                        <div className="space-y-4">
                          {build.blueprint.dataUsage?.tables?.length > 0 && (
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-2">{t('build.tables', 'Tables')}</h4>
                              <div className="space-y-2">
                                {build.blueprint.dataUsage.tables.map((table, i) => (
                                  <div key={i} className="bg-white p-3 rounded border border-gray-200">
                                    <div className="font-medium text-gray-900 mb-1">{table.name}</div>
                                    <div className="flex flex-wrap gap-1">
                                      {table.operations?.map((op, j) => (
                                        <span key={j} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">{op}</span>
                                      ))}
                                    </div>
                                    {table.usedBy?.length > 0 && (
                                      <p className="text-xs text-gray-500 mt-1">Used by: {table.usedBy.join(', ')}</p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {build.blueprint.dataUsage?.relationships?.length > 0 && (
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-2">{t('build.relationships', 'Relationships')}</h4>
                              <div className="space-y-2">
                                {build.blueprint.dataUsage.relationships.map((rel, i) => (
                                  <div key={i} className="bg-white p-3 rounded border border-gray-200 text-sm">
                                    <span className="font-medium">{rel.from}</span>
                                    <span className="mx-2 text-gray-400">→</span>
                                    <span className="font-medium">{rel.to}</span>
                                    <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">{rel.type}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Summary & Actions */}
                    <div className="mt-4 flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">{build.blueprint.summary?.totalPages || 0}</span> pages,{' '}
                        <span className="font-medium">{build.blueprint.summary?.totalWidgets || 0}</span> widgets,{' '}
                        <span className="font-medium">{build.blueprint.summary?.totalEndpoints || 0}</span> endpoints
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleGenerateBlueprint(true)}
                          disabled={generating || advancingToConfirm}
                          className="px-4 py-2 text-sm font-medium text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100 disabled:opacity-50"
                        >
                          {generating ? t('build.regenerating', 'Regenerating...') : t('build.regenerate', 'Regenerate')}
                        </button>
                        <button
                          onClick={handleAdvanceToConfirm}
                          disabled={advancingToConfirm || generating}
                          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 inline-flex items-center gap-2"
                        >
                          {advancingToConfirm && <LoadingSpinner size="sm" />}
                          {advancingToConfirm
                            ? t('build.advancing', 'Advancing...')
                            : t('build.continueToConfirm', 'Continue to Confirm')}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Right: Refinement Chat */}
                  <div className="lg:col-span-1">
                    <div className="bg-gray-50 rounded-lg border border-gray-200 h-full flex flex-col">
                      <div className="p-3 border-b border-gray-200">
                        <h4 className="font-semibold text-gray-900">{t('build.refinementChat', 'Refinement Chat')}</h4>
                        <p className="text-xs text-gray-500">{t('build.chatDescription', 'Ask questions or request changes')}</p>
                      </div>

                      {/* Chat Messages */}
                      <div className="flex-1 overflow-auto p-3 space-y-3 max-h-[400px]">
                        {build.blueprintChatHistory?.length === 0 && (
                          <p className="text-sm text-gray-500 text-center py-4">
                            {t('build.noMessages', 'No messages yet. Ask a question about the blueprint.')}
                          </p>
                        )}
                        {build.blueprintChatHistory?.map((msg, i) => (
                          <div
                            key={i}
                            className={`p-3 rounded-lg text-sm ${
                              msg.role === 'user'
                                ? 'bg-indigo-100 text-indigo-900 ml-4'
                                : 'bg-white border border-gray-200 mr-4'
                            }`}
                          >
                            <p className="whitespace-pre-wrap">{msg.content}</p>
                          </div>
                        ))}
                      </div>

                      {/* Chat Input */}
                      <div className="p-3 border-t border-gray-200">
                        {error && (
                          <div className="bg-red-50 text-red-700 text-xs p-2 rounded mb-2">{error}</div>
                        )}
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={chatMessage}
                            onChange={(e) => setChatMessage(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && !sendingChat && handleSendChat()}
                            placeholder={t('build.chatPlaceholder', 'Ask about the blueprint...')}
                            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            disabled={sendingChat}
                          />
                          <button
                            onClick={handleSendChat}
                            disabled={sendingChat || !chatMessage.trim()}
                            className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {sendingChat ? (
                              <LoadingSpinner size="sm" />
                            ) : (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step C4: Confirmation */}
          {build.status === 'confirming' && (
            <div className="max-w-2xl mx-auto">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4 text-orange-600">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {t('build.confirmBuildTitle', 'Confirm Build')}
                </h2>
                <p className="text-gray-600">
                  {t('build.confirmBuildDesc', 'Review your build configuration before final confirmation')}
                </p>
              </div>

              {/* Summary Card */}
              <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 mb-6">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
                  {t('build.buildSummary', 'Build Summary')}
                </h3>

                {/* Selected App Types */}
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">{t('build.selectedAppTypes', 'Selected App Types')}:</p>
                  <div className="flex flex-wrap gap-2">
                    {build.selectedAppTypes?.map(type => (
                      <span key={type} className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                        {type === 'dashboard' ? t('build.dashboard', 'Dashboard') :
                         type === 'crud_app' ? t('build.crudApp', 'CRUD App') :
                         type === 'chatbot' ? t('build.chatbot', 'Chatbot') : type}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Blueprint Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
                    <p className="text-2xl font-bold text-gray-900">
                      {build.blueprint?.summary?.totalPages || 0}
                    </p>
                    <p className="text-sm text-gray-500">{t('build.pages', 'Pages')}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
                    <p className="text-2xl font-bold text-gray-900">
                      {build.blueprint?.summary?.totalWidgets || 0}
                    </p>
                    <p className="text-sm text-gray-500">{t('build.widgets', 'Widgets')}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
                    <p className="text-2xl font-bold text-gray-900">
                      {build.blueprint?.summary?.totalEndpoints || 0}
                    </p>
                    <p className="text-sm text-gray-500">{t('build.endpoints', 'Endpoints')}</p>
                  </div>
                </div>

                {/* Primary Data Sources */}
                {build.blueprint?.summary?.primaryDataSources?.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600 mb-2">{t('build.primaryDataSources', 'Primary Data Sources')}:</p>
                    <div className="flex flex-wrap gap-2">
                      {build.blueprint.summary.primaryDataSources.map((source, i) => (
                        <span key={i} className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs font-mono">
                          {source}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Warning Message */}
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6">
                <div className="flex gap-3">
                  <svg className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <div>
                    <p className="font-semibold text-orange-800 mb-1">
                      {t('build.blueprintWillBeLocked', 'Blueprint Will Be Locked')}
                    </p>
                    <p className="text-sm text-orange-700">
                      {t('build.lockWarning', 'After confirmation, the blueprint design cannot be modified. You will not be able to change app types, regenerate the blueprint, or use the refinement chat. Proceed only when you are satisfied with the current design.')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Confirmation Input */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('build.typeConfirmPhrase', 'Type "CONFIRM BUILD" to proceed')}:
                </label>
                <input
                  type="text"
                  value={confirmPhrase}
                  onChange={(e) => setConfirmPhrase(e.target.value.toUpperCase())}
                  placeholder="CONFIRM BUILD"
                  className={`w-full px-4 py-3 text-lg font-mono border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                    confirmPhrase === 'CONFIRM BUILD'
                      ? 'border-green-500 bg-green-50'
                      : confirmPhrase.length > 0
                        ? 'border-red-300 bg-red-50'
                        : 'border-gray-300'
                  }`}
                  disabled={confirming}
                />
                {confirmPhrase.length > 0 && confirmPhrase !== 'CONFIRM BUILD' && (
                  <p className="text-sm text-red-600 mt-2">
                    {t('build.phraseMismatch', 'Phrase does not match. Please type exactly: CONFIRM BUILD')}
                  </p>
                )}

                {/* Error message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                {/* Confirm Button */}
                <button
                  onClick={handleConfirmBuild}
                  disabled={confirmPhrase !== 'CONFIRM BUILD' || confirming}
                  className={`w-full mt-6 px-6 py-3 rounded-lg font-medium inline-flex items-center justify-center gap-2 ${
                    confirmPhrase === 'CONFIRM BUILD' && !confirming
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {confirming && <LoadingSpinner size="sm" />}
                  {confirming
                    ? t('build.confirming', 'Confirming...')
                    : t('build.confirmAndLock', 'Confirm & Lock Blueprint')}
                </button>
              </div>
            </div>
          )}

          {/* Build Approved */}
          {build.status === 'build_approved' && (
            <div className="max-w-2xl mx-auto">
              {/* Success Header */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4 text-green-600">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {t('build.buildApproved', 'Build Approved')}
                </h2>
                <p className="text-gray-600">
                  {t('build.blueprintLocked', 'Your blueprint has been locked and is ready for preview.')}
                </p>
              </div>

              {/* Confirmation Details */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                  {t('build.buildDetails', 'Build Details')}
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('build.confirmedAt', 'Confirmed At')}:</span>
                    <span className="font-medium text-gray-900">
                      {build.buildConfirmedAt
                        ? new Date(build.buildConfirmedAt).toLocaleString()
                        : '-'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('build.confirmationToken', 'Confirmation Token')}:</span>
                    <span className="font-mono text-xs text-gray-700 bg-gray-200 px-2 py-1 rounded">
                      {build.confirmationToken?.substring(0, 8) || '-'}...
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('build.appTypes', 'App Types')}:</span>
                    <div className="flex gap-1">
                      {build.selectedAppTypes?.map(type => (
                        <span key={type} className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded text-xs">
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Preview Section */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  {t('build.previewSection', 'App Preview')}
                </h3>

                {/* Loading state */}
                {previewLoading && !preview && (
                  <div className="text-center py-6">
                    <LoadingSpinner size="lg" />
                    <p className="text-sm text-gray-500 mt-2">{t('build.loadingPreview', 'Loading preview status...')}</p>
                  </div>
                )}

                {/* No preview yet */}
                {!previewLoading && !preview && (
                  <div className="text-center py-6">
                    <p className="text-gray-600 mb-4">
                      {t('build.noPreviewYet', 'Generate a read-only preview of your app to see how it will look.')}
                    </p>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 text-left">
                      <div className="flex gap-3">
                        <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="text-sm text-blue-700">
                          <p className="font-medium mb-1">{t('build.previewInfo', 'Preview Features')}</p>
                          <ul className="list-disc list-inside space-y-1 text-blue-600">
                            <li>{t('build.previewFeature1', 'Read-only data views')}</li>
                            <li>{t('build.previewFeature2', 'Shareable public link')}</li>
                            <li>{t('build.previewFeature3', 'Valid for 7 days')}</li>
                            <li>{t('build.previewFeature4', 'No cloud credentials required')}</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    {error && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 text-left">
                        <p className="text-sm text-red-700">{error}</p>
                      </div>
                    )}

                    <button
                      onClick={handleGeneratePreview}
                      disabled={generatingPreview}
                      className={`px-6 py-3 rounded-lg font-medium inline-flex items-center gap-2 ${
                        generatingPreview
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-purple-600 text-white hover:bg-purple-700'
                      }`}
                    >
                      {generatingPreview && <LoadingSpinner size="sm" />}
                      {generatingPreview
                        ? t('build.generatingPreview', 'Generating Preview...')
                        : t('build.generatePreview', 'Generate Preview')}
                    </button>
                  </div>
                )}

                {/* Preview generating */}
                {preview?.status === 'generating' && (
                  <div className="text-center py-6">
                    <LoadingSpinner size="lg" />
                    <p className="text-gray-600 mt-4">
                      {t('build.previewGenerating', 'Generating your preview...')}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {t('build.previewGeneratingDesc', 'This may take a few moments.')}
                    </p>
                  </div>
                )}

                {/* Preview error */}
                {preview?.status === 'error' && (
                  <div className="text-center py-6">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mb-4 text-red-600">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                    <p className="text-red-700 mb-2">
                      {t('build.previewError', 'Preview generation failed')}
                    </p>
                    <p className="text-sm text-gray-500 mb-4">
                      {preview.errorMessage || t('build.previewErrorDesc', 'An error occurred while generating the preview.')}
                    </p>
                    <button
                      onClick={handleGeneratePreview}
                      disabled={generatingPreview}
                      className="px-4 py-2 text-sm font-medium text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100"
                    >
                      {t('build.retryPreview', 'Retry')}
                    </button>
                  </div>
                )}

                {/* Preview expired */}
                {preview?.status === 'expired' && (
                  <div className="text-center py-6">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-full mb-4 text-yellow-600">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-yellow-700 mb-2">
                      {t('build.previewExpired', 'Preview has expired')}
                    </p>
                    <p className="text-sm text-gray-500 mb-4">
                      {t('build.previewExpiredDesc', 'Generate a new preview to continue.')}
                    </p>
                    <button
                      onClick={handleGeneratePreview}
                      disabled={generatingPreview}
                      className="px-4 py-2 text-sm font-medium text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100"
                    >
                      {t('build.regeneratePreview', 'Generate New Preview')}
                    </button>
                  </div>
                )}

                {/* Preview ready */}
                {preview?.status === 'ready' && (
                  <div>
                    {/* Preview URL */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-green-800 mb-1">
                            {t('build.previewReady', 'Preview is ready!')}
                          </p>
                          <p className="text-xs text-green-600 font-mono truncate">
                            {window.location.origin}{preview.previewUrl}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={handleCopyPreviewUrl}
                            className="px-3 py-2 text-sm font-medium text-green-700 bg-green-100 rounded-lg hover:bg-green-200 inline-flex items-center gap-1"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            {t('build.copyUrl', 'Copy')}
                          </button>
                          <a
                            href={preview.previewUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 inline-flex items-center gap-1"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                            {t('build.openPreview', 'Open')}
                          </a>
                        </div>
                      </div>
                    </div>

                    {/* Expiration notice */}
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>
                        {t('build.expiresAt', 'Expires')}:{' '}
                        <span className="font-medium text-gray-700">
                          {preview.expiresAt
                            ? new Date(preview.expiresAt).toLocaleDateString()
                            : '-'}
                        </span>
                      </span>
                      <button
                        onClick={handleGeneratePreview}
                        disabled={generatingPreview}
                        className="text-purple-600 hover:text-purple-700"
                      >
                        {t('build.regenerate', 'Regenerate')}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* View Summary Section */}
              <div className="mt-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Build Summary
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      View complete details of what was generated, including data lineage and export options.
                    </p>
                  </div>
                  <Link
                    to={`/app/runs/${runId}/summary`}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium flex items-center gap-2"
                  >
                    View Summary
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
