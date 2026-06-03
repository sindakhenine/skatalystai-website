import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import OutputTargetModal from '../components/OutputTargetModal';

/**
 * Output Targets Page (/app/output-targets)
 *
 * PURPOSE: Configuration layer for output destinations (databases, blob storage).
 * This page is for setting up persistent, reusable output targets.
 *
 * IMPORTANT SEPARATION:
 * - Data Sources = Input configuration (/app/connectors)
 * - Output Targets = Output configuration (here)
 * - Data Ingestion = Execution (/app/ingest) - run ingestions using sources
 */

// Icons
const PlusIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
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

const CheckCircleIcon = () => (
  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const XCircleIcon = () => (
  <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const TrashIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const RefreshIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

const OutputTargetIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
  </svg>
);

// Target type metadata
const targetTypes = {
  postgresql: {
    label: 'PostgreSQL',
    icon: DatabaseIcon,
    color: 'blue',
    description: 'Write to PostgreSQL database',
  },
  azure_blob: {
    label: 'Azure Blob Storage',
    icon: CloudIcon,
    color: 'cyan',
    description: 'Upload to Azure Blob container',
  },
  aws_s3: {
    label: 'Amazon S3',
    icon: CloudIcon,
    color: 'orange',
    description: 'Upload to S3 bucket',
  },
};

export default function OutputTargets() {
  const { t } = useTranslation();
  const { authFetch } = useAuth();
  const [targets, setTargets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Fetch output targets
  const fetchTargets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await authFetch('/output-targets');
      if (!res.ok) throw new Error('Failed to fetch output targets');
      const data = await res.json();
      setTargets(data.targets || []);
    } catch (err) {
      console.error('Failed to fetch output targets:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [authFetch]);

  useEffect(() => {
    fetchTargets();
  }, [fetchTargets]);

  const handleAddTarget = (type) => {
    setModalType(type);
    setShowModal(true);
  };

  const handleModalComplete = () => {
    setShowModal(false);
    setModalType(null);
    fetchTargets();
  };

  const handleModalCancel = () => {
    setShowModal(false);
    setModalType(null);
  };

  const handleDelete = async (targetId) => {
    try {
      const res = await authFetch(`/output-targets/${targetId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete target');
      setDeleteConfirm(null);
      fetchTargets();
    } catch (err) {
      console.error('Failed to delete target:', err);
    }
  };

  const handleTestConnection = async (target) => {
    try {
      const endpoint = target.type === 'postgresql'
        ? '/postgres/test-connection'
        : target.type === 'azure_blob'
        ? '/azureblob/test-connection'
        : '/s3/test-connection';

      const res = await authFetch(`/output-targets/${target.id}/test`, {
        method: 'POST',
      });
      const result = await res.json();

      // Update target with test result
      setTargets(prev => prev.map(t =>
        t.id === target.id
          ? { ...t, lastTestResult: result }
          : t
      ));
    } catch (err) {
      console.error('Connection test failed:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600">
              <OutputTargetIcon />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              {t('outputTargets.pageTitle', 'Output Targets')}
            </h1>
          </div>
          <p className="text-gray-500 ml-13">
            {t('outputTargets.subtitle', 'Configure destinations for your processed data')}
          </p>
        </div>
      </div>

      {/* Info banner */}
      <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 flex items-start gap-3">
        <svg className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div className="flex-1">
          <p className="text-sm text-purple-800 font-medium">
            {t('outputTargets.infoBannerTitle', 'Output targets are write destinations')}
          </p>
          <p className="text-sm text-purple-700 mt-1">
            {t('outputTargets.infoBannerDesc', 'Configure where to write your processed data. Supports databases (PostgreSQL) and cloud storage (Azure Blob, S3).')}
          </p>
        </div>
      </div>

      {/* Target type cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(targetTypes).map(([type, meta]) => {
          const Icon = meta.icon;
          const colorClasses = {
            blue: 'bg-blue-50 border-blue-100 hover:border-blue-200 text-blue-600',
            cyan: 'bg-cyan-50 border-cyan-100 hover:border-cyan-200 text-cyan-600',
            orange: 'bg-orange-50 border-orange-100 hover:border-orange-200 text-orange-600',
          };
          return (
            <button
              key={type}
              onClick={() => handleAddTarget(type)}
              className={`p-4 rounded-xl border-2 transition-all text-left ${colorClasses[meta.color]}`}
            >
              <div className="flex items-center gap-3 mb-2">
                <Icon />
                <span className="font-semibold">{meta.label}</span>
              </div>
              <p className="text-sm opacity-80">{meta.description}</p>
              <div className="mt-3 flex items-center gap-1 text-sm font-medium">
                <PlusIcon />
                <span>{t('outputTargets.addTarget', 'Add Target')}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Existing targets list */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">
            {t('outputTargets.configuredTargets', 'Configured Targets')}
          </h2>
          <button
            onClick={fetchTargets}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Refresh"
          >
            <RefreshIcon />
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
            {t('common.loading', 'Loading...')}
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">
            <p>{error}</p>
            <button
              onClick={fetchTargets}
              className="mt-2 text-sm text-blue-600 hover:underline"
            >
              {t('common.retry', 'Retry')}
            </button>
          </div>
        ) : targets.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <CloudIcon />
            <p className="mt-2">{t('outputTargets.noTargets', 'No output targets configured yet')}</p>
            <p className="text-sm mt-1">{t('outputTargets.noTargetsHint', 'Click one of the target types above to add your first output destination')}</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {targets.map((target) => {
              const meta = targetTypes[target.type] || {
                label: target.type,
                icon: CloudIcon,
                color: 'gray',
              };
              const Icon = meta.icon;

              return (
                <div
                  key={target.id}
                  className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-${meta.color}-100 text-${meta.color}-600`}>
                      <Icon />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{target.display_name}</span>
                        <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                          {meta.label}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">
                        {target.type === 'postgresql' && target.host && `${target.host}:${target.port || 5432}`}
                        {target.type === 'azure_blob' && target.container && `Container: ${target.container}`}
                        {target.type === 'aws_s3' && target.bucket && `Bucket: ${target.bucket}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {target.lastTestResult && (
                      target.lastTestResult.success ? <CheckCircleIcon /> : <XCircleIcon />
                    )}
                    <button
                      onClick={() => handleTestConnection(target)}
                      className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      {t('outputTargets.testConnection', 'Test')}
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(target.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete confirmation modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {t('outputTargets.deleteConfirmTitle', 'Delete Output Target?')}
            </h3>
            <p className="text-gray-600 mb-4">
              {t('outputTargets.deleteConfirmDesc', 'This action cannot be undone. Any pending write executions using this target will fail.')}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {t('common.cancel', 'Cancel')}
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                {t('common.delete', 'Delete')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add target modal */}
      {showModal && (
        <OutputTargetModal
          type={modalType}
          onComplete={handleModalComplete}
          onCancel={handleModalCancel}
        />
      )}
    </div>
  );
}
