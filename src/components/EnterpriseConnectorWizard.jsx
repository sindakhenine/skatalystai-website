/**
 * Enterprise Connector Wizard
 *
 * Multi-step wizard for creating enterprise connectors with:
 * 1. Connector type selection
 * 2. Scope configuration
 * 3. Budget configuration
 * 4. Review and confirmation
 *
 * Per TASK3_CHECKLIST.md Section 3.1: Enterprise Connectors (Safe)
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';

// Icons
const Icons = {
  OneDrive: () => (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
      <path d="M10.5 18.5c-2.5 0-4.5-2-4.5-4.5 0-.83.23-1.6.62-2.27C4.04 11.02 2 8.58 2 5.5 2 5.22 2.22 5 2.5 5s.5.22.5.5c0 2.76 2.24 5 5 5 .92 0 1.78-.25 2.52-.68.38-.22.87-.08 1.08.3s.08.87-.3 1.08c-.63.36-1.31.62-2.03.77-.1.55-.15 1.11-.15 1.68 0 1.93 1.57 3.5 3.5 3.5s3.5-1.57 3.5-3.5c0-.73-.23-1.41-.62-1.97-.32-.47-.18-1.1.29-1.42s1.1-.18 1.42.29c.58.85.91 1.87.91 2.97 0 2.76-2.24 5-5 5z"/>
    </svg>
  ),
  SharePoint: () => (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
    </svg>
  ),
  AzureBlob: () => (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14h-2v-4H7v-2h3V7h2v4h3v2h-3v4z"/>
    </svg>
  ),
  S3: () => (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
    </svg>
  ),
  Database: () => (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <ellipse cx="12" cy="5" rx="9" ry="3"/>
      <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
    </svg>
  ),
  Databricks: () => (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2L3 7v10l9 5 9-5V7l-9-5zm0 2.18l6.63 3.68L12 11.54 5.37 7.86 12 4.18z"/>
    </svg>
  ),
  Check: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  Warning: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  Info: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  ChevronRight: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  ),
  ChevronLeft: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  ),
};

// Connector type definitions with icons
const CONNECTOR_TYPES = {
  onedrive: {
    id: 'onedrive',
    name: 'Microsoft OneDrive',
    description: 'Connect to OneDrive personal or business accounts',
    icon: Icons.OneDrive,
    category: 'cloud_storage',
    available: true,
    requiresOAuth: true,
  },
  sharepoint: {
    id: 'sharepoint',
    name: 'Microsoft SharePoint',
    description: 'Connect to SharePoint sites and document libraries',
    icon: Icons.SharePoint,
    category: 'cloud_storage',
    available: true,
    requiresOAuth: true,
  },
  azure_blob: {
    id: 'azure_blob',
    name: 'Azure Blob Storage',
    description: 'Connect to Azure Blob containers',
    icon: Icons.AzureBlob,
    category: 'cloud_storage',
    available: true,
    requiresOAuth: false,
  },
  aws_s3: {
    id: 'aws_s3',
    name: 'Amazon S3',
    description: 'Connect to S3 buckets',
    icon: Icons.S3,
    category: 'cloud_storage',
    available: true,
    requiresOAuth: false,
  },
  postgresql: {
    id: 'postgresql',
    name: 'PostgreSQL',
    description: 'Connect to PostgreSQL databases',
    icon: Icons.Database,
    category: 'database',
    available: true,
    requiresOAuth: false,
  },
  mysql: {
    id: 'mysql',
    name: 'MySQL',
    description: 'Connect to MySQL databases',
    icon: Icons.Database,
    category: 'database',
    available: true,
    requiresOAuth: false,
  },
  mssql: {
    id: 'mssql',
    name: 'Microsoft SQL Server',
    description: 'Connect to SQL Server databases',
    icon: Icons.Database,
    category: 'database',
    available: true,
    requiresOAuth: false,
  },
  databricks: {
    id: 'databricks',
    name: 'Databricks',
    description: 'Connect to Databricks Unity Catalog',
    icon: Icons.Databricks,
    category: 'data_lake',
    available: true,
    requiresOAuth: false,
  },
};

// Default budget configuration
const DEFAULT_BUDGET = {
  max_bytes: 1073741824, // 1 GB
  max_rows: 100000,
  max_cost_usd: 10.0,
  warn_at_percent: 80,
};

// Format bytes to human readable
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Step indicator component
function StepIndicator({ steps, currentStep }) {
  return (
    <div className="flex items-center justify-center mb-8">
      {steps.map((step, index) => (
        <React.Fragment key={step.id}>
          <div className="flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                index < currentStep
                  ? 'bg-success text-white'
                  : index === currentStep
                  ? 'bg-ion text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
              }`}
            >
              {index < currentStep ? <Icons.Check /> : index + 1}
            </div>
            <span
              className={`mt-2 text-xs font-medium ${
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
              className={`w-16 h-0.5 mx-2 ${
                index < currentStep
                  ? 'bg-success'
                  : 'bg-gray-200 dark:bg-gray-700'
              }`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// Step 1: Type Selection
function TypeSelectionStep({ selectedType, onSelect }) {
  const { t } = useTranslation();
  const categories = {
    cloud_storage: 'Cloud Storage',
    database: 'Databases',
    data_lake: 'Data Lakes',
  };

  return (
    <div>
      <h3 className="text-lg font-semibold text-text-primary dark:text-text-dark-primary mb-4">
        {t('connectors.enterprise.selectType', 'Select Connector Type')}
      </h3>

      {Object.entries(categories).map(([categoryId, categoryName]) => {
        const connectors = Object.values(CONNECTOR_TYPES).filter(
          (c) => c.category === categoryId
        );
        if (connectors.length === 0) return null;

        return (
          <div key={categoryId} className="mb-6">
            <h4 className="text-sm font-medium text-text-secondary dark:text-text-dark-secondary mb-3">
              {categoryName}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {connectors.map((connector) => {
                const Icon = connector.icon;
                const isSelected = selectedType === connector.id;

                return (
                  <button
                    key={connector.id}
                    onClick={() => onSelect(connector.id)}
                    disabled={!connector.available}
                    className={`flex items-start gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                      isSelected
                        ? 'border-ion bg-ion/5'
                        : connector.available
                        ? 'border-light-border dark:border-dark-border hover:border-ion/50 hover:bg-light-soft dark:hover:bg-dark-soft'
                        : 'border-light-border dark:border-dark-border opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <div
                      className={`p-2 rounded-lg ${
                        isSelected
                          ? 'bg-ion text-white'
                          : 'bg-light-soft dark:bg-dark-soft text-text-secondary dark:text-text-dark-secondary'
                      }`}
                    >
                      <Icon />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-text-primary dark:text-text-dark-primary">
                          {connector.name}
                        </span>
                        {!connector.available && (
                          <span className="px-2 py-0.5 text-xs bg-gray-200 dark:bg-gray-700 rounded">
                            Coming Soon
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-text-secondary dark:text-text-dark-secondary mt-1">
                        {connector.description}
                      </p>
                    </div>
                    {isSelected && (
                      <div className="text-ion">
                        <Icons.Check />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Step 2: Scope Configuration
function ScopeConfigStep({ connectorType, scopeConfig, onChange }) {
  const { t } = useTranslation();
  const connector = CONNECTOR_TYPES[connectorType];

  // Different scope fields based on connector type
  const renderScopeFields = () => {
    const category = connector?.category;

    if (category === 'cloud_storage') {
      return (
        <>
          <div className="mb-4">
            <label className="block text-sm font-medium text-text-primary dark:text-text-dark-primary mb-2">
              {connectorType === 'azure_blob' ? 'Containers' :
               connectorType === 'aws_s3' ? 'Buckets' : 'Folders'}
            </label>
            <textarea
              value={scopeConfig.folders?.join('\n') || ''}
              onChange={(e) =>
                onChange({
                  ...scopeConfig,
                  folders: e.target.value.split('\n').filter(Boolean),
                })
              }
              placeholder="Enter one path per line"
              className="w-full h-24 px-4 py-3 rounded-lg border border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface text-text-primary dark:text-text-dark-primary focus:outline-none focus:ring-2 focus:ring-ion/30"
            />
            <p className="mt-1 text-xs text-text-secondary dark:text-text-dark-secondary">
              Specify the folders/containers you want to access
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary dark:text-text-dark-primary mb-2">
                Include Patterns
              </label>
              <input
                type="text"
                value={scopeConfig.include_patterns?.join(', ') || ''}
                onChange={(e) =>
                  onChange({
                    ...scopeConfig,
                    include_patterns: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                  })
                }
                placeholder="*.pdf, *.docx, *.xlsx"
                className="w-full px-4 py-3 rounded-lg border border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface text-text-primary dark:text-text-dark-primary focus:outline-none focus:ring-2 focus:ring-ion/30"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary dark:text-text-dark-primary mb-2">
                Exclude Patterns
              </label>
              <input
                type="text"
                value={scopeConfig.exclude_patterns?.join(', ') || ''}
                onChange={(e) =>
                  onChange({
                    ...scopeConfig,
                    exclude_patterns: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                  })
                }
                placeholder="*.tmp, ~$*"
                className="w-full px-4 py-3 rounded-lg border border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface text-text-primary dark:text-text-dark-primary focus:outline-none focus:ring-2 focus:ring-ion/30"
              />
            </div>
          </div>
        </>
      );
    }

    if (category === 'database') {
      return (
        <>
          <div className="mb-4">
            <label className="block text-sm font-medium text-text-primary dark:text-text-dark-primary mb-2">
              Schemas
            </label>
            <input
              type="text"
              value={scopeConfig.schemas?.join(', ') || ''}
              onChange={(e) =>
                onChange({
                  ...scopeConfig,
                  schemas: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                })
              }
              placeholder="public, sales, inventory"
              className="w-full px-4 py-3 rounded-lg border border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface text-text-primary dark:text-text-dark-primary focus:outline-none focus:ring-2 focus:ring-ion/30"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-text-primary dark:text-text-dark-primary mb-2">
              Tables (leave empty for all)
            </label>
            <textarea
              value={scopeConfig.tables?.join('\n') || ''}
              onChange={(e) =>
                onChange({
                  ...scopeConfig,
                  tables: e.target.value.split('\n').filter(Boolean),
                })
              }
              placeholder="Enter one table per line"
              className="w-full h-24 px-4 py-3 rounded-lg border border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface text-text-primary dark:text-text-dark-primary focus:outline-none focus:ring-2 focus:ring-ion/30"
            />
          </div>

          <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg">
            <div className="flex items-start gap-3">
              <Icons.Info />
              <div>
                <p className="text-sm font-medium text-text-primary dark:text-text-dark-primary">
                  Database Access Mode
                </p>
                <p className="text-sm text-text-secondary dark:text-text-dark-secondary mt-1">
                  By default, only schema metadata is extracted. Enable "Sample Data" to extract actual rows (subject to row limits).
                </p>
              </div>
            </div>
          </div>
        </>
      );
    }

    return null;
  };

  return (
    <div>
      <h3 className="text-lg font-semibold text-text-primary dark:text-text-dark-primary mb-2">
        {t('connectors.enterprise.configureScope', 'Configure Scope')}
      </h3>
      <p className="text-sm text-text-secondary dark:text-text-dark-secondary mb-6">
        Define exactly what data this connector can access. You'll review this before confirming.
      </p>

      {renderScopeFields()}
    </div>
  );
}

// Step 3: Budget Configuration
function BudgetConfigStep({ budgetConfig, onChange }) {
  const { t } = useTranslation();

  return (
    <div>
      <h3 className="text-lg font-semibold text-text-primary dark:text-text-dark-primary mb-2">
        {t('connectors.enterprise.setBudget', 'Set Budget Limits')}
      </h3>
      <p className="text-sm text-text-secondary dark:text-text-dark-secondary mb-6">
        Operations will automatically stop when any budget limit is reached.
      </p>

      <div className="p-4 mb-6 bg-ion/10 border border-ion/20 rounded-lg">
        <div className="flex items-start gap-3">
          <Icons.Warning />
          <p className="text-sm text-text-primary dark:text-text-dark-primary">
            <strong>This run will stop when budget is exceeded.</strong> Budget limits are enforced server-side and cannot be bypassed.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Max Bytes */}
        <div>
          <label className="block text-sm font-medium text-text-primary dark:text-text-dark-primary mb-2">
            Maximum Data Transfer
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min={104857600} // 100 MB
              max={10737418240} // 10 GB
              step={104857600} // 100 MB steps
              value={budgetConfig.max_bytes}
              onChange={(e) =>
                onChange({ ...budgetConfig, max_bytes: parseInt(e.target.value) })
              }
              className="flex-1"
            />
            <span className="w-24 text-right font-medium text-text-primary dark:text-text-dark-primary">
              {formatBytes(budgetConfig.max_bytes)}
            </span>
          </div>
        </div>

        {/* Max Rows */}
        <div>
          <label className="block text-sm font-medium text-text-primary dark:text-text-dark-primary mb-2">
            Maximum Rows (for databases)
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min={1000}
              max={1000000}
              step={1000}
              value={budgetConfig.max_rows}
              onChange={(e) =>
                onChange({ ...budgetConfig, max_rows: parseInt(e.target.value) })
              }
              className="flex-1"
            />
            <span className="w-24 text-right font-medium text-text-primary dark:text-text-dark-primary">
              {budgetConfig.max_rows.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Max Cost */}
        <div>
          <label className="block text-sm font-medium text-text-primary dark:text-text-dark-primary mb-2">
            Maximum Estimated Cost
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min={1}
              max={100}
              step={1}
              value={budgetConfig.max_cost_usd}
              onChange={(e) =>
                onChange({ ...budgetConfig, max_cost_usd: parseFloat(e.target.value) })
              }
              className="flex-1"
            />
            <span className="w-24 text-right font-medium text-text-primary dark:text-text-dark-primary">
              ${budgetConfig.max_cost_usd.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Warning Threshold */}
        <div>
          <label className="block text-sm font-medium text-text-primary dark:text-text-dark-primary mb-2">
            Warning Threshold
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min={50}
              max={95}
              step={5}
              value={budgetConfig.warn_at_percent}
              onChange={(e) =>
                onChange({ ...budgetConfig, warn_at_percent: parseInt(e.target.value) })
              }
              className="flex-1"
            />
            <span className="w-24 text-right font-medium text-text-primary dark:text-text-dark-primary">
              {budgetConfig.warn_at_percent}%
            </span>
          </div>
          <p className="mt-1 text-xs text-text-secondary dark:text-text-dark-secondary">
            You'll be warned when usage reaches this percentage
          </p>
        </div>
      </div>
    </div>
  );
}

