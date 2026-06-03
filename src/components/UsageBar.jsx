import React from 'react';

// Progress bar component for usage metrics
export default function UsageBar({
  label,
  current,
  limit,
  unit = '',
  showPercentage = true
}) {
  const percentage = Math.min((current / limit) * 100, 100);
  const isNearLimit = percentage >= 80;
  const isAtLimit = percentage >= 100;

  // BRAND_DNA compliant colors
  // Normal: Catalyst Ion (#2FA4A9)
  // Warning (80%+): Amber Clay (#C58B3A)
  // Error (100%): Oxide Red (#8C3A3A)
  let barColor = 'bg-ion';
  let bgColor = 'bg-light-soft';
  let textColor = 'text-text-secondary';
  let warningText = '';

  if (isAtLimit) {
    barColor = 'bg-error';
    textColor = 'text-error';
    warningText = 'Limit reached. Upgrade to continue.';
  } else if (isNearLimit) {
    barColor = 'bg-warning';
    textColor = 'text-warning';
    warningText = 'Approaching limit. Consider upgrading.';
  }

  const formatValue = (value) => {
    if (typeof value === 'number') {
      return value % 1 === 0 ? value.toString() : value.toFixed(2);
    }
    return value;
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-text-primary">{label}</span>
        <span className={`text-sm font-medium ${textColor}`}>
          {formatValue(current)}{unit} / {formatValue(limit)}{unit}
          {showPercentage && (
            <span className="ml-2 text-text-secondary">({Math.round(percentage)}%)</span>
          )}
        </span>
      </div>
      <div className={`w-full h-2 ${bgColor} rounded-full overflow-hidden`}>
        <div
          className={`h-full ${barColor} rounded-full transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {warningText && (
        <p className={`text-xs ${textColor}`}>
          {warningText}
        </p>
      )}
    </div>
  );
}

// Compact usage summary card
export function UsageSummaryCard({ usage, onUpgradeClick }) {
  const { gbScanned, gbLimit, runs, runsLimit, connectors, connectorsLimit } = usage;

  return (
    <div className="bg-light-surface rounded-2xl border border-light-border p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-text-primary">Usage This Period</h3>
        <span className="text-xs px-2 py-1 bg-ion/10 text-ion rounded-full font-medium">
          Free Tier
        </span>
      </div>
      <div className="space-y-4">
        <UsageBar
          label="Data Scanned"
          current={gbScanned}
          limit={gbLimit}
          unit=" GB"
        />
        <UsageBar
          label="Runs"
          current={runs}
          limit={runsLimit}
          showPercentage={false}
        />
        <UsageBar
          label="Connectors"
          current={connectors}
          limit={connectorsLimit}
          showPercentage={false}
        />
      </div>
      <button
        onClick={onUpgradeClick}
        className="mt-4 w-full text-center text-sm font-medium text-ion hover:opacity-80 transition-opacity"
      >
        Upgrade for more
      </button>
    </div>
  );
}
