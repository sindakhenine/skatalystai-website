import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Icons
const CheckIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const FolderIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
  </svg>
);

const DatabaseIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
  </svg>
);

const ShieldIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const SparklesIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
);

const RocketIcon = () => (
  <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
  </svg>
);

const PlugIcon = () => (
  <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
  </svg>
);

// Use case option component
function UseCaseOption({ id, icon, title, description, selected, onSelect }) {
  return (
    <label
      className={`flex items-start gap-4 p-4 border rounded-xl cursor-pointer transition-colors ${
        selected
          ? 'border-ion bg-ion/10'
          : 'border-light-border hover:bg-light-soft'
      }`}
    >
      <input
        type="radio"
        name="useCase"
        value={id}
        checked={selected}
        onChange={() => onSelect(id)}
        className="sr-only"
      />
      <div className={`p-2 rounded-lg ${selected ? 'bg-ion text-white' : 'bg-light-soft text-text-secondary'}`}>
        {icon}
      </div>
      <div className="flex-1">
        <span className="block text-sm font-medium text-text-primary">{title}</span>
        <span className="block text-xs text-text-secondary mt-1">{description}</span>
      </div>
      {selected && (
        <div className="text-ion">
          <CheckIcon />
        </div>
      )}
    </label>
  );
}

// Step indicator
function StepIndicator({ currentStep, totalSteps }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {Array.from({ length: totalSteps }, (_, i) => (
        <div
          key={i}
          className={`h-2 rounded-full transition-all ${
            i === currentStep
              ? 'w-8 bg-ion'
              : i < currentStep
              ? 'w-2 bg-ion'
              : 'w-2 bg-light-border'
          }`}
        />
      ))}
    </div>
  );
}

