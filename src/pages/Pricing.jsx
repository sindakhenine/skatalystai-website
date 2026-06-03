import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PublicLayout from '../components/PublicLayout';
import { usePricing, basePrices } from '../contexts/PricingContext';

// Check icon
const CheckIcon = () => (
  <svg className="w-5 h-5 text-success" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
  </svg>
);

// Plan card component
function PlanCard({ name, price, period, periodLabel, description, features, cta, ctaLink, highlighted, disabled, comingSoonLabel }) {
  return (
    <div
      className={`relative rounded-2xl p-8 ${
        highlighted
          ? 'bg-slate text-white ring-4 ring-ion ring-offset-4'
          : 'bg-light-surface border border-light-border'
      }`}
    >
      {highlighted && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-ion text-white text-xs font-semibold px-3 py-1 rounded-full">
          {periodLabel}
        </div>
      )}
      <div className="mb-6">
        <h3 className={`text-xl font-bold ${highlighted ? 'text-white' : 'text-text-primary'}`}>
          {name}
        </h3>
        <p className={`mt-1 text-sm ${highlighted ? 'text-text-dark-secondary' : 'text-text-secondary'}`}>
          {description}
        </p>
      </div>
      <div className="mb-6">
        <span className={`text-4xl font-bold ${highlighted ? 'text-white' : 'text-text-primary'}`}>
          {price}
        </span>
        {period && (
          <span className={`text-sm ${highlighted ? 'text-text-dark-secondary' : 'text-text-secondary'}`}>
            {period}
          </span>
        )}
      </div>
      <ul className="space-y-3 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-3">
            <div className={`mt-0.5 ${highlighted ? 'text-ion' : ''}`}>
              <CheckIcon />
            </div>
            <span className={`text-sm ${highlighted ? 'text-text-dark-secondary' : 'text-text-secondary'}`}>
              {feature}
            </span>
          </li>
        ))}
      </ul>
      {disabled ? (
        <button
          disabled
          className="w-full py-3 px-4 rounded-button font-medium text-text-secondary bg-light-soft cursor-not-allowed"
        >
          {comingSoonLabel}
        </button>
      ) : (
        <Link
          to={ctaLink}
          className={`block w-full py-3 px-4 rounded-button font-medium text-center transition-colors ${
            highlighted
              ? 'bg-white text-slate hover:bg-light-soft'
              : 'bg-slate text-white hover:bg-slate-hover shadow-button'
          }`}
        >
          {cta}
        </Link>
      )}
    </div>
  );
}

// Feature comparison row
function ComparisonRow({ feature, free, pro, business, enterprise }) {
  const renderValue = (value) => {
    if (value === true) {
      return <CheckIcon />;
    }
    if (value === false) {
      return <span className="text-light-border">—</span>;
    }
    return <span className="text-sm text-text-secondary">{value}</span>;
  };

  return (
    <tr className="border-b border-light-divider">
      <td className="py-4 text-sm text-text-primary">{feature}</td>
      <td className="py-4 text-center">{renderValue(free)}</td>
      <td className="py-4 text-center">{renderValue(pro)}</td>
      <td className="py-4 text-center">{renderValue(business)}</td>
      <td className="py-4 text-center">{renderValue(enterprise)}</td>
    </tr>
  );
}

