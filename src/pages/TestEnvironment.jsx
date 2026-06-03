import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';

/**
 * TestEnvironment Page - Phase F
 *
 * Manages the test environment for a build:
 * - Shows build status and deployment info
 * - Docker export download
 * - Test period management (7-day expiry, extensions)
 * - Feedback submission and listing
 * - Promote to production
 */

// Icons
const ArrowLeftIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

const DownloadIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
);

const ClockIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ExclamationIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

const BugIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 3c-1.1 0-2 .9-2 2v.5C8.3 6.1 7 7.9 7 10v2l-2 2v1h14v-1l-2-2v-2c0-2.1-1.3-3.9-3-4.5V5c0-1.1-.9-2-2-2z" />
  </svg>
);

const SparklesIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
);

const RocketIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

// Status badge colors
const getStatusColor = (status) => {
  const colors = {
    selecting: 'bg-gray-100 text-gray-700',
    configured: 'bg-blue-100 text-blue-700',
    generating: 'bg-yellow-100 text-yellow-700',
    provisioning: 'bg-orange-100 text-orange-700',
    packaging: 'bg-purple-100 text-purple-700',
    ready: 'bg-green-100 text-green-700',
    deployed: 'bg-emerald-100 text-emerald-700',
    promoted: 'bg-indigo-100 text-indigo-700',
    failed: 'bg-red-100 text-red-700',
  };
  return colors[status] || 'bg-gray-100 text-gray-700';
};

const getFeedbackTypeColor = (type) => {
  const colors = {
    bug: 'bg-red-100 text-red-700',
    enhancement: 'bg-blue-100 text-blue-700',
    change_request: 'bg-purple-100 text-purple-700',
    approval: 'bg-green-100 text-green-700',
  };
  return colors[type] || 'bg-gray-100 text-gray-700';
};

const getFeedbackStatusColor = (status) => {
  const colors = {
    open: 'bg-yellow-100 text-yellow-700',
    in_progress: 'bg-blue-100 text-blue-700',
    resolved: 'bg-green-100 text-green-700',
    wont_fix: 'bg-gray-100 text-gray-700',
  };
  return colors[status] || 'bg-gray-100 text-gray-700';
};

