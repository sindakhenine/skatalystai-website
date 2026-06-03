import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useQuota } from '../hooks/useQuota';
import PaywallModal from './PaywallModal';

// Icons
const ChevronDownIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

const DocumentTextIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const PlusIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const StarIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
  </svg>
);

const LockIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

const CloseIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

// Context input modes
const MODES = {
  NONE: 'none',
  NEW: 'new',
  SAVED: 'saved',
  MULTIPLE: 'multiple',
};

// Context chip component
function ContextChip({ context, onRemove }) {
  return (
    <div className="inline-flex items-center gap-1 px-2 py-1 bg-ion/10 text-ion rounded-full text-sm">
      <span className="truncate max-w-[150px]">{context.name || context.text?.substring(0, 20) + '...'}</span>
      {onRemove && (
        <button
          onClick={() => onRemove(context)}
          className="hover:bg-ion/20 rounded-full p-0.5"
        >
          <CloseIcon />
        </button>
      )}
    </div>
  );
}

// Main ContextSelector component
export default function ContextSelector({
  value,
  onChange,
  multiple = false,
  showMultipleOption = true,
  placeholder,
}) {
  const { t } = useTranslation();
  const { authFetch } = useAuth();
  const { usage, showPaywall, paywallError, closePaywall } = useQuota();
  const [mode, setMode] = useState(MODES.NONE);
  const [savedContexts, setSavedContexts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [newContextText, setNewContextText] = useState('');
  const [selectedContexts, setSelectedContexts] = useState([]);
  const [showPaywallModal, setShowPaywallModal] = useState(false);
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

  // Fetch saved contexts when opening saved mode
  useEffect(() => {
    const fetchContexts = async () => {
      if (mode === MODES.SAVED || mode === MODES.MULTIPLE) {
        setLoading(true);
        try {
          const response = await authFetch('/contexts');
          if (response.ok) {
            const data = await response.json();
            setSavedContexts(data.contexts || data || []);
          }
        } catch (err) {
          console.error('Failed to fetch contexts:', err);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchContexts();
  }, [mode, authFetch]);

  // Update parent when selection changes
  useEffect(() => {
    if (mode === MODES.NEW && newContextText) {
      onChange?.({ type: 'new', text: newContextText });
    } else if (mode === MODES.SAVED && selectedContexts.length === 1) {
      onChange?.({ type: 'saved', context: selectedContexts[0] });
    } else if (mode === MODES.MULTIPLE && selectedContexts.length > 0) {
      onChange?.({ type: 'multiple', contexts: selectedContexts });
    } else if (mode === MODES.NONE) {
      onChange?.(null);
    }
  }, [mode, newContextText, selectedContexts, onChange]);

  const handleModeSelect = (newMode) => {
    if (newMode === MODES.MULTIPLE && usage?.plan === 'free') {
      setShowPaywallModal(true);
      return;
    }
    setMode(newMode);
    setSelectedContexts([]);
    setNewContextText('');
    setIsOpen(false);
  };

  const handleSelectContext = (context) => {
    if (mode === MODES.MULTIPLE) {
      const isSelected = selectedContexts.some((c) => c.id === context.id);
      if (isSelected) {
        setSelectedContexts((prev) => prev.filter((c) => c.id !== context.id));
      } else {
        setSelectedContexts((prev) => [...prev, context]);
      }
    } else {
      setSelectedContexts([context]);
      setIsOpen(false);
    }
  };

  const handleRemoveContext = (context) => {
    setSelectedContexts((prev) => prev.filter((c) => c.id !== context.id));
  };

  const getModeLabel = () => {
    switch (mode) {
      case MODES.NEW:
        return t('context.selector.newContext');
      case MODES.SAVED:
        return selectedContexts[0]?.name || t('context.selector.selectSaved');
      case MODES.MULTIPLE:
        return selectedContexts.length > 0
          ? t('context.selector.multipleSelected', { count: selectedContexts.length })
          : t('context.selector.selectMultiple');
      default:
        return placeholder || t('context.selector.placeholder');
    }
  };

  return (
    <div className="space-y-3" ref={dropdownRef}>
      {/* Mode selector */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between px-4 py-2.5 border border-light-border dark:border-dark-border rounded-button bg-light-surface dark:bg-dark-surface text-text-primary dark:text-text-dark-primary hover:border-ion/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <DocumentTextIcon />
            <span className={mode === MODES.NONE ? 'text-text-secondary dark:text-text-dark-secondary' : ''}>
              {getModeLabel()}
            </span>
          </div>
          <ChevronDownIcon />
        </button>

        {/* Dropdown menu */}
        {isOpen && (
          <div className="absolute z-10 w-full mt-2 bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-xl shadow-lg overflow-hidden">
            {/* No context option */}
            <button
              onClick={() => handleModeSelect(MODES.NONE)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-light-soft dark:hover:bg-dark-soft transition-colors ${
                mode === MODES.NONE ? 'bg-ion/10' : ''
              }`}
            >
              <div className="w-8 h-8 rounded-lg bg-light-soft dark:bg-dark-soft flex items-center justify-center text-text-secondary">
                <CloseIcon />
              </div>
              <div>
                <p className="font-medium text-text-primary dark:text-text-dark-primary">
                  {t('context.selector.noContext')}
                </p>
                <p className="text-xs text-text-secondary dark:text-text-dark-secondary">
                  {t('context.selector.noContextDesc')}
                </p>
              </div>
            </button>

            {/* New context option */}
            <button
              onClick={() => handleModeSelect(MODES.NEW)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-light-soft dark:hover:bg-dark-soft transition-colors border-t border-light-border dark:border-dark-border ${
                mode === MODES.NEW ? 'bg-ion/10' : ''
              }`}
            >
              <div className="w-8 h-8 rounded-lg bg-ion/10 flex items-center justify-center text-ion">
                <PlusIcon />
              </div>
              <div>
                <p className="font-medium text-text-primary dark:text-text-dark-primary">
                  {t('context.selector.enterNew')}
                </p>
                <p className="text-xs text-text-secondary dark:text-text-dark-secondary">
                  {t('context.selector.enterNewDesc')}
                </p>
              </div>
            </button>

            {/* Saved context option */}
            <button
              onClick={() => handleModeSelect(MODES.SAVED)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-light-soft dark:hover:bg-dark-soft transition-colors border-t border-light-border dark:border-dark-border ${
                mode === MODES.SAVED ? 'bg-ion/10' : ''
              }`}
            >
              <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                <StarIcon />
              </div>
              <div>
                <p className="font-medium text-text-primary dark:text-text-dark-primary">
                  {t('context.selector.useSaved')}
                </p>
                <p className="text-xs text-text-secondary dark:text-text-dark-secondary">
                  {t('context.selector.useSavedDesc')}
                </p>
              </div>
            </button>

            {/* Multiple contexts option (paid) */}
            {showMultipleOption && (
              <button
                onClick={() => handleModeSelect(MODES.MULTIPLE)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-light-soft dark:hover:bg-dark-soft transition-colors border-t border-light-border dark:border-dark-border ${
                  mode === MODES.MULTIPLE ? 'bg-ion/10' : ''
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-warning-bg flex items-center justify-center text-warning">
                  {usage?.plan === 'free' ? <LockIcon /> : <DocumentTextIcon />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-text-primary dark:text-text-dark-primary">
                      {t('context.selector.multipleContexts')}
                    </p>
                    {usage?.plan === 'free' && (
                      <span className="text-xs bg-warning/20 text-warning px-2 py-0.5 rounded-full">
                        {t('context.selector.proFeature')}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-text-secondary dark:text-text-dark-secondary">
                    {t('context.selector.multipleContextsDesc')}
                  </p>
                </div>
              </button>
            )}
          </div>
        )}
      </div>

      {/* New context input */}
      {mode === MODES.NEW && (
        <textarea
          value={newContextText}
          onChange={(e) => setNewContextText(e.target.value)}
          placeholder={t('context.selector.contextPlaceholder')}
          rows={4}
          className="w-full px-4 py-2.5 border border-light-border dark:border-dark-border rounded-button bg-light-surface dark:bg-dark-surface text-text-primary dark:text-text-dark-primary focus:outline-none focus:ring-2 focus:ring-ion/40 focus:border-ion resize-none"
        />
      )}

      {/* Saved contexts list */}
      {(mode === MODES.SAVED || mode === MODES.MULTIPLE) && (
        <div className="border border-light-border dark:border-dark-border rounded-xl overflow-hidden">
          {loading ? (
            <div className="p-4 text-center text-text-secondary dark:text-text-dark-secondary">
              {t('common.loading')}
            </div>
          ) : savedContexts.length === 0 ? (
            <div className="p-4 text-center text-text-secondary dark:text-text-dark-secondary">
              {t('context.selector.noSavedContexts')}
            </div>
          ) : (
            <div className="max-h-48 overflow-y-auto divide-y divide-light-border dark:divide-dark-border">
              {savedContexts.map((context) => {
                const isSelected = selectedContexts.some((c) => c.id === context.id);
                return (
                  <button
                    key={context.id}
                    onClick={() => handleSelectContext(context)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-light-soft dark:hover:bg-dark-soft transition-colors ${
                      isSelected ? 'bg-ion/10' : ''
                    }`}
                  >
                    <div className={`w-5 h-5 rounded border flex items-center justify-center ${
                      isSelected
                        ? 'bg-ion border-ion text-white'
                        : 'border-light-border dark:border-dark-border'
                    }`}>
                      {isSelected && (
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-text-primary dark:text-text-dark-primary truncate">
                          {context.name}
                        </p>
                        {context.is_default && (
                          <span className="text-xs text-ion">
                            <StarIcon />
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-text-secondary dark:text-text-dark-secondary truncate">
                        {context.context_text.substring(0, 50)}...
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Selected contexts chips (for multiple mode) */}
      {mode === MODES.MULTIPLE && selectedContexts.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedContexts.map((context) => (
            <ContextChip
              key={context.id}
              context={context}
              onRemove={handleRemoveContext}
            />
          ))}
        </div>
      )}

      {/* Paywall modal */}
      <PaywallModal
        isOpen={showPaywallModal}
        onClose={() => setShowPaywallModal(false)}
        errorCode="QUOTA_EXCEEDED_RUNS"
        currentUsage={usage}
      />
    </div>
  );
}
