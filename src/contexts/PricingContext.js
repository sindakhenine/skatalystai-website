import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

const PricingContext = createContext(null);

// Currency configurations
export const currencies = {
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', locale: 'en-US' },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', locale: 'de-DE' },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', locale: 'en-GB' },
  CAD: { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', locale: 'en-CA' },
  CHF: { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc', locale: 'de-CH' }
};

// Country to currency mapping
const countryToCurrency = {
  US: 'USD',
  CA: 'CAD',
  GB: 'GBP',
  DE: 'EUR',
  FR: 'EUR',
  IT: 'EUR',
  ES: 'EUR',
  NL: 'EUR',
  BE: 'EUR',
  AT: 'EUR',
  CH: 'CHF',
  // Default for unlisted countries
  DEFAULT: 'USD'
};

// Exchange rates (mock - in production, fetch from API)
const exchangeRates = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  CAD: 1.36,
  CHF: 0.88
};

// Base prices in USD
export const basePrices = {
  free: 0,
  pro: 29,
  business: 99,
  enterprise: null // Custom pricing
};

// Mock GeoIP detection
const detectCountryFromTimezone = () => {
  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const timezoneToCountry = {
      'America/New_York': 'US',
      'America/Los_Angeles': 'US',
      'America/Chicago': 'US',
      'America/Denver': 'US',
      'America/Toronto': 'CA',
      'America/Vancouver': 'CA',
      'Europe/London': 'GB',
      'Europe/Paris': 'FR',
      'Europe/Berlin': 'DE',
      'Europe/Rome': 'IT',
      'Europe/Madrid': 'ES',
      'Europe/Amsterdam': 'NL',
      'Europe/Brussels': 'BE',
      'Europe/Vienna': 'AT',
      'Europe/Zurich': 'CH'
    };
    return timezoneToCountry[timezone] || 'US';
  } catch {
    return 'US';
  }
};

// Get stored preferences
const getStoredPreferences = () => {
  if (typeof window !== 'undefined') {
    const country = sessionStorage.getItem('userCountry');
    const currency = localStorage.getItem('currency');
    return { country, currency };
  }
  return { country: null, currency: null };
};

export function PricingProvider({ children }) {
  const { user, authFetch, isAuthenticated } = useAuth();

  const [country, setCountryState] = useState(() => {
    const { country } = getStoredPreferences();
    return country || detectCountryFromTimezone();
  });

  const [currency, setCurrencyState] = useState(() => {
    const { currency } = getStoredPreferences();
    return currency || countryToCurrency[detectCountryFromTimezone()] || 'USD';
  });

  // Initialize from user settings when authenticated
  useEffect(() => {
    if (isAuthenticated && user?.settings) {
      if (user.settings.country) {
        setCountryState(user.settings.country);
      }
      if (user.settings.currency) {
        setCurrencyState(user.settings.currency);
      }
    }
  }, [isAuthenticated, user]);

  // Store country in session
  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('userCountry', country);
    }
  }, [country]);

  // Store currency preference
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('currency', currency);
    }
  }, [currency]);

  // Set country
  const setCountry = useCallback(async (newCountry) => {
    setCountryState(newCountry);

    // Persist to backend if authenticated
    if (isAuthenticated && authFetch) {
      try {
        await authFetch('/users/settings', {
          method: 'PATCH',
          body: JSON.stringify({ country: newCountry })
        });
      } catch (err) {
        console.error('Failed to save country preference:', err);
      }
    }
  }, [isAuthenticated, authFetch]);

  // Set currency
  const setCurrency = useCallback(async (newCurrency) => {
    setCurrencyState(newCurrency);

    // Persist to backend if authenticated
    if (isAuthenticated && authFetch) {
      try {
        await authFetch('/users/settings', {
          method: 'PATCH',
          body: JSON.stringify({ currency: newCurrency })
        });
      } catch (err) {
        console.error('Failed to save currency preference:', err);
      }
    }
  }, [isAuthenticated, authFetch]);

  // Format price in current currency
  const formatPrice = useCallback((priceUSD, options = {}) => {
    if (priceUSD === null || priceUSD === undefined) {
      return options.customText || 'Custom';
    }

    const currencyConfig = currencies[currency] || currencies.USD;
    const rate = exchangeRates[currency] || 1;
    const convertedPrice = priceUSD * rate;

    // Round to nearest whole number for cleaner display
    const roundedPrice = Math.round(convertedPrice);

    try {
      return new Intl.NumberFormat(currencyConfig.locale, {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(roundedPrice);
    } catch {
      return `${currencyConfig.symbol}${roundedPrice}`;
    }
  }, [currency]);

  // Get prices for all plans in current currency
  const getPrices = useCallback(() => {
    return {
      free: formatPrice(basePrices.free),
      pro: formatPrice(basePrices.pro),
      business: formatPrice(basePrices.business),
      enterprise: formatPrice(basePrices.enterprise, { customText: 'Custom' })
    };
  }, [formatPrice]);

  // Get current currency config
  const currentCurrency = currencies[currency] || currencies.USD;

  const value = {
    country,
    setCountry,
    currency,
    setCurrency,
    currentCurrency,
    currencies,
    formatPrice,
    getPrices,
    basePrices,
    exchangeRates
  };

  return (
    <PricingContext.Provider value={value}>
      {children}
    </PricingContext.Provider>
  );
}

export function usePricing() {
  const context = useContext(PricingContext);
  if (!context) {
    throw new Error('usePricing must be used within a PricingProvider');
  }
  return context;
}

export default PricingContext;
