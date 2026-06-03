import React, { createContext, useContext, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from './AuthContext';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const { i18n } = useTranslation();
  const { user, authFetch, isAuthenticated } = useAuth();

  // Initialize language from user settings when authenticated
  useEffect(() => {
    if (isAuthenticated && user?.settings?.language) {
      i18n.changeLanguage(user.settings.language);
      localStorage.setItem('language', user.settings.language);
    }
  }, [isAuthenticated, user, i18n]);

  // Change language and persist
  const changeLanguage = useCallback(async (langCode) => {
    i18n.changeLanguage(langCode);
    localStorage.setItem('language', langCode);

    // Persist to backend if authenticated
    if (isAuthenticated && authFetch) {
      try {
        await authFetch('/users/settings', {
          method: 'PATCH',
          body: JSON.stringify({ language: langCode })
        });
      } catch (err) {
        console.error('Failed to save language preference:', err);
      }
    }
  }, [isAuthenticated, authFetch, i18n]);

  const value = {
    language: i18n.language,
    changeLanguage
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

export default LanguageContext;
