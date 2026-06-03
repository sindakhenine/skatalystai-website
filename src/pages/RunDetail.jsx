import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import RunTimeline from '../components/RunTimeline';
import RunDebugPanel from '../components/RunDebugPanel';

/**
 * RunDetail Page (/app/runs/:id)
 *
 * Unified run detail page showing:
 * 1. Run overview and metadata
 * 2. RunTimeline component with visual progress and next CTA
 * 3. RunDebugPanel for admin users
 * 4. Quick links to all sub-pages
 */

export default function RunDetail() {
  const { t } = useTranslation();
  const { id: runId } = useParams();
  const navigate = useNavigate();
  const { authFetch, user } = useAuth();

  const [run, setRun] = useState(null);
  const [plan, setPlan] = useState(null);
  const [discovery, setDiscovery] = useState(null);
  const [build, setBuild] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is admin
  const isAdmin = user?.is_super_admin || user?.role === 'admin';

  // Fetch all run data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch run details
      const runRes = await authFetch(`/orchestrated-runs/${runId}`);
      if (!runRes.ok) {
        const data = await runRes.json();
        throw new Error(data.error || 'Failed to fetch run');
      }
      const runData = await runRes.json();
      setRun(runData);

      // Fetch plan if available
      if (runData.structuring_plan_id) {
        try {
          const planRes = await authFetch(`/orchestrated-runs/${runId}/structuring-plan`);
          if (planRes.ok) {
            const planData = await planRes.json();
            setPlan(planData);
          }
        } catch (e) {
          console.warn('Could not fetch plan:', e);
        }
      }

      // Fetch KPI discovery if available
      if (runData.kpi_discovery_id || runData.architecture_status === 'confirmed') {
        try {
          const discoveryRes = await authFetch(`/orchestrated-runs/${runId}/kpi-discovery`);
          if (discoveryRes.ok) {
            const discoveryData = await discoveryRes.json();
            setDiscovery(discoveryData);
          }
        } catch (e) {
          console.warn('Could not fetch discovery:', e);
        }
      }

      // Fetch build if available
      try {
        const buildRes = await authFetch(`/orchestrated-runs/${runId}/build`);
        if (buildRes.ok) {
          const buildData = await buildRes.json();
          if (buildData.exists) {
            setBuild(buildData.build);
          }
        }
      } catch (e) {
        console.warn('Could not fetch build:', e);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading run details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Run</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/app/runs')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Back to Runs
          </button>
        </div>
      </div>
    );
  }

  if (!run) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Run not found</p>
          <button
            onClick={() => navigate('/app/runs')}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Back to Runs
          </button>
        </div>
      </div>
    );
  }

  // Format date
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/app/runs')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Run #{run.id?.slice(0, 8)}
                </h1>
                <p className="text-gray-500 text-sm mt-1">
                  Created {formatDate(run.created_at)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${getStatusBadgeColor(run.status)}`}>
                {run.status?.replace(/_/g, ' ')}
              </span>
              <button
                onClick={fetchData}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Refresh"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        {/* Timeline Component */}
        <RunTimeline run={run} />

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-4">
          <StatCard
            label="Sources"
            value={run.connector_ids?.length || run.inventory?.sources?.length || 0}
            icon="📁"
          />
          <StatCard
            label="Files/Tables"
            value={run.inventory?.sources?.reduce((sum, s) => sum + (s.files?.length || s.tables?.length || 0), 0) || 0}
            icon="📄"
          />
          <StatCard
            label="KPIs"
            value={discovery?.kpis?.length || 0}
            icon="📊"
          />
          <StatCard
            label="Architecture"
            value={run.architecture_choice || 'Not selected'}
            icon="🏗️"
          />
        </div>

        {/* Phase Details */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Phase Details</h3>

          <div className="space-y-4">
            {/* Inventory */}
            <PhaseRow
              label="Inventory"
              status={run.inventory_approved ? 'Approved' : (run.status === 'scanned' ? 'Ready for approval' : run.status)}
              statusColor={run.inventory_approved ? 'green' : 'gray'}
              action={run.status !== 'pending' && run.status !== 'scanning' ? {
                label: 'View Inventory',
                path: `/app/runs/${run.id}/inventory`
              } : null}
            />

            {/* Plan */}
            <PhaseRow
              label="Structuring Plan"
              status={plan?.status || (run.structuring_plan_id ? 'Available' : 'Not generated')}
              statusColor={plan?.status === 'confirmed' ? 'green' : plan?.status ? 'blue' : 'gray'}
              action={run.structuring_plan_id ? {
                label: run.status === 'planned' ? 'Confirm Plan' : 'View Plan',
                path: `/app/runs/${run.id}/plan`,
                primary: run.status === 'planned'
              } : null}
            />

            {/* Architecture */}
            <PhaseRow
              label="Architecture"
              status={run.architecture_status === 'confirmed' ? `Confirmed (${run.architecture_choice})` : (run.status === 'ready_for_architecture' ? 'Pending selection' : 'Not available')}
              statusColor={run.architecture_status === 'confirmed' ? 'green' : run.status === 'ready_for_architecture' ? 'amber' : 'gray'}
              action={run.status === 'ready_for_architecture' || run.architecture_status === 'confirmed' ? {
                label: run.status === 'ready_for_architecture' ? 'Review Architecture' : 'View Architecture',
                path: `/app/runs/${run.id}/organization-preview`,
                primary: run.status === 'ready_for_architecture'
              } : null}
            />

            {/* KPI Discovery */}
            <PhaseRow
              label="KPI Discovery"
              status={discovery?.status === 'confirmed' || run.kpi_status === 'confirmed' ? `Confirmed (${discovery?.kpis?.length || 0} KPIs)` : (run.architecture_status === 'confirmed' ? 'Ready to discover' : 'Not available')}
              statusColor={discovery?.status === 'confirmed' || run.kpi_status === 'confirmed' ? 'green' : run.architecture_status === 'confirmed' ? 'blue' : 'gray'}
              action={run.architecture_status === 'confirmed' ? {
                label: discovery?.status === 'confirmed' ? 'View KPIs' : 'Discover KPIs',
                path: `/app/runs/${run.id}/kpi-discovery`,
                primary: discovery?.status !== 'confirmed' && run.kpi_status !== 'confirmed'
              } : null}
            />

            {/* Analytics Preview */}
            <PhaseRow
              label="Analytics Preview"
              status={(discovery?.status === 'confirmed' || run.kpi_status === 'confirmed') ? 'Available' : 'Requires KPI confirmation'}
              statusColor={(discovery?.status === 'confirmed' || run.kpi_status === 'confirmed') ? 'green' : 'gray'}
              action={(discovery?.status === 'confirmed' || run.kpi_status === 'confirmed') ? {
                label: 'Preview Analytics',
                path: `/app/runs/${run.id}/analytics-preview`
              } : null}
            />

            {/* Build */}
            <PhaseRow
              label="Build App"
              status={build?.status || ((discovery?.status === 'confirmed' || run.kpi_status === 'confirmed') ? 'Ready to build' : 'Not available')}
              statusColor={build?.status === 'completed' ? 'green' : build?.status ? 'blue' : (discovery?.status === 'confirmed' || run.kpi_status === 'confirmed') ? 'indigo' : 'gray'}
              action={(discovery?.status === 'confirmed' || run.kpi_status === 'confirmed') ? {
                label: build?.status ? 'Continue Build' : 'Build App',
                path: `/app/runs/${run.id}/build`,
                primary: !build?.status
              } : null}
            />
          </div>
        </div>

        {/* Debug Panel (Admin Only) */}
        {isAdmin && (
          <RunDebugPanel run={run} plan={plan} discovery={discovery} build={build} />
        )}
      </div>
    </div>
  );
}

// Helper components
function StatCard({ label, value, icon }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-lg font-semibold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

function PhaseRow({ label, status, statusColor, action }) {
  const colorClasses = {
    green: 'bg-green-100 text-green-700',
    blue: 'bg-blue-100 text-blue-700',
    amber: 'bg-amber-100 text-amber-700',
    indigo: 'bg-indigo-100 text-indigo-700',
    gray: 'bg-gray-100 text-gray-500',
  };

  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <div className="flex items-center gap-4">
        <span className="font-medium text-gray-900 w-40">{label}</span>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClasses[statusColor]}`}>
          {status}
        </span>
      </div>
      {action && (
        <Link
          to={action.path}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            action.primary
              ? 'bg-indigo-600 text-white hover:bg-indigo-700'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}

function getStatusBadgeColor(status) {
  const colors = {
    pending: 'bg-gray-100 text-gray-700',
    scanning: 'bg-blue-100 text-blue-700',
    scanned: 'bg-green-100 text-green-700',
    approved: 'bg-green-100 text-green-700',
    planning: 'bg-yellow-100 text-yellow-700',
    planned: 'bg-purple-100 text-purple-700',
    ready_for_architecture: 'bg-amber-100 text-amber-700',
    ready: 'bg-indigo-100 text-indigo-700',
    kpis_confirmed: 'bg-teal-100 text-teal-700',
    building: 'bg-orange-100 text-orange-700',
    build_ready: 'bg-green-100 text-green-700',
    executing: 'bg-orange-100 text-orange-700',
    completed: 'bg-green-100 text-green-700',
    failed: 'bg-red-100 text-red-700',
  };
  return colors[status] || 'bg-gray-100 text-gray-700';
}
