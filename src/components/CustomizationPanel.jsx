import React, { useState, useEffect } from 'react';

/**
 * CustomizationPanel - Side panel for preview customization
 *
 * Allows editing:
 * - Page labels and visibility
 * - Widget labels and visibility
 * - Column labels and visibility
 * - KPI selection (dashboard)
 * - Reordering via up/down buttons
 */

// Icons
const ChevronUpIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

const EyeIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const EyeOffIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
  </svg>
);

const PencilIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
  </svg>
);

export default function CustomizationPanel({
  previewConfig,
  customizations,
  onChange,
  onSave,
  onCancel,
  onReset,
  saving
}) {
  const [activeSection, setActiveSection] = useState('pages');
  const [editingLabel, setEditingLabel] = useState(null);
  const [labelValue, setLabelValue] = useState('');

  // Get pages from config
  const pages = previewConfig?.pages || [];

  // Get current page/widget customizations
  const pageCustomizations = customizations.pages || {};
  const widgetCustomizations = customizations.widgets || {};
  const globalSettings = customizations.globalSettings || {};

  // Helper: Get customized label or default
  const getPageLabel = (page) => {
    return pageCustomizations[page.id]?.label || page.name;
  };

  const getWidgetLabel = (widget) => {
    return widgetCustomizations[widget.type]?.label || widget.title;
  };

  const isPageVisible = (page) => {
    return pageCustomizations[page.id]?.visible !== false;
  };

  const isWidgetVisible = (widget) => {
    return widgetCustomizations[widget.type]?.visible !== false;
  };

  // Helper: Get widget order for a page
  const getWidgetOrder = (page) => {
    const order = pageCustomizations[page.id]?.widgetOrder;
    if (order) return order;
    return page.widgets?.map(w => w.type) || [];
  };

  // Handler: Toggle page visibility
  const togglePageVisibility = (pageId) => {
    const current = pageCustomizations[pageId]?.visible !== false;
    onChange({
      ...customizations,
      pages: {
        ...pageCustomizations,
        [pageId]: {
          ...pageCustomizations[pageId],
          visible: !current
        }
      }
    });
  };

  // Handler: Toggle widget visibility
  const toggleWidgetVisibility = (widgetType) => {
    const current = widgetCustomizations[widgetType]?.visible !== false;
    onChange({
      ...customizations,
      widgets: {
        ...widgetCustomizations,
        [widgetType]: {
          ...widgetCustomizations[widgetType],
          visible: !current
        }
      }
    });
  };

  // Handler: Start editing label
  const startEditingLabel = (type, id, currentValue) => {
    setEditingLabel({ type, id });
    setLabelValue(currentValue);
  };

  // Handler: Save label
  const saveLabel = () => {
    if (!editingLabel) return;

    if (editingLabel.type === 'page') {
      onChange({
        ...customizations,
        pages: {
          ...pageCustomizations,
          [editingLabel.id]: {
            ...pageCustomizations[editingLabel.id],
            label: labelValue
          }
        }
      });
    } else if (editingLabel.type === 'widget') {
      onChange({
        ...customizations,
        widgets: {
          ...widgetCustomizations,
          [editingLabel.id]: {
            ...widgetCustomizations[editingLabel.id],
            label: labelValue
          }
        }
      });
    }

    setEditingLabel(null);
    setLabelValue('');
  };

  // Handler: Move widget up/down
  const moveWidget = (pageId, widgetType, direction) => {
    const page = pages.find(p => p.id === pageId);
    if (!page) return;

    const order = getWidgetOrder(page);
    const index = order.indexOf(widgetType);
    if (index === -1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= order.length) return;

    const newOrder = [...order];
    [newOrder[index], newOrder[newIndex]] = [newOrder[newIndex], newOrder[index]];

    onChange({
      ...customizations,
      pages: {
        ...pageCustomizations,
        [pageId]: {
          ...pageCustomizations[pageId],
          widgetOrder: newOrder
        }
      }
    });
  };

  // Handler: Toggle column visibility
  const toggleColumnVisibility = (widgetType, columnName) => {
    const currentColumns = widgetCustomizations[widgetType]?.visibleColumns;
    let newColumns;

    if (currentColumns) {
      if (currentColumns.includes(columnName)) {
        newColumns = currentColumns.filter(c => c !== columnName);
      } else {
        newColumns = [...currentColumns, columnName];
      }
    } else {
      // First toggle - hide this column
      const widget = pages.flatMap(p => p.widgets || []).find(w => w.type === widgetType);
      const allColumns = widget?.data?.columns?.map(c => c.name || c) || [];
      newColumns = allColumns.filter(c => c !== columnName);
    }

    onChange({
      ...customizations,
      widgets: {
        ...widgetCustomizations,
        [widgetType]: {
          ...widgetCustomizations[widgetType],
          visibleColumns: newColumns
        }
      }
    });
  };

  // Handler: Update column label
  const updateColumnLabel = (widgetType, columnName, newLabel) => {
    const currentLabels = widgetCustomizations[widgetType]?.columnLabels || {};
    onChange({
      ...customizations,
      widgets: {
        ...widgetCustomizations,
        [widgetType]: {
          ...widgetCustomizations[widgetType],
          columnLabels: {
            ...currentLabels,
            [columnName]: newLabel
          }
        }
      }
    });
  };

  // Get all widgets across pages
  const allWidgets = pages.flatMap(p => (p.widgets || []).map(w => ({ ...w, pageId: p.id, pageName: p.name })));

  // Get table widgets for column editing
  const tableWidgets = allWidgets.filter(w => w.type === 'data_table' || w.type === 'table_preview');

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <h3 className="font-semibold text-gray-900">Customize Preview</h3>
        <p className="text-xs text-gray-500 mt-1">Edit labels, visibility, and layout</p>
      </div>

      {/* Section Tabs */}
      <div className="flex border-b border-gray-200">
        {[
          { id: 'pages', label: 'Pages' },
          { id: 'widgets', label: 'Widgets' },
          { id: 'columns', label: 'Columns' },
        ].map(section => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`flex-1 px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeSection === section.id
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {section.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Pages Section */}
        {activeSection === 'pages' && (
          <div className="space-y-2">
            {pages.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">No pages available</p>
            )}
            {pages.map((page, index) => (
              <div
                key={page.id}
                className={`p-3 rounded-lg border ${
                  isPageVisible(page) ? 'border-gray-200 bg-white' : 'border-gray-100 bg-gray-50 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between">
                  {editingLabel?.type === 'page' && editingLabel?.id === page.id ? (
                    <input
                      type="text"
                      value={labelValue}
                      onChange={(e) => setLabelValue(e.target.value)}
                      onBlur={saveLabel}
                      onKeyDown={(e) => e.key === 'Enter' && saveLabel()}
                      className="flex-1 px-2 py-1 text-sm border border-indigo-300 rounded focus:ring-1 focus:ring-indigo-500"
                      autoFocus
                    />
                  ) : (
                    <span className="text-sm font-medium text-gray-900">{getPageLabel(page)}</span>
                  )}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => startEditingLabel('page', page.id, getPageLabel(page))}
                      className="p-1 text-gray-400 hover:text-gray-600"
                      title="Edit label"
                    >
                      <PencilIcon />
                    </button>
                    <button
                      onClick={() => togglePageVisibility(page.id)}
                      className={`p-1 ${isPageVisible(page) ? 'text-gray-400 hover:text-gray-600' : 'text-red-400 hover:text-red-600'}`}
                      title={isPageVisible(page) ? 'Hide page' : 'Show page'}
                    >
                      {isPageVisible(page) ? <EyeIcon /> : <EyeOffIcon />}
                    </button>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {page.type} - {page.widgets?.length || 0} widgets
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Widgets Section */}
        {activeSection === 'widgets' && (
          <div className="space-y-4">
            {pages.map(page => (
              <div key={page.id}>
                <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">{getPageLabel(page)}</h4>
                <div className="space-y-2">
                  {(page.widgets || []).length === 0 && (
                    <p className="text-xs text-gray-400">No widgets</p>
                  )}
                  {getWidgetOrder(page).map((widgetType, index) => {
                    const widget = page.widgets?.find(w => w.type === widgetType);
                    if (!widget) return null;

                    return (
                      <div
                        key={widgetType}
                        className={`p-3 rounded-lg border ${
                          isWidgetVisible(widget) ? 'border-gray-200 bg-white' : 'border-gray-100 bg-gray-50 opacity-60'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          {editingLabel?.type === 'widget' && editingLabel?.id === widgetType ? (
                            <input
                              type="text"
                              value={labelValue}
                              onChange={(e) => setLabelValue(e.target.value)}
                              onBlur={saveLabel}
                              onKeyDown={(e) => e.key === 'Enter' && saveLabel()}
                              className="flex-1 px-2 py-1 text-sm border border-indigo-300 rounded focus:ring-1 focus:ring-indigo-500"
                              autoFocus
                            />
                          ) : (
                            <span className="text-sm font-medium text-gray-900">{getWidgetLabel(widget)}</span>
                          )}
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => moveWidget(page.id, widgetType, 'up')}
                              disabled={index === 0}
                              className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                              title="Move up"
                            >
                              <ChevronUpIcon />
                            </button>
                            <button
                              onClick={() => moveWidget(page.id, widgetType, 'down')}
                              disabled={index === getWidgetOrder(page).length - 1}
                              className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                              title="Move down"
                            >
                              <ChevronDownIcon />
                            </button>
                            <button
                              onClick={() => startEditingLabel('widget', widgetType, getWidgetLabel(widget))}
                              className="p-1 text-gray-400 hover:text-gray-600"
                              title="Edit label"
                            >
                              <PencilIcon />
                            </button>
                            <button
                              onClick={() => toggleWidgetVisibility(widgetType)}
                              className={`p-1 ${isWidgetVisible(widget) ? 'text-gray-400 hover:text-gray-600' : 'text-red-400 hover:text-red-600'}`}
                              title={isWidgetVisible(widget) ? 'Hide widget' : 'Show widget'}
                            >
                              {isWidgetVisible(widget) ? <EyeIcon /> : <EyeOffIcon />}
                            </button>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{widget.type}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Columns Section */}
        {activeSection === 'columns' && (
          <div className="space-y-4">
            {tableWidgets.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">No table widgets available</p>
            )}
            {tableWidgets.map(widget => {
              const columns = widget.data?.columns || [];
              const visibleColumns = widgetCustomizations[widget.type]?.visibleColumns;
              const columnLabels = widgetCustomizations[widget.type]?.columnLabels || {};

              return (
                <div key={widget.type}>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                    {getWidgetLabel(widget)}
                  </h4>
                  <div className="space-y-1">
                    {columns.map(col => {
                      const columnName = col.name || col;
                      const isVisible = !visibleColumns || visibleColumns.includes(columnName);
                      const customLabel = columnLabels[columnName];

                      return (
                        <div
                          key={columnName}
                          className={`flex items-center justify-between p-2 rounded ${
                            isVisible ? 'bg-white' : 'bg-gray-50 opacity-60'
                          }`}
                        >
                          <div className="flex-1 min-w-0">
                            <input
                              type="text"
                              value={customLabel || columnName}
                              onChange={(e) => updateColumnLabel(widget.type, columnName, e.target.value)}
                              className="w-full px-2 py-1 text-sm border border-gray-200 rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                              placeholder={columnName}
                            />
                            {customLabel && customLabel !== columnName && (
                              <p className="text-xs text-gray-400 mt-0.5 truncate">Original: {columnName}</p>
                            )}
                          </div>
                          <button
                            onClick={() => toggleColumnVisibility(widget.type, columnName)}
                            className={`ml-2 p-1 ${isVisible ? 'text-gray-400 hover:text-gray-600' : 'text-red-400 hover:text-red-600'}`}
                            title={isVisible ? 'Hide column' : 'Show column'}
                          >
                            {isVisible ? <EyeIcon /> : <EyeOffIcon />}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-gray-200 bg-gray-50 space-y-2">
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            disabled={saving}
            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={saving}
            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
        <button
          onClick={onReset}
          disabled={saving}
          className="w-full px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 disabled:opacity-50"
        >
          Reset to Defaults
        </button>
      </div>
    </div>
  );
}
