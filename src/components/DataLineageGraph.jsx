import React, { useState } from 'react';

/**
 * DataLineageGraph Component - Phase G
 *
 * Visualizes data flow: Sources → Tables → KPIs → Widgets
 * Pure CSS/Tailwind implementation (no external charting library)
 */
export default function DataLineageGraph({ lineage = [], kpis = [] }) {
  const [selectedNode, setSelectedNode] = useState(null);
  const [hoveredPath, setHoveredPath] = useState(null);

  // If no lineage data, show empty state
  if (lineage.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        <p>No data lineage available yet.</p>
        <p className="text-sm mt-1">Lineage will appear after KPIs are defined.</p>
      </div>
    );
  }

  // Build visualization layers
  const layers = {
    sources: [],
    tables: [],
    kpis: [],
    widgets: []
  };

  // Extract unique items for each layer
  const sourceSet = new Set();
  const tableSet = new Set();
  const kpiSet = new Set();
  const widgetSet = new Set();

  lineage.forEach((item, lineageIdx) => {
    // Sources
    item.sources?.forEach((source, idx) => {
      const key = source.name || `source-${lineageIdx}-${idx}`;
      if (!sourceSet.has(key)) {
        sourceSet.add(key);
        layers.sources.push({
          id: key,
          name: source.name || 'Unknown Source',
          type: source.type || 'file',
          connectedTo: [item.table.name]
        });
      } else {
        // Add connection to existing source
        const existing = layers.sources.find(s => s.id === key);
        if (existing && !existing.connectedTo.includes(item.table.name)) {
          existing.connectedTo.push(item.table.name);
        }
      }
    });

    // Tables
    if (!tableSet.has(item.table.name)) {
      tableSet.add(item.table.name);
      layers.tables.push({
        id: item.table.name,
        name: item.table.name,
        columns: item.table.columns || [],
        connectedTo: item.kpis?.map(k => k.id) || []
      });
    }

    // KPIs
    item.kpis?.forEach(kpi => {
      if (!kpiSet.has(kpi.id)) {
        kpiSet.add(kpi.id);
        const widgetConnections = item.widgets?.map(w => w.page) || [];
        layers.kpis.push({
          id: kpi.id,
          name: kpi.name,
          formula: kpi.formula,
          connectedTo: widgetConnections
        });
      }
    });

    // Widgets
    item.widgets?.forEach(widget => {
      if (!widgetSet.has(widget.page)) {
        widgetSet.add(widget.page);
        layers.widgets.push({
          id: widget.page,
          name: widget.page,
          kpis: widget.kpis || []
        });
      }
    });
  });

  // If still no data in layers, add fallback
  if (layers.tables.length === 0 && kpis.length > 0) {
    // Use KPIs directly if no table mapping
    kpis.forEach(kpi => {
      layers.kpis.push({
        id: kpi.id,
        name: kpi.name,
        formula: kpi.formula,
        connectedTo: []
      });
    });
  }

  const isHighlighted = (layerType, nodeId) => {
    if (!hoveredPath) return false;
    return hoveredPath[layerType]?.includes(nodeId);
  };

  const handleNodeHover = (layerType, node) => {
    // Build connected path
    const path = { sources: [], tables: [], kpis: [], widgets: [] };

    if (layerType === 'sources') {
      path.sources = [node.id];
      path.tables = node.connectedTo || [];
      // Find KPIs connected to these tables
      layers.tables.filter(t => path.tables.includes(t.id)).forEach(t => {
        path.kpis.push(...(t.connectedTo || []));
      });
      // Find widgets connected to these KPIs
      layers.kpis.filter(k => path.kpis.includes(k.id)).forEach(k => {
        path.widgets.push(...(k.connectedTo || []));
      });
    } else if (layerType === 'tables') {
      path.tables = [node.id];
      // Find sources that connect to this table
      path.sources = layers.sources.filter(s => s.connectedTo?.includes(node.id)).map(s => s.id);
      path.kpis = node.connectedTo || [];
      layers.kpis.filter(k => path.kpis.includes(k.id)).forEach(k => {
        path.widgets.push(...(k.connectedTo || []));
      });
    } else if (layerType === 'kpis') {
      path.kpis = [node.id];
      path.widgets = node.connectedTo || [];
      // Find tables that connect to this KPI
      path.tables = layers.tables.filter(t => t.connectedTo?.includes(node.id)).map(t => t.id);
      // Find sources that connect to these tables
      layers.sources.filter(s => path.tables.some(t => s.connectedTo?.includes(t))).forEach(s => {
        path.sources.push(s.id);
      });
    } else if (layerType === 'widgets') {
      path.widgets = [node.id];
      // Find KPIs that connect to this widget
      path.kpis = layers.kpis.filter(k => k.connectedTo?.includes(node.id)).map(k => k.id);
      // Find tables that connect to these KPIs
      path.tables = layers.tables.filter(t => path.kpis.some(k => t.connectedTo?.includes(k))).map(t => t.id);
      // Find sources
      layers.sources.filter(s => path.tables.some(t => s.connectedTo?.includes(t))).forEach(s => {
        path.sources.push(s.id);
      });
    }

    setHoveredPath(path);
  };

  return (
    <div className="space-y-4">
      {/* Legend */}
      <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-blue-500"></div>
          <span>Sources</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-indigo-500"></div>
          <span>Tables</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-green-500"></div>
          <span>KPIs</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-purple-500"></div>
          <span>Widgets</span>
        </div>
      </div>

      {/* Lineage Flow */}
      <div className="relative overflow-x-auto">
        <div className="flex items-start justify-between min-w-[800px] gap-4 py-6">
          {/* Sources Column */}
          <div className="flex-1 min-w-[180px]">
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 text-center">
              Data Sources
            </h4>
            <div className="space-y-2">
              {layers.sources.length > 0 ? (
                layers.sources.slice(0, 6).map((source) => (
                  <LineageNode
                    key={source.id}
                    node={source}
                    color="blue"
                    icon={<SourceIcon type={source.type} />}
                    highlighted={isHighlighted('sources', source.id)}
                    selected={selectedNode?.id === source.id}
                    onClick={() => setSelectedNode(selectedNode?.id === source.id ? null : source)}
                    onMouseEnter={() => handleNodeHover('sources', source)}
                    onMouseLeave={() => setHoveredPath(null)}
                  />
                ))
              ) : (
                <EmptyNode label="No sources" />
              )}
              {layers.sources.length > 6 && (
                <p className="text-xs text-gray-400 text-center">+{layers.sources.length - 6} more</p>
              )}
            </div>
          </div>

          {/* Arrow */}
          <Arrow />

          {/* Tables Column */}
          <div className="flex-1 min-w-[180px]">
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 text-center">
              Tables
            </h4>
            <div className="space-y-2">
              {layers.tables.length > 0 ? (
                layers.tables.slice(0, 6).map((table) => (
                  <LineageNode
                    key={table.id}
                    node={table}
                    color="indigo"
                    icon={<TableIcon />}
                    subtitle={`${table.columns?.length || 0} columns`}
                    highlighted={isHighlighted('tables', table.id)}
                    selected={selectedNode?.id === table.id}
                    onClick={() => setSelectedNode(selectedNode?.id === table.id ? null : table)}
                    onMouseEnter={() => handleNodeHover('tables', table)}
                    onMouseLeave={() => setHoveredPath(null)}
                  />
                ))
              ) : (
                <EmptyNode label="No tables" />
              )}
              {layers.tables.length > 6 && (
                <p className="text-xs text-gray-400 text-center">+{layers.tables.length - 6} more</p>
              )}
            </div>
          </div>

          {/* Arrow */}
          <Arrow />

          {/* KPIs Column */}
          <div className="flex-1 min-w-[180px]">
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 text-center">
              KPIs
            </h4>
            <div className="space-y-2">
              {layers.kpis.length > 0 ? (
                layers.kpis.slice(0, 6).map((kpi) => (
                  <LineageNode
                    key={kpi.id}
                    node={kpi}
                    color="green"
                    icon={<KPIIcon />}
                    highlighted={isHighlighted('kpis', kpi.id)}
                    selected={selectedNode?.id === kpi.id}
                    onClick={() => setSelectedNode(selectedNode?.id === kpi.id ? null : kpi)}
                    onMouseEnter={() => handleNodeHover('kpis', kpi)}
                    onMouseLeave={() => setHoveredPath(null)}
                  />
                ))
              ) : (
                <EmptyNode label="No KPIs" />
              )}
              {layers.kpis.length > 6 && (
                <p className="text-xs text-gray-400 text-center">+{layers.kpis.length - 6} more</p>
              )}
            </div>
          </div>

          {/* Arrow */}
          <Arrow />

          {/* Widgets Column */}
          <div className="flex-1 min-w-[180px]">
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 text-center">
              Dashboard Widgets
            </h4>
            <div className="space-y-2">
              {layers.widgets.length > 0 ? (
                layers.widgets.slice(0, 6).map((widget) => (
                  <LineageNode
                    key={widget.id}
                    node={widget}
                    color="purple"
                    icon={<WidgetIcon />}
                    subtitle={widget.kpis?.length ? `${widget.kpis.length} KPIs` : null}
                    highlighted={isHighlighted('widgets', widget.id)}
                    selected={selectedNode?.id === widget.id}
                    onClick={() => setSelectedNode(selectedNode?.id === widget.id ? null : widget)}
                    onMouseEnter={() => handleNodeHover('widgets', widget)}
                    onMouseLeave={() => setHoveredPath(null)}
                  />
                ))
              ) : (
                <EmptyNode label="No widgets" />
              )}
              {layers.widgets.length > 6 && (
                <p className="text-xs text-gray-400 text-center">+{layers.widgets.length - 6} more</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Selected Node Detail Panel */}
      {selectedNode && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-medium text-gray-900">{selectedNode.name}</h4>
              {selectedNode.formula && (
                <p className="text-sm text-gray-600 mt-1">
                  Formula: <code className="bg-gray-200 px-2 py-0.5 rounded text-xs">{selectedNode.formula}</code>
                </p>
              )}
              {selectedNode.columns && selectedNode.columns.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm text-gray-500">Columns:</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedNode.columns.slice(0, 10).map((col, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded text-xs">
                        {col}
                      </span>
                    ))}
                    {selectedNode.columns.length > 10 && (
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-xs">
                        +{selectedNode.columns.length - 10} more
                      </span>
                    )}
                  </div>
                </div>
              )}
              {selectedNode.kpis && selectedNode.kpis.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm text-gray-500">Displays KPIs:</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedNode.kpis.map((kpi, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">
                        {kpi}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={() => setSelectedNode(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Lineage Node Component
function LineageNode({ node, color, icon, subtitle, highlighted, selected, onClick, onMouseEnter, onMouseLeave }) {
  const colors = {
    blue: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      ring: 'ring-blue-500',
      highlight: 'bg-blue-100 border-blue-400',
      iconBg: 'bg-blue-100',
      iconText: 'text-blue-600'
    },
    indigo: {
      bg: 'bg-indigo-50',
      border: 'border-indigo-200',
      ring: 'ring-indigo-500',
      highlight: 'bg-indigo-100 border-indigo-400',
      iconBg: 'bg-indigo-100',
      iconText: 'text-indigo-600'
    },
    green: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      ring: 'ring-green-500',
      highlight: 'bg-green-100 border-green-400',
      iconBg: 'bg-green-100',
      iconText: 'text-green-600'
    },
    purple: {
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      ring: 'ring-purple-500',
      highlight: 'bg-purple-100 border-purple-400',
      iconBg: 'bg-purple-100',
      iconText: 'text-purple-600'
    }
  };

  const c = colors[color];

  return (
    <button
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`w-full p-3 rounded-lg border transition-all ${
        selected
          ? `${c.highlight} ring-2 ${c.ring}`
          : highlighted
          ? c.highlight
          : `${c.bg} ${c.border} hover:${c.highlight}`
      }`}
    >
      <div className="flex items-center gap-2">
        <div className={`w-7 h-7 rounded flex items-center justify-center ${c.iconBg} ${c.iconText}`}>
          {icon}
        </div>
        <div className="text-left flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{node.name}</p>
          {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        </div>
      </div>
    </button>
  );
}

// Empty Node Placeholder
function EmptyNode({ label }) {
  return (
    <div className="p-3 rounded-lg border border-dashed border-gray-300 bg-gray-50">
      <p className="text-sm text-gray-400 text-center">{label}</p>
    </div>
  );
}

// Arrow Between Columns
function Arrow() {
  return (
    <div className="flex items-center justify-center px-2 pt-8">
      <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
      </svg>
    </div>
  );
}

// Icons
function SourceIcon({ type }) {
  if (type === 'database' || type === 'table') {
    return (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
      </svg>
    );
  }
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

function TableIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  );
}

function KPIIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );
}

function WidgetIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
    </svg>
  );
}
