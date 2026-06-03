/**
 * Visual Understanding Toggle Component
 *
 * Phase 3.2.5: Opt-in visual understanding for non-text images
 *
 * Features:
 * - Toggle to enable/disable visual understanding
 * - Provider selection (heuristic vs cloud)
 * - Cost estimation and budget display
 * - Confirmation checkbox for cloud processing
 * - Usage statistics
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const API_BASE = `${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/api`;

// Provider info
const PROVIDERS = {
  heuristic: {
    name: 'Local Analysis',
    description: 'Analyzes images using color, shape, and pattern detection. Free, no cloud calls.',
    cost: 0,
    icon: '🔍',
  },
  google_vision: {
    name: 'Google Cloud Vision',
    description: 'Uses Google Cloud Vision API for detailed visual labels. Requires opt-in.',
    cost: 0.0015,
    icon: '☁️',
  },
};

export default function VisualUnderstandingToggle({
  imageCount = 0,
  onSettingsChange,
  className = '',
}) {
  const { authFetch } = useAuth();
  const [enabled, setEnabled] = useState(false);
  const [provider, setProvider] = useState('heuristic');
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState(null);

  // Fetch configuration on mount
  useEffect(() => {
    fetchConfig();
  }, []);

  // Fetch cost preview when settings change
  useEffect(() => {
    if (enabled && imageCount > 0) {
      fetchPreview();
    }
  }, [enabled, provider, imageCount]);

  // Notify parent of settings changes
  useEffect(() => {
    if (onSettingsChange) {
      onSettingsChange({
        enabled,
        provider,
        useCloudVision: provider === 'google_vision',
        userConfirmed: confirmed,
      });
    }
  }, [enabled, provider, confirmed, onSettingsChange]);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const response = await authFetch('/vision/config');
      if (response.ok) {
        const data = await response.json();
        setConfig(data);
      }
    } catch (err) {
      console.error('Failed to fetch vision config:', err);
      setError('Failed to load visual understanding settings');
    } finally {
      setLoading(false);
    }
  };

  const fetchPreview = async () => {
    try {
      const response = await authFetch('/vision/preview', {
        method: 'POST',
        body: JSON.stringify({
          imageCount,
          useCloudVision: provider === 'google_vision',
        }),
      });
      if (response.ok) {
        const data = await response.json();
        setPreview(data);
      }
    } catch (err) {
      console.error('Failed to fetch preview:', err);
    }
  };

  if (loading) {
    return (
      <div className={`p-4 bg-gray-50 dark:bg-dark-surface rounded-lg ${className}`}>
        <div className="animate-pulse flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-48"></div>
        </div>
      </div>
    );
  }

  const cloudAvailable = config?.planLimits?.cloudVisionEnabled;
  const budgetRemaining = config?.budgetRemaining || 0;
  const currentUsage = config?.currentUsage || {};

  return (
    <div className={`p-4 bg-gray-50 dark:bg-dark-surface rounded-lg border border-gray-200 dark:border-dark-border ${className}`}>
      {/* Main Toggle */}
      <div className="flex items-start gap-3">
        <label className="relative inline-flex items-center cursor-pointer mt-0.5">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => {
              setEnabled(e.target.checked);
              if (!e.target.checked) {
                setConfirmed(false);
              }
            }}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-300 dark:bg-gray-600 rounded-full peer peer-checked:bg-blue-500 peer-focus:ring-2 peer-focus:ring-blue-300 after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
        </label>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900 dark:text-text-dark-primary">
              Enable Visual Understanding
            </span>
            <span className="px-2 py-0.5 text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded">
              Preview
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-text-dark-secondary mt-1">
            Generate descriptive visual labels for non-text images. Explicit opt-in required.
          </p>
        </div>
      </div>

      {/* Expanded Settings */}
      {enabled && (
        <div className="mt-4 pl-14 space-y-4">
          {/* Provider Selection */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-text-dark-primary block mb-2">
              Analysis Provider
            </label>
            <div className="space-y-2">
              {/* Heuristic Provider */}
              <label className="flex items-start gap-3 p-3 bg-white dark:bg-dark-bg rounded-lg border border-gray-200 dark:border-dark-border cursor-pointer hover:border-blue-300 dark:hover:border-blue-500 transition-colors">
                <input
                  type="radio"
                  name="provider"
                  value="heuristic"
                  checked={provider === 'heuristic'}
                  onChange={() => {
                    setProvider('heuristic');
                    setConfirmed(false);
                  }}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span>{PROVIDERS.heuristic.icon}</span>
                    <span className="font-medium text-gray-900 dark:text-text-dark-primary">
                      {PROVIDERS.heuristic.name}
                    </span>
                    <span className="px-2 py-0.5 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded">
                      Free
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-text-dark-secondary mt-1">
                    {PROVIDERS.heuristic.description}
                  </p>
                </div>
              </label>

              {/* Cloud Vision Provider */}
              <label className={`flex items-start gap-3 p-3 bg-white dark:bg-dark-bg rounded-lg border border-gray-200 dark:border-dark-border ${cloudAvailable ? 'cursor-pointer hover:border-blue-300 dark:hover:border-blue-500' : 'opacity-60 cursor-not-allowed'} transition-colors`}>
                <input
                  type="radio"
                  name="provider"
                  value="google_vision"
                  checked={provider === 'google_vision'}
                  onChange={() => setProvider('google_vision')}
                  disabled={!cloudAvailable}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span>{PROVIDERS.google_vision.icon}</span>
                    <span className="font-medium text-gray-900 dark:text-text-dark-primary">
                      {PROVIDERS.google_vision.name}
                    </span>
                    <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded">
                      ${PROVIDERS.google_vision.cost}/image
                    </span>
                    {!cloudAvailable && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                        Pro/Business only
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-text-dark-secondary mt-1">
                    {PROVIDERS.google_vision.description}
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Cloud Vision Confirmation */}
          {provider === 'google_vision' && cloudAvailable && (
            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-700">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={confirmed}
                  onChange={(e) => setConfirmed(e.target.checked)}
                  id="cloud-confirm"
                  className="mt-1"
                />
                <label htmlFor="cloud-confirm" className="text-sm text-amber-800 dark:text-amber-300">
                  I understand that cloud vision processing will incur costs and that labels are
                  <strong> descriptive estimates only</strong> with no accuracy guaranteed.
                </label>
              </div>
            </div>
          )}

          {/* Cost Preview */}
          {preview && imageCount > 0 && (
            <div className="p-3 bg-white dark:bg-dark-bg rounded-lg border border-gray-200 dark:border-dark-border">
              <h4 className="text-sm font-medium text-gray-700 dark:text-text-dark-primary mb-2">
                Cost Estimate
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500 dark:text-text-dark-secondary">Images to process:</span>
                  <span className="ml-2 font-medium text-gray-900 dark:text-text-dark-primary">{imageCount}</span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-text-dark-secondary">Estimated cost:</span>
                  <span className="ml-2 font-medium text-gray-900 dark:text-text-dark-primary">
                    {preview.estimatedCostFormatted}
                  </span>
                </div>
                {preview.budgetExceeded && (
                  <div className="col-span-2 text-amber-600 dark:text-amber-400">
                    {preview.warnings[0]}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Usage Statistics */}
          {currentUsage && (
            <div className="p-3 bg-white dark:bg-dark-bg rounded-lg border border-gray-200 dark:border-dark-border">
              <h4 className="text-sm font-medium text-gray-700 dark:text-text-dark-primary mb-2">
                This Month's Usage
              </h4>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-500 dark:text-text-dark-secondary block">Total Calls</span>
                  <span className="font-medium text-gray-900 dark:text-text-dark-primary">
                    {currentUsage.totalCalls || 0}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-text-dark-secondary block">Cloud Calls</span>
                  <span className="font-medium text-gray-900 dark:text-text-dark-primary">
                    {currentUsage.cloudCalls || 0}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-text-dark-secondary block">Budget Left</span>
                  <span className="font-medium text-gray-900 dark:text-text-dark-primary">
                    {budgetRemaining === Infinity ? 'Unlimited' : budgetRemaining}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Disclaimer */}
          <p className="text-xs text-gray-500 dark:text-text-dark-secondary italic">
            Labels are descriptive estimates generated with explicit consent.
            No object accuracy or truth is guaranteed.
          </p>
        </div>
      )}

      {error && (
        <div className="mt-3 p-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded">
          {error}
        </div>
      )}
    </div>
  );
}

/**
 * Visual Labels Display Component
 * Shows visual understanding results for an image
 */
export function VisualLabelsCard({
  labels = [],
  category = 'unknown_visual',
  provider = 'heuristic',
  contextAlignment = {},
  className = '',
}) {
  const categoryLabels = {
    product_photo: 'Product Photo',
    technical_diagram: 'Technical Diagram',
    marketing_visual: 'Marketing Visual',
    factory_environment: 'Factory Environment',
    packaging_image: 'Packaging Image',
    scene_photo: 'Scene Photo',
    unknown_visual: 'Unknown Visual',
  };

  const providerLabels = {
    heuristic: 'Local Analysis',
    google_vision: 'Google Vision',
  };

  return (
    <div className={`p-4 bg-white dark:bg-dark-surface rounded-lg border border-gray-200 dark:border-dark-border ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">🖼️</span>
          <span className="font-medium text-gray-900 dark:text-text-dark-primary">
            Visual Understanding
          </span>
          <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded">
            {providerLabels[provider] || provider}
          </span>
        </div>
      </div>

      {/* Category */}
      <div className="mb-3">
        <span className="text-sm text-gray-500 dark:text-text-dark-secondary">Category: </span>
        <span className="text-sm font-medium text-gray-900 dark:text-text-dark-primary">
          {categoryLabels[category] || category}
        </span>
      </div>

      {/* Labels */}
      <div className="mb-3">
        <span className="text-sm text-gray-500 dark:text-text-dark-secondary block mb-2">
          Visual Labels (Preview):
        </span>
        <div className="flex flex-wrap gap-2">
          {labels.slice(0, 8).map((label, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2 py-1 bg-gray-100 dark:bg-dark-bg rounded text-sm"
              title={`Confidence: ${Math.round(label.confidence * 100)}%`}
            >
              <span className="text-gray-700 dark:text-text-dark-primary">{label.label}</span>
              <span className="ml-1 text-xs text-gray-400">
                {Math.round(label.confidence * 100)}%
              </span>
            </span>
          ))}
        </div>
      </div>

      {/* Context Alignment */}
      {Object.keys(contextAlignment).length > 0 && (
        <div>
          <span className="text-sm text-gray-500 dark:text-text-dark-secondary block mb-2">
            Context Alignment:
          </span>
          <div className="space-y-1">
            {Object.entries(contextAlignment)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 3)
              .map(([context, score]) => (
                <div key={context} className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${score * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-600 dark:text-text-dark-secondary w-24 truncate">
                    {context}
                  </span>
                  <span className="text-xs text-gray-500 w-12 text-right">
                    {Math.round(score * 100)}%
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <p className="mt-3 text-xs text-gray-400 dark:text-gray-500 italic">
        Labels are descriptive estimates generated with explicit consent.
      </p>
    </div>
  );
}
