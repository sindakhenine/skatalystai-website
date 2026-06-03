/**
 * Guided Ingestion Overlay Component
 *
 * A reusable overlay for guiding users through data ingestion processes.
 * Supports step definitions, highlighted elements, checkboxes for consent,
 * and cancel/resume functionality.
 */

import { useState, useEffect, useCallback } from 'react';

/**
 * Step Types for the guided flow
 */
export const StepTypes = {
  EXPLANATION: 'explanation',    // Information step with text
  GUIDANCE: 'guidance',          // Animated guidance highlighting UI elements
  ACTION: 'action',              // Step where user takes action (component rendered)
  CONFIRMATION: 'confirmation',  // Checkboxes to confirm understanding
};

/**
 * Icons for different ingestion types
 */
const IngestionIcons = {
  local: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
    </svg>
  ),
  cloud: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
    </svg>
  ),
  database: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
    </svg>
  ),
  server: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
    </svg>
  ),
  warning: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  shield: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
};

/**
 * Progress indicator for multi-step flows - matches dashboard StepIndicator
 */
function StepProgress({ currentStep, totalSteps, stepLabels }) {
  return (
    <div className="flex items-center justify-center mb-6">
      {Array.from({ length: totalSteps }, (_, i) => (
        <div key={i} className="flex items-center">
          <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-all duration-300 ${
            i < currentStep
              ? 'bg-success text-white shadow-sm'
              : i === currentStep
                ? 'bg-slate text-white shadow-sm'
                : 'bg-gray-100 text-gray-400 border-2 border-gray-200'
          }`}>
            {i < currentStep ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              i + 1
            )}
          </div>
          {i < totalSteps - 1 && (
            <div className={`w-12 h-1 mx-1 rounded-full transition-all duration-300 ${
              i < currentStep ? 'bg-success' : 'bg-gray-200'
            }`} />
          )}
        </div>
      ))}
    </div>
  );
}

/**
 * Confirmation checkbox component - matches dashboard form patterns
 */
function ConfirmationCheckbox({ id, label, description, checked, onChange }) {
  return (
    <label className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 border border-gray-100 transition-colors">
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 w-5 h-5 text-slate rounded border-gray-300 focus:ring-slate/20"
      />
      <div>
        <span className="font-medium text-gray-900">{label}</span>
        {description && (
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        )}
      </div>
    </label>
  );
}

/**
 * Animated guidance step with pulsing highlight - uses slate instead of blue
 */
function GuidanceAnimation({ animation, message }) {
  return (
    <div className="flex flex-col items-center gap-6 py-8">
      <div className="relative">
        <div className="absolute inset-0 animate-ping bg-slate/20 rounded-full opacity-50" />
        <div className="relative w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center text-slate">
          {animation === 'folder' && IngestionIcons.local}
          {animation === 'cloud' && IngestionIcons.cloud}
          {animation === 'database' && IngestionIcons.database}
          {animation === 'server' && IngestionIcons.server}
          {animation === 'shield' && IngestionIcons.shield}
          {!animation && IngestionIcons.warning}
        </div>
      </div>
      {message && (
        <p className="text-center text-gray-600 max-w-md">{message}</p>
      )}
    </div>
  );
}

/**
 * Main Guided Ingestion Overlay Component
 */
function GuidedIngestionOverlay({
  isOpen,
  onClose,
  onComplete,
  title,
  subtitle,
  icon,
  steps,
  initialStep = 0,
  canResumeLater = true,
  persistKey = null,  // For localStorage persistence
}) {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [confirmations, setConfirmations] = useState({});
  const [actionCompleted, setActionCompleted] = useState({});

  // Load saved progress if persistKey provided
  useEffect(() => {
    if (persistKey && isOpen) {
      try {
        const saved = localStorage.getItem(`guided-ingestion-${persistKey}`);
        if (saved) {
          const { step, confirmations: savedConfirmations } = JSON.parse(saved);
          setCurrentStep(step);
          setConfirmations(savedConfirmations || {});
        }
      } catch (e) {
        console.warn('Failed to load saved progress:', e);
      }
    }
  }, [persistKey, isOpen]);

  // Save progress when step changes
  useEffect(() => {
    if (persistKey && isOpen) {
      try {
        localStorage.setItem(`guided-ingestion-${persistKey}`, JSON.stringify({
          step: currentStep,
          confirmations,
        }));
      } catch (e) {
        console.warn('Failed to save progress:', e);
      }
    }
  }, [persistKey, isOpen, currentStep, confirmations]);

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  // Check if current step requirements are met
  const canProceed = useCallback(() => {
    if (!currentStepData) return false;

    switch (currentStepData.type) {
      case StepTypes.CONFIRMATION:
        // All checkboxes must be checked
        const checkboxes = currentStepData.checkboxes || [];
        return checkboxes.every(cb => confirmations[cb.id]);

      case StepTypes.ACTION:
        // Action must be marked as completed
        return actionCompleted[currentStep] || currentStepData.optional;

      case StepTypes.EXPLANATION:
      case StepTypes.GUIDANCE:
      default:
        return true;
    }
  }, [currentStepData, confirmations, actionCompleted, currentStep]);

  const handleNext = () => {
    if (isLastStep) {
      // Clear saved progress
      if (persistKey) {
        localStorage.removeItem(`guided-ingestion-${persistKey}`);
      }
      onComplete?.();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleResumeLater = () => {
    // Progress is already saved via useEffect
    onClose?.();
  };

  const handleCancel = () => {
    // Clear saved progress
    if (persistKey) {
      localStorage.removeItem(`guided-ingestion-${persistKey}`);
    }
    setCurrentStep(0);
    setConfirmations({});
    setActionCompleted({});
    onClose?.();
  };

  const handleConfirmationChange = (checkboxId, checked) => {
    setConfirmations(prev => ({ ...prev, [checkboxId]: checked }));
  };

  const handleActionComplete = () => {
    setActionCompleted(prev => ({ ...prev, [currentStep]: true }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 transition-opacity" />

      {/* Modal - matches dashboard modal pattern */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl transform transition-all border border-gray-200">
          {/* Header */}
          <div className="border-b border-gray-100 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {icon && (
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-slate">
                    {IngestionIcons[icon] || icon}
                  </div>
                )}
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
                  {subtitle && (
                    <p className="text-sm text-gray-500">{subtitle}</p>
                  )}
                </div>
              </div>
              <button
                onClick={handleCancel}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Progress */}
            {steps.length > 1 && (
              <div className="mt-4">
                <StepProgress
                  currentStep={currentStep}
                  totalSteps={steps.length}
                  stepLabels={steps.map(s => s.label)}
                />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="px-6 py-6">
            {/* Step Label */}
            {currentStepData?.label && (
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {currentStepData.label}
              </h3>
            )}

            {/* Step Content based on type */}
            {currentStepData?.type === StepTypes.EXPLANATION && (
              <div className="space-y-4">
                {currentStepData.content && (
                  <div className="prose prose-gray max-w-none">
                    {typeof currentStepData.content === 'string' ? (
                      <p className="text-gray-600">{currentStepData.content}</p>
                    ) : (
                      currentStepData.content
                    )}
                  </div>
                )}
                {currentStepData.highlights && (
                  <ul className="space-y-2">
                    {currentStepData.highlights.map((highlight, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-gray-600">
                        <svg className="w-5 h-5 text-slate mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {currentStepData?.type === StepTypes.GUIDANCE && (
              <GuidanceAnimation
                animation={currentStepData.animation}
                message={currentStepData.message}
              />
            )}

            {currentStepData?.type === StepTypes.CONFIRMATION && (
              <div className="space-y-3">
                {currentStepData.description && (
                  <p className="text-gray-600 mb-4">{currentStepData.description}</p>
                )}

                {/* Agree All button - only show if more than 1 checkbox */}
                {currentStepData.checkboxes?.length > 1 && (
                  <div className="flex justify-end mb-2">
                    <button
                      onClick={() => {
                        const allChecked = currentStepData.checkboxes.every(cb => confirmations[cb.id]);
                        const newState = {};
                        currentStepData.checkboxes.forEach(cb => {
                          newState[cb.id] = !allChecked;
                        });
                        setConfirmations(prev => ({ ...prev, ...newState }));
                      }}
                      className="text-sm text-slate hover:text-slate/80 font-medium transition-colors"
                    >
                      {currentStepData.checkboxes.every(cb => confirmations[cb.id])
                        ? 'Uncheck All'
                        : 'Agree All'}
                    </button>
                  </div>
                )}

                {currentStepData.checkboxes?.map((checkbox) => (
                  <ConfirmationCheckbox
                    key={checkbox.id}
                    id={checkbox.id}
                    label={checkbox.label}
                    description={checkbox.description}
                    checked={confirmations[checkbox.id] || false}
                    onChange={(checked) => handleConfirmationChange(checkbox.id, checked)}
                  />
                ))}
              </div>
            )}

            {currentStepData?.type === StepTypes.ACTION && (
              <div>
                {currentStepData.component ? (
                  currentStepData.component({
                    onComplete: handleActionComplete,
                    isComplete: actionCompleted[currentStep],
                  })
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    Action component not provided
                  </p>
                )}
              </div>
            )}

            {/* Warning/Info Box - uses slate-based styling */}
            {currentStepData?.warning && (
              <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="text-slate flex-shrink-0">
                    {IngestionIcons.warning}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {currentStepData.warning.title || 'Important'}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {currentStepData.warning.message}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-100 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                {canResumeLater && currentStep > 0 && (
                  <button
                    onClick={handleResumeLater}
                    className="text-sm text-gray-500 hover:text-slate transition-colors"
                  >
                    Save & Resume Later
                  </button>
                )}
              </div>
              <div className="flex items-center gap-3">
                {currentStep > 0 && (
                  <button
                    onClick={handleBack}
                    className="px-4 py-2 text-gray-500 hover:text-gray-700 font-medium transition-colors"
                  >
                    Back
                  </button>
                )}
                <button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                    canProceed()
                      ? 'bg-slate text-white hover:bg-slate/90'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {isLastStep ? 'Complete' : 'Continue'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GuidedIngestionOverlay;
export { IngestionIcons, StepProgress, ConfirmationCheckbox, GuidanceAnimation };
