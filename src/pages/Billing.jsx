import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';

// Check icon
const CheckIcon = () => (
  <svg className="w-5 h-5 text-success" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
  </svg>
);

// External link icon
const ExternalLinkIcon = () => (
  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
  </svg>
);

// Plan card component
function PlanCard({ name, price, period, features, current, highlighted, onSelect, loading, disabled }) {
  return (
    <div
      className={`relative rounded-xl p-6 border-2 transition-all ${
        current
          ? 'border-ion bg-ion/10'
          : highlighted
          ? 'border-ion/50 hover:border-ion'
          : 'border-light-border hover:border-light-border'
      }`}
    >
      {current && (
        <div className="absolute -top-3 left-4 bg-ion text-white text-xs font-semibold px-3 py-1 rounded-full">
          Current Plan
        </div>
      )}
      {highlighted && !current && (
        <div className="absolute -top-3 left-4 bg-success text-white text-xs font-semibold px-3 py-1 rounded-full">
          Recommended
        </div>
      )}
      <div className="mb-4">
        <h3 className="text-lg font-bold text-text-primary">{name}</h3>
        <div className="mt-2">
          <span className="text-3xl font-bold text-text-primary">{price}</span>
          {period && <span className="text-text-secondary">/{period}</span>}
        </div>
      </div>
      <ul className="space-y-2 mb-6">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center gap-2 text-sm text-text-secondary">
            <CheckIcon />
            {feature}
          </li>
        ))}
      </ul>
      {!current && (
        <button
          onClick={onSelect}
          disabled={disabled || loading}
          className={`w-full py-2 px-4 rounded-button font-medium transition-colors ${
            disabled || loading
              ? 'bg-light-soft text-text-secondary cursor-not-allowed'
              : highlighted
              ? 'bg-slate text-white hover:bg-slate-hover shadow-button'
              : 'bg-light-soft text-text-primary hover:bg-light-border'
          }`}
        >
          {loading ? 'Loading...' : disabled ? 'Coming Soon' : 'Upgrade'}
        </button>
      )}
      {current && (
        <div className="w-full py-2 px-4 rounded-button bg-ion/20 text-ion font-medium text-center">
          Active
        </div>
      )}
    </div>
  );
}

