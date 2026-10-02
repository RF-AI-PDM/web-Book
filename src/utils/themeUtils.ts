import type { AppTheme, ReaderTheme } from '../types';

export type AppColorMode = AppTheme;
const THEME_PREFERENCES: readonly ReaderTheme[] = ['system', 'light', 'dark'];

export function isReaderTheme(value: unknown): value is ReaderTheme {
  return typeof value === 'string' && THEME_PREFERENCES.includes(value as ReaderTheme);
}

export function getAppColorMode(theme: ReaderTheme, prefersDark = false): AppColorMode {
  if (theme === 'system') return prefersDark ? 'dark' : 'light';
  return theme;
}

export function getNextAppTheme(theme: ReaderTheme): ReaderTheme {
  if (theme === 'system') return 'dark';
  return theme === 'dark' ? 'light' : 'system';
}

export function normalizeThemePreference(value: unknown): ReaderTheme {
  if (isReaderTheme(value)) return value;
  if (value === 'sepia' || value === 'cream') return 'light';
  if (value === 'sage' || value === 'midnight') return 'dark';
  return 'system';
}
