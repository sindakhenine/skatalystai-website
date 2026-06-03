/**
 * Guided Tour System
 *
 * Interactive step-by-step tours with spotlight highlighting.
 * Features:
 * - Spotlight/highlight on specific elements
 * - Step-by-step flows with tooltips
 * - User preferences (completion tracking)
 * - Multiple tour types (data ingestion, connectors, context)
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../contexts/AuthContext';

// Tour step positions
const POSITIONS = {
  TOP: 'top',
  BOTTOM: 'bottom',
  LEFT: 'left',
  RIGHT: 'right',
  CENTER: 'center',
};

// Tour IDs for tracking completion
export const TOUR_IDS = {
  DATA_INGESTION: 'data-ingestion-tour',
  FIRST_UPLOAD: 'first-upload-tour',
  LOCAL_FOLDER: 'local-folder-tour',
  CONNECTOR_SETUP: 'connector-setup-tour',
  CONTEXT_OVERVIEW: 'context-overview-tour',
  DASHBOARD: 'dashboard-tour',
};

// Tour definitions
export const TOURS = {
  [TOUR_IDS.DATA_INGESTION]: {
    id: TOUR_IDS.DATA_INGESTION,
    name: 'Data Ingestion Tour',
    description: 'Learn how to ingest data from various sources',
    steps: [
      {
        target: '[data-tour="ingestion-cards"]',
        title: 'Choose Your Data Source',
        content: 'Start by selecting where your data lives. You can upload local files, connect to cloud storage, databases, or data lakes.',
        position: POSITIONS.BOTTOM,
        spotlight: true,
      },
      {
        target: '[data-tour="local-files"]',
        title: 'Local Files',
        content: 'Upload files directly from your computer. Drag and drop or click to browse. We support PDFs, documents, images, and more.',
        position: POSITIONS.RIGHT,
        spotlight: true,
      },
      {
        target: '[data-tour="cloud-storage"]',
        title: 'Cloud Storage',
        content: 'Connect to OneDrive, SharePoint, Google Drive, or Dropbox. Your credentials are securely stored and you control which folders to access.',
        position: POSITIONS.RIGHT,
        spotlight: true,
      },
      {
        target: '[data-tour="databases"]',
        title: 'Databases',
        content: 'Connect to PostgreSQL, MySQL, or SQL Server. Read-only access ensures your data is never modified.',
        position: POSITIONS.LEFT,
        spotlight: true,
      },
      {
        target: '[data-tour="capacity-gauge"]',
        title: 'Storage Capacity',
        content: 'Monitor your storage usage here. Free tier includes 1GB. Upgrade for more capacity.',
        position: POSITIONS.BOTTOM,
        spotlight: true,
      },
    ],
  },
  [TOUR_IDS.FIRST_UPLOAD]: {
    id: TOUR_IDS.FIRST_UPLOAD,
    name: 'First Upload Tour',
    description: 'Walk through your first file upload',
    steps: [
      {
        target: '[data-tour="dropzone"]',
        title: 'Drop Your Files Here',
        content: 'Drag files from your computer or click to browse. You can upload multiple files at once.',
        position: POSITIONS.CENTER,
        spotlight: true,
      },
      {
        target: '[data-tour="context-input"]',
        title: 'Add Context (Optional)',
        content: 'Tell us what this data is about. This helps with organization and search later.',
        position: POSITIONS.BOTTOM,
        spotlight: true,
      },
      {
        target: '[data-tour="process-button"]',
        title: 'Process Your Data',
        content: 'Click here to start processing. We\'ll extract text, analyze content, and organize your data automatically.',
        position: POSITIONS.TOP,
        spotlight: true,
      },
    ],
  },
  [TOUR_IDS.LOCAL_FOLDER]: {
    id: TOUR_IDS.LOCAL_FOLDER,
    name: 'Local Folder Tour',
    description: 'Learn how to select and analyze a local folder',
    steps: [
      {
        target: '[data-tour="local-folder-explain"]',
        title: 'How Local Folder Works',
        content: 'Local Folder uses your browser\'s native folder picker. You select a folder, preview the files, then confirm before processing.',
        position: POSITIONS.CENTER,
        spotlight: true,
      },
      {
        target: '[data-tour="select-folder-button"]',
        title: 'Select Your Folder',
        content: 'Click this button to open your operating system\'s folder picker. Navigate to the folder you want to analyze.',
        position: POSITIONS.BOTTOM,
        spotlight: true,
      },
      {
        target: '[data-tour="local-folder-preview"]',
        title: 'Preview Before Processing',
        content: 'After selecting a folder, you\'ll see a preview of all files. Review the list and confirm before we start processing.',
        position: POSITIONS.CENTER,
        spotlight: true,
      },
    ],
  },
  [TOUR_IDS.CONNECTOR_SETUP]: {
    id: TOUR_IDS.CONNECTOR_SETUP,
    name: 'Connector Setup Tour',
    description: 'Learn how to set up a connector',
    steps: [
      {
        target: '[data-tour="connector-auth"]',
        title: 'Authenticate',
        content: 'Sign in to your account. We use secure OAuth - your password is never stored with us.',
        position: POSITIONS.BOTTOM,
        spotlight: true,
      },
      {
        target: '[data-tour="connector-scope"]',
        title: 'Select Scope',
        content: 'Choose which folders or data you want to access. You have full control over what we can see.',
        position: POSITIONS.BOTTOM,
        spotlight: true,
      },
      {
        target: '[data-tour="connector-preview"]',
        title: 'Preview Before Ingestion',
        content: 'See exactly what will be processed before confirming. No surprises - full transparency.',
        position: POSITIONS.BOTTOM,
        spotlight: true,
      },
      {
        target: '[data-tour="connector-confirm"]',
        title: 'Confirm & Ingest',
        content: 'Review and confirm to start processing. You can cancel or modify scope at any time.',
        position: POSITIONS.TOP,
        spotlight: true,
      },
    ],
  },
  [TOUR_IDS.CONTEXT_OVERVIEW]: {
    id: TOUR_IDS.CONTEXT_OVERVIEW,
    name: 'Context Overview Tour',
    description: 'Understanding your data context',
    steps: [
      {
        target: '[data-tour="user-context"]',
        title: 'Your Context',
        content: 'This shows how well your data matches the intent you described. Higher percentage means better alignment.',
        position: POSITIONS.BOTTOM,
        spotlight: true,
      },
      {
        target: '[data-tour="system-contexts"]',
        title: 'System-Detected Contexts',
        content: 'Our AI analyzes your data and identifies themes. The top 5 contexts are shown, normalized to 100%.',
        position: POSITIONS.BOTTOM,
        spotlight: true,
      },
      {
        target: '[data-tour="file-contexts"]',
        title: 'Per-File Context',
        content: 'See which contexts apply to individual files. Useful for understanding content distribution.',
        position: POSITIONS.TOP,
        spotlight: true,
      },
    ],
  },
};

// Get completed tours from localStorage
const getCompletedTours = () => {
  try {
    const stored = localStorage.getItem('completedTours');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

// Save completed tour to localStorage
const markTourComplete = (tourId) => {
  try {
    const completed = getCompletedTours();
    if (!completed.includes(tourId)) {
      completed.push(tourId);
      localStorage.setItem('completedTours', JSON.stringify(completed));
    }
  } catch {
    // Ignore storage errors
  }
};

// Check if tour is completed
export const isTourCompleted = (tourId) => {
  return getCompletedTours().includes(tourId);
};

// Reset tour (for testing or user request)
export const resetTour = (tourId) => {
  try {
    const completed = getCompletedTours().filter(id => id !== tourId);
    localStorage.setItem('completedTours', JSON.stringify(completed));
  } catch {
    // Ignore storage errors
  }
};

// Reset all tours
export const resetAllTours = () => {
  try {
    localStorage.removeItem('completedTours');
  } catch {
    // Ignore storage errors
  }
};

/**
 * Spotlight Overlay Component
 * Creates a dark overlay with a spotlight cutout around the target element
 */
