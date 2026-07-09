import React, { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import OnboardingWizard from './OnboardingWizard';
import SessionTimeoutHandler from './SessionTimeoutHandler';
// Private-beta gate: decides where unauthenticated visitors are sent.
import { PUBLIC_LOGIN_ENABLED, PRIVATE_BETA_ROUTE } from '../config/appConfig';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading, needsEmailVerification, needsOnboarding, completeOnboarding } = useAuth();
  const location = useLocation();
  const [showOnboarding, setShowOnboarding] = useState(true);

  if (loading) {
    return (
      <div className="min-h-screen bg-light-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // PRIVATE-BETA GATE: in production (PUBLIC_LOGIN_ENABLED === false) an
    // unauthenticated visitor hitting a private /app/* route must NOT be sent
    // to a login page (which would imply public access). Send them to the
    // Private Beta / Coming Soon screen instead. Locally, keep the normal
    // login redirect so auth testing is unaffected.
    if (!PUBLIC_LOGIN_ENABLED) {
      return <Navigate to={PRIVATE_BETA_ROUTE} replace />;
    }
    // Redirect to login, preserving the intended destination
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Redirect to email verification if needed
  // Note: For Google OAuth, email is typically already verified
  if (needsEmailVerification && location.pathname !== '/verify-email') {
    return <Navigate to="/verify-email" replace />;
  }

  // Show onboarding wizard for new users
  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    completeOnboarding();
  };

  return (
    <SessionTimeoutHandler>
      {needsOnboarding && showOnboarding && (
        <OnboardingWizard onComplete={handleOnboardingComplete} />
      )}
      {children}
    </SessionTimeoutHandler>
  );
}
