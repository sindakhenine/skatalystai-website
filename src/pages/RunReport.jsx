import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useQuota } from '../hooks/useQuota';
import PaywallModal from '../components/PaywallModal';
import RerunDropdown from '../components/RerunDropdown';

// Icons
const ChartIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
  </svg>
);

const DownloadIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
);

const CopyIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);

const QuestionIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const DocumentIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const AlertIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

const FolderIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
    <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
  </svg>
);

const FileIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const LockIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

const CodeIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
  </svg>
);

const ChartBarIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const SyncIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

const ChatIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);

const ReportIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const DatabaseIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
  </svg>
);

const FolderOpenIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
  </svg>
);

const GridIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
  </svg>
);

// Color palette for charts
const CHART_COLORS = [
  '#6366f1', // indigo (ion)
  '#22c55e', // green (success)
  '#3b82f6', // blue (info)
  '#64748b', // slate
  '#f59e0b', // amber (warning)
  '#ef4444', // red (error)
  '#a855f7', // purple
  '#94a3b8', // gray
];

// Confidence badge component
function ConfidenceBadge({ score, t }) {
  const percentage = Math.round(score * 100);
  let colorClass = 'bg-success-bg text-success';
  let label = t('report.confidence.high');

  if (percentage < 60) {
    colorClass = 'bg-error-bg text-error';
    label = t('report.confidence.low');
  } else if (percentage < 80) {
    colorClass = 'bg-warning-bg text-warning';
    label = t('report.confidence.medium');
  }

  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${colorClass}`} title={label}>
      {percentage}%
    </span>
  );
}

// Theme distribution chart (simple bar chart)
function ThemeDistributionChart({ categories, t }) {
  const totalFiles = categories.reduce((sum, cat) => sum + cat.fileCount, 0);
  const maxCount = Math.max(...categories.map(c => c.fileCount));

  return (
    <div className="bg-light-surface dark:bg-dark-surface rounded-xl border border-light-border dark:border-dark-border p-6">
      <div className="flex items-center gap-2 mb-4">
        <ChartIcon />
        <h3 className="font-semibold text-text-primary dark:text-text-dark-primary">
          {t('report.chart.title')}
        </h3>
      </div>
      <div className="space-y-3">
        {categories.slice(0, 6).map((category, index) => {
          const percentage = ((category.fileCount / totalFiles) * 100).toFixed(1);
          const barWidth = (category.fileCount / maxCount) * 100;

          return (
            <div key={category.name} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-primary dark:text-text-dark-primary truncate max-w-[60%]">
                  {category.name}
                </span>
                <span className="text-text-secondary dark:text-text-dark-secondary">
                  {category.fileCount} ({percentage}%)
                </span>
              </div>
              <div className="h-2 bg-light-soft dark:bg-dark-soft rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${barWidth}%`,
                    backgroundColor: CHART_COLORS[index % CHART_COLORS.length],
                  }}
                />
              </div>
            </div>
          );
        })}
        {categories.length > 6 && (
          <p className="text-xs text-text-secondary dark:text-text-dark-secondary text-center mt-2">
            {t('report.chart.andMore', { count: categories.length - 6 })}
          </p>
        )}
      </div>
    </div>
  );
}

