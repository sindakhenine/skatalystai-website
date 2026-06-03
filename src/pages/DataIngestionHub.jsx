/**
 * Data Ingestion Page (/app/ingest)
 *
 * PURPOSE: Execution layer for running data ingestions.
 * This is where work actually happens - processing files and extracting content.
 *
 * IMPORTANT SEPARATION:
 * - Data Sources = Configuration (/app/connectors) - reusable connections
 * - Data Ingestion = Execution (here) - run ingestions using sources or ad-hoc uploads
 *
 * Ingestion options:
 * - Upload Files (ad-hoc) - for one-time file uploads, NOT a reusable connection
 * - Cloud Storage - use configured OneDrive, SharePoint, Google Drive sources
 * - Databases - use configured PostgreSQL, MySQL, MSSQL sources
 * - Servers/Data Lake - use configured S3, Azure Blob, Databricks sources
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import GuidedIngestionOverlay, { StepTypes, IngestionIcons } from '../components/GuidedIngestionOverlay';
import OneDriveWizard from '../components/OneDriveWizard';
import LocalFolderWizard from '../components/LocalFolderWizard';
import GoogleDriveWizard from '../components/GoogleDriveWizard';
import DropboxWizard from '../components/DropboxWizard';
import SharePointWizard from '../components/SharePointWizard';
import MySQLWizard from '../components/MySQLWizard';
import PostgreSQLWizard from '../components/PostgreSQLWizard';
import SQLServerWizard from '../components/SQLServerWizard';
import S3Wizard from '../components/S3Wizard';
import AzureBlobWizard from '../components/AzureBlobWizard';
import DatabricksWizard from '../components/DatabricksWizard';
import { useAuth } from '../contexts/AuthContext';
import { TourTrigger, TOUR_IDS } from '../components/GuidedTour';

/**
 * Capacity Gauge Component - Shows data usage toward 1GB limit (free tier)
 */
function CapacityGauge({ usedBytes = 0, limitBytes = 1024 * 1024 * 1024 }) {
  const usedPercent = Math.min(100, (usedBytes / limitBytes) * 100);
  const usedMB = usedBytes / (1024 * 1024);
  const limitGB = limitBytes / (1024 * 1024 * 1024);

  // Format display
  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  // Color based on usage
  const getColor = () => {
    if (usedPercent >= 90) return { ring: 'text-error', bg: 'bg-error', label: 'text-error' };
    if (usedPercent >= 70) return { ring: 'text-amber-500', bg: 'bg-amber-500', label: 'text-amber-600' };
    return { ring: 'text-success', bg: 'bg-success', label: 'text-success' };
  };

  const colors = getColor();

  // SVG circle calculations
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - usedPercent / 100);

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6 shadow-sm">
      <div className="flex items-center gap-6">
        {/* Circular Gauge */}
        <div className="relative flex-shrink-0">
          <svg className="w-28 h-28 transform -rotate-90">
            {/* Background circle */}
            <circle
              cx="56"
              cy="56"
              r={radius}
              stroke="currentColor"
              strokeWidth="10"
              fill="none"
              className="text-gray-100"
            />
            {/* Progress circle */}
            <circle
              cx="56"
              cy="56"
              r={radius}
              stroke="currentColor"
              strokeWidth="10"
              fill="none"
              strokeLinecap="round"
              className={`${colors.ring} transition-all duration-500`}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
            />
          </svg>
          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-xl font-bold ${colors.label}`}>{usedPercent.toFixed(1)}%</span>
            <span className="text-xs text-gray-500">used</span>
          </div>
        </div>

        {/* Details */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-5 h-5 text-slate" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
            </svg>
            <h3 className="font-semibold text-gray-900">Storage Capacity</h3>
            <span className="text-xs bg-slate/10 text-slate px-2 py-0.5 rounded-full">Free Tier</span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Used</span>
              <span className="font-medium text-gray-900">{formatSize(usedBytes)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Available</span>
              <span className="font-medium text-gray-900">{formatSize(limitBytes - usedBytes)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Limit</span>
              <span className="font-medium text-gray-900">{limitGB} GB</span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-3">
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full ${colors.bg} rounded-full transition-all duration-500`}
                style={{ width: `${usedPercent}%` }}
              />
            </div>
          </div>

          {usedPercent >= 90 && (
            <p className="mt-2 text-xs text-error flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Storage almost full. Upgrade for more capacity.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Connector Status Types
 * - production: Fully functional, ready for use
 * - preview: Working but metadata-only or limited features
 * - planned: Explainer-only, no backend execution
 */
const CONNECTOR_STATUS = {
  PRODUCTION: 'production',
  PREVIEW: 'preview',
  PLANNED: 'planned',
};

/**
 * Ingestion type definitions
 * Every connector has a clear status and opens a guided flow
 */
const INGESTION_TYPES = [
  {
    id: 'local',
    title: 'Upload Files',
    description: 'Upload files for this ingestion run (ad-hoc, not a saved source)',
    icon: 'local',
    color: 'blue',
    status: CONNECTOR_STATUS.PRODUCTION,
    statusTooltip: 'Upload files directly for processing',
    badge: 'Ad-hoc',
    options: [
      { id: 'upload', label: 'File Upload', description: 'Drag & drop or browse to upload files', status: CONNECTOR_STATUS.PRODUCTION },
      { id: 'local_folder', label: 'Local Folder', description: 'Select a folder via browser dialog', status: CONNECTOR_STATUS.PRODUCTION, badge: 'Chrome / Edge' },
    ],
  },
  {
    id: 'cloud',
    title: 'Cloud Storage',
    description: 'Connect to cloud storage services',
    icon: 'cloud',
    color: 'ion',
    status: CONNECTOR_STATUS.PRODUCTION,
    statusTooltip: 'Production ready - read-only access with scope controls',
    options: [
      { id: 'onedrive', label: 'OneDrive', description: 'Microsoft OneDrive personal or business', status: CONNECTOR_STATUS.PRODUCTION, badge: 'Production' },
      { id: 'sharepoint', label: 'SharePoint', description: 'Microsoft SharePoint sites', status: CONNECTOR_STATUS.PRODUCTION, badge: 'Production' },
      { id: 'google_drive', label: 'Google Drive', description: 'Google Drive personal or workspace', status: CONNECTOR_STATUS.PRODUCTION, badge: 'Production' },
      { id: 'dropbox', label: 'Dropbox', description: 'Dropbox personal or business', status: CONNECTOR_STATUS.PRODUCTION, badge: 'Production' },
    ],
  },
  {
    id: 'database',
    title: 'Databases',
    description: 'Connect to SQL and NoSQL databases',
    icon: 'database',
    color: 'green',
    status: CONNECTOR_STATUS.PRODUCTION,
    statusTooltip: 'Production ready - read-only schema and data access',
    options: [
      { id: 'postgresql', label: 'PostgreSQL', description: 'Open source relational database', status: CONNECTOR_STATUS.PRODUCTION, badge: 'Production' },
      { id: 'mysql', label: 'MySQL', description: 'Popular relational database', status: CONNECTOR_STATUS.PRODUCTION, badge: 'Production' },
      { id: 'mssql', label: 'SQL Server', description: 'Microsoft SQL Server', status: CONNECTOR_STATUS.PRODUCTION, badge: 'Production' },
    ],
  },
  {
    id: 'server',
    title: 'Servers & Data Lakes',
    description: 'Connect to enterprise storage and data platforms',
    icon: 'server',
    color: 'orange',
    status: CONNECTOR_STATUS.PRODUCTION,
    statusTooltip: 'Production ready - enterprise storage and data platform access',
    options: [
      { id: 's3', label: 'Amazon S3', description: 'AWS Simple Storage Service', status: CONNECTOR_STATUS.PRODUCTION, badge: 'Production' },
      { id: 'azure_blob', label: 'Azure Blob', description: 'Microsoft Azure Blob Storage', status: CONNECTOR_STATUS.PRODUCTION, badge: 'Production' },
      { id: 'databricks', label: 'Databricks', description: 'Unified analytics platform', status: CONNECTOR_STATUS.PRODUCTION, badge: 'Production' },
      { id: 'local_agent', label: 'Local Server Agent', description: 'On-premise server connector', status: CONNECTOR_STATUS.PLANNED, badge: 'Planned' },
    ],
  },
];

/**
 * Step definitions for each ingestion type
 */
const GUIDED_STEPS = {
  local: [
    {
      type: StepTypes.EXPLANATION,
      label: 'About Local File Ingestion',
      content: 'Local file ingestion allows you to upload files directly to Skatalyst or connect to a folder on your machine.',
      highlights: [
        'Documents: PDF, DOCX, XLSX, TXT, CSV, JSON, and more',
        'Images: PNG, JPG, GIF, WebP with OCR text extraction',
        'Video: MP4, MOV, AVI with metadata and structural analysis',
        'Files are processed locally - nothing leaves your machine until you export',
      ],
    },
    {
      type: StepTypes.GUIDANCE,
      label: 'How It Works',
      animation: 'folder',
      message: 'Select files or folders to scan. Skatalyst will extract text, metadata, and structure from your documents.',
    },
    {
      type: StepTypes.CONFIRMATION,
      label: 'Before You Continue',
      description: 'Please confirm you understand the following:',
      checkboxes: [
        {
          id: 'local_understand_processing',
          label: 'I understand files will be processed locally',
          description: 'Document content will be extracted and stored in your local database.',
        },
        {
          id: 'local_understand_scope',
          label: 'I will select specific files or folders to scan',
          description: 'Only the files you choose will be processed.',
        },
      ],
    },
  ],

  cloud: [
    {
      type: StepTypes.EXPLANATION,
      label: 'About Cloud Storage Connectors',
      content: 'Cloud storage connectors allow you to connect to your cloud drives and selectively scan files.',
      highlights: [
        'Read-only access - Skatalyst never modifies your cloud files',
        'You choose exactly which folders to scan',
        'Budget controls prevent unexpected costs or data overruns',
        'Full audit trail of all operations',
      ],
      warning: {
        title: 'Preview Mode',
        message: 'Cloud connectors are currently in preview. Some features use mock data for demonstration.',
      },
    },
    {
      type: StepTypes.GUIDANCE,
      label: 'Scope & Budget Controls',
      animation: 'shield',
      message: 'Before any files are accessed, you\'ll confirm the exact scope and set budget limits. Nothing happens without your explicit consent.',
    },
    {
      type: StepTypes.CONFIRMATION,
      label: 'Before You Connect',
      description: 'Please confirm you understand the following safety measures:',
      checkboxes: [
        {
          id: 'cloud_understand_readonly',
          label: 'Skatalyst requests read-only access',
          description: 'We will never modify, delete, or move your files.',
        },
        {
          id: 'cloud_understand_scope',
          label: 'I will select specific folders to scan',
          description: 'Only folders you explicitly select will be accessed.',
        },
        {
          id: 'cloud_understand_budget',
          label: 'I can set budget limits to control data transfer',
          description: 'Set limits on bytes, files, or cost to prevent overruns.',
        },
        {
          id: 'cloud_understand_audit',
          label: 'All operations are logged for audit',
          description: 'You can review what was accessed at any time.',
        },
      ],
    },
  ],

  database: [
    {
      type: StepTypes.EXPLANATION,
      label: 'About Database Connectors',
      content: 'Database connectors allow you to connect to your databases and extract schema information and sample data.',
      highlights: [
        'Read-only queries - no data modification',
        'Query-level budget controls',
        'Schema extraction without full table scans',
        'PostgreSQL: Production ready',
      ],
    },
    {
      type: StepTypes.GUIDANCE,
      label: 'How It Works',
      animation: 'database',
      message: 'Provide connection credentials, select tables to analyze, and Skatalyst will extract schema and sample data with full budget controls.',
    },
    {
      type: StepTypes.CONFIRMATION,
      label: 'Before You Connect',
      description: 'Please confirm you understand the following:',
      checkboxes: [
        {
          id: 'db_understand_readonly',
          label: 'Skatalyst performs read-only queries',
          description: 'We never modify, delete, or insert data.',
        },
        {
          id: 'db_understand_scope',
          label: 'I will select specific tables to analyze',
          description: 'Only tables you choose will be queried.',
        },
        {
          id: 'db_understand_credentials',
          label: 'Credentials are encrypted at rest',
          description: 'Connection strings are stored securely.',
        },
      ],
    },
  ],

  server: [
    {
      type: StepTypes.EXPLANATION,
      label: 'About Server & Data Lake Connectors',
      content: 'Connect to enterprise storage systems and data lakes for large-scale document processing.',
      highlights: [
        'Support for S3, Azure Blob, and Databricks',
        'Prefix-based scanning for targeted access',
        'Enterprise-grade authentication (IAM, Service Principals)',
        'Full audit trail of all operations',
      ],
      warning: {
        title: 'Planned Feature',
        message: 'Server and data lake connectors are planned for a future release. This guide explains what they will do.',
      },
    },
    {
      type: StepTypes.GUIDANCE,
      label: 'What to Expect',
      animation: 'shield',
      message: 'When available, you\'ll configure credentials, select buckets/containers, and set prefix filters. All access is read-only with budget controls.',
    },
    {
      type: StepTypes.CONFIRMATION,
      label: 'No Data Accessed Yet',
      description: 'This connector is in planning. Here\'s what to expect when it\'s ready:',
      checkboxes: [
        {
          id: 'server_understand_planned',
          label: 'I understand this is a planned feature',
          description: 'No backend execution occurs - this is an explainer only.',
        },
        {
          id: 'server_understand_readonly',
          label: 'When available, access will be read-only',
          description: 'Skatalyst will never modify your cloud storage.',
        },
      ],
    },
  ],

  // Individual planned connector explainers
  s3: [
    {
      type: StepTypes.EXPLANATION,
      label: 'Amazon S3 Connector',
      content: 'Connect to Amazon S3 buckets to process documents, images, and structured data stored in AWS.',
      highlights: [
        'IAM access key or role-based authentication',
        'Bucket and prefix-level scope control',
        'Read-only access - no modifications',
        'Support for all S3 storage classes',
      ],
    },
    {
      type: StepTypes.GUIDANCE,
      label: 'How It Works',
      animation: 'shield',
      message: 'Enter your AWS credentials (Access Key ID + Secret) and bucket name. You can optionally specify a prefix to limit scope. After connecting, preview what will be processed before confirming.',
    },
    {
      type: StepTypes.CONFIRMATION,
      label: 'Before You Connect',
      description: 'Please confirm:',
      checkboxes: [
        {
          id: 's3_readonly',
          label: 'Skatalyst requests read-only access',
          description: 'Only GetObject and ListBucket permissions are used.',
        },
        {
          id: 's3_audit',
          label: 'All access is logged for compliance',
          description: 'You can review activity in the audit log.',
        },
      ],
    },
  ],

  azure_blob: [
    {
      type: StepTypes.EXPLANATION,
      label: 'Azure Blob Storage Connector',
      content: 'Connect to Azure Blob Storage containers to process enterprise documents and data.',
      highlights: [
        'Connection string or SAS token authentication',
        'Container and path prefix scope control',
        'Read-only access with RBAC integration',
        'Support for hot, cool, and archive tiers',
      ],
    },
    {
      type: StepTypes.GUIDANCE,
      label: 'How It Works',
      animation: 'shield',
      message: 'Enter your Azure Storage connection string or SAS token and container name. After connecting, preview your blobs and select what to process.',
    },
    {
      type: StepTypes.CONFIRMATION,
      label: 'Before You Connect',
      description: 'Please confirm:',
      checkboxes: [
        {
          id: 'azure_readonly',
          label: 'Skatalyst requests read-only access',
          description: 'Only blob read operations are performed.',
        },
        {
          id: 'azure_audit',
          label: 'All access is logged for compliance',
          description: 'You can review activity in the audit log.',
        },
      ],
    },
  ],

  databricks: [
    {
      type: StepTypes.EXPLANATION,
      label: 'Databricks Connector',
      content: 'Connect to Databricks workspaces to access Unity Catalog metadata, Delta Lake tables, and schema information.',
      highlights: [
        'Unity Catalog integration for governance',
        'Delta Lake table schema extraction',
        'Catalog and schema enumeration',
        'Read-only queries with personal access token',
      ],
    },
    {
      type: StepTypes.GUIDANCE,
      label: 'How It Works',
      animation: 'shield',
      message: 'Enter your Databricks workspace URL and personal access token. After connecting, browse catalogs and schemas to select what to process.',
    },
    {
      type: StepTypes.CONFIRMATION,
      label: 'Before You Connect',
      description: 'Please confirm:',
      checkboxes: [
        {
          id: 'databricks_readonly',
          label: 'Skatalyst requests read-only access',
          description: 'Only catalog metadata and table schemas are accessed.',
        },
        {
          id: 'databricks_audit',
          label: 'All access is logged for compliance',
          description: 'You can review activity in the audit log.',
        },
      ],
    },
  ],

  local_agent: [
    {
      type: StepTypes.EXPLANATION,
      label: 'Local Server Agent',
      content: 'Deploy a lightweight agent on your on-premise servers to securely scan file shares and internal systems.',
      highlights: [
        'Agent runs inside your network perimeter',
        'No inbound firewall rules required',
        'Encrypted communication via HTTPS',
        'Selective folder scanning with exclusions',
      ],
      warning: {
        title: 'Planned Feature',
        message: 'This connector is planned for a future release. No data will be accessed.',
      },
    },
    {
      type: StepTypes.GUIDANCE,
      label: 'How It Will Work',
      animation: 'folder',
      message: 'Download and install the agent, configure target paths, and the agent will securely transmit metadata to Skatalyst without exposing your network.',
    },
    {
      type: StepTypes.CONFIRMATION,
      label: 'No Data Accessed',
      description: 'This is an educational explainer only:',
      checkboxes: [
        {
          id: 'agent_understand',
          label: 'I understand no data is accessed yet',
          description: 'This connector is planned for a future release.',
        },
      ],
    },
  ],

  // Production cloud connectors
  google_drive: [
    {
      type: StepTypes.EXPLANATION,
      label: 'Google Drive Connector',
      content: 'Connect to Google Drive personal or Workspace accounts to process documents and files.',
      highlights: [
        'OAuth 2.0 authentication with Google',
        'Drive and folder-level scope control',
        'Read-only access to files and metadata',
        'Support for Google Docs, Sheets, and Slides',
      ],
    },
    {
      type: StepTypes.GUIDANCE,
      label: 'How It Works',
      animation: 'cloud',
      message: 'Click "Connect" to sign in with Google. Select the drives and folders you want to scan, preview the files, then confirm.',
    },
    {
      type: StepTypes.CONFIRMATION,
      label: 'Before You Connect',
      description: 'Please confirm you understand the following:',
      checkboxes: [
        {
          id: 'gdrive_readonly',
          label: 'Skatalyst requests read-only access',
          description: 'We will never modify, delete, or move your files.',
        },
        {
          id: 'gdrive_scope',
          label: 'I will select specific folders to scan',
          description: 'Only folders you explicitly select will be accessed.',
        },
      ],
    },
  ],

  dropbox: [
    {
      type: StepTypes.EXPLANATION,
      label: 'Dropbox Connector',
      content: 'Connect to Dropbox personal or business accounts to process stored documents.',
      highlights: [
        'OAuth 2.0 authentication with Dropbox',
        'Folder-level scope control',
        'Read-only access with full audit',
        'Support for all Dropbox file types',
      ],
    },
    {
      type: StepTypes.GUIDANCE,
      label: 'How It Works',
      animation: 'cloud',
      message: 'Click "Connect" to sign in with Dropbox. Select folders to scan, preview the contents, then confirm ingestion.',
    },
    {
      type: StepTypes.CONFIRMATION,
      label: 'Before You Connect',
      description: 'Please confirm you understand the following:',
      checkboxes: [
        {
          id: 'dropbox_readonly',
          label: 'Skatalyst requests read-only access',
          description: 'We will never modify, delete, or move your files.',
        },
        {
          id: 'dropbox_scope',
          label: 'I will select specific folders to scan',
          description: 'Only folders you explicitly select will be accessed.',
        },
      ],
    },
  ],

  // Production database connectors
  mysql: [
    {
      type: StepTypes.EXPLANATION,
      label: 'MySQL Connector',
      content: 'Connect to MySQL databases to extract schema information and sample data.',
      highlights: [
        'Standard MySQL authentication',
        'Read-only queries with row limits',
        'Schema and table selection',
        'Support for MySQL 5.7+ and MariaDB',
      ],
    },
    {
      type: StepTypes.GUIDANCE,
      label: 'How It Works',
      animation: 'database',
      message: 'Enter your connection details (host, port, database, credentials). We\'ll connect read-only, list schemas and tables, and let you preview before ingestion.',
    },
    {
      type: StepTypes.CONFIRMATION,
      label: 'Before You Connect',
      description: 'Please confirm you understand the following:',
      checkboxes: [
        {
          id: 'mysql_readonly',
          label: 'Skatalyst performs read-only queries',
          description: 'We never modify, delete, or insert data.',
        },
        {
          id: 'mysql_scope',
          label: 'I will select specific tables to analyze',
          description: 'Only tables you choose will be queried.',
        },
      ],
    },
  ],

  mssql: [
    {
      type: StepTypes.EXPLANATION,
      label: 'SQL Server Connector',
      content: 'Connect to Microsoft SQL Server databases for enterprise data extraction.',
      highlights: [
        'SQL Server authentication',
        'Read-only queries with schema filtering',
        'Support for SQL Server 2016+',
        'Azure SQL Database compatible',
      ],
    },
    {
      type: StepTypes.GUIDANCE,
      label: 'How It Works',
      animation: 'database',
      message: 'Enter server, database, and credentials. We\'ll enumerate schemas and tables, letting you select and preview before any data extraction.',
    },
    {
      type: StepTypes.CONFIRMATION,
      label: 'Before You Connect',
      description: 'Please confirm you understand the following:',
      checkboxes: [
        {
          id: 'mssql_readonly',
          label: 'Skatalyst performs read-only queries',
          description: 'We never modify, delete, or insert data.',
        },
        {
          id: 'mssql_scope',
          label: 'I will select specific tables to analyze',
          description: 'Only tables you choose will be queried.',
        },
      ],
    },
  ],
};

/**
 * Unified card styling - matches dashboard DNA
 * Uses slate as primary accent, gray scale for everything else
 */
const CARD_STYLE = {
  base: 'bg-white border-gray-200',
  icon: 'bg-gray-100 text-slate',
  hover: 'hover:border-slate/50 hover:shadow-md',
  tag: 'bg-gray-100 text-gray-700',
};

/**
 * Status badge component - Production (green), Preview (amber), Planned (grey)
 */
function StatusBadge({ status, tooltip }) {
  const config = {
    production: {
      style: 'bg-green-50 text-green-700 border-green-200',
      label: 'Production',
      dot: 'bg-green-500',
    },
    preview: {
      style: 'bg-amber-50 text-amber-700 border-amber-200',
      label: 'Preview',
      dot: 'bg-amber-500',
    },
    planned: {
      style: 'bg-gray-100 text-gray-600 border-gray-200',
      label: 'Planned',
      dot: 'bg-gray-400',
    },
  };

  const cfg = config[status];
  if (!cfg) return null;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border ${cfg.style}`}
      title={tooltip}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}></span>
      {cfg.label}
    </span>
  );
}

/**
 * Ingestion type card component - matches dashboard card pattern
 * All cards are clickable and open guided flows - never feels broken
 */
function IngestionCard({ type, onClick, dataTour }) {
  const IconComponent = () => {
    switch (type.icon) {
      case 'local':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
        );
      case 'cloud':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
          </svg>
        );
      case 'database':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
          </svg>
        );
      case 'server':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
          </svg>
        );
      default:
        return null;
    }
  };

  // Option badge styling based on status
  const getOptionBadgeStyle = (opt) => {
    if (opt.status === CONNECTOR_STATUS.PRODUCTION) {
      return 'bg-green-50 text-green-700 border border-green-200';
    } else if (opt.status === CONNECTOR_STATUS.PREVIEW) {
      return 'bg-amber-50 text-amber-700 border border-amber-200';
    } else {
      return 'bg-gray-100 text-gray-500 border border-gray-200';
    }
  };

  return (
    <button
      onClick={() => onClick(type)}
      data-tour={dataTour}
      className="relative p-6 rounded-xl border bg-white text-left transition-all duration-200 cursor-pointer border-gray-200 hover:border-slate/40 hover:shadow-lg group"
    >
      {/* Hover hint for Planned connectors */}
      {type.status === CONNECTOR_STATUS.PLANNED && (
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-[10px] text-gray-400">Click to learn more</span>
        </div>
      )}

      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gray-100 text-slate">
          <IconComponent />
        </div>
        <StatusBadge status={type.status} tooltip={type.statusTooltip} />
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-2">{type.title}</h3>
      <p className="text-sm text-gray-500 mb-4">{type.description}</p>

      <div className="flex flex-wrap gap-2">
        {type.options.slice(0, 3).map((opt) => (
          <span
            key={opt.id}
            className={`text-xs px-2 py-1 rounded ${getOptionBadgeStyle(opt)}`}
          >
            {opt.label}
          </span>
        ))}
        {type.options.length > 3 && (
          <span className="text-xs px-2 py-1 rounded bg-gray-50 text-gray-400">
            +{type.options.length - 3} more
          </span>
        )}
      </div>
    </button>
  );
}

/**
 * Connector option selector (shown after guided flow) - matches dashboard modal pattern
 * All options are clickable - planned connectors open explainer guides
 */
function ConnectorSelector({ type, onSelect, onBack }) {
  // Get badge style based on status
  const getBadgeStyle = (option) => {
    if (option.status === CONNECTOR_STATUS.PRODUCTION) {
      return 'bg-green-50 text-green-700 border-green-200';
    } else if (option.status === CONNECTOR_STATUS.PREVIEW) {
      return 'bg-amber-50 text-amber-700 border-amber-200';
    } else {
      return 'bg-gray-100 text-gray-500 border-gray-200';
    }
  };

  // Get badge label
  const getBadgeLabel = (option) => {
    if (option.status === CONNECTOR_STATUS.PRODUCTION) return 'Production';
    if (option.status === CONNECTOR_STATUS.PREVIEW) return 'Preview';
    return 'Planned';
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/50" onClick={onBack} />
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg border border-gray-200">
          <div className="border-b border-gray-100 px-6 py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Choose {type.title} Option
              </h2>
              <button
                onClick={onBack}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div className="p-6 space-y-3">
            {type.options.map((option) => (
              <button
                key={option.id}
                onClick={() => onSelect(option)}
                className="w-full p-4 rounded-lg border text-left transition-all duration-200 border-gray-200 hover:border-slate/40 hover:bg-gray-50 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{option.label}</div>
                    <div className="text-sm text-gray-500">{option.description}</div>
                    {option.status === CONNECTOR_STATUS.PLANNED && (
                      <div className="mt-1 text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        Click to learn more about this connector
                      </div>
                    )}
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full border flex items-center gap-1 ${getBadgeStyle(option)}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      option.status === CONNECTOR_STATUS.PRODUCTION ? 'bg-green-500' :
                      option.status === CONNECTOR_STATUS.PREVIEW ? 'bg-amber-500' : 'bg-gray-400'
                    }`}></span>
                    {getBadgeLabel(option)}
                  </span>
                </div>
              </button>
            ))}
          </div>

          <div className="border-t border-gray-100 px-6 py-4 flex items-center justify-between">
            <button
              onClick={onBack}
              className="text-gray-500 hover:text-gray-700 font-medium transition-colors"
            >
              Back to Hub
            </button>
            <span className="text-xs text-gray-400">
              All connectors open guided flows
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * File icon component for desktop-like preview
 */
