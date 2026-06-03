/**
 * Feature Gating Hook
 *
 * Frontend hook for checking feature access based on BYOK configuration.
 * This mirrors the backend FeatureGatingService for consistent UX.
 *
 * Usage:
 * const { canUse, checkFeature, loading } = useFeatureGating();
 *
 * // Check if feature is allowed
 * if (canUse('context_classification')) { ... }
 *
 * // Or get detailed info
 * const { allowed, reason, alternative } = await checkFeature('context_classification');
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';

/**
 * Feature IDs that require BYOK (mirrors backend FeatureGatingService)
 */
export const BYOK_REQUIRED_FEATURES = [
  'context_classification',
  'ocr_semantic_enrichment',
  'advanced_extraction',
  'visual_understanding',
  'chat_analysis',
  'schema_generation',
];

/**
 * Features that don't require BYOK
 */
export const NON_BYOK_FEATURES = [
  'metadata_preview',
  'file_upload',
  'basic_ocr',
  'connector_sync',
  'data_export',
  'heuristic_classification',
];

/**
 * Feature display names
 */
export const FEATURE_NAMES = {
  context_classification: 'AI Context Classification',
  ocr_semantic_enrichment: 'OCR Semantic Enrichment',
  advanced_extraction: 'Advanced Content Extraction',
  visual_understanding: 'Visual Understanding',
  chat_analysis: 'Chat-based Analysis',
  schema_generation: 'AI Schema Generation',
  metadata_preview: 'Metadata Preview',
  file_upload: 'File Upload',
  basic_ocr: 'Basic OCR',
  connector_sync: 'Connector Sync',
  data_export: 'Data Export',
  heuristic_classification: 'Heuristic Classification',
};

/**
 * Hook for feature gating
 */
export function useFeatureGating() {
  const { authFetch } = useAuth();
  const [access, setAccess] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch feature access on mount
  useEffect(() => {
    const fetchAccess = async () => {
      try {
        setLoading(true);
        const response = await authFetch('/features/access');
        if (response.ok) {
          const data = await response.json();
          setAccess(data);
        } else {
          throw new Error('Failed to fetch feature access');
        }
      } catch (err) {
        console.error('Feature gating error:', err);
        setError(err.message);
        // Default to blocking BYOK features on error
        setAccess({
          hasByok: false,
          features: {},
          byokRequired: BYOK_REQUIRED_FEATURES,
          byokNotRequired: NON_BYOK_FEATURES,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAccess();
  }, [authFetch]);

  /**
   * Quick check if feature is allowed
   *
   * @param {string} featureId - Feature identifier
   * @returns {boolean}
   */
  const canUse = useCallback(
    (featureId) => {
      if (loading) return false;

      // If we have access data, check it
      if (access?.features?.[featureId]) {
        return access.features[featureId].allowed;
      }

      // Fallback: check if feature requires BYOK
      if (BYOK_REQUIRED_FEATURES.includes(featureId)) {
        return access?.hasByok ?? false;
      }

      // Non-BYOK features are always allowed
      return true;
    },
    [access, loading]
  );

  /**
   * Check feature with full details
   *
   * @param {string} featureId - Feature identifier
   * @returns {Promise<{allowed: boolean, reason?: string, alternative?: string}>}
   */
  const checkFeature = useCallback(
    async (featureId) => {
      try {
        const response = await authFetch(`/features/check/${featureId}`);
        return await response.json();
      } catch (err) {
        console.error('Feature check error:', err);
        return {
          allowed: false,
          reason: 'Unable to verify feature access',
        };
      }
    },
    [authFetch]
  );

  /**
   * Refresh access (e.g., after adding BYOK key)
   */
  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const response = await authFetch('/features/access');
      if (response.ok) {
        const data = await response.json();
        setAccess(data);
      }
    } catch (err) {
      console.error('Feature refresh error:', err);
    } finally {
      setLoading(false);
    }
  }, [authFetch]);

  return {
    canUse,
    checkFeature,
    access,
    loading,
    error,
    refresh,
    hasByok: access?.hasByok ?? false,
    BYOK_REQUIRED_FEATURES,
    NON_BYOK_FEATURES,
    FEATURE_NAMES,
  };
}

/**
 * Component for conditional rendering based on feature access
 *
 * Usage:
 * <FeatureGate feature="context_classification">
 *   <AIClassificationUI />
 * </FeatureGate>
 */
export function FeatureGate({ feature, children, fallback = null }) {
  const { canUse, loading } = useFeatureGating();

  if (loading) {
    return fallback;
  }

  if (!canUse(feature)) {
    return fallback;
  }

  return children;
}

export default useFeatureGating;
