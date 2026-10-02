import type { ReaderTheme } from '../types';

export type AppColorMode = 'dark' | 'light';

const READER_THEMES: readonly ReaderTheme[] = [
  'dark',
  'light',
  'sepia',
  'cream',
  'sage',
  'midnight',
];

const LIGHT_READER_THEMES = new Set<ReaderTheme>(['light', 'sepia', 'cream']);

export function isReaderTheme(value: unknown): value is ReaderTheme {
  return typeof value === 'string' && READER_THEMES.includes(value as ReaderTheme);
}

export function getAppColorMode(theme: ReaderTheme): AppColorMode {
  return LIGHT_READER_THEMES.has(theme) ? 'light' : 'dark';
}

export function getNextAppTheme(theme: ReaderTheme): ReaderTheme {
  return getAppColorMode(theme) === 'light' ? 'dark' : 'light';
}