// Category card
function CategoryCard({ category, index, t }) {
  const sampleFiles = category.sampleFiles || ['document.pdf', 'report.xlsx', 'data.csv'];

  return (
    <div
      className="p-4 rounded-xl border bg-light-surface dark:bg-dark-surface border-light-border dark:border-dark-border hover:shadow-md transition-shadow"
      style={{ borderLeftColor: CHART_COLORS[index % CHART_COLORS.length], borderLeftWidth: '4px' }}
    >
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-medium text-text-primary dark:text-text-dark-primary truncate">
          {category.name}
        </h4>
        <ConfidenceBadge score={category.confidence} t={t} />
      </div>
      <p className="text-2xl font-bold text-text-primary dark:text-text-dark-primary">
        {category.fileCount}
      </p>
      <p className="text-sm text-text-secondary dark:text-text-dark-secondary mb-2">
        {t('report.themes.files')}
      </p>
      <div className="mt-3 pt-3 border-t border-light-border dark:border-dark-border">
        <p className="text-xs text-text-secondary dark:text-text-dark-secondary mb-1">
          {t('report.themes.samples')}
        </p>
        <div className="space-y-1">
          {sampleFiles.slice(0, 3).map((file, i) => (
            <p key={i} className="text-xs text-text-primary dark:text-text-dark-primary truncate font-mono">
              {file}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}

// Schema preview component
function SchemaPreview({ onGenerate, locked, t }) {
  const [copied, setCopied] = useState(false);

  const previewSchema = `-- Auto-generated schema preview
CREATE TABLE financial_reports (
  id UUID PRIMARY KEY,
  title VARCHAR(255),
  date DATE,
  category VARCHAR(100),
  content TEXT,
  metadata JSONB
);

CREATE TABLE customer_data (
  id UUID PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255),
  ...
);

-- More tables based on detected themes...`;

  const handleCopy = () => {
    navigator.clipboard.writeText(previewSchema);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-light-surface dark:bg-dark-surface rounded-xl border border-light-border dark:border-dark-border overflow-hidden">
      <div className="p-4 border-b border-light-border dark:border-dark-border flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-text-primary dark:text-text-dark-primary">
            {t('report.proposals.sql.title')}
          </h3>
          <p className="text-sm text-text-secondary dark:text-text-dark-secondary">
            {t('report.proposals.sql.description')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="p-2 text-text-secondary hover:text-text-primary dark:text-text-dark-secondary dark:hover:text-text-dark-primary transition-colors"
            title={t('common.copy')}
          >
            {copied ? '✓' : <CopyIcon />}
          </button>
          {locked ? (
            <button
              onClick={onGenerate}
              className="flex items-center gap-2 px-4 py-2 bg-light-soft dark:bg-dark-soft text-text-secondary dark:text-text-dark-secondary rounded-button"
            >
              <LockIcon />
              {t('report.proposals.upgradeToGenerate')}
            </button>
          ) : (
            <button className="px-4 py-2 bg-slate text-white rounded-button hover:bg-slate-hover shadow-button">
              {t('report.proposals.generateFull')}
            </button>
          )}
        </div>
      </div>
      <pre className="p-4 bg-light-soft dark:bg-dark-soft text-sm text-text-secondary dark:text-text-dark-secondary overflow-x-auto max-h-64 font-mono">
        {previewSchema}
      </pre>
    </div>
  );
}

// Folder structure preview
function FolderPreview({ onGenerate, locked, t }) {
  const structure = [
    { name: 'organized_output/', type: 'folder', indent: 0 },
    { name: 'financial_reports/', type: 'folder', indent: 1 },
    { name: '2024/', type: 'folder', indent: 2 },
    { name: 'q1_report.pdf', type: 'file', indent: 3 },
    { name: 'q2_report.pdf', type: 'file', indent: 3 },
    { name: 'customer_data/', type: 'folder', indent: 1 },
    { name: 'contacts.xlsx', type: 'file', indent: 2 },
    { name: 'marketing/', type: 'folder', indent: 1 },
    { name: '...', type: 'more', indent: 2 },
  ];

  return (
    <div className="bg-light-surface dark:bg-dark-surface rounded-xl border border-light-border dark:border-dark-border overflow-hidden">
      <div className="p-4 border-b border-light-border dark:border-dark-border flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-text-primary dark:text-text-dark-primary">
            {t('report.proposals.folder.title')}
          </h3>
          <p className="text-sm text-text-secondary dark:text-text-dark-secondary">
            {t('report.proposals.folder.description')}
          </p>
        </div>
        {locked ? (
          <button
            onClick={onGenerate}
            className="flex items-center gap-2 px-4 py-2 bg-light-soft dark:bg-dark-soft text-text-secondary dark:text-text-dark-secondary rounded-button"
          >
            <LockIcon />
            {t('report.proposals.upgradeToExport')}
          </button>
        ) : (
          <button className="px-4 py-2 bg-slate text-white rounded-button hover:bg-slate-hover shadow-button">
            {t('report.proposals.exportStructure')}
          </button>
        )}
      </div>
      <div className="p-4 bg-light-soft dark:bg-dark-soft font-mono text-sm">
        {structure.map((item, i) => (
          <div
            key={i}
            className="flex items-center text-text-secondary dark:text-text-dark-secondary"
            style={{ paddingLeft: item.indent * 20 }}
          >
            {item.type === 'folder' && (
              <span className="mr-2 text-warning"><FolderIcon /></span>
            )}
            {item.type === 'file' && (
              <span className="mr-2 text-text-secondary dark:text-text-dark-secondary"><FileIcon /></span>
            )}
            {item.type === 'more' ? (
              <span className="text-text-secondary/50 dark:text-text-dark-secondary/50">{item.name}</span>
            ) : (
              <span className="text-text-primary dark:text-text-dark-primary">{item.name}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Noise/duplicate item
function NoiseCard({ icon, title, count, description, colorClass, t }) {
  return (
    <div className={`p-4 rounded-xl border ${colorClass}`}>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-sm font-medium">{title}</span>
      </div>
      <p className="text-2xl font-bold">{count}</p>
      <p className="text-xs opacity-70 mt-1">{description}</p>
    </div>
  );
}

// Review queue component
function ReviewQueue({ items, t }) {
  return (
    <div className="bg-light-surface dark:bg-dark-surface rounded-xl border border-light-border dark:border-dark-border overflow-hidden">
      <div className="p-4 border-b border-light-border dark:border-dark-border">
        <h3 className="font-semibold text-text-primary dark:text-text-dark-primary">
          {t('report.noise.reviewQueue')}
        </h3>
        <p className="text-sm text-text-secondary dark:text-text-dark-secondary">
          {t('report.noise.reviewQueueDesc')}
        </p>
      </div>
      <div className="divide-y divide-light-border dark:divide-dark-border max-h-64 overflow-y-auto">
        {items.slice(0, 5).map((item, i) => (
          <div key={i} className="p-3 flex items-center justify-between hover:bg-light-soft dark:hover:bg-dark-soft">
            <div className="flex items-center gap-3">
              <FileIcon />
              <div>
                <p className="text-sm font-medium text-text-primary dark:text-text-dark-primary truncate max-w-[200px]">
                  {item.name}
                </p>
                <p className="text-xs text-text-secondary dark:text-text-dark-secondary">
                  {item.reason}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="text-xs px-2 py-1 text-success hover:bg-success-bg rounded">
                {t('report.noise.approve')}
              </button>
              <button className="text-xs px-2 py-1 text-error hover:bg-error-bg rounded">
                {t('report.noise.reject')}
              </button>
            </div>
          </div>
        ))}
      </div>
      {items.length > 5 && (
        <div className="p-3 text-center border-t border-light-border dark:border-dark-border">
          <button className="text-sm text-ion hover:underline">
            {t('report.noise.viewAll', { count: items.length })}
          </button>
        </div>
      )}
    </div>
  );
}

// Action card component
function ActionCard({ title, description, icon, locked, onClick, t }) {
  return (
    <div className="bg-light-surface dark:bg-dark-surface rounded-xl border border-light-border dark:border-dark-border p-4 hover:border-ion transition-colors">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-ion/10 rounded-xl flex items-center justify-center text-ion flex-shrink-0">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-text-primary dark:text-text-dark-primary">{title}</h4>
          <p className="text-sm text-text-secondary dark:text-text-dark-secondary mt-1">{description}</p>
        </div>
        {locked ? (
          <button
            onClick={onClick}
            className="px-3 py-1.5 bg-light-soft dark:bg-dark-soft text-text-secondary dark:text-text-dark-secondary text-sm rounded-button flex items-center gap-1 flex-shrink-0"
          >
            <LockIcon />
            {t('common.pro')}
          </button>
        ) : (
          <button className="px-3 py-1.5 bg-slate text-white text-sm rounded-button hover:bg-slate-hover shadow-button flex-shrink-0">
            {t('common.start')}
          </button>
        )}
      </div>
    </div>
  );
}

// Output selection card
function OutputCard({ id, icon, title, description, selected, onSelect }) {
  return (
    <button
      onClick={() => onSelect(id)}
      className={`p-4 rounded-xl border-2 text-left transition-all ${
        selected
          ? 'border-ion bg-ion/10'
          : 'border-light-border dark:border-dark-border hover:border-ion/50'
      }`}
    >
      <div className="text-ion mb-3">{icon}</div>
      <h4 className="font-medium text-text-primary dark:text-text-dark-primary">{title}</h4>
      <p className="text-sm text-text-secondary dark:text-text-dark-secondary mt-1">{description}</p>
    </button>
  );
}

// Main component
export default function RunReport() {
  const { id } = useParams();
  const { t } = useTranslation();
  const { authFetch } = useAuth();
  const { usage, showPaywall, paywallError, closePaywall, checkQuota } = useQuota();
  const [run, setRun] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedOutput, setSelectedOutput] = useState(null);
  const [showLocalPaywall, setShowLocalPaywall] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Check if user is on free tier
  const isFreeTier = usage?.plan === 'free';

  // Fetch run data
  useEffect(() => {
    const fetchRun = async () => {
      try {
        const response = await authFetch(`/runs/${id}`);
        if (response.ok) {
          const data = await response.json();
          setRun(data);
        }
      } catch (err) {
        console.error('Failed to fetch run:', err);
      } finally {
        setLoading(false);
      }
    };

    // Use mock data for now
    setRun({
      id: id,
      status: 'completed',
      name: 'Project Files Analysis',
      snapshotLabel: 'Project Files Snapshot',
      createdAt: '2024-12-14T10:30:00Z',
      completedAt: '2024-12-14T10:35:22Z',
      filesProcessed: 247,
      dataSize: '0.45 GB',
      cost: '$0.12',
      context_text: 'Analyze for business intelligence opportunities',
      categories: [
        { name: 'Financial Reports', fileCount: 45, confidence: 0.92, sampleFiles: ['q1_2024.xlsx', 'annual_report.pdf', 'budget.csv'] },
        { name: 'Customer Data', fileCount: 38, confidence: 0.88, sampleFiles: ['contacts.csv', 'leads.xlsx', 'accounts.json'] },
        { name: 'Marketing Materials', fileCount: 32, confidence: 0.85, sampleFiles: ['campaign_q1.pptx', 'brand_guide.pdf', 'social_metrics.xlsx'] },
        { name: 'Technical Documentation', fileCount: 28, confidence: 0.91, sampleFiles: ['api_docs.md', 'architecture.pdf', 'setup_guide.docx'] },
        { name: 'HR Documents', fileCount: 24, confidence: 0.79, sampleFiles: ['handbook.pdf', 'org_chart.xlsx', 'benefits.docx'] },
        { name: 'Legal Contracts', fileCount: 19, confidence: 0.94, sampleFiles: ['nda_template.pdf', 'service_agreement.docx', 'terms.pdf'] },
        { name: 'Uncategorized', fileCount: 61, confidence: 0.45, sampleFiles: ['misc_001.txt', 'unknown.bin', 'temp_file.dat'] },
      ],
      noise: {
        duplicates: 23,
        lowConfidence: 61,
        emptyFiles: 5,
        corruptedFiles: 2,
      },
      reviewQueue: [
        { name: 'report_draft_v2.docx', reason: 'Low confidence (45%)' },
        { name: 'data_export.csv', reason: 'Multiple categories match' },
        { name: 'meeting_notes.txt', reason: 'Potential duplicate' },
        { name: 'backup_2024.zip', reason: 'Cannot analyze contents' },
        { name: 'image_001.png', reason: 'Non-document file' },
        { name: 'config.json', reason: 'System file detected' },
        { name: 'old_report.pdf', reason: 'Outdated content' },
      ],
    });
    setLoading(false);
  }, [id, authFetch]);

  const handleLockedAction = () => {
    setShowLocalPaywall(true);
  };

  const handleGenerateOutput = () => {
    if (isFreeTier) {
      setShowLocalPaywall(true);
      return;
    }
    // TODO: Implement output generation
    console.log('Generating output:', selectedOutput);
  };

  const handleRerun = async (options) => {
    console.log('Re-running with options:', options);
    // TODO: Implement re-run
  };

  const handleExportPilot = async () => {
    if (!run?.id) return;

    setExporting(true);
    try {
      // Fetch the ZIP file as blob
      const response = await authFetch(`/runs/${run.id}/export-pilot`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Export failed');
      }

      // Get filename from Content-Disposition header or generate one
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `skatalyst_export_${run.id.substring(0, 8)}_${new Date().toISOString().split('T')[0]}.zip`;
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?([^"]+)"?/);
        if (match) filename = match[1];
      }

      // Create download link
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      alert(t('report.exportFailed', 'Failed to export pilot package: ') + error.message);
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ion"></div>
      </div>
    );
  }

  if (!run) {
    return (
      <div className="text-center py-12">
        <p className="text-text-secondary dark:text-text-dark-secondary">
          {t('report.notFound')}
        </p>
      </div>
    );
  }

  const totalFiles = run.categories.reduce((sum, cat) => sum + cat.fileCount, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-text-secondary dark:text-text-dark-secondary mb-2">
            <Link to="/app" className="hover:text-text-primary dark:hover:text-text-dark-primary">
              {t('nav.dashboard')}
            </Link>
            <span>/</span>
            <span>{run.name || run.snapshotLabel}</span>
          </div>
          <h1 className="text-2xl font-bold text-text-primary dark:text-text-dark-primary">
            {t('report.title')}
          </h1>
          <p className="text-text-secondary dark:text-text-dark-secondary mt-1">
            {t('report.completedOn', { date: new Date(run.completedAt).toLocaleDateString() })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <RerunDropdown run={run} onRerun={handleRerun} variant="simple" />
          <button
            onClick={handleExportPilot}
            disabled={exporting}
            className="px-4 py-2 bg-purple-600 text-white rounded-button hover:bg-purple-700 flex items-center gap-2 transition-colors shadow-sm disabled:opacity-50"
          >
            <DownloadIcon />
            {exporting ? t('common.exporting', 'Exporting...') : t('report.exportPilot', 'Export Pilot Package')}
          </button>
          <button className="px-4 py-2 border border-light-border dark:border-dark-border rounded-button text-text-primary dark:text-text-dark-primary hover:bg-light-soft dark:hover:bg-dark-soft flex items-center gap-2 transition-colors">
            <DownloadIcon />
            {t('report.exportReport')}
          </button>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-light-surface dark:bg-dark-surface rounded-xl border border-light-border dark:border-dark-border p-4">
          <p className="text-sm text-text-secondary dark:text-text-dark-secondary">
            {t('report.stats.filesProcessed')}
          </p>
          <p className="text-2xl font-bold text-text-primary dark:text-text-dark-primary mt-1">
            {run.filesProcessed}
          </p>
        </div>
        <div className="bg-light-surface dark:bg-dark-surface rounded-xl border border-light-border dark:border-dark-border p-4">
          <p className="text-sm text-text-secondary dark:text-text-dark-secondary">
            {t('report.stats.dataSize')}
          </p>
          <p className="text-2xl font-bold text-text-primary dark:text-text-dark-primary mt-1">
            {run.dataSize}
          </p>
        </div>
        <div className="bg-light-surface dark:bg-dark-surface rounded-xl border border-light-border dark:border-dark-border p-4">
          <p className="text-sm text-text-secondary dark:text-text-dark-secondary">
            {t('report.stats.categoriesDetected')}
          </p>
          <p className="text-2xl font-bold text-text-primary dark:text-text-dark-primary mt-1">
            {run.categories.length}
          </p>
        </div>
        <div className="bg-light-surface dark:bg-dark-surface rounded-xl border border-light-border dark:border-dark-border p-4">
          <p className="text-sm text-text-secondary dark:text-text-dark-secondary">
            {t('report.stats.processingCost')}
          </p>
          <p className="text-2xl font-bold text-text-primary dark:text-text-dark-primary mt-1">
            {run.cost}
          </p>
        </div>
      </div>

      {/* Theme Detection */}
      <div className="bg-light-surface dark:bg-dark-surface rounded-xl border border-light-border dark:border-dark-border p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-text-primary dark:text-text-dark-primary">
              {t('report.themes.title')}
            </h2>
            <p className="text-sm text-text-secondary dark:text-text-dark-secondary">
              {t('report.themes.description')}
            </p>
          </div>
          <span className="text-sm text-text-secondary dark:text-text-dark-secondary">
            {t('report.themes.summary', { files: totalFiles, categories: run.categories.length })}
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {run.categories.map((category, index) => (
            <CategoryCard key={category.name} category={category} index={index} t={t} />
          ))}
        </div>
      </div>

      {/* Theme Distribution Chart */}
      <ThemeDistributionChart categories={run.categories} t={t} />

      {/* Noise Summary */}
      <div className="bg-light-surface dark:bg-dark-surface rounded-xl border border-light-border dark:border-dark-border p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-text-primary dark:text-text-dark-primary">
              {t('report.noise.title')}
            </h2>
            <p className="text-sm text-text-secondary dark:text-text-dark-secondary">
              {t('report.noise.description')}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <NoiseCard
            icon={<CopyIcon />}
            title={t('report.noise.duplicates')}
            count={run.noise.duplicates}
            description={t('report.noise.duplicatesDesc')}
            colorClass="bg-warning-bg border-warning/20 text-warning"
            t={t}
          />
          <NoiseCard
            icon={<QuestionIcon />}
            title={t('report.noise.lowConfidence')}
            count={run.noise.lowConfidence}
            description={t('report.noise.lowConfidenceDesc')}
            colorClass="bg-warning-bg border-warning/20 text-warning"
            t={t}
          />
          <NoiseCard
            icon={<DocumentIcon />}
            title={t('report.noise.emptyFiles')}
            count={run.noise.emptyFiles}
            description={t('report.noise.emptyFilesDesc')}
            colorClass="bg-light-soft dark:bg-dark-soft border-light-border dark:border-dark-border text-text-secondary dark:text-text-dark-secondary"
            t={t}
          />
          <NoiseCard
            icon={<AlertIcon />}
            title={t('report.noise.corrupted')}
            count={run.noise.corruptedFiles}
            description={t('report.noise.corruptedDesc')}
            colorClass="bg-error-bg border-error/20 text-error"
            t={t}
          />
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 text-sm border border-light-border dark:border-dark-border rounded-button text-text-primary dark:text-text-dark-primary hover:bg-light-soft dark:hover:bg-dark-soft transition-colors">
            {t('report.noise.reviewDuplicates')}
          </button>
          <button className="px-4 py-2 text-sm border border-light-border dark:border-dark-border rounded-button text-text-primary dark:text-text-dark-primary hover:bg-light-soft dark:hover:bg-dark-soft transition-colors">
            {t('report.noise.reviewLowConfidence')}
          </button>
        </div>
      </div>

      {/* Review Queue */}
      <ReviewQueue items={run.reviewQueue || []} t={t} />

      {/* Structure Proposals */}
      <div>
        <h2 className="text-lg font-semibold text-text-primary dark:text-text-dark-primary mb-4">
          {t('report.proposals.title')}
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SchemaPreview
            locked={isFreeTier}
            onGenerate={handleLockedAction}
            t={t}
          />
          <FolderPreview
            locked={isFreeTier}
            onGenerate={handleLockedAction}
            t={t}
          />
        </div>
      </div>

      {/* Choose Output Step */}
      <div className="bg-light-surface dark:bg-dark-surface rounded-xl border border-light-border dark:border-dark-border p-6">
        <h2 className="text-lg font-semibold text-text-primary dark:text-text-dark-primary mb-2">
          {t('report.output.title')}
        </h2>
        <p className="text-sm text-text-secondary dark:text-text-dark-secondary mb-6">
          {t('report.output.description')}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <OutputCard
            id="folder"
            icon={<FolderOpenIcon />}
            title={t('report.output.folder.title')}
            description={t('report.output.folder.description')}
            selected={selectedOutput === 'folder'}
            onSelect={setSelectedOutput}
          />
          <OutputCard
            id="database"
            icon={<DatabaseIcon />}
            title={t('report.output.database.title')}
            description={t('report.output.database.description')}
            selected={selectedOutput === 'database'}
            onSelect={setSelectedOutput}
          />
          <OutputCard
            id="both"
            icon={<GridIcon />}
            title={t('report.output.both.title')}
            description={t('report.output.both.description')}
            selected={selectedOutput === 'both'}
            onSelect={setSelectedOutput}
          />
        </div>
        {selectedOutput && (
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleGenerateOutput}
              className="px-6 py-2 bg-slate text-white rounded-button hover:bg-slate-hover flex items-center gap-2 shadow-button transition-colors"
            >
              {isFreeTier && <LockIcon />}
              {t('report.output.generate')}
            </button>
          </div>
        )}
      </div>

      {/* Recommended Actions */}
      <div>
        <h2 className="text-lg font-semibold text-text-primary dark:text-text-dark-primary mb-4">
          {t('report.actions.title')}
        </h2>
        <div className="space-y-3">
          <ActionCard
            title={t('report.actions.crud.title')}
            description={t('report.actions.crud.description')}
            icon={<CodeIcon />}
            locked={isFreeTier}
            onClick={handleLockedAction}
            t={t}
          />
          <ActionCard
            title={t('report.actions.dashboard.title')}
            description={t('report.actions.dashboard.description')}
            icon={<ChartBarIcon />}
            locked={isFreeTier}
            onClick={handleLockedAction}
            t={t}
          />
          <ActionCard
            title={t('report.actions.chatbot.title')}
            description={t('report.actions.chatbot.description')}
            icon={<ChatIcon />}
            locked={isFreeTier}
            onClick={handleLockedAction}
            t={t}
          />
          <ActionCard
            title={t('report.actions.reportGen.title')}
            description={t('report.actions.reportGen.description')}
            icon={<ReportIcon />}
            locked={isFreeTier}
            onClick={handleLockedAction}
            t={t}
          />
          <ActionCard
            title={t('report.actions.sync.title')}
            description={t('report.actions.sync.description')}
            icon={<SyncIcon />}
            locked={isFreeTier}
            onClick={handleLockedAction}
            t={t}
          />
        </div>
      </div>

      {/* Paywall Modal */}
      <PaywallModal
        isOpen={showLocalPaywall || showPaywall}
        onClose={() => {
          setShowLocalPaywall(false);
          closePaywall();
        }}
        errorCode={paywallError || 'QUOTA_EXCEEDED_RUNS'}
        currentUsage={usage}
      />
    </div>
  );
}
