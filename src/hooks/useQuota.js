import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

// Quota error codes that trigger paywall
const QUOTA_ERROR_CODES = [
  'QUOTA_EXCEEDED_GB',
  'QUOTA_EXCEEDED_RUNS',
  'QUOTA_EXCEEDED_CONNECTORS',
];

/**
 * Hook for managing quota state and paywall modal
 *
 * Usage:
 * const { usage, showPaywall, paywallError, closePaywall, checkQuota, wrapWithQuotaCheck } = useQuota();
 */
export function useQuota() {
  const { authFetch } = useAuth();
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Paywall modal state
  const [showPaywall, setShowPaywall] = useState(false);
  const [paywallError, setPaywallError] = useState(null);

  // Fetch current quota usage
  const fetchUsage = useCallback(async () => {
    try {
      setLoading(true);
      const response = await authFetch('/quotas/usage');
      if (response.ok) {
        const data = await response.json();
        setUsage({
          gb: data.gb_scanned_used || 0,
          gbLimit: data.gb_scanned_limit || 1,
          runs: data.runs_used || 0,
          runsLimit: data.runs_limit || 5,
          connectors: data.connectors_used || 0,
          connectorsLimit: data.connectors_limit || 2,
          plan: data.plan || 'free',
        });
        return data;
      }
    } catch (err) {
      console.error('Failed to fetch quota usage:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
    return null;
  }, [authFetch]);

  // Check if a specific quota type is exceeded
  const isQuotaExceeded = useCallback((type) => {
    if (!usage) return false;
    switch (type) {
      case 'gb':
        return usage.gb >= usage.gbLimit;
      case 'runs':
        return usage.runs >= usage.runsLimit;
      case 'connectors':
        return usage.connectors >= usage.connectorsLimit;
      default:
        return false;
    }
  }, [usage]);

  // Check quota before performing an action
  const checkQuota = useCallback((type) => {
    if (isQuotaExceeded(type)) {
      const errorCodeMap = {
        gb: 'QUOTA_EXCEEDED_GB',
        runs: 'QUOTA_EXCEEDED_RUNS',
        connectors: 'QUOTA_EXCEEDED_CONNECTORS',
      };
      setPaywallError(errorCodeMap[type] || 'QUOTA_EXCEEDED_GB');
      setShowPaywall(true);
      return false;
    }
    return true;
  }, [isQuotaExceeded]);

  // Close paywall modal
  const closePaywall = useCallback(() => {
    setShowPaywall(false);
    setPaywallError(null);
  }, []);

  // Handle API response for quota errors
  const handleQuotaError = useCallback((response, data) => {
    if (response.status === 402 && data?.code && QUOTA_ERROR_CODES.includes(data.code)) {
      setPaywallError(data.code);
      setShowPaywall(true);
      return true;
    }
    return false;
  }, []);

  // Wrapper for API calls that handles quota errors
  const wrapWithQuotaCheck = useCallback((apiCall) => {
    return async (...args) => {
      try {
        const response = await apiCall(...args);

        // Clone response to read body without consuming it
        const clonedResponse = response.clone();

        if (response.status === 402) {
          try {
            const data = await clonedResponse.json();
            if (handleQuotaError(response, data)) {
              // Refresh usage data
              await fetchUsage();
              return { ok: false, quotaExceeded: true, code: data.code };
            }
          } catch {
            // Response body might not be JSON
          }
        }

        return response;
      } catch (err) {
        throw err;
      }
    };
  }, [handleQuotaError, fetchUsage]);

  // Fetch usage on mount
  useEffect(() => {
    fetchUsage();
  }, [fetchUsage]);

  return {
    // Usage data
    usage,
    loading,
    error,
    fetchUsage,

    // Quota checks
    isQuotaExceeded,
    checkQuota,

    // Paywall state
    showPaywall,
    paywallError,
    closePaywall,

    // API wrapper
    wrapWithQuotaCheck,
    handleQuotaError,
  };
}

export default useQuota;
