import React, { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import OnboardingWizard from './OnboardingWizard';
import SessionTimeoutHandler from './SessionTimeoutHandler';

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