export default function OnboardingWizard({ onComplete, onConnectSource }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, authFetch } = useAuth();
  const [step, setStep] = useState(0);
  const [workspaceName, setWorkspaceName] = useState(user?.tenant_name || '');
  const [useCase, setUseCase] = useState('dataOrganization');
  const [saving, setSaving] = useState(false);

  const totalSteps = 4; // Added "Connect first data source" step

  const useCases = [
    {
      id: 'dataOrganization',
      icon: <FolderIcon />,
      title: t('auth.onboarding.useCase.dataOrganization'),
      description: t('auth.onboarding.useCase.dataOrganizationDesc')
    },
    {
      id: 'schemaMigration',
      icon: <DatabaseIcon />,
      title: t('auth.onboarding.useCase.schemaMigration'),
      description: t('auth.onboarding.useCase.schemaMigrationDesc')
    },
    {
      id: 'compliance',
      icon: <ShieldIcon />,
      title: t('auth.onboarding.useCase.compliance'),
      description: t('auth.onboarding.useCase.complianceDesc')
    },
    {
      id: 'other',
      icon: <SparklesIcon />,
      title: t('auth.onboarding.useCase.other'),
      description: t('auth.onboarding.useCase.otherDesc')
    }
  ];

  const handleNext = () => {
    if (step < totalSteps - 1) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const handleFinish = async () => {
    setSaving(true);
    try {
      // Save onboarding preferences
      await authFetch('/auth/complete-onboarding', {
        method: 'POST',
        body: JSON.stringify({
          workspaceName,
          useCase
        })
      });
      onComplete();
    } catch (err) {
      console.error('Onboarding error:', err);
      // Complete anyway to not block the user
      onComplete();
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-light-surface rounded-2xl shadow-xl w-full max-w-lg mx-4 overflow-hidden">
        {/* Header */}
        <div className="px-8 pt-8 pb-4">
          <StepIndicator currentStep={step} totalSteps={totalSteps} />

          {/* Step 0: Welcome */}
          {step === 0 && (
            <div className="text-center">
              <div className="flex justify-center mb-6 text-ion">
                <RocketIcon />
              </div>
              <h2 className="text-2xl font-semibold text-text-primary mb-2">
                {t('auth.onboarding.welcome')}
              </h2>
              <p className="text-text-secondary">
                {t('auth.onboarding.letsGetStarted')}
              </p>
            </div>
          )}

          {/* Step 1: Workspace name */}
          {step === 1 && (
            <div>
              <h2 className="text-xl font-semibold text-text-primary mb-2 text-center">
                {t('auth.onboarding.step1Title')}
              </h2>
              <p className="text-sm text-text-secondary mb-6 text-center">
                {t('auth.onboarding.step1Desc')}
              </p>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  {t('auth.onboarding.workspaceName')}
                </label>
                <input
                  type="text"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  placeholder={t('auth.onboarding.workspaceNamePlaceholder')}
                  className="w-full px-4 py-3 border border-light-border rounded-button shadow-sm focus:outline-none focus:ring-2 focus:ring-ion/40 focus:border-ion transition-colors"
                />
              </div>
            </div>
          )}

          {/* Step 2: Use case selection */}
          {step === 2 && (
            <div>
              <h2 className="text-xl font-semibold text-text-primary mb-2 text-center">
                {t('auth.onboarding.step2Title')}
              </h2>
              <p className="text-sm text-text-secondary mb-6 text-center">
                {t('auth.onboarding.step2Desc')}
              </p>
              <div className="space-y-3">
                {useCases.map((uc) => (
                  <UseCaseOption
                    key={uc.id}
                    id={uc.id}
                    icon={uc.icon}
                    title={uc.title}
                    description={uc.description}
                    selected={useCase === uc.id}
                    onSelect={setUseCase}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Connect first data source */}
          {step === 3 && (
            <div className="text-center">
              <div className="flex justify-center mb-6 text-ion">
                <PlugIcon />
              </div>
              <h2 className="text-2xl font-semibold text-text-primary mb-2">
                {t('auth.onboarding.step3Title')}
              </h2>
              <p className="text-text-secondary mb-6">
                {t('auth.onboarding.step3Desc')}
              </p>
              <div className="bg-light-soft rounded-xl p-6 text-left">
                <h3 className="font-medium text-text-primary mb-3">{t('auth.onboarding.nextSteps')}</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-ion text-white rounded-full flex items-center justify-center text-sm font-medium">1</span>
                    <span className="text-sm text-text-secondary">{t('auth.onboarding.nextStep1')}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-light-border text-text-secondary rounded-full flex items-center justify-center text-sm font-medium">2</span>
                    <span className="text-sm text-text-secondary">{t('auth.onboarding.nextStep2')}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-light-border text-text-secondary rounded-full flex items-center justify-center text-sm font-medium">3</span>
                    <span className="text-sm text-text-secondary">{t('auth.onboarding.nextStep3')}</span>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-6 bg-light-soft border-t border-light-border flex items-center justify-between">
          <button
            onClick={handleSkip}
            className="text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            {t('auth.onboarding.skipForNow')}
          </button>
          <div className="flex items-center gap-3">
            {step > 0 && (
              <button
                onClick={handleBack}
                className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
              >
                {t('common.back')}
              </button>
            )}
            {step < totalSteps - 1 ? (
              <button
                onClick={handleNext}
                className="px-6 py-2 bg-slate text-white text-sm font-medium rounded-button hover:bg-slate-hover shadow-button transition-colors"
              >
                {t('common.next')}
              </button>
            ) : (
              <button
                onClick={handleFinish}
                disabled={saving}
                className="px-6 py-2 bg-ion text-white text-sm font-medium rounded-button hover:opacity-90 shadow-button transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {saving ? t('common.loading') : (
                  <>
                    {t('auth.onboarding.connectSource')}
                    <ArrowRightIcon />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Onboarding Banner - shows until first run is complete
export function OnboardingBanner({ onDismiss, onConnectSource }) {
  const { t } = useTranslation();
  const [dismissed, setDismissed] = useState(() => {
    return localStorage.getItem('onboardingBannerDismissed') === 'true';
  });

  if (dismissed) return null;

  const handleDismiss = () => {
    localStorage.setItem('onboardingBannerDismissed', 'true');
    setDismissed(true);
    onDismiss?.();
  };

  return (
    <div className="bg-gradient-to-r from-ion to-slate rounded-xl p-4 mb-6 shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h3 className="text-white font-semibold">{t('onboarding.banner.title')}</h3>
            <p className="text-white/80 text-sm">{t('onboarding.banner.description')}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onConnectSource}
            className="px-4 py-2 bg-white text-slate font-medium text-sm rounded-lg hover:bg-white/90 transition-colors"
          >
            {t('onboarding.banner.connectCta')}
          </button>
          <button
            onClick={handleDismiss}
            className="p-1 text-white/60 hover:text-white transition-colors"
            title={t('common.close')}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
