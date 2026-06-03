import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';

// Warning icon
const WarningIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

// Session timeout warning dialog
function TimeoutWarning({ onStaySignedIn, onLogout, secondsRemaining }) {
  const { t } = useTranslation();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-light-surface rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6 text-center">
        <div className="flex justify-center mb-4 text-warning">
          <WarningIcon />
        </div>
        <h3 className="text-lg font-semibold text-text-primary mb-2">
          {t('auth.sessionExpiring')}
        </h3>
        <p className="text-sm text-text-secondary mb-6">
          Your session will expire in {secondsRemaining} seconds.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onLogout}
            className="flex-1 px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary border border-light-border rounded-button transition-colors"
          >
            {t('common.logout')}
          </button>
          <button
            onClick={onStaySignedIn}
            className="flex-1 px-4 py-2 bg-ion text-white text-sm font-medium rounded-button hover:opacity-90 transition-colors"
          >
            {t('auth.staySignedIn')}
          </button>
        </div>
      </div>
    </div>
  );
}

// Session expired dialog
function SessionExpired({ onLogin }) {
  const { t } = useTranslation();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-light-surface rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6 text-center">
        <div className="flex justify-center mb-4 text-error">
          <WarningIcon />
        </div>
        <h3 className="text-lg font-semibold text-text-primary mb-2">
          {t('auth.sessionExpired')}
        </h3>
        <p className="text-sm text-text-secondary mb-6">
          Please sign in again to continue.
        </p>
        <button
          onClick={onLogin}
          className="w-full px-4 py-2 bg-slate text-white text-sm font-medium rounded-button hover:bg-slate-hover shadow-button transition-colors"
        >
          {t('common.login')}
        </button>
      </div>
    </div>
  );
}

export default function SessionTimeoutHandler({ children }) {
  const { isAuthenticated, refreshToken, logout } = useAuth();
  const navigate = useNavigate();
  const [showWarning, setShowWarning] = useState(false);
  const [showExpired, setShowExpired] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(60);

  // Track user activity
  const [lastActivity, setLastActivity] = useState(Date.now());

  const resetActivity = useCallback(() => {
    setLastActivity(Date.now());
    setShowWarning(false);
  }, []);

  // Listen for user activity
  useEffect(() => {
    if (!isAuthenticated) return;

    const events = ['mousedown', 'keydown', 'touchstart', 'scroll'];
    const handleActivity = () => resetActivity();

    events.forEach(event => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [isAuthenticated, resetActivity]);

  // Check for inactivity
  useEffect(() => {
    if (!isAuthenticated) return;

    // Show warning after 13 minutes of inactivity (tokens expire at 15 min)
    const WARNING_THRESHOLD = 13 * 60 * 1000;
    // Session expires after 15 minutes
    const EXPIRY_THRESHOLD = 15 * 60 * 1000;

    const checkInterval = setInterval(() => {
      const inactiveTime = Date.now() - lastActivity;

      if (inactiveTime >= EXPIRY_THRESHOLD) {
        setShowExpired(true);
        setShowWarning(false);
        logout();
      } else if (inactiveTime >= WARNING_THRESHOLD && !showWarning) {
        setShowWarning(true);
        setSecondsRemaining(Math.floor((EXPIRY_THRESHOLD - inactiveTime) / 1000));
      }
    }, 1000);

    return () => clearInterval(checkInterval);
  }, [isAuthenticated, lastActivity, showWarning, logout]);

  // Countdown timer when warning is shown
  useEffect(() => {
    if (!showWarning) return;

    const countdown = setInterval(() => {
      setSecondsRemaining(prev => {
        if (prev <= 1) {
          clearInterval(countdown);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdown);
  }, [showWarning]);

  const handleStaySignedIn = async () => {
    const newToken = await refreshToken();
    if (newToken) {
      resetActivity();
    } else {
      setShowExpired(true);
      setShowWarning(false);
    }
  };

  const handleLogout = () => {
    logout();
    setShowWarning(false);
    navigate('/login');
  };

  const handleLogin = () => {
    setShowExpired(false);
    navigate('/login');
  };

  return (
    <>
      {children}
      {showWarning && !showExpired && (
        <TimeoutWarning
          onStaySignedIn={handleStaySignedIn}
          onLogout={handleLogout}
          secondsRemaining={secondsRemaining}
        />
      )}
      {showExpired && (
        <SessionExpired onLogin={handleLogin} />
      )}
    </>
  );
}
