import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import ConnectorWizard from '../components/ConnectorWizard';
import ConnectorsList from '../components/ConnectorsList';
import OneDriveWizard from '../components/OneDriveWizard';
import SharePointWizard from '../components/SharePointWizard';
import GoogleDriveWizard from '../components/GoogleDriveWizard';
import DropboxWizard from '../components/DropboxWizard';
import PostgreSQLWizard from '../components/PostgreSQLWizard';
import MySQLWizard from '../components/MySQLWizard';
import SQLServerWizard from '../components/SQLServerWizard';
import S3Wizard from '../components/S3Wizard';
import AzureBlobWizard from '../components/AzureBlobWizard';
import DatabricksWizard from '../components/DatabricksWizard';
import RunWizard from '../components/RunWizard';
import PaywallModal from '../components/PaywallModal';
import { useQuota } from '../hooks/useQuota';
import { useAuth } from '../contexts/AuthContext';

/**
 * Data Sources Page (/app/connectors)
 *
 * PURPOSE: Configuration layer for reusable data connections.
 * This page is for setting up persistent, reusable connections to data sources.
 *
 * IMPORTANT SEPARATION:
 * - Data Sources = Configuration (here) - set up once, use many times
 * - Data Ingestion = Execution (/app/ingest) - run ingestions using sources or ad-hoc uploads
 *
 * File Upload is NOT a data source - it belongs in Data Ingestion for ad-hoc execution.
 */

// Icons
const PlusIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const PlayIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const FolderIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
  </svg>
);

