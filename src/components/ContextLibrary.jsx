import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';

// Icons
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

const StarIcon = ({ filled }) => (
  <svg className="w-4 h-4" fill={filled ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
  </svg>
);

const CloseIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const DocumentTextIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

// Context card component
function ContextCard({ context, onEdit, onDelete, onSetDefault, onSelect, selectable }) {
  const { t } = useTranslation();
  const [showActions, setShowActions] = useState(false);

  const truncateText = (text, maxLength = 150) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div
      className={`bg-light-surface dark:bg-dark-surface border rounded-xl p-4 transition-all ${
        context.is_default
          ? 'border-ion/50 bg-ion/5 dark:bg-ion/10'
          : 'border-light-border dark:border-dark-border hover:border-ion/30'
      } ${selectable ? 'cursor-pointer' : ''}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      onClick={() => selectable && onSelect?.(context)}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
          context.is_default
            ? 'bg-ion/20 text-ion'
            : 'bg-light-soft dark:bg-dark-soft text-text-secondary dark:text-text-dark-secondary'
        }`}>
          <DocumentTextIcon />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium text-text-primary dark:text-text-dark-primary truncate">
              {context.name}
            </h3>
            {context.is_default && (
              <span className="text-xs bg-ion/20 text-ion px-2 py-0.5 rounded-full">
                {t('context.default')}
              </span>
            )}
          </div>
          {context.description && (
            <p className="text-sm text-text-secondary dark:text-text-dark-secondary mb-2">
              {context.description}
            </p>
          )}
          <p className="text-sm text-text-secondary dark:text-text-dark-secondary bg-light-soft dark:bg-dark-soft rounded-lg p-2 font-mono">
            {truncateText(context.content || context.context_text || '')}
          </p>
        </div>

        {/* Actions */}
        {!selectable && (
          <div className={`flex items-center gap-1 transition-opacity ${showActions ? 'opacity-100' : 'opacity-0'}`}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSetDefault?.(context);
              }}
              className={`p-2 rounded-lg transition-colors ${
                context.is_default
                  ? 'text-ion bg-ion/10'
                  : 'text-text-secondary dark:text-text-dark-secondary hover:text-ion hover:bg-ion/10'
              }`}
              title={t('context.setDefault')}
            >
              <StarIcon filled={context.is_default} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.(context);
              }}
              className="p-2 text-text-secondary dark:text-text-dark-secondary hover:text-ion hover:bg-ion/10 rounded-lg transition-colors"
              title={t('context.edit')}
            >
              <EditIcon />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.(context);
              }}
              className="p-2 text-text-secondary dark:text-text-dark-secondary hover:text-error hover:bg-error/10 rounded-lg transition-colors"
              title={t('context.delete')}
            >
              <TrashIcon />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Context editor modal
function ContextEditorModal({ context, onSave, onClose }) {
  const { t } = useTranslation();
  const [name, setName] = useState(context?.name || '');
  const [description, setDescription] = useState(context?.description || '');
  const [contextText, setContextText] = useState(context?.content || context?.context_text || '');
  const [isDefault, setIsDefault] = useState(context?.is_default || false);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !contextText.trim()) return;

    setSaving(true);
    try {
      await onSave({
        id: context?.id,
        name: name.trim(),
        description: description.trim(),
        context_text: contextText.trim(),
        is_default: isDefault,
      });
      onClose();
    } catch (err) {
      console.error('Save error:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-lg bg-light-surface dark:bg-dark-surface rounded-2xl shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-light-border dark:border-dark-border">
            <h2 className="text-lg font-semibold text-text-primary dark:text-text-dark-primary">
              {context ? t('context.editContext') : t('context.newContext')}
            </h2>
            <button
              onClick={onClose}
              className="text-text-secondary hover:text-text-primary dark:text-text-dark-secondary dark:hover:text-text-dark-primary"
            >
              <CloseIcon />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-primary dark:text-text-dark-primary mb-2">
                {t('context.name')} *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('context.namePlaceholder')}
                className="w-full px-4 py-2.5 border border-light-border dark:border-dark-border rounded-button bg-light-surface dark:bg-dark-surface text-text-primary dark:text-text-dark-primary focus:outline-none focus:ring-2 focus:ring-ion/40 focus:border-ion"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary dark:text-text-dark-primary mb-2">
                {t('context.description')}
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('context.descriptionPlaceholder')}
                className="w-full px-4 py-2.5 border border-light-border dark:border-dark-border rounded-button bg-light-surface dark:bg-dark-surface text-text-primary dark:text-text-dark-primary focus:outline-none focus:ring-2 focus:ring-ion/40 focus:border-ion"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary dark:text-text-dark-primary mb-2">
                {t('context.contextText')} *
              </label>
              <textarea
                value={contextText}
                onChange={(e) => setContextText(e.target.value)}
                placeholder={t('context.contextTextPlaceholder')}
                rows={6}
                className="w-full px-4 py-2.5 border border-light-border dark:border-dark-border rounded-button bg-light-surface dark:bg-dark-surface text-text-primary dark:text-text-dark-primary focus:outline-none focus:ring-2 focus:ring-ion/40 focus:border-ion resize-none font-mono text-sm"
                required
              />
              <p className="mt-1 text-xs text-text-secondary dark:text-text-dark-secondary">
                {t('context.contextTextHint')}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is-default"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                className="h-4 w-4 rounded border-light-border text-ion focus:ring-ion/40"
              />
              <label htmlFor="is-default" className="text-sm text-text-primary dark:text-text-dark-primary">
                {t('context.setAsDefault')}
              </label>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-text-secondary dark:text-text-dark-secondary font-medium hover:text-text-primary dark:hover:text-text-dark-primary transition-colors"
              >
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                disabled={saving || !name.trim() || !contextText.trim()}
                className="px-6 py-2 bg-slate text-white font-medium rounded-button shadow-button hover:bg-slate-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? t('common.saving') : t('common.save')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Empty state
