import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';

/**
 * OutputTargetModal - Create output targets (PostgreSQL, Azure Blob, S3)
 *
 * Supports:
 * - PostgreSQL: host/port/db/user/pass/ssl
 * - Azure Blob: connection string or account+key + container + prefix
 * - AWS S3: access key/secret + region + bucket + prefix
 */

// Icons
const XIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const LoadingSpinner = () => (
  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
  </svg>
);

const EyeIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const EyeOffIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
  </svg>
);

export default function OutputTargetModal({ type, onComplete, onCancel }) {
  const { t } = useTranslation();
  const { authFetch } = useAuth();

  // Common state
  const [displayName, setDisplayName] = useState('');
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [error, setError] = useState(null);
  const [showPasswords, setShowPasswords] = useState({});

  // PostgreSQL state
  const [pgHost, setPgHost] = useState('');
  const [pgPort, setPgPort] = useState('5432');
  const [pgDatabase, setPgDatabase] = useState('');
  const [pgUser, setPgUser] = useState('');
  const [pgPassword, setPgPassword] = useState('');
  const [pgSsl, setPgSsl] = useState(false);
  const [pgSchema, setPgSchema] = useState('skatalyst');

  // Azure Blob state
  const [azureConnectionString, setAzureConnectionString] = useState('');
  const [azureAccountName, setAzureAccountName] = useState('');
  const [azureAccountKey, setAzureAccountKey] = useState('');
  const [azureContainer, setAzureContainer] = useState('');
  const [azurePrefix, setAzurePrefix] = useState('');
  const [azureUseConnectionString, setAzureUseConnectionString] = useState(true);

  // S3 state
  const [s3AccessKeyId, setS3AccessKeyId] = useState('');
  const [s3SecretAccessKey, setS3SecretAccessKey] = useState('');
  const [s3SessionToken, setS3SessionToken] = useState('');
  const [s3Bucket, setS3Bucket] = useState('');
  const [s3Region, setS3Region] = useState('us-east-1');
  const [s3Prefix, setS3Prefix] = useState('');

  const togglePassword = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const getTypeLabel = () => {
    switch (type) {
      case 'postgresql': return 'PostgreSQL';
      case 'azure_blob': return 'Azure Blob Storage';
      case 'aws_s3': return 'Amazon S3';
      default: return type;
    }
  };

  const buildPayload = () => {
    switch (type) {
      case 'postgresql':
        return {
          displayName,
          host: pgHost,
          port: parseInt(pgPort, 10),
          database: pgDatabase,
          user: pgUser,
          password: pgPassword,
          ssl: pgSsl,
          schema: pgSchema,
        };
      case 'azure_blob':
        return azureUseConnectionString
          ? {
              displayName,
              connectionString: azureConnectionString,
              containerName: azureContainer,
              pathPrefix: azurePrefix,
            }
          : {
              displayName,
              accountName: azureAccountName,
              accountKey: azureAccountKey,
              containerName: azureContainer,
              pathPrefix: azurePrefix,
            };
      case 'aws_s3':
        return {
          displayName,
          accessKeyId: s3AccessKeyId,
          secretAccessKey: s3SecretAccessKey,
          sessionToken: s3SessionToken || undefined,
          bucket: s3Bucket,
          region: s3Region,
          prefix: s3Prefix,
        };
      default:
        return {};
    }
  };

  const buildTestPayload = () => {
    switch (type) {
      case 'postgresql':
        return {
          host: pgHost,
          port: parseInt(pgPort, 10),
          database: pgDatabase,
          user: pgUser,
          password: pgPassword,
          ssl: pgSsl,
        };
      case 'azure_blob':
        return azureUseConnectionString
          ? {
              connectionString: azureConnectionString,
              containerName: azureContainer,
            }
          : {
              accountName: azureAccountName,
              accountKey: azureAccountKey,
              containerName: azureContainer,
            };
      case 'aws_s3':
        return {
          accessKeyId: s3AccessKeyId,
          secretAccessKey: s3SecretAccessKey,
          sessionToken: s3SessionToken || undefined,
          bucket: s3Bucket,
          region: s3Region,
        };
      default:
        return {};
    }
  };

  const getTestEndpoint = () => {
    switch (type) {
      case 'postgresql': return '/postgres/test-connection';
      case 'azure_blob': return '/azureblob/test-connection';
      case 'aws_s3': return '/s3/test-connection';
      default: return '';
    }
  };

  const getSaveEndpoint = () => {
    switch (type) {
      case 'postgresql': return '/output-targets/postgres';
      case 'azure_blob': return '/output-targets/azureblob';
      case 'aws_s3': return '/output-targets/s3';
      default: return '';
    }
  };

  const isValid = () => {
    if (!displayName.trim()) return false;
    switch (type) {
      case 'postgresql':
        return pgHost && pgDatabase && pgUser;
      case 'azure_blob':
        return azureContainer && (azureConnectionString || (azureAccountName && azureAccountKey));
      case 'aws_s3':
        return s3Bucket && s3Region && s3AccessKeyId && s3SecretAccessKey;
      default:
        return false;
    }
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    setError(null);

    try {
      const res = await authFetch(getTestEndpoint(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildTestPayload()),
      });

      const data = await res.json();
      setTestResult(data);

      if (!data.success) {
        setError(data.message || 'Connection test failed');
      }
    } catch (err) {
      setError(err.message);
      setTestResult({ success: false, message: err.message });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    try {
      const res = await authFetch(getSaveEndpoint(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildPayload()),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save target');
      }

      onComplete();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const renderPostgresForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Host *</label>
          <input
            type="text"
            value={pgHost}
            onChange={(e) => setPgHost(e.target.value)}
            placeholder="localhost or db.example.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Port</label>
          <input
            type="text"
            value={pgPort}
            onChange={(e) => setPgPort(e.target.value)}
            placeholder="5432"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Database *</label>
        <input
          type="text"
          value={pgDatabase}
          onChange={(e) => setPgDatabase(e.target.value)}
          placeholder="mydb"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Username *</label>
          <input
            type="text"
            value={pgUser}
            onChange={(e) => setPgUser(e.target.value)}
            placeholder="postgres"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <div className="relative">
            <input
              type={showPasswords.pgPassword ? 'text' : 'password'}
              value={pgPassword}
              onChange={(e) => setPgPassword(e.target.value)}
              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="button"
              onClick={() => togglePassword('pgPassword')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPasswords.pgPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Schema</label>
        <input
          type="text"
          value={pgSchema}
          onChange={(e) => setPgSchema(e.target.value)}
          placeholder="skatalyst"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="ssl"
          checked={pgSsl}
          onChange={(e) => setPgSsl(e.target.checked)}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <label htmlFor="ssl" className="text-sm text-gray-700">Use SSL connection</label>
      </div>
    </div>
  );

  const renderAzureBlobForm = () => (
    <div className="space-y-4">
      {/* Auth method toggle */}
      <div className="flex gap-4 mb-4">
        <label className="flex items-center gap-2">
          <input
            type="radio"
            checked={azureUseConnectionString}
            onChange={() => setAzureUseConnectionString(true)}
            className="text-cyan-600 focus:ring-cyan-500"
          />
          <span className="text-sm text-gray-700">Connection String</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            checked={!azureUseConnectionString}
            onChange={() => setAzureUseConnectionString(false)}
            className="text-cyan-600 focus:ring-cyan-500"
          />
          <span className="text-sm text-gray-700">Account Name + Key</span>
        </label>
      </div>

      {azureUseConnectionString ? (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Connection String *</label>
          <div className="relative">
            <input
              type={showPasswords.azureConnStr ? 'text' : 'password'}
              value={azureConnectionString}
              onChange={(e) => setAzureConnectionString(e.target.value)}
              placeholder="DefaultEndpointsProtocol=https;AccountName=..."
              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent font-mono text-sm"
            />
            <button
              type="button"
              onClick={() => togglePassword('azureConnStr')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPasswords.azureConnStr ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
        </div>
      ) : (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Account Name *</label>
            <input
              type="text"
              value={azureAccountName}
              onChange={(e) => setAzureAccountName(e.target.value)}
              placeholder="mystorageaccount"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Account Key *</label>
            <div className="relative">
              <input
                type={showPasswords.azureKey ? 'text' : 'password'}
                value={azureAccountKey}
                onChange={(e) => setAzureAccountKey(e.target.value)}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent font-mono text-sm"
              />
              <button
                type="button"
                onClick={() => togglePassword('azureKey')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPasswords.azureKey ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>
        </>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Container Name *</label>
        <input
          type="text"
          value={azureContainer}
          onChange={(e) => setAzureContainer(e.target.value)}
          placeholder="my-container"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Path Prefix (optional)</label>
        <input
          type="text"
          value={azurePrefix}
          onChange={(e) => setAzurePrefix(e.target.value)}
          placeholder="outputs/"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
        />
      </div>
    </div>
  );

  const renderS3Form = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Access Key ID *</label>
          <input
            type="text"
            value={s3AccessKeyId}
            onChange={(e) => setS3AccessKeyId(e.target.value)}
            placeholder="AKIAIOSFODNN7EXAMPLE"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent font-mono text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Secret Access Key *</label>
          <div className="relative">
            <input
              type={showPasswords.s3Secret ? 'text' : 'password'}
              value={s3SecretAccessKey}
              onChange={(e) => setS3SecretAccessKey(e.target.value)}
              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent font-mono text-sm"
            />
            <button
              type="button"
              onClick={() => togglePassword('s3Secret')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPasswords.s3Secret ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Session Token (optional)</label>
        <div className="relative">
          <input
            type={showPasswords.s3Token ? 'text' : 'password'}
            value={s3SessionToken}
            onChange={(e) => setS3SessionToken(e.target.value)}
            placeholder="For temporary credentials"
            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent font-mono text-sm"
          />
          <button
            type="button"
            onClick={() => togglePassword('s3Token')}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPasswords.s3Token ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Bucket *</label>
          <input
            type="text"
            value={s3Bucket}
            onChange={(e) => setS3Bucket(e.target.value)}
            placeholder="my-bucket"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Region *</label>
          <select
            value={s3Region}
            onChange={(e) => setS3Region(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="us-east-1">US East (N. Virginia)</option>
            <option value="us-east-2">US East (Ohio)</option>
            <option value="us-west-1">US West (N. California)</option>
            <option value="us-west-2">US West (Oregon)</option>
            <option value="eu-west-1">EU (Ireland)</option>
            <option value="eu-west-2">EU (London)</option>
            <option value="eu-west-3">EU (Paris)</option>
            <option value="eu-central-1">EU (Frankfurt)</option>
            <option value="ap-northeast-1">Asia Pacific (Tokyo)</option>
            <option value="ap-southeast-1">Asia Pacific (Singapore)</option>
            <option value="ap-southeast-2">Asia Pacific (Sydney)</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Key Prefix (optional)</label>
        <input
          type="text"
          value={s3Prefix}
          onChange={(e) => setS3Prefix(e.target.value)}
          placeholder="outputs/"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        />
      </div>
    </div>
  );

  const renderForm = () => {
    switch (type) {
      case 'postgresql': return renderPostgresForm();
      case 'azure_blob': return renderAzureBlobForm();
      case 'aws_s3': return renderS3Form();
      default: return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            {t('outputTargets.addTargetTitle', 'Add {{type}} Target', { type: getTypeLabel() })}
          </h2>
          <button
            onClick={onCancel}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XIcon />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* Display name */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Display Name *</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder={`My ${getTypeLabel()}`}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="mt-1 text-xs text-gray-500">A friendly name to identify this target</p>
          </div>

          {/* Type-specific form */}
          {renderForm()}

          {/* Test result */}
          {testResult && (
            <div className={`mt-4 p-3 rounded-lg ${testResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <div className="flex items-center gap-2">
                {testResult.success ? (
                  <CheckCircleIcon className="text-green-500" />
                ) : (
                  <XIcon className="text-red-500" />
                )}
                <span className={`text-sm font-medium ${testResult.success ? 'text-green-700' : 'text-red-700'}`}>
                  {testResult.message || (testResult.success ? 'Connection successful' : 'Connection failed')}
                </span>
              </div>
              {testResult.details && (
                <pre className="mt-2 text-xs text-gray-600 overflow-x-auto">
                  {JSON.stringify(testResult.details, null, 2)}
                </pre>
              )}
            </div>
          )}

          {/* Error */}
          {error && !testResult && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50">
          <button
            onClick={handleTest}
            disabled={!isValid() || testing}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {testing && <LoadingSpinner />}
            {t('outputTargets.testConnection', 'Test Connection')}
          </button>

          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {t('common.cancel', 'Cancel')}
            </button>
            <button
              onClick={handleSave}
              disabled={!isValid() || saving || (testResult && !testResult.success)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {saving && <LoadingSpinner />}
              {t('outputTargets.saveTarget', 'Save Target')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
