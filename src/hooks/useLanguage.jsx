import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../data/translations';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => {
    try {
      const saved = localStorage.getItem('nc_preferred_language');
      return saved === 'mr' ? 'mr' : 'en';
    } catch {
      return 'en';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('nc_preferred_language', lang);
      document.documentElement.lang = lang;
    } catch (e) {
      console.warn('Could not save language preference:', e);
    }
  }, [lang]);

  const toggleLanguage = () => {
    setLang((prev) => (prev === 'en' ? 'mr' : 'en'));
  };

  const setLanguage = (newLang) => {
    if (newLang === 'en' || newLang === 'mr') {
      setLang(newLang);
    }
  };

  // Helper to get nested translation value
  const t = (path) => {
    const keys = path.split('.');
    let current = translations[lang];
    for (const key of keys) {
      if (current === undefined || current === null) {
        // Fallback to English
        let fallback = translations.en;
        for (const fbKey of keys) {
          if (fallback === undefined || fallback === null) return path;
          fallback = fallback[fbKey];
        }
        return fallback ?? path;
      }
      current = current[key];
    }
    return current ?? path;
  };

  return (
    <LanguageContext.Provider value={{ lang, toggleLanguage, setLanguage, t, translations: translations[lang] }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
