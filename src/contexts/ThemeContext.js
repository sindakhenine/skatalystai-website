import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

const ThemeContext = createContext(null);

// Get stored theme from localStorage (for non-authenticated users)
const getStoredTheme = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('theme');
  }
  return null;
};

export function ThemeProvider({ children }) {
  const { user, authFetch, isAuthenticated } = useAuth();
  const [theme, setThemeState] = useState(() => {
    // Priority: user settings > localStorage > default to light
    const stored = getStoredTheme();
    return stored || 'light';
  });
  const [isSystemTheme, setIsSystemTheme] = useState(false);

  // Apply theme to document
  const applyTheme = useCallback((newTheme) => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', newTheme);
      // Also add/remove class for Tailwind dark mode if needed
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, []);

  // Initialize theme from user settings when authenticated
  useEffect(() => {
    if (isAuthenticated && user?.settings?.theme) {
      setThemeState(user.settings.theme);
      applyTheme(user.settings.theme);
    }
  }, [isAuthenticated, user, applyTheme]);

  // Apply theme on state change
  useEffect(() => {
    applyTheme(theme);
  }, [theme, applyTheme]);

  // Save theme preference
  const setTheme = useCallback(async (newTheme) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);

    // Persist to backend if authenticated
    if (isAuthenticated && authFetch) {
      try {
        await authFetch('/users/settings', {
          method: 'PATCH',
          body: JSON.stringify({ theme: newTheme })
        });
      } catch (err) {
        console.error('Failed to save theme preference:', err);
      }
    }
  }, [isAuthenticated, authFetch]);

  // Toggle between light and dark
  const toggleTheme = useCallback(() => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  }, [theme, setTheme]);

  const value = {
    theme,
    effectiveTheme: theme,
    setTheme,
    toggleTheme,
    isDark: theme === 'dark'
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export default ThemeContext;
