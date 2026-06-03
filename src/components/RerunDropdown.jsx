import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useQuota } from '../hooks/useQuota';
import ContextSelector from './ContextSelector';
import PaywallModal from './PaywallModal';

// Icons
const PlayIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

const RefreshIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

const DocumentTextIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const CloseIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

// Re-run modal with context selection
function RerunModal({ run, onRun, onClose }) {
  const { t } = useTranslation();
  const [contextSelection, setContextSelection] = useState(null);
  const [running, setRunning] = useState(false);

  const handleRun = async () => {
    setRunning(true);
    try {
      await onRun({
        runId: run.id,
        context: contextSelection,
      });
      onClose();
    } catch (err) {
      console.error('Re-run error:', err);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-lg bg-light-surface dark:bg-dark-surface rounded-2xl shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-light-border dark:border-dark-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-ion/10 flex items-center justify-center text-ion">
                <RefreshIcon />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-text-primary dark:text-text-dark-primary">
                  {t('rerun.title')}
                </h2>
                <p className="text-sm text-text-secondary dark:text-text-dark-secondary">
                  {run?.name || t('rerun.previousRun')}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-text-secondary hover:text-text-primary dark:text-text-dark-secondary dark:hover:text-text-dark-primary"
            >
              <CloseIcon />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Previous context info */}
            {run?.context_text && (
              <div className="mb-6 p-4 bg-light-soft dark:bg-dark-soft rounded-xl">
                <p className="text-xs text-text-secondary dark:text-text-dark-secondary mb-2">
                  {t('rerun.previousContext')}
                </p>
                <p className="text-sm text-text-primary dark:text-text-dark-primary font-mono">
                  {run.context_text.length > 200
                    ? run.context_text.substring(0, 200) + '...'
                    : run.context_text}
                </p>
              </div>
            )}

            {/* Context selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-text-primary dark:text-text-dark-primary mb-2">
                {t('rerun.selectContext')}
              </label>
              <ContextSelector
                value={contextSelection}
                onChange={setContextSelection}
                placeholder={t('rerun.contextPlaceholder')}
              />
            </div>

            {/* Info */}
            <div className="p-4 bg-info-bg rounded-xl">
              <p className="text-sm text-info">
                {t('rerun.info')}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 p-6 border-t border-light-border dark:border-dark-border">
            <button
              onClick={onClose}
              className="px-4 py-2 text-text-secondary dark:text-text-dark-secondary font-medium hover:text-text-primary dark:hover:text-text-dark-primary transition-colors"
            >
              {t('common.cancel')}
            </button>
            <button
              onClick={handleRun}
              disabled={running}
              className="flex items-center gap-2 px-6 py-2 bg-slate text-white font-medium rounded-button shadow-button hover:bg-slate-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {running ? (
                <>
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {t('rerun.running')}
                </>
              ) : (
                <>
                  <PlayIcon />
                  {t('rerun.startRun')}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main RerunDropdown component
export default function RerunDropdown({ run, onRerun, variant = 'button' }) {
  const { t } = useTranslation();
  const { authFetch } = useAuth();
  const { checkQuota, showPaywall, paywallError, closePaywall, usage } = useQuota();
  const [isOpen, setIsOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleQuickRerun = async () => {
    if (!checkQuota('runs')) return;

    setIsOpen(false);
    try {
      await onRerun?.({
        runId: run.id,
        context: run.context_text ? { type: 'previous', text: run.context_text } : null,
      });
    } catch (err) {
      console.error('Quick re-run error:', err);
    }
  };

  const handleRerunWithContext = () => {
    if (!checkQuota('runs')) return;
    setIsOpen(false);
    setShowModal(true);
  };

  const handleModalRun = async (options) => {
    await onRerun?.(options);
  };

  // Simple button variant
  if (variant === 'simple') {
    return (
      <>
        <button
          onClick={handleRerunWithContext}
          className="flex items-center gap-2 px-4 py-2 text-ion hover:bg-ion/10 rounded-button transition-colors"
        >
          <RefreshIcon />
          {t('rerun.runAgain')}
        </button>

        {showModal && (
          <RerunModal
            run={run}
            onRun={handleModalRun}
            onClose={() => setShowModal(false)}
          />
        )}

        <PaywallModal
          isOpen={showPaywall}
          onClose={closePaywall}
          errorCode={paywallError}
          currentUsage={usage}
        />
      </>
    );
  }

  // Dropdown button variant
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-slate text-white font-medium rounded-button shadow-button hover:bg-slate-hover transition-colors"
      >
        <RefreshIcon />
        {t('rerun.runAgain')}
        <ChevronDownIcon />
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute right-0 z-10 mt-2 w-64 bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-xl shadow-lg overflow-hidden">
          {/* Quick re-run with same context */}
          {run?.context_text && (
            <button
              onClick={handleQuickRerun}
              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-light-soft dark:hover:bg-dark-soft transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-success-bg flex items-center justify-center text-success">
                <PlayIcon />
              </div>
              <div>
                <p className="font-medium text-text-primary dark:text-text-dark-primary">
                  {t('rerun.quickRerun')}
                </p>
                <p className="text-xs text-text-secondary dark:text-text-dark-secondary">
                  {t('rerun.quickRerunDesc')}
                </p>
              </div>
            </button>
          )}

          {/* Re-run with different context */}
          <button
            onClick={handleRerunWithContext}
            className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-light-soft dark:hover:bg-dark-soft transition-colors ${
              run?.context_text ? 'border-t border-light-border dark:border-dark-border' : ''
            }`}
          >
            <div className="w-8 h-8 rounded-lg bg-ion/10 flex items-center justify-center text-ion">
              <DocumentTextIcon />
            </div>
            <div>
              <p className="font-medium text-text-primary dark:text-text-dark-primary">
                {t('rerun.withContext')}
              </p>
              <p className="text-xs text-text-secondary dark:text-text-dark-secondary">
                {t('rerun.withContextDesc')}
              </p>
            </div>
          </button>

          {/* Quick re-run without context */}
          <button
            onClick={() => {
              if (!checkQuota('runs')) return;
              setIsOpen(false);
              onRerun?.({ runId: run.id, context: null });
            }}
            className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-light-soft dark:hover:bg-dark-soft transition-colors border-t border-light-border dark:border-dark-border"
          >
            <div className="w-8 h-8 rounded-lg bg-light-soft dark:bg-dark-soft flex items-center justify-center text-text-secondary">
              <RefreshIcon />
            </div>
            <div>
              <p className="font-medium text-text-primary dark:text-text-dark-primary">
                {t('rerun.noContext')}
              </p>
              <p className="text-xs text-text-secondary dark:text-text-dark-secondary">
                {t('rerun.noContextDesc')}
              </p>
            </div>
          </button>
        </div>
      )}

      {/* Re-run modal */}
      {showModal && (
        <RerunModal
          run={run}
          onRun={handleModalRun}
          onClose={() => setShowModal(false)}
        />
      )}

      {/* Paywall modal */}
      <PaywallModal
        isOpen={showPaywall}
        onClose={closePaywall}
        errorCode={paywallError}
        currentUsage={usage}
      />
    </div>
  );
}
