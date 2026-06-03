import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';

/**
 * WriteExecutionWizard - Multi-step wizard for write execution
 *
 * Steps:
 * 1. Select Target - Choose output target
 * 2. Preview - See what will be written
 * 3. Confirm - Explicit irreversible warning + checkbox
 * 4. Execute - Progress polling
 * 5. Verify - Show verification results
 * 6. Done - Summary + Rollback option (if within 24h)
 */

// Icons
const XIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const DatabaseIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
  </svg>
);

const CloudIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
  </svg>
);

const WarningIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

const LoadingSpinner = ({ size = 'md' }) => {
  const sizes = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-8 w-8' };
  return (
    <svg className={`animate-spin ${sizes[size]}`} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
};

// Step indicator
const StepIndicator = ({ steps, currentStep }) => (
  <div className="flex items-center justify-center px-4 py-3 bg-gray-50 border-b border-gray-200">
    {steps.map((step, index) => (
      <React.Fragment key={step.id}>
        <div className="flex items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
              index < currentStep
                ? 'bg-green-500 text-white'
                : index === currentStep
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-500'
            }`}
          >
            {index < currentStep ? <CheckIcon /> : index + 1}
          </div>
          <span className={`ml-2 text-sm font-medium hidden sm:block ${
            index === currentStep ? 'text-blue-600' : index < currentStep ? 'text-green-600' : 'text-gray-400'
          }`}>
            {step.label}
          </span>
        </div>
        {index < steps.length - 1 && (
          <div className={`w-12 h-1 mx-2 rounded-full ${
            index < currentStep ? 'bg-green-500' : 'bg-gray-200'
          }`} />
        )}
      </React.Fragment>
    ))}
  </div>
);

// Target type icons
const getTargetIcon = (type) => {
  if (type === 'postgresql') return <DatabaseIcon />;
  return <CloudIcon />;
};

const getTargetLabel = (type) => {
  const labels = {
    postgresql: 'PostgreSQL',
    azure_blob: 'Azure Blob',
    aws_s3: 'Amazon S3',
  };
  return labels[type] || type;
};

export default function WriteExecutionWizard({ runId, onClose, onComplete }) {
  const { t } = useTranslation();
  const { authFetch } = useAuth();

  // Wizard state
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Data
  const [targets, setTargets] = useState([]);
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [preview, setPreview] = useState(null);
  const [writeExecutionId, setWriteExecutionId] = useState(null);
  const [confirmed, setConfirmed] = useState(false);
  const [executionStatus, setExecutionStatus] = useState(null);
  const [verification, setVerification] = useState(null);

  const steps = [
    { id: 'select', label: t('writeWizard.steps.select', 'Select Target') },
    { id: 'preview', label: t('writeWizard.steps.preview', 'Preview') },
    { id: 'confirm', label: t('writeWizard.steps.confirm', 'Confirm') },
    { id: 'execute', label: t('writeWizard.steps.execute', 'Execute') },
    { id: 'verify', label: t('writeWizard.steps.verify', 'Verify') },
  ];

  // Fetch output targets
  useEffect(() => {
    const fetchTargets = async () => {
      try {
        const res = await authFetch('/output-targets');
        if (res.ok) {
          const data = await res.json();
          setTargets(data.targets || []);
        }
      } catch (err) {
        console.error('Failed to fetch targets:', err);
      }
    };
    fetchTargets();
  }, [authFetch]);

  // Step 1: Select Target
  const handleSelectTarget = (target) => {
    setSelectedTarget(target);
    setError(null);
  };

  // Step 2: Generate Preview
  const generatePreview = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await authFetch('/write-preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          runId,
          outputTargetId: selectedTarget.id,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to generate preview');
      }

      const data = await res.json();
      setPreview(data);
      setWriteExecutionId(data.writeExecutionId);
      setCurrentStep(1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Confirm
  const confirmExecution = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await authFetch(`/write-executions/${writeExecutionId}/confirm`, {
        method: 'POST',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to confirm execution');
      }

      setCurrentStep(3);
      executeWrite();
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  // Step 4: Execute with polling
  const executeWrite = async () => {
    try {
      // Start execution
      const res = await authFetch(`/write-executions/${writeExecutionId}/execute`, {
        method: 'POST',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to start execution');
      }

      // Start polling for status
      pollExecutionStatus();
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  // Poll execution status
  const pollExecutionStatus = useCallback(async () => {
    try {
      const res = await authFetch(`/write-executions/${writeExecutionId}/status`);
      if (!res.ok) throw new Error('Failed to fetch status');

      const data = await res.json();
      setExecutionStatus(data);

      if (data.status === 'completed') {
        setCurrentStep(4);
        verifyExecution();
      } else if (data.status === 'failed') {
        setError(data.errorMessage || 'Execution failed');
        setLoading(false);
      } else {
        // Continue polling
        setTimeout(pollExecutionStatus, 2000);
      }
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }, [authFetch, writeExecutionId]);

  // Step 5: Verify
  const verifyExecution = async () => {
    try {
      // Determine verification endpoint based on target type
      const endpoint = selectedTarget.type === 'postgresql'
        ? `/write-executions/${writeExecutionId}/verify`
        : selectedTarget.type === 'azure_blob'
        ? `/write-executions/${writeExecutionId}/verify/azureblob`
        : `/write-executions/${writeExecutionId}/verify/s3`;

      const res = await authFetch(endpoint);
      if (!res.ok) throw new Error('Failed to verify');

      const data = await res.json();
      setVerification(data);
      setLoading(false);
    } catch (err) {
      console.error('Verification failed:', err);
      setVerification({ verified: false, error: err.message });
      setLoading(false);
    }
  };

  // Rollback
  const handleRollback = async () => {
    if (!window.confirm(t('writeWizard.rollbackConfirm', 'Are you sure you want to rollback this write execution? This will delete all written data.'))) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const endpoint = selectedTarget.type === 'postgresql'
        ? `/write-executions/${writeExecutionId}/rollback/postgres`
        : selectedTarget.type === 'azure_blob'
        ? `/write-executions/${writeExecutionId}/rollback/azureblob`
        : `/write-executions/${writeExecutionId}/rollback/s3`;

      const res = await authFetch(endpoint, { method: 'POST' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Rollback failed');
      }

      const data = await res.json();
      setExecutionStatus(prev => ({ ...prev, status: 'rolled_back', ...data }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return renderSelectTarget();
      case 1:
        return renderPreview();
      case 2:
        return renderConfirm();
      case 3:
        return renderExecute();
      case 4:
        return renderVerify();
      default:
        return null;
    }
  };

  // Step 1: Select Target
  const renderSelectTarget = () => (
    <div className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {t('writeWizard.selectTarget', 'Select Output Target')}
      </h3>
      <p className="text-sm text-gray-600 mb-6">
        {t('writeWizard.selectTargetDesc', 'Choose where to write the processed data from this run.')}
      </p>

      {targets.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <CloudIcon className="mx-auto text-gray-400" />
          <p className="mt-2 text-gray-600">{t('writeWizard.noTargets', 'No output targets configured')}</p>
          <p className="text-sm text-gray-500 mt-1">
            {t('writeWizard.noTargetsHint', 'Go to Output Targets page to add one.')}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {targets.map((target) => (
            <button
              key={target.id}
              onClick={() => handleSelectTarget(target)}
              className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                selectedTarget?.id === target.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  selectedTarget?.id === target.id ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                }`}>
                  {getTargetIcon(target.type)}
                </div>
                <div>
                  <div className="font-medium text-gray-900">{target.display_name}</div>
                  <div className="text-sm text-gray-500">{getTargetLabel(target.type)}</div>
                </div>
                {selectedTarget?.id === target.id && (
                  <div className="ml-auto text-blue-600">
                    <CheckIcon />
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );

  // Step 2: Preview
  const renderPreview = () => (
    <div className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {t('writeWizard.previewTitle', 'Write Preview')}
      </h3>

      {preview && (
        <div className="space-y-4">
          {/* Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">{t('writeWizard.summary', 'Summary')}</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">{t('writeWizard.targetType', 'Target Type')}:</span>
                <span className="ml-2 font-medium">{preview.preview?.targetType}</span>
              </div>
              <div>
                <span className="text-gray-500">{t('writeWizard.estimatedRows', 'Estimated Rows')}:</span>
                <span className="ml-2 font-medium">{preview.preview?.summary?.estimatedRows?.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-gray-500">{t('writeWizard.estimatedBytes', 'Estimated Size')}:</span>
                <span className="ml-2 font-medium">{formatBytes(preview.preview?.summary?.estimatedBytes)}</span>
              </div>
              <div>
                <span className="text-gray-500">{t('writeWizard.operations', 'Operations')}:</span>
                <span className="ml-2 font-medium">{preview.preview?.operations?.length}</span>
              </div>
            </div>
          </div>

          {/* Operations */}
          {preview.preview?.operations?.length > 0 && (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
                <h4 className="font-medium text-gray-900">{t('writeWizard.plannedOperations', 'Planned Operations')}</h4>
              </div>
              <div className="max-h-48 overflow-y-auto divide-y divide-gray-100">
                {preview.preview.operations.slice(0, 10).map((op, index) => (
                  <div key={index} className="px-4 py-2 text-sm">
                    <span className="font-medium text-gray-700">{op.type}</span>
                    <span className="mx-2 text-gray-400">→</span>
                    <span className="text-gray-600">{op.target}</span>
                  </div>
                ))}
                {preview.preview.operations.length > 10 && (
                  <div className="px-4 py-2 text-sm text-gray-500 italic">
                    ... and {preview.preview.operations.length - 10} more operations
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Warnings */}
          {preview.preview?.summary?.warnings?.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-yellow-700 font-medium mb-2">
                <WarningIcon />
                {t('writeWizard.warnings', 'Warnings')}
              </div>
              <ul className="text-sm text-yellow-700 space-y-1 ml-8 list-disc">
                {preview.preview.summary.warnings.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );

  // Step 3: Confirm
  const renderConfirm = () => (
    <div className="p-6">
      {/* Warning banner */}
      <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <div className="text-red-500 mt-0.5">
            <WarningIcon />
          </div>
          <div>
            <h4 className="font-semibold text-red-800">
              {t('writeWizard.irreversibleWarning', 'This action writes data to external systems')}
            </h4>
            <p className="text-sm text-red-700 mt-1">
              {t('writeWizard.irreversibleDesc', 'Data will be written to your selected target. While rollback is available for 24 hours, this action may have side effects on your systems.')}
            </p>
          </div>
        </div>
      </div>

      {/* Rollback info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h4 className="font-medium text-blue-800 mb-2">
          {t('writeWizard.rollbackInfo', 'Rollback Window')}
        </h4>
        <p className="text-sm text-blue-700">
          {t('writeWizard.rollbackInfoDesc', 'You can rollback this write within 24 hours. After that, rollback is no longer available.')}
        </p>
        {preview?.preview?.summary?.rollbackDeadline && (
          <p className="text-sm text-blue-600 mt-2 font-medium">
            {t('writeWizard.rollbackDeadline', 'Rollback deadline')}: {new Date(preview.preview.summary.rollbackDeadline).toLocaleString()}
          </p>
        )}
      </div>

      {/* Summary */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h4 className="font-medium text-gray-900 mb-3">{t('writeWizard.aboutToWrite', 'About to write')}</h4>
        <ul className="text-sm text-gray-700 space-y-1">
          <li><strong>{t('writeWizard.target', 'Target')}:</strong> {selectedTarget?.display_name} ({getTargetLabel(selectedTarget?.type)})</li>
          <li><strong>{t('writeWizard.rows', 'Rows')}:</strong> {preview?.preview?.summary?.estimatedRows?.toLocaleString()}</li>
          <li><strong>{t('writeWizard.size', 'Size')}:</strong> {formatBytes(preview?.preview?.summary?.estimatedBytes)}</li>
        </ul>
      </div>

      {/* Confirmation checkbox */}
      <div className="flex items-start gap-3 p-4 bg-gray-100 rounded-lg">
        <input
          type="checkbox"
          id="confirm-write"
          checked={confirmed}
          onChange={(e) => setConfirmed(e.target.checked)}
          className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <label htmlFor="confirm-write" className="text-sm text-gray-700">
          {t('writeWizard.confirmCheckbox', 'I understand that this will write data to the selected target and acknowledge the potential impact on my systems.')}
        </label>
      </div>
    </div>
  );

  // Step 4: Execute
  const renderExecute = () => (
    <div className="p-6 text-center">
      {executionStatus?.status === 'executing' || !executionStatus ? (
        <>
          <LoadingSpinner size="lg" />
          <h3 className="text-lg font-semibold text-gray-900 mt-4">
            {t('writeWizard.executing', 'Executing Write...')}
          </h3>
          <p className="text-gray-600 mt-2">
            {executionStatus?.currentOperation || t('writeWizard.preparingWrite', 'Preparing write operation...')}
          </p>

          {/* Progress bar */}
          {executionStatus?.progress !== undefined && (
            <div className="mt-6 max-w-md mx-auto">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>{t('writeWizard.progress', 'Progress')}</span>
                <span>{executionStatus.progress}%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all duration-500"
                  style={{ width: `${executionStatus.progress}%` }}
                />
              </div>
              {executionStatus.completedOperations !== undefined && (
                <p className="text-xs text-gray-500 mt-2">
                  {executionStatus.completedOperations} / {executionStatus.totalOperations} operations
                </p>
              )}
            </div>
          )}
        </>
      ) : executionStatus?.status === 'failed' ? (
        <>
          <div className="text-red-500 mb-4">
            <XIcon className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            {t('writeWizard.executionFailed', 'Execution Failed')}
          </h3>
          <p className="text-red-600 mt-2">{executionStatus.errorMessage}</p>
        </>
      ) : null}
    </div>
  );

  // Step 5: Verify
  const renderVerify = () => (
    <div className="p-6">
      <div className="text-center mb-6">
        {verification?.verified || verification?.match ? (
          <>
            <div className="text-green-500 mb-2">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900">
              {t('writeWizard.writeComplete', 'Write Complete!')}
            </h3>
            <p className="text-gray-600 mt-1">
              {t('writeWizard.writeVerified', 'All data was written and verified successfully.')}
            </p>
          </>
        ) : (
          <>
            <div className="text-yellow-500 mb-2">
              <WarningIcon className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">
              {t('writeWizard.verificationIssue', 'Verification Issue')}
            </h3>
            <p className="text-gray-600 mt-1">
              {verification?.reason || t('writeWizard.verificationMismatch', 'Some items may not have been written correctly.')}
            </p>
          </>
        )}
      </div>

      {/* Verification details */}
      {verification && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h4 className="font-medium text-gray-900 mb-3">{t('writeWizard.verificationDetails', 'Verification Details')}</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">{t('writeWizard.expectedItems', 'Expected Items')}:</span>
              <span className="ml-2 font-medium">{verification.expectedItems || verification.expectedBlobs || verification.expectedRows}</span>
            </div>
            <div>
              <span className="text-gray-500">{t('writeWizard.actualItems', 'Actual Items')}:</span>
              <span className="ml-2 font-medium">{verification.actualItems || verification.actualBlobs || verification.actualRows}</span>
            </div>
            <div>
              <span className="text-gray-500">{t('writeWizard.bytesExpected', 'Expected Bytes')}:</span>
              <span className="ml-2 font-medium">{formatBytes(verification.bytesExpected || verification.expectedBytes)}</span>
            </div>
            <div>
              <span className="text-gray-500">{t('writeWizard.bytesActual', 'Actual Bytes')}:</span>
              <span className="ml-2 font-medium">{formatBytes(verification.bytesActual || verification.actualBytes)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Rollback manifest summary */}
      {executionStatus && (
        <div className="border border-gray-200 rounded-lg p-4 mb-6">
          <h4 className="font-medium text-gray-900 mb-3">{t('writeWizard.rollbackManifest', 'Rollback Manifest')}</h4>
          <div className="text-sm text-gray-700">
            {selectedTarget?.type === 'postgresql' ? (
              <p>{t('writeWizard.tablesCreated', 'Tables and rows can be rolled back within 24 hours.')}</p>
            ) : (
              <p>
                {t('writeWizard.objectsUploaded', '{{count}} objects uploaded', {
                  count: executionStatus.blobsUploaded || executionStatus.objectsUploaded || 0
                })}
              </p>
            )}
            {executionStatus.rollbackDeadline && (
              <p className="text-gray-500 mt-1">
                {t('writeWizard.rollbackAvailableUntil', 'Rollback available until')}: {new Date(executionStatus.rollbackDeadline).toLocaleString()}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Rollback button */}
      {executionStatus?.canRollback && executionStatus.status !== 'rolled_back' && (
        <div className="flex justify-center">
          <button
            onClick={handleRollback}
            disabled={loading}
            className="px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            {loading && <LoadingSpinner size="sm" />}
            {t('writeWizard.rollback', 'Rollback Write')}
          </button>
        </div>
      )}

      {executionStatus?.status === 'rolled_back' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
          <p className="text-yellow-800 font-medium">
            {t('writeWizard.rolledBack', 'This write has been rolled back.')}
          </p>
        </div>
      )}
    </div>
  );

  // Navigation buttons
  const renderNavigation = () => {
    const canProceed = () => {
      switch (currentStep) {
        case 0: return selectedTarget !== null;
        case 1: return preview !== null;
        case 2: return confirmed;
        default: return false;
      }
    };

    const handleNext = () => {
      switch (currentStep) {
        case 0:
          generatePreview();
          break;
        case 1:
          setCurrentStep(2);
          break;
        case 2:
          confirmExecution();
          break;
        default:
          break;
      }
    };

    const handleBack = () => {
      if (currentStep > 0 && currentStep < 3) {
        setCurrentStep(currentStep - 1);
        setError(null);
      }
    };

    return (
      <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
        <div>
          {currentStep > 0 && currentStep < 3 && (
            <button
              onClick={handleBack}
              disabled={loading}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {t('common.back', 'Back')}
            </button>
          )}
        </div>

        <div className="flex gap-3">
          {currentStep < 4 && (
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {t('common.cancel', 'Cancel')}
            </button>
          )}

          {currentStep < 3 && (
            <button
              onClick={handleNext}
              disabled={!canProceed() || loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {loading && <LoadingSpinner size="sm" />}
              {currentStep === 2
                ? t('writeWizard.confirmAndExecute', 'Confirm & Execute')
                : t('common.next', 'Next')
              }
            </button>
          )}

          {currentStep === 4 && (
            <button
              onClick={() => { onComplete && onComplete(); onClose(); }}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              {t('common.done', 'Done')}
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            {t('writeWizard.title', 'Write Outputs')}
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XIcon />
          </button>
        </div>

        {/* Step indicator */}
        <StepIndicator steps={steps} currentStep={currentStep} />

        {/* Error display */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {renderStepContent()}
        </div>

        {/* Navigation */}
        {renderNavigation()}
      </div>
    </div>
  );
}

// Helper function
function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
