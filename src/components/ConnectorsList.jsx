import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';

// Icons
const FolderIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
  </svg>
);

const UploadIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
  </svg>
);

const DatabaseIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
  </svg>
);

const CloudIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
  </svg>
);

const PlusIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const EditIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
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

// OneDrive icon
const OneDriveIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.5 6c2.3 0 4.3 1.6 4.9 3.8.1.4.2.8.2 1.2 0 .1 0 .3-.1.4 1.7.4 3 1.9 3 3.6 0 2.1-1.7 3.8-3.8 3.8H7.8c-2.1 0-3.8-1.7-3.8-3.8 0-1.8 1.2-3.3 2.9-3.7-.1-.2-.1-.5-.1-.7 0-2.5 2-4.6 4.5-4.6h1.2z"/>
  </svg>
);

// SharePoint icon
const SharePointIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
  </svg>
);

// Google Drive icon
const GoogleDriveIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M12 11L7.5 3h9l-4.5 8z"/>
    <path fill="#34A853" d="M7.5 3L3 11l4.5 8h9l-4.5-8-4.5 8"/>
    <path fill="#FBBC05" d="M3 11l4.5 8h9l-4.5-8H3z"/>
    <path fill="#EA4335" d="M16.5 3h-9l4.5 8 4.5-8z"/>
  </svg>
);

// Dropbox icon
const DropboxIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#0061FF">
    <path d="M6 2l6 3.75L6 9.5 0 5.75 6 2zm12 0l6 3.75-6 3.75-6-3.75L18 2zM0 13.25L6 9.5l6 3.75L6 17 0 13.25zm18-3.75l6 3.75L18 17l-6-3.75 6-3.75zM6 18.25l6-3.75 6 3.75L12 22l-6-3.75z"/>
  </svg>
);

// S3 icon
const S3Icon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path fill="#569A31" d="M12 2L2 7l10 5 10-5-10-5z"/>
    <path fill="#4B8F29" d="M2 17l10 5 10-5"/>
    <path fill="#569A31" d="M2 12l10 5 10-5"/>
  </svg>
);

