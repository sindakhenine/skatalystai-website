import React, { useState } from 'react';

/**
 * RunDebugPanel Component (Admin-only)
 *
 * Shows detailed status information for debugging the run flow:
 * - run.status
 * - plan.status
 * - architecture_status
 * - kpi_status
 * - build.status
 * - preview.status
 */

export default function RunDebugPanel({ run, plan, discovery, build, inventory }) {
  const [expanded, setExpanded] = useState(false);

  if (!run) return null;

  // Parse inventory if it's a string
  const inv = typeof inventory === 'string' ? JSON.parse(inventory) : inventory;
  const invSummary = inv?.summary || {};

  const statuses = [
    {
      label: 'run.status',
      value: run.status,
      color: getStatusColor(run.status),
    },
    {
      label: 'inventory_approved',
      value: run.inventory_approved ? 'true' : 'false',
      color: run.inventory_approved ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600',
    },
    {
      label: 'structuring_plan_id',
      value: run.structuring_plan_id ? 'set' : 'null',
      color: run.structuring_plan_id ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600',
    },
    {
      label: 'plan.status',
      value: plan?.status || 'N/A',
      color: plan?.status ? getStatusColor(plan.status) : 'bg-gray-100 text-gray-500',
    },
    {
      label: 'architecture_status',
      value: run.architecture_status || 'pending',
      color: getStatusColor(run.architecture_status || 'pending'),
    },
    {
      label: 'architecture_choice',
      value: run.architecture_choice || 'N/A',
      color: run.architecture_choice ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500',
    },
    {
      label: 'deployment_choice',
      value: run.deployment_choice || 'N/A',
      color: run.deployment_choice ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500',
    },
    {
      label: 'kpi_status',
      value: run.kpi_status || discovery?.status || 'pending',
      color: getStatusColor(run.kpi_status || discovery?.status || 'pending'),
    },
    {
      label: 'kpi_discovery_id',
      value: run.kpi_discovery_id ? 'set' : 'null',
      color: run.kpi_discovery_id ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600',
    },
    {
      label: 'build.status',
      value: build?.status || 'N/A',
      color: build?.status ? getStatusColor(build.status) : 'bg-gray-100 text-gray-500',
    },
  ];

  return (
    <div className="mt-4">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-700 font-mono"
      >
        <svg
          className={`w-4 h-4 transition-transform ${expanded ? 'rotate-90' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        Debug Panel (Admin)
      </button>

      {expanded && (
        <div className="mt-2 p-4 bg-gray-900 rounded-lg text-xs font-mono">
          <div className="grid grid-cols-2 gap-2">
            {statuses.map((item) => (
              <div key={item.label} className="flex items-center justify-between bg-gray-800 rounded px-2 py-1">
                <span className="text-gray-400">{item.label}:</span>
                <span className={`px-2 py-0.5 rounded ${item.color}`}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>

          {/* Raw run object */}
          <details className="mt-4">
            <summary className="text-gray-400 cursor-pointer hover:text-gray-300">
              Raw run object
            </summary>
            <pre className="mt-2 p-2 bg-gray-800 rounded overflow-auto max-h-48 text-green-400">
              {JSON.stringify({
                id: run.id,
                status: run.status,
                inventory_approved: run.inventory_approved,
                structuring_plan_id: run.structuring_plan_id,
                architecture_status: run.architecture_status,
                architecture_choice: run.architecture_choice,
                deployment_choice: run.deployment_choice,
                kpi_status: run.kpi_status,
                kpi_discovery_id: run.kpi_discovery_id,
              }, null, 2)}
            </pre>
          </details>

          {/* Pipeline Trace */}
          <div className="mt-4 p-3 bg-gray-800 rounded">
            <p className="text-cyan-400 mb-2">Pipeline Trace:</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-gray-700 rounded px-2 py-1">
                <span className="text-gray-400">current_step:</span>
                <span className="text-white ml-2">{run.currentStep || run.current_step || 'N/A'}</span>
              </div>
              <div className="bg-gray-700 rounded px-2 py-1">
                <span className="text-gray-400">progress:</span>
                <span className="text-white ml-2">{run.progress ?? 'N/A'}%</span>
              </div>
              <div className="bg-gray-700 rounded px-2 py-1">
                <span className="text-gray-400">files:</span>
                <span className={`ml-2 ${invSummary.totalFiles > 0 ? 'text-green-400' : 'text-amber-400'}`}>
                  {invSummary.totalFiles ?? (inv?.files?.length ?? 'N/A')}
                </span>
              </div>
              <div className="bg-gray-700 rounded px-2 py-1">
                <span className="text-gray-400">tables:</span>
                <span className={`ml-2 ${invSummary.totalTables > 0 ? 'text-green-400' : 'text-amber-400'}`}>
                  {invSummary.totalTables ?? (inv?.tables?.length ?? 'N/A')}
                </span>
              </div>
              <div className="bg-gray-700 rounded px-2 py-1">
                <span className="text-gray-400">rows:</span>
                <span className="text-white ml-2">{invSummary.totalRows ?? 'N/A'}</span>
              </div>
              <div className="bg-gray-700 rounded px-2 py-1">
                <span className="text-gray-400">plan_exists:</span>
                <span className={`ml-2 ${run.structuring_plan_id || run.structuringPlanId ? 'text-green-400' : 'text-amber-400'}`}>
                  {run.structuring_plan_id || run.structuringPlanId ? 'true' : 'false'}
                </span>
              </div>
            </div>
            {/* File Types Breakdown */}
            {invSummary.filesByType && Object.keys(invSummary.filesByType).length > 0 && (
              <div className="mt-2">
                <span className="text-gray-400 text-xs">filesByType:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {Object.entries(invSummary.filesByType).map(([type, count]) => (
                    <span
                      key={type}
                      className={`px-1.5 py-0.5 rounded text-xs ${
                        type === 'other' || type === 'unknown'
                          ? 'bg-red-800 text-red-200'
                          : 'bg-green-800 text-green-200'
                      }`}
                    >
                      {type}: {count}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {/* Timestamps */}
            <div className="mt-2 text-xs text-gray-400">
              <div>scan_started: {run.scanStartedAt || run.scan_started_at || 'N/A'}</div>
              <div>scan_completed: {run.scanCompletedAt || run.scan_completed_at || 'N/A'}</div>
              <div>plan_generated: {run.planGeneratedAt || run.plan_generated_at || 'N/A'}</div>
              <div>arch_confirmed: {run.architecture_confirmed_at || 'N/A'}</div>
            </div>
          </div>

          {/* Navigation helper */}
          <div className="mt-4 p-2 bg-gray-800 rounded">
            <p className="text-amber-400 mb-2">Quick Navigation:</p>
            <div className="flex flex-wrap gap-2">
              {[
                { path: 'inventory', label: 'Inventory' },
                { path: 'plan', label: 'Plan' },
                { path: 'organization-preview', label: 'Architecture' },
                { path: 'kpi-discovery', label: 'KPI' },
                { path: 'analytics-preview', label: 'Analytics' },
                { path: 'build', label: 'Build' },
                { path: 'summary', label: 'Summary' },
              ].map((link) => (
                <a
                  key={link.path}
                  href={`/app/runs/${run.id}/${link.path}`}
                  className="px-2 py-1 bg-gray-700 text-blue-400 rounded hover:bg-gray-600 transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function getStatusColor(status) {
  const colors = {
    pending: 'bg-gray-100 text-gray-700',
    scanning: 'bg-blue-100 text-blue-700',
    scanned: 'bg-green-100 text-green-700',
    approved: 'bg-green-100 text-green-700',
    planning: 'bg-yellow-100 text-yellow-700',
    planned: 'bg-purple-100 text-purple-700',
    draft: 'bg-gray-100 text-gray-700',
    reviewed: 'bg-blue-100 text-blue-700',
    confirmed: 'bg-green-100 text-green-700',
    ready_for_architecture: 'bg-amber-100 text-amber-700',
    ready: 'bg-indigo-100 text-indigo-700',
    kpis_confirmed: 'bg-teal-100 text-teal-700',
    in_progress: 'bg-blue-100 text-blue-700',
    proposed: 'bg-purple-100 text-purple-700',
    selecting: 'bg-gray-100 text-gray-700',
    designing: 'bg-blue-100 text-blue-700',
    confirming: 'bg-amber-100 text-amber-700',
    building: 'bg-orange-100 text-orange-700',
    build_ready: 'bg-green-100 text-green-700',
    build_approved: 'bg-green-100 text-green-700',
    executing: 'bg-orange-100 text-orange-700',
    completed: 'bg-green-100 text-green-700',
    failed: 'bg-red-100 text-red-700',
  };
  return colors[status] || 'bg-gray-100 text-gray-700';
}