// Step 4: Review and Confirm
function ReviewConfirmStep({ connectorType, displayName, scopeConfig, budgetConfig, onConfirm, isConfirming }) {
  const { t } = useTranslation();
  const connector = CONNECTOR_TYPES[connectorType];
  const [confirmed, setConfirmed] = useState(false);

  return (
    <div>
      <h3 className="text-lg font-semibold text-text-primary dark:text-text-dark-primary mb-2">
        {t('connectors.enterprise.reviewConfirm', 'Review & Confirm')}
      </h3>
      <p className="text-sm text-text-secondary dark:text-text-dark-secondary mb-6">
        Please review the connector configuration before confirming.
      </p>

      {/* Connector Summary */}
      <div className="space-y-4 mb-6">
        <div className="p-4 bg-light-soft dark:bg-dark-soft rounded-lg">
          <h4 className="text-sm font-medium text-text-secondary dark:text-text-dark-secondary mb-2">
            Connector
          </h4>
          <div className="flex items-center gap-3">
            {connector && <connector.icon />}
            <div>
              <p className="font-medium text-text-primary dark:text-text-dark-primary">
                {displayName}
              </p>
              <p className="text-sm text-text-secondary dark:text-text-dark-secondary">
                {connector?.name}
              </p>
            </div>
          </div>
        </div>

        {/* Scope Summary */}
        <div className="p-4 bg-light-soft dark:bg-dark-soft rounded-lg">
          <h4 className="text-sm font-medium text-text-secondary dark:text-text-dark-secondary mb-2">
            Scope
          </h4>
          <div className="text-sm text-text-primary dark:text-text-dark-primary space-y-1">
            {scopeConfig.folders?.length > 0 && (
              <p>Folders: {scopeConfig.folders.join(', ')}</p>
            )}
            {scopeConfig.schemas?.length > 0 && (
              <p>Schemas: {scopeConfig.schemas.join(', ')}</p>
            )}
            {scopeConfig.tables?.length > 0 && (
              <p>Tables: {scopeConfig.tables.join(', ')}</p>
            )}
            {scopeConfig.include_patterns?.length > 0 && (
              <p>Include: {scopeConfig.include_patterns.join(', ')}</p>
            )}
            {scopeConfig.exclude_patterns?.length > 0 && (
              <p>Exclude: {scopeConfig.exclude_patterns.join(', ')}</p>
            )}
          </div>
        </div>

        {/* Budget Summary */}
        <div className="p-4 bg-light-soft dark:bg-dark-soft rounded-lg">
          <h4 className="text-sm font-medium text-text-secondary dark:text-text-dark-secondary mb-2">
            Budget Limits
          </h4>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-text-secondary dark:text-text-dark-secondary">Max Data</p>
              <p className="font-medium text-text-primary dark:text-text-dark-primary">
                {formatBytes(budgetConfig.max_bytes)}
              </p>
            </div>
            <div>
              <p className="text-text-secondary dark:text-text-dark-secondary">Max Rows</p>
              <p className="font-medium text-text-primary dark:text-text-dark-primary">
                {budgetConfig.max_rows.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-text-secondary dark:text-text-dark-secondary">Max Cost</p>
              <p className="font-medium text-text-primary dark:text-text-dark-primary">
                ${budgetConfig.max_cost_usd.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Checkbox */}
      <div className="p-4 border-2 border-warning/30 bg-warning/5 rounded-lg mb-4">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
            className="mt-1 w-5 h-5 rounded border-gray-300 text-ion focus:ring-ion"
          />
          <span className="text-sm text-text-primary dark:text-text-dark-primary">
            I confirm that I want to grant this connector access to the specified scope.
            I understand that all operations will be logged and budget limits will be enforced.
          </span>
        </label>
      </div>

      <button
        onClick={onConfirm}
        disabled={!confirmed || isConfirming}
        className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
          confirmed && !isConfirming
            ? 'bg-ion text-white hover:bg-ion/90'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
        }`}
      >
        {isConfirming ? 'Creating Connector...' : 'Confirm & Create Connector'}
      </button>
    </div>
  );
}

// Main Wizard Component
export default function EnterpriseConnectorWizard({ projectId, onComplete, onCancel }) {
  const { t } = useTranslation();
  const { authFetch } = useAuth();

  const [currentStep, setCurrentStep] = useState(0);
  const [selectedType, setSelectedType] = useState(null);
  const [displayName, setDisplayName] = useState('');
  const [scopeConfig, setScopeConfig] = useState({});
  const [budgetConfig, setBudgetConfig] = useState({ ...DEFAULT_BUDGET });
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState(null);

  const steps = [
    { id: 'type', label: t('connectors.enterprise.steps.type', 'Type') },
    { id: 'scope', label: t('connectors.enterprise.steps.scope', 'Scope') },
    { id: 'budget', label: t('connectors.enterprise.steps.budget', 'Budget') },
    { id: 'confirm', label: t('connectors.enterprise.steps.confirm', 'Confirm') },
  ];

  // Auto-generate display name when type is selected
  useEffect(() => {
    if (selectedType && !displayName) {
      const connector = CONNECTOR_TYPES[selectedType];
      setDisplayName(`My ${connector.name}`);
    }
  }, [selectedType, displayName]);

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return selectedType !== null;
      case 1:
        // At least some scope should be configured
        return (
          scopeConfig.folders?.length > 0 ||
          scopeConfig.schemas?.length > 0 ||
          scopeConfig.tables?.length > 0
        );
      case 2:
        return budgetConfig.max_bytes > 0;
      case 3:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCreate = async () => {
    setIsCreating(true);
    setError(null);

    try {
      const response = await authFetch('/connectors/enterprise', {
        method: 'POST',
        body: JSON.stringify({
          projectId,
          enterpriseType: selectedType,
          displayName,
          scopeConfig,
          budgetConfig,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create connector');
      }

      const connector = await response.json();

      // Confirm the scope
      const confirmResponse = await authFetch(
        `/connectors/enterprise/${connector.id}/scope/confirm`,
        { method: 'POST' }
      );

      if (!confirmResponse.ok) {
        const data = await confirmResponse.json();
        throw new Error(data.error || 'Failed to confirm scope');
      }

      onComplete(connector);
    } catch (err) {
      setError(err.message);
      setIsCreating(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <TypeSelectionStep
            selectedType={selectedType}
            onSelect={setSelectedType}
          />
        );
      case 1:
        return (
          <ScopeConfigStep
            connectorType={selectedType}
            scopeConfig={scopeConfig}
            onChange={setScopeConfig}
          />
        );
      case 2:
        return (
          <BudgetConfigStep
            budgetConfig={budgetConfig}
            onChange={setBudgetConfig}
          />
        );
      case 3:
        return (
          <ReviewConfirmStep
            connectorType={selectedType}
            displayName={displayName}
            scopeConfig={scopeConfig}
            budgetConfig={budgetConfig}
            onConfirm={handleCreate}
            isConfirming={isCreating}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <StepIndicator steps={steps} currentStep={currentStep} />

      {/* Display Name Input (shown on step 0) */}
      {currentStep === 0 && selectedType && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-text-primary dark:text-text-dark-primary mb-2">
            Connector Name
          </label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="My OneDrive Connector"
            className="w-full px-4 py-3 rounded-lg border border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface text-text-primary dark:text-text-dark-primary focus:outline-none focus:ring-2 focus:ring-ion/30"
          />
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-4 bg-error/10 border border-error/20 rounded-lg text-error text-sm">
          {error}
        </div>
      )}

      {/* Step Content */}
      <div className="mb-8">{renderStep()}</div>

      {/* Navigation */}
      {currentStep < 3 && (
        <div className="flex justify-between">
          <button
            onClick={currentStep === 0 ? onCancel : handleBack}
            className="flex items-center gap-2 px-4 py-2 text-text-secondary dark:text-text-dark-secondary hover:text-text-primary dark:hover:text-text-dark-primary transition-colors"
          >
            <Icons.ChevronLeft />
            {currentStep === 0 ? t('common.cancel') : t('common.back')}
          </button>

          <button
            onClick={handleNext}
            disabled={!canProceed()}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-colors ${
              canProceed()
                ? 'bg-ion text-white hover:bg-ion/90'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
            }`}
          >
            {t('common.next')}
            <Icons.ChevronRight />
          </button>
        </div>
      )}
    </div>
  );
}