// Invoice row component
function InvoiceRow({ invoice }) {
  const statusColors = {
    paid: 'text-success bg-success/10',
    open: 'text-warning bg-warning/10',
    draft: 'text-text-secondary bg-light-soft',
    uncollectible: 'text-error bg-error/10',
    void: 'text-text-secondary bg-light-soft',
  };

  return (
    <div className="flex items-center justify-between py-3 border-b border-light-border last:border-0">
      <div className="flex items-center gap-4">
        <div>
          <p className="text-sm font-medium text-text-primary">{invoice.number || 'Draft'}</p>
          <p className="text-xs text-text-secondary">
            {new Date(invoice.created).toLocaleDateString()}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <span className={`text-xs px-2 py-1 rounded-full capitalize ${statusColors[invoice.status] || statusColors.draft}`}>
          {invoice.status}
        </span>
        <span className="text-sm font-medium text-text-primary">
          ${invoice.amount.toFixed(2)} {invoice.currency}
        </span>
        {invoice.pdfUrl && (
          <a
            href={invoice.pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-ion hover:opacity-80 text-sm flex items-center"
          >
            PDF
            <ExternalLinkIcon />
          </a>
        )}
      </div>
    </div>
  );
}

export default function Billing() {
  const { t } = useTranslation();
  const { authFetch } = useAuth();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [upgradeLoading, setUpgradeLoading] = useState(null);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Subscription data
  const [subscription, setSubscription] = useState(null);
  const [currentPlan, setCurrentPlan] = useState('free');
  const [subscriptionStatus, setSubscriptionStatus] = useState('active');

  // Usage data from API
  const [usage, setUsage] = useState({
    gbScanned: 0,
    gbLimit: 1,
    runs: 0,
    runsLimit: 5,
    connectors: 0,
    connectorsLimit: 2,
    ocrPages: 0,
    ocrPagesLimit: 0,
    ocrCost: '0.00',
  });

  // Invoices
  const [invoices, setInvoices] = useState([]);
  const [invoicesLoading, setInvoicesLoading] = useState(false);

  // Check for success/cancel from Stripe redirect
  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      setSuccessMessage('Subscription successful! Your plan has been upgraded.');
      // Clear URL params
      window.history.replaceState({}, '', '/app/billing');
    }
    if (searchParams.get('canceled') === 'true') {
      setError('Checkout was canceled. No changes were made.');
      window.history.replaceState({}, '', '/app/billing');
    }
  }, [searchParams]);

  // Fetch subscription and usage data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch subscription status
        const subResponse = await authFetch('/billing/subscription');
        if (subResponse.ok) {
          const subData = await subResponse.json();
          setSubscription(subData.subscription);
          setCurrentPlan(subData.plan || subData.subscription?.plan || 'free');
          setSubscriptionStatus(subData.status || subData.subscription?.status || 'active');
        }

        // Fetch quota/usage from existing endpoint
        const usageResponse = await authFetch('/quotas/usage');
        if (usageResponse.ok) {
          const usageData = await usageResponse.json();
          // Handle both old format (flat) and new format (nested usage object)
          const u = usageData.usage || usageData;
          setUsage({
            gbScanned: u.gbScanned?.used ?? usageData.gb_scanned_used ?? 0,
            gbLimit: u.gbScanned?.limit ?? usageData.gb_scanned_limit ?? 1,
            runs: u.runs?.used ?? usageData.runs_used ?? 0,
            runsLimit: u.runs?.limit ?? usageData.runs_limit ?? 5,
            connectors: u.connectors?.used ?? usageData.connectors_used ?? 0,
            connectorsLimit: u.connectors?.limit ?? usageData.connectors_limit ?? 2,
            ocrPages: u.ocrPages?.used ?? 0,
            ocrPagesLimit: u.ocrPages?.limit ?? 0,
            ocrCost: u.ocrPages?.totalCost ?? '0.00',
          });
        }
      } catch (err) {
        console.error('Failed to fetch billing data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [authFetch]);

  // Fetch invoices
  useEffect(() => {
    const fetchInvoices = async () => {
      if (currentPlan === 'free') return;

      try {
        setInvoicesLoading(true);
        const response = await authFetch('/billing/invoices?limit=10');
        if (response.ok) {
          const data = await response.json();
          setInvoices(data.invoices || []);
        }
      } catch (err) {
        console.error('Failed to fetch invoices:', err);
      } finally {
        setInvoicesLoading(false);
      }
    };

    if (!loading) {
      fetchInvoices();
    }
  }, [authFetch, currentPlan, loading]);

  // Handle upgrade
  const handleUpgrade = async (planId) => {
    try {
      setUpgradeLoading(planId);
      setError(null);

      const response = await authFetch('/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planId }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error === 'STRIPE_NOT_CONFIGURED') {
          setError('Billing is not configured yet. Please contact support.');
          return;
        }
        throw new Error(data.message || data.error || 'Failed to create checkout session');
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error('Upgrade error:', err);
      setError(err.message);
    } finally {
      setUpgradeLoading(null);
    }
  };

  // Handle manage subscription (open Stripe portal)
  const handleManageSubscription = async () => {
    try {
      setUpgradeLoading('portal');
      setError(null);

      const response = await authFetch('/billing/portal', {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to open billing portal');
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error('Portal error:', err);
      setError(err.message);
    } finally {
      setUpgradeLoading(null);
    }
  };

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: '$0',
      period: 'forever',
      features: [
        '1 GB data processing',
        '5 runs per month',
        '2 data source connectors',
        'Basic theme detection',
        'Community support',
      ],
      current: currentPlan === 'free',
    },
    {
      id: 'pro',
      name: 'Pro',
      price: '$49',
      period: 'month',
      features: [
        '10 GB data processing',
        '50 runs per month',
        '10 data source connectors',
        'Advanced AI analysis',
        'Priority support',
        'Custom output formats',
      ],
      highlighted: true,
      current: currentPlan === 'pro',
    },
    {
      id: 'business',
      name: 'Business',
      price: '$199',
      period: 'month',
      features: [
        '100 GB data processing',
        'Unlimited runs',
        'Unlimited connectors',
        'Team collaboration',
        'API access',
        'SSO & audit logs',
      ],
      current: currentPlan === 'business',
    },
  ];

  // Show loading skeleton
  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-text-primary dark:text-text-dark-primary">{t('billing.title')}</h1>
          <p className="text-text-secondary dark:text-text-dark-secondary mt-1">{t('billing.subtitle')}</p>
        </div>
        <div className="animate-pulse space-y-6">
          <div className="bg-light-soft dark:bg-dark-soft rounded-xl h-48" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-light-soft dark:bg-dark-soft rounded-xl h-40" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary dark:text-text-dark-primary">{t('billing.title')}</h1>
        <p className="text-text-secondary dark:text-text-dark-secondary mt-1">
          {t('billing.subtitle')}
        </p>
      </div>

      {/* Success message */}
      {successMessage && (
        <div className="bg-success/10 border border-success/20 rounded-button p-4 flex items-start gap-3">
          <svg className="w-5 h-5 text-success mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <div className="flex-1">
            <p className="text-sm font-medium text-success">{successMessage}</p>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-success hover:opacity-80">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="bg-error/10 border border-error/20 rounded-button p-4 flex items-start gap-3">
          <svg className="w-5 h-5 text-error mt-0.5" fill="currentColor" viewBox="0 0 20 20">
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

      {/* Subscription status warning */}
      {subscriptionStatus === 'past_due' && (
        <div className="bg-warning/10 border border-warning/20 rounded-button p-4 flex items-start gap-3">
          <svg className="w-5 h-5 text-warning mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <div className="flex-1">
            <p className="text-sm font-medium text-warning">Payment Past Due</p>
            <p className="text-sm text-warning/80 mt-1">
              Your payment is past due. Please update your payment method to continue using premium features.
            </p>
          </div>
          <button
            onClick={handleManageSubscription}
            disabled={upgradeLoading === 'portal'}
            className="px-4 py-2 bg-warning text-white rounded-button text-sm font-medium hover:opacity-90"
          >
            {upgradeLoading === 'portal' ? 'Loading...' : 'Update Payment'}
          </button>
        </div>
      )}

      {/* Current plan summary */}
      <div className="bg-light-surface dark:bg-dark-surface rounded-xl border border-light-border dark:border-dark-border p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-text-primary dark:text-text-dark-primary">{t('billing.currentPlan')}</h2>
            <p className="text-text-secondary dark:text-text-dark-secondary text-sm">
              {t('billing.youreOn')} <span className="font-medium capitalize">{currentPlan}</span> {t('billing.plan')}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 text-sm font-medium rounded-full capitalize ${
              subscriptionStatus === 'active' ? 'bg-ion/10 text-ion' :
              subscriptionStatus === 'past_due' ? 'bg-warning/10 text-warning' :
              subscriptionStatus === 'canceled' ? 'bg-error/10 text-error' :
              'bg-light-soft text-text-secondary'
            }`}>
              {subscriptionStatus === 'active' && currentPlan === 'free' ? t('billing.freeTier') : subscriptionStatus}
            </span>
            {currentPlan !== 'free' && (
              <button
                onClick={handleManageSubscription}
                disabled={upgradeLoading === 'portal'}
                className="text-sm text-ion hover:opacity-80 flex items-center"
              >
                {upgradeLoading === 'portal' ? 'Loading...' : 'Manage Subscription'}
                <ExternalLinkIcon />
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-light-soft dark:bg-dark-soft rounded-button">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-text-secondary dark:text-text-dark-secondary">{t('billing.usage.dataScanned')}</span>
              <span className="text-sm text-text-secondary dark:text-text-dark-secondary">{t('billing.usage.thisPeriod')}</span>
            </div>
            <p className="text-2xl font-bold text-text-primary dark:text-text-dark-primary">
              {usage.gbScanned.toFixed(2)} GB
              <span className="text-sm font-normal text-text-secondary dark:text-text-dark-secondary ml-1">/ {usage.gbLimit} GB</span>
            </p>
            <div className="mt-2 w-full h-2 bg-light-border dark:bg-dark-border rounded-full">
              <div
                className={`h-full rounded-full ${usage.gbScanned >= usage.gbLimit ? 'bg-error' : 'bg-ion'}`}
                style={{ width: `${Math.min((usage.gbScanned / usage.gbLimit) * 100, 100)}%` }}
              />
            </div>
          </div>

          <div className="p-4 bg-light-soft dark:bg-dark-soft rounded-button">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-text-secondary dark:text-text-dark-secondary">{t('billing.usage.runs')}</span>
              <span className="text-sm text-text-secondary dark:text-text-dark-secondary">{t('billing.usage.thisMonth')}</span>
            </div>
            <p className="text-2xl font-bold text-text-primary dark:text-text-dark-primary">
              {usage.runs}
              <span className="text-sm font-normal text-text-secondary dark:text-text-dark-secondary ml-1">/ {usage.runsLimit === 999999 ? '∞' : usage.runsLimit}</span>
            </p>
            <div className="mt-2 w-full h-2 bg-light-border dark:bg-dark-border rounded-full">
              <div
                className={`h-full rounded-full ${usage.runs >= usage.runsLimit ? 'bg-error' : 'bg-success'}`}
                style={{ width: `${usage.runsLimit === 999999 ? 5 : Math.min((usage.runs / usage.runsLimit) * 100, 100)}%` }}
              />
            </div>
          </div>

          <div className="p-4 bg-light-soft dark:bg-dark-soft rounded-button">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-text-secondary dark:text-text-dark-secondary">{t('billing.usage.connectors')}</span>
              <span className="text-sm text-text-secondary dark:text-text-dark-secondary">{t('billing.usage.active')}</span>
            </div>
            <p className="text-2xl font-bold text-text-primary dark:text-text-dark-primary">
              {usage.connectors}
              <span className="text-sm font-normal text-text-secondary dark:text-text-dark-secondary ml-1">/ {usage.connectorsLimit === 999999 ? '∞' : usage.connectorsLimit}</span>
            </p>
            <div className="mt-2 w-full h-2 bg-light-border dark:bg-dark-border rounded-full">
              <div
                className={`h-full rounded-full ${usage.connectors >= usage.connectorsLimit ? 'bg-error' : 'bg-info'}`}
                style={{ width: `${usage.connectorsLimit === 999999 ? 5 : Math.min((usage.connectors / usage.connectorsLimit) * 100, 100)}%` }}
              />
            </div>
          </div>

          {/* OCR Pages Usage */}
          <div className="p-4 bg-light-soft dark:bg-dark-soft rounded-button">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-text-secondary dark:text-text-dark-secondary">OCR Pages</span>
              <span className="text-sm text-text-secondary dark:text-text-dark-secondary">This Month</span>
            </div>
            <p className="text-2xl font-bold text-text-primary dark:text-text-dark-primary">
              {usage.ocrPages}
              <span className="text-sm font-normal text-text-secondary dark:text-text-dark-secondary ml-1">
                / {usage.ocrPagesLimit === 0 ? 'N/A' : usage.ocrPagesLimit}
              </span>
            </p>
            {usage.ocrPagesLimit > 0 && (
              <div className="mt-2 w-full h-2 bg-light-border dark:bg-dark-border rounded-full">
                <div
                  className={`h-full rounded-full ${usage.ocrPages >= usage.ocrPagesLimit ? 'bg-error' : 'bg-purple-500'}`}
                  style={{ width: `${Math.min((usage.ocrPages / usage.ocrPagesLimit) * 100, 100)}%` }}
                />
              </div>
            )}
            {usage.ocrPages > 0 && (
              <p className="mt-2 text-xs text-text-secondary dark:text-text-dark-secondary">
                Cost: ${usage.ocrCost} (${(0.01).toFixed(2)}/page)
              </p>
            )}
            {usage.ocrPagesLimit === 0 && (
              <p className="mt-2 text-xs text-warning">
                Upgrade to Pro or Business to use OCR
              </p>
            )}
          </div>
        </div>

        <p className="mt-4 text-sm text-text-secondary dark:text-text-dark-secondary">
          {t('billing.resetInfo')}
        </p>
      </div>

      {/* Available plans */}
      <div>
        <h2 className="text-lg font-semibold text-text-primary mb-4">Available Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              {...plan}
              loading={upgradeLoading === plan.id}
              onSelect={() => handleUpgrade(plan.id)}
            />
          ))}
        </div>
      </div>

      {/* Enterprise contact */}
      <div className="bg-slate rounded-xl p-6 text-white">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-text-inverse">Need more?</h3>
            <p className="text-text-dark-secondary text-sm mt-1">
              Contact us for custom enterprise plans with unlimited usage and dedicated support.
            </p>
          </div>
          <a
            href="mailto:sales@skatalystai.com"
            className="px-6 py-2 bg-white text-slate font-medium rounded-button hover:bg-light-soft transition-colors whitespace-nowrap"
          >
            Contact Sales
          </a>
        </div>
      </div>

      {/* Billing history */}
      <div className="bg-light-surface rounded-xl border border-light-border p-6">
        <h2 className="text-lg font-semibold text-text-primary mb-4">Billing History</h2>
        {invoicesLoading ? (
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-light-soft rounded" />
            ))}
          </div>
        ) : invoices.length > 0 ? (
          <div>
            {invoices.map((invoice) => (
              <InvoiceRow key={invoice.id} invoice={invoice} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <svg className="w-12 h-12 mx-auto text-light-border mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-text-secondary text-sm">No billing history yet</p>
            <p className="text-text-secondary/70 text-xs mt-1">
              Invoices will appear here once you upgrade to a paid plan.
            </p>
          </div>
        )}
      </div>

      {/* FAQ */}
      <div className="bg-light-surface rounded-xl border border-light-border p-6">
        <h2 className="text-lg font-semibold text-text-primary mb-4">Billing FAQ</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-text-primary text-sm">When do limits reset?</h3>
            <p className="text-text-secondary text-sm mt-1">
              Run limits reset on the 1st of each month. Data processing limits are cumulative and don't reset.
            </p>
          </div>
          <div>
            <h3 className="font-medium text-text-primary text-sm">Can I change plans anytime?</h3>
            <p className="text-text-secondary text-sm mt-1">
              Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.
            </p>
          </div>
          <div>
            <h3 className="font-medium text-text-primary text-sm">What payment methods do you accept?</h3>
            <p className="text-text-secondary text-sm mt-1">
              We accept all major credit cards through Stripe. For enterprise plans, we also support invoicing.
            </p>
          </div>
          <div>
            <h3 className="font-medium text-text-primary text-sm">What happens if my payment fails?</h3>
            <p className="text-text-secondary text-sm mt-1">
              We'll retry the payment and notify you. Your account will be marked as past due until resolved.
              You can update your payment method in the customer portal.
            </p>
          </div>
        </div>
        <Link
          to="/pricing"
          className="inline-flex items-center text-sm text-ion hover:opacity-80 mt-4 transition-opacity"
        >
          View full pricing details
          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
