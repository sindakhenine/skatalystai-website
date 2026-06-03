import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

// Icons
const CheckIcon = () => (
  <svg className="w-5 h-5 text-success" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
  </svg>
);

const RocketIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
  </svg>
);

const ClockIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const SparklesIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
);

// Countdown component
function Countdown({ expiresAt }) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const expiry = new Date(expiresAt).getTime();
      const diff = expiry - now;

      if (diff <= 0) {
        return 'Expired';
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (hours > 24) {
        const days = Math.floor(hours / 24);
        return `${days}d ${hours % 24}h`;
      }

      return `${hours}h ${minutes}m ${seconds}s`;
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [expiresAt]);

  return (
    <span className="font-mono font-bold">{timeLeft}</span>
  );
}

// Feature item component
function FeatureItem({ name, enabled }) {
  return (
    <div className="flex items-center gap-2">
      {enabled ? (
        <svg className="w-4 h-4 text-success" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      ) : (
        <svg className="w-4 h-4 text-text-secondary" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      )}
      <span className={enabled ? 'text-text-primary' : 'text-text-secondary line-through'}>{name}</span>
    </div>
  );
}

// Usage progress component
function UsageProgress({ label, used, cap, type }) {
  const percentage = cap ? Math.min((used / cap) * 100, 100) : 0;
  const remaining = cap ? cap - used : 0;
  const isNearLimit = percentage >= 80;
  const isAtLimit = percentage >= 100;

  return (
    <div className="p-3 bg-light-soft dark:bg-dark-soft rounded-button">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm font-medium text-text-secondary dark:text-text-dark-secondary">{label}</span>
        <span className="text-sm text-text-primary dark:text-text-dark-primary">
          {used} / {cap}
        </span>
      </div>
      <div className="w-full h-2 bg-light-border dark:bg-dark-border rounded-full">
        <div
          className={`h-full rounded-full transition-all ${
            isAtLimit ? 'bg-error' : isNearLimit ? 'bg-warning' : 'bg-ion'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="text-xs text-text-secondary dark:text-text-dark-secondary mt-1">
        {remaining} remaining
      </p>
    </div>
  );
}

export default function Beta() {
  const { authFetch } = useAuth();

  // State
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState(false);
  const [validating, setValidating] = useState(false);
  const [betaStatus, setBetaStatus] = useState(null);
  const [voucherCode, setVoucherCode] = useState('');
  const [voucherPreview, setVoucherPreview] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Feature labels
  const featureLabels = {
    google_ocr: 'Google Cloud Vision OCR',
    visual_understanding: 'Visual Understanding AI',
    enterprise_connectors: 'Enterprise Connectors',
    priority_processing: 'Priority Processing',
  };

  // Usage labels
  const usageLabels = {
    ocr_images: 'OCR Images',
    vision_images: 'Vision Images',
    llm_tokens: 'LLM Tokens',
    storage_bytes: 'Storage',
  };

  // Fetch beta status on mount
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        setLoading(true);
        const response = await authFetch('/beta/status');
        if (response.ok) {
          const data = await response.json();
          setBetaStatus(data);
        }
      } catch (err) {
        console.error('Failed to fetch beta status:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, [authFetch]);

  // Validate voucher as user types (debounced)
  useEffect(() => {
    const validateCode = async () => {
      if (voucherCode.length < 4) {
        setVoucherPreview(null);
        return;
      }

      try {
        setValidating(true);
        const response = await authFetch('/beta/validate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: voucherCode }),
        });

        const data = await response.json();
        setVoucherPreview(data);
        setError(null);
      } catch (err) {
        console.error('Validation error:', err);
      } finally {
        setValidating(false);
      }
    };

    const debounce = setTimeout(validateCode, 500);
    return () => clearTimeout(debounce);
  }, [voucherCode, authFetch]);

  // Activate voucher
  const handleActivate = async () => {
    if (!voucherCode.trim()) return;

    try {
      setActivating(true);
      setError(null);

      const response = await authFetch('/beta/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: voucherCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to activate voucher');
      }

      const accessType = data.voucherType === 'event' ? 'Event demo' : 'Beta trial';
      setSuccess(`${accessType} activated! You now have ${data.displayName} until ${new Date(data.expiresAt).toLocaleString()}`);
      setVoucherCode('');
      setVoucherPreview(null);

      // Refresh status
      const statusResponse = await authFetch('/beta/status');
      if (statusResponse.ok) {
        setBetaStatus(await statusResponse.json());
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setActivating(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-text-primary dark:text-text-dark-primary">Trials & Access</h1>
          <p className="text-text-secondary dark:text-text-dark-secondary mt-1">Activate your voucher</p>
        </div>
        <div className="animate-pulse space-y-6">
          <div className="bg-light-soft dark:bg-dark-soft rounded-xl h-48" />
          <div className="bg-light-soft dark:bg-dark-soft rounded-xl h-32" />
        </div>
      </div>
    );
  }

  // Active beta status
  const isActive = betaStatus?.active;

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-ion rounded-2xl shadow-lg mb-4">
          <RocketIcon />
        </div>
        <h1 className="text-2xl font-bold text-text-primary dark:text-text-dark-primary">Trials & Access</h1>
        <p className="text-text-secondary dark:text-text-dark-secondary mt-1">
          {isActive ? 'Your access is active' : 'Enter your voucher code to unlock features'}
        </p>
      </div>

      {/* Success message */}
      {success && (
        <div className="bg-success/10 border border-success/20 rounded-xl p-4 flex items-start gap-3">
          <svg className="w-5 h-5 text-success mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <div className="flex-1">
            <p className="text-sm font-medium text-success">{success}</p>
          </div>
          <button onClick={() => setSuccess(null)} className="text-success hover:opacity-80">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="bg-error/10 border border-error/20 rounded-xl p-4 flex items-start gap-3">
          <svg className="w-5 h-5 text-error mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div className="flex-1">
            <p className="text-sm font-medium text-error">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="text-error hover:opacity-80">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}

      {/* Active Beta Card */}
      {isActive && (
        <div className={`rounded-xl border-2 p-6 ${
          betaStatus.voucherType === 'event'
            ? 'bg-gradient-to-br from-orange-500/10 to-amber-500/10 border-orange-500/30'
            : 'bg-gradient-to-br from-purple-500/10 to-ion/10 border-purple-500/30'
        }`}>
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                betaStatus.voucherType === 'event'
                  ? 'bg-gradient-to-br from-orange-500 to-amber-500'
                  : 'bg-gradient-to-br from-purple-500 to-ion'
              }`}>
                <SparklesIcon />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 text-white text-xs font-bold rounded-full uppercase ${
                    betaStatus.voucherType === 'event' ? 'bg-orange-500' : 'bg-purple-500'
                  }`}>
                    {betaStatus.voucherType === 'event' ? 'Event Demo' : 'Beta Trial'}
                  </span>
                  <span className="font-semibold text-text-primary dark:text-text-dark-primary capitalize">
                    {betaStatus.plan} Plan
                  </span>
                </div>
                {betaStatus.campaign && (
                  <p className="text-sm text-text-secondary dark:text-text-dark-secondary mt-0.5">
                    {betaStatus.voucherType === 'event' ? 'Event' : 'Campaign'}: {betaStatus.campaign}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 bg-light-surface dark:bg-dark-surface px-4 py-2 rounded-button">
              <ClockIcon />
              <div>
                <p className="text-xs text-text-secondary dark:text-text-dark-secondary">Time Remaining</p>
                <Countdown expiresAt={betaStatus.expiresAt} />
              </div>
            </div>
          </div>

          {/* Features unlocked */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(featureLabels).map(([key, label]) => (
              <div
                key={key}
                className={`p-3 rounded-button ${
                  betaStatus.features?.[key]
                    ? 'bg-success/10 border border-success/20'
                    : 'bg-light-soft dark:bg-dark-soft'
                }`}
              >
                <FeatureItem name={label} enabled={betaStatus.features?.[key]} />
              </div>
            ))}
          </div>

          {/* Usage stats */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <UsageProgress
              label="OCR Images"
              used={betaStatus.currentUsage?.ocr_images || 0}
              cap={betaStatus.usageCaps?.ocr_images || 100}
              type="ocr_images"
            />
            <UsageProgress
              label="Vision Images"
              used={betaStatus.currentUsage?.vision_images || 0}
              cap={betaStatus.usageCaps?.vision_images || 50}
              type="vision_images"
            />
            <UsageProgress
              label="LLM Tokens"
              used={betaStatus.currentUsage?.llm_tokens || 0}
              cap={betaStatus.usageCaps?.llm_tokens || 100000}
              type="llm_tokens"
            />
            <UsageProgress
              label="Storage (MB)"
              used={Math.round((betaStatus.currentUsage?.storage_bytes || 0) / (1024 * 1024))}
              cap={Math.round((betaStatus.usageCaps?.storage_gb || 1) * 1024)}
              type="storage"
            />
          </div>
        </div>
      )}

      {/* Voucher activation form */}
      {!isActive && (
        <div className="bg-light-surface dark:bg-dark-surface rounded-xl border border-light-border dark:border-dark-border p-6">
          <h2 className="text-lg font-semibold text-text-primary dark:text-text-dark-primary mb-4">
            Activate Beta Voucher
          </h2>

          <div className="space-y-4">
            <div>
              <label htmlFor="voucherCode" className="block text-sm font-medium text-text-secondary mb-1.5">
                Voucher Code
              </label>
              <div className="relative">
                <input
                  id="voucherCode"
                  type="text"
                  value={voucherCode}
                  onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                  placeholder="BETA-XXXX or EVENT-XXXX"
                  className="w-full px-4 py-3 text-lg font-mono uppercase tracking-widest bg-light-soft dark:bg-dark-soft border border-light-border dark:border-dark-border rounded-button text-text-primary dark:text-text-dark-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-ion focus:border-transparent"
                />
                {validating && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <svg className="animate-spin w-5 h-5 text-ion" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  </div>
                )}
              </div>
            </div>

            {/* Voucher preview */}
            {voucherPreview && (
              <div className={`p-4 rounded-button ${
                voucherPreview.valid
                  ? 'bg-success/10 border border-success/20'
                  : 'bg-error/10 border border-error/20'
              }`}>
                {voucherPreview.valid ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <CheckIcon />
                      <span className="font-medium text-success">
                        {voucherPreview.voucher.voucherType === 'event' ? 'Valid event demo voucher!' : 'Valid beta trial voucher!'}
                      </span>
                      <span className={`px-2 py-0.5 text-xs font-bold rounded-full uppercase ${
                        voucherPreview.voucher.voucherType === 'event'
                          ? 'bg-orange-500 text-white'
                          : 'bg-purple-500 text-white'
                      }`}>
                        {voucherPreview.voucher.voucherType === 'event' ? 'Event' : 'Beta'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-text-secondary">Plan:</span>
                        <span className="ml-2 font-medium text-text-primary">{voucherPreview.voucher.displayName}</span>
                      </div>
                      <div>
                        <span className="text-text-secondary">Duration:</span>
                        <span className="ml-2 font-medium text-text-primary">
                          {voucherPreview.voucher.durationHours >= 24
                            ? `${Math.round(voucherPreview.voucher.durationHours / 24)} days`
                            : `${voucherPreview.voucher.durationHours} hours`
                          }
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                      {Object.entries(voucherPreview.voucher.features || {}).map(([key, enabled]) => (
                        <div key={key} className={`flex items-center gap-1 ${enabled ? 'text-success' : 'text-text-secondary'}`}>
                          {enabled ? (
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          )}
                          <span>{featureLabels[key] || key}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-error" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span className="text-error">{voucherPreview.error}</span>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={handleActivate}
              disabled={!voucherCode.trim() || activating || !voucherPreview?.valid}
              className={`w-full py-3 px-4 rounded-button font-medium text-white transition-all ${
                !voucherCode.trim() || activating || !voucherPreview?.valid
                  ? 'bg-light-border dark:bg-dark-border cursor-not-allowed text-text-secondary'
                  : 'bg-gradient-to-r from-purple-500 to-ion hover:opacity-90 shadow-lg'
              }`}
            >
              {activating ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Activating...
                </span>
              ) : (
                'Activate Beta Access'
              )}
            </button>
          </div>
        </div>
      )}

      {/* Voucher Types Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-orange-500/5 to-amber-500/5 rounded-xl border border-orange-500/20 p-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="px-2 py-0.5 bg-orange-500 text-white text-xs font-bold rounded-full">EVENT</span>
            <h3 className="font-semibold text-text-primary dark:text-text-dark-primary">Event Demo Vouchers</h3>
          </div>
          <ul className="space-y-2 text-sm text-text-secondary dark:text-text-dark-secondary">
            <li className="flex items-start gap-2">
              <ClockIcon />
              <span>24-hour access for conferences & events</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckIcon />
              <span>Quick hands-on experience with all features</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckIcon />
              <span>Perfect for demo sessions & workshops</span>
            </li>
          </ul>
        </div>

        <div className="bg-gradient-to-br from-purple-500/5 to-ion/5 rounded-xl border border-purple-500/20 p-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="px-2 py-0.5 bg-purple-500 text-white text-xs font-bold rounded-full">BETA</span>
            <h3 className="font-semibold text-text-primary dark:text-text-dark-primary">Beta Trial Vouchers</h3>
          </div>
          <ul className="space-y-2 text-sm text-text-secondary dark:text-text-dark-secondary">
            <li className="flex items-start gap-2">
              <ClockIcon />
              <span>7-14 day extended trial period</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckIcon />
              <span>Full access to evaluate the platform</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckIcon />
              <span>Ideal for companies exploring Skatalyst</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-light-surface dark:bg-dark-surface rounded-xl border border-light-border dark:border-dark-border p-6">
          <h3 className="font-semibold text-text-primary dark:text-text-dark-primary mb-3">What's included?</h3>
          <ul className="space-y-2 text-sm text-text-secondary dark:text-text-dark-secondary">
            <li className="flex items-start gap-2">
              <CheckIcon />
              <span>Full access to Google Cloud Vision OCR</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckIcon />
              <span>Visual Understanding AI for images</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckIcon />
              <span>Enterprise connectors (OneDrive, SharePoint)</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckIcon />
              <span>Priority processing queue</span>
            </li>
          </ul>
        </div>

        <div className="bg-light-surface dark:bg-dark-surface rounded-xl border border-light-border dark:border-dark-border p-6">
          <h3 className="font-semibold text-text-primary dark:text-text-dark-primary mb-3">How it works</h3>
          <ol className="space-y-2 text-sm text-text-secondary dark:text-text-dark-secondary list-decimal list-inside">
            <li>Enter your voucher code above</li>
            <li>Review the features and duration</li>
            <li>Click activate to start your access period</li>
            <li>Access unlocks immediately</li>
          </ol>
          <p className="mt-4 text-xs text-text-secondary dark:text-text-dark-secondary">
            Access is temporary and includes usage limits. Your data and settings remain after expiry.
          </p>
        </div>
      </div>

      {/* FAQ */}
      <div className="bg-light-surface dark:bg-dark-surface rounded-xl border border-light-border dark:border-dark-border p-6">
        <h3 className="font-semibold text-text-primary dark:text-text-dark-primary mb-4">Frequently Asked Questions</h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-text-primary dark:text-text-dark-primary text-sm">What happens when my beta expires?</h4>
            <p className="text-text-secondary dark:text-text-dark-secondary text-sm mt-1">
              Your account reverts to your previous plan. All data is preserved, but premium features become unavailable.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-text-primary dark:text-text-dark-primary text-sm">Can I use multiple vouchers?</h4>
            <p className="text-text-secondary dark:text-text-dark-secondary text-sm mt-1">
              You can redeem one voucher at a time. Wait for your current beta to expire before activating a new one.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-text-primary dark:text-text-dark-primary text-sm">What are the usage limits?</h4>
            <p className="text-text-secondary dark:text-text-dark-secondary text-sm mt-1">
              Each beta tier has specific limits for OCR, vision, and token usage. When limits are reached, you can still use free features.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
