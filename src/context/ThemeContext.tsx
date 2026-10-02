import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppTheme, ReaderFontSize, ReaderFontFamily, ReaderLineHeight, ReaderTheme } from '../types';
import { getAppColorMode, normalizeThemePreference } from '../utils/themeUtils';

interface ThemeContextType {
  theme: AppTheme;
  themePreference: ReaderTheme;
  fontSize: ReaderFontSize;
  fontFamily: ReaderFontFamily;
  lineHeight: ReaderLineHeight;
  setTheme: (t: ReaderTheme) => void;
  setFontSize: (s: ReaderFontSize) => void;
  setFontFamily: (f: ReaderFontFamily) => void;
  setLineHeight: (lh: ReaderLineHeight) => void;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (open: boolean) => void;
  isReaderCustomizerOpen: boolean;
  setIsReaderCustomizerOpen: (open: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themePreference, setThemePreference] = useState<ReaderTheme>(() => {
    return normalizeThemePreference(localStorage.getItem('f15_theme'));
  });
  const [prefersDark, setPrefersDark] = useState(() => window.matchMedia('(prefers-color-scheme: dark)').matches);
  const theme = getAppColorMode(themePreference, prefersDark);

  const [fontSize, setFontSizeState] = useState<ReaderFontSize>(() => {
    return (localStorage.getItem('f15_fontsize') as ReaderFontSize) || 'standard';
  });

  const [fontFamily, setFontFamilyState] = useState<ReaderFontFamily>(() => {
    return (localStorage.getItem('f15_fontfamily') as ReaderFontFamily) || 'newsreader';
  });

  const [lineHeight, setLineHeightState] = useState<ReaderLineHeight>(() => {
    return (localStorage.getItem('f15_lineheight') as ReaderLineHeight) || 'standard';
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isReaderCustomizerOpen, setIsReaderCustomizerOpen] = useState(false);

  const setTheme = (t: ReaderTheme) => {
    setThemePreference(t);
  };

  const setFontSize = (s: ReaderFontSize) => {
    setFontSizeState(s);
    localStorage.setItem('f15_fontsize', s);
  };

  const setFontFamily = (f: ReaderFontFamily) => {
    setFontFamilyState(f);
    localStorage.setItem('f15_fontfamily', f);
  };

  const setLineHeight = (lh: ReaderLineHeight) => {
    setLineHeightState(lh);
    localStorage.setItem('f15_lineheight', lh);
  };

  useEffect(() => {
    localStorage.setItem('f15_theme', themePreference);
  }, [themePreference]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const updatePreference = (event: MediaQueryListEvent) => setPrefersDark(event.matches);
    setPrefersDark(mediaQuery.matches);
    mediaQuery.addEventListener('change', updatePreference);
    return () => mediaQuery.removeEventListener('change', updatePreference);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('theme-light', 'theme-dark', 'theme-sepia', 'theme-cream', 'theme-sage', 'theme-midnight');
    root.classList.add(`theme-${theme}`);
    root.dataset.appTheme = theme;
    root.style.colorScheme = theme;

    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        themePreference,
        fontSize,
        fontFamily,
        lineHeight,
        setTheme,
        setFontSize,
        setFontFamily,
        setLineHeight,
        isSettingsOpen,
        setIsSettingsOpen,
        isReaderCustomizerOpen,
        setIsReaderCustomizerOpen
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
