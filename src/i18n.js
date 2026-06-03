import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import fr from './locales/fr.json';
import de from './locales/de.json';

const resources = {
  en: { translation: en },
  fr: { translation: fr },
  de: { translation: de }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    supportedLngs: ['en', 'fr', 'de'],
    lng: localStorage.getItem('language') || 'en', // Default to English

    detection: {
      order: ['localStorage'], // Only check localStorage, not browser language
      caches: ['localStorage'],
      lookupLocalStorage: 'language'
    },

    interpolation: {
      escapeValue: false // React already escapes
    },

    react: {
      useSuspense: false
    }
  });

export default i18n;

// Available languages for selector
export const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' }
];
