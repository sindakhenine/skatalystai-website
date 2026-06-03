import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * RunTimeline Component
 *
 * Shows the current run status and next CTA button.
 * Displays a visual timeline of all phases with the current step highlighted.
 *
 * Flow: Runs → Inventory → Approve → Plan → Confirm Plan → Architecture Preview
 *       → Confirm Architecture → KPI Discovery → Confirm KPIs → Analytics Preview → Build App
 */

// Timeline steps definition
const TIMELINE_STEPS = [
  { id: 'inventory', label: 'Inventory', statuses: ['pending', 'scanning', 'scanned'], path: 'inventory' },
  { id: 'plan', label: 'Plan', statuses: ['approved', 'planning', 'planned'], path: 'plan' },
  { id: 'architecture', label: 'Architecture', statuses: ['ready_for_architecture'], path: 'organization-preview' },
  { id: 'kpi', label: 'KPI Discovery', statuses: ['ready'], path: 'kpi-discovery' },
  { id: 'analytics', label: 'Analytics Preview', statuses: ['kpis_confirmed'], path: 'analytics-preview' },
  { id: 'build', label: 'Build App', statuses: ['building', 'build_ready', 'completed'], path: 'build' },
];

// Status to step mapping
const getStepFromStatus = (status, kpiStatus, architectureStatus) => {
  // Special handling for kpis_confirmed
  if (status === 'ready' && kpiStatus === 'confirmed') {
    return 'analytics';
  }
  if (status === 'ready' && architectureStatus === 'confirmed') {
    return 'kpi';
  }

  for (const step of TIMELINE_STEPS) {
    if (step.statuses.includes(status)) {
      return step.id;
    }
  }
  return 'inventory';
};

// Get next action based on current state
const getNextAction = (run) => {
  const { status, inventory_approved, structuring_plan_id, architecture_status, kpi_status } = run;

  // Scanning in progress
  if (status === 'scanning') {
    return { label: 'Scanning...', disabled: true, path: 'inventory' };
  }

  // Scanned but not approved
  if (status === 'scanned' && !inventory_approved) {
    return { label: 'Approve Inventory', path: 'inventory', primary: true };
  }

  // Approved/Planning
  if (status === 'approved' || status === 'planning') {
    return { label: 'Generating Plan...', disabled: true, path: 'plan' };
  }

  // Planned - need to confirm plan
  if (status === 'planned') {
    return { label: 'Confirm Plan', path: 'plan', primary: true };
  }

  // Ready for architecture
  if (status === 'ready_for_architecture') {
    return { label: 'Review Architecture', path: 'organization-preview', primary: true };
  }

  // Ready (architecture confirmed) - need KPI discovery
  if (status === 'ready' && architecture_status === 'confirmed' && kpi_status !== 'confirmed') {
    return { label: 'Discover KPIs', path: 'kpi-discovery', primary: true };
  }

  // KPIs confirmed - can view analytics preview
  if ((status === 'ready' || status === 'kpis_confirmed') && kpi_status === 'confirmed') {
    return { label: 'Preview Analytics', path: 'analytics-preview', primary: true };
  }

  // Building
  if (status === 'building' || status === 'build_ready') {
    return { label: 'Continue Build', path: 'build', primary: true };
  }

  // Completed
  if (status === 'completed') {
    return { label: 'View Summary', path: 'summary', primary: false };
  }

  // Default: View Inventory
  return { label: 'View Inventory', path: 'inventory', primary: false };
};

// Step status for visual display
const getStepStatus = (stepId, currentStepId, stepIndex, currentStepIndex) => {
  if (stepIndex < currentStepIndex) return 'completed';
  if (stepIndex === currentStepIndex) return 'current';
  return 'pending';
};

export default function RunTimeline({ run, compact = false }) {
  const navigate = useNavigate();

  if (!run) return null;

  const currentStepId = getStepFromStatus(run.status, run.kpi_status, run.architecture_status);
  const currentStepIndex = TIMELINE_STEPS.findIndex(s => s.id === currentStepId);
  const nextAction = getNextAction(run);

  const handleAction = () => {
    if (!nextAction.disabled && nextAction.path) {
      navigate(`/app/runs/${run.id}/${nextAction.path}`);
    }
  };

  if (compact) {
    // Compact version for RunsIndex cards
    return (
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm">
          {TIMELINE_STEPS.map((step, idx) => {
            const stepStatus = getStepStatus(step.id, currentStepId, idx, currentStepIndex);
            return (
              <React.Fragment key={step.id}>
                <div
                  className={`w-2 h-2 rounded-full transition-colors ${
                    stepStatus === 'completed' ? 'bg-green-500' :
                    stepStatus === 'current' ? 'bg-indigo-500 ring-2 ring-indigo-200' :
                    'bg-gray-300'
                  }`}
                  title={step.label}
                />
                {idx < TIMELINE_STEPS.length - 1 && (
                  <div className={`w-4 h-0.5 ${
                    stepStatus === 'completed' ? 'bg-green-500' : 'bg-gray-200'
                  }`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
        <button
          onClick={handleAction}
          disabled={nextAction.disabled}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            nextAction.primary
              ? 'bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-gray-300'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:text-gray-400'
          } disabled:cursor-not-allowed`}
        >
          {nextAction.label}
        </button>
      </div>
    );
  }

  // Full timeline view
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Run Progress</h3>

      {/* Timeline */}
      <div className="relative mb-8">
        {/* Progress bar background */}
        <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 rounded-full" />

        {/* Progress bar fill */}
        <div
          className="absolute top-5 left-0 h-1 bg-indigo-500 rounded-full transition-all duration-500"
          style={{ width: `${(currentStepIndex / (TIMELINE_STEPS.length - 1)) * 100}%` }}
        />

        {/* Steps */}
        <div className="relative flex justify-between">
          {TIMELINE_STEPS.map((step, idx) => {
            const stepStatus = getStepStatus(step.id, currentStepId, idx, currentStepIndex);
            const isClickable = stepStatus === 'completed' || stepStatus === 'current';

            return (
              <div
                key={step.id}
                className="flex flex-col items-center"
                style={{ width: `${100 / TIMELINE_STEPS.length}%` }}
              >
                {/* Step circle */}
                <button
                  onClick={() => isClickable && navigate(`/app/runs/${run.id}/${step.path}`)}
                  disabled={!isClickable}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    stepStatus === 'completed'
                      ? 'bg-green-500 text-white cursor-pointer hover:bg-green-600'
                      : stepStatus === 'current'
                      ? 'bg-indigo-500 text-white ring-4 ring-indigo-100 cursor-pointer hover:bg-indigo-600'
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {stepStatus === 'completed' ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span className="text-sm font-semibold">{idx + 1}</span>
                  )}
                </button>

                {/* Step label */}
                <span className={`mt-2 text-xs font-medium text-center ${
                  stepStatus === 'current' ? 'text-indigo-600' :
                  stepStatus === 'completed' ? 'text-green-600' :
                  'text-gray-400'
                }`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Current Status & Next Action */}
      <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">Current Status</p>
          <p className="font-semibold text-gray-900">
            {TIMELINE_STEPS[currentStepIndex]?.label || 'Unknown'} - {run.status}
          </p>
        </div>
        <button
          onClick={handleAction}
          disabled={nextAction.disabled}
          className={`px-6 py-3 font-medium rounded-lg transition-colors flex items-center gap-2 ${
            nextAction.primary
              ? 'bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-gray-300'
              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:text-gray-400'
          } disabled:cursor-not-allowed`}
        >
          {nextAction.disabled && (
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          )}
          {nextAction.label}
          {!nextAction.disabled && (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