function EmptyState({ onAdd }) {
  const { t } = useTranslation();

  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 bg-light-soft dark:bg-dark-soft rounded-xl flex items-center justify-center mx-auto mb-4 text-text-secondary dark:text-text-dark-secondary">
        <DocumentTextIcon />
      </div>
      <h3 className="text-lg font-semibold text-text-primary dark:text-text-dark-primary mb-2">
        {t('context.empty.title')}
      </h3>
      <p className="text-text-secondary dark:text-text-dark-secondary mb-6 max-w-sm mx-auto">
        {t('context.empty.description')}
      </p>
      <button
        onClick={onAdd}
        className="inline-flex items-center gap-2 px-6 py-2.5 bg-slate text-white font-medium rounded-button shadow-button hover:bg-slate-hover transition-colors"
      >
        <PlusIcon />
        {t('context.addFirst')}
      </button>
    </div>
  );
}

// Main ContextLibrary component
export default function ContextLibrary({ onSelect, selectable = false }) {
  const { t } = useTranslation();
  const { authFetch } = useAuth();
  const [contexts, setContexts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const [editingContext, setEditingContext] = useState(null);

  // Fetch contexts
  useEffect(() => {
    const fetchContexts = async () => {
      try {
        setLoading(true);
        const response = await authFetch('/contexts');
        if (response.ok) {
          const data = await response.json();
          setContexts(data.contexts || data || []);
        } else {
          setError(t('context.fetchError'));
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchContexts();
  }, [authFetch, t]);

  const handleAdd = () => {
    setEditingContext(null);
    setShowEditor(true);
  };

  const handleEdit = (context) => {
    setEditingContext(context);
    setShowEditor(true);
  };

  const handleSave = async (contextData) => {
    const method = contextData.id ? 'PUT' : 'POST';
    const url = contextData.id ? `/contexts/${contextData.id}` : '/contexts';

    const response = await authFetch(url, {
      method,
      body: JSON.stringify(contextData),
    });

    if (response.ok) {
      const saved = await response.json();
      if (contextData.id) {
        setContexts((prev) => prev.map((c) => (c.id === saved.id ? saved : c)));
      } else {
        setContexts((prev) => [...prev, saved]);
      }

      // If setting as default, update other contexts
      if (contextData.is_default) {
        setContexts((prev) =>
          prev.map((c) => ({
            ...c,
            is_default: c.id === saved.id,
          }))
        );
      }
    } else {
      throw new Error('Failed to save context');
    }
  };

  const handleDelete = async (context) => {
    if (!window.confirm(t('context.deleteConfirm', { name: context.name }))) {
      return;
    }

    try {
      const response = await authFetch(`/contexts/${context.id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setContexts((prev) => prev.filter((c) => c.id !== context.id));
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const handleSetDefault = async (context) => {
    try {
      const response = await authFetch(`/contexts/${context.id}/default`, {
        method: 'POST',
      });
      if (response.ok) {
        setContexts((prev) =>
          prev.map((c) => ({
            ...c,
            is_default: c.id === context.id,
          }))
        );
      }
    } catch (err) {
      console.error('Set default error:', err);
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
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-light-soft dark:bg-dark-soft rounded-lg" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-light-soft dark:bg-dark-soft rounded w-1/3" />
                <div className="h-16 bg-light-soft dark:bg-dark-soft rounded" />
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
  if (contexts.length === 0) {
    return (
      <>
        <EmptyState onAdd={handleAdd} />
        {showEditor && (
          <ContextEditorModal
            context={editingContext}
            onSave={handleSave}
            onClose={() => setShowEditor(false)}
          />
        )}
      </>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      {!selectable && (
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-text-primary dark:text-text-dark-primary">
              {t('context.libraryTitle')}
            </h2>
            <p className="text-sm text-text-secondary dark:text-text-dark-secondary">
              {t('context.librarySubtitle', { count: contexts.length })}
            </p>
          </div>
          <button
            onClick={handleAdd}
            className="inline-flex items-center gap-2 px-4 py-2 bg-ion text-white font-medium rounded-button hover:opacity-90 transition-colors"
          >
            <PlusIcon />
            {t('context.addNew')}
          </button>
        </div>
      )}

      {/* Contexts list */}
      <div className="space-y-3">
        {contexts.map((context) => (
          <ContextCard
            key={context.id}
            context={context}
            onEdit={() => handleEdit(context)}
            onDelete={() => handleDelete(context)}
            onSetDefault={() => handleSetDefault(context)}
            onSelect={onSelect}
            selectable={selectable}
          />
        ))}
      </div>

      {/* Editor modal */}
      {showEditor && (
        <ContextEditorModal
          context={editingContext}
          onSave={handleSave}
          onClose={() => setShowEditor(false)}
        />
      )}
    </div>
  );
}
