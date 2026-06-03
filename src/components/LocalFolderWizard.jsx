/**
 * Local Folder Wizard
 *
 * Production-ready folder selection using the File System Access API.
 * Works in Chrome and Edge browsers with native folder picker dialog.
 *
 * Features:
 * - Native folder picker via showDirectoryPicker()
 * - Recursive file enumeration
 * - File metadata capture (name, path, size, type, lastModified)
 * - Preview scan before ingestion
 * - Browser support detection
 * - Guided UX with explanations
 */

import React, { useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';

// Check if File System Access API is supported
const isFileSystemAccessSupported = () => {
  return 'showDirectoryPicker' in window;
};

// Icons
const FolderIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const AlertIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

const CloseIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const SpinnerIcon = () => (
  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
  </svg>
);

// Format bytes to human readable
const formatBytes = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

// Get file extension
const getFileExtension = (filename) => {
  const ext = filename.split('.').pop()?.toLowerCase();
  return ext || '';
};

// Recursively iterate files in directory
async function* iterateFiles(dirHandle, path = '') {
  for await (const entry of dirHandle.values()) {
    const entryPath = path ? `${path}/${entry.name}` : entry.name;

    if (entry.kind === 'file') {
      try {
        const file = await entry.getFile();
        yield {
          name: file.name,
          path: entryPath,
          size: file.size,
          type: file.type || `application/${getFileExtension(file.name)}`,
          lastModified: file.lastModified,
          handle: entry,
          file: file,
        };
      } catch (err) {
        console.warn(`Could not read file ${entryPath}:`, err.message);
      }
    } else if (entry.kind === 'directory') {
      // Skip hidden directories and common non-content folders
      if (!entry.name.startsWith('.') &&
          !['node_modules', '__pycache__', '.git', '.svn', 'venv', '.env'].includes(entry.name)) {
        yield* iterateFiles(entry, entryPath);
      }
    }
  }
}

/**
 * Browser Not Supported Message
 */
function BrowserNotSupported({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md border border-gray-200">
          <div className="p-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-100 flex items-center justify-center">
              <AlertIcon />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Browser Not Supported
            </h2>
            <p className="text-gray-600 mb-4">
              Your browser does not support folder selection.
            </p>
            <div className="bg-gray-50 rounded-lg p-4 text-left mb-6">
              <p className="text-sm text-gray-700 font-medium mb-2">To use Local Folder:</p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-slate rounded-full"></span>
                  Use <strong>Google Chrome</strong> (recommended)
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-slate rounded-full"></span>
                  Use <strong>Microsoft Edge</strong>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-gray-300 rounded-full"></span>
                  Or wait for the Local Server Agent (coming soon)
                </li>
              </ul>
            </div>
            <button
              onClick={onClose}
              className="w-full px-4 py-2.5 bg-slate text-white rounded-lg hover:bg-slate/90 transition-colors font-medium"
            >
              Got it
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Main Local Folder Wizard Component
 */
export default function LocalFolderWizard({ isOpen, onClose, onComplete }) {
  const { authFetch } = useAuth();

  // Wizard state
  const [step, setStep] = useState(1); // 1: Explain, 2: Select, 3: Preview, 4: Processing
  const [confirmed, setConfirmed] = useState(false);
  const [folderName, setFolderName] = useState('');
  const [files, setFiles] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, currentFile: '' });
  const [error, setError] = useState(null);
  const [context, setContext] = useState('');

  // File type stats
  const [stats, setStats] = useState({
    totalFiles: 0,
    totalSize: 0,
    byType: {},
  });

  // Check browser support
  if (!isFileSystemAccessSupported()) {
    return isOpen ? <BrowserNotSupported onClose={onClose} /> : null;
  }

  // Handle folder selection
  const handleSelectFolder = async () => {
    setError(null);
    setScanning(true);

    try {
      // Show native folder picker
      const dirHandle = await window.showDirectoryPicker({
        mode: 'read',
      });

      setFolderName(dirHandle.name);

      // Scan files
      const scannedFiles = [];
      const typeStats = {};
      let totalSize = 0;

      for await (const fileInfo of iterateFiles(dirHandle)) {
        scannedFiles.push(fileInfo);
        totalSize += fileInfo.size;

        const ext = getFileExtension(fileInfo.name) || 'other';
        typeStats[ext] = (typeStats[ext] || 0) + 1;

        // Update progress during scan
        if (scannedFiles.length % 10 === 0) {
          setProgress({ current: scannedFiles.length, total: 0, currentFile: fileInfo.name });
        }
      }

      setFiles(scannedFiles);
      setStats({
        totalFiles: scannedFiles.length,
        totalSize,
        byType: typeStats,
      });

      // Move to preview step
      setStep(3);

    } catch (err) {
      if (err.name === 'AbortError') {
        // User cancelled - graceful exit
        console.log('Folder selection cancelled');
      } else {
        setError(err.message);
      }
    } finally {
      setScanning(false);
    }
  };

  // Handle ingestion
  const handleIngest = async () => {
    if (files.length === 0) return;

    setProcessing(true);
    setStep(4);
    setError(null);

    try {
      // Create FormData with all files
      const formData = new FormData();
      formData.append('context', context || `Local folder: ${folderName}`);
      formData.append('source', 'local_folder');
      formData.append('folderName', folderName);

      // Add files in batches to avoid memory issues
      const batchSize = 50;
      let processedCount = 0;

      for (let i = 0; i < files.length; i += batchSize) {
        const batch = files.slice(i, Math.min(i + batchSize, files.length));
        const batchFormData = new FormData();
        batchFormData.append('context', context || `Local folder: ${folderName}`);
        batchFormData.append('source', 'local_folder');
        batchFormData.append('folderName', folderName);
        batchFormData.append('batchIndex', Math.floor(i / batchSize));
        batchFormData.append('totalBatches', Math.ceil(files.length / batchSize));

        for (const fileInfo of batch) {
          batchFormData.append('files', fileInfo.file, fileInfo.path);
          processedCount++;
          setProgress({
            current: processedCount,
            total: files.length,
            currentFile: fileInfo.name,
          });
        }

        // Upload batch
        await authFetch('/upload/batch', {
          method: 'POST',
          body: batchFormData,
          headers: {}, // Let browser set content-type for FormData
        });
      }

      // Complete
      onComplete?.({
        folderName,
        filesProcessed: files.length,
        totalSize: stats.totalSize,
      });

    } catch (err) {
      setError(err.message);
      setStep(3); // Go back to preview
    } finally {
      setProcessing(false);
    }
  };

  // Reset wizard
  const handleClose = () => {
    setStep(1);
    setConfirmed(false);
    setFolderName('');
    setFiles([]);
    setStats({ totalFiles: 0, totalSize: 0, byType: {} });
    setError(null);
    setContext('');
    onClose?.();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/50" onClick={step < 4 ? handleClose : undefined} />
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg border border-gray-200">
          {/* Header */}
          <div className="border-b border-gray-100 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                  <FolderIcon />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Local Folder</h2>
                  <p className="text-xs text-gray-500">Browser-based folder access</p>
                </div>
              </div>
              {step < 4 && (
                <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                  <CloseIcon />
                </button>
              )}
            </div>

            {/* Progress steps */}
            <div className="flex gap-2 mt-4">
              {[1, 2, 3, 4].map((s) => (
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
            {/* Step 1: Explanation */}
            {step === 1 && (
              <div className="space-y-4" data-tour="local-folder-explain">
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                  <h3 className="font-medium text-blue-900 mb-2">How it works</h3>
                  <ul className="text-sm text-blue-800 space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-blue-200 text-blue-800 flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">1</span>
                      <span>Click "Select Folder" to open your system's folder picker</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-blue-200 text-blue-800 flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">2</span>
                      <span>Choose the folder you want to analyze</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-blue-200 text-blue-800 flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">3</span>
                      <span>Preview the files before confirming ingestion</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    Privacy Guarantee
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• We can only access folders you explicitly select</li>
                    <li>• No background access to your file system</li>
                    <li>• You'll see exactly what files will be processed</li>
                  </ul>
                </div>

                <label className="flex items-start gap-3 p-3 bg-white border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={confirmed}
                    onChange={(e) => setConfirmed(e.target.checked)}
                    className="mt-0.5 w-4 h-4 text-slate rounded border-gray-300 focus:ring-slate"
                  />
                  <span className="text-sm text-gray-700">
                    I understand that I will select a folder and preview the files before any processing begins
                  </span>
                </label>

                <div className="flex justify-between pt-2">
                  <button
                    onClick={handleClose}
                    className="px-4 py-2 text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setStep(2)}
                    disabled={!confirmed}
                    className="px-6 py-2 bg-slate text-white rounded-lg hover:bg-slate/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Select Folder */}
            {step === 2 && (
              <div className="space-y-4" data-tour="local-folder-select">
                <div className="text-center py-8">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-slate/10 flex items-center justify-center">
                    <svg className="w-10 h-10 text-slate" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                  </div>

                  {scanning ? (
                    <>
                      <div className="flex items-center justify-center gap-2 text-slate mb-2">
                        <SpinnerIcon />
                        <span className="font-medium">Scanning folder...</span>
                      </div>
                      <p className="text-sm text-gray-500">
                        Found {progress.current} files
                        {progress.currentFile && <span className="block text-xs mt-1 truncate max-w-xs mx-auto">{progress.currentFile}</span>}
                      </p>
                    </>
                  ) : (
                    <>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Select Your Folder
                      </h3>
                      <p className="text-sm text-gray-500 mb-6">
                        Click the button below to open your system's folder picker.
                        <br />
                        Choose the folder you want us to analyze.
                      </p>

                      <button
                        onClick={handleSelectFolder}
                        className="px-8 py-3 bg-slate text-white rounded-lg hover:bg-slate/90 transition-colors font-medium inline-flex items-center gap-2"
                        data-tour="select-folder-button"
                      >
                        <FolderIcon />
                        Select Folder
                      </button>

                      <p className="text-xs text-gray-400 mt-4">
                        A system dialog will open where you can browse and select a folder
                      </p>
                    </>
                  )}
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                    {error}
                  </div>
                )}

                <div className="flex justify-between pt-2">
                  <button
                    onClick={() => setStep(1)}
                    disabled={scanning}
                    className="px-4 py-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 transition-colors"
                  >
                    Back
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Preview */}
            {step === 3 && (
              <div className="space-y-4" data-tour="local-folder-preview">
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <div className="flex items-center gap-2 text-green-800 mb-2">
                    <CheckIcon />
                    <span className="font-medium">Folder scanned successfully</span>
                  </div>
                  <p className="text-sm text-green-700">
                    <strong>{folderName}</strong> — {stats.totalFiles} files ({formatBytes(stats.totalSize)})
                  </p>
                </div>

                {/* File type breakdown */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Files by type</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {Object.entries(stats.byType)
                      .sort((a, b) => b[1] - a[1])
                      .slice(0, 9)
                      .map(([ext, count]) => (
                        <div key={ext} className="flex items-center justify-between bg-white px-2 py-1.5 rounded border border-gray-100">
                          <span className="text-xs font-mono text-gray-600">.{ext}</span>
                          <span className="text-xs font-medium text-gray-900">{count}</span>
                        </div>
                      ))}
                  </div>
                  {Object.keys(stats.byType).length > 9 && (
                    <p className="text-xs text-gray-500 mt-2">
                      +{Object.keys(stats.byType).length - 9} more file types
                    </p>
                  )}
                </div>

                {/* Sample files */}
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-3 py-2 border-b border-gray-200">
                    <span className="text-xs font-medium text-gray-700">Sample files (first 10)</span>
                  </div>
                  <div className="max-h-32 overflow-y-auto">
                    {files.slice(0, 10).map((file, i) => (
                      <div key={i} className="px-3 py-1.5 text-xs flex justify-between border-b border-gray-100 last:border-0">
                        <span className="text-gray-700 truncate flex-1 mr-2" title={file.path}>{file.path}</span>
                        <span className="text-gray-400 flex-shrink-0">{formatBytes(file.size)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Context input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Context (optional)
                  </label>
                  <input
                    type="text"
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
                    placeholder="What is this folder about?"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-slate/20 focus:border-slate transition-colors"
                  />
                  <p className="text-xs text-gray-500 mt-1">Helps with organization and search</p>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                    {error}
                  </div>
                )}

                <div className="flex justify-between pt-2">
                  <button
                    onClick={() => {
                      setStep(2);
                      setFiles([]);
                      setStats({ totalFiles: 0, totalSize: 0, byType: {} });
                    }}
                    className="px-4 py-2 text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    Select Different Folder
                  </button>
                  <button
                    onClick={handleIngest}
                    className="px-6 py-2 bg-slate text-white rounded-lg hover:bg-slate/90 transition-colors font-medium"
                  >
                    Process {stats.totalFiles} Files
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Processing */}
            {step === 4 && (
              <div className="space-y-4 text-center py-4">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate/10 flex items-center justify-center">
                  <SpinnerIcon />
                </div>

                <h3 className="text-lg font-semibold text-gray-900">
                  Processing Files
                </h3>

                <div className="space-y-2">
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-slate rounded-full transition-all duration-300"
                      style={{ width: `${progress.total > 0 ? (progress.current / progress.total) * 100 : 0}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-600">
                    {progress.current} of {progress.total} files
                  </p>
                  {progress.currentFile && (
                    <p className="text-xs text-gray-400 truncate max-w-xs mx-auto">
                      {progress.currentFile}
                    </p>
                  )}
                </div>

                <p className="text-xs text-gray-500 mt-4">
                  Please don't close this window
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Export browser support check for use elsewhere
export { isFileSystemAccessSupported };