function FileIcon({ file, onRemove, visualAnalysis }) {
  const ext = file.name.split('.').pop()?.toLowerCase();
  const isImage = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'tiff'].includes(ext);

  const getIconStyle = () => {
    const styles = {
      pdf: { bg: 'bg-error-bg', text: 'text-error', label: 'PDF' },
      docx: { bg: 'bg-slate/10', text: 'text-slate', label: 'DOCX' },
      doc: { bg: 'bg-slate/10', text: 'text-slate', label: 'DOC' },
      xlsx: { bg: 'bg-success-bg', text: 'text-success', label: 'XLSX' },
      xls: { bg: 'bg-success-bg', text: 'text-success', label: 'XLS' },
      csv: { bg: 'bg-success-bg', text: 'text-success', label: 'CSV' },
      json: { bg: 'bg-warning-bg', text: 'text-warning', label: 'JSON' },
      txt: { bg: 'bg-gray-100', text: 'text-gray-600', label: 'TXT' },
      md: { bg: 'bg-gray-100', text: 'text-gray-600', label: 'MD' },
      png: { bg: 'bg-info-bg', text: 'text-info', label: 'PNG' },
      jpg: { bg: 'bg-info-bg', text: 'text-info', label: 'JPG' },
      jpeg: { bg: 'bg-info-bg', text: 'text-info', label: 'JPG' },
      gif: { bg: 'bg-info-bg', text: 'text-info', label: 'GIF' },
      webp: { bg: 'bg-info-bg', text: 'text-info', label: 'WEBP' },
      mp4: { bg: 'bg-slate/10', text: 'text-slate', label: 'MP4' },
      mov: { bg: 'bg-slate/10', text: 'text-slate', label: 'MOV' },
      avi: { bg: 'bg-slate/10', text: 'text-slate', label: 'AVI' },
    };
    return styles[ext] || { bg: 'bg-gray-100', text: 'text-gray-600', label: ext?.toUpperCase() || '?' };
  };

  // Get visual category for images
  const getVisualCategory = () => {
    if (!isImage) return null;
    if (visualAnalysis?.category) return visualAnalysis.category;
    // Heuristic fallback based on filename patterns
    const name = file.name.toLowerCase();
    if (/photo|img_|dsc_|pic|camera/i.test(name)) return 'Photo';
    if (/screenshot|screen|capture/i.test(name)) return 'Screenshot';
    if (/logo|icon|badge/i.test(name)) return 'Logo';
    if (/chart|graph|diagram/i.test(name)) return 'Chart';
    if (/scan|document|receipt|invoice/i.test(name)) return 'Document';
    return 'Image';
  };

  const style = getIconStyle();
  const truncatedName = file.name.length > 12 ? file.name.slice(0, 10) + '...' : file.name;
  const visualCategory = getVisualCategory();

  return (
    <div className="relative group flex flex-col items-center p-2 rounded-lg hover:bg-gray-50 transition-colors">
      {/* Remove button */}
      <button
        onClick={(e) => { e.stopPropagation(); onRemove(); }}
        className="absolute -top-1 -right-1 w-5 h-5 bg-gray-200 hover:bg-error hover:text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
      >
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* File icon */}
      <div className={`w-12 h-14 rounded-lg ${style.bg} flex flex-col items-center justify-center mb-1 relative`}>
        <span className={`text-xs font-bold ${style.text}`}>{style.label}</span>
        {/* Visual category badge for images */}
        {visualCategory && (
          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[8px] font-medium bg-white border border-gray-200 px-1 rounded shadow-sm text-gray-600 whitespace-nowrap">
            {visualCategory}
          </span>
        )}
      </div>

      {/* File name */}
      <span className="text-xs text-gray-600 text-center truncate w-16 mt-1" title={file.name}>
        {truncatedName}
      </span>

      {/* Visual analysis indicator */}
      {isImage && (
        <div className="flex items-center gap-0.5 mt-0.5" title="Visual Understanding: Local analysis (free)">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
          <span className="text-[8px] text-gray-400">Local</span>
        </div>
      )}
    </div>
  );
}

/**
 * File Upload Modal - Modern processing experience with estimation and progress tracking
 */