export default function Pricing() {
  const { t } = useTranslation();
  const { formatPrice } = usePricing();

  const plans = [
    {
      name: t('pricing.free'),
      price: formatPrice(basePrices.free),
      period: t('pricing.forever'),
      description: 'Perfect for trying out SkatalystAI',
      features: [
        t('pricing.features.dataProcessing', { amount: '1 GB' }),
        t('pricing.features.runsPerMonth', { count: 5 }),
        t('pricing.features.connectors', { count: 2 }),
        t('pricing.features.basicTheme'),
        'Community support',
      ],
      cta: t('common.getStarted'),
      ctaLink: '/signup',
    },
    {
      name: t('pricing.pro'),
      price: formatPrice(basePrices.pro),
      period: t('pricing.perMonth'),
      periodLabel: t('pricing.mostPopular'),
      description: 'For individuals and small teams',
      features: [
        t('pricing.features.dataProcessing', { amount: '25 GB' }),
        t('pricing.features.runsPerMonth', { count: 50 }),
        t('pricing.features.connectors', { count: 10 }),
        t('pricing.features.advancedAI'),
        t('pricing.features.prioritySupport'),
        t('pricing.features.customFormats'),
      ],
      cta: 'Start Free Trial',
      ctaLink: '/signup',
      highlighted: true,
      disabled: true,
    },
    {
      name: t('pricing.business'),
      price: formatPrice(basePrices.business),
      period: t('pricing.perMonth'),
      description: 'For growing organizations',
      features: [
        t('pricing.features.dataProcessing', { amount: '100 GB' }),
        t('pricing.features.unlimitedRuns'),
        t('pricing.features.unlimitedConnectors'),
        t('pricing.features.teamCollaboration'),
        t('pricing.features.apiAccess'),
        t('pricing.features.ssoAudit'),
      ],
      cta: t('pricing.contactSales'),
      ctaLink: '/signup',
      disabled: true,
    },
    {
      name: t('pricing.enterprise'),
      price: formatPrice(basePrices.enterprise),
      period: null,
      description: 'For large-scale deployments',
      features: [
        'Unlimited everything',
        t('pricing.features.onPremise'),
        'Custom integrations',
        t('pricing.features.dedicatedSupport'),
        t('pricing.features.slaGuarantee'),
        'Custom contracts',
      ],
      cta: t('pricing.contactSales'),
      ctaLink: 'mailto:sales@skatalystai.com',
      disabled: true,
    },
  ];

  const comparisonFeatures = [
    { feature: 'Data processing', free: '1 GB', pro: '25 GB', business: '100 GB', enterprise: 'Unlimited' },
    { feature: 'Runs per month', free: '5', pro: '50', business: 'Unlimited', enterprise: 'Unlimited' },
    { feature: 'Connectors', free: '2', pro: '10', business: 'Unlimited', enterprise: 'Unlimited' },
    { feature: 'Theme detection', free: true, pro: true, business: true, enterprise: true },
    { feature: 'Advanced AI analysis', free: false, pro: true, business: true, enterprise: true },
    { feature: 'Custom output formats', free: false, pro: true, business: true, enterprise: true },
    { feature: 'Team collaboration', free: false, pro: false, business: true, enterprise: true },
    { feature: 'API access', free: false, pro: false, business: true, enterprise: true },
    { feature: 'SSO', free: false, pro: false, business: true, enterprise: true },
    { feature: 'On-premise', free: false, pro: false, business: false, enterprise: true },
    { feature: 'Support', free: 'Community', pro: 'Priority', business: 'Priority', enterprise: 'Dedicated' },
  ];

  return (
    <PublicLayout>
      {/* Header */}
      <section className="py-16 bg-light-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold text-text-primary mb-4">
            {t('pricing.title')}
          </h1>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto">
            {t('pricing.subtitle')}
          </p>
        </div>
      </section>

      {/* Plan Cards */}
      <section className="py-12 bg-light-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {plans.map((plan) => (
              <PlanCard key={plan.name} {...plan} comingSoonLabel={t('pricing.comingSoon')} />
            ))}
          </div>
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="py-16 bg-light-soft">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-text-primary mb-8 text-center">
            Compare plans
          </h2>
          <div className="bg-light-surface rounded-xl border border-light-border overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-light-soft border-b border-light-border">
                  <th className="py-4 px-6 text-left text-sm font-semibold text-text-primary">Feature</th>
                  <th className="py-4 px-4 text-center text-sm font-semibold text-text-primary">Free</th>
                  <th className="py-4 px-4 text-center text-sm font-semibold text-ion">Pro</th>
                  <th className="py-4 px-4 text-center text-sm font-semibold text-text-primary">Business</th>
                  <th className="py-4 px-4 text-center text-sm font-semibold text-text-primary">Enterprise</th>
                </tr>
              </thead>
              <tbody className="px-6">
                {comparisonFeatures.map((row) => (
                  <ComparisonRow key={row.feature} {...row} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-light-surface">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-text-primary mb-8 text-center">
            Pricing FAQ
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-text-primary mb-2">
                Can I change plans anytime?
              </h3>
              <p className="text-text-secondary text-sm">
                Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately,
                and we'll prorate your billing accordingly.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-text-primary mb-2">
                What happens when I reach my limits?
              </h3>
              <p className="text-text-secondary text-sm">
                We'll notify you when you're approaching your limits. You can upgrade your plan or wait
                until your limits reset at the start of your billing cycle.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-text-primary mb-2">
                Is there a free trial for paid plans?
              </h3>
              <p className="text-text-secondary text-sm">
                Yes, Pro and Business plans include a 14-day free trial. No credit card required to start.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-text-primary mb-2">
                Do you offer discounts for annual billing?
              </h3>
              <p className="text-text-secondary text-sm">
                Yes, annual plans receive a 20% discount compared to monthly billing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-slate">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Ready to get started?
          </h2>
          <p className="text-text-dark-secondary max-w-xl mx-auto mb-8">
            Start with our free tier and upgrade when you need more power.
          </p>
          <Link
            to="/signup"
            className="inline-flex items-center justify-center px-8 py-3 text-base font-medium text-slate bg-white rounded-button hover:bg-light-soft transition-colors"
          >
            Create Free Account
          </Link>
        </div>
      </section>
    </PublicLayout>
  );
}
