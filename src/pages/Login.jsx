import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';

// Google icon SVG
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

// Microsoft icon SVG
const MicrosoftIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path fill="#F25022" d="M1 1h10v10H1z" />
    <path fill="#00A4EF" d="M1 13h10v10H1z" />
    <path fill="#7FBA00" d="M13 1h10v10H13z" />
    <path fill="#FFB900" d="M13 13h10v10H13z" />
  </svg>
);

// GitHub icon SVG
const GitHubIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
  </svg>
);

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, loginWithGoogle, loginWithMicrosoft, loginWithGithub, loading } = useAuth();
  const { t } = useTranslation();
  const [rememberMe, setRememberMe] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/app/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Handle OAuth errors from callback
  const error = searchParams.get('error');
  const getErrorMessage = (errorCode) => {
    switch (errorCode) {
      case 'access_denied':
        return t('auth.errors.accessDenied');
      case 'no_code':
        return t('auth.errors.noCode');
      case 'auth_failed':
        return t('auth.errors.authFailed');
      default:
        return t('auth.errors.generic');
    }
  };

  const handleGoogleLogin = () => {
    loginWithGoogle('personal', rememberMe);
  };

  const handleMicrosoftLogin = () => {
    loginWithMicrosoft('personal', rememberMe);
  };

  const handleGithubLogin = () => {
    loginWithGithub('personal', rememberMe);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-light-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light-bg flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo */}
        <Link to="/" className="flex justify-center">
          <img
            src={require('../assets/logo.png')}
            alt="SKatalyst"
            className="h-16 w-auto"
          />
        </Link>
        <h2 className="mt-6 text-center text-3xl font-semibold tracking-tight text-text-primary">
          {t('auth.welcomeBack')}
        </h2>
        <p className="mt-2 text-center text-sm text-text-secondary">
          {t('auth.signInSubtitle')}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-light-surface py-8 px-4 shadow-md rounded-2xl sm:px-10 border border-light-border">
          {/* Error message */}
          {error && (
            <div className="mb-6 bg-error-bg border border-error/20 text-error px-4 py-3 rounded-button text-sm">
              {getErrorMessage(error)}
            </div>
          )}

          {/* Google OAuth button - Active */}
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-light-border rounded-button shadow-sm bg-light-surface text-text-primary font-medium hover:bg-light-soft focus:outline-none focus:ring-2 focus:ring-ion/40 transition-colors"
          >
            <GoogleIcon />
            {t('auth.continueWithGoogle')}
          </button>

          {/* Remember me checkbox */}
          <label className="flex items-center gap-2 mt-4 cursor-pointer">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded border-light-border text-ion focus:ring-ion/40"
            />
            <span className="text-sm text-text-secondary">
              {t('auth.rememberMe')}
            </span>
          </label>

          {/* Microsoft OAuth button */}
          <button
            onClick={handleMicrosoftLogin}
            className="mt-3 w-full flex items-center justify-center gap-3 px-4 py-3 border border-light-border rounded-button shadow-sm bg-light-surface text-text-primary font-medium hover:bg-light-soft focus:outline-none focus:ring-2 focus:ring-ion/40 transition-colors"
          >
            <MicrosoftIcon />
            {t('auth.continueWithMicrosoft')}
          </button>

          {/* GitHub OAuth button */}
          <button
            onClick={handleGithubLogin}
            className="mt-3 w-full flex items-center justify-center gap-3 px-4 py-3 border border-light-border rounded-button shadow-sm bg-light-surface text-text-primary font-medium hover:bg-light-soft focus:outline-none focus:ring-2 focus:ring-ion/40 transition-colors"
          >
            <GitHubIcon />
            {t('auth.continueWithGithub', 'Continue with GitHub')}
          </button>

          {/* OAuth-only notice */}
          <div className="mt-6 p-3 bg-light-soft border border-light-border rounded-button">
            <p className="text-xs text-text-secondary text-center">
              {t('auth.oauthOnly', 'SKatalyst AI uses secure OAuth authentication. Password-based accounts are not supported.')}
            </p>
          </div>
        </div>

        {/* Footer links */}
        <p className="mt-6 text-center text-xs text-text-secondary">
          {t('auth.agreeTerms')}{' '}
          <Link to="/legal/terms" className="text-text-primary hover:text-ion transition-colors">
            {t('auth.termsOfService')}
          </Link>{' '}
          {t('auth.and')}{' '}
          <Link to="/legal/privacy" className="text-text-primary hover:text-ion transition-colors">
            {t('auth.privacyPolicy')}
          </Link>
        </p>
      </div>
    </div>
  );
}