export default function TestEnvironment() {
  const { t } = useTranslation();
  const { id: runId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { authFetch } = useAuth();

  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [buildStatus, setBuildStatus] = useState(null);
  const [feedback, setFeedback] = useState([]);
  const [feedbackSummary, setFeedbackSummary] = useState(null);
  const [showSuccessBanner, setShowSuccessBanner] = useState(location.state?.showSuccessBanner || false);

  // Action states
  const [downloading, setDownloading] = useState(false);
  const [extending, setExtending] = useState(false);
  const [promoting, setPromoting] = useState(false);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  // Feedback form state
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [feedbackForm, setFeedbackForm] = useState({
    type: 'bug',
    component: 'general',
    title: '',
    description: ''
  });

  // Fetch build status and feedback
  const fetchData = useCallback(async () => {
    try {
      setError(null);

      // Fetch build status
      const statusRes = await authFetch(`/orchestrated-runs/${runId}/build/status`);
      if (!statusRes.ok) {
        const data = await statusRes.json();
        throw new Error(data.error || 'Failed to fetch build status');
      }
      const status = await statusRes.json();
      setBuildStatus(status);

      // If build exists, fetch feedback
      if (status.exists && status.buildId) {
        const [feedbackRes, summaryRes] = await Promise.all([
          authFetch(`/app-builds/${status.buildId}/feedback`),
          authFetch(`/app-builds/${status.buildId}/feedback/summary`)
        ]);

        if (feedbackRes.ok) {
          const feedbackData = await feedbackRes.json();
          setFeedback(feedbackData);
        }

        if (summaryRes.ok) {
          const summaryData = await summaryRes.json();
          setFeedbackSummary(summaryData);
        }
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

  // Handle Docker export download
  const handleDownload = async () => {
    if (!buildStatus?.buildId) return;

    setDownloading(true);
    try {
      const res = await authFetch(`/app-builds/${buildStatus.buildId}/download`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to download');
      }

      // Get blob and trigger download
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `skatalyst-app-${buildStatus.buildId.substring(0, 8)}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(err.message);
    } finally {
      setDownloading(false);
    }
  };

  // Handle extend test period
  const handleExtend = async () => {
    if (!buildStatus?.buildId) return;

    setExtending(true);
    try {
      const res = await authFetch(`/app-builds/${buildStatus.buildId}/extend`, {
        method: 'POST'
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to extend');
      }
      await fetchData();
    } catch (err) {
      setError(err.message);
    } finally {
      setExtending(false);
    }
  };

  // Handle promote to production
  const handlePromote = async () => {
    if (!buildStatus?.buildId) return;

    if (!window.confirm('Are you sure you want to promote this build to production? This will mark the build as production-ready.')) {
      return;
    }

    setPromoting(true);
    try {
      const res = await authFetch(`/app-builds/${buildStatus.buildId}/promote`, {
        method: 'POST'
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to promote');
      }
      await fetchData();
    } catch (err) {
      setError(err.message);
    } finally {
      setPromoting(false);
    }
  };

  // Handle feedback submission
  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    if (!buildStatus?.buildId) return;

    setSubmittingFeedback(true);
    try {
      const res = await authFetch(`/app-builds/${buildStatus.buildId}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feedbackForm)
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to submit feedback');
      }
      setFeedbackForm({ type: 'bug', component: 'general', title: '', description: '' });
      setShowFeedbackForm(false);
      await fetchData();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmittingFeedback(false);
    }
  };

  // Calculate time remaining
  const getTimeRemaining = () => {
    if (!buildStatus?.expiresAt) return null;
    const now = new Date();
    const expires = new Date(buildStatus.expiresAt);
    const diff = expires - now;

    if (diff <= 0) return { expired: true, text: 'Expired' };

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) {
      return { expired: false, text: `${days} day${days === 1 ? '' : 's'}, ${hours} hour${hours === 1 ? '' : 's'}` };
    }
    return { expired: false, text: `${hours} hour${hours === 1 ? '' : 's'}` };
  };

  const timeRemaining = getTimeRemaining();

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="xl" />
          <p className="mt-4 text-gray-600">Loading test environment...</p>
        </div>
      </div>
    );
  }

  // No build exists
  if (!buildStatus?.exists) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <RocketIcon />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              No Build Found
            </h2>
            <p className="text-gray-600 mb-6">
              You haven't started a build for this run yet. Go to the Build App page to configure and start your build.
            </p>
            <Link
              to={`/app/runs/${runId}/build`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <RocketIcon />
              Start Build
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className={`${buildStatus.status === 'promoted' ? 'bg-gradient-to-r from-indigo-600 to-purple-600' : 'bg-gradient-to-r from-emerald-600 to-teal-600'} text-white`}>
        <div className="max-w-6xl mx-auto px-6 py-8">
          <Link
            to={`/app/runs/${runId}/build`}
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4"
          >
            <ArrowLeftIcon />
            Back to Build Config
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Test Environment</h1>
              <p className="text-white/80 mt-1">
                {buildStatus.status === 'promoted'
                  ? 'This build has been promoted to production'
                  : 'Download, test, and provide feedback on your build'}
              </p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(buildStatus.status)}`}>
              {buildStatus.status}
            </span>
          </div>
        </div>
      </div>

      {/* Success Banner */}
      {showSuccessBanner && (
        <div className="bg-green-50 border-b border-green-200 px-6 py-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircleIcon className="text-green-600" />
              <span className="text-green-800 font-medium">Build completed successfully! Download your Docker export below.</span>
            </div>
            <button
              onClick={() => setShowSuccessBanner(false)}
              className="text-green-600 hover:text-green-800"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border-b border-red-200 px-6 py-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ExclamationIcon className="text-red-600" />
              <span className="text-red-800">{error}</span>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-800"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Download Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Docker Export</h2>

              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-600 mb-3">
                  Your application is packaged as a Docker Compose project. Download and extract it, then run:
                </p>
                <div className="bg-gray-900 rounded-lg p-3 font-mono text-sm text-green-400">
                  <p>$ unzip skatalyst-app-*.zip</p>
                  <p>$ cd skatalyst-app</p>
                  <p>$ docker-compose up -d</p>
                  <p className="text-gray-500 mt-2"># Access at http://localhost:3000</p>
                </div>
              </div>

              <button
                onClick={handleDownload}
                disabled={downloading || !buildStatus.canDownload}
                className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                  buildStatus.canDownload
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                {downloading ? (
                  <>
                    <LoadingSpinner size="sm" />
                    Downloading...
                  </>
                ) : (
                  <>
                    <DownloadIcon />
                    Download Docker Export
                  </>
                )}
              </button>

              {!buildStatus.canDownload && (
                <p className="text-sm text-gray-500 mt-2 text-center">
                  Build must be ready or deployed to download
                </p>
              )}
            </div>

            {/* Feedback Section */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Feedback</h2>
                <button
                  onClick={() => setShowFeedbackForm(!showFeedbackForm)}
                  className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  {showFeedbackForm ? 'Cancel' : '+ Add Feedback'}
                </button>
              </div>

              {/* Feedback Summary */}
              {feedbackSummary && (
                <div className="grid grid-cols-4 gap-4 mb-4">
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-gray-900">{feedbackSummary.total}</div>
                    <div className="text-xs text-gray-500">Total</div>
                  </div>
                  <div className="bg-yellow-50 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-yellow-700">{feedbackSummary.byStatus?.open || 0}</div>
                    <div className="text-xs text-yellow-600">Open</div>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-blue-700">{feedbackSummary.byStatus?.in_progress || 0}</div>
                    <div className="text-xs text-blue-600">In Progress</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-green-700">{feedbackSummary.byStatus?.resolved || 0}</div>
                    <div className="text-xs text-green-600">Resolved</div>
                  </div>
                </div>
              )}

              {/* Feedback Form */}
              {showFeedbackForm && (
                <form onSubmit={handleSubmitFeedback} className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                      <select
                        value={feedbackForm.type}
                        onChange={(e) => setFeedbackForm(prev => ({ ...prev, type: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="bug">Bug Report</option>
                        <option value="enhancement">Enhancement</option>
                        <option value="change_request">Change Request</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Component</label>
                      <select
                        value={feedbackForm.component}
                        onChange={(e) => setFeedbackForm(prev => ({ ...prev, component: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="general">General</option>
                        <option value="dashboard">Dashboard</option>
                        <option value="chatbot">Chatbot</option>
                        <option value="crud">CRUD Views</option>
                      </select>
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input
                      type="text"
                      value={feedbackForm.title}
                      onChange={(e) => setFeedbackForm(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Brief description of the issue"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={feedbackForm.description}
                      onChange={(e) => setFeedbackForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Detailed description, steps to reproduce, expected vs actual behavior..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submittingFeedback || !feedbackForm.title}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    {submittingFeedback ? (
                      <>
                        <LoadingSpinner size="sm" />
                        Submitting...
                      </>
                    ) : (
                      'Submit Feedback'
                    )}
                  </button>
                </form>
              )}

              {/* Feedback List */}
              {feedback.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <BugIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No feedback yet. Test your app and submit any issues or suggestions!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {feedback.map((item) => (
                    <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getFeedbackTypeColor(item.type)}`}>
                            {item.type.replace('_', ' ')}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getFeedbackStatusColor(item.status)}`}>
                            {item.status.replace('_', ' ')}
                          </span>
                          {item.component && (
                            <span className="text-xs text-gray-500">
                              {item.component}
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-gray-400">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h4 className="font-medium text-gray-900">{item.title}</h4>
                      {item.description && (
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{item.description}</p>
                      )}
                      {item.resolutionNotes && (
                        <div className="mt-2 bg-green-50 rounded p-2">
                          <p className="text-sm text-green-700">
                            <strong>Resolution:</strong> {item.resolutionNotes}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Test Period Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Test Period</h3>

              {buildStatus.promotedAt ? (
                <div className="bg-indigo-50 rounded-lg p-4 text-center">
                  <CheckCircleIcon className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
                  <p className="text-indigo-700 font-medium">Promoted to Production</p>
                  <p className="text-sm text-indigo-600 mt-1">
                    {new Date(buildStatus.promotedAt).toLocaleDateString()}
                  </p>
                </div>
              ) : timeRemaining ? (
                <>
                  <div className={`rounded-lg p-4 text-center ${
                    timeRemaining.expired ? 'bg-red-50' : 'bg-gray-50'
                  }`}>
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <ClockIcon className={timeRemaining.expired ? 'text-red-600' : 'text-gray-600'} />
                      <span className={`text-lg font-bold ${timeRemaining.expired ? 'text-red-700' : 'text-gray-900'}`}>
                        {timeRemaining.text}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      {timeRemaining.expired ? 'Test period has ended' : 'remaining in test period'}
                    </p>
                  </div>

                  {buildStatus.canExtend && (
                    <button
                      onClick={handleExtend}
                      disabled={extending}
                      className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                    >
                      {extending ? (
                        <>
                          <LoadingSpinner size="sm" />
                          Extending...
                        </>
                      ) : (
                        <>
                          <ClockIcon />
                          Extend 7 Days ({4 - (buildStatus.extensionCount || 0)} left)
                        </>
                      )}
                    </button>
                  )}

                  {buildStatus.extensionCount >= 4 && (
                    <p className="text-sm text-amber-600 mt-2 text-center">
                      Maximum extensions reached (30 days total)
                    </p>
                  )}
                </>
              ) : null}
            </div>

            {/* Promote Card */}
            {buildStatus.canPromote && !buildStatus.promotedAt && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Ready for Production?</h3>

                {feedbackSummary?.hasBlockingIssues ? (
                  <div className="bg-red-50 rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-2 text-red-700 mb-2">
                      <ExclamationIcon />
                      <span className="font-medium">Blocking Issues</span>
                    </div>
                    <p className="text-sm text-red-600">
                      There are open bug reports that should be resolved before promoting.
                    </p>
                  </div>
                ) : (
                  <div className="bg-green-50 rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-2 text-green-700 mb-2">
                      <CheckCircleIcon />
                      <span className="font-medium">Ready to Promote</span>
                    </div>
                    <p className="text-sm text-green-600">
                      No blocking issues. You can promote this build to production.
                    </p>
                  </div>
                )}

                <button
                  onClick={handlePromote}
                  disabled={promoting || feedbackSummary?.hasBlockingIssues}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${
                    feedbackSummary?.hasBlockingIssues
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}
                >
                  {promoting ? (
                    <>
                      <LoadingSpinner size="sm" />
                      Promoting...
                    </>
                  ) : (
                    <>
                      <RocketIcon />
                      Promote to Production
                    </>
                  )}
                </button>

                <p className="text-xs text-gray-500 mt-3 text-center">
                  Promotion marks the build as production-ready. You'll be able to download the same code for self-deployment.
                </p>
              </div>
            )}

            {/* Build Details Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Build Details</h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Build ID</span>
                  <span className="font-mono text-gray-900">{buildStatus.buildId?.substring(0, 8)}...</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Status</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(buildStatus.status)}`}>
                    {buildStatus.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Deployment Type</span>
                  <span className="text-gray-900">{buildStatus.deploymentType || 'Docker Export'}</span>
                </div>
                {buildStatus.codeGeneratedAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Code Generated</span>
                    <span className="text-gray-900">
                      {new Date(buildStatus.codeGeneratedAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {buildStatus.deployedAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Deployed</span>
                    <span className="text-gray-900">
                      {new Date(buildStatus.deployedAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>

              <div className="space-y-2">
                <Link
                  to={`/app/runs/${runId}/analytics-preview`}
                  className="w-full flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <SparklesIcon />
                  View Analytics Preview
                </Link>
                <Link
                  to={`/app/runs/${runId}/build`}
                  className="w-full flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <RocketIcon />
                  Build Configuration
                </Link>
                {buildStatus.canRebuild && (
                  <Link
                    to={`/app/runs/${runId}/build`}
                    className="w-full flex items-center gap-2 px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Rebuild
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
