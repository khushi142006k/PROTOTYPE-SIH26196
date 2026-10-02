import { Language } from '../types';

const PREF_KEYS = {
  LANGUAGE: 'fitmate_pref_language',
  THEME: 'fitmate_pref_theme',
  SIDEBAR_COLLAPSED: 'fitmate_pref_sidebar',
};

/**
 * StorageService - Pure UI preferences helper.
 * Strictly forbidden from holding user profiles, workout plans, goals, logs, or AI analyses.
 * Supabase DB is the sole source of truth for all application data.
 */
export const StorageService = {
  getLanguage(): Language {
    const lang = localStorage.getItem(PREF_KEYS.LANGUAGE) as Language;
    return (lang === 'hi' || lang === 'gu' || lang === 'en') ? lang : 'en';
  },

  setLanguage(lang: Language): void {
    localStorage.setItem(PREF_KEYS.LANGUAGE, lang);
  },

  getTheme(): 'light' | 'dark' {
    const theme = localStorage.getItem(PREF_KEYS.THEME);
    if (theme === 'dark' || theme === 'light') return theme;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  },

  setTheme(theme: 'light' | 'dark'): void {
    localStorage.setItem(PREF_KEYS.THEME, theme);
  },

  getSidebarCollapsed(): boolean {
    return localStorage.getItem(PREF_KEYS.SIDEBAR_COLLAPSED) === 'true';
  },

  setSidebarCollapsed(collapsed: boolean): void {
    localStorage.setItem(PREF_KEYS.SIDEBAR_COLLAPSED, String(collapsed));
  },

  clearAllPreferences(): void {
    localStorage.removeItem(PREF_KEYS.LANGUAGE);
    localStorage.removeItem(PREF_KEYS.THEME);
    localStorage.removeItem(PREF_KEYS.SIDEBAR_COLLAPSED);
  }
};
