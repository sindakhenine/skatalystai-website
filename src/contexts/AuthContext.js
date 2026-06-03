import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const API_BASE = `${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/api`;

// Storage key for refresh token (localStorage fallback for cross-origin)
const REFRESH_TOKEN_KEY = 'sk_refresh_token';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Access token stored in memory only (not localStorage)
  const [accessToken, setAccessToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [needsEmailVerification, setNeedsEmailVerification] = useState(false);
  const [activeTenantId, setActiveTenantId] = useState(() =>
    localStorage.getItem('activeTenantId')
  );
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  // Fetch user data with token
  const fetchUser = useCallback(async (token) => {
    try {
      // Include active tenant from localStorage if available
      const storedTenantId = localStorage.getItem('activeTenantId');
      const url = storedTenantId
        ? `${API_BASE}/auth/me?tenant_id=${storedTenantId}`
        : `${API_BASE}/auth/me`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);

        // Save active tenant ID to localStorage for persistence
        if (userData.tenant_id) {
          localStorage.setItem('activeTenantId', userData.tenant_id);
          setActiveTenantId(userData.tenant_id);
        }

        // Check if email verification is needed
        setNeedsEmailVerification(!userData.email_verified);

        // Check if onboarding is needed (new users haven't completed onboarding)
        // Use localStorage as fallback if backend doesn't reflect completion yet
        const localOnboardingComplete = localStorage.getItem('onboardingCompleted') === 'true';
        const serverOnboardingComplete = userData.onboarding_completed;
        const needsOnboard = !localOnboardingComplete && !serverOnboardingComplete && userData.is_new_user;
        setNeedsOnboarding(needsOnboard);

        return userData;
      } else {
        throw new Error('Failed to fetch user');
      }
    } catch (err) {
      console.error('Fetch user error:', err);
      setUser(null);
      throw err;
    }
  }, []);

  // Check if user is super admin (for Admin tab visibility)
  const checkSuperAdmin = useCallback(async (token) => {
    try {
      const response = await fetch(`${API_BASE}/admin/check`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setIsSuperAdmin(data.isSuperAdmin === true);
      } else {
        setIsSuperAdmin(false);
      }
    } catch (err) {
      console.error('Super admin check error:', err);
      setIsSuperAdmin(false);
    }
  }, []);

  // Refresh access token using refresh token (localStorage fallback for cross-origin)
  const refreshToken = useCallback(async () => {
    try {
      // Get stored refresh token from localStorage (cross-origin cookie fallback)
      const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

      const response = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        // Send refresh token in body as fallback for cross-origin cookie issues
        body: JSON.stringify({ refreshToken: storedRefreshToken })
      });

      if (response.ok) {
        const data = await response.json();
        setAccessToken(data.accessToken);
        // Store the new refresh token in localStorage
        if (data.refreshToken) {
          localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
        }
        await fetchUser(data.accessToken);
        // Check super admin status
        await checkSuperAdmin(data.accessToken);
        return data.accessToken;
      } else {
        // Refresh failed, clear state
        setAccessToken(null);
        setUser(null);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        return null;
      }
    } catch (err) {
      console.error('Token refresh error:', err);
      setAccessToken(null);
      setUser(null);
      return null;
    }
  }, [fetchUser, checkSuperAdmin]);

  // Initialize auth state on mount
  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);
      setError(null);

      // Check URL for tokens (from OAuth callback)
      const urlParams = new URLSearchParams(window.location.search);
      const tokenFromUrl = urlParams.get('token');
      const refreshTokenFromUrl = urlParams.get('refresh_token');

      if (tokenFromUrl) {
        // Clear tokens from URL
        window.history.replaceState({}, document.title, window.location.pathname);
        setAccessToken(tokenFromUrl);

        // Store refresh token in localStorage for cross-origin persistence
        if (refreshTokenFromUrl) {
          localStorage.setItem(REFRESH_TOKEN_KEY, refreshTokenFromUrl);
        }

        try {
          await fetchUser(tokenFromUrl);
          // Check super admin status
          await checkSuperAdmin(tokenFromUrl);
        } catch (err) {
          setError('Failed to load user data');
        }
      } else {
        // Try to refresh token using stored refresh token
        const hasStoredToken = !!localStorage.getItem(REFRESH_TOKEN_KEY);
        if (hasStoredToken) {
          try {
            await refreshToken();
          } catch (err) {
            // No valid session, that's fine
          }
        }
      }

      setLoading(false);
    };

    initAuth();
  }, [fetchUser, refreshToken]);

  // Set up token refresh interval (every 10 minutes)
  useEffect(() => {
    if (!accessToken) return;

    const interval = setInterval(() => {
      refreshToken();
    }, 10 * 60 * 1000); // 10 minutes

    return () => clearInterval(interval);
  }, [accessToken, refreshToken]);

  // Login with Google - session duration based on rememberMe checkbox
  const loginWithGoogle = useCallback((accountType = 'personal', rememberMe = false) => {
    const params = new URLSearchParams({
      accountType,
      rememberMe: rememberMe ? 'true' : 'false' // 30 days if checked, 1 day if not
    });
    window.location.href = `${API_BASE}/auth/google?${params.toString()}`;
  }, []);

  // Login with Microsoft - session duration based on rememberMe checkbox
  const loginWithMicrosoft = useCallback((accountType = 'personal', rememberMe = false) => {
    const params = new URLSearchParams({
      accountType,
      rememberMe: rememberMe ? 'true' : 'false' // 30 days if checked, 1 day if not
    });
    window.location.href = `${API_BASE}/auth/microsoft?${params.toString()}`;
  }, []);

  // Login with GitHub - session duration based on rememberMe checkbox
  const loginWithGithub = useCallback((accountType = 'personal', rememberMe = false) => {
    const params = new URLSearchParams({
      accountType,
      rememberMe: rememberMe ? 'true' : 'false' // 30 days if checked, 1 day if not
    });
    window.location.href = `${API_BASE}/auth/github?${params.toString()}`;
  }, []);

  // Logout
  const logout = useCallback(async () => {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setAccessToken(null);
      setUser(null);
      setNeedsOnboarding(false);
      setNeedsEmailVerification(false);
      setIsSuperAdmin(false);
      // Clear stored data on logout
      localStorage.removeItem('activeTenantId');
      localStorage.removeItem('onboardingCompleted');
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      setActiveTenantId(null);
    }
  }, []);

  // Switch active tenant (for multi-workspace support)
  const switchTenant = useCallback(async (tenantId) => {
    if (!accessToken) return;

    try {
      // Save to server
      const response = await fetch(`${API_BASE}/auth/switch-tenant`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ tenant_id: tenantId }),
        credentials: 'include'
      });

      if (response.ok) {
        // Update localStorage
        localStorage.setItem('activeTenantId', tenantId);
        setActiveTenantId(tenantId);

        // Refresh user data with new tenant
        await fetchUser(accessToken);
      }
    } catch (err) {
      console.error('Switch tenant error:', err);
    }
  }, [accessToken, fetchUser]);

  // Complete onboarding
  const completeOnboarding = useCallback(() => {
    setNeedsOnboarding(false);
    // Save to localStorage for persistence across refreshes
    localStorage.setItem('onboardingCompleted', 'true');
  }, []);

  // Check if authenticated
  const isAuthenticated = !!accessToken && !!user;

  // Make authenticated API request
  const authFetch = useCallback(async (url, options = {}) => {
    if (!accessToken) {
      throw new Error('Not authenticated');
    }

    // Don't set Content-Type for FormData - browser will set it with multipart boundary
    const isFormData = options.body instanceof FormData;
    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${accessToken}`,
    };

    // Only set Content-Type if not FormData
    if (!isFormData) {
      headers['Content-Type'] = options.headers?.['Content-Type'] || 'application/json';
    }

    const response = await fetch(url.startsWith('http') ? url : `${API_BASE}${url}`, {
      ...options,
      credentials: 'include',
      headers
    });

    // If unauthorized, try to refresh token
    if (response.status === 401) {
      const newToken = await refreshToken();
      if (newToken) {
        // Retry with new token
        const retryHeaders = {
          ...options.headers,
          'Authorization': `Bearer ${newToken}`,
        };
        if (!isFormData) {
          retryHeaders['Content-Type'] = options.headers?.['Content-Type'] || 'application/json';
        }

        return fetch(url.startsWith('http') ? url : `${API_BASE}${url}`, {
          ...options,
          credentials: 'include',
          headers: retryHeaders
        });
      }
    }

    return response;
  }, [accessToken, refreshToken]);

  const value = {
    user,
    accessToken,
    loading,
    error,
    isAuthenticated,
    needsOnboarding,
    needsEmailVerification,
    activeTenantId,
    isSuperAdmin,
    loginWithGoogle,
    loginWithMicrosoft,
    loginWithGithub,
    logout,
    refreshToken,
    authFetch,
    completeOnboarding,
    switchTenant
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
