import { describe, expect, it } from 'vitest';
import { getAppColorMode, getNextAppTheme, isReaderTheme } from './themeUtils';

describe('getAppColorMode', () => {
  it.each(['light', 'sepia', 'cream'] as const)('maps %s to the light app palette', (theme) => {
    expect(getAppColorMode(theme)).toBe('light');
  });

  it.each(['dark', 'sage', 'midnight'] as const)('maps %s to the dark app palette', (theme) => {
    expect(getAppColorMode(theme)).toBe('dark');
  });
});

describe('getNextAppTheme', () => {
  it('toggles every light-like reader theme to dark', () => {
    expect(getNextAppTheme('light')).toBe('dark');
    expect(getNextAppTheme('sepia')).toBe('dark');
    expect(getNextAppTheme('cream')).toBe('dark');
  });

  it('toggles every dark-like reader theme to light', () => {
    expect(getNextAppTheme('dark')).toBe('light');
    expect(getNextAppTheme('sage')).toBe('light');
    expect(getNextAppTheme('midnight')).toBe('light');
  });
});

describe('isReaderTheme', () => {
  it('accepts supported persisted values and rejects stale values', () => {
    expect(isReaderTheme('dark')).toBe(true);
    expect(isReaderTheme('light')).toBe(true);
    expect(isReaderTheme('system')).toBe(false);
    expect(isReaderTheme(null)).toBe(false);
  });
});
