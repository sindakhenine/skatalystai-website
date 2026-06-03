import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

/**
 * ExportButtons Component - Phase G
 *
 * Download buttons for README.md and PDF report exports.
 */
export default function ExportButtons({ runId }) {
  const { authFetch } = useAuth();
  const [downloadingReadme, setDownloadingReadme] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  const downloadReadme = async () => {
    try {
      setDownloadingReadme(true);

      const response = await authFetch(`/orchestrated-runs/${runId}/export/readme`);

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to download README');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'README.md';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error downloading README:', err);
      alert('Failed to download README: ' + err.message);
    } finally {
      setDownloadingReadme(false);
    }
  };

  const downloadPdf = async () => {
    try {
      setDownloadingPdf(true);

      const response = await authFetch(`/orchestrated-runs/${runId}/export/pdf`);

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to download report');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      // Open in new tab for printing to PDF
      const printWindow = window.open(url, '_blank');
      if (printWindow) {
        printWindow.onload = () => {
          // Give user option to print/save as PDF
          setTimeout(() => {
            printWindow.print();
          }, 500);
        };
      }

      // Also provide direct download
      const a = document.createElement('a');
      a.href = url;
      a.download = 'build-summary.html';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 1000);
    } catch (err) {
      console.error('Error downloading report:', err);
      alert('Failed to download report: ' + err.message);
    } finally {
      setDownloadingPdf(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      {/* Download README Button */}
      <button
        onClick={downloadReadme}
        disabled={downloadingReadme}
        className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors disabled:opacity-50"
      >
        {downloadingReadme ? (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        ) : (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )}
        <span className="text-sm font-medium">README</span>
      </button>

      {/* Download PDF Button */}
      <button
        onClick={downloadPdf}
        disabled={downloadingPdf}
        className="flex items-center gap-2 px-4 py-2 bg-white text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors disabled:opacity-50 font-medium"
      >
        {downloadingPdf ? (
          <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        ) : (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        )}
        <span className="text-sm">PDF Report</span>
      </button>
    </div>
  );
}