export default function Connectors() {
  const { t } = useTranslation();
  const { authFetch } = useAuth();
  const navigate = useNavigate();
  const { showPaywall, paywallError, closePaywall, usage, checkQuota } = useQuota();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showWizard, setShowWizard] = useState(false);
  const [showRunWizard, setShowRunWizard] = useState(false);
  const [editingConnector, setEditingConnector] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeProjectId, setActiveProjectId] = useState(null);

  // Scope wizard state for completing setup on pending_scope connectors
  const [scopeWizardConnector, setScopeWizardConnector] = useState(null);
  const [scopeWizardRefreshCallback, setScopeWizardRefreshCallback] = useState(null);

  // Track if we've already handled OAuth callback to prevent infinite loops
  const handledOAuthRef = useRef(false);

  // Handle OAuth callback URL parameters
  useEffect(() => {
    // Check for OAuth callback params
    const oneDriveConnected = searchParams.get('onedrive_connected');
    const sharePointConnected = searchParams.get('sharepoint_connected');
    const connectorId = searchParams.get('connector_id');
    const error = searchParams.get('error');

    // Prevent handling the same callback multiple times
    if (handledOAuthRef.current) return;

    if (oneDriveConnected || sharePointConnected || error) {
      handledOAuthRef.current = true;

      // Clear URL params to prevent issues on refresh
      setSearchParams({}, { replace: true });

      if (error) {
        console.error('[Connectors] OAuth error:', error, searchParams.get('message'));
      } else {
        console.log('[Connectors] OAuth completed for connector:', connectorId);
        // Refresh the connectors list to show the updated connector
        setRefreshKey((prev) => prev + 1);

        // If we have a connector ID, fetch it and open the scope wizard
        if (connectorId) {
          authFetch(`/connectors/${connectorId}`)
            .then(res => res.json())
            .then(connector => {
              if (connector && (connector.status === 'pending_scope' || !connector.scope_confirmed)) {
                // Auto-open the scope wizard for this connector
                setScopeWizardConnector(connector);
              }
            })
            .catch(err => console.error('[Connectors] Error fetching connector:', err));
        }
      }
    }
  }, [searchParams, setSearchParams, authFetch]);

  // Fetch or create default project for run wizard
  useEffect(() => {
    const fetchOrCreateProject = async () => {
      try {
        const res = await authFetch('/projects');
        if (res.ok) {
          const data = await res.json();
          const projects = data.projects || data || [];
          if (projects.length > 0) {
            setActiveProjectId(projects[0].id);
          } else {
            // No projects exist - create a default one
            console.log('[Connectors] No projects found, creating default project');
            const createRes = await authFetch('/projects', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ name: 'Default Project' })
            });
            if (createRes.ok) {
              const newProject = await createRes.json();
              setActiveProjectId(newProject.id);
            }
          }
        }
      } catch (err) {
        console.error('[Connectors] Error fetching/creating project:', err);
      }
    };
    fetchOrCreateProject();
  }, [authFetch]);

  // Handle Run Scan button click
  const handleRunScan = () => {
    if (!activeProjectId) {
      console.error('[Connectors] No project available for run');
      return;
    }
    setShowRunWizard(true);
  };

  // Handle run created - navigate to inventory page
  const handleRunCreated = (run) => {
    setShowRunWizard(false);
    navigate(`/app/runs/${run.id}/inventory`);
  };

  const handleAddConnector = () => {
    // Check quota before opening wizard
    if (checkQuota('connectors')) {
      setEditingConnector(null);
      setShowWizard(true);
    }
  };

  const handleEditConnector = (connector) => {
    // For enterprise connectors (OneDrive, SharePoint, databases), open the scope wizard instead
    const isEnterprise = connector.type === 'enterprise' ||
      connector.enterprise_type === 'onedrive' ||
      connector.enterprise_type === 'sharepoint' ||
      connector.enterprise_type === 'googledrive' ||
      connector.enterprise_type === 'google_drive' ||
      connector.enterprise_type === 'dropbox' ||
      connector.enterprise_type === 's3' ||
      connector.enterprise_type === 'aws_s3' ||
      connector.enterprise_type === 'azureblob' ||
      connector.enterprise_type === 'azure_blob' ||
      connector.enterprise_type === 'postgresql' ||
      connector.enterprise_type === 'mysql' ||
      connector.enterprise_type === 'mssql';

    if (isEnterprise) {
      // Use the scope wizard for enterprise connectors
      setScopeWizardConnector(connector);
      return;
    }

    // For non-enterprise connectors, use the regular wizard
    setEditingConnector(connector);
    setShowWizard(true);
  };

  const handleWizardComplete = (connector) => {
    setShowWizard(false);
    setEditingConnector(null);
    // Refresh the connectors list
    setRefreshKey((prev) => prev + 1);
  };

  const handleWizardCancel = () => {
    setShowWizard(false);
    setEditingConnector(null);
  };

  // Handle "Complete Setup" for pending_scope connectors
  const handleCompleteSetup = (connector, refreshCallback) => {
    setScopeWizardConnector(connector);
    setScopeWizardRefreshCallback(() => refreshCallback);
  };

  // Handle scope wizard completion
  const handleScopeWizardComplete = (connector) => {
    setScopeWizardConnector(null);
    // Refresh the connectors list
    if (scopeWizardRefreshCallback) {
      scopeWizardRefreshCallback();
    }
    setRefreshKey((prev) => prev + 1);
  };

  // Handle scope wizard cancel
  const handleScopeWizardCancel = () => {
    setScopeWizardConnector(null);
    setScopeWizardRefreshCallback(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-ion/10 flex items-center justify-center text-ion">
              <FolderIcon />
            </div>
            <h1 className="text-2xl font-bold text-text-primary dark:text-text-dark-primary">
              {t('connector.pageTitle', 'Data Sources')}
            </h1>
          </div>
          <p className="text-text-secondary dark:text-text-dark-secondary ml-13">
            Configure reusable connections to your data
          </p>
        </div>

        {!showWizard && (
          <div className="flex items-center gap-3">
            <button
              onClick={handleRunScan}
              disabled={!activeProjectId}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white font-medium rounded-button shadow-button hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              <PlayIcon />
              {t('connector.runScan', 'Run Scan')}
            </button>
            <button
              onClick={handleAddConnector}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate text-white font-medium rounded-button shadow-button hover:bg-slate-hover transition-colors"
            >
              <PlusIcon />
              {t('connector.addSource', 'Add Source')}
            </button>
          </div>
        )}
      </div>

      {/* Helper text explaining the purpose of Data Sources */}
      {!showWizard && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
          <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="flex-1">
            <p className="text-sm text-blue-800 font-medium">Data sources are reusable connections</p>
            <p className="text-sm text-blue-700 mt-1">
              Configure your data sources once here, then use them for multiple ingestion runs.
              No data is ingested on this page — this is configuration only.
            </p>
            <Link
              to="/app/ingest"
              className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium mt-2"
            >
              Go to Data Ingestion to start processing
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </div>
      )}

      {/* Quota info */}
      {usage && (
        <div className="flex items-center gap-2 text-sm text-text-secondary dark:text-text-dark-secondary">
          <span>
            {t('connector.quotaInfo', 'Connectors used')}: {usage.connectors}/{usage.connectorsLimit}
          </span>
          {usage.connectors >= usage.connectorsLimit && (
            <span className="text-warning">({t('connector.limitReached', 'Limit reached')})</span>
          )}
        </div>
      )}

      {/* Main content */}
      {showWizard ? (
        <ConnectorWizard
          connector={editingConnector}
          onComplete={handleWizardComplete}
          onCancel={handleWizardCancel}
        />
      ) : (
        <ConnectorsList
          key={refreshKey}
          onAddConnector={handleAddConnector}
          onEditConnector={handleEditConnector}
          onCompleteSetup={handleCompleteSetup}
        />
      )}

      {/* Scope Wizard - for completing setup on pending_scope connectors */}
      {/* Renders appropriate wizard based on connector's enterprise_type */}
      {scopeWizardConnector && scopeWizardConnector.enterprise_type === 'onedrive' && (
        <OneDriveWizard
          existingConnectorId={scopeWizardConnector.id}
          onComplete={handleScopeWizardComplete}
          onCancel={handleScopeWizardCancel}
          authFetch={authFetch}
        />
      )}
      {scopeWizardConnector && scopeWizardConnector.enterprise_type === 'sharepoint' && (
        <SharePointWizard
          existingConnectorId={scopeWizardConnector.id}
          onComplete={handleScopeWizardComplete}
          onCancel={handleScopeWizardCancel}
          authFetch={authFetch}
        />
      )}
      {scopeWizardConnector && (scopeWizardConnector.enterprise_type === 'googledrive' || scopeWizardConnector.enterprise_type === 'google_drive') && (
        <GoogleDriveWizard
          existingConnector={{ id: scopeWizardConnector.id, email: scopeWizardConnector.connectedEmail }}
          onComplete={handleScopeWizardComplete}
          onCancel={handleScopeWizardCancel}
          authFetch={authFetch}
        />
      )}
      {scopeWizardConnector && scopeWizardConnector.enterprise_type === 'dropbox' && (
        <DropboxWizard
          existingConnector={{ id: scopeWizardConnector.id, email: scopeWizardConnector.connectedEmail }}
          onComplete={handleScopeWizardComplete}
          onCancel={handleScopeWizardCancel}
          authFetch={authFetch}
        />
      )}
      {scopeWizardConnector && scopeWizardConnector.enterprise_type === 'postgresql' && (
        <PostgreSQLWizard
          existingConnector={{
            id: scopeWizardConnector.id,
            host: scopeWizardConnector.host || scopeWizardConnector.display_name?.split(' - ')[1],
            database: scopeWizardConnector.database || scopeWizardConnector.display_name?.split(' - ')[1],
          }}
          onComplete={handleScopeWizardComplete}
          onCancel={handleScopeWizardCancel}
          authFetch={authFetch}
        />
      )}
      {scopeWizardConnector && scopeWizardConnector.enterprise_type === 'mysql' && (
        <MySQLWizard
          existingConnector={{
            id: scopeWizardConnector.id,
            host: scopeWizardConnector.host || scopeWizardConnector.display_name?.split(' - ')[1],
            database: scopeWizardConnector.database || scopeWizardConnector.display_name?.split(' - ')[1],
          }}
          onComplete={handleScopeWizardComplete}
          onCancel={handleScopeWizardCancel}
          authFetch={authFetch}
        />
      )}
      {scopeWizardConnector && scopeWizardConnector.enterprise_type === 'mssql' && (
        <SQLServerWizard
          existingConnector={{
            id: scopeWizardConnector.id,
            host: scopeWizardConnector.host || scopeWizardConnector.display_name?.split(' - ')[1],
            database: scopeWizardConnector.database || scopeWizardConnector.display_name?.split(' - ')[1],
          }}
          onComplete={handleScopeWizardComplete}
          onCancel={handleScopeWizardCancel}
          authFetch={authFetch}
        />
      )}
      {scopeWizardConnector && (scopeWizardConnector.enterprise_type === 's3' || scopeWizardConnector.enterprise_type === 'aws_s3') && (
        <S3Wizard
          existingConnector={{
            id: scopeWizardConnector.id,
            region: scopeWizardConnector.region || 'us-east-1',
            buckets: scopeWizardConnector.scope_config?.buckets || [],
          }}
          onComplete={handleScopeWizardComplete}
          onCancel={handleScopeWizardCancel}
          authFetch={authFetch}
        />
      )}
      {scopeWizardConnector && (scopeWizardConnector.enterprise_type === 'azureblob' || scopeWizardConnector.enterprise_type === 'azure_blob') && (
        <AzureBlobWizard
          existingConnector={{
            id: scopeWizardConnector.id,
            containers: scopeWizardConnector.scope_config?.containers || [],
          }}
          onComplete={handleScopeWizardComplete}
          onCancel={handleScopeWizardCancel}
          authFetch={authFetch}
        />
      )}
      {scopeWizardConnector && scopeWizardConnector.enterprise_type === 'databricks' && (
        <DatabricksWizard
          existingConnector={{
            id: scopeWizardConnector.id,
            workspaceUrl: scopeWizardConnector.workspace_url || scopeWizardConnector.display_name?.replace('Databricks - ', ''),
            catalogs: scopeWizardConnector.scope_config?.catalogs || [],
          }}
          onComplete={handleScopeWizardComplete}
          onCancel={handleScopeWizardCancel}
          authFetch={authFetch}
        />
      )}

      {/* Run Wizard modal */}
      {showRunWizard && activeProjectId && (
        <RunWizard
          projectId={activeProjectId}
          onClose={() => setShowRunWizard(false)}
          onRunCreated={handleRunCreated}
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
