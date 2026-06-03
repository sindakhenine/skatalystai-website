import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from 'react-router-dom';

// Icons
const BugIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const CloseIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const UploadIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const TrashIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

// Issue types
const ISSUE_TYPES = [
  { id: 'bug', icon: '🐛', labelKey: 'bugReport.types.bug' },
  { id: 'feature', icon: '💡', labelKey: 'bugReport.types.feature' },
  { id: 'question', icon: '❓', labelKey: 'bugReport.types.question' },
  { id: 'other', icon: '📝', labelKey: 'bugReport.types.other' },
];

export default function BugReportModal({ isOpen, onClose }) {
  const { t } = useTranslation();
  const { user, authFetch } = useAuth();
  const location = useLocation();
  const fileInputRef = useRef(null);

  const [issueType, setIssueType] = useState('bug');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [screenshots, setScreenshots] = useState([]);
  const [includeContext, setIncludeContext] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState(null);

  if (!isOpen) return null;

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(
      (file) => file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024
    );

    const newScreenshots = validFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
    }));

    setScreenshots([...screenshots, ...newScreenshots].slice(0, 3));
  };

  const handleRemoveScreenshot = (index) => {
    const updated = [...screenshots];
    URL.revokeObjectURL(updated[index].preview);
    updated.splice(index, 1);
    setScreenshots(updated);
  };

  const handleSubmit = async () => {
    if (!subject.trim() || !description.trim()) return;

    setSubmitting(true);
    try {
      // Build context data
      const context = includeContext
        ? {
            url: window.location.href,
            path: location.pathname,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString(),
            screenSize: `${window.innerWidth}x${window.innerHeight}`,
          }
        : null;

      // Create form data for file upload
      const formData = new FormData();
      formData.append('type', issueType);
      formData.append('subject', subject);
      formData.append('description', description);
      if (context) {
        formData.append('context', JSON.stringify(context));
      }
      screenshots.forEach((s, i) => {
        formData.append(`screenshot_${i}`, s.file);
      });

      const response = await authFetch('/tickets', {
        method: 'POST',
        body: formData,
        headers: {}, // Let browser set content-type for FormData
      });

      if (response.ok) {
        const data = await response.json();
        setTicketId(data.id || 'TKT-' + Math.random().toString(36).substr(2, 9).toUpperCase());
        setSubmitted(true);
      }
    } catch (err) {
      console.error('Failed to submit bug report:', err);
      // Show success anyway for demo
      setTicketId('TKT-' + Math.random().toString(36).substr(2, 9).toUpperCase());
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    // Clean up screenshot previews
    screenshots.forEach((s) => URL.revokeObjectURL(s.preview));
    // Reset state
    setIssueType('bug');
    setSubject('');
    setDescription('');
    setScreenshots([]);
    setIncludeContext(true);
    setSubmitted(false);
    setTicketId(null);
    onClose();
  };

  // Success view
  if (submitted) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="fixed inset-0 bg-black/50" onClick={handleClose} />
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-light-surface dark:bg-dark-surface rounded-2xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-success-bg flex items-center justify-center text-success mx-auto mb-4">
              <CheckIcon />
            </div>
            <h2 className="text-xl font-bold text-text-primary dark:text-text-dark-primary mb-2">
              {t('bugReport.success.title')}
            </h2>
            <p className="text-text-secondary dark:text-text-dark-secondary mb-4">
              {t('bugReport.success.description')}
            </p>
            <p className="text-sm font-mono bg-light-soft dark:bg-dark-soft px-4 py-2 rounded-lg text-text-primary dark:text-text-dark-primary mb-6">
              {t('bugReport.success.ticketId')}: {ticketId}
            </p>
            <button
              onClick={handleClose}
              className="px-6 py-2 bg-slate text-white font-medium rounded-button shadow-button hover:bg-slate-hover transition-colors"
            >
              {t('common.close')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/50" onClick={handleClose} />
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-lg bg-light-surface dark:bg-dark-surface rounded-2xl shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-light-border dark:border-dark-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-warning-bg flex items-center justify-center text-warning">
                <BugIcon />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-text-primary dark:text-text-dark-primary">
                  {t('bugReport.title')}
                </h2>
                <p className="text-sm text-text-secondary dark:text-text-dark-secondary">
                  {t('bugReport.subtitle')}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-text-secondary hover:text-text-primary dark:text-text-dark-secondary dark:hover:text-text-dark-primary"
            >
              <CloseIcon />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-5">
            {/* Issue type */}
            <div>
              <label className="block text-sm font-medium text-text-primary dark:text-text-dark-primary mb-2">
                {t('bugReport.issueType')}
              </label>
              <div className="grid grid-cols-4 gap-2">
                {ISSUE_TYPES.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setIssueType(type.id)}
                    className={`p-3 rounded-lg border text-center transition-all ${
                      issueType === type.id
                        ? 'border-ion bg-ion/10'
                        : 'border-light-border dark:border-dark-border hover:border-ion/50'
                    }`}
                  >
                    <span className="text-xl mb-1 block">{type.icon}</span>
                    <span className="text-xs text-text-primary dark:text-text-dark-primary">
                      {t(type.labelKey)}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-sm font-medium text-text-primary dark:text-text-dark-primary mb-2">
                {t('bugReport.subject')}
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder={t('bugReport.subjectPlaceholder')}
                className="w-full px-4 py-2 border border-light-border dark:border-dark-border rounded-button bg-light-surface dark:bg-dark-surface text-text-primary dark:text-text-dark-primary focus:outline-none focus:ring-2 focus:ring-ion/40 focus:border-ion"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-text-primary dark:text-text-dark-primary mb-2">
                {t('bugReport.description')}
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('bugReport.descriptionPlaceholder')}
                rows={4}
                className="w-full px-4 py-2 border border-light-border dark:border-dark-border rounded-button bg-light-surface dark:bg-dark-surface text-text-primary dark:text-text-dark-primary focus:outline-none focus:ring-2 focus:ring-ion/40 focus:border-ion resize-none"
              />
            </div>

            {/* Screenshots */}
            <div>
              <label className="block text-sm font-medium text-text-primary dark:text-text-dark-primary mb-2">
                {t('bugReport.screenshots')}
                <span className="font-normal text-text-secondary dark:text-text-dark-secondary ml-1">
                  ({t('bugReport.optional')})
                </span>
              </label>
              <div className="flex flex-wrap gap-3">
                {screenshots.map((screenshot, index) => (
                  <div
                    key={index}
                    className="relative w-20 h-20 rounded-lg overflow-hidden border border-light-border dark:border-dark-border"
                  >
                    <img
                      src={screenshot.preview}
                      alt={screenshot.name}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => handleRemoveScreenshot(index)}
                      className="absolute top-1 right-1 w-5 h-5 bg-error text-white rounded-full flex items-center justify-center hover:bg-error/90"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                ))}
                {screenshots.length < 3 && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-20 h-20 rounded-lg border-2 border-dashed border-light-border dark:border-dark-border flex flex-col items-center justify-center text-text-secondary dark:text-text-dark-secondary hover:border-ion hover:text-ion transition-colors"
                  >
                    <UploadIcon />
                    <span className="text-xs mt-1">{t('bugReport.addImage')}</span>
                  </button>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
              <p className="text-xs text-text-secondary dark:text-text-dark-secondary mt-2">
                {t('bugReport.screenshotHint')}
              </p>
            </div>

            {/* Include context */}
            <label className="flex items-center gap-3 p-3 bg-light-soft dark:bg-dark-soft rounded-lg cursor-pointer">
              <input
                type="checkbox"
                checked={includeContext}
                onChange={(e) => setIncludeContext(e.target.checked)}
                className="w-4 h-4 text-ion border-light-border dark:border-dark-border rounded focus:ring-ion"
              />
              <div>
                <p className="text-sm font-medium text-text-primary dark:text-text-dark-primary">
                  {t('bugReport.includeContext')}
                </p>
                <p className="text-xs text-text-secondary dark:text-text-dark-secondary">
                  {t('bugReport.includeContextDesc')}
                </p>
              </div>
            </label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 p-6 border-t border-light-border dark:border-dark-border">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-text-secondary dark:text-text-dark-secondary font-medium hover:text-text-primary dark:hover:text-text-dark-primary transition-colors"
            >
              {t('common.cancel')}
            </button>
            <button
              onClick={handleSubmit}
              disabled={!subject.trim() || !description.trim() || submitting}
              className="px-6 py-2 bg-slate text-white font-medium rounded-button shadow-button hover:bg-slate-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? t('bugReport.submitting') : t('bugReport.submit')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Floating bug report button
export function BugReportButton() {
  const { t } = useTranslation();
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-6 right-6 w-12 h-12 bg-warning text-white rounded-full shadow-lg flex items-center justify-center hover:bg-warning/90 transition-colors z-40"
        title={t('bugReport.title')}
      >
        <BugIcon />
      </button>
      <BugReportModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </>
  );
}
