import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';

// Email icon
const EmailIcon = () => (
  <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

// Check icon
const CheckIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

export default function VerifyEmail() {
  const { t } = useTranslation();
  const { user, authFetch } = useAuth();
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [error, setError] = useState(null);

  const handleResend = async () => {
    setResending(true);
    setError(null);
    setResent(false);

    try {
      const response = await authFetch('/auth/resend-verification', {
        method: 'POST'
      });

      if (response.ok) {
        setResent(true);
      } else {
        const data = await response.json();
        setError(data.message || t('errors.generic'));
      }
    } catch (err) {
      setError(t('errors.networkError'));
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-light-bg flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo */}
        <Link to="/" className="flex justify-center">
          <div className="w-12 h-12 bg-slate rounded-button flex items-center justify-center shadow-button">
            <span className="text-white font-bold text-xl">S</span>
          </div>
        </Link>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-light-surface py-8 px-4 shadow-md rounded-2xl sm:px-10 border border-light-border text-center">
          {/* Icon */}
          <div className="flex justify-center mb-6 text-ion">
            <EmailIcon />
          </div>

          {/* Title */}
          <h2 className="text-2xl font-semibold text-text-primary mb-2">
            {t('auth.verification.title')}
          </h2>

          {/* Subtitle with email */}
          <p className="text-text-secondary mb-6">
            {t('auth.verification.subtitle', { email: user?.email || 'your email' })}
          </p>

          {/* Instructions */}
          <p className="text-sm text-text-secondary mb-8">
            {t('auth.verification.checkInbox')}
          </p>

          {/* Success message */}
          {resent && (
            <div className="mb-6 flex items-center justify-center gap-2 bg-success-bg border border-success/20 text-success px-4 py-3 rounded-button text-sm">
              <CheckIcon />
              {t('auth.verification.resent')}
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="mb-6 bg-error-bg border border-error/20 text-error px-4 py-3 rounded-button text-sm">
              {error}
            </div>
          )}

          {/* Resend section */}
          <div className="border-t border-light-border pt-6">
            <p className="text-sm text-text-secondary mb-4">
              {t('auth.verification.didntReceive')}
            </p>
            <p className="text-xs text-text-secondary mb-4">
              {t('auth.verification.checkSpam')}
            </p>
            <button
              onClick={handleResend}
              disabled={resending || resent}
              className={`w-full py-3 px-4 rounded-button font-medium transition-colors ${
                resending || resent
                  ? 'bg-light-soft text-text-secondary cursor-not-allowed'
                  : 'bg-slate text-white hover:bg-slate-hover shadow-button'
              }`}
            >
              {resending ? t('auth.verification.resending') : t('auth.verification.resend')}
            </button>
          </div>

          {/* Back to login */}
          <p className="mt-6 text-sm text-text-secondary">
            <Link
              to="/login"
              className="font-medium text-ion hover:opacity-80 transition-opacity"
            >
              {t('common.back')} {t('common.login').toLowerCase()}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
