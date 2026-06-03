import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useQuota } from '../hooks/useQuota';

// Icons
const FolderIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
  </svg>
);

const DatabaseIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
  </svg>
);

const CloudIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
  </svg>
);

const UploadIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const XCircleIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const LoaderIcon = () => (
  <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
  </svg>
);

const ArrowLeftIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
  </svg>
);

// Server icon for Local Server Agent
const ServerIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
  </svg>
);

// Connector type definitions
// NOTE: Data Sources are for CONFIGURATION only (reusable connections)
// File Upload is NOT included here - it belongs in Data Ingestion (ad-hoc execution)
const CONNECTOR_TYPES = [
  {
    id: 'local_server_agent',
    icon: ServerIcon,
    available: true,
  },
  {
    id: 'database',
    icon: DatabaseIcon,
    available: false,
  },
  {
    id: 'cloud_storage',
    icon: CloudIcon,
    available: false,
  },
];

// Step indicator component
function StepIndicator({ steps, currentStep }) {
  return (
    <div className="flex items-center justify-center mb-8">
      {steps.map((step, index) => (
        <React.Fragment key={step.id}>
          <div className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                index < currentStep
                  ? 'bg-success text-white'
                  : index === currentStep
                  ? 'bg-ion text-white'
                  : 'bg-light-soft dark:bg-dark-soft text-text-secondary dark:text-text-dark-secondary'
              }`}
            >
              {index < currentStep ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                index + 1
              )}
            </div>
            <span
              className={`ml-2 text-sm font-medium ${
                index <= currentStep
                  ? 'text-text-primary dark:text-text-dark-primary'
                  : 'text-text-secondary dark:text-text-dark-secondary'
              }`}
            >
              {step.label}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div
              className={`w-12 h-0.5 mx-3 ${
                index < currentStep ? 'bg-success' : 'bg-light-border dark:bg-dark-border'
              }`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// Connector type card
function ConnectorTypeCard({ type, selected, onSelect, disabled }) {
  const { t } = useTranslation();
  const Icon = type.icon;

  return (
    <button
      onClick={() => !disabled && type.available && onSelect(type.id)}
      disabled={disabled || !type.available}
      className={`relative p-6 rounded-xl border-2 transition-all text-left ${
        selected
          ? 'border-ion bg-ion/10 dark:bg-ion/20'
          : type.available
          ? 'border-light-border dark:border-dark-border hover:border-ion/50'
          : 'border-light-border dark:border-dark-border opacity-60 cursor-not-allowed'
      }`}
    >
      {!type.available && (
        <span className="absolute top-3 right-3 text-xs bg-light-soft dark:bg-dark-soft text-text-secondary dark:text-text-dark-secondary px-2 py-1 rounded-full">
          {t('common.soon')}
        </span>
      )}
      <div
        className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${
          selected
            ? 'bg-ion/20 text-ion'
            : 'bg-light-soft dark:bg-dark-soft text-text-secondary dark:text-text-dark-secondary'
        }`}
      >
        <Icon />
      </div>
      <h3 className="font-semibold text-text-primary dark:text-text-dark-primary mb-1">
        {t(`connector.types.${type.id}.title`)}
      </h3>
      <p className="text-sm text-text-secondary dark:text-text-dark-secondary">
        {t(`connector.types.${type.id}.description`)}
      </p>
    </button>
  );
}

// Step 1: Choose connector type
function Step1ChooseType({ selectedType, onSelectType, onNext }) {
  const { t } = useTranslation();

  return (
    <div>
      <h2 className="text-xl font-semibold text-text-primary dark:text-text-dark-primary mb-2">
        {t('connector.step1.title')}
      </h2>
      <p className="text-text-secondary dark:text-text-dark-secondary mb-6">
        {t('connector.step1.subtitle')}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {CONNECTOR_TYPES.map((type) => (
          <ConnectorTypeCard
            key={type.id}
            type={type}
            selected={selectedType === type.id}
            onSelect={onSelectType}
          />
        ))}
      </div>

      <div className="flex justify-end">
        <button
          onClick={onNext}
          disabled={!selectedType}
          className="flex items-center gap-2 px-6 py-2.5 bg-slate text-white font-medium rounded-button shadow-button hover:bg-slate-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {t('common.next')}
          <ArrowRightIcon />
        </button>
      </div>
    </div>
  );
}

// Step 2: Configure connector
function Step2Configure({ connectorType, config, onConfigChange, onBack, onNext }) {
  const { t } = useTranslation();

  const renderConfigForm = () => {
    switch (connectorType) {
      case 'local_server_agent':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-primary dark:text-text-dark-primary mb-2">
                {t('connector.config.folderPath')}
              </label>
              <input
                type="text"
                value={config.path || ''}
                onChange={(e) => onConfigChange({ ...config, path: e.target.value })}
                placeholder="/path/to/your/folder"
                className="w-full px-4 py-2.5 border border-light-border dark:border-dark-border rounded-button bg-light-surface dark:bg-dark-surface text-text-primary dark:text-text-dark-primary focus:outline-none focus:ring-2 focus:ring-ion/40 focus:border-ion transition-colors"
              />
              <p className="mt-1 text-xs text-text-secondary dark:text-text-dark-secondary">
                {t('connector.config.folderPathHint')}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary dark:text-text-dark-primary mb-2">
                {t('connector.config.filePatterns')}
              </label>
              <input
                type="text"
                value={config.patterns || ''}
                onChange={(e) => onConfigChange({ ...config, patterns: e.target.value })}
                placeholder="*.pdf, *.docx, *.xlsx"
                className="w-full px-4 py-2.5 border border-light-border dark:border-dark-border rounded-button bg-light-surface dark:bg-dark-surface text-text-primary dark:text-text-dark-primary focus:outline-none focus:ring-2 focus:ring-ion/40 focus:border-ion transition-colors"
              />
              <p className="mt-1 text-xs text-text-secondary dark:text-text-dark-secondary">
                {t('connector.config.filePatternsHint')}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="recursive"
                checked={config.recursive !== false}
                onChange={(e) => onConfigChange({ ...config, recursive: e.target.checked })}
                className="h-4 w-4 rounded border-light-border text-ion focus:ring-ion/40"
              />
              <label htmlFor="recursive" className="text-sm text-text-primary dark:text-text-dark-primary">
                {t('connector.config.includeSubfolders')}
              </label>
            </div>
          </div>
        );

      // NOTE: file_upload is NOT a data source - use Data Ingestion for ad-hoc uploads

      default:
        return (
          <div className="text-center py-8 text-text-secondary dark:text-text-dark-secondary">
            {t('connector.config.comingSoon')}
          </div>
        );
    }
  };

  const isValid = () => {
    switch (connectorType) {
      case 'local_server_agent':
        return config.path?.trim().length > 0;
      default:
        return false;
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-text-primary dark:text-text-dark-primary mb-2">
        {t('connector.step2.title')}
      </h2>
      <p className="text-text-secondary dark:text-text-dark-secondary mb-6">
        {t('connector.step2.subtitle')}
      </p>

      <div className="mb-8">{renderConfigForm()}</div>

      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-6 py-2.5 text-text-secondary dark:text-text-dark-secondary font-medium hover:text-text-primary dark:hover:text-text-dark-primary transition-colors"
        >
          <ArrowLeftIcon />
          {t('common.back')}
        </button>
        <button
          onClick={onNext}
          disabled={!isValid()}
          className="flex items-center gap-2 px-6 py-2.5 bg-slate text-white font-medium rounded-button shadow-button hover:bg-slate-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {t('common.next')}
          <ArrowRightIcon />
        </button>
      </div>
    </div>
  );
}

// Step 3: Test connection
function Step3Test({ connectorType, config, testResult, testing, onTest, onBack, onNext }) {
  const { t } = useTranslation();

  return (
    <div>
      <h2 className="text-xl font-semibold text-text-primary dark:text-text-dark-primary mb-2">
        {t('connector.step3.title')}
      </h2>
      <p className="text-text-secondary dark:text-text-dark-secondary mb-6">
        {t('connector.step3.subtitle')}
      </p>

      <div className="bg-light-soft dark:bg-dark-soft rounded-xl p-6 mb-6">
        {/* Connection info summary */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-text-secondary dark:text-text-dark-secondary mb-2">
            {t('connector.step3.connectionInfo')}
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-text-secondary dark:text-text-dark-secondary">
                {t('connector.step3.type')}
              </span>
              <span className="text-sm font-medium text-text-primary dark:text-text-dark-primary">
                {t(`connector.types.${connectorType}.title`)}
              </span>
            </div>
            {connectorType === 'local_server_agent' && (
              <>
                <div className="flex justify-between">
                  <span className="text-sm text-text-secondary dark:text-text-dark-secondary">
                    {t('connector.config.folderPath')}
                  </span>
                  <span className="text-sm font-medium text-text-primary dark:text-text-dark-primary truncate ml-4 max-w-xs">
                    {config.path}
                  </span>
                </div>
                {config.patterns && (
                  <div className="flex justify-between">
                    <span className="text-sm text-text-secondary dark:text-text-dark-secondary">
                      {t('connector.config.filePatterns')}
                    </span>
                    <span className="text-sm font-medium text-text-primary dark:text-text-dark-primary">
                      {config.patterns}
                    </span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Test result */}
        {testResult && (
          <div
            className={`p-4 rounded-lg mb-4 ${
              testResult.success
                ? 'bg-success-bg border border-success/20'
                : 'bg-error-bg border border-error/20'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={testResult.success ? 'text-success' : 'text-error'}>
                {testResult.success ? <CheckCircleIcon /> : <XCircleIcon />}
              </div>
              <div className="flex-1">
                <p
                  className={`font-medium ${
                    testResult.success ? 'text-success' : 'text-error'
                  }`}
                >
                  {testResult.success
                    ? t('connector.step3.testSuccess')
                    : t('connector.step3.testFailed')}
                </p>
                {testResult.message && (
                  <p className="text-sm mt-1 text-text-secondary dark:text-text-dark-secondary">
                    {testResult.message}
                  </p>
                )}
                {testResult.stats && (
                  <div className="mt-3 grid grid-cols-2 gap-4">
                    <div className="p-3 bg-white/50 dark:bg-black/20 rounded-lg">
                      <p className="text-2xl font-bold text-text-primary dark:text-text-dark-primary">
                        {testResult.stats.fileCount}
                      </p>
                      <p className="text-xs text-text-secondary dark:text-text-dark-secondary">
                        {t('connector.step3.filesFound')}
                      </p>
                    </div>
                    <div className="p-3 bg-white/50 dark:bg-black/20 rounded-lg">
                      <p className="text-2xl font-bold text-text-primary dark:text-text-dark-primary">
                        {testResult.stats.totalSize}
                      </p>
                      <p className="text-xs text-text-secondary dark:text-text-dark-secondary">
                        {t('connector.step3.totalSize')}
                      </p>
                    </div>
                  </div>
                )}
                {testResult.sampleFiles?.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs text-text-secondary dark:text-text-dark-secondary mb-1">
                      {t('connector.step3.sampleFiles')}
                    </p>
                    <div className="text-xs text-text-primary dark:text-text-dark-primary space-y-0.5">
                      {testResult.sampleFiles.slice(0, 5).map((file, i) => (
                        <p key={i} className="truncate">{file}</p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Test button */}
        <button
          onClick={onTest}
          disabled={testing}
          className="w-full py-3 px-4 bg-ion text-white font-medium rounded-button hover:opacity-90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {testing ? (
            <>
              <LoaderIcon />
              {t('connector.step3.testing')}
            </>
          ) : (
            t('connector.step3.testConnection')
          )}
        </button>
      </div>

      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-6 py-2.5 text-text-secondary dark:text-text-dark-secondary font-medium hover:text-text-primary dark:hover:text-text-dark-primary transition-colors"
        >
          <ArrowLeftIcon />
          {t('common.back')}
        </button>
        <button
          onClick={onNext}
          disabled={!testResult?.success}
          className="flex items-center gap-2 px-6 py-2.5 bg-slate text-white font-medium rounded-button shadow-button hover:bg-slate-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {t('common.next')}
          <ArrowRightIcon />
        </button>
      </div>
    </div>
  );
}

// Step 4: Save and confirm
function Step4Save({ connectorType, config, testResult, saving, onBack, onSave }) {
  const { t } = useTranslation();
  const [name, setName] = useState('');

  return (
    <div>
      <h2 className="text-xl font-semibold text-text-primary dark:text-text-dark-primary mb-2">
        {t('connector.step4.title')}
      </h2>
      <p className="text-text-secondary dark:text-text-dark-secondary mb-6">
        {t('connector.step4.subtitle')}
      </p>

      <div className="bg-light-soft dark:bg-dark-soft rounded-xl p-6 mb-6">
        {/* Name input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-text-primary dark:text-text-dark-primary mb-2">
            {t('connector.step4.connectorName')}
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('connector.step4.namePlaceholder')}
            className="w-full px-4 py-2.5 border border-light-border dark:border-dark-border rounded-button bg-light-surface dark:bg-dark-surface text-text-primary dark:text-text-dark-primary focus:outline-none focus:ring-2 focus:ring-ion/40 focus:border-ion transition-colors"
          />
        </div>

        {/* Summary */}
        <div className="border-t border-light-border dark:border-dark-border pt-6">
          <h3 className="text-sm font-medium text-text-secondary dark:text-text-dark-secondary mb-4">
            {t('connector.step4.summary')}
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-ion/20 flex items-center justify-center text-ion">
                {connectorType === 'local_server_agent' && <ServerIcon />}
                {connectorType === 'database' && <DatabaseIcon />}
                {connectorType === 'cloud_storage' && <CloudIcon />}
              </div>
              <div>
                <p className="font-medium text-text-primary dark:text-text-dark-primary">
                  {t(`connector.types.${connectorType}.title`)}
                </p>
                <p className="text-sm text-text-secondary dark:text-text-dark-secondary">
                  {config.path || 'Configuration details'}
                </p>
              </div>
            </div>

            {testResult?.stats && (
              <div className="flex gap-4 text-sm">
                <span className="text-text-secondary dark:text-text-dark-secondary">
                  {testResult.stats.fileCount} {t('connector.step3.filesFound')}
                </span>
                <span className="text-text-secondary dark:text-text-dark-secondary">
                  {testResult.stats.totalSize}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-6 py-2.5 text-text-secondary dark:text-text-dark-secondary font-medium hover:text-text-primary dark:hover:text-text-dark-primary transition-colors"
        >
          <ArrowLeftIcon />
          {t('common.back')}
        </button>
        <button
          onClick={() => onSave(name)}
          disabled={saving || !name.trim()}
          className="flex items-center gap-2 px-6 py-2.5 bg-slate text-white font-medium rounded-button shadow-button hover:bg-slate-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <>
              <LoaderIcon />
              {t('common.saving')}
            </>
          ) : (
            <>
              {t('connector.step4.saveConnector')}
              <CheckCircleIcon />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// Main ConnectorWizard component
export default function ConnectorWizard({ onComplete, onCancel }) {
  const { t } = useTranslation();
  const { authFetch } = useAuth();
  const { checkQuota, showPaywall, paywallError, closePaywall, usage } = useQuota();

  const [currentStep, setCurrentStep] = useState(0);
  const [selectedType, setSelectedType] = useState(null);
  const [config, setConfig] = useState({});
  const [testResult, setTestResult] = useState(null);
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);

  const steps = [
    { id: 'type', label: t('connector.steps.chooseType') },
    { id: 'configure', label: t('connector.steps.configure') },
    { id: 'test', label: t('connector.steps.test') },
    { id: 'save', label: t('connector.steps.save') },
  ];

  // Check quota before starting
  useEffect(() => {
    checkQuota('connectors');
  }, [checkQuota]);

  const handleSelectType = (type) => {
    setSelectedType(type);
    setConfig({});
    setTestResult(null);
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      // Test connection via API
      const response = await authFetch('/connectors/test', {
        method: 'POST',
        body: JSON.stringify({
          type: selectedType,
          config: config,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setTestResult({
          success: data.success,
          message: data.message,
          stats: data.stats,
          sampleFiles: data.sampleFiles,
        });
      } else {
        const error = await response.json();
        setTestResult({
          success: false,
          message: error.message || t('connector.test.failed'),
        });
      }
    } catch (err) {
      setTestResult({
        success: false,
        message: err.message || t('connector.test.error'),
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async (name) => {
    setSaving(true);

    try {
      const response = await authFetch('/connectors', {
        method: 'POST',
        body: JSON.stringify({
          name,
          type: selectedType,
          config: config,
        }),
      });

      if (response.ok) {
        const connector = await response.json();
        onComplete?.(connector);
      } else {
        const error = await response.json();
        alert(error.message || t('connector.save.failed'));
      }
    } catch (err) {
      alert(err.message || t('connector.save.error'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-semibold text-text-primary dark:text-text-dark-primary">
          {t('connector.wizardTitle')}
        </h1>
        {onCancel && (
          <button
            onClick={onCancel}
            className="text-text-secondary dark:text-text-dark-secondary hover:text-text-primary dark:hover:text-text-dark-primary transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Step indicator */}
      <StepIndicator steps={steps} currentStep={currentStep} />

      {/* Step content */}
      {currentStep === 0 && (
        <Step1ChooseType
          selectedType={selectedType}
          onSelectType={handleSelectType}
          onNext={() => setCurrentStep(1)}
        />
      )}
      {currentStep === 1 && (
        <Step2Configure
          connectorType={selectedType}
          config={config}
          onConfigChange={setConfig}
          onBack={() => setCurrentStep(0)}
          onNext={() => setCurrentStep(2)}
        />
      )}
      {currentStep === 2 && (
        <Step3Test
          connectorType={selectedType}
          config={config}
          testResult={testResult}
          testing={testing}
          onTest={handleTestConnection}
          onBack={() => setCurrentStep(1)}
          onNext={() => setCurrentStep(3)}
        />
      )}
      {currentStep === 3 && (
        <Step4Save
          connectorType={selectedType}
          config={config}
          testResult={testResult}
          saving={saving}
          onBack={() => setCurrentStep(2)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
