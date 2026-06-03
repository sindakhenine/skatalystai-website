import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import CustomizationPanel from '../components/CustomizationPanel';

/**
 * PreviewPage - Public read-only app preview with customization support
 *
 * Accessible via /preview/:token (no authentication required)
 * Renders based on preview configuration + user customizations.
 */

// Loading spinner
const LoadingSpinner = ({ size = 'md' }) => {
  const sizes = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-8 w-8', xl: 'h-12 w-12' };
  return (
    <svg className={`animate-spin ${sizes[size]}`} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
};

export default function PreviewPage() {
  const { token } = useParams();
  const [preview, setPreview] = useState(null);
  const [status, setStatus] = useState('loading'); // loading, generating, ready, error, expired
  const [error, setError] = useState(null);
  const [activePage, setActivePage] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');

  // Customization state
  const [editMode, setEditMode] = useState(false);
  const [customizations, setCustomizations] = useState({});
  const [localCustomizations, setLocalCustomizations] = useState({});
  const [saving, setSaving] = useState(false);

  const apiBase = process.env.REACT_APP_API_URL || '';

  // Fetch preview data
  const fetchPreview = useCallback(async () => {
    try {
      const res = await fetch(`${apiBase}/api/preview/${token}`);
      const data = await res.json();

      if (res.status === 404) {
        setStatus('error');
        setError('Preview not found');
        return;
      }

      if (res.status === 410) {
        setStatus('expired');
        return;
      }

      if (data.status === 'generating') {
        setStatus('generating');
        return;
      }

      if (data.status === 'error') {
        setStatus('error');
        setError(data.error || 'Preview generation failed');
        return;
      }

      if (data.status === 'ready') {
        setPreview(data.preview);
        setCustomizations(data.preview.customizations || {});
        setLocalCustomizations(data.preview.customizations || {});
        setStatus('ready');
        // Set first visible page as active
        const pages = data.preview.previewConfig?.pages || [];
        const visiblePages = pages.filter(p =>
          (data.preview.customizations?.pages?.[p.id]?.visible !== false)
        );
        if (visiblePages.length > 0) {
          setActivePage(visiblePages[0]);
        } else if (pages.length > 0) {
          setActivePage(pages[0]);
        }
      }
    } catch (err) {
      setStatus('error');
      setError(err.message);
    }
  }, [token, apiBase]);

  useEffect(() => {
    fetchPreview();
  }, [fetchPreview]);

  // Poll while generating
  useEffect(() => {
    if (status === 'generating') {
      const interval = setInterval(fetchPreview, 2000);
      return () => clearInterval(interval);
    }
  }, [status, fetchPreview]);

  // Merge previewConfig + customizations
  const mergedConfig = useMemo(() => {
    const config = preview?.previewConfig;
    if (!config) return null;

    const activeCustom = editMode ? localCustomizations : customizations;
    const pageCustom = activeCustom.pages || {};
    const widgetCustom = activeCustom.widgets || {};

    // Merge pages
    const mergedPages = (config.pages || [])
      .filter(page => pageCustom[page.id]?.visible !== false)
      .map(page => {
        const pCustom = pageCustom[page.id] || {};
        const widgetOrder = pCustom.widgetOrder || page.widgets?.map(w => w.type) || [];

        // Merge and reorder widgets
        const mergedWidgets = widgetOrder
          .map(wType => page.widgets?.find(w => w.type === wType))
          .filter(Boolean)
          .filter(widget => widgetCustom[widget.type]?.visible !== false)
          .map(widget => {
            const wCustom = widgetCustom[widget.type] || {};
            return {
              ...widget,
              title: wCustom.label || widget.title,
              data: widget.data ? {
                ...widget.data,
                columns: widget.data.columns?.map(col => {
                  const colName = col.name || col;
                  const colLabel = wCustom.columnLabels?.[colName];
                  const visibleCols = wCustom.visibleColumns;

                  // Filter by visibility
                  if (visibleCols && !visibleCols.includes(colName)) {
                    return null;
                  }

                  return colLabel ? { ...col, name: colName, displayName: colLabel } : col;
                }).filter(Boolean)
              } : widget.data
            };
          });

        return {
          ...page,
          name: pCustom.label || page.name,
          widgets: mergedWidgets
        };
      });

    return {
      ...config,
      pages: mergedPages
    };
  }, [preview, customizations, localCustomizations, editMode]);

  // Enter edit mode
  const handleStartEdit = () => {
    setLocalCustomizations({ ...customizations });
    setEditMode(true);
  };

  // Cancel edit mode
  const handleCancelEdit = () => {
    setLocalCustomizations({ ...customizations });
    setEditMode(false);
  };

  // Save customizations
  const handleSaveCustomizations = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${apiBase}/api/preview/${token}/customizations`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customizations: localCustomizations })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save');
      }

      const data = await res.json();
      setCustomizations(data.customizations);
      setEditMode(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Reset customizations
  const handleResetCustomizations = async () => {
    if (!window.confirm('Reset all customizations to defaults?')) return;

    setSaving(true);
    try {
      const res = await fetch(`${apiBase}/api/preview/${token}/customizations`, {
        method: 'DELETE'
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to reset');
      }

      setCustomizations({});
      setLocalCustomizations({});
      setEditMode(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Handle demo chat
  const handleDemoChat = (message) => {
    if (!message.trim()) return;

    setChatMessages(prev => [...prev, { role: 'user', content: message }]);
    setChatInput('');

    const chatWidget = activePage?.widgets?.find(w => w.type === 'chat_demo');
    const responses = chatWidget?.data?.demoResponses || {};

    let response = responses.default;
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('table') || lowerMessage.includes('available')) {
      response = responses.tables;
    } else if (lowerMessage.includes('summary') || lowerMessage.includes('how many') || lowerMessage.includes('count')) {
      response = responses.summary;
    }

    setTimeout(() => {
      setChatMessages(prev => [...prev, { role: 'assistant', content: response }]);
    }, 500);
  };

  // Loading state
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="xl" />
          <p className="mt-4 text-gray-600">Loading preview...</p>
        </div>
      </div>
    );
  }

  // Generating state
  if (status === 'generating') {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="xl" />
          <p className="mt-4 text-gray-600">Generating preview...</p>
          <p className="text-sm text-gray-500 mt-1">This may take a few moments.</p>
        </div>
      </div>
    );
  }

  // Error state
  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4 text-red-600">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Preview Not Available</h1>
          <p className="text-gray-600">{error || 'This preview could not be loaded.'}</p>
        </div>
      </div>
    );
  }

  // Expired state
  if (status === 'expired') {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4 text-yellow-600">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Preview Expired</h1>
          <p className="text-gray-600">This preview has expired and is no longer available.</p>
        </div>
      </div>
    );
  }

  // Ready state - render preview
  const pages = mergedConfig?.pages || [];

  // Update active page when customizations change
  const currentActivePage = pages.find(p => p.id === activePage?.id) || pages[0];

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Main Preview Area */}
      <div className="flex-1 flex flex-col">
        {/* Disclaimer Banner */}
        <div className={`text-white px-4 py-2 text-center ${editMode ? 'bg-indigo-600' : 'bg-orange-500'}`}>
          <div className="flex items-center justify-center gap-2">
            {editMode ? (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                <span className="font-medium">Customization Mode</span>
                <span className="hidden sm:inline">- Changes are previewed live</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span className="font-medium">Preview Mode</span>
                <span className="hidden sm:inline">- This is a read-only preview, not production</span>
              </>
            )}
          </div>
        </div>

        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {mergedConfig?.runName || 'App Preview'}
              </h1>
              <p className="text-sm text-gray-500">
                {mergedConfig?.appTypes?.join(', ')} preview
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-500">
                Expires: {preview?.expiresAt ? new Date(preview.expiresAt).toLocaleDateString() : '-'}
              </div>
              {!editMode && (
                <button
                  onClick={handleStartEdit}
                  className="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 inline-flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  Edit
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Navigation */}
        {pages.length > 1 && (
          <nav className="bg-white border-b border-gray-200 px-6">
            <div className="max-w-7xl mx-auto flex gap-1 overflow-x-auto">
              {pages.map(page => (
                <button
                  key={page.id}
                  onClick={() => setActivePage(page)}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    currentActivePage?.id === page.id
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {page.name}
                </button>
              ))}
            </div>
          </nav>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto px-6 py-8">
            {!currentActivePage && (
              <div className="text-center py-12 text-gray-500">
                No pages available in this preview.
              </div>
            )}

            {/* Dashboard Page */}
            {currentActivePage?.type === 'dashboard' && (
              <div className="space-y-6">
                {currentActivePage.widgets?.map((widget, i) => (
                  <div key={i}>
                    {/* Stats Widget */}
                    {widget.type === 'stats' && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white rounded-xl p-6 border border-gray-200">
                          <p className="text-sm text-gray-500">Tables</p>
                          <p className="text-3xl font-bold text-gray-900">{widget.data?.tables || 0}</p>
                        </div>
                        <div className="bg-white rounded-xl p-6 border border-gray-200">
                          <p className="text-sm text-gray-500">Sample Rows</p>
                          <p className="text-3xl font-bold text-gray-900">{widget.data?.rows || 0}</p>
                        </div>
                      </div>
                    )}

                    {/* Table Preview Widget */}
                    {widget.type === 'table_preview' && (
                      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                          <h3 className="font-semibold text-gray-900">{widget.title}</h3>
                          <span className="text-sm text-gray-500">
                            {widget.data?.totalRows || 0} total rows
                          </span>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead className="bg-gray-50">
                              <tr>
                                {widget.data?.columns?.slice(0, 6).map((col, j) => (
                                  <th key={j} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    {col.displayName || col.name || col}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {widget.data?.rows?.slice(0, 5).map((row, j) => (
                                <tr key={j}>
                                  {widget.data?.columns?.slice(0, 6).map((col, k) => (
                                    <td key={k} className="px-4 py-3 text-gray-700 truncate max-w-xs">
                                      {String(row[col.name || col] ?? '-')}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        {(widget.data?.rows?.length || 0) > 5 && (
                          <div className="px-6 py-3 bg-gray-50 text-sm text-gray-500 text-center">
                            Showing 5 of {widget.data?.totalRows || widget.data?.rows?.length} rows
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* CRUD Page */}
            {currentActivePage?.type === 'crud' && (
              <div>
                {currentActivePage.widgets?.map((widget, i) => (
                  <div key={i}>
                    {widget.type === 'data_table' && (
                      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-semibold text-gray-900">{widget.title}</h3>
                              <p className="text-sm text-gray-500">
                                Source: {widget.data?.source || 'Unknown'}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                                Read-only
                              </span>
                              <span className="text-sm text-gray-500">
                                {widget.data?.totalRows || 0} rows
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead className="bg-gray-50">
                              <tr>
                                {widget.data?.columns?.map((col, j) => (
                                  <th key={j} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    {col.displayName || col.name || col}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {widget.data?.rows?.map((row, j) => (
                                <tr key={j} className="hover:bg-gray-50">
                                  {widget.data?.columns?.map((col, k) => (
                                    <td key={k} className="px-4 py-3 text-gray-700 truncate max-w-xs">
                                      {String(row[col.name || col] ?? '-')}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        {(widget.data?.rows?.length || 0) === 0 && (
                          <div className="px-6 py-12 text-center text-gray-500">
                            No data available
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Chatbot Page */}
            {currentActivePage?.type === 'chatbot' && (
              <div className="max-w-2xl mx-auto">
                {currentActivePage.widgets?.map((widget, i) => (
                  <div key={i}>
                    {widget.type === 'chat_demo' && (
                      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        {/* Chat Header */}
                        <div className="px-6 py-4 border-b border-gray-200 bg-indigo-50">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white">
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                              </svg>
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">{widget.title}</h3>
                              <div className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                                <span className="text-xs text-gray-500">Demo Mode - Static Responses</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Chat Messages */}
                        <div className="h-96 overflow-y-auto p-6 space-y-4 bg-gray-50">
                          {/* Welcome message */}
                          <div className="flex gap-3">
                            <div className="w-8 h-8 bg-indigo-600 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs">
                              AI
                            </div>
                            <div className="bg-white rounded-lg p-3 max-w-sm shadow-sm">
                              <p className="text-sm text-gray-700">{widget.data?.welcomeMessage}</p>
                            </div>
                          </div>

                          {/* Sample questions */}
                          {chatMessages.length === 0 && widget.data?.sampleQuestions && (
                            <div className="flex flex-wrap gap-2 ml-11">
                              {widget.data.sampleQuestions.map((q, j) => (
                                <button
                                  key={j}
                                  onClick={() => handleDemoChat(q)}
                                  className="px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-full text-gray-600 hover:bg-gray-50"
                                >
                                  {q}
                                </button>
                              ))}
                            </div>
                          )}

                          {/* Chat history */}
                          {chatMessages.map((msg, j) => (
                            <div key={j} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                              {msg.role === 'assistant' && (
                                <div className="w-8 h-8 bg-indigo-600 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs">
                                  AI
                                </div>
                              )}
                              <div className={`rounded-lg p-3 max-w-sm ${
                                msg.role === 'user'
                                  ? 'bg-indigo-600 text-white'
                                  : 'bg-white shadow-sm'
                              }`}>
                                <p className={`text-sm ${msg.role === 'user' ? 'text-white' : 'text-gray-700'}`}>
                                  {msg.content}
                                </p>
                              </div>
                              {msg.role === 'user' && (
                                <div className="w-8 h-8 bg-gray-300 rounded-full flex-shrink-0 flex items-center justify-center text-gray-600 text-xs">
                                  You
                                </div>
                              )}
                            </div>
                          ))}
                        </div>

                        {/* Chat Input */}
                        <div className="px-6 py-4 border-t border-gray-200 bg-white">
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={chatInput}
                              onChange={(e) => setChatInput(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && handleDemoChat(chatInput)}
                              placeholder="Type a message (demo mode)..."
                              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                            <button
                              onClick={() => handleDemoChat(chatInput)}
                              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                            >
                              Send
                            </button>
                          </div>
                          <p className="text-xs text-gray-500 mt-2 text-center">
                            This is a demo chatbot with pre-generated responses. Full functionality available in production.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 px-6 py-4">
          <div className="max-w-7xl mx-auto text-center text-sm text-gray-500">
            <p>Generated by Skatalyst - Preview expires {preview?.expiresAt ? new Date(preview.expiresAt).toLocaleDateString() : 'soon'}</p>
          </div>
        </footer>
      </div>

      {/* Customization Panel (shown in edit mode) */}
      {editMode && (
        <CustomizationPanel
          previewConfig={preview?.previewConfig}
          customizations={localCustomizations}
          onChange={setLocalCustomizations}
          onSave={handleSaveCustomizations}
          onCancel={handleCancelEdit}
          onReset={handleResetCustomizations}
          saving={saving}
        />
      )}
    </div>
  );
}
