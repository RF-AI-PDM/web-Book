import { describe, expect, it } from 'vitest';
import { getAppColorMode, getNextAppTheme, isReaderTheme } from './themeUtils';

describe('getAppColorMode', () => {
  it('keeps explicit light and dark preferences', () => {
    expect(getAppColorMode('light')).toBe('light');
    expect(getAppColorMode('dark')).toBe('dark');
  });

  it('resolves the system preference from the operating system setting', () => {
    expect(getAppColorMode('system', false)).toBe('light');
    expect(getAppColorMode('system', true)).toBe('dark');
  });
});

describe('getNextAppTheme', () => {
  it('cycles through system, dark, and light', () => {
    expect(getNextAppTheme('system')).toBe('dark');
    expect(getNextAppTheme('dark')).toBe('light');
    expect(getNextAppTheme('light')).toBe('system');
  });
});

describe('isReaderTheme', () => {
  it('accepts only supported preferences', () => {
    expect(isReaderTheme('system')).toBe(true);
    expect(isReaderTheme('dark')).toBe(true);
    expect(isReaderTheme('light')).toBe(true);
    expect(isReaderTheme('sepia')).toBe(false);
    expect(isReaderTheme(null)).toBe(false);
  });
});