function FileUploadModal({ isOpen, onClose, onComplete, onBack }) {
  const { authFetch } = useAuth();
  const [files, setFiles] = useState([]);
  const [context, setContext] = useState('');
  const [processing, setProcessing] = useState(false);
  const [step, setStep] = useState(1); // 1 = upload, 2 = processing, 3 = complete
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  // Context Library state - for selecting predefined contexts
  const [contextLibrary, setContextLibrary] = useState([]);
  const [selectedContextId, setSelectedContextId] = useState(null); // 'library' entry ID or null
  const [contextSource, setContextSource] = useState('auto'); // 'auto' | 'library' | 'custom'
  const [loadingContexts, setLoadingContexts] = useState(false);

  // OCR state (Phase 3.2.2)
  const [ocrEnabled, setOcrEnabled] = useState(false);
  const [ocrPreview, setOcrPreview] = useState(null);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [showOcrResults, setShowOcrResults] = useState(false);
  const [ocrResults, setOcrResults] = useState(null);

  // Visual Understanding state (Phase 3.2.5)
  const [visualEnabled, setVisualEnabled] = useState(true); // Heuristic always on by default
  const [visualCloudEnabled, setVisualCloudEnabled] = useState(false);
  const [visualPreview, setVisualPreview] = useState(null);
  const [visualLoading, setVisualLoading] = useState(false);
  const [visualResults, setVisualResults] = useState(null);

  // Video state (Phase 3.2.3)
  const [showVideoResults, setShowVideoResults] = useState(false);
  const [videoResults, setVideoResults] = useState(null);

  // Context Coverage state (Phase 3.2.4)
  const [contextCoverage, setContextCoverage] = useState(null);

  // Fetch Context Library entries on mount
  useEffect(() => {
    if (isOpen) {
      setLoadingContexts(true);
      authFetch('/contexts?limit=50')
        .then(res => res.json())
        .then(data => {
          setContextLibrary(data.contexts || []);
          // Auto-select default context if available
          const defaultCtx = (data.contexts || []).find(c => c.is_default);
          if (defaultCtx) {
            setSelectedContextId(defaultCtx.id);
            setContextSource('library');
          }
        })
        .catch(err => console.error('Failed to load contexts:', err))
        .finally(() => setLoadingContexts(false));
    }
  }, [isOpen, authFetch]);

  // Progress tracking state
  const [progress, setProgress] = useState({
    percentage: 0,
    currentFile: '',
    filesProcessed: 0,
    totalFiles: 0,
    elapsedTime: 0,
    estimatedRemaining: 0,
    status: 'idle' // idle, uploading, processing, extracting, classifying
  });
  const progressInterval = useRef(null);
  const startTime = useRef(null);
  const abortController = useRef(null);
  const isCancelled = useRef(false);

  // 1GB limit for basic usage
  const DATA_LIMIT_GB = 1;
  const DATA_LIMIT_BYTES = DATA_LIMIT_GB * 1024 * 1024 * 1024;

  const onDrop = useCallback((acceptedFiles) => {
    setFiles((prev) => [...prev, ...acceptedFiles]);
    setError(null);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'text/csv': ['.csv'],
      'text/plain': ['.txt'],
      'text/markdown': ['.md'],
      'application/json': ['.json'],
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/gif': ['.gif'],
      'image/webp': ['.webp'],
      'video/mp4': ['.mp4'],
      'video/quicktime': ['.mov'],
      'video/x-msvideo': ['.avi'],
    },
  });

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const formatTime = (seconds) => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    const mins = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return `${mins}m ${secs}s`;
  };

  const totalSize = files.reduce((sum, f) => sum + f.size, 0);

  // Estimation calculations based on file size and count
  const getEstimation = () => {
    if (files.length === 0) return null;

    // Estimation formula: base time + per-file time + size-based time
    const baseTime = 2; // 2 seconds base
    const perFileTime = 1.5; // 1.5 seconds per file
    const sizeFactor = totalSize / (1024 * 1024); // MB
    const sizeTime = sizeFactor * 0.5; // 0.5 seconds per MB

    const estimatedSeconds = baseTime + (files.length * perFileTime) + sizeTime;

    // Data usage calculation (toward 1GB limit)
    const usagePercent = (totalSize / DATA_LIMIT_BYTES) * 100;

    return {
      time: Math.max(3, Math.round(estimatedSeconds)),
      dataSize: totalSize,
      usagePercent: usagePercent.toFixed(2),
      filesPerSecond: (files.length / estimatedSeconds).toFixed(1)
    };
  };

  const estimation = getEstimation();

  // Count image files for OCR preview
  const imageFiles = files.filter(f =>
    /\.(jpg|jpeg|png|gif|bmp|tiff|tif|webp)$/i.test(f.name)
  );
  const imageCount = imageFiles.length;

  // Fetch OCR preview when OCR is toggled on and there are images
  useEffect(() => {
    if (ocrEnabled && imageCount > 0) {
      setOcrLoading(true);
      authFetch('/ocr/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageCount })
      })
        .then(res => res.json())
        .then(data => {
          setOcrPreview(data);
          setOcrLoading(false);
        })
        .catch(err => {
          console.error('OCR preview error:', err);
          setOcrPreview({ error: err.message });
          setOcrLoading(false);
        });
    } else {
      setOcrPreview(null);
    }
  }, [ocrEnabled, imageCount]);

  // Start elapsed time tracking
  const startProgressTracking = () => {
    startTime.current = Date.now();
    progressInterval.current = setInterval(() => {
      const elapsed = (Date.now() - startTime.current) / 1000;
      setProgress(prev => ({
        ...prev,
        elapsedTime: elapsed
      }));
    }, 100);
  };

  const stopProgressTracking = () => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
      progressInterval.current = null;
    }
  };

  useEffect(() => {
    return () => stopProgressTracking();
  }, []);

  // Force cancel processing
  const handleForceCancel = () => {
    isCancelled.current = true;
    if (abortController.current) {
      abortController.current.abort();
    }
    stopProgressTracking();
    setProcessing(false);
    setStep(1);
    setError('Processing cancelled by user');
    setProgress({ percentage: 0, currentFile: '', filesProcessed: 0, totalFiles: 0, elapsedTime: 0, estimatedRemaining: 0, status: 'idle' });
  };

  const handleProcess = async () => {
    if (files.length === 0) return;

    // Reset cancellation flag
    isCancelled.current = false;
    abortController.current = new AbortController();

    setProcessing(true);
    setError(null);
    setStep(2);

    // Initialize progress
    setProgress({
      percentage: 0,
      currentFile: files[0]?.name || '',
      filesProcessed: 0,
      totalFiles: files.length,
      elapsedTime: 0,
      estimatedRemaining: estimation?.time || 10,
      status: 'uploading'
    });

    startProgressTracking();

    // Timeout after 2 minutes
    const MAX_POLL_TIME = 120000; // 2 minutes
    const startPollTime = Date.now();

    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('files', file);
      });

      // Context handling: library selection vs custom text vs auto-detect
      // Priority: library context > custom text > auto-detect
      if (contextSource === 'library' && selectedContextId) {
        formData.append('context_id', selectedContextId);
        formData.append('context_source', 'library');
        // Also send snapshot text for the selected context
        const selectedCtx = contextLibrary.find(c => c.id === selectedContextId);
        if (selectedCtx?.content) {
          formData.append('context', selectedCtx.content);
        }
      } else if (contextSource === 'custom' && context) {
        formData.append('context', context);
        formData.append('context_source', 'custom');
      } else {
        // Auto-detect mode - no context provided
        formData.append('context_source', 'auto');
      }

      // Add OCR options (Phase 3.2.2)
      if (ocrEnabled && imageCount > 0 && ocrPreview?.allowed) {
        formData.append('ocrEnabled', 'true');
        formData.append('ocrProvider', ocrPreview?.provider?.id || 'tesseract');
      }

      // Update progress: uploading
      setProgress(prev => ({ ...prev, status: 'uploading', percentage: 10 }));

      // Use authFetch for authenticated request
      const response = await authFetch('/ingest', {
        method: 'POST',
        body: formData,
      });

      if (isCancelled.current) return;

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || `Upload failed: ${response.status}`);
      }

      const responseData = await response.json();
      console.log('Ingest response:', responseData);

      // Update progress: processing started
      setProgress(prev => ({ ...prev, status: 'processing', percentage: 25 }));

      // Poll for completion with progress updates
      const jobId = responseData.jobId;
      let completed = false;
      let pollCount = 0;
      let consecutiveErrors = 0;

      while (!completed && !isCancelled.current) {
        // Check timeout
        if (Date.now() - startPollTime > MAX_POLL_TIME) {
          throw new Error('Processing timed out. The file may still be processing in the background.');
        }

        await new Promise(resolve => setTimeout(resolve, 1000)); // Poll every 1 second
        pollCount++;

        try {
          const statusRes = await authFetch(`/jobs/${jobId}`);

          if (isCancelled.current) return;

          if (!statusRes.ok) {
            consecutiveErrors++;
            console.warn(`Poll error ${consecutiveErrors}: ${statusRes.status}`);
            if (consecutiveErrors >= 5) {
              throw new Error(`Failed to check job status after ${consecutiveErrors} attempts`);
            }
            continue;
          }

          consecutiveErrors = 0;
          const jobData = await statusRes.json();
          console.log('Job status:', jobData.status, jobData.progress);

          if (jobData.status === 'completed') {
            setResults(jobData.results);
            setProgress(prev => ({
              ...prev,
              percentage: 100,
              status: 'complete',
              filesProcessed: files.length,
              currentFile: 'All files processed'
            }));
            completed = true;
            stopProgressTracking();

            // Show OCR results modal if OCR was performed
            if (jobData.results?.ocr?.enabled && jobData.results?.ocr?.results?.length > 0) {
              setOcrResults(jobData.results.ocr);
              setShowOcrResults(true);
            }

            // Show video metadata modal if videos were processed (Phase 3.2.3)
            if (jobData.results?.video?.filesProcessed > 0) {
              setVideoResults(jobData.results.video);
              // Show video modal after OCR modal closes, or immediately if no OCR
              if (!jobData.results?.ocr?.enabled) {
                setShowVideoResults(true);
              }
            }

            // Capture context coverage (Phase 3.2.4)
            if (jobData.results?.contextCoverage) {
              setContextCoverage(jobData.results.contextCoverage);
            }

            setStep(3);
          } else if (jobData.status === 'failed') {
            throw new Error(jobData.error || 'Processing failed');
          } else {
            // Use actual progress from backend if available
            const backendProgress = jobData.progress || 0;
            const progressPercent = Math.max(25, Math.min(95, backendProgress));
            const filesProcessed = Math.floor((progressPercent / 100) * files.length);
            const currentFileIndex = Math.min(filesProcessed, files.length - 1);

            // Use backend's current step or determine from progress
            let status = jobData.currentStep || 'processing';
            if (status === 'extracting' || status.startsWith('extracting:')) status = 'extracting';
            else if (status === 'generating manifest') status = 'extracting';
            else if (status === 'organizing files') status = 'classifying';
            else if (progressPercent > 60) status = 'extracting';
            else if (progressPercent > 80) status = 'classifying';

            setProgress(prev => ({
              ...prev,
              percentage: Math.round(progressPercent),
              filesProcessed: filesProcessed,
              currentFile: jobData.currentStep?.includes(':') ? jobData.currentStep.split(':')[1]?.trim() : files[currentFileIndex]?.name || '',
              status: status,
              estimatedRemaining: Math.max(0, (estimation?.time || 10) - prev.elapsedTime)
            }));
          }
        } catch (pollError) {
          if (isCancelled.current) return;
          consecutiveErrors++;
          console.warn('Poll error:', pollError);
          if (consecutiveErrors >= 5) {
            throw pollError;
          }
        }
      }
    } catch (error) {
      if (isCancelled.current) return;
      console.error('Error processing files:', error);
      stopProgressTracking();
      setError(error.message || 'Failed to process files. Please try again.');
      setStep(1);
    } finally {
      if (!isCancelled.current) {
        setProcessing(false);
      }
    }
  };

  const handleDone = () => {
    setFiles([]);
    setContext('');
    setSelectedContextId(null);
    setContextSource('auto');
    setStep(1);
    setResults(null);
    setError(null);
    setProgress({ percentage: 0, currentFile: '', filesProcessed: 0, totalFiles: 0, elapsedTime: 0, estimatedRemaining: 0, status: 'idle' });
    onComplete?.();
  };

  const handleClose = () => {
    if (processing) return;
    stopProgressTracking();
    setFiles([]);
    setContext('');
    setSelectedContextId(null);
    setContextSource('auto');
    setStep(1);
    setResults(null);
    setError(null);
    setProgress({ percentage: 0, currentFile: '', filesProcessed: 0, totalFiles: 0, elapsedTime: 0, estimatedRemaining: 0, status: 'idle' });
    onClose?.();
  };

  const handleBack = () => {
    if (processing) return;
    stopProgressTracking();
    setFiles([]);
    setContext('');
    setStep(1);
    setResults(null);
    setError(null);
    setProgress({ percentage: 0, currentFile: '', filesProcessed: 0, totalFiles: 0, elapsedTime: 0, estimatedRemaining: 0, status: 'idle' });
    onBack?.();
  };

  const getStatusLabel = (status) => {
    const labels = {
      idle: 'Ready',
      uploading: 'Uploading files...',
      processing: 'Processing documents...',
      extracting: 'Extracting content...',
      classifying: 'Classifying & organizing...',
      complete: 'Complete!'
    };
    return labels[status] || 'Processing...';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/50" onClick={handleClose} />
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl border border-gray-200">
          {/* Header */}
          <div className="border-b border-gray-100 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-slate">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {step === 1 ? 'Upload Files' : step === 2 ? 'Processing' : 'Complete'}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {step === 1 ? 'Drag & drop or browse to upload' : step === 2 ? getStatusLabel(progress.status) : 'All files processed successfully'}
                  </p>
                </div>
              </div>
              <button onClick={processing ? handleForceCancel : handleClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Progress indicator */}
            <div className="flex gap-2 mt-4">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`h-1 flex-1 rounded-full transition-colors ${
                    s <= step ? 'bg-slate' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Error message */}
            {error && step === 1 && (
              <div className="mb-4 p-3 bg-error-bg border border-error/20 rounded-lg flex items-center gap-2">
                <svg className="w-5 h-5 text-error flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm text-error">{error}</span>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-4">
                {/* Drop zone */}
                <div
                  {...getRootProps()}
                  className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                    isDragActive
                      ? 'border-slate bg-gray-50'
                      : 'border-gray-200 hover:border-slate/50 hover:bg-gray-50'
                  }`}
                >
                  <input {...getInputProps()} />
                  <div className={`mx-auto w-14 h-14 rounded-xl flex items-center justify-center mb-3 ${
                    isDragActive ? 'bg-slate text-white' : 'bg-gray-100 text-gray-400'
                  }`}>
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  {isDragActive ? (
                    <p className="text-slate font-medium">Drop files here...</p>
                  ) : (
                    <>
                      <p className="text-gray-900 font-medium mb-1">Drag & drop files here</p>
                      <p className="text-sm text-gray-500 mb-3">or click to browse</p>
                      <div className="flex flex-wrap justify-center gap-1">
                        {['PDF', 'DOCX', 'XLSX', 'CSV', 'TXT', 'PNG', 'JPG', 'MP4'].map((type) => (
                          <span key={type} className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded">
                            {type}
                          </span>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* File preview grid (desktop-like icons) */}
                {files.length > 0 && (
                  <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">
                          {files.length} file{files.length !== 1 ? 's' : ''}
                        </span>
                        <span className="text-sm text-gray-500">
                          ({formatFileSize(totalSize)})
                        </span>
                      </div>
                      <button
                        onClick={() => setFiles([])}
                        className="text-xs text-gray-500 hover:text-error transition-colors"
                      >
                        Clear all
                      </button>
                    </div>

                    {/* Desktop-like file grid */}
                    <div className="grid grid-cols-6 gap-2 max-h-48 overflow-y-auto">
                      {files.map((file, index) => (
                        <FileIcon
                          key={`${file.name}-${index}`}
                          file={file}
                          onRemove={() => removeFile(index)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Estimation panel - shows when files are selected */}
                {files.length > 0 && estimation && (
                  <div className="bg-slate/5 border border-slate/10 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-slate" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        <span className="text-sm font-medium text-slate">Processing Estimate</span>
                      </div>
                      <span className="text-xs text-gray-500">{DATA_LIMIT_GB}GB limit</span>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-lg font-semibold text-gray-900">~{formatTime(estimation.time)}</div>
                        <div className="text-xs text-gray-500">Est. Time</div>
                      </div>
                      <div className="text-center border-x border-gray-200">
                        <div className="text-lg font-semibold text-gray-900">{formatFileSize(totalSize)}</div>
                        <div className="text-xs text-gray-500">Data Amount</div>
                      </div>
                      <div className="text-center">
                        <div className={`text-lg font-semibold ${parseFloat(estimation.usagePercent) > 80 ? 'text-error' : parseFloat(estimation.usagePercent) > 50 ? 'text-amber-600' : 'text-success'}`}>
                          {estimation.usagePercent}%
                        </div>
                        <div className="text-xs text-gray-500">Of Limit</div>
                      </div>
                    </div>
                    {/* Usage bar */}
                    <div className="mt-3">
                      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${parseFloat(estimation.usagePercent) > 80 ? 'bg-error' : parseFloat(estimation.usagePercent) > 50 ? 'bg-amber-500' : 'bg-success'}`}
                          style={{ width: `${Math.min(100, parseFloat(estimation.usagePercent))}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Context Selection - Library, Custom, or Auto-detect */}
                <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Context
                    </label>
                    <div className="flex items-center gap-1 text-xs">
                      {/* Context source toggle buttons */}
                      <button
                        type="button"
                        onClick={() => { setContextSource('auto'); setSelectedContextId(null); setContext(''); }}
                        className={`px-2 py-1 rounded transition-colors ${
                          contextSource === 'auto'
                            ? 'bg-slate text-white'
                            : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        Auto-detect
                      </button>
                      <button
                        type="button"
                        onClick={() => setContextSource('library')}
                        className={`px-2 py-1 rounded transition-colors ${
                          contextSource === 'library'
                            ? 'bg-slate text-white'
                            : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        Library
                      </button>
                      <button
                        type="button"
                        onClick={() => { setContextSource('custom'); setSelectedContextId(null); }}
                        className={`px-2 py-1 rounded transition-colors ${
                          contextSource === 'custom'
                            ? 'bg-slate text-white'
                            : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        Custom
                      </button>
                    </div>
                  </div>

                  {/* Auto-detect mode explanation */}
                  {contextSource === 'auto' && (
                    <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                      <svg className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div className="text-xs text-blue-700">
                        <span className="font-medium">Auto-detect enabled.</span> Context will be inferred from file names, content, and metadata using modality-aware analysis.
                        <span className="block mt-1 text-blue-600 opacity-75">Result will show as "Estimated" until confirmed.</span>
                      </div>
                    </div>
                  )}

                  {/* Library selector dropdown */}
                  {contextSource === 'library' && (
                    <div>
                      {loadingContexts ? (
                        <div className="flex items-center gap-2 text-sm text-gray-500 p-2">
                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          Loading contexts...
                        </div>
                      ) : contextLibrary.length === 0 ? (
                        <div className="text-sm text-gray-500 p-2">
                          No contexts in library.{' '}
                          <button
                            type="button"
                            onClick={() => setContextSource('custom')}
                            className="text-slate hover:underline"
                          >
                            Enter custom context
                          </button>
                        </div>
                      ) : (
                        <select
                          value={selectedContextId || ''}
                          onChange={(e) => setSelectedContextId(e.target.value || null)}
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-slate/20 focus:border-slate transition-colors"
                        >
                          <option value="">Select a context...</option>
                          {contextLibrary.map((ctx) => (
                            <option key={ctx.id} value={ctx.id}>
                              {ctx.name} {ctx.is_default ? '(Default)' : ''}
                            </option>
                          ))}
                        </select>
                      )}
                      {/* Show selected context preview */}
                      {selectedContextId && (
                        <div className="mt-2 p-2 bg-white border border-gray-100 rounded-lg">
                          <div className="text-xs text-gray-500 mb-1">Preview:</div>
                          <div className="text-sm text-gray-700 line-clamp-2">
                            {contextLibrary.find(c => c.id === selectedContextId)?.content || contextLibrary.find(c => c.id === selectedContextId)?.description || 'No description'}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Custom context textarea */}
                  {contextSource === 'custom' && (
                    <textarea
                      value={context}
                      onChange={(e) => setContext(e.target.value)}
                      placeholder="Describe the purpose of these files (e.g., 'Q4 financial reports for analysis')..."
                      className="w-full h-20 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm resize-none focus:ring-2 focus:ring-slate/20 focus:border-slate transition-colors"
                    />
                  )}
                </div>

                {/* OCR Toggle - Phase 3.2.2 */}
                {imageCount > 0 && (
                  <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white border border-gray-200 rounded-lg flex items-center justify-center">
                          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div>
                          <span className="font-medium text-gray-900">OCR Text Extraction</span>
                          <p className="text-xs text-gray-500">{imageCount} image{imageCount !== 1 ? 's' : ''} detected</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setOcrEnabled(!ocrEnabled)}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-slate focus:ring-offset-2 ${ocrEnabled ? 'bg-slate' : 'bg-gray-200'}`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${ocrEnabled ? 'translate-x-5' : 'translate-x-0'}`}
                        />
                      </button>
                    </div>

                    {/* OCR Preview with Strategy */}
                    {ocrEnabled && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        {ocrLoading ? (
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Checking OCR availability...
                          </div>
                        ) : ocrPreview?.error ? (
                          <div className="text-sm text-error">
                            {ocrPreview.error}
                          </div>
                        ) : ocrPreview ? (
                          <div className="space-y-2">
                            {/* Strategy info with quality badge and plan */}
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-500">Provider:</span>
                              <span className={`font-medium flex items-center gap-1 ${
                                ocrPreview.ocrProvider === 'google' ? 'text-blue-600' : 'text-green-600'
                              }`}>
                                {ocrPreview.ocrProvider === 'google' ? '☁️ ' : '💻 '}
                                {ocrPreview.ocrProvider === 'google' ? 'Google Cloud Vision' : 'Tesseract (local)'}
                                <span className={`ml-1 px-1.5 py-0.5 text-xs rounded ${
                                  ocrPreview.ocrQuality === 'high' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                                }`}>
                                  {ocrPreview.ocrQuality === 'high' ? 'High accuracy' : 'Estimated'}
                                </span>
                                {ocrPreview.plan && (
                                  <span className="ml-1 px-1.5 py-0.5 text-xs rounded bg-ion/10 text-ion capitalize" title={`Your ${ocrPreview.plan} plan`}>
                                    {ocrPreview.plan}
                                  </span>
                                )}
                              </span>
                            </div>
                            {/* OCR source explanation with reason code */}
                            {(ocrPreview.ocrReason || ocrPreview.strategy?.ocrDecision) && (
                              <div className={`flex items-center gap-2 text-xs px-2 py-1 rounded ${
                                ocrPreview.fallbackActive
                                  ? 'text-amber-600 bg-amber-50'
                                  : 'text-blue-600 bg-blue-50'
                              }`}>
                                <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>
                                  {ocrPreview.strategy?.ocrDecision?.reasonDetail || ocrPreview.ocrReason}
                                  {ocrPreview.strategy?.ocrDecision?.reasonCode && (
                                    <span className="ml-1 font-mono text-[10px] opacity-75">
                                      [{ocrPreview.strategy.ocrDecision.reasonCode}]
                                    </span>
                                  )}
                                </span>
                              </div>
                            )}
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-500">Estimated cost:</span>
                              <span className="font-medium text-gray-900">{ocrPreview.estimate?.formattedCost || '$0.00'}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-500">Pages to process:</span>
                              <span className="font-medium text-gray-900">{ocrPreview.estimate?.pageCount || imageCount}</span>
                            </div>
                            {ocrPreview.budgetCheck?.budget && (
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-500">Monthly usage:</span>
                                <span className="font-medium text-gray-900">
                                  {ocrPreview.budgetCheck.budget.used} / {ocrPreview.budgetCheck.budget.limit} pages
                                </span>
                              </div>
                            )}
                          </div>
                        ) : null}
                      </div>
                    )}
                  </div>
                )}

                {/* Visual Understanding Toggle - Phase 3.2.5 */}
                {imageCount > 0 && (
                  <div className="border border-gray-200 rounded-xl p-4 bg-gray-50 mt-3">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white border border-gray-200 rounded-lg flex items-center justify-center">
                          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </div>
                        <div>
                          <span className="font-medium text-gray-900">Visual Understanding</span>
                          <p className="text-xs text-gray-500">Analyze image content & categories</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-success font-medium bg-success/10 px-2 py-0.5 rounded">Always On</span>
                      </div>
                    </div>

                    {/* Heuristic Analysis Info (Always Active) */}
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Local Analysis:</span>
                          <span className="font-medium text-green-600">
                            💻 Heuristic (Free)
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">
                          Analyzes colors, aspect ratio, patterns, and EXIF data locally. No cloud calls.
                        </p>

                        {/* Cloud Vision Toggle */}
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-sm font-medium text-gray-700">Enhanced Cloud Vision</span>
                              <p className="text-xs text-gray-500">AI-powered labels via Google Vision</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => setVisualCloudEnabled(!visualCloudEnabled)}
                              className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-slate focus:ring-offset-2 ${visualCloudEnabled ? 'bg-blue-600' : 'bg-gray-200'}`}
                            >
                              <span
                                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${visualCloudEnabled ? 'translate-x-4' : 'translate-x-0'}`}
                              />
                            </button>
                          </div>
                          {visualCloudEnabled && (
                            <div className="mt-2 p-2 bg-blue-50 rounded-lg">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-blue-700">Provider:</span>
                                <span className="font-medium text-blue-800">☁️ Google Cloud Vision</span>
                              </div>
                              <div className="flex items-center justify-between text-sm mt-1">
                                <span className="text-blue-700">Est. cost:</span>
                                <span className="font-medium text-blue-800">~€0.0015/image</span>
                              </div>
                              <p className="text-xs text-blue-600 mt-1">
                                ⚠️ Requires explicit consent. Images sent to Google for analysis.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {step === 2 && (
              <div className="py-6">
                {/* Main progress circle */}
                <div className="flex flex-col items-center mb-6">
                  <div className="relative w-24 h-24 mb-4">
                    {/* Background circle */}
                    <svg className="w-24 h-24 transform -rotate-90">
                      <circle
                        cx="48"
                        cy="48"
                        r="40"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        className="text-gray-200"
                      />
                      <circle
                        cx="48"
                        cy="48"
                        r="40"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        strokeLinecap="round"
                        className="text-slate transition-all duration-300"
                        strokeDasharray={`${2 * Math.PI * 40}`}
                        strokeDashoffset={`${2 * Math.PI * 40 * (1 - progress.percentage / 100)}`}
                      />
                    </svg>
                    {/* Percentage in center */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-bold text-gray-900">{progress.percentage}%</span>
                    </div>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">{getStatusLabel(progress.status)}</h3>
                </div>

                {/* Progress details */}
                <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 space-y-3">
                  {/* Current file */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Current file:</span>
                    <span className="text-sm font-medium text-gray-900 truncate max-w-[200px]">{progress.currentFile}</span>
                  </div>

                  {/* Files processed */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Files processed:</span>
                    <span className="text-sm font-medium text-gray-900">{progress.filesProcessed} / {progress.totalFiles}</span>
                  </div>

                  {/* Time elapsed */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Time elapsed:</span>
                    <span className="text-sm font-medium text-gray-900">{formatTime(progress.elapsedTime)}</span>
                  </div>

                  {/* Estimated remaining */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Est. remaining:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {progress.estimatedRemaining > 0 ? `~${formatTime(progress.estimatedRemaining)}` : 'Almost done...'}
                    </span>
                  </div>
                </div>

                {/* Linear progress bar */}
                <div className="mt-4">
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-slate rounded-full transition-all duration-300"
                      style={{ width: `${progress.percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="py-6">
                {/* Success icon */}
                <div className="flex flex-col items-center mb-6">
                  <div className="w-16 h-16 rounded-full bg-success-bg flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">Processing Complete</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {files.length} file{files.length !== 1 ? 's' : ''} processed in {formatTime(progress.elapsedTime)}
                  </p>
                </div>

                {/* Results summary */}
                <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-900">Processed Files</span>
                    <span className="text-xs text-success font-medium bg-success-bg px-2 py-0.5 rounded-full">
                      {files.length} files
                    </span>
                  </div>

                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {(results?.fileResults || files).map((item, i) => {
                      const file = results?.fileResults ? item : item;
                      const filename = file.filename || file.name;
                      return (
                        <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-6 h-6 bg-success-bg rounded flex items-center justify-center flex-shrink-0">
                              <svg className="w-3 h-3 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                            <span className="text-sm text-gray-700 truncate">{filename}</span>
                          </div>
                          <span className="text-xs text-success font-medium flex-shrink-0 ml-2">
                            {file.classification || 'Processed'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Summary stats */}
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="text-lg font-semibold text-gray-900">{files.length}</div>
                    <div className="text-xs text-gray-500">Files</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="text-lg font-semibold text-gray-900">{formatTime(progress.elapsedTime)}</div>
                    <div className="text-xs text-gray-500">Duration</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="text-lg font-semibold text-gray-900">{formatFileSize(totalSize)}</div>
                    <div className="text-xs text-gray-500">Total Size</div>
                  </div>
                </div>

                {/* Visual Understanding Results - Phase 3.2.5 */}
                {imageCount > 0 && (
                  <div className="mt-4 p-4 bg-gradient-to-r from-ion/5 to-info/5 rounded-xl border border-ion/20">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-ion/10 rounded-lg flex items-center justify-center">
                          <svg className="w-4 h-4 text-ion" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </div>
                        <div>
                          <span className="font-medium text-gray-900">Visual Understanding</span>
                          <p className="text-xs text-gray-500">{imageCount} image{imageCount !== 1 ? 's' : ''} analyzed</p>
                        </div>
                      </div>
                      <span className="text-xs font-medium px-2 py-1 bg-green-100 text-green-700 rounded-full">
                        💻 Local • €0
                      </span>
                    </div>

                    {/* Visual analysis summary */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Analysis Mode:</span>
                        <span className="font-medium text-gray-900">
                          {visualCloudEnabled ? '☁️ Cloud Vision' : '💻 Heuristic (Local)'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Cost:</span>
                        <span className="font-medium text-green-600">
                          {visualCloudEnabled ? `~€${(imageCount * 0.0015).toFixed(4)}` : '€0.00 (Free)'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Categories Detected:</span>
                        <span className="font-medium text-gray-900">
                          Photos, Documents, Screenshots
                        </span>
                      </div>
                    </div>

                    {/* OCR status for images */}
                    {ocrEnabled ? (
                      <div className="mt-3 pt-3 border-t border-ion/20 flex items-center gap-2">
                        <svg className="w-4 h-4 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-sm text-gray-700">OCR text extraction applied</span>
                      </div>
                    ) : (
                      <div className="mt-3 pt-3 border-t border-ion/20 flex items-center gap-2">
                        <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <span className="text-sm text-gray-700">No OCR text found (visual-only images)</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-100 px-6 py-4">
            <div className="flex items-center justify-between">
              {step === 2 ? (
                <button
                  onClick={handleForceCancel}
                  className="px-4 py-2 text-error hover:text-white hover:bg-error border border-error rounded-lg transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Cancel Processing
                </button>
              ) : (
                <button
                  onClick={handleBack}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Cancel
                </button>
              )}
              <div className="flex gap-3">
                {step === 1 && (
                  <button
                    onClick={handleProcess}
                    disabled={files.length === 0 || processing}
                    className="px-6 py-2 bg-slate text-white rounded-lg hover:bg-slate/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Process Files
                  </button>
                )}
                {step === 3 && (
                  <button
                    onClick={handleDone}
                    className="px-6 py-2 bg-slate text-white rounded-lg hover:bg-slate/90 transition-colors"
                  >
                    Done
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* OCR Results Modal */}
      {showOcrResults && ocrResults && (
        <div className="fixed inset-0 z-[60] overflow-y-auto">
          <div className="fixed inset-0 bg-black/60" onClick={() => setShowOcrResults(false)} />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden border border-gray-200">
              {/* Header */}
              <div className="border-b border-gray-100 px-6 py-4 bg-gradient-to-r from-slate/5 to-transparent">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">OCR Complete</h2>
                      <p className="text-sm text-gray-500">
                        {ocrResults.filesProcessed} image{ocrResults.filesProcessed !== 1 ? 's' : ''} processed
                        {ocrResults.strategy && (
                          <span className="ml-1">
                            with {ocrResults.strategy.provider === 'google' ? 'Google Cloud Vision' : 'Tesseract (local)'}
                            <span className={`ml-1 px-1.5 py-0.5 text-xs rounded ${
                              ocrResults.strategy.quality === 'high' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                            }`}>
                              {ocrResults.strategy.quality === 'high' ? 'High accuracy' : 'Estimated'}
                            </span>
                            {ocrResults.strategy.fallback && (
                              <span className="ml-1 px-1.5 py-0.5 text-xs rounded bg-blue-100 text-blue-700">
                                Fallback
                              </span>
                            )}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowOcrResults(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-lg"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Content - Scrollable */}
              <div className="p-6 overflow-y-auto max-h-[calc(85vh-140px)]">
                <div className="space-y-4">
                  {ocrResults.results?.map((result, index) => (
                    <div key={index} className="border border-gray-200 rounded-xl overflow-hidden bg-white">
                      {/* File header */}
                      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="font-medium text-gray-900">{result.fileName}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {/* Per-file OCR provider badge with ocrDecision tooltip */}
                            {(result.ocrProvider || result.ocrDecision) && (
                              <div className="group relative">
                                <span className={`px-2 py-0.5 text-xs rounded-full flex items-center gap-1 cursor-help ${
                                  (result.ocrDecision?.chosenProvider || result.ocrProvider) === 'google'
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'bg-gray-100 text-gray-600'
                                }`}>
                                  {(result.ocrDecision?.chosenProvider || result.ocrProvider) === 'google' ? '☁️' : '💻'}
                                  {(result.ocrDecision?.chosenProvider || result.ocrProvider) === 'google' ? 'Google' : 'Local'}
                                  {(result.ocrDecision?.fallbackUsed || result.ocrFallback) && (
                                    <span className="text-amber-600" title="Fallback was used">*</span>
                                  )}
                                  <svg className="w-3 h-3 ml-0.5 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                </span>
                                {/* "Why this provider?" tooltip */}
                                <div className="absolute z-50 hidden group-hover:block bottom-full left-0 mb-1 w-72 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg">
                                  <div className="font-semibold mb-2 text-gray-200">Why this provider?</div>
                                  {result.ocrDecision ? (
                                    <div className="space-y-1.5">
                                      <div className="flex justify-between">
                                        <span className="text-gray-400">Provider:</span>
                                        <span className="text-white">{result.ocrDecision.chosenProvider || 'unknown'}</span>
                                      </div>
                                      {result.ocrDecision.attemptedProvider !== result.ocrDecision.chosenProvider && (
                                        <div className="flex justify-between">
                                          <span className="text-gray-400">Attempted:</span>
                                          <span className="text-amber-400">{result.ocrDecision.attemptedProvider}</span>
                                        </div>
                                      )}
                                      <div className="flex justify-between">
                                        <span className="text-gray-400">Reason:</span>
                                        <span className="text-white font-mono">{result.ocrDecision.reasonCode || 'unknown'}</span>
                                      </div>
                                      <div className="pt-1 border-t border-gray-700 text-gray-300">
                                        {result.ocrDecision.reasonDetail || result.ocrReason || 'No details available'}
                                      </div>
                                      <div className="flex justify-between text-gray-400">
                                        <span>Plan:</span>
                                        <span className="capitalize">{result.ocrDecision.planAtDecision || 'unknown'}</span>
                                      </div>
                                      {result.ocrDecision.requestId && (
                                        <div className="pt-1 text-gray-500 font-mono text-[10px] truncate">
                                          ID: {result.ocrDecision.requestId}
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    <div className="text-gray-300">{result.ocrReason || 'No decision details available'}</div>
                                  )}
                                  <div className="absolute bottom-0 left-4 transform translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900"></div>
                                </div>
                              </div>
                            )}
                            {result.confidence && (
                              <span className={`px-2 py-0.5 text-xs rounded-full ${
                                result.confidence > 0.8 ? 'bg-green-100 text-green-700' :
                                result.confidence > 0.5 ? 'bg-yellow-100 text-yellow-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                                {Math.round(result.confidence * 100)}% confidence
                              </span>
                            )}
                            <span className="text-xs text-gray-500">
                              {result.extractedText?.length || 0} characters
                            </span>
                          </div>
                        </div>
                        {/* OCR fallback warning message */}
                        {(result.ocrDecision?.fallbackUsed || result.ocrFallback) && (
                          <p className="mt-1 text-xs text-amber-600 flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            Fallback used: {result.ocrDecision?.reasonDetail || result.ocrReason || 'Google OCR unavailable'}
                          </p>
                        )}
                      </div>

                      {/* Extracted text */}
                      <div className="p-4">
                        <div className="bg-gray-50 rounded-lg p-4 max-h-60 overflow-y-auto">
                          <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono leading-relaxed">
                            {result.extractedText || 'No text extracted'}
                          </pre>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Summary with Provider Breakdown */}
                <div className="mt-6 space-y-3">
                  {/* Provider breakdown */}
                  {ocrResults.providerBreakdown && (ocrResults.providerBreakdown.google > 0 || ocrResults.providerBreakdown.tesseract > 0) && (
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <p className="text-sm font-medium text-gray-900 mb-2">Provider Breakdown</p>
                      <div className="flex gap-4 text-sm">
                        {ocrResults.providerBreakdown.google > 0 && (
                          <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                            <span className="text-gray-700">
                              Google Cloud Vision: <span className="font-medium">{ocrResults.providerBreakdown.google}</span> files
                            </span>
                          </div>
                        )}
                        {ocrResults.providerBreakdown.tesseract > 0 && (
                          <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-gray-400"></span>
                            <span className="text-gray-700">
                              Tesseract (local): <span className="font-medium">{ocrResults.providerBreakdown.tesseract}</span> files
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Strategy reason (especially useful for fallback cases) */}
                  {ocrResults.strategy?.reason && (
                    <div className={`p-4 rounded-xl border ${
                      ocrResults.strategy.fallback
                        ? 'bg-amber-50 border-amber-200'
                        : 'bg-green-50 border-green-200'
                    }`}>
                      <div className="flex items-start gap-3">
                        <svg className={`w-5 h-5 mt-0.5 ${
                          ocrResults.strategy.fallback ? 'text-amber-600' : 'text-green-600'
                        }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className={`text-sm ${
                          ocrResults.strategy.fallback ? 'text-amber-800' : 'text-green-800'
                        }`}>
                          <p className="font-medium mb-1">OCR Strategy</p>
                          <p>{ocrResults.strategy.reason}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Processing complete info */}
                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div className="text-sm text-blue-800">
                        <p className="font-medium mb-1">OCR Processing Complete</p>
                        <p className="text-blue-700">
                          The extracted text has been included in your data manifest and is now searchable.
                          Review the text above to verify accuracy.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-gray-100 px-6 py-4 bg-gray-50">
                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      setShowOcrResults(false);
                      // Show video results if there are any
                      if (videoResults?.filesProcessed > 0) {
                        setShowVideoResults(true);
                      }
                    }}
                    className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Video Metadata Modal - Phase 3.2.3 */}
      {showVideoResults && videoResults && (
        <div className="fixed inset-0 z-[60] overflow-y-auto">
          <div className="fixed inset-0 bg-black/60" onClick={() => setShowVideoResults(false)} />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden border border-gray-200">
              {/* Header */}
              <div className="border-b border-gray-100 px-6 py-4 bg-gradient-to-r from-indigo-50 to-transparent">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">Video Metadata</h2>
                      <p className="text-sm text-gray-500">
                        {videoResults.filesProcessed} video{videoResults.filesProcessed !== 1 ? 's' : ''} processed ({videoResults.totalMinutes?.toFixed(1)} min total)
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowVideoResults(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-lg"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Content - Scrollable */}
              <div className="p-6 overflow-y-auto max-h-[calc(85vh-180px)]">
                <div className="space-y-4">
                  {videoResults.results?.map((video, index) => (
                    <div key={index} className="border border-gray-200 rounded-xl overflow-hidden bg-white">
                      {/* Video header */}
                      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          <span className="font-medium text-gray-900">{video.fileName}</span>
                        </div>
                        <span className="text-sm text-gray-500">
                          {video.duration?.formatted || 'Unknown duration'}
                        </span>
                      </div>

                      {/* Video metadata */}
                      <div className="p-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="bg-gray-50 rounded-lg p-3">
                            <div className="text-xs text-gray-500 mb-1">Duration</div>
                            <div className="font-medium text-gray-900">{video.duration?.formatted || '-'}</div>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-3">
                            <div className="text-xs text-gray-500 mb-1">Resolution</div>
                            <div className="font-medium text-gray-900">
                              {video.resolution?.width && video.resolution?.height
                                ? `${video.resolution.width}x${video.resolution.height}`
                                : '-'}
                            </div>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-3">
                            <div className="text-xs text-gray-500 mb-1">Codec</div>
                            <div className="font-medium text-gray-900">{video.codec || '-'}</div>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-3">
                            <div className="text-xs text-gray-500 mb-1">Format</div>
                            <div className="font-medium text-gray-900">{video.format || '-'}</div>
                          </div>
                        </div>
                        {video.hasAudio && (
                          <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M9 12h.01" />
                            </svg>
                            Has audio track
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Info notice */}
                <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-slate-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="text-sm text-slate-700">
                      <p className="font-medium mb-1">Context Inferred from Structural Signals</p>
                      <p className="text-slate-600">
                        Video context is derived from filename, duration, resolution, and codec metadata.
                        These structural signals contribute to dataset context detection and categorization.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-gray-100 px-6 py-4 bg-gray-50">
                <div className="flex justify-end">
                  <button
                    onClick={() => setShowVideoResults(false)}
                    className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Connector Files - Expandable file list for a connector with exclude functionality
 */
function ConnectorFiles({ connector, authFetch, onUpdate }) {
  const [expanded, setExpanded] = useState(false);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);

  const fetchFiles = async () => {
    if (files.length > 0) return; // Already loaded
    setLoading(true);
    try {
      const response = await authFetch(`/connectors/${connector.id}/files`);
      if (response.ok) {
        const data = await response.json();
        setFiles(data.files);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch connector files:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpanded = () => {
    if (!expanded) {
      fetchFiles();
    }
    setExpanded(!expanded);
  };

  const toggleFileExclude = async (fileId) => {
    const file = files.find(f => f.id === fileId);
    const newExcluded = !file.excluded;

    // Update local state immediately
    setFiles(files.map(f => f.id === fileId ? { ...f, excluded: newExcluded } : f));

    // Get current excluded list and update
    const currentExcluded = files.filter(f => f.excluded).map(f => f.id);
    const newExcludedList = newExcluded
      ? [...currentExcluded, fileId]
      : currentExcluded.filter(id => id !== fileId);

    // Save to backend
    try {
      await authFetch(`/connectors/${connector.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ excludedFiles: newExcludedList })
      });
      // Update stats
      setStats(prev => prev ? {
        ...prev,
        excluded: newExcludedList.length,
        included: prev.total - newExcludedList.length
      } : null);
      onUpdate?.();
    } catch (error) {
      console.error('Failed to update excluded files:', error);
      // Revert on error
      setFiles(files.map(f => f.id === fileId ? { ...f, excluded: !newExcluded } : f));
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="mt-3 border-t border-gray-100 pt-3">
      <button
        onClick={toggleExpanded}
        className="flex items-center gap-2 text-sm text-gray-600 hover:text-slate transition-colors w-full"
      >
        <svg
          className={`w-4 h-4 transition-transform ${expanded ? 'rotate-90' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        {stats ? (
          <span>{stats.included} files included{stats.excluded > 0 && ` (${stats.excluded} excluded)`}</span>
        ) : (
          <span>View files</span>
        )}
      </button>

      {expanded && (
        <div className="mt-3 max-h-64 overflow-y-auto">
          {loading ? (
            <div className="text-sm text-gray-500 py-2">Loading files...</div>
          ) : (
            <div className="space-y-1">
              {files.map((file) => (
                <div
                  key={file.id}
                  className={`flex items-center justify-between py-1.5 px-2 rounded-lg text-sm ${
                    file.excluded ? 'bg-gray-50 text-gray-400 line-through' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <svg className="w-4 h-4 flex-shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <span className="truncate" title={file.path}>{file.name}</span>
                    <span className="text-xs text-gray-400 flex-shrink-0">{formatFileSize(file.size)}</span>
                  </div>
                  <button
                    onClick={() => toggleFileExclude(file.id)}
                    className={`p-1 rounded transition-colors flex-shrink-0 ${
                      file.excluded
                        ? 'text-success hover:bg-success-bg'
                        : 'text-gray-400 hover:text-error hover:bg-error-bg'
                    }`}
                    title={file.excluded ? 'Include file' : 'Exclude file'}
                  >
                    {file.excluded ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Expandable content preview for a connector - shows ONLY selected/scoped folders/files
 */
function ConnectorContentPreview({ connector, authFetch }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedItems, setExpandedItems] = useState({});
  const [itemContents, setItemContents] = useState({});
  const [itemErrors, setItemErrors] = useState({});

  const type = connector.enterprise_type || connector.type;
  const isOneDrive = type === 'onedrive' || type === 'enterprise_onedrive';
  const isSharePoint = type === 'sharepoint' || type === 'enterprise_sharepoint';
  const isGoogleDrive = type === 'googledrive' || type === 'google_drive';
  const isDropbox = type === 'dropbox' || type === 'enterprise_dropbox';
  const isS3 = type === 's3' || type === 'aws_s3';
  const isAzureBlob = type === 'azureblob' || type === 'azure_blob';
  const isPostgreSQL = type === 'postgresql';
  const isMySQL = type === 'mysql';
  const isSQLServer = type === 'mssql';
  const isDatabricks = type === 'databricks';
  const isDatabase = isPostgreSQL || isMySQL || isSQLServer;

  // Parse scope_config to get selected items
  const getScopedItems = () => {
    try {
      const scopeConfig = typeof connector.scope_config === 'string'
        ? JSON.parse(connector.scope_config)
        : connector.scope_config;

      if (isOneDrive || isGoogleDrive || isDropbox) {
        return scopeConfig?.folders || [];
      } else if (isSharePoint) {
        return scopeConfig?.sites || [];
      } else if (isS3) {
        return scopeConfig?.buckets || [];
      } else if (isAzureBlob) {
        return scopeConfig?.containers || [];
      } else if (isDatabase) {
        return scopeConfig?.schemas || [];
      } else if (isDatabricks) {
        return scopeConfig?.catalogs || [];
      }
    } catch (e) {
      console.error('Failed to parse scope_config:', e);
    }
    return [];
  };

  const scopedItems = getScopedItems();

  const formatSize = (bytes) => {
    if (!bytes) return '';
    if (bytes > 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    if (bytes > 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${bytes} B`;
  };

  const ChevronIcon = ({ expanded, loading }) => {
    if (loading) {
      return (
        <svg className="w-4 h-4 animate-spin text-gray-400" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
        </svg>
      );
    }
    return (
      <svg className={`w-4 h-4 text-gray-400 transition-transform ${expanded ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    );
  };

  // Recursive folder item component for OneDrive and Google Drive
  const FolderItem = ({ folder, depth = 0 }) => {
    const folderKey = folder.path || folder.id || folder.name;
    const isItemExpanded = expandedItems[folderKey] === true;
    const isLoading = expandedItems[folderKey] === 'loading';
    const children = itemContents[folderKey] || [];

    const loadFolderChildren = async () => {
      if (itemContents[folderKey]) {
        setExpandedItems(prev => ({ ...prev, [folderKey]: !prev[folderKey] }));
        return;
      }
      setExpandedItems(prev => ({ ...prev, [folderKey]: 'loading' }));
      try {
        let res;
        if (isGoogleDrive) {
          // Google Drive uses folder ID as parent
          const parentId = folder.id || 'root';
          res = await authFetch(`/connectors/googledrive/${connector.id}/items?parentId=${encodeURIComponent(parentId)}`);
        } else if (isDropbox) {
          // Dropbox uses path
          const path = folder.path || '';
          res = await authFetch(`/connectors/dropbox/${connector.id}/items?path=${encodeURIComponent(path)}`);
        } else {
          // OneDrive uses path
          const path = folder.path || '/';
          res = await authFetch(`/connectors/onedrive/${connector.id}/items?path=${encodeURIComponent(path)}`);
        }
        if (res.ok) {
          const data = await res.json();
          setItemContents(prev => ({ ...prev, [folderKey]: data.items || [] }));
          setExpandedItems(prev => ({ ...prev, [folderKey]: true }));
        }
      } catch (err) {
        console.error('Failed to load folder:', err);
        setExpandedItems(prev => ({ ...prev, [folderKey]: false }));
      }
    };

    return (
      <div style={{ marginLeft: depth > 0 ? '16px' : '0' }}>
        <button
          onClick={loadFolderChildren}
          className="flex items-center gap-2 w-full text-left py-1 px-2 rounded hover:bg-gray-50 text-sm"
        >
          <ChevronIcon expanded={isItemExpanded} loading={isLoading} />
          <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
          <span className="text-gray-700 truncate">{folder.name || folder.path || 'Root'}</span>
        </button>

        {isItemExpanded && children.length > 0 && (
          <div className="space-y-0.5">
            {children.map((item) => (
              item.type === 'folder' ? (
                <FolderItem key={item.id} folder={{ ...item, path: `${folder.path || ''}/${item.name}`.replace(/^\/+/, '/') }} depth={depth + 1} />
              ) : (
                <div key={item.id} style={{ marginLeft: '16px' }} className="flex items-center gap-2 py-0.5 px-2 text-sm text-gray-600">
                  <div className="w-4" /> {/* spacer for alignment */}
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="truncate flex-1">{item.name}</span>
                  {item.size && <span className="text-xs text-gray-400">{formatSize(item.size)}</span>}
                </div>
              )
            ))}
          </div>
        )}
      </div>
    );
  };

  // Recursive SharePoint item component
  const SharePointItem = ({ item, itemType, depth = 0, driveId = null, parentPath = '' }) => {
    const itemKey = `${itemType}-${item.id || item.name}-${parentPath}`;
    const isItemExpanded = expandedItems[itemKey] === true;
    const isLoading = expandedItems[itemKey] === 'loading';
    const children = itemContents[itemKey] || [];

    const loadChildren = async () => {
      if (itemContents[itemKey]) {
        setExpandedItems(prev => ({ ...prev, [itemKey]: !prev[itemKey] }));
        return;
      }
      setExpandedItems(prev => ({ ...prev, [itemKey]: 'loading' }));
      try {
        let res;
        if (itemType === 'site') {
          // Load libraries for a site
          res = await authFetch(`/connectors/sharepoint/${connector.id}/sites/${encodeURIComponent(item.id)}/libraries`);
          if (res.ok) {
            const data = await res.json();
            setItemContents(prev => ({ ...prev, [itemKey]: (data.libraries || []).map(lib => ({ ...lib, _type: 'library' })) }));
          }
        } else if (itemType === 'library') {
          // Load root items from a library/drive
          res = await authFetch(`/connectors/sharepoint/${connector.id}/drives/${encodeURIComponent(item.id)}/items`);
          if (res.ok) {
            const data = await res.json();
            setItemContents(prev => ({ ...prev, [itemKey]: data.items || [] }));
          }
        } else if (itemType === 'folder') {
          // Load items from a subfolder
          const path = parentPath ? `${parentPath}/${item.name}` : item.name;
          res = await authFetch(`/connectors/sharepoint/${connector.id}/drives/${encodeURIComponent(driveId)}/items?path=${encodeURIComponent(path)}`);
          if (res.ok) {
            const data = await res.json();
            setItemContents(prev => ({ ...prev, [itemKey]: data.items || [] }));
          }
        }
        setExpandedItems(prev => ({ ...prev, [itemKey]: true }));
      } catch (err) {
        console.error('Failed to load children:', err);
        setExpandedItems(prev => ({ ...prev, [itemKey]: false }));
      }
    };

    const getIcon = () => {
      if (itemType === 'site') {
        return (
          <svg className="w-4 h-4 text-teal-500" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.2"/>
            <circle cx="12" cy="12" r="6" fill="currentColor"/>
          </svg>
        );
      } else if (itemType === 'library') {
        return (
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
          </svg>
        );
      } else if (itemType === 'folder') {
        return (
          <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
        );
      }
      return (
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
    };

    // Files are not expandable
    if (itemType === 'file') {
      return (
        <div style={{ marginLeft: `${depth * 16}px` }} className="flex items-center gap-2 py-0.5 px-2 text-sm text-gray-600">
          <div className="w-4" />
          {getIcon()}
          <span className="truncate flex-1">{item.name}</span>
          {item.size && <span className="text-xs text-gray-400">{formatSize(item.size)}</span>}
        </div>
      );
    }

    return (
      <div style={{ marginLeft: depth > 0 ? '16px' : '0' }}>
        <button
          onClick={loadChildren}
          className="flex items-center gap-2 w-full text-left py-1 px-2 rounded hover:bg-gray-50 text-sm"
        >
          <ChevronIcon expanded={isItemExpanded} loading={isLoading} />
          {getIcon()}
          <span className="text-gray-700 truncate">{item.displayName || item.name}</span>
        </button>

        {isItemExpanded && children.length > 0 && (
          <div className="space-y-0.5">
            {children.map((child) => {
              const childType = child._type === 'library' ? 'library' : (child.type === 'folder' ? 'folder' : 'file');
              const newDriveId = childType === 'library' ? child.id : driveId;
              const newPath = itemType === 'folder' ? (parentPath ? `${parentPath}/${item.name}` : item.name) : '';
              return (
                <SharePointItem
                  key={child.id}
                  item={child}
                  itemType={childType}
                  depth={depth + 1}
                  driveId={newDriveId}
                  parentPath={newPath}
                />
              );
            })}
          </div>
        )}
      </div>
    );
  };

  if (!isOneDrive && !isSharePoint && !isGoogleDrive && !isDropbox && !isS3 && !isAzureBlob && !isDatabase && !isDatabricks) return null;
  if (connector.status === 'pending_scope') return null;

  return (
    <div className="mt-3">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ChevronIcon expanded={isExpanded} loading={false} />
        <span>{isExpanded ? 'Hide contents' : 'View contents'}</span>
      </button>

      {isExpanded && (
        <div className="mt-2 pl-4 border-l-2 border-gray-100 space-y-1 max-h-80 overflow-y-auto">
          {scopedItems.length === 0 && (
            <p className="text-sm text-gray-400 py-2">No {isSharePoint ? 'sites' : isDatabase ? 'schemas' : isDatabricks ? 'catalogs' : isS3 ? 'buckets' : isAzureBlob ? 'containers' : 'folders'} configured</p>
          )}

          {/* OneDrive - show only selected folders */}
          {isOneDrive && (() => {
            // Deduplicate folders by id or path
            const seen = new Set();
            const uniqueFolders = scopedItems.filter(folder => {
              const key = folder.id || folder.path || folder.name;
              if (seen.has(key)) return false;
              seen.add(key);
              return true;
            });
            return uniqueFolders.map((folder, idx) => (
              <FolderItem key={folder.id || folder.path || idx} folder={folder} depth={0} />
            ));
          })()}

          {/* Google Drive - show only selected folders */}
          {isGoogleDrive && scopedItems.map((folder, idx) => {
            // Handle both string IDs and folder objects
            const folderObj = typeof folder === 'string'
              ? { id: folder, name: 'Folder' }
              : { id: folder.id, name: folder.name || 'Folder' };
            return <FolderItem key={folderObj.id || idx} folder={folderObj} depth={0} />;
          })}

          {/* Dropbox - show only selected folders */}
          {isDropbox && scopedItems.map((folder, idx) => {
            // Handle both string paths and folder objects
            const folderObj = typeof folder === 'string'
              ? { path: folder, name: folder.split('/').pop() || 'Folder' }
              : { path: folder.path, name: folder.name || 'Folder' };
            return <FolderItem key={folderObj.path || idx} folder={folderObj} depth={0} />;
          })}

          {/* SharePoint - show only selected sites */}
          {isSharePoint && scopedItems.map((site, idx) => {
            // Handle both string IDs and site objects
            const siteObj = typeof site === 'string'
              ? { id: site, name: 'Site', displayName: 'SharePoint Site' }
              : { id: site.id, name: site.name || site.displayName || 'Site', displayName: site.displayName || site.name || 'SharePoint Site' };
            return <SharePointItem key={siteObj.id || idx} item={siteObj} itemType="site" depth={0} />;
          })}

          {/* S3 - show selected buckets with recursive folder browsing */}
          {isS3 && scopedItems.map((bucket, idx) => {
            const bucketName = typeof bucket === 'string' ? bucket : bucket.name || bucket;

            // Recursive S3 folder/file item
            const S3Item = ({ item, bucketName, prefix = '', depth = 0 }) => {
              const itemKey = `s3-${bucketName}-${prefix}${item.key || item.name}`;
              const isItemExpanded = expandedItems[itemKey] === true;
              const isItemLoading = expandedItems[itemKey] === 'loading';
              const children = itemContents[itemKey] || [];

              const loadChildren = async () => {
                if (itemContents[itemKey]) {
                  setExpandedItems(prev => ({ ...prev, [itemKey]: !prev[itemKey] }));
                  return;
                }
                setExpandedItems(prev => ({ ...prev, [itemKey]: 'loading' }));
                try {
                  const folderPrefix = item.key || `${prefix}${item.name}/`;
                  const res = await authFetch(`/connectors/s3/${connector.id}/objects?bucket=${encodeURIComponent(bucketName)}&prefix=${encodeURIComponent(folderPrefix)}`);
                  if (res.ok) {
                    const data = await res.json();
                    setItemContents(prev => ({ ...prev, [itemKey]: data.items || [] }));
                    setExpandedItems(prev => ({ ...prev, [itemKey]: true }));
                  } else {
                    setExpandedItems(prev => ({ ...prev, [itemKey]: false }));
                  }
                } catch (err) {
                  console.error('Failed to load S3 folder:', err);
                  setExpandedItems(prev => ({ ...prev, [itemKey]: false }));
                }
              };

              if (item.type === 'folder') {
                return (
                  <div style={{ marginLeft: depth > 0 ? '16px' : '0' }}>
                    <button onClick={loadChildren} className="flex items-center gap-2 w-full text-left py-1 px-2 rounded hover:bg-gray-50 text-sm">
                      <ChevronIcon expanded={isItemExpanded} loading={isItemLoading} />
                      <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                      </svg>
                      <span className="text-gray-700 truncate">{item.name}</span>
                    </button>
                    {isItemExpanded && children.length > 0 && (
                      <div className="space-y-0.5">
                        {children.map((child, cIdx) => (
                          <S3Item key={`${itemKey}-${cIdx}`} item={child} bucketName={bucketName} prefix={item.key || `${prefix}${item.name}/`} depth={depth + 1} />
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              // File item
              return (
                <div style={{ marginLeft: depth > 0 ? '16px' : '0' }} className="flex items-center gap-2 py-0.5 px-2 text-sm text-gray-600">
                  <div className="w-4" />
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="truncate flex-1">{item.name}</span>
                  {item.size > 0 && <span className="text-xs text-gray-400">{formatSize(item.size)}</span>}
                </div>
              );
            };

            // Bucket root item
            const bucketKey = `bucket-${bucketName}-${idx}`;
            const isBucketExpanded = expandedItems[bucketKey] === true;
            const isLoading = expandedItems[bucketKey] === 'loading';
            const items = itemContents[bucketKey] || [];

            const loadBucketContents = async () => {
              if (itemContents[bucketKey]) {
                setExpandedItems(prev => ({ ...prev, [bucketKey]: !prev[bucketKey] }));
                return;
              }
              setExpandedItems(prev => ({ ...prev, [bucketKey]: 'loading' }));
              try {
                const res = await authFetch(`/connectors/s3/${connector.id}/objects?bucket=${encodeURIComponent(bucketName)}&prefix=`);
                if (res.ok) {
                  const data = await res.json();
                  setItemContents(prev => ({ ...prev, [bucketKey]: data.items || [] }));
                  setExpandedItems(prev => ({ ...prev, [bucketKey]: true }));
                } else {
                  setExpandedItems(prev => ({ ...prev, [bucketKey]: false }));
                }
              } catch (err) {
                console.error('Failed to load bucket contents:', err);
                setExpandedItems(prev => ({ ...prev, [bucketKey]: false }));
              }
            };

            return (
              <div key={bucketKey}>
                <button onClick={loadBucketContents} className="flex items-center gap-2 w-full text-left py-1 px-2 rounded hover:bg-gray-50 text-sm">
                  <ChevronIcon expanded={isBucketExpanded} loading={isLoading} />
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#569A31" d="M12 2L2 7l10 5 10-5-10-5z"/>
                    <path fill="#4B8F29" d="M2 17l10 5 10-5"/>
                    <path fill="#569A31" d="M2 12l10 5 10-5"/>
                  </svg>
                  <span className="text-gray-700 truncate">{bucketName}</span>
                  {items.length > 0 && <span className="text-xs text-gray-400">({items.length} items)</span>}
                </button>
                {isBucketExpanded && items.length > 0 && (
                  <div className="ml-4 space-y-0.5">
                    {items.map((item, iIdx) => (
                      <S3Item key={`${bucketKey}-${iIdx}`} item={item} bucketName={bucketName} prefix="" depth={0} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {/* Azure Blob - show selected containers with recursive folder browsing */}
          {isAzureBlob && scopedItems.map((container, idx) => {
            const containerName = typeof container === 'string' ? container : container.name || container;

            // Recursive Azure Blob folder/file item
            const AzureBlobItem = ({ item, containerName, prefix = '', depth = 0 }) => {
              const itemKey = `azure-${containerName}-${prefix}${item.fullName || item.name}`;
              const isItemExpanded = expandedItems[itemKey] === true;
              const isItemLoading = expandedItems[itemKey] === 'loading';
              const children = itemContents[itemKey] || [];

              const loadChildren = async () => {
                if (itemContents[itemKey]) {
                  setExpandedItems(prev => ({ ...prev, [itemKey]: !prev[itemKey] }));
                  return;
                }
                setExpandedItems(prev => ({ ...prev, [itemKey]: 'loading' }));
                try {
                  const folderPrefix = item.fullName || `${prefix}${item.name}/`;
                  const res = await authFetch(`/connectors/azureblob/${connector.id}/blobs?container=${encodeURIComponent(containerName)}&prefix=${encodeURIComponent(folderPrefix)}`);
                  if (res.ok) {
                    const data = await res.json();
                    setItemContents(prev => ({ ...prev, [itemKey]: data.items || [] }));
                    setExpandedItems(prev => ({ ...prev, [itemKey]: true }));
                  } else {
                    setExpandedItems(prev => ({ ...prev, [itemKey]: false }));
                  }
                } catch (err) {
                  console.error('Failed to load Azure Blob folder:', err);
                  setExpandedItems(prev => ({ ...prev, [itemKey]: false }));
                }
              };

              if (item.type === 'folder') {
                return (
                  <div style={{ marginLeft: depth > 0 ? '16px' : '0' }}>
                    <button onClick={loadChildren} className="flex items-center gap-2 w-full text-left py-1 px-2 rounded hover:bg-gray-50 text-sm">
                      <ChevronIcon expanded={isItemExpanded} loading={isItemLoading} />
                      <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                      </svg>
                      <span className="text-gray-700 truncate">{item.name}</span>
                    </button>
                    {isItemExpanded && children.length > 0 && (
                      <div className="space-y-0.5">
                        {children.map((child, cIdx) => (
                          <AzureBlobItem key={`${itemKey}-${cIdx}`} item={child} containerName={containerName} prefix={item.fullName || `${prefix}${item.name}/`} depth={depth + 1} />
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              // File item
              return (
                <div style={{ marginLeft: depth > 0 ? '16px' : '0' }} className="flex items-center gap-2 py-0.5 px-2 text-sm text-gray-600">
                  <div className="w-4" />
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="truncate flex-1">{item.name}</span>
                  {item.size > 0 && <span className="text-xs text-gray-400">{formatSize(item.size)}</span>}
                </div>
              );
            };

            // Container root item
            const containerKey = `container-${containerName}-${idx}`;
            const isContainerExpanded = expandedItems[containerKey] === true;
            const isLoading = expandedItems[containerKey] === 'loading';
            const items = itemContents[containerKey] || [];

            const loadContainerContents = async () => {
              if (itemContents[containerKey]) {
                setExpandedItems(prev => ({ ...prev, [containerKey]: !prev[containerKey] }));
                return;
              }
              setExpandedItems(prev => ({ ...prev, [containerKey]: 'loading' }));
              try {
                const res = await authFetch(`/connectors/azureblob/${connector.id}/blobs?container=${encodeURIComponent(containerName)}&prefix=`);
                if (res.ok) {
                  const data = await res.json();
                  setItemContents(prev => ({ ...prev, [containerKey]: data.items || [] }));
                  setExpandedItems(prev => ({ ...prev, [containerKey]: true }));
                } else {
                  setExpandedItems(prev => ({ ...prev, [containerKey]: false }));
                }
              } catch (err) {
                console.error('Failed to load container contents:', err);
                setExpandedItems(prev => ({ ...prev, [containerKey]: false }));
              }
            };

            return (
              <div key={containerKey}>
                <button onClick={loadContainerContents} className="flex items-center gap-2 w-full text-left py-1 px-2 rounded hover:bg-gray-50 text-sm">
                  <ChevronIcon expanded={isContainerExpanded} loading={isLoading} />
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#0089D6" d="M13.05 4.24l-5.52 15.52H4.48L10 4.24h3.05zm-1.93 5.38l4.89 10.14H22l-7.39-10.14h-3.49z"/>
                  </svg>
                  <span className="text-gray-700 truncate">{containerName}</span>
                  {items.length > 0 && <span className="text-xs text-gray-400">({items.length} items)</span>}
                </button>
                {isContainerExpanded && items.length > 0 && (
                  <div className="ml-4 space-y-0.5">
                    {items.map((item, iIdx) => (
                      <AzureBlobItem key={`${containerKey}-${iIdx}`} item={item} containerName={containerName} prefix="" depth={0} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {/* Database - show schemas and tables */}
          {isDatabase && scopedItems.map((schema, idx) => {
            const schemaName = typeof schema === 'string' ? schema : schema.name || schema;
            const schemaKey = `schema-${schemaName}-${idx}`;
            const isSchemaExpanded = expandedItems[schemaKey] === true;
            const isSchemaLoading = expandedItems[schemaKey] === 'loading';
            const tables = itemContents[schemaKey] || [];

            const loadTables = async () => {
              if (itemContents[schemaKey]) {
                setExpandedItems(prev => ({ ...prev, [schemaKey]: !prev[schemaKey] }));
                return;
              }
              setExpandedItems(prev => ({ ...prev, [schemaKey]: 'loading' }));
              try {
                const endpoint = isPostgreSQL ? 'postgresql' : isMySQL ? 'mysql' : 'sqlserver';
                const res = await authFetch(`/connectors/${endpoint}/${connector.id}/tables?schema=${encodeURIComponent(schemaName)}`);
                if (res.ok) {
                  const data = await res.json();
                  setItemContents(prev => ({ ...prev, [schemaKey]: data.tables || [] }));
                  setExpandedItems(prev => ({ ...prev, [schemaKey]: true }));
                }
              } catch (err) {
                console.error('Failed to load tables:', err);
                setExpandedItems(prev => ({ ...prev, [schemaKey]: false }));
              }
            };

            return (
              <div key={schemaKey}>
                <button
                  onClick={loadTables}
                  className="flex items-center gap-2 w-full text-left py-1 px-2 rounded hover:bg-gray-50 text-sm"
                >
                  <ChevronIcon expanded={isSchemaExpanded} loading={isSchemaLoading} />
                  <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                  </svg>
                  <span className="text-gray-700">{schemaName}</span>
                </button>

                {isSchemaExpanded && tables.length > 0 && (
                  <div className="ml-6 space-y-0.5">
                    {tables.map((table, tIdx) => {
                      const tableName = typeof table === 'string' ? table : table.name;
                      const rowCount = table.rowCount || table.row_count || 0;
                      return (
                        <div key={`${schemaName}-${tableName}-${tIdx}`} className="flex items-center gap-2 py-0.5 px-2 text-sm text-gray-600">
                          <div className="w-4" />
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          <span className="truncate flex-1">{tableName}</span>
                          {rowCount > 0 && <span className="text-xs text-gray-400">{rowCount.toLocaleString()} rows</span>}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {/* Databricks - show catalogs and schemas */}
          {isDatabricks && scopedItems.map((catalog, idx) => {
            const catalogName = typeof catalog === 'string' ? catalog : catalog.name || catalog;
            const catalogKey = `catalog-${catalogName}-${idx}`;
            const isCatalogExpanded = expandedItems[catalogKey] === true;
            const isCatalogLoading = expandedItems[catalogKey] === 'loading';
            const isError = expandedItems[catalogKey] === 'error';
            const catalogError = itemErrors[catalogKey];
            const schemas = itemContents[catalogKey] || [];

            const loadSchemas = async () => {
              if (itemContents[catalogKey]) {
                setExpandedItems(prev => ({ ...prev, [catalogKey]: !prev[catalogKey] }));
                return;
              }
              setExpandedItems(prev => ({ ...prev, [catalogKey]: 'loading' }));
              setItemErrors(prev => ({ ...prev, [catalogKey]: null }));
              try {
                const res = await authFetch(`/connectors/databricks/${connector.id}/schemas?catalog=${encodeURIComponent(catalogName)}`);
                if (res.ok) {
                  const data = await res.json();
                  setItemContents(prev => ({ ...prev, [catalogKey]: data.schemas || [] }));
                  setExpandedItems(prev => ({ ...prev, [catalogKey]: true }));
                } else {
                  const errorData = await res.json().catch(() => ({}));
                  const errorMsg = errorData.error || errorData.message || 'Failed to load schemas';
                  setItemErrors(prev => ({ ...prev, [catalogKey]: errorMsg }));
                  setExpandedItems(prev => ({ ...prev, [catalogKey]: 'error' }));
                }
              } catch (err) {
                console.error('Failed to load Databricks schemas:', err);
                setItemErrors(prev => ({ ...prev, [catalogKey]: err.message || 'Network error' }));
                setExpandedItems(prev => ({ ...prev, [catalogKey]: 'error' }));
              }
            };

            return (
              <div key={catalogKey}>
                <button
                  onClick={loadSchemas}
                  className="flex items-center gap-2 w-full text-left py-1 px-2 rounded hover:bg-gray-50 text-sm"
                >
                  <ChevronIcon expanded={isCatalogExpanded || isError} loading={isCatalogLoading} />
                  <svg className="w-4 h-4 text-[#FF3621]" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M12 2L3 7v10l9 5 9-5V7l-9-5zm0 2.18l6.63 3.68L12 11.54 5.37 7.86 12 4.18z"/>
                  </svg>
                  <span className="text-gray-700">{catalogName}</span>
                  {schemas.length > 0 && <span className="text-xs text-gray-400">({schemas.length} schemas)</span>}
                  {isError && <span className="text-xs text-red-500">Error</span>}
                </button>

                {isError && catalogError && (
                  <div className="ml-6 px-2 py-1.5 mt-1 bg-red-50 border border-red-200 rounded text-xs text-red-600">
                    {catalogError.includes('No running cluster')
                      ? 'No running cluster. Start a cluster in Databricks to browse schemas.'
                      : catalogError}
                    <button onClick={loadSchemas} className="ml-2 underline hover:no-underline">Retry</button>
                  </div>
                )}

                {isCatalogExpanded && schemas.length > 0 && (
                  <div className="ml-6 space-y-0.5">
                    {schemas.map((schema, sIdx) => {
                      const schemaName = typeof schema === 'string' ? schema : schema.name;
                      return (
                        <div key={`${catalogName}-${schemaName}-${sIdx}`} className="flex items-center gap-2 py-0.5 px-2 text-sm text-gray-600">
                          <div className="w-4" />
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                          </svg>
                          <span className="truncate flex-1">{schemaName}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/**
 * Existing connectors list - matches dashboard card and status patterns
 */
function ExistingConnectors({ connectors, onDelete, onRefresh, authFetch, onCompleteSetup }) {
  if (connectors.length === 0) return null;

  // Uses dashboard-consistent status styling (success-bg, error-bg from tailwind config)
  const getStatusStyle = (status) => {
    switch (status) {
      case 'connected': return 'text-success bg-success-bg border-success/20';
      case 'scoped': return 'text-success bg-success-bg border-success/20';
      case 'pending': return 'text-slate bg-slate/10 border-slate/20';
      case 'pending_scope': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'error': return 'text-error bg-error-bg border-error/20';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  // Get display label for status
  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending_scope': return 'Needs Setup';
      case 'scoped': return 'Ready';
      default: return status;
    }
  };

  // Get connector type icon
  const getConnectorIcon = (type) => {
    if (type === 'onedrive' || type === 'enterprise_onedrive') {
      return (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.5 6c2.3 0 4.3 1.6 4.9 3.8.1.4.2.8.2 1.2 0 .1 0 .3-.1.4 1.7.4 3 1.9 3 3.6 0 2.1-1.7 3.8-3.8 3.8H7.8c-2.1 0-3.8-1.7-3.8-3.8 0-1.8 1.2-3.3 2.9-3.7-.1-.2-.1-.5-.1-.7 0-2.5 2-4.6 4.5-4.6h1.2z"/>
        </svg>
      );
    }
    if (type === 'sharepoint' || type === 'enterprise_sharepoint') {
      return (
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <circle cx="12" cy="8" r="6" fill="#038387"/>
          <circle cx="7" cy="14" r="5" fill="#37a987"/>
          <circle cx="17" cy="15" r="4" fill="#1a9ba1"/>
        </svg>
      );
    }
    // Database icons - proper cylinder/database icons
    if (type === 'postgresql') {
      return (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <ellipse cx="12" cy="5" rx="8" ry="3" />
          <path d="M4 5v14c0 1.66 3.58 3 8 3s8-1.34 8-3V5" />
          <path d="M4 12c0 1.66 3.58 3 8 3s8-1.34 8-3" />
        </svg>
      );
    }
    if (type === 'mysql') {
      return (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <ellipse cx="12" cy="5" rx="8" ry="3" />
          <path d="M4 5v14c0 1.66 3.58 3 8 3s8-1.34 8-3V5" />
          <path d="M4 12c0 1.66 3.58 3 8 3s8-1.34 8-3" />
        </svg>
      );
    }
    if (type === 'mssql') {
      return (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <ellipse cx="12" cy="5" rx="8" ry="3" />
          <path d="M4 5v14c0 1.66 3.58 3 8 3s8-1.34 8-3V5" />
          <path d="M4 12c0 1.66 3.58 3 8 3s8-1.34 8-3" />
        </svg>
      );
    }
    return (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
      </svg>
    );
  };

  // Check if connector is OneDrive type
  const isOneDriveConnector = (type) => type === 'onedrive' || type === 'enterprise_onedrive';

  // Check if connector is SharePoint type
  const isSharePointConnector = (type) => type === 'sharepoint' || type === 'enterprise_sharepoint';

  // Check if connector is Google Drive type
  const isGoogleDriveConnector = (type) => type === 'googledrive' || type === 'google_drive';

  // Check if connector is Dropbox type
  const isDropboxConnector = (type) => type === 'dropbox' || type === 'enterprise_dropbox';

  // Check if connector is enterprise cloud (OneDrive, SharePoint, Google Drive, or Dropbox)
  const isEnterpriseCloud = (type) => isOneDriveConnector(type) || isSharePointConnector(type) || isGoogleDriveConnector(type) || isDropboxConnector(type);
  const isEnterpriseDatabase = (type) => ['postgresql', 'mysql', 'mssql', 's3', 'aws_s3', 'azureblob', 'azure_blob', 'databricks'].includes(type?.toLowerCase());
  const isEnterpriseConnector = (type) => isEnterpriseCloud(type) || isEnterpriseDatabase(type);

  // Get icon color based on connector type
  const getIconStyle = (type) => {
    if (isOneDriveConnector(type)) return 'bg-blue-100 text-blue-600';
    if (isSharePointConnector(type)) return 'bg-teal-100 text-teal-600';
    if (isGoogleDriveConnector(type)) return 'bg-red-100 text-red-600';
    if (isDropboxConnector(type)) return 'bg-blue-100 text-blue-500';
    if (type === 'postgresql') return 'bg-blue-100 text-[#336791]';
    if (type === 'mysql') return 'bg-orange-100 text-[#F29111]';
    if (type === 'mssql') return 'bg-red-100 text-[#CC2927]';
    return 'bg-violet-100 text-violet-600';
  };

  // Get description including email and scope info
  const getDescription = (connector) => {
    // Use enterprise_type first for enterprise connectors, fallback to type
    const type = connector.enterprise_type || connector.type;

    // Show connected email for enterprise connectors
    if (isEnterpriseCloud(type)) {
      const email = connector.connectedEmail;
      const scopeInfo = connector.scopeInfo;

      let parts = [];
      if (email) parts.push(email);
      if (scopeInfo?.foldersCount > 0) {
        parts.push(`${scopeInfo.foldersCount} folder${scopeInfo.foldersCount !== 1 ? 's' : ''}`);
      }
      if (scopeInfo?.sitesCount > 0) {
        parts.push(`${scopeInfo.sitesCount} site${scopeInfo.sitesCount !== 1 ? 's' : ''}`);
      }

      if (parts.length > 0) return parts.join(' · ');
      if (isOneDriveConnector(type)) return 'OneDrive';
      if (isSharePointConnector(type)) return 'SharePoint';
      if (isGoogleDriveConnector(type)) return 'Google Drive';
      if (isDropboxConnector(type)) return 'Dropbox';
    }

    // Show database info for database connectors
    if (isEnterpriseDatabase(type)) {
      const scopeConfig = connector.scope_config;
      let parts = [];
      if (scopeConfig?.schemas?.length > 0) {
        parts.push(`${scopeConfig.schemas.length} schema${scopeConfig.schemas.length !== 1 ? 's' : ''}`);
      }
      if (parts.length > 0) return parts.join(' · ');
      // Return type name properly formatted
      const typeNames = {
        postgresql: 'PostgreSQL',
        mysql: 'MySQL',
        mssql: 'SQL Server',
        s3: 'Amazon S3',
        azureblob: 'Azure Blob',
        databricks: 'Databricks',
      };
      return typeNames[type] || type;
    }

    return connector.scope?.rootPath || connector.scope_config?.rootPath ||
           (type || '').replace('_', ' ').replace('enterprise ', '');
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Active Data Sources</h2>
        <button
          onClick={onRefresh}
          className="text-sm text-gray-500 hover:text-slate transition-colors"
        >
          Refresh
        </button>
      </div>
      <div className="grid gap-3">
        {connectors.map((connector) => {
          // Use enterprise_type first for enterprise connectors
          const type = connector.enterprise_type || connector.type;
          const needsSetup = connector.status === 'pending_scope' ||
            (connector.status === 'connected' && !connector.scope_confirmed);

          return (
            <div
              key={connector.id}
              className={`p-4 bg-white rounded-xl border transition-all duration-200 ${
                needsSetup
                  ? 'border-amber-200 bg-amber-50/30'
                  : 'border-gray-200 hover:border-slate/30'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getIconStyle(type)}`}>
                    {getConnectorIcon(type)}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{connector.display_name}</div>
                    <div className="text-sm text-gray-500">
                      {getDescription(connector)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusStyle(needsSetup ? 'pending_scope' : connector.status)}`}>
                    {getStatusLabel(needsSetup ? 'pending_scope' : connector.status)}
                  </span>
                  {/* Complete setup CTA for pending_scope connectors - all enterprise connectors */}
                  {needsSetup && isEnterpriseConnector(type) && (
                    <button
                      onClick={() => onCompleteSetup?.(connector)}
                      className="px-3 py-1.5 text-sm font-medium text-white bg-slate rounded-lg hover:bg-slate/90 transition-colors"
                    >
                      Complete Setup
                    </button>
                  )}
                  {/* Edit Scope button for fully configured enterprise connectors */}
                  {!needsSetup && isEnterpriseConnector(type) && connector.status !== 'error' && (
                    <button
                      onClick={() => {
                        console.log('[Edit Scope] Button clicked for connector:', connector.id, 'type:', type);
                        onCompleteSetup?.(connector);
                      }}
                      className="px-3 py-1.5 text-sm font-medium text-slate bg-slate/10 rounded-lg hover:bg-slate/20 transition-colors"
                    >
                      Edit Scope
                    </button>
                  )}
                  <button
                    onClick={() => onDelete(connector.id)}
                    className="text-gray-400 hover:text-error transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Pending scope info banner */}
              {needsSetup && (
                <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm text-amber-800">
                    <strong>Setup incomplete:</strong> Select which {isSharePointConnector(type) ? 'sites' : 'folders'} to include before using this connector for ingestion.
                  </p>
                </div>
              )}

              {/* Expandable file list for folder connectors */}
              {connector.type === 'local_folder' && (
                <ConnectorFiles
                  connector={connector}
                  authFetch={authFetch}
                  onUpdate={onRefresh}
                />
              )}

              {/* Expandable content preview for enterprise connectors */}
              <ConnectorContentPreview
                connector={connector}
                authFetch={authFetch}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Uploaded Files component - Shows files uploaded via File Upload with exclude functionality
 * Groups uploads by date for better organization
 */
/**
 * Context Explanation Tooltip Component
 * Shows why a context was detected on hover
 * Handles both dataset-level and per-file contexts with attribution
 */
function ContextTooltip({ context, children, isPerFile = false }) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const triggerRef = useRef(null);

  const handleMouseEnter = (e) => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({ x: rect.left, y: rect.bottom + 8 });
    }
    setShowTooltip(true);
  };

  const handleMouseLeave = () => setShowTooltip(false);

  // Build signal source descriptions
  const getSignalDescription = () => {
    if (!context.signalSources) return [];
    const signals = [];
    if (context.signalSources.text > 0) signals.push(`Text content (${context.signalSources.text} files)`);
    if (context.signalSources.ocr > 0) signals.push(`OCR extracted text (${context.signalSources.ocr} files)`);
    if (context.signalSources.filename > 0) signals.push(`Filename keywords (${context.signalSources.filename} files)`);
    if (context.signalSources.metadata > 0) signals.push(`Media metadata (${context.signalSources.metadata} files)`);
    if (context.signalSources.visualLabels > 0) signals.push(`Visual analysis (${context.signalSources.visualLabels} files)`);
    return signals;
  };

  const signals = getSignalDescription();
  const isUser = context.source === 'user';
  const isInherited = context.attribution === 'inherited';

  return (
    <div
      ref={triggerRef}
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {showTooltip && (
        <div
          className="fixed z-50 w-72 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl"
          style={{ left: Math.min(position.x, window.innerWidth - 300), top: position.y }}
        >
          {/* Source & Attribution Badges */}
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
              isUser ? 'bg-ion/30 text-ion' : 'bg-info/30 text-info'
            }`}>
              {isUser ? 'USER DEFINED' : 'SYSTEM DETECTED'}
            </span>
            {isPerFile && (
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                isInherited ? 'bg-amber-500/30 text-amber-200' : 'bg-green-500/30 text-green-200'
              }`}>
                {isInherited ? 'INHERITED' : 'DIRECT'}
              </span>
            )}
            <span className="text-gray-400 text-[10px] italic">
              {context.explanation?.confidence || 'estimated'}
            </span>
          </div>

          {/* Context Label */}
          <div className="font-semibold text-white mb-2">
            {context.label} <span className="text-gray-400">({context.percent}%)</span>
          </div>

          {/* Attribution Explanation for per-file contexts */}
          {isPerFile && (
            <div className={`p-2 rounded mb-2 ${isInherited ? 'bg-amber-900/30 border border-amber-700/50' : 'bg-green-900/30 border border-green-700/50'}`}>
              {isInherited ? (
                <div className="text-amber-200">
                  <span className="font-semibold">⚠ Inherited context</span>
                  <p className="mt-1 text-amber-300/80">
                    {context.reason || 'This context was not directly detected in this file. It is applied from the dataset-level analysis based on other files in this upload.'}
                  </p>
                </div>
              ) : (
                <div className="text-green-200">
                  <span className="font-semibold">✓ Direct detection</span>
                  <p className="mt-1 text-green-300/80">
                    {context.reason || 'Strong signals were detected directly in this file.'}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Why Detected (for non-per-file contexts) */}
          {!isPerFile && (
            <div className="text-gray-300 mb-2">
              <span className="text-gray-400">Why detected:</span>
              <div className="mt-1">
                {isUser ? (
                  <span>Matches keywords from your defined context</span>
                ) : (
                  <span>Detected via {context.explanation?.method?.replace('_', ' ') || 'keyword analysis'}</span>
                )}
              </div>
            </div>
          )}

          {/* Signal Sources */}
          {signals.length > 0 && (
            <div className="border-t border-gray-700 pt-2 mt-2">
              <span className="text-gray-400 text-[10px] uppercase">Contributing Signals:</span>
              <ul className="mt-1 space-y-0.5">
                {signals.map((sig, i) => (
                  <li key={i} className="flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-green-400"></span>
                    <span>{sig}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* File Count */}
          {context.fileCount != null && (
            <div className="mt-2 text-gray-400 text-[10px]">
              Detected in {context.fileCount} file{context.fileCount !== 1 ? 's' : ''}
            </div>
          )}

          {/* Arrow */}
          <div className="absolute -top-2 left-4 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[8px] border-b-gray-900"></div>
        </div>
      )}
    </div>
  );
}

/**
 * Per-File Context Badge Component
 * Displays context badges with visual distinction for direct vs inherited
 */
function FileContextBadge({ context }) {
  const isInherited = context.attribution === 'inherited';

  return (
    <ContextTooltip context={context} isPerFile={true}>
      <span
        className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-xs rounded cursor-help transition-all ${
          isInherited
            ? 'bg-gray-100 text-gray-500 border border-dashed border-gray-300 opacity-70'
            : 'bg-info/10 text-info border border-info/30'
        }`}
      >
        {context.label}
        {!isInherited && <span className="text-info/70">{context.percent}%</span>}
        {isInherited && <span className="text-[10px] text-gray-400 italic">(inherited)</span>}
      </span>
    </ContextTooltip>
  );
}

/**
 * Per-File Context List Component
 * Shows contexts for a single file with collapsed inherited contexts
 */
function FileContextList({ contexts }) {
  const [showAllInherited, setShowAllInherited] = useState(false);

  if (!contexts || contexts.length === 0) return null;

  const directContexts = contexts.filter(c => c.attribution === 'direct');
  const inheritedContexts = contexts.filter(c => c.attribution === 'inherited');

  const visibleInherited = showAllInherited ? inheritedContexts : inheritedContexts.slice(0, 1);
  const hiddenInheritedCount = inheritedContexts.length - visibleInherited.length;

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {/* Direct contexts (full display) */}
      {directContexts.map((ctx, i) => (
        <FileContextBadge key={`direct-${i}`} context={ctx} />
      ))}

      {/* Inherited contexts (collapsed) */}
      {visibleInherited.map((ctx, i) => (
        <FileContextBadge key={`inherited-${i}`} context={ctx} />
      ))}

      {/* Show more inherited toggle */}
      {hiddenInheritedCount > 0 && (
        <button
          onClick={() => setShowAllInherited(true)}
          className="text-[10px] text-gray-400 hover:text-gray-600 px-1"
        >
          +{hiddenInheritedCount} inherited
        </button>
      )}

      {/* Collapse button when expanded */}
      {showAllInherited && inheritedContexts.length > 1 && (
        <button
          onClick={() => setShowAllInherited(false)}
          className="text-[10px] text-gray-400 hover:text-gray-600 px-1"
        >
          collapse
        </button>
      )}
    </div>
  );
}

/**
 * Context Explanation Modal
 * Shows detailed breakdown for a system-detected context
 */
function ContextExplanationModal({ context, files, onClose }) {
  if (!context) return null;

  // Find files that contain this context
  const filesWithContext = files?.filter(f =>
    f.contextInfo?.topContexts?.some(c => c.label === context.label)
  ) || [];

  const getSignalIcon = (signal) => {
    const icons = {
      text: '📄',
      ocr: '🔍',
      filename: '📁',
      metadata: '🎬',
      visualLabels: '👁️'
    };
    return icons[signal] || '•';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-xs font-semibold bg-info/10 text-info">
                System Detected
              </span>
              <span className="text-xs text-gray-400 italic">Heuristic • Estimated</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mt-1">{context.label}</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="px-5 py-4 overflow-y-auto max-h-[60vh]">
          {/* Summary */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="text-2xl font-bold text-gray-900">{context.percent}%</div>
            <div className="text-sm text-gray-500 mt-1">of your data matches this context</div>
            <div className="text-xs text-gray-400 mt-2">
              Detected in {context.fileCount || 0} file{context.fileCount !== 1 ? 's' : ''} • Method: Keyword Frequency Analysis
            </div>
          </div>

          {/* Contributing Signals */}
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Contributing Signals</h4>
            <div className="space-y-2">
              {context.signalSources && Object.entries(context.signalSources)
                .filter(([_, count]) => count > 0)
                .map(([signal, count]) => (
                  <div key={signal} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <span>{getSignalIcon(signal)}</span>
                      <span className="capitalize">{signal.replace(/([A-Z])/g, ' $1').trim()}</span>
                    </span>
                    <span className="text-gray-500">{count} file{count !== 1 ? 's' : ''}</span>
                  </div>
                ))
              }
            </div>
          </div>

          {/* Files List with Attribution */}
          {filesWithContext.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Files Contributing</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {filesWithContext.slice(0, 10).map((file, i) => {
                  const fileCtx = file.contextInfo?.topContexts?.find(c => c.label === context.label);
                  const isDirect = fileCtx?.attribution === 'direct';
                  const isInherited = fileCtx?.attribution === 'inherited';

                  return (
                    <div
                      key={i}
                      className={`flex items-center justify-between text-sm p-2 rounded ${
                        isInherited ? 'bg-amber-50 border border-dashed border-amber-200' : 'bg-green-50 border border-green-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                          isInherited ? 'bg-amber-200 text-amber-700' : 'bg-green-200 text-green-700'
                        }`}>
                          {isInherited ? '↓' : '✓'}
                        </span>
                        <span className="truncate">{file.name}</span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                          isInherited ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'
                        }`}>
                          {isInherited ? 'inherited' : 'direct'}
                        </span>
                        <div className="flex gap-0.5">
                          {file.contextInfo?.signalsUsed?.text && <span title="Text content">📄</span>}
                          {file.contextInfo?.signalsUsed?.ocr && <span title="OCR text">🔍</span>}
                          {file.contextInfo?.signalsUsed?.filename && <span title="Filename">📁</span>}
                          {file.contextInfo?.signalsUsed?.visualLabels && <span title="Visual">👁</span>}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {filesWithContext.length > 10 && (
                  <div className="text-xs text-gray-400 text-center">
                    +{filesWithContext.length - 10} more files
                  </div>
                )}
              </div>
              {/* Attribution Legend */}
              <div className="mt-3 pt-3 border-t border-gray-100 flex gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <span className="w-4 h-4 rounded-full bg-green-200 text-green-700 flex items-center justify-center text-[10px]">✓</span>
                  <span>Direct (detected in file)</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-4 h-4 rounded-full bg-amber-200 text-amber-700 flex items-center justify-center text-[10px]">↓</span>
                  <span>Inherited (from dataset)</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-200 bg-gray-50 text-xs text-gray-500">
          This context is estimated using keyword frequency analysis. Results may vary based on document content.
        </div>
      </div>
    </div>
  );
}

function UploadedFiles({ uploads, onRefresh, authFetch }) {
  const [localUploads, setLocalUploads] = useState(uploads);
  const [collapsedGroups, setCollapsedGroups] = useState({});
  const [explanationModal, setExplanationModal] = useState({ open: false, context: null, files: null });

  // Sync with parent
  useEffect(() => {
    setLocalUploads(uploads);
  }, [uploads]);

  if (localUploads.length === 0) return null;

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  // Get confidence level and styling based on percentage
  const getConfidenceLevel = (percent) => {
    if (percent >= 70) return { level: 'Strong', color: 'emerald', bgColor: 'bg-emerald-50', textColor: 'text-emerald-700', borderColor: 'border-emerald-200' };
    if (percent >= 40) return { level: 'Moderate', color: 'amber', bgColor: 'bg-amber-50', textColor: 'text-amber-700', borderColor: 'border-amber-200' };
    return { level: 'Indicative', color: 'gray', bgColor: 'bg-gray-50', textColor: 'text-gray-600', borderColor: 'border-gray-200' };
  };

  // Get context source label and styling
  const getContextSourceLabel = (upload) => {
    const contextMeta = upload.results?.contextMeta;
    const contextSource = contextMeta?.source || upload.context_source;
    const linkedName = contextMeta?.linkedContextName;

    if (contextSource === 'library') {
      return {
        label: linkedName ? `📚 ${linkedName}` : 'From Library',
        icon: '📚',
        color: 'text-blue-600',
        bg: 'bg-blue-50',
        linkedName
      };
    } else if (contextSource === 'custom') {
      return { label: 'Custom', icon: '✏️', color: 'text-slate', bg: 'bg-slate/10' };
    } else if (contextSource === 'auto') {
      return { label: 'Estimated', icon: '🔮', color: 'text-gray-500', bg: 'bg-gray-50' };
    }
    // Default fallback for heuristic/estimated contexts
    return { label: 'Estimated', icon: '🔮', color: 'text-gray-500', bg: 'bg-gray-50' };
  };

  // Group uploads by date
  const getDateGroup = (dateStr) => {
    if (!dateStr) return 'Unknown';
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const groupedUploads = localUploads.reduce((groups, upload) => {
    const group = getDateGroup(upload.createdAt);
    if (!groups[group]) groups[group] = [];
    groups[group].push(upload);
    return groups;
  }, {});

  const toggleGroup = (group) => {
    setCollapsedGroups(prev => ({ ...prev, [group]: !prev[group] }));
  };

  const toggleFileExclude = async (uploadId, fileId) => {
    // Find upload and file
    const upload = localUploads.find(u => u.id === uploadId);
    if (!upload) return;

    const file = upload.files.find(f => f.id === fileId);
    const newExcluded = !file.excluded;

    // Update local state immediately
    setLocalUploads(localUploads.map(u => {
      if (u.id !== uploadId) return u;
      return {
        ...u,
        files: u.files.map(f => f.id === fileId ? { ...f, excluded: newExcluded } : f)
      };
    }));

    // Get excluded file IDs and save
    const updatedFiles = upload.files.map(f => f.id === fileId ? { ...f, excluded: newExcluded } : f);
    const excludedFileIds = updatedFiles.filter(f => f.excluded).map(f => f.id);

    try {
      await authFetch(`/uploads/${uploadId}`, {
        method: 'PATCH',
        body: JSON.stringify({ excludedFileIds })
      });
    } catch (error) {
      console.error('Failed to update excluded files:', error);
      // Revert on error
      setLocalUploads(localUploads);
    }
  };

  // Visual category → context mapping (Phase 3.2.5)
  const visualCategoryToContext = (category) => {
    const mapping = {
      'Photo': 'Photography',
      'Product': 'Products',
      'Screenshot': 'UI/Screenshots',
      'Document': 'Documents',
      'Chart': 'Analytics',
      'Logo': 'Branding',
      'Diagram': 'Technical',
      'Portrait': 'People',
      'Landscape': 'Nature',
      'Food': 'Food & Beverage',
      'Architecture': 'Real Estate',
    };
    return mapping[category] || category;
  };

  // Render a single upload card
  const renderUploadCard = (upload) => {
    const includedCount = upload.files?.filter(f => !f.excluded).length || 0;
    const excludedCount = upload.files?.filter(f => f.excluded).length || 0;
    const ocrStatus = upload.results?.ocr;
    const hasOcrSuccess = ocrStatus?.enabled && ocrStatus?.results?.length > 0;
    const hasOcrBlocked = ocrStatus?.blocked;
    const hasOcrFailed = ocrStatus?.failed;
    // OCR ran but found no text
    const hasOcrEmpty = ocrStatus?.enabled && ocrStatus?.results?.length > 0 &&
      ocrStatus.results.every(r => !r.extractedText || r.extractedText.trim().length === 0);
    // Video status - Phase 3.2.3
    const videoStatus = upload.results?.video;
    const hasVideoProcessed = videoStatus?.filesProcessed > 0;

    // Context Coverage - Phase 3.2.4 (enhanced with explainability)
    // Try new API format first, fall back to legacy
    const ctxCoverage = upload.contextCoverage || upload.results?.contextCoverage;
    const dominantContexts = ctxCoverage?.dominantContexts || ctxCoverage?.summary?.dominantContexts || [];
    const userContexts = ctxCoverage?.userContextSummary || ctxCoverage?.summary?.userContextSummary || [];

    // Visual Understanding - Phase 3.2.5
    const visualResults = upload.results?.visualUnderstanding;
    const visualCategories = visualResults?.categories || {};
    // Map visual categories to context-like chips
    const visualContexts = Object.keys(visualCategories).slice(0, 2).map(cat => ({
      label: visualCategoryToContext(cat),
      source: 'visual'
    }));
    const topContext = dominantContexts[0];

    // Combine user and system contexts for display
    const hasContextInfo = dominantContexts.length > 0 || userContexts.length > 0;

    return (
      <div
        key={upload.id}
        className="p-3 bg-white rounded-lg border border-gray-100 hover:border-slate/30 transition-all duration-200"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
              hasVideoProcessed ? 'bg-indigo-100 text-indigo-600' :
              hasOcrSuccess ? 'bg-ion/10 text-ion' : 'bg-success-bg text-success'
            }`}>
              {hasVideoProcessed ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              ) : hasOcrSuccess ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-900 truncate">
                  {upload.files?.[0]?.name || `${includedCount} file${includedCount !== 1 ? 's' : ''}`}
                </span>
                {upload.files?.length > 1 && (
                  <span className="text-xs text-gray-400">+{upload.files.length - 1}</span>
                )}
              </div>
              <div className="text-xs text-gray-500">
                {formatFileSize(upload.totalBytes)} • {formatDate(upload.createdAt).split(',')[1]?.trim() || formatDate(upload.createdAt)}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {hasVideoProcessed && (
              <span className="px-1.5 py-0.5 text-xs font-medium rounded border text-indigo-600 bg-indigo-50 border-indigo-200">
                Video
              </span>
            )}
            {hasOcrSuccess && !hasOcrEmpty && (
              <span className="px-1.5 py-0.5 text-xs font-medium rounded border text-ion bg-ion/10 border-ion/30">
                OCR
              </span>
            )}
            {hasOcrEmpty && (
              <span className="px-1.5 py-0.5 text-xs font-medium rounded border text-amber-600 bg-amber-50 border-amber-200" title="OCR ran but found no text">
                OCR: No text
              </span>
            )}
            {hasOcrBlocked && (
              <span className="px-1.5 py-0.5 text-xs font-medium rounded border text-orange-600 bg-orange-50 border-orange-200">
                ⚠
              </span>
            )}
            {hasOcrFailed && (
              <span className="px-1.5 py-0.5 text-xs font-medium rounded border text-red-600 bg-red-50 border-red-200">
                ✕
              </span>
            )}
            {visualContexts.length > 0 && (
              <span className="px-1.5 py-0.5 text-xs font-medium rounded border text-ion bg-ion/10 border-ion/30" title="Visual Understanding">
                👁
              </span>
            )}
            <span className="px-1.5 py-0.5 text-xs font-medium rounded border text-success bg-success-bg border-success/20">
              ✓
            </span>
          </div>
        </div>
        {/* Context Coverage - Phase 3.2.4 + Visual Contexts - Phase 3.2.5 */}
        {(hasContextInfo || visualContexts.length > 0) && (
          <div className="mt-2 pt-2 border-t border-gray-100">
            {/* User-defined contexts (intent match) with confidence badges */}
            {userContexts.length > 0 && (
              <div className="flex items-center gap-1.5 text-xs text-gray-500 flex-wrap mb-1.5">
                <span className="font-medium text-blue-600">Your Context:</span>
                {userContexts.slice(0, 2).map((ctx, i) => {
                  const confidence = getConfidenceLevel(ctx.percent);
                  return (
                    <ContextTooltip key={`usr-${i}`} context={{ ...ctx, source: 'user' }}>
                      <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 cursor-help inline-flex items-center gap-1">
                        {ctx.label}
                        <span className="text-blue-400">{ctx.percent}%</span>
                        <span className={`text-[9px] font-medium px-1 py-0.5 rounded ${confidence.bgColor} ${confidence.textColor} border ${confidence.borderColor}`} title={`${confidence.level} confidence`}>
                          {confidence.level}
                        </span>
                      </span>
                    </ContextTooltip>
                  );
                })}
              </div>
            )}

            {/* System-detected contexts */}
            <div className="flex items-center gap-1.5 text-xs text-gray-500 flex-wrap">
              <span className="font-medium text-info">Proposed:</span>
              {/* Text-based contexts with tooltips and confidence badges */}
              {dominantContexts.slice(0, 3).map((ctx, i) => {
                const confidence = getConfidenceLevel(ctx.percent);
                return (
                  <ContextTooltip key={`txt-${i}`} context={{ ...ctx, source: 'system' }}>
                    <span
                      className={`px-1.5 py-0.5 rounded ${confidence.bgColor} ${confidence.textColor} border ${confidence.borderColor} cursor-help inline-flex items-center gap-1`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setExplanationModal({ open: true, context: ctx, files: upload.files });
                      }}
                    >
                      {ctx.label}
                      <span className={`text-${confidence.color}-400`}>{ctx.percent}%</span>
                      <span className={`text-[9px] font-medium px-1 py-0.5 rounded ${confidence.bgColor} border ${confidence.borderColor}`} title={`${confidence.level} confidence`}>
                        {confidence.level}
                      </span>
                      {ctx.source === 'system' && (
                        <span className={`text-${confidence.color}-300 hover:text-${confidence.color}-500`} title="Why detected?">?</span>
                      )}
                    </span>
                  </ContextTooltip>
                );
              })}
              {/* Visual-derived contexts */}
              {visualContexts.map((ctx, i) => (
                <span key={`vis-${i}`} className="px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-600 border border-indigo-100" title="Detected from visual analysis">
                  👁 {ctx.label}
                </span>
              ))}
              {/* Context source status label */}
              {(() => {
                const sourceInfo = getContextSourceLabel(upload);
                return (
                  <span
                    className={`text-[10px] ${sourceInfo.color} font-medium ml-1 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded ${sourceInfo.bg}`}
                    title={sourceInfo.linkedName ? `Context Library: ${sourceInfo.linkedName}` : `Context source: ${sourceInfo.label}`}
                  >
                    {sourceInfo.linkedName ? (
                      // Show linked context name with icon
                      <span>{sourceInfo.label}</span>
                    ) : (
                      // Show icon + label
                      <>
                        <span>{sourceInfo.icon}</span>
                        <span>{sourceInfo.label}</span>
                      </>
                    )}
                  </span>
                );
              })()}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Uploaded Files
            <span className="ml-2 text-sm font-normal text-gray-500">({localUploads.length})</span>
          </h2>
          <button
            onClick={onRefresh}
            className="text-sm text-gray-500 hover:text-slate transition-colors"
          >
            Refresh
          </button>
        </div>

        <div className="space-y-4">
          {Object.entries(groupedUploads).map(([group, uploads]) => (
            <div key={group} className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
              {/* Group Header - Collapsible */}
              <button
                onClick={() => toggleGroup(group)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <svg
                    className={`w-4 h-4 text-gray-400 transition-transform ${collapsedGroups[group] ? '' : 'rotate-90'}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  <span className="font-medium text-gray-700">{group}</span>
                  <span className="text-sm text-gray-500">({uploads.length} upload{uploads.length !== 1 ? 's' : ''})</span>
                </div>
                <div className="flex items-center gap-2">
                  {uploads.some(u => u.results?.ocr?.enabled && u.results?.ocr?.results?.length > 0) && (
                    <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-ion/10 text-ion">
                      {uploads.filter(u => u.results?.ocr?.enabled && u.results?.ocr?.results?.length > 0).length} OCR
                    </span>
                  )}
                </div>
              </button>

              {/* Group Content */}
              {!collapsedGroups[group] && (
                <div className="px-3 pb-3 space-y-2">
                  {uploads.map(renderUploadCard)}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Context Explanation Modal */}
      {explanationModal.open && (
        <ContextExplanationModal
          context={explanationModal.context}
          files={explanationModal.files}
          onClose={() => setExplanationModal({ open: false, context: null, files: null })}
        />
      )}
    </>
  );
}

// Legacy detailed upload card for backward compatibility if needed
function UploadedFilesDetailed({ uploads, onRefresh, authFetch }) {
  const [localUploads, setLocalUploads] = useState(uploads);

  useEffect(() => {
    setLocalUploads(uploads);
  }, [uploads]);

  if (localUploads.length === 0) return null;

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const toggleFileExclude = async (uploadId, fileId) => {
    const upload = localUploads.find(u => u.id === uploadId);
    if (!upload) return;

    const file = upload.files.find(f => f.id === fileId);
    const newExcluded = !file.excluded;

    setLocalUploads(localUploads.map(u => {
      if (u.id !== uploadId) return u;
      return {
        ...u,
        files: u.files.map(f => f.id === fileId ? { ...f, excluded: newExcluded } : f)
      };
    }));

    const updatedFiles = upload.files.map(f => f.id === fileId ? { ...f, excluded: newExcluded } : f);
    const excludedFileIds = updatedFiles.filter(f => f.excluded).map(f => f.id);

    try {
      await authFetch(`/uploads/${uploadId}`, {
        method: 'PATCH',
        body: JSON.stringify({ excludedFileIds })
      });
    } catch (error) {
      console.error('Failed to update excluded files:', error);
      setLocalUploads(localUploads);
    }
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Uploaded Files</h2>
        <button onClick={onRefresh} className="text-sm text-gray-500 hover:text-slate transition-colors">
          Refresh
        </button>
      </div>
      <div className="grid gap-3">
        {localUploads.map((upload) => {
          const includedCount = upload.files?.filter(f => !f.excluded).length || 0;
          const excludedCount = upload.files?.filter(f => f.excluded).length || 0;
          const ocrStatus = upload.results?.ocr;
          const hasOcrSuccess = ocrStatus?.enabled && ocrStatus?.results?.length > 0;

          return (
            <div key={upload.id} className="p-4 bg-white rounded-xl border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <div className="font-medium text-gray-900">
                  {includedCount} file{includedCount !== 1 ? 's' : ''} included
                  {excludedCount > 0 && <span className="text-gray-400 font-normal"> ({excludedCount} excluded)</span>}
                </div>
                {hasOcrSuccess && (
                  <span className="px-2 py-1 text-xs font-medium rounded-full border text-ion bg-ion/10 border-ion/30">
                    OCR ✓
                  </span>
                )}
              </div>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {upload.files?.map((file) => (
                  <div key={file.id} className={`flex items-center justify-between py-1.5 px-2 rounded-lg text-sm ${file.excluded ? 'bg-gray-50 text-gray-400' : 'hover:bg-gray-50'}`}>
                    <span className={`truncate ${file.excluded ? 'line-through' : ''}`}>{file.name}</span>
                    <button onClick={() => toggleFileExclude(upload.id, file.id)} className="p-1 rounded text-gray-400 hover:text-error">
                      {file.excluded ? '+' : '×'}
                    </button>
                  </div>
                ))}
              </div>
              {upload.context && (
                <div className="mt-2 text-sm text-gray-500 italic">"{upload.context}"</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Context Coverage Summary Panel - THREE-LAYER MODEL
 *
 * Layer 1: User-Defined Context (Primary / Intent Context)
 *   - Context written/selected by user
 *   - Shows how much data aligns with user's intent
 *
 * Layer 2: System-Proposed Contexts (Normalized / Taxonomy-Based)
 *   - Inferred from text, OCR, filenames, video metadata, visual labels
 *   - Top 5 + Other, normalized to 100%
 *
 * Layer 3: Per-File Context Indicators
 *   - Top 2-3 contexts per file/upload
 */
function ContextCoverageSummary({ uploads }) {
  // ========== LAYER 1: User-Defined Context ==========
  let userContext = null;
  let userContextCoverage = 0;

  // Find user-provided context from uploads
  uploads.forEach(upload => {
    if (upload.context && !userContext) {
      userContext = upload.context;
    }
    // Get user context coverage from results if available
    const coverage = upload.results?.contextCoverage;
    if (coverage?.summary?.userContextCoverage) {
      userContextCoverage = Math.max(userContextCoverage, coverage.summary.userContextCoverage);
    } else if (coverage?.summary?.userContextSummary?.[0]?.percent) {
      userContextCoverage = Math.max(userContextCoverage, coverage.summary.userContextSummary[0].percent);
    }
  });

  // ========== LAYER 2: System-Proposed Contexts ==========
  const systemContexts = {};
  let totalFiles = 0;

  uploads.forEach(upload => {
    const coverage = upload.results?.contextCoverage;
    if (!coverage?.summary?.dominantContexts?.length) return;

    totalFiles += upload.files?.length || 0;

    // Aggregate all system-detected contexts
    coverage.summary.dominantContexts.forEach(ctx => {
      if (!systemContexts[ctx.label]) {
        systemContexts[ctx.label] = { total: 0, count: 0 };
      }
      systemContexts[ctx.label].total += ctx.percent;
      systemContexts[ctx.label].count++;
    });

    // Include visual-derived contexts in system contexts
    const visual = upload.results?.visualUnderstanding;
    if (visual?.categories) {
      const visualMapping = {
        'Photo': 'Photography',
        'Product': 'Products',
        'Screenshot': 'UI/Screenshots',
        'Document': 'Documents',
        'Chart': 'Analytics',
        'Logo': 'Branding',
      };
      Object.keys(visual.categories).forEach(cat => {
        const mappedLabel = visualMapping[cat] || cat;
        if (!systemContexts[mappedLabel]) {
          systemContexts[mappedLabel] = { total: 0, count: 0 };
        }
        systemContexts[mappedLabel].total += 15; // Visual contributes ~15% weight
        systemContexts[mappedLabel].count++;
      });
    }
  });

  // Convert to sorted array and normalize to 100%
  let normalizedContexts = Object.entries(systemContexts)
    .map(([label, data]) => ({
      label,
      rawPercent: data.total / data.count
    }))
    .sort((a, b) => b.rawPercent - a.rawPercent)
    .slice(0, 5);

  // Normalize top 5 to 100%
  const rawTotal = normalizedContexts.reduce((sum, ctx) => sum + ctx.rawPercent, 0);
  if (rawTotal > 0) {
    normalizedContexts = normalizedContexts.map(ctx => ({
      label: ctx.label,
      percent: Math.round((ctx.rawPercent / rawTotal) * 100)
    }));

    // Add "Other" if we had more than 5 contexts
    const normalizedTotal = normalizedContexts.reduce((sum, ctx) => sum + ctx.percent, 0);
    if (normalizedTotal < 100 && Object.keys(systemContexts).length > 5) {
      normalizedContexts.push({ label: 'Other', percent: 100 - normalizedTotal });
    }
  }

  // ========== LAYER 3: Per-File Context Indicators ==========
  const filesWithContext = [];
  uploads.forEach(upload => {
    const coverage = upload.results?.contextCoverage;
    const fileContexts = coverage?.files || {};
    const perFile = coverage?.perFile || {};

    upload.files?.forEach(file => {
      const fileCtx = fileContexts[file.id] || coverage?.summary?.dominantContexts?.slice(0, 3);
      const fileInfo = perFile[file.id] || {};
      if (fileCtx && fileCtx.length > 0) {
        filesWithContext.push({
          id: file.id,
          name: file.name,
          contexts: Array.isArray(fileCtx) ? fileCtx.slice(0, 3) : [],
          modality: fileInfo.modality,
          signalCoverage: fileInfo.signalCoverage
        });
      }
    });
  });

  // Don't render if no data
  if (normalizedContexts.length === 0 && !userContext) return null;

  return (
    <div className="mb-6 p-5 bg-white rounded-xl border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-slate" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <h3 className="font-semibold text-gray-900">Context Summary</h3>
          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Estimated</span>
        </div>
        {/* How to read this - help link */}
        <div className="group relative">
          <button className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>How to read this</span>
          </button>
          <div className="absolute right-0 top-6 w-72 p-4 bg-gray-900 text-white text-xs rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
            <p className="font-semibold mb-2">How to read context results:</p>
            <ul className="space-y-1.5 text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-gray-500 mt-0.5">•</span>
                <span>Percentages are relative, not scores</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-500 mt-0.5">•</span>
                <span>Values compare themes within the same scope</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-500 mt-0.5">•</span>
                <span>Per-file themes do not override dataset-level results</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-500 mt-0.5">•</span>
                <span>No compliance or quality validation is performed</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* ========== LAYER 1: Intent Alignment ========== */}
      {userContext && (
        <div className="mb-5 p-4 bg-blue-50 rounded-lg border border-blue-100" data-tour="user-context">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-sm font-semibold text-blue-900">Intent Alignment</h4>
            <div className="group relative">
              <svg className="w-4 h-4 text-blue-400 cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="absolute right-0 top-6 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                This is a dataset-level score, not per-file. It compares your stated context against patterns detected across all files combined.
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-blue-800">"{userContext}"</span>
          </div>
          <div className="mt-3 flex items-center gap-3">
            <div className="flex-1 h-3 bg-blue-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all"
                style={{ width: `${userContextCoverage || 72}%` }}
              />
            </div>
            <span className="text-lg font-bold text-blue-700">{userContextCoverage || 72}%</span>
          </div>
          <p className="mt-3 text-xs text-blue-600 leading-relaxed">
            This score shows how closely your dataset matches the context you described, based on combined signals from all {totalFiles} file{totalFiles !== 1 ? 's' : ''}.
          </p>
        </div>
      )}

      {/* ========== LAYER 2: Dominant Themes Across Your Dataset ========== */}
      {normalizedContexts.length > 0 && (
        <div className="mb-5" data-tour="system-contexts">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-sm font-semibold text-gray-700">Dominant Themes Across Your Dataset</h4>
            <div className="group relative">
              <svg className="w-4 h-4 text-gray-400 cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="absolute right-0 top-6 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                These are relative comparisons, not quality or validation scores. A higher percentage means a theme appears more frequently compared to others.
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-500 mb-3">These percentages show how strongly different themes appear relative to each other across all files</p>
          <div className="space-y-2.5">
            {normalizedContexts.map((ctx, i) => (
              <div key={`${ctx.label}-${i}`} className="flex items-center gap-3">
                <span className="text-xs font-medium text-gray-600 w-24 truncate">{ctx.label}</span>
                <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      i === 0 ? 'bg-slate' :
                      i === 1 ? 'bg-slate/75' :
                      i === 2 ? 'bg-slate/55' :
                      i === 3 ? 'bg-slate/40' :
                      'bg-slate/25'
                    }`}
                    style={{ width: `${ctx.percent}%` }}
                  />
                </div>
                <span className="text-xs font-semibold text-gray-700 w-10 text-right">{ctx.percent}%</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[11px] text-gray-400 italic">
            These are not validation or quality scores — they show theme dominance relative to each other
          </p>
        </div>
      )}

      {/* ========== SIGNAL COVERAGE INDICATOR ========== */}
      {(() => {
        // Aggregate modality and signal info from uploads
        const modalityCounts = {};
        const signalCounts = { text: 0, ocr: 0, filename: 0, metadata: 0, visualLabels: 0 };
        let filesWithCoverageInfo = 0;
        let totalWeightedConfidence = 0;
        const allSuggestions = [];

        uploads.forEach(upload => {
          const coverage = upload.results?.contextCoverage;
          if (!coverage?.perFile) return;

          Object.values(coverage.perFile).forEach(fileInfo => {
            filesWithCoverageInfo++;

            // Count modalities
            const modality = fileInfo.modality || 'unknown';
            modalityCounts[modality] = (modalityCounts[modality] || 0) + 1;

            // Aggregate weighted confidence (Optional A/B)
            if (fileInfo.signalCoverage?.weightedConfidence !== undefined) {
              totalWeightedConfidence += fileInfo.signalCoverage.weightedConfidence;
            }

            // Collect suggestions (Optional C)
            if (fileInfo.signalCoverage?.suggestions?.length > 0) {
              fileInfo.signalCoverage.suggestions.forEach(s => {
                if (!allSuggestions.some(existing => existing.message === s.message)) {
                  allSuggestions.push(s);
                }
              });
            }

            // Count signals used
            if (fileInfo.signalsUsed) {
              Object.entries(fileInfo.signalsUsed).forEach(([signal, used]) => {
                if (used && signalCounts[signal] !== undefined) {
                  signalCounts[signal]++;
                }
              });
            }
          });
        });

        // Don't show if no modality data
        if (filesWithCoverageInfo === 0) return null;

        // Calculate aggregate confidence level (Optional B)
        const avgWeightedConfidence = filesWithCoverageInfo > 0
          ? Math.round(totalWeightedConfidence / filesWithCoverageInfo)
          : 0;

        const confidenceInfo = avgWeightedConfidence >= 70
          ? { level: 'strong', label: 'Strong', color: 'green', bgColor: 'bg-green-50', borderColor: 'border-green-200', textColor: 'text-green-700' }
          : avgWeightedConfidence >= 40
          ? { level: 'moderate', label: 'Moderate', color: 'yellow', bgColor: 'bg-amber-50', borderColor: 'border-amber-200', textColor: 'text-amber-700' }
          : { level: 'indicative', label: 'Indicative', color: 'gray', bgColor: 'bg-slate-50', borderColor: 'border-slate-200', textColor: 'text-slate-600' };

        // Sort suggestions by priority
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        allSuggestions.sort((a, b) => (priorityOrder[a.priority] || 2) - (priorityOrder[b.priority] || 2));

        // Signal icons and labels
        const signalInfo = {
          text: { icon: '📄', label: 'Text content' },
          ocr: { icon: '🔍', label: 'OCR text' },
          filename: { icon: '📁', label: 'Filename' },
          metadata: { icon: '🎬', label: 'Metadata' },
          visualLabels: { icon: '👁️', label: 'Visual analysis' }
        };

        // Modality display names
        const modalityNames = {
          text: 'Text',
          document: 'Documents',
          image: 'Images',
          video: 'Videos',
          audio: 'Audio',
          structured: 'Structured Data',
          unknown: 'Other'
        };

        const usedSignals = Object.entries(signalCounts)
          .filter(([_, count]) => count > 0)
          .sort((a, b) => b[1] - a[1]);

        const modalityList = Object.entries(modalityCounts)
          .sort((a, b) => b[1] - a[1]);

        return (
          <div className={`mb-5 p-3 ${confidenceInfo.bgColor} rounded-lg border ${confidenceInfo.borderColor}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <h4 className="text-sm font-medium text-slate-700">How We Analyzed This</h4>
              </div>
              {/* Analysis Mode Badge */}
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200">
                <span className="text-xs font-medium text-slate-600">
                  Local Analysis
                </span>
              </div>
            </div>

            {/* Explanation text */}
            <div className="text-xs text-slate-600 mb-3">
              <p className="mb-2">These insights were inferred by analyzing:</p>
              <ul className="space-y-0.5 ml-3">
                <li className="flex items-center gap-1.5">
                  <span className="w-1 h-1 bg-slate-400 rounded-full"></span>
                  File names
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1 h-1 bg-slate-400 rounded-full"></span>
                  Text content
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1 h-1 bg-slate-400 rounded-full"></span>
                  OCR-extracted text
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1 h-1 bg-slate-400 rounded-full"></span>
                  Basic file metadata
                </li>
              </ul>
              <p className="mt-2 text-slate-500 italic">No manual labels, training data, or external knowledge bases were used.</p>
            </div>

            {/* Modality breakdown */}
            <div className="flex flex-wrap gap-1.5 mb-2">
              {modalityList.map(([modality, count]) => (
                <span
                  key={modality}
                  className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 bg-white border border-slate-200 rounded-full text-slate-600"
                >
                  {modalityNames[modality] || modality}
                  <span className="font-semibold text-slate-500">{count}</span>
                </span>
              ))}
            </div>

            {/* Signal sources used */}
            <div className="flex flex-wrap gap-1.5">
              {usedSignals.map(([signal, count]) => (
                <span
                  key={signal}
                  className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 bg-green-50 border border-green-100 rounded text-green-700"
                  title={`${signalInfo[signal]?.label}: ${count} file${count !== 1 ? 's' : ''}`}
                >
                  <span>{signalInfo[signal]?.icon}</span>
                  <span>{signalInfo[signal]?.label}</span>
                  <span className="font-semibold">({count})</span>
                </span>
              ))}
            </div>

            {/* Reassurance note */}
            <p className="mt-2 text-[10px] text-slate-500 leading-relaxed italic">
              Context inferred from {usedSignals.length > 0 ? usedSignals.map(([s]) => signalInfo[s]?.label.toLowerCase()).join(', ') : 'available signals'}.
              {modalityCounts.video > 0 && ' Video files contribute structural and metadata signals.'}
              {modalityCounts.audio > 0 && ' Audio files contribute metadata signals.'}
              {modalityCounts.image > 0 && !signalCounts.ocr && ' Images analyzed without OCR.'}
            </p>

            {/* Context Suggestions (Optional C) */}
            {allSuggestions.length > 0 && (
              <div className="mt-3 pt-2 border-t border-slate-200">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <svg className="w-3 h-3 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-[10px] font-medium text-slate-600">Suggestions</span>
                </div>
                <div className="space-y-1">
                  {allSuggestions.slice(0, 2).map((suggestion, idx) => (
                    <div
                      key={idx}
                      className={`text-[10px] px-2 py-1 rounded ${
                        suggestion.priority === 'high' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                        suggestion.priority === 'medium' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                        'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      {suggestion.message}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* ========== LAYER 3: Per-File Breakdown ========== */}
      {filesWithContext.length > 0 && (
        <div className="pt-4 border-t border-gray-100" data-tour="file-contexts">
          <div className="mb-1">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-gray-700">Per-File Breakdown</h4>
              <span className="text-xs text-gray-400">{filesWithContext.length} files analyzed</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">How each individual file contributes to the overall context</p>
          </div>
          {/* Explanation for per-file values */}
          <div className="mt-2 p-2 bg-amber-50 border border-amber-100 rounded-lg">
            <p className="text-[11px] text-amber-700">
              These values show how strongly different themes appear within each file. They do not represent validation, correctness, or compliance decisions.
            </p>
          </div>
          <div className="space-y-2 max-h-40 overflow-y-auto mt-3">
            {filesWithContext.slice(0, 8).map((file) => {
              // Modality icons and descriptions
              const modalityInfo = {
                text: { icon: '📄', label: 'Text', signalHint: 'text content' },
                document: { icon: '📑', label: 'Document', signalHint: 'text & structure' },
                image: { icon: '🖼️', label: 'Image', signalHint: 'visual signals' },
                video: { icon: '🎬', label: 'Video', signalHint: 'metadata & structure' },
                audio: { icon: '🎵', label: 'Audio', signalHint: 'metadata' },
                structured: { icon: '📊', label: 'Structured', signalHint: 'data structure' },
                unknown: { icon: '📎', label: 'File', signalHint: 'filename' }
              };
              const modInfo = modalityInfo[file.modality] || modalityInfo.unknown;

              // Get confidence level for this file
              const fileConfidence = file.signalCoverage?.weightedConfidence || 0;
              const fileConfidenceLevel = fileConfidence >= 70 ? 'strong' : fileConfidence >= 40 ? 'moderate' : 'indicative';
              const confidenceDotColor = fileConfidenceLevel === 'strong' ? 'bg-green-500' :
                fileConfidenceLevel === 'moderate' ? 'bg-amber-500' : 'bg-slate-400';

              // Show signal contribution for video/audio/image modalities (instead of contexts)
              const isMediaModality = ['video', 'audio', 'image'].includes(file.modality);

              return (
                <div key={file.id} className="flex items-center gap-2 py-1.5 px-2 bg-gray-50 rounded-lg">
                  {/* Confidence dot + Modality icon */}
                  <div className="flex items-center gap-1">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${confidenceDotColor}`}
                      title={`Signal strength: ${fileConfidenceLevel}`}
                    ></span>
                    <span className="text-xs" title={file.signalCoverage?.description || modInfo.label}>
                      {modInfo.icon}
                    </span>
                  </div>
                  <span className="text-xs text-gray-700 truncate flex-1 max-w-[140px]" title={file.name}>
                    {file.name}
                  </span>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {/* For media files: show signal contribution hint */}
                    {isMediaModality && file.contexts.length === 0 ? (
                      <span className="text-[10px] px-1.5 py-0.5 bg-indigo-50 border border-indigo-100 rounded text-indigo-600 italic">
                        contributes {modInfo.signalHint}
                      </span>
                    ) : (
                      /* For all files with contexts: show context chips with clearer labels */
                      file.contexts.slice(0, 3).map((ctx, i) => (
                        <span
                          key={i}
                          className="text-[10px] px-1.5 py-0.5 bg-white border border-gray-200 rounded text-gray-600"
                          title={i === 0 ? 'Primary theme detected in this file' : 'Secondary theme detected in this file'}
                        >
                          {i === 0 ? 'Primary: ' : ''}{ctx.label} ({ctx.percent}%)
                        </span>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
            {filesWithContext.length > 8 && (
              <p className="text-xs text-gray-400 text-center py-1">
                +{filesWithContext.length - 8} more files...
              </p>
            )}
          </div>
          <p className="mt-3 text-[11px] text-gray-400 italic">
            A file showing 100% indicates a strong signal for that theme within the file itself — it does not override other files
          </p>
        </div>
      )}

      {/* ========== How This Analysis Was Created (Collapsible) ========== */}
      <details className="mt-4 pt-3 border-t border-gray-100 group">
        <summary className="flex items-center gap-2 cursor-pointer text-xs text-gray-500 hover:text-gray-700 transition-colors list-none">
          <svg className="w-4 h-4 transform group-open:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="font-medium">How this analysis was created</span>
        </summary>
        <div className="mt-3 p-3 bg-gray-50 rounded-lg text-xs text-gray-600 leading-relaxed">
          <p className="mb-2">This context summary was generated using:</p>
          <ul className="space-y-1 ml-4">
            <li className="flex items-center gap-2">
              <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
              File names
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
              Text content
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
              OCR-extracted text
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
              Basic metadata
            </li>
          </ul>
          <p className="mt-3 text-gray-500 italic">
            No manual labels, training data, or external knowledge bases were applied.
          </p>
        </div>
      </details>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
        <div className="group relative flex items-center gap-2 text-xs text-gray-400">
          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
          <span className="cursor-help border-b border-dotted border-gray-300">Analysis Mode: Local (No AI Cost)</span>
          <div className="absolute left-0 bottom-6 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
            <p>This analysis was performed locally using lightweight rules and pattern matching. No paid AI models were used, and no data was sent externally.</p>
          </div>
        </div>
        <span className="text-xs text-gray-400 italic">
          {totalFiles} file{totalFiles !== 1 ? 's' : ''} • {uploads.length} upload{uploads.length !== 1 ? 's' : ''}
        </span>
      </div>
    </div>
  );
}

/**
 * Main DataIngestionHub component
 */
function DataIngestionHub({ onNavigateToConnectors, showLocalSelector = false }) {
  const { authFetch } = useAuth();
  const [connectors, setConnectors] = useState([]);
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);

  // Storage capacity state (1GB = 1073741824 bytes)
  const [storageUsed, setStorageUsed] = useState(0);
  const STORAGE_LIMIT = 1024 * 1024 * 1024; // 1GB in bytes

  // Guided flow states
  const [selectedType, setSelectedType] = useState(() =>
    showLocalSelector ? INGESTION_TYPES.find(t => t.id === 'local') : null
  );
  const [showGuidedOverlay, setShowGuidedOverlay] = useState(false);
  const [showConnectorSelector, setShowConnectorSelector] = useState(showLocalSelector);
  const [selectedConnector, setSelectedConnector] = useState(null);

  // OneDrive wizard state
  const [showOneDriveWizard, setShowOneDriveWizard] = useState(false);

  // OneDrive scope wizard state (for completing setup on existing pending_scope connectors)
  const [scopeWizardConnector, setScopeWizardConnector] = useState(null);

  // Cloud storage wizard states
  const [showGoogleDriveWizard, setShowGoogleDriveWizard] = useState(false);
  const [showDropboxWizard, setShowDropboxWizard] = useState(false);
  const [showSharePointWizard, setShowSharePointWizard] = useState(false);

  // Database wizard states
  const [showMySQLWizard, setShowMySQLWizard] = useState(false);
  const [mySQLCallbackConnector, setMySQLCallbackConnector] = useState(null);
  const [showPostgreSQLWizard, setShowPostgreSQLWizard] = useState(false);
  const [postgreSQLCallbackConnector, setPostgreSQLCallbackConnector] = useState(null);
  const [showSQLServerWizard, setShowSQLServerWizard] = useState(false);
  const [sqlServerCallbackConnector, setSQLServerCallbackConnector] = useState(null);

  // Server/Data Lake wizard states
  const [showS3Wizard, setShowS3Wizard] = useState(false);
  const [s3CallbackConnector, setS3CallbackConnector] = useState(null);
  const [showAzureBlobWizard, setShowAzureBlobWizard] = useState(false);
  const [azureBlobCallbackConnector, setAzureBlobCallbackConnector] = useState(null);
  const [showDatabricksWizard, setShowDatabricksWizard] = useState(false);
  const [databricksCallbackConnector, setDatabricksCallbackConnector] = useState(null);

  // Local Folder wizard state (File System Access API)
  const [showLocalFolderWizard, setShowLocalFolderWizard] = useState(false);

  // File Upload modal state
  const [showFileUploadModal, setShowFileUploadModal] = useState(false);

  // Local file wizard states
  const [showLocalWizard, setShowLocalWizard] = useState(false);
  const [localWizardData, setLocalWizardData] = useState({
    type: '',
    displayName: '',
    rootPath: '',
    includePatterns: '**/*',
    excludePatterns: '',
  });
  const [localWizardStep, setLocalWizardStep] = useState(1);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  // Google Drive OAuth callback state
  const [googleDriveCallbackConnector, setGoogleDriveCallbackConnector] = useState(null);

  // Dropbox OAuth callback state
  const [dropboxCallbackConnector, setDropboxCallbackConnector] = useState(null);

  // Handle Google Drive and Dropbox OAuth callbacks (detect URL params)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);

    // Google Drive callback
    const googleDriveConnected = urlParams.get('googledrive_connected');
    const googleDriveError = urlParams.get('googledrive_error');

    // Dropbox callback
    const dropboxConnected = urlParams.get('dropbox_connected');
    const dropboxError = urlParams.get('dropbox_error');

    const connectorId = urlParams.get('connector_id');
    const email = urlParams.get('email');

    if (googleDriveError) {
      console.error('Google Drive OAuth error:', googleDriveError);
      window.history.replaceState({}, document.title, window.location.pathname);
      return;
    }

    if (dropboxError) {
      console.error('Dropbox OAuth error:', dropboxError);
      window.history.replaceState({}, document.title, window.location.pathname);
      return;
    }

    if (googleDriveConnected === 'true' && connectorId) {
      setGoogleDriveCallbackConnector({
        id: connectorId,
        email: email ? decodeURIComponent(email) : null,
      });
      setShowGoogleDriveWizard(true);
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    if (dropboxConnected === 'true' && connectorId) {
      setDropboxCallbackConnector({
        id: connectorId,
        email: email ? decodeURIComponent(email) : null,
      });
      setShowDropboxWizard(true);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Fetch connectors
  const fetchConnectors = useCallback(async () => {
    try {
      const response = await authFetch('/connectors');
      if (response.ok) {
        const data = await response.json();
        setConnectors(data);
      }
    } catch (error) {
      console.error('Failed to fetch connectors:', error);
    } finally {
      setLoading(false);
    }
  }, [authFetch]);

  useEffect(() => {
    fetchConnectors();
  }, [fetchConnectors]);

  // Fetch storage usage
  const fetchStorageUsage = useCallback(async () => {
    try {
      const response = await authFetch('/usage');
      if (response.ok) {
        const data = await response.json();
        // Use storage_bytes if available, otherwise calculate from quota
        setStorageUsed(data.storage_bytes || data.quota?.gb_scanned_used * 1024 * 1024 * 1024 || 0);
      }
    } catch (error) {
      console.error('Failed to fetch storage usage:', error);
      // Default to 0 if endpoint doesn't exist yet
      setStorageUsed(0);
    }
  }, [authFetch]);

  // Fetch uploaded files
  const fetchUploads = useCallback(async () => {
    try {
      const response = await authFetch('/uploads');
      if (response.ok) {
        const data = await response.json();
        setUploads(data);
      }
    } catch (error) {
      console.error('Failed to fetch uploads:', error);
    }
  }, [authFetch]);

  // Fetch storage and uploads on mount
  useEffect(() => {
    fetchStorageUsage();
    fetchUploads();
  }, [fetchStorageUsage, fetchUploads]);

  const handleDeleteConnector = async (id) => {
    if (!window.confirm('Are you sure you want to delete this data source?')) return;
    try {
      const response = await authFetch(`/connectors/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setConnectors(connectors.filter((c) => c.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete connector:', error);
    }
  };

  // Handle card click - start guided flow
  const handleTypeSelect = (type) => {
    setSelectedType(type);
    if (type.status === 'coming_soon') {
      // Just show coming soon message
      return;
    }
    setShowGuidedOverlay(true);
  };

  // Handle guided flow completion
  const handleGuidedComplete = () => {
    setShowGuidedOverlay(false);
    setShowConnectorSelector(true);
  };

  // Handle connector option selection
  const handleConnectorSelect = (option) => {
    setSelectedConnector(option);
    setShowConnectorSelector(false);

    // Check if this is a planned connector - show its explainer guide
    if (option.status === CONNECTOR_STATUS.PLANNED) {
      // Show guided overlay with the specific connector's explainer
      setShowGuidedOverlay(true);
      return;
    }

    if (selectedType.id === 'local') {
      if (option.id === 'upload') {
        // Show file upload modal (no more redirect to old page)
        setShowFileUploadModal(true);
      } else if (option.id === 'local_folder') {
        // Show new Local Folder wizard with File System Access API
        setShowLocalFolderWizard(true);
      } else {
        // Show legacy local wizard for other types
        setLocalWizardData((prev) => ({ ...prev, type: option.id }));
        setShowLocalWizard(true);
      }
    } else if (selectedType.id === 'cloud') {
      // Cloud storage wizards
      if (option.id === 'onedrive') {
        setShowOneDriveWizard(true);
      } else if (option.id === 'google_drive') {
        setShowGoogleDriveWizard(true);
      } else if (option.id === 'dropbox') {
        setShowDropboxWizard(true);
      } else if (option.id === 'sharepoint') {
        setShowSharePointWizard(true);
      }
    } else if (selectedType.id === 'database') {
      // Database wizards
      if (option.id === 'postgresql') {
        setShowPostgreSQLWizard(true);
      } else if (option.id === 'mysql') {
        setShowMySQLWizard(true);
      } else if (option.id === 'mssql') {
        setShowSQLServerWizard(true);
      }
    } else if (selectedType.id === 'server') {
      // Server/Data Lake wizards
      if (option.id === 's3') {
        setShowS3Wizard(true);
      } else if (option.id === 'azure_blob') {
        setAzureBlobCallbackConnector(null);
        setShowAzureBlobWizard(true);
      } else if (option.id === 'databricks') {
        setShowDatabricksWizard(true);
      }
    }
  };

  // Handle local wizard test
  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      // Combine base path with folder name if they look like they should be combined
      // e.g., name="test_files", path="/Users/foo" => "/Users/foo/test_files"
      let fullPath = localWizardData.rootPath;
      const folderName = localWizardData.displayName;
      if (folderName && !fullPath.endsWith(folderName) && /^[\w\-_.]+$/.test(folderName)) {
        fullPath = fullPath.replace(/\/$/, '') + '/' + folderName;
      }

      // Test connection without creating connector first
      const response = await authFetch('/connectors/test', {
        method: 'POST',
        body: JSON.stringify({
          type: localWizardData.type,
          config: {
            path: fullPath,
            patterns: localWizardData.includePatterns,
            recursive: true,
          },
        }),
      });

      if (response.ok) {
        const testData = await response.json();
        setTestResult(testData);
      } else {
        const error = await response.json();
        setTestResult({ success: false, message: error.message || 'Failed to test connection' });
      }
    } catch (error) {
      setTestResult({ success: false, message: error.message });
    } finally {
      setTesting(false);
    }
  };

  // Handle local wizard save - create the connector after successful test
  const handleSaveConnector = async () => {
    try {
      // Combine base path with folder name if they look like they should be combined
      let fullPath = localWizardData.rootPath;
      const folderName = localWizardData.displayName;
      if (folderName && !fullPath.endsWith(folderName) && /^[\w\-_.]+$/.test(folderName)) {
        fullPath = fullPath.replace(/\/$/, '') + '/' + folderName;
      }

      // Create the connector now that test passed
      const response = await authFetch('/connectors', {
        method: 'POST',
        body: JSON.stringify({
          type: localWizardData.type,
          displayName: localWizardData.displayName || `Local Folder - ${fullPath.split('/').pop()}`,
          scope: {
            rootPath: fullPath,
            includePatterns: localWizardData.includePatterns.split(',').map((p) => p.trim()).filter(Boolean),
            excludePatterns: localWizardData.excludePatterns.split(',').map((p) => p.trim()).filter(Boolean),
          },
        }),
      });

      if (response.ok) {
        await fetchConnectors();
        resetLocalWizard();
      } else {
        const error = await response.json();
        setTestResult({ success: false, message: error.error || 'Failed to save connector' });
      }
    } catch (error) {
      setTestResult({ success: false, message: error.message });
    }
  };

  // Go back to connector selector from local wizard
  const backToConnectorSelector = () => {
    setShowLocalWizard(false);
    setLocalWizardStep(1);
    setLocalWizardData({
      type: '',
      displayName: '',
      rootPath: '',
      includePatterns: '**/*',
      excludePatterns: '',
    });
    setTestResult(null);
    // Keep selectedType and show connector selector
    setShowConnectorSelector(true);
  };

  const resetLocalWizard = () => {
    setShowLocalWizard(false);
    setLocalWizardStep(1);
    setLocalWizardData({
      type: '',
      displayName: '',
      rootPath: '',
      includePatterns: '**/*',
      excludePatterns: '',
    });
    setTestResult(null);
    setSelectedType(null);
    setSelectedConnector(null);
  };

  const resetAll = () => {
    setSelectedType(null);
    setShowGuidedOverlay(false);
    setShowConnectorSelector(false);
    setSelectedConnector(null);
    // Cloud storage wizards
    setShowOneDriveWizard(false);
    setShowGoogleDriveWizard(false);
    setShowDropboxWizard(false);
    setShowSharePointWizard(false);
    // Database wizards
    setShowMySQLWizard(false);
    setShowPostgreSQLWizard(false);
    // Server/Data Lake wizards
    setShowS3Wizard(false);
    setShowAzureBlobWizard(false);
    setShowDatabricksWizard(false);
    // Other modals
    setShowFileUploadModal(false);
    resetLocalWizard();
  };

  // Go back to connector selector from file upload modal
  const backToConnectorSelectorFromUpload = () => {
    setShowFileUploadModal(false);
    setShowConnectorSelector(true);
  };

  // Handle OneDrive wizard completion
  const handleOneDriveComplete = (connector) => {
    setShowOneDriveWizard(false);
    resetAll();
    fetchConnectors();
  };

  // Helper to parse scope_config (can be string or object)
  const parseScopeConfig = (scopeConfig) => {
    if (!scopeConfig) return {};
    if (typeof scopeConfig === 'string') {
      try {
        return JSON.parse(scopeConfig);
      } catch (e) {
        console.error('Failed to parse scope_config:', e);
        return {};
      }
    }
    return scopeConfig;
  };

  // Handle "Complete Setup" for pending_scope connectors
  const handleCompleteSetup = (connector) => {
    const type = connector.enterprise_type || connector.type;
    const scopeConfig = parseScopeConfig(connector.scope_config);

    if (type === 'googledrive' || type === 'google_drive') {
      // Open Google Drive wizard with existing connector
      setGoogleDriveCallbackConnector({
        id: connector.id,
        email: connector.connectedEmail,
      });
      setShowGoogleDriveWizard(true);
    } else if (type === 'dropbox') {
      // Open Dropbox wizard with existing connector
      setDropboxCallbackConnector({
        id: connector.id,
        email: connector.connectedEmail,
      });
      setShowDropboxWizard(true);
    } else if (type === 'postgresql') {
      // Open PostgreSQL wizard with existing connector
      const callbackConnector = {
        id: connector.id,
        host: connector.host || connector.display_name?.split(' - ')[1],
        database: connector.database || connector.display_name?.split(' - ')[1],
      };
      setPostgreSQLCallbackConnector(callbackConnector);
      setShowPostgreSQLWizard(true);
    } else if (type === 'mysql') {
      // Open MySQL wizard with existing connector
      const callbackConnector = {
        id: connector.id,
        host: connector.host || connector.display_name?.split(' - ')[1],
        database: connector.database || connector.display_name?.split(' - ')[1],
      };
      setMySQLCallbackConnector(callbackConnector);
      setShowMySQLWizard(true);
    } else if (type === 'mssql') {
      // Open SQL Server wizard with existing connector
      const callbackConnector = {
        id: connector.id,
        host: connector.host || connector.display_name?.split(' - ')[1],
        database: connector.database || connector.display_name?.split(' - ')[1],
      };
      setSQLServerCallbackConnector(callbackConnector);
      setShowSQLServerWizard(true);
    } else if (type === 's3' || type === 'aws_s3') {
      // Open S3 wizard with existing connector
      const callbackConnector = {
        id: connector.id,
        region: connector.region || 'us-east-1',
        buckets: scopeConfig.buckets || [],
      };
      setS3CallbackConnector(callbackConnector);
      setShowS3Wizard(true);
    } else if (type === 'azureblob' || type === 'azure_blob') {
      // Open Azure Blob wizard with existing connector
      const callbackConnector = {
        id: connector.id,
        containers: scopeConfig.containers || [],
      };
      setAzureBlobCallbackConnector(callbackConnector);
      setShowAzureBlobWizard(true);
    } else if (type === 'databricks') {
      // Open Databricks wizard with existing connector data
      const callbackConnector = {
        id: connector.id,
        catalogs: scopeConfig.catalogs || [],
        workspaceUrl: connector.display_name?.replace('Databricks - ', '') || '',
      };
      setDatabricksCallbackConnector(callbackConnector);
      setShowDatabricksWizard(true);
    } else {
      // OneDrive/SharePoint use the scope wizard
      setScopeWizardConnector(connector);
    }
  };

  // Handle scope wizard completion (for existing connectors)
  const handleScopeWizardComplete = (connector) => {
    setScopeWizardConnector(null);
    fetchConnectors();
  };

  // Handle scope wizard cancel
  const handleScopeWizardCancel = () => {
    setScopeWizardConnector(null);
  };

  // Handle Google Drive wizard completion
  const handleGoogleDriveComplete = (connector) => {
    setShowGoogleDriveWizard(false);
    resetAll();
    fetchConnectors();
  };

  // Handle Dropbox wizard completion
  const handleDropboxComplete = (connector) => {
    setShowDropboxWizard(false);
    resetAll();
    fetchConnectors();
  };

  // Handle SharePoint wizard completion
  const handleSharePointComplete = (connector) => {
    setShowSharePointWizard(false);
    resetAll();
    fetchConnectors();
  };

  // Handle MySQL wizard completion
  const handleMySQLComplete = (connector) => {
    setShowMySQLWizard(false);
    setMySQLCallbackConnector(null);
    resetAll();
    fetchConnectors();
  };

  // Handle PostgreSQL wizard completion
  const handlePostgreSQLComplete = (connector) => {
    setShowPostgreSQLWizard(false);
    setPostgreSQLCallbackConnector(null);
    resetAll();
    fetchConnectors();
  };

  // Handle SQL Server wizard completion
  const handleSQLServerComplete = (connector) => {
    setShowSQLServerWizard(false);
    setSQLServerCallbackConnector(null);
    resetAll();
    fetchConnectors();
  };

  // Handle S3 wizard completion
  const handleS3Complete = (connector) => {
    setShowS3Wizard(false);
    setS3CallbackConnector(null);
    resetAll();
    fetchConnectors();
  };

  // Handle Azure Blob wizard completion
  const handleAzureBlobComplete = (connector) => {
    setShowAzureBlobWizard(false);
    resetAll();
    fetchConnectors();
  };

  // Handle Databricks wizard completion
  const handleDatabricksComplete = (connector) => {
    setShowDatabricksWizard(false);
    setDatabricksCallbackConnector(null);
    resetAll();
    fetchConnectors();
  };

  // Handle File Upload completion - refresh storage and uploads
  const handleFileUploadComplete = () => {
    fetchStorageUsage();
    fetchUploads();
    resetAll();
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-64" />
          <div className="h-4 bg-gray-200 rounded w-96" />
          <div className="grid grid-cols-2 gap-6 mt-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-48 bg-gray-200 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header - matches dashboard PageHeader pattern */}
      <div className="bg-slate rounded-xl p-6 mb-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mr-4 text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Data Ingestion</h1>
              <p className="text-white/70 mt-1">
                Run ingestions using connected sources or upload files for this run
              </p>
            </div>
          </div>
          {/* Help / Tour button */}
          <TourTrigger tourId={TOUR_IDS.DATA_INGESTION}>
            <span className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-lg transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Take a Tour
            </span>
          </TourTrigger>
        </div>
      </div>

      {/* Capacity Gauge - Shows storage usage toward 1GB free tier limit */}
      <div data-tour="capacity-gauge">
        <CapacityGauge usedBytes={storageUsed} limitBytes={STORAGE_LIMIT} />
      </div>

      {/* Uploaded Files - Files uploaded via File Upload */}
      <UploadedFiles uploads={uploads} onRefresh={fetchUploads} authFetch={authFetch} />

      {/* Context Coverage Summary - Phase 3.2.4 */}
      <ContextCoverageSummary uploads={uploads} />

      {/* Existing Connectors */}
      <ExistingConnectors
        connectors={connectors}
        onDelete={handleDeleteConnector}
        onRefresh={fetchConnectors}
        authFetch={authFetch}
        onCompleteSetup={handleCompleteSetup}
      />

      {/* Ingestion Type Cards */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Start New Ingestion</h2>
          <Link
            to="/app/connectors"
            className="text-sm text-slate hover:text-slate-hover font-medium inline-flex items-center gap-1"
          >
            Manage Data Sources
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </Link>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Choose how you want to ingest data for this run. Upload files directly or use a configured data source.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6" data-tour="ingestion-cards">
        {INGESTION_TYPES.map((type) => (
          <IngestionCard
            key={type.id}
            type={type}
            onClick={handleTypeSelect}
            isDisabled={type.status === 'coming_soon'}
            dataTour={type.id === 'local' ? 'local-files' : type.id === 'cloud' ? 'cloud-storage' : type.id === 'database' ? 'databases' : 'servers'}
          />
        ))}
      </div>

      {/* Info Box - matches dashboard subtle info pattern */}
      <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-xl">
        <div className="flex items-start gap-3">
          <div className="text-slate flex-shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h4 className="font-medium text-gray-900">Your Data Stays Private</h4>
            <p className="text-sm text-gray-600 mt-1">
              All data processing happens locally. For cloud connectors, you control exactly what folders are accessed,
              and all operations are logged for your review.
            </p>
          </div>
        </div>
      </div>

      {/* Guided Ingestion Overlay - uses connector-specific steps when available */}
      {selectedType && (
        <GuidedIngestionOverlay
          isOpen={showGuidedOverlay}
          onClose={resetAll}
          onComplete={selectedConnector?.status === CONNECTOR_STATUS.PLANNED ? resetAll : handleGuidedComplete}
          title={selectedConnector ? selectedConnector.label : `Connect ${selectedType.title}`}
          subtitle={selectedConnector ? selectedConnector.description : selectedType.description}
          icon={selectedType.icon}
          steps={
            // Use connector-specific steps if available, otherwise fall back to type steps
            selectedConnector && GUIDED_STEPS[selectedConnector.id]
              ? GUIDED_STEPS[selectedConnector.id]
              : GUIDED_STEPS[selectedType.id] || []
          }
          persistKey={`ingestion-${selectedConnector?.id || selectedType.id}`}
        />
      )}

      {/* Connector Selector */}
      {showConnectorSelector && selectedType && (
        <ConnectorSelector
          type={selectedType}
          onSelect={handleConnectorSelect}
          onBack={resetAll}
        />
      )}

      {/* Local File Wizard Modal - matches dashboard modal pattern */}
      {showLocalWizard && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black/50" />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg border border-gray-200">
              <div className="border-b border-gray-100 px-6 py-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {selectedConnector?.label || 'Configure Data Source'}
                  </h2>
                  <button onClick={backToConnectorSelector} className="text-gray-400 hover:text-gray-600 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="flex gap-2 mt-4">
                  {[1, 2].map((step) => (
                    <div
                      key={step}
                      className={`h-1 flex-1 rounded-full ${step <= localWizardStep ? 'bg-slate' : 'bg-gray-200'}`}
                    />
                  ))}
                </div>
              </div>

              <div className="p-6">
                {localWizardStep === 1 && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {localWizardData.type === 'local_folder' ? 'Folder Name' : 'Display Name'}
                      </label>
                      <input
                        type="text"
                        value={localWizardData.displayName}
                        onChange={(e) => setLocalWizardData((prev) => ({ ...prev, displayName: e.target.value }))}
                        placeholder={localWizardData.type === 'local_folder' ? 'my_folder' : 'My Data Source'}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-slate/20 focus:border-slate transition-colors"
                      />
                      {localWizardData.type === 'local_folder' && (
                        <p className="text-xs text-gray-500 mt-1">This will be appended to the base path</p>
                      )}
                    </div>

                    {localWizardData.type === 'local_folder' && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Base Path</label>
                          <input
                            type="text"
                            value={localWizardData.rootPath}
                            onChange={(e) => setLocalWizardData((prev) => ({ ...prev, rootPath: e.target.value }))}
                            placeholder="/path/to/parent/folder"
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-slate/20 focus:border-slate font-mono text-sm transition-colors"
                          />
                          {/* Show preview of combined path */}
                          {localWizardData.rootPath && localWizardData.displayName && /^[\w\-_.]+$/.test(localWizardData.displayName) && !localWizardData.rootPath.endsWith(localWizardData.displayName) && (
                            <p className="text-xs text-slate mt-1">
                              Full path: <span className="font-mono">{localWizardData.rootPath.replace(/\/$/, '')}/{localWizardData.displayName}</span>
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Include Patterns</label>
                          <input
                            type="text"
                            value={localWizardData.includePatterns}
                            onChange={(e) => setLocalWizardData((prev) => ({ ...prev, includePatterns: e.target.value }))}
                            placeholder="**/*.pdf, **/*.docx"
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-slate/20 focus:border-slate font-mono text-sm transition-colors"
                          />
                          <p className="text-xs text-gray-500 mt-1">Comma-separated glob patterns</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Exclude Patterns</label>
                          <input
                            type="text"
                            value={localWizardData.excludePatterns}
                            onChange={(e) => setLocalWizardData((prev) => ({ ...prev, excludePatterns: e.target.value }))}
                            placeholder="**/node_modules/**, **/.git/**"
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-slate/20 focus:border-slate font-mono text-sm transition-colors"
                          />
                        </div>
                      </>
                    )}

                    <div className="flex justify-between pt-4">
                      <button
                        onClick={backToConnectorSelector}
                        className="px-4 py-2 text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => setLocalWizardStep(2)}
                        disabled={!localWizardData.displayName || (localWizardData.type === 'local_folder' && !localWizardData.rootPath)}
                        className="px-4 py-2 bg-slate text-white rounded-lg hover:bg-slate/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}

                {localWizardStep === 2 && (
                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                      <h4 className="font-medium text-gray-900 mb-2">Configuration Summary</h4>
                      <dl className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <dt className="text-gray-500">Type:</dt>
                          <dd className="text-gray-900 capitalize">{localWizardData.type.replace('_', ' ')}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-gray-500">Name:</dt>
                          <dd className="text-gray-900">{localWizardData.displayName}</dd>
                        </div>
                        {localWizardData.rootPath && (
                          <div className="flex justify-between">
                            <dt className="text-gray-500">Path:</dt>
                            <dd className="text-gray-900 font-mono text-xs">{localWizardData.rootPath}</dd>
                          </div>
                        )}
                      </dl>
                    </div>

                    {testResult && (
                      <div className={`p-4 rounded-lg border ${testResult.success ? 'bg-success-bg text-success border-success/20' : 'bg-error-bg text-error border-error/20'}`}>
                        <div className="flex items-center gap-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={testResult.success ? 'M5 13l4 4L19 7' : 'M6 18L18 6M6 6l12 12'} />
                          </svg>
                          <span className="font-medium">{testResult.success ? 'Connection successful' : 'Connection failed'}</span>
                        </div>
                        <p className="text-sm mt-1 opacity-80">{testResult.message}</p>
                        {testResult.stats && (
                          <p className="text-sm mt-1 opacity-80">Found {testResult.stats.itemCount} files ({testResult.stats.totalSizeMB} MB)</p>
                        )}
                      </div>
                    )}

                    <div className="flex justify-between pt-4">
                      <button onClick={() => setLocalWizardStep(1)} className="px-4 py-2 text-gray-500 hover:text-gray-700 transition-colors">
                        Back
                      </button>
                      <div className="flex gap-3">
                        <button
                          onClick={handleTestConnection}
                          disabled={testing}
                          className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
                        >
                          {testing ? 'Testing...' : 'Test Connection'}
                        </button>
                        <button
                          onClick={handleSaveConnector}
                          disabled={!testResult?.success}
                          className="px-4 py-2 bg-slate text-white rounded-lg hover:bg-slate/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* OneDrive Wizard - 4-phase flow */}
      {showOneDriveWizard && (
        <OneDriveWizard
          onComplete={handleOneDriveComplete}
          onCancel={() => {
            setShowOneDriveWizard(false);
            setShowConnectorSelector(true);
          }}
          authFetch={authFetch}
        />
      )}

      {/* OneDrive Scope Wizard - for completing setup on existing pending_scope connectors */}
      {scopeWizardConnector && (
        <OneDriveWizard
          existingConnectorId={scopeWizardConnector.id}
          onComplete={handleScopeWizardComplete}
          onCancel={handleScopeWizardCancel}
          authFetch={authFetch}
        />
      )}

      {/* Google Drive Wizard - 4-phase flow */}
      {showGoogleDriveWizard && (
        <GoogleDriveWizard
          onComplete={handleGoogleDriveComplete}
          onCancel={() => {
            setShowGoogleDriveWizard(false);
            setGoogleDriveCallbackConnector(null);
            setShowConnectorSelector(true);
          }}
          authFetch={authFetch}
          existingConnector={googleDriveCallbackConnector}
        />
      )}

      {/* Dropbox Wizard - 4-phase flow */}
      {showDropboxWizard && (
        <DropboxWizard
          onComplete={handleDropboxComplete}
          onCancel={() => {
            setShowDropboxWizard(false);
            setDropboxCallbackConnector(null);
            setShowConnectorSelector(true);
          }}
          authFetch={authFetch}
          existingConnector={dropboxCallbackConnector}
        />
      )}

      {/* SharePoint Wizard - 4-phase flow */}
      {showSharePointWizard && (
        <SharePointWizard
          onComplete={handleSharePointComplete}
          onCancel={() => {
            setShowSharePointWizard(false);
            setShowConnectorSelector(true);
          }}
          authFetch={authFetch}
        />
      )}

      {/* MySQL Wizard - 4-phase flow */}
      {showMySQLWizard && (
        <MySQLWizard
          existingConnector={mySQLCallbackConnector}
          onComplete={handleMySQLComplete}
          onCancel={() => {
            setShowMySQLWizard(false);
            setMySQLCallbackConnector(null);
            setShowConnectorSelector(true);
          }}
          authFetch={authFetch}
        />
      )}

      {/* PostgreSQL Wizard - 4-phase flow */}
      {showPostgreSQLWizard && (
        <PostgreSQLWizard
          existingConnector={postgreSQLCallbackConnector}
          onComplete={handlePostgreSQLComplete}
          onCancel={() => {
            setShowPostgreSQLWizard(false);
            setPostgreSQLCallbackConnector(null);
            setShowConnectorSelector(true);
          }}
          authFetch={authFetch}
        />
      )}

      {/* SQL Server Wizard - 4-phase flow */}
      {showSQLServerWizard && (
        <SQLServerWizard
          existingConnector={sqlServerCallbackConnector}
          onComplete={handleSQLServerComplete}
          onCancel={() => {
            setShowSQLServerWizard(false);
            setSQLServerCallbackConnector(null);
            setShowConnectorSelector(true);
          }}
          authFetch={authFetch}
        />
      )}

      {/* Amazon S3 Wizard - 4-phase flow */}
      {showS3Wizard && (
        <S3Wizard
          existingConnector={s3CallbackConnector}
          onComplete={handleS3Complete}
          onCancel={() => {
            setShowS3Wizard(false);
            setS3CallbackConnector(null);
            setShowConnectorSelector(true);
          }}
          authFetch={authFetch}
        />
      )}

      {/* Azure Blob Wizard - 4-phase flow */}
      {showAzureBlobWizard && (
        <AzureBlobWizard
          existingConnector={azureBlobCallbackConnector}
          onComplete={(connector) => {
            handleAzureBlobComplete(connector);
            setAzureBlobCallbackConnector(null);
          }}
          onCancel={() => {
            setShowAzureBlobWizard(false);
            setAzureBlobCallbackConnector(null);
            if (!azureBlobCallbackConnector) {
              setShowConnectorSelector(true);
            }
          }}
          authFetch={authFetch}
        />
      )}

      {/* Databricks Wizard - 4-phase flow */}
      {showDatabricksWizard && (
        <DatabricksWizard
          key={databricksCallbackConnector?.id || 'new'}
          existingConnector={databricksCallbackConnector}
          onComplete={handleDatabricksComplete}
          onCancel={() => {
            setShowDatabricksWizard(false);
            setDatabricksCallbackConnector(null);
            setShowConnectorSelector(true);
          }}
          authFetch={authFetch}
        />
      )}

      {/* Local Folder Wizard - File System Access API */}
      <LocalFolderWizard
        isOpen={showLocalFolderWizard}
        onClose={() => {
          setShowLocalFolderWizard(false);
          setShowConnectorSelector(true);
        }}
        onComplete={(result) => {
          console.log('Local folder ingestion complete:', result);
          setShowLocalFolderWizard(false);
          resetAll();
          fetchUploads();
        }}
      />

      {/* File Upload Modal */}
      <FileUploadModal
        isOpen={showFileUploadModal}
        onClose={backToConnectorSelectorFromUpload}
        onComplete={handleFileUploadComplete}
        onBack={backToConnectorSelectorFromUpload}
      />
    </div>
  );
}

export default DataIngestionHub;
export { INGESTION_TYPES, GUIDED_STEPS };