// File icon
const FileIcon = () => (
  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

// Get icon for connector type
const getConnectorIcon = (type, enterpriseType) => {
  // Check enterprise type first
  if (enterpriseType === 'onedrive' || type === 'enterprise_onedrive') {
    return <OneDriveIcon />;
  }
  if (enterpriseType === 'sharepoint' || type === 'enterprise_sharepoint') {
    return <SharePointIcon />;
  }
  if (enterpriseType === 'googledrive' || enterpriseType === 'google_drive' || type === 'enterprise_googledrive') {
    return <GoogleDriveIcon />;
  }
  if (enterpriseType === 'dropbox' || type === 'enterprise_dropbox') {
    return <DropboxIcon />;
  }
  // S3 connector
  if (enterpriseType === 's3' || enterpriseType === 'aws_s3') {
    return <S3Icon />;
  }
  // Azure Blob connector
  if (enterpriseType === 'azureblob' || enterpriseType === 'azure_blob') {
    return (
      <svg className="w-5 h-5" viewBox="0 0 24 24">
        <path fill="#0089D6" d="M13.05 4.24l-5.52 15.52H4.48L10 4.24h3.05zm-1.93 5.38l4.89 10.14H22l-7.39-10.14h-3.49z"/>
      </svg>
    );
  }
  // Database connectors
  if (enterpriseType === 'postgresql' || enterpriseType === 'mysql' || enterpriseType === 'mssql') {
    return <DatabaseIcon />;
  }
  // Databricks connector
  if (enterpriseType === 'databricks') {
    return (
      <svg className="w-5 h-5" viewBox="0 0 24 24">
        <path fill="#FF3621" d="M12 2L3 7v10l9 5 9-5V7l-9-5zm0 2.18l6.63 3.68L12 11.54 5.37 7.86 12 4.18z"/>
        <path fill="#FF3621" d="M12 12.82l6.63-3.68v7.36L12 20.18l-6.63-3.68v-7.36l6.63 3.68z" opacity="0.6"/>
      </svg>
    );
  }

  switch (type) {
    case 'local_folder':
      return <FolderIcon />;
    case 'file_upload':
      return <UploadIcon />;
    case 'database':
      return <DatabaseIcon />;
    case 'cloud_storage':
      return <CloudIcon />;
    case 'enterprise':
      return <CloudIcon />;
    default:
      return <FolderIcon />;
  }
};

// Status badge component
// Maps backend connector.status to UI labels and colors
function StatusBadge({ status }) {
  const { t } = useTranslation();

  const statusConfig = {
    // Ready states (green)
    active: {
      color: 'bg-success-bg text-success border-success/20',
      label: t('connector.status.active', 'Active'),
    },
    connected: {
      color: 'bg-success-bg text-success border-success/20',
      label: t('connector.status.ready', 'Ready'),
    },
    scoped: {
      color: 'bg-success-bg text-success border-success/20',
      label: t('connector.status.ready', 'Ready'),
    },
    // Needs action states (amber)
    pending_scope: {
      color: 'bg-amber-50 text-amber-700 border-amber-200',
      label: t('connector.status.needsSetup', 'Needs Setup'),
    },
    pending: {
      color: 'bg-amber-50 text-amber-700 border-amber-200',
      label: t('connector.status.pending', 'Pending'),
    },
    // Error state (red)
    error: {
      color: 'bg-error-bg text-error border-error/20',
      label: t('connector.status.error', 'Error'),
    },
    // Syncing state (blue)
    syncing: {
      color: 'bg-info-bg text-info border-info/20',
      label: t('connector.status.syncing', 'Syncing'),
    },
    // Disconnected state (gray)
    disconnected: {
      color: 'bg-gray-100 text-gray-600 border-gray-200',
      label: t('connector.status.disconnected', 'Disconnected'),
    },
  };

  // Fall back to pending if status is unknown (never use "inactive" for setup states)
  const config = statusConfig[status] || statusConfig.pending;

  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full border ${config.color}`}>
      {status === 'syncing' && (
        <svg className="w-3 h-3 mr-1 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {status === 'pending_scope' && (
        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      )}
      {config.label}
    </span>
  );
}

// Expandable content preview for enterprise connectors
/**
 * Expandable content preview - shows ONLY selected/scoped folders/files
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

  // Recursive folder item for OneDrive and Google Drive
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
          const parentId = folder.id || 'root';
          res = await authFetch(`/connectors/googledrive/${connector.id}/items?parentId=${encodeURIComponent(parentId)}`);
        } else if (isDropbox) {
          const path = folder.path || '';
          res = await authFetch(`/connectors/dropbox/${connector.id}/items?path=${encodeURIComponent(path)}`);
        } else {
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
        <button onClick={loadFolderChildren} className="flex items-center gap-2 w-full text-left py-1 px-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800 text-sm">
          <ChevronIcon expanded={isItemExpanded} loading={isLoading} />
          <FolderIcon />
          <span className="text-text-primary dark:text-text-dark-primary truncate">{folder.name || folder.path || 'Root'}</span>
        </button>

        {isItemExpanded && children.length > 0 && (
          <div className="space-y-0.5">
            {children.map((item) => (
              item.type === 'folder' ? (
                <FolderItem key={item.id || item.name} folder={{ ...item, path: `${folder.path || ''}/${item.name}`.replace(/^\/+/, '/') }} depth={depth + 1} />
              ) : (
                <div key={item.id || item.name} style={{ marginLeft: '16px' }} className="flex items-center gap-2 py-0.5 px-2 text-sm text-text-secondary">
                  <div className="w-4" />
                  <FileIcon />
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
          res = await authFetch(`/connectors/sharepoint/${connector.id}/sites/${encodeURIComponent(item.id)}/libraries`);
          if (res.ok) {
            const data = await res.json();
            setItemContents(prev => ({ ...prev, [itemKey]: (data.libraries || []).map(lib => ({ ...lib, _type: 'library' })) }));
          }
        } else if (itemType === 'library') {
          res = await authFetch(`/connectors/sharepoint/${connector.id}/drives/${encodeURIComponent(item.id)}/items`);
          if (res.ok) {
            const data = await res.json();
            setItemContents(prev => ({ ...prev, [itemKey]: data.items || [] }));
          }
        } else if (itemType === 'folder') {
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
      if (itemType === 'site') return <CloudIcon />;
      if (itemType === 'library') return <DatabaseIcon />;
      if (itemType === 'folder') return <FolderIcon />;
      return <DatabaseIcon />;
    };

    if (itemType === 'file') {
      return (
        <div style={{ marginLeft: `${depth * 16}px` }} className="flex items-center gap-2 py-0.5 px-2 text-sm text-text-secondary">
          <div className="w-4" />
          {getIcon()}
          <span className="truncate flex-1">{item.name}</span>
          {item.size && <span className="text-xs text-gray-400">{formatSize(item.size)}</span>}
        </div>
      );
    }

    return (
      <div style={{ marginLeft: depth > 0 ? '16px' : '0' }}>
        <button onClick={loadChildren} className="flex items-center gap-2 w-full text-left py-1 px-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800 text-sm">
          <ChevronIcon expanded={isItemExpanded} loading={isLoading} />
          {getIcon()}
          <span className="text-text-primary dark:text-text-dark-primary truncate">{item.displayName || item.name}</span>
        </button>

        {isItemExpanded && children.length > 0 && (
          <div className="space-y-0.5">
            {children.map((child) => {
              const childType = child._type === 'library' ? 'library' : (child.type === 'folder' ? 'folder' : 'file');
              const newDriveId = childType === 'library' ? child.id : driveId;
              const newPath = itemType === 'folder' ? (parentPath ? `${parentPath}/${item.name}` : item.name) : '';
              return (
                <SharePointItem key={child.id} item={child} itemType={childType} depth={depth + 1} driveId={newDriveId} parentPath={newPath} />
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
    <div className="mt-3 pt-3 border-t border-light-border dark:border-dark-border">
      <button onClick={() => setIsExpanded(!isExpanded)} className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors">
        <ChevronIcon expanded={isExpanded} loading={false} />
        <span>{isExpanded ? 'Hide contents' : 'View contents'}</span>
      </button>

      {isExpanded && (
        <div className="mt-2 pl-4 border-l-2 border-gray-100 dark:border-gray-700 space-y-1 max-h-80 overflow-y-auto">
          {scopedItems.length === 0 && <p className="text-sm text-gray-400 py-2">No {isSharePoint ? 'sites' : isDatabase ? 'schemas' : isDatabricks ? 'catalogs' : isS3 ? 'buckets' : isAzureBlob ? 'containers' : 'folders'} configured</p>}

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

          {isGoogleDrive && scopedItems.map((folder, idx) => {
            // Handle both string IDs and folder objects
            const folderObj = typeof folder === 'string'
              ? { id: folder, name: 'Folder' }
              : { id: folder.id, name: folder.name || 'Folder' };
            return <FolderItem key={folderObj.id || idx} folder={folderObj} depth={0} />;
          })}

          {isDropbox && scopedItems.map((folder, idx) => {
            // Handle both string paths and folder objects
            const folderObj = typeof folder === 'string'
              ? { path: folder, name: folder.split('/').pop() || 'Folder' }
              : { path: folder.path, name: folder.name || 'Folder' };
            return <FolderItem key={folderObj.path || idx} folder={folderObj} depth={0} />;
          })}

          {isSharePoint && scopedItems.map((site, idx) => {
            // Handle both string IDs and site objects
            const siteObj = typeof site === 'string'
              ? { id: site, name: 'Site', displayName: 'SharePoint Site' }
              : { id: site.id, name: site.name || site.displayName || 'Site', displayName: site.displayName || site.name || 'SharePoint Site' };
            return <SharePointItem key={siteObj.id || idx} item={siteObj} itemType="site" depth={0} />;
          })}

          {isS3 && scopedItems.map((bucket, idx) => {
            // Handle both string bucket names and bucket objects
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
                    <button onClick={loadChildren} className="flex items-center gap-2 w-full text-left py-1 px-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800 text-sm">
                      <ChevronIcon expanded={isItemExpanded} loading={isItemLoading} />
                      <FolderIcon />
                      <span className="text-text-primary dark:text-text-dark-primary truncate">{item.name}</span>
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
                <div style={{ marginLeft: depth > 0 ? '16px' : '0' }} className="flex items-center gap-2 py-0.5 px-2 text-sm text-text-secondary">
                  <div className="w-4" />
                  <FileIcon />
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
                <button onClick={loadBucketContents} className="flex items-center gap-2 w-full text-left py-1 px-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800 text-sm">
                  <ChevronIcon expanded={isBucketExpanded} loading={isLoading} />
                  <S3Icon />
                  <span className="text-text-primary dark:text-text-dark-primary truncate">{bucketName}</span>
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
                    <button onClick={loadChildren} className="flex items-center gap-2 w-full text-left py-1 px-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800 text-sm">
                      <ChevronIcon expanded={isItemExpanded} loading={isItemLoading} />
                      <FolderIcon />
                      <span className="text-text-primary dark:text-text-dark-primary truncate">{item.name}</span>
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

              return (
                <div style={{ marginLeft: depth > 0 ? '16px' : '0' }} className="flex items-center gap-2 py-0.5 px-2 text-sm text-text-secondary">
                  <div className="w-4" />
                  <FileIcon />
                  <span className="truncate flex-1">{item.name}</span>
                  {item.size > 0 && <span className="text-xs text-gray-400">{formatSize(item.size)}</span>}
                </div>
              );
            };

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
                <button onClick={loadContainerContents} className="flex items-center gap-2 w-full text-left py-1 px-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800 text-sm">
                  <ChevronIcon expanded={isContainerExpanded} loading={isLoading} />
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#0089D6" d="M13.05 4.24l-5.52 15.52H4.48L10 4.24h3.05zm-1.93 5.38l4.89 10.14H22l-7.39-10.14h-3.49z"/>
                  </svg>
                  <span className="text-text-primary dark:text-text-dark-primary truncate">{containerName}</span>
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

          {isDatabase && scopedItems.map((schema, idx) => {
            // Handle both string schema names and schema objects
            const schemaName = typeof schema === 'string' ? schema : schema.name || schema;
            const schemaKey = `schema-${schemaName}-${idx}`;
            const isSchemaExpanded = expandedItems[schemaKey] === true;
            const isLoading = expandedItems[schemaKey] === 'loading';
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
                } else {
                  setExpandedItems(prev => ({ ...prev, [schemaKey]: false }));
                }
              } catch (err) {
                console.error('Failed to load tables:', err);
                setExpandedItems(prev => ({ ...prev, [schemaKey]: false }));
              }
            };

            return (
              <div key={schemaKey}>
                <button onClick={loadTables} className="flex items-center gap-2 w-full text-left py-1 px-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800 text-sm">
                  <ChevronIcon expanded={isSchemaExpanded} loading={isLoading} />
                  <DatabaseIcon />
                  <span className="text-text-primary dark:text-text-dark-primary truncate">{schemaName}</span>
                  {tables.length > 0 && <span className="text-xs text-gray-400">({tables.length} tables)</span>}
                </button>
                {isSchemaExpanded && tables.length > 0 && (
                  <div className="ml-4 space-y-0.5">
                    {tables.map((table, tIdx) => (
                      <div key={`${schemaKey}-table-${tIdx}`} className="flex items-center gap-2 py-0.5 px-2 text-sm text-text-secondary">
                        <div className="w-4" />
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        <span className="truncate flex-1">{table.name || table.table_name || table}</span>
                        {(table.rowCount != null || table.row_count != null) && <span className="text-xs text-gray-400">{(table.rowCount || table.row_count || 0).toLocaleString()} rows</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {isDatabricks && scopedItems.map((catalog, idx) => {
            // Handle both string catalog names and catalog objects
            const catalogName = typeof catalog === 'string' ? catalog : catalog.name || catalog;
            const catalogKey = `catalog-${catalogName}-${idx}`;
            const isCatalogExpanded = expandedItems[catalogKey] === true;
            const isLoading = expandedItems[catalogKey] === 'loading';
            const schemas = itemContents[catalogKey] || [];

            const catalogError = itemErrors[catalogKey];

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

            const isError = expandedItems[catalogKey] === 'error';

            return (
              <div key={catalogKey}>
                <button onClick={loadSchemas} className="flex items-center gap-2 w-full text-left py-1 px-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800 text-sm">
                  <ChevronIcon expanded={isCatalogExpanded || isError} loading={isLoading} />
                  <svg className="w-4 h-4 text-[#FF3621]" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M12 2L3 7v10l9 5 9-5V7l-9-5zm0 2.18l6.63 3.68L12 11.54 5.37 7.86 12 4.18z"/>
                  </svg>
                  <span className="text-text-primary dark:text-text-dark-primary truncate">{catalogName}</span>
                  {schemas.length > 0 && <span className="text-xs text-gray-400">({schemas.length} schemas)</span>}
                  {isError && <span className="text-xs text-red-500">Error</span>}
                </button>
                {isError && catalogError && (
                  <div className="ml-6 px-2 py-1.5 mt-1 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-xs text-red-600 dark:text-red-400">
                    {catalogError.includes('No running cluster') ? (
                      <span>No running cluster available. Start a cluster in your Databricks workspace to browse schemas.</span>
                    ) : (
                      <span>{catalogError}</span>
                    )}
                    <button onClick={loadSchemas} className="ml-2 underline hover:no-underline">Retry</button>
                  </div>
                )}
                {isCatalogExpanded && schemas.length > 0 && (
                  <div className="ml-4 space-y-0.5">
                    {schemas.map((schema, sIdx) => (
                      <div key={`${catalogKey}-schema-${sIdx}`} className="flex items-center gap-2 py-0.5 px-2 text-sm text-text-secondary">
                        <div className="w-4" />
                        <DatabaseIcon />
                        <span className="truncate flex-1">{schema.name || schema}</span>
                      </div>
                    ))}
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

// Connector card component
function ConnectorCard({ connector, onEdit, onDelete, onRefresh, onCompleteSetup, onRetry, authFetch }) {
  const { t } = useTranslation();
  const [showActions, setShowActions] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatSize = (bytes) => {
    if (!bytes) return '-';
    if (bytes > 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
    if (bytes > 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    if (bytes > 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${bytes} B`;
  };

  // Check if connector is an enterprise connector (cloud storage or databases)
  const isEnterpriseCloud = connector.type === 'enterprise' ||
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
    connector.enterprise_type === 'mssql' ||
    connector.enterprise_type === 'databricks';

  // Check if this connector needs scope selection
  // True for pending_scope OR connected but not scope_confirmed (legacy connectors)
  const needsScopeSetup = isEnterpriseCloud && (
    connector.status === 'pending_scope' ||
    (connector.status === 'connected' && connector.scope_confirmed === false)
  );

  // Get connector display name
  const displayName = connector.display_name || connector.name;

  // Get connected email from API response (already sanitized by backend)
  const connectedEmail = connector.connectedEmail || null;

  // Get connector description
  const getDescription = () => {
    if (connector.type === 'local_folder') return connector.config?.path;
    if (connector.type === 'file_upload') return `${connector.config?.fileCount || 0} ${t('connector.files', 'files')}`;
    if (connector.enterprise_type === 'onedrive') {
      return connectedEmail || 'Microsoft OneDrive';
    }
    if (connector.enterprise_type === 'sharepoint') {
      return connectedEmail || 'Microsoft SharePoint';
    }
    if (connector.enterprise_type === 'googledrive' || connector.enterprise_type === 'google_drive') {
      return connectedEmail || 'Google Drive';
    }
    if (connector.enterprise_type === 'dropbox') {
      return connectedEmail || 'Dropbox';
    }
    // Database connectors - show database name from display_name
    if (connector.enterprise_type === 'postgresql') {
      const dbName = connector.display_name?.replace('PostgreSQL - ', '') || 'PostgreSQL Database';
      return dbName;
    }
    if (connector.enterprise_type === 'mysql') {
      const dbName = connector.display_name?.replace('MySQL - ', '') || 'MySQL Database';
      return dbName;
    }
    if (connector.enterprise_type === 'mssql') {
      const dbName = connector.display_name?.replace('SQL Server - ', '') || 'SQL Server Database';
      return dbName;
    }
    // S3 connector
    if (connector.enterprise_type === 's3' || connector.enterprise_type === 'aws_s3') {
      return connector.display_name?.replace('Amazon S3 - ', '') || 'Amazon S3';
    }
    // Azure Blob connector
    if (connector.enterprise_type === 'azureblob' || connector.enterprise_type === 'azure_blob') {
      return connector.display_name?.replace('Azure Blob - ', '') || 'Azure Blob Storage';
    }
    // Databricks connector
    if (connector.enterprise_type === 'databricks') {
      return connector.display_name?.replace('Databricks - ', '') || 'Databricks Workspace';
    }
    return connector.type?.replace('_', ' ') || '';
  };

  // Get icon background color based on connector type
  const getIconBgColor = () => {
    if (connector.enterprise_type === 'onedrive') return 'bg-blue-100 text-blue-600';
    if (connector.enterprise_type === 'sharepoint') return 'bg-teal-100 text-teal-600';
    if (connector.enterprise_type === 'googledrive' || connector.enterprise_type === 'google_drive') return 'bg-green-100 text-green-600';
    if (connector.enterprise_type === 'dropbox') return 'bg-blue-100 text-blue-500';
    if (connector.enterprise_type === 's3' || connector.enterprise_type === 'aws_s3') return 'bg-[#569A31]/10 text-[#569A31]';
    if (connector.enterprise_type === 'azureblob' || connector.enterprise_type === 'azure_blob') return 'bg-[#0089D6]/10 text-[#0089D6]';
    if (connector.enterprise_type === 'databricks') return 'bg-[#FF3621]/10 text-[#FF3621]';
    if (connector.enterprise_type === 'postgresql') return 'bg-blue-100 text-[#336791]';
    if (connector.enterprise_type === 'mysql') return 'bg-orange-100 text-orange-600';
    if (connector.enterprise_type === 'mssql') return 'bg-red-100 text-red-600';
    return 'bg-ion/10 text-ion';
  };

  return (
    <div
      className={`bg-light-surface dark:bg-dark-surface border rounded-xl p-4 transition-colors ${
        needsScopeSetup
          ? 'border-amber-200 bg-amber-50/30'
          : connector.status === 'error'
          ? 'border-error/30 bg-error-bg/30'
          : 'border-light-border dark:border-dark-border hover:border-ion/50'
      }`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${getIconBgColor()}`}>
          {getConnectorIcon(connector.type, connector.enterprise_type)}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium text-text-primary dark:text-text-dark-primary truncate">
              {displayName}
            </h3>
            {/* Show "Needs Setup" badge for connectors that need scope configuration */}
            <StatusBadge status={needsScopeSetup ? 'pending_scope' : (connector.status || 'active')} />
          </div>
          <p className="text-sm text-text-secondary dark:text-text-dark-secondary truncate mb-2">
            {getDescription()}
          </p>

          {/* Stats */}
          <div className="flex items-center gap-4 text-xs text-text-secondary dark:text-text-dark-secondary flex-wrap">
            {/* Enterprise connector scope info */}
            {connector.scopeInfo && (
              <>
                {connector.scopeInfo.sitesCount > 0 && (
                  <span>{connector.scopeInfo.sitesCount} {connector.scopeInfo.sitesCount === 1 ? 'site' : 'sites'}</span>
                )}
                {connector.scopeInfo.foldersCount > 0 && (
                  <span>{connector.scopeInfo.foldersCount} {connector.scopeInfo.foldersCount === 1 ? 'folder' : 'folders'}</span>
                )}
              </>
            )}
            {connector.stats && (
              <>
                <span>{connector.stats.fileCount} {t('connector.files', 'files')}</span>
                <span>{formatSize(connector.stats.totalSize)}</span>
              </>
            )}
            {connector.lastScanAt && (
              <span>{t('connector.lastScan', 'Last scan')}: {formatDate(connector.lastScanAt)}</span>
            )}
          </div>
        </div>

        {/* Status-specific CTAs */}
        <div className="flex items-center gap-2">
          {/* Complete Setup CTA for connectors that need scope configuration */}
          {needsScopeSetup && (
            <button
              onClick={() => onCompleteSetup?.(connector)}
              className="px-3 py-1.5 text-sm font-medium text-white bg-slate rounded-lg hover:bg-slate/90 transition-colors"
            >
              {t('connector.actions.completeSetup', 'Complete Setup')}
            </button>
          )}

          {/* Retry CTA for error */}
          {connector.status === 'error' && (
            <button
              onClick={() => onRetry?.(connector)}
              className="px-3 py-1.5 text-sm font-medium text-white bg-error rounded-lg hover:bg-error/90 transition-colors"
            >
              {t('connector.actions.retry', 'Retry')}
            </button>
          )}

          {/* Edit Scope CTA for enterprise connectors that are fully configured */}
          {!needsScopeSetup && isEnterpriseCloud && connector.status !== 'error' && (
            <button
              onClick={() => {
                console.log('[ConnectorsList Edit Scope] Button clicked for connector:', connector.id, 'type:', connector.enterprise_type);
                onCompleteSetup?.(connector);
              }}
              className="px-3 py-1.5 text-sm font-medium text-slate bg-slate/10 rounded-lg hover:bg-slate/20 transition-colors"
            >
              {t('connector.actions.editScope', 'Edit Scope')}
            </button>
          )}

          {/* Actions dropdown */}
          <div className={`flex items-center gap-1 transition-opacity ${showActions || needsScopeSetup ? 'opacity-100' : 'opacity-0'}`}>
            <button
              onClick={() => onRefresh?.(connector)}
              className="p-2 text-text-secondary dark:text-text-dark-secondary hover:text-ion hover:bg-ion/10 rounded-lg transition-colors"
              title={t('connector.actions.refresh', 'Refresh')}
            >
              <RefreshIcon />
            </button>
            <button
              onClick={() => onEdit?.(connector)}
              className="p-2 text-text-secondary dark:text-text-dark-secondary hover:text-ion hover:bg-ion/10 rounded-lg transition-colors"
              title={t('connector.actions.edit', 'Edit')}
            >
              <EditIcon />
            </button>
            <button
              onClick={() => onDelete?.(connector)}
              className="p-2 text-text-secondary dark:text-text-dark-secondary hover:text-error hover:bg-error/10 rounded-lg transition-colors"
              title={t('connector.actions.delete', 'Delete')}
            >
              <TrashIcon />
            </button>
          </div>
        </div>
      </div>

      {/* Pending scope info banner - for both pending_scope and legacy connected without scope */}
      {needsScopeSetup && (
        <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-800">
            <strong>{t('connector.pendingScope.title', 'Setup incomplete:')}</strong>{' '}
            {t('connector.pendingScope.message', 'Select which folders to include before using this connector for ingestion.')}
          </p>
        </div>
      )}

      {/* Error info banner */}
      {connector.status === 'error' && connector.error_message && (
        <div className="mt-3 p-3 bg-error-bg border border-error/20 rounded-lg">
          <p className="text-sm text-error">
            <strong>{t('connector.error.title', 'Error:')}</strong> {connector.error_message}
          </p>
        </div>
      )}

      {/* Expandable content preview for enterprise connectors */}
      <ConnectorContentPreview connector={connector} authFetch={authFetch} />
    </div>
  );
}

// Empty state component
function EmptyState({ onAddConnector }) {
  const { t } = useTranslation();

  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 bg-light-soft dark:bg-dark-soft rounded-xl flex items-center justify-center mx-auto mb-4 text-text-secondary dark:text-text-dark-secondary">
        <FolderIcon />
      </div>
      <h3 className="text-lg font-semibold text-text-primary dark:text-text-dark-primary mb-2">
        {t('connector.empty.title')}
      </h3>
      <p className="text-text-secondary dark:text-text-dark-secondary mb-6 max-w-sm mx-auto">
        {t('connector.empty.description')}
      </p>
      <button
        onClick={onAddConnector}
        className="inline-flex items-center gap-2 px-6 py-2.5 bg-slate text-white font-medium rounded-button shadow-button hover:bg-slate-hover transition-colors"
      >
        <PlusIcon />
        {t('connector.addFirst')}
      </button>
    </div>
  );
}

// Main ConnectorsList component
export default function ConnectorsList({ onAddConnector, onEditConnector, onCompleteSetup, onRetry }) {
  const { t } = useTranslation();
  const { authFetch } = useAuth();
  const [connectors, setConnectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch connectors
  const fetchConnectors = async () => {
    try {
      setLoading(true);
      const response = await authFetch('/connectors');
      if (response.ok) {
        const data = await response.json();
        setConnectors(data.connectors || data || []);
      } else {
        setError(t('connector.fetchError', 'Failed to load connectors'));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConnectors();
  }, [authFetch, t]);

  const handleRefresh = async (connector) => {
    try {
      const response = await authFetch(`/connectors/${connector.id}/refresh`, {
        method: 'POST',
      });
      if (response.ok) {
        const updated = await response.json();
        setConnectors((prev) =>
          prev.map((c) => (c.id === connector.id ? updated : c))
        );
      }
    } catch (err) {
      console.error('Refresh error:', err);
    }
  };

  const handleDelete = async (connector) => {
    const displayName = connector.display_name || connector.name;
    if (!window.confirm(t('connector.deleteConfirm', { name: displayName }, `Delete "${displayName}"?`))) {
      return;
    }

    try {
      const response = await authFetch(`/connectors/${connector.id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setConnectors((prev) => prev.filter((c) => c.id !== connector.id));
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  // Handle Complete Setup - call parent handler and refresh on completion
  const handleCompleteSetup = (connector) => {
    if (onCompleteSetup) {
      onCompleteSetup(connector, fetchConnectors);
    }
  };

  // Handle Retry - attempt to reconnect or re-authenticate
  const handleRetry = async (connector) => {
    if (onRetry) {
      onRetry(connector, fetchConnectors);
    } else {
      // Default retry behavior - just refresh the connector
      await handleRefresh(connector);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-xl p-4 animate-pulse"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-light-soft dark:bg-dark-soft rounded-lg" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-light-soft dark:bg-dark-soft rounded w-1/3" />
                <div className="h-3 bg-light-soft dark:bg-dark-soft rounded w-1/2" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-error mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="text-ion hover:underline"
        >
          {t('common.retry')}
        </button>
      </div>
    );
  }

  // Empty state
  if (connectors.length === 0) {
    return <EmptyState onAddConnector={onAddConnector} />;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-text-primary dark:text-text-dark-primary">
            {t('connector.listTitle')}
          </h2>
          <p className="text-sm text-text-secondary dark:text-text-dark-secondary">
            {t('connector.listSubtitle', { count: connectors.length })}
          </p>
        </div>
        <button
          onClick={onAddConnector}
          className="inline-flex items-center gap-2 px-4 py-2 bg-ion text-white font-medium rounded-button hover:opacity-90 transition-colors"
        >
          <PlusIcon />
          {t('connector.addAnother')}
        </button>
      </div>

      {/* Connectors list */}
      <div className="space-y-3">
        {connectors.map((connector) => (
          <ConnectorCard
            key={connector.id}
            connector={connector}
            onEdit={() => onEditConnector?.(connector)}
            onDelete={() => handleDelete(connector)}
            onRefresh={() => handleRefresh(connector)}
            onCompleteSetup={() => handleCompleteSetup(connector)}
            onRetry={() => handleRetry(connector)}
            authFetch={authFetch}
          />
        ))}
      </div>
    </div>
  );
}