function SpotlightOverlay({ targetRect, padding = 8 }) {
  if (!targetRect) return null;

  const spotlightStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9998,
    pointerEvents: 'none',
  };

  // Create SVG mask for spotlight effect
  return (
    <div style={spotlightStyle}>
      <svg width="100%" height="100%" style={{ position: 'absolute' }}>
        <defs>
          <mask id="spotlight-mask">
            <rect width="100%" height="100%" fill="white" />
            <rect
              x={targetRect.left - padding}
              y={targetRect.top - padding}
              width={targetRect.width + padding * 2}
              height={targetRect.height + padding * 2}
              rx="8"
              fill="black"
            />
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="rgba(0, 0, 0, 0.6)"
          mask="url(#spotlight-mask)"
        />
      </svg>
    </div>
  );
}

/**
 * Tour Tooltip Component
 * Shows the current step information with navigation
 */
function TourTooltip({
  step,
  stepIndex,
  totalSteps,
  targetRect,
  onNext,
  onPrev,
  onSkip,
  onComplete,
}) {
  const tooltipRef = useRef(null);
  const [tooltipStyle, setTooltipStyle] = useState({});

  useEffect(() => {
    if (!targetRect || !tooltipRef.current) return;

    const tooltip = tooltipRef.current;
    const tooltipRect = tooltip.getBoundingClientRect();
    const padding = 16;
    const arrowSize = 8;

    let top, left;

    switch (step.position) {
      case POSITIONS.TOP:
        top = targetRect.top - tooltipRect.height - arrowSize - padding;
        left = targetRect.left + (targetRect.width - tooltipRect.width) / 2;
        break;
      case POSITIONS.BOTTOM:
        top = targetRect.bottom + arrowSize + padding;
        left = targetRect.left + (targetRect.width - tooltipRect.width) / 2;
        break;
      case POSITIONS.LEFT:
        top = targetRect.top + (targetRect.height - tooltipRect.height) / 2;
        left = targetRect.left - tooltipRect.width - arrowSize - padding;
        break;
      case POSITIONS.RIGHT:
        top = targetRect.top + (targetRect.height - tooltipRect.height) / 2;
        left = targetRect.right + arrowSize + padding;
        break;
      case POSITIONS.CENTER:
      default:
        top = targetRect.top + (targetRect.height - tooltipRect.height) / 2;
        left = targetRect.left + (targetRect.width - tooltipRect.width) / 2;
        break;
    }

    // Keep tooltip on screen
    const maxLeft = window.innerWidth - tooltipRect.width - padding;
    const maxTop = window.innerHeight - tooltipRect.height - padding;
    left = Math.max(padding, Math.min(left, maxLeft));
    top = Math.max(padding, Math.min(top, maxTop));

    setTooltipStyle({
      position: 'fixed',
      top: `${top}px`,
      left: `${left}px`,
      zIndex: 9999,
    });
  }, [targetRect, step.position]);

  const isLastStep = stepIndex === totalSteps - 1;
  const isFirstStep = stepIndex === 0;

  return (
    <div
      ref={tooltipRef}
      style={tooltipStyle}
      className="bg-white rounded-xl shadow-2xl border border-gray-200 max-w-sm animate-fade-in"
    >
      {/* Progress indicator */}
      <div className="px-4 pt-3 pb-2 border-b border-gray-100">
        <div className="flex items-center gap-1.5">
          {Array.from({ length: totalSteps }, (_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full flex-1 transition-colors ${
                i === stepIndex
                  ? 'bg-slate'
                  : i < stepIndex
                  ? 'bg-slate/50'
                  : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-1.5">
          Step {stepIndex + 1} of {totalSteps}
        </p>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-base font-semibold text-gray-900 mb-2">
          {step.title}
        </h3>
        <p className="text-sm text-gray-600 leading-relaxed">
          {step.content}
        </p>
      </div>

      {/* Actions */}
      <div className="px-4 pb-4 flex items-center justify-between">
        <button
          onClick={onSkip}
          className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          Skip tour
        </button>
        <div className="flex items-center gap-2">
          {!isFirstStep && (
            <button
              onClick={onPrev}
              className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Back
            </button>
          )}
          <button
            onClick={isLastStep ? onComplete : onNext}
            className="px-4 py-1.5 bg-slate text-white text-sm font-medium rounded-lg hover:bg-slate/90 transition-colors"
          >
            {isLastStep ? 'Finish' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Main Guided Tour Component
 * Manages the tour state and renders spotlight + tooltip
 */
export function GuidedTour({ tourId, onComplete, autoStart = false }) {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState(null);

  const tour = TOURS[tourId];

  // Find and measure target element
  const updateTargetRect = useCallback(() => {
    if (!tour || !isActive) return;

    const step = tour.steps[currentStep];
    if (!step?.target) {
      setTargetRect(null);
      return;
    }

    const element = document.querySelector(step.target);
    if (element) {
      const rect = element.getBoundingClientRect();
      setTargetRect({
        top: rect.top,
        left: rect.left,
        right: rect.right,
        bottom: rect.bottom,
        width: rect.width,
        height: rect.height,
      });

      // Scroll element into view if needed
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      // Element not found, skip to next step
      console.warn(`Tour target not found: ${step.target}`);
      setTargetRect(null);
    }
  }, [tour, isActive, currentStep]);

  // Auto-start if specified and tour not completed
  useEffect(() => {
    if (autoStart && !isTourCompleted(tourId)) {
      // Delay start to allow page to render
      const timer = setTimeout(() => {
        setIsActive(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [autoStart, tourId]);

  // Update target rect when step changes
  useEffect(() => {
    updateTargetRect();

    // Also update on scroll/resize
    const handleUpdate = () => updateTargetRect();
    window.addEventListener('scroll', handleUpdate, true);
    window.addEventListener('resize', handleUpdate);

    return () => {
      window.removeEventListener('scroll', handleUpdate, true);
      window.removeEventListener('resize', handleUpdate);
    };
  }, [updateTargetRect]);

  const handleNext = () => {
    if (currentStep < tour.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    setIsActive(false);
    setCurrentStep(0);
    markTourComplete(tourId);
    onComplete?.();
  };

  const handleComplete = () => {
    setIsActive(false);
    setCurrentStep(0);
    markTourComplete(tourId);
    onComplete?.();
  };

  // Public method to start the tour
  const startTour = () => {
    setCurrentStep(0);
    setIsActive(true);
  };

  if (!tour || !isActive) {
    return null;
  }

  const step = tour.steps[currentStep];

  return createPortal(
    <>
      {/* Spotlight overlay */}
      {step.spotlight && targetRect && (
        <SpotlightOverlay targetRect={targetRect} />
      )}

      {/* Click blocker (allows clicking on spotlight target) */}
      <div
        className="fixed inset-0 z-9997"
        style={{
          pointerEvents: step.spotlight && targetRect ? 'auto' : 'none',
        }}
        onClick={(e) => {
          // Check if click is outside target area
          if (targetRect) {
            const { clientX, clientY } = e;
            const padding = 8;
            const isInsideTarget =
              clientX >= targetRect.left - padding &&
              clientX <= targetRect.right + padding &&
              clientY >= targetRect.top - padding &&
              clientY <= targetRect.bottom + padding;

            if (!isInsideTarget) {
              e.preventDefault();
              e.stopPropagation();
            }
          }
        }}
      />

      {/* Tooltip */}
      {targetRect && (
        <TourTooltip
          step={step}
          stepIndex={currentStep}
          totalSteps={tour.steps.length}
          targetRect={targetRect}
          onNext={handleNext}
          onPrev={handlePrev}
          onSkip={handleSkip}
          onComplete={handleComplete}
        />
      )}
    </>,
    document.body
  );
}

/**
 * Tour Trigger Button
 * A button that starts a specific tour
 */
export function TourTrigger({ tourId, children, className = '' }) {
  const [showTour, setShowTour] = useState(false);

  const tour = TOURS[tourId];
  if (!tour) return null;

  return (
    <>
      <button
        onClick={() => setShowTour(true)}
        className={className || 'inline-flex items-center gap-2 text-sm text-slate hover:text-slate/80 transition-colors'}
      >
        {children || (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Take a tour
          </>
        )}
      </button>

      {showTour && (
        <GuidedTour
          tourId={tourId}
          autoStart={true}
          onComplete={() => setShowTour(false)}
        />
      )}
    </>
  );
}

/**
 * Tour Manager Context
 * Provides global tour management functionality
 */
const TourContext = React.createContext(null);

export function TourProvider({ children }) {
  const [activeTour, setActiveTour] = useState(null);
  const [pendingTours, setPendingTours] = useState([]);

  const startTour = useCallback((tourId) => {
    if (TOURS[tourId] && !isTourCompleted(tourId)) {
      setActiveTour(tourId);
    }
  }, []);

  const queueTour = useCallback((tourId) => {
    if (TOURS[tourId] && !isTourCompleted(tourId) && !pendingTours.includes(tourId)) {
      setPendingTours(prev => [...prev, tourId]);
    }
  }, [pendingTours]);

  const handleTourComplete = useCallback(() => {
    setActiveTour(null);

    // Start next pending tour if any
    if (pendingTours.length > 0) {
      const [next, ...rest] = pendingTours;
      setPendingTours(rest);
      setTimeout(() => startTour(next), 500);
    }
  }, [pendingTours, startTour]);

  const value = {
    activeTour,
    startTour,
    queueTour,
    isCompleted: isTourCompleted,
    resetTour,
    resetAllTours,
  };

  return (
    <TourContext.Provider value={value}>
      {children}
      {activeTour && (
        <GuidedTour
          tourId={activeTour}
          autoStart={true}
          onComplete={handleTourComplete}
        />
      )}
    </TourContext.Provider>
  );
}

export function useTour() {
  const context = React.useContext(TourContext);
  if (!context) {
    throw new Error('useTour must be used within a TourProvider');
  }
  return context;
}

/**
 * Help Menu Component
 * Shows available tours and their completion status
 */
export function HelpMenu({ onClose }) {
  const tours = Object.values(TOURS);
  const completedTours = getCompletedTours();

  return (
    <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50">
      <div className="p-3 bg-gray-50 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900">Guided Tours</h3>
        <p className="text-xs text-gray-500 mt-0.5">Learn how to use the platform</p>
      </div>

      <div className="p-2">
        {tours.map((tour) => {
          const isCompleted = completedTours.includes(tour.id);

          return (
            <TourTrigger key={tour.id} tourId={tour.id}>
              <div
                className="w-full p-3 rounded-lg hover:bg-gray-50 transition-colors text-left flex items-start gap-3"
                onClick={onClose}
              >
                <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                  isCompleted ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                }`}>
                  {isCompleted ? (
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    </svg>
                  )}
                </div>
                <div>
                  <span className="block text-sm font-medium text-gray-900">{tour.name}</span>
                  <span className="block text-xs text-gray-500 mt-0.5">{tour.description}</span>
                </div>
              </div>
            </TourTrigger>
          );
        })}
      </div>

      <div className="p-3 bg-gray-50 border-t border-gray-200">
        <button
          onClick={() => {
            resetAllTours();
            onClose?.();
          }}
          className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
        >
          Reset all tours
        </button>
      </div>
    </div>
  );
}

export default GuidedTour;
