import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  useTheme,
  getInitialTheme,
  applyTheme,
  DEFAULT_THEME,
  THEME_STORAGE_KEY,
  LEGACY_THEME_STORAGE_KEY,
} from '@/hooks/useTheme';

describe('Challenger M1 Adversarial Theme Stress Suite', () => {
  const originalLocalStorage = window.localStorage;

  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    vi.restoreAllMocks();
  });

  afterEach(() => {
    Object.defineProperty(window, 'localStorage', {
      value: originalLocalStorage,
      configurable: true,
      writable: true,
    });
    vi.restoreAllMocks();
  });

  it('CHAL-1: Dual storage key precedence and recovery', () => {
    expect(getInitialTheme()).toBe('dark');

    window.localStorage.setItem(LEGACY_THEME_STORAGE_KEY, 'light');
    expect(getInitialTheme()).toBe('light');

    window.localStorage.setItem(THEME_STORAGE_KEY, 'dark');
    expect(getInitialTheme()).toBe('dark');

    window.localStorage.setItem(THEME_STORAGE_KEY, 'corrupt');
    expect(getInitialTheme()).toBe('dark');

    window.localStorage.setItem(THEME_STORAGE_KEY, '');
    expect(getInitialTheme()).toBe('light');
  });

  it('CHAL-2: Rapid concurrent and alternating toggle/set operations', () => {
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe('dark');

    act(() => {
      for (let i = 0; i < 101; i++) {
        result.current.toggleTheme();
      }
    });
    expect(result.current.theme).toBe('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('light');
    expect(window.localStorage.getItem(LEGACY_THEME_STORAGE_KEY)).toBe('light');

    act(() => {
      result.current.setTheme('dark');
      result.current.toggleTheme();
      result.current.setTheme('dark');
      result.current.setTheme('dark');
      result.current.toggleTheme();
    });
    expect(result.current.theme).toBe('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('CHAL-3: Dual key synchronization on applyTheme', () => {
    applyTheme('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('light');
    expect(window.localStorage.getItem(LEGACY_THEME_STORAGE_KEY)).toBe('light');

    applyTheme('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
    expect(window.localStorage.getItem(LEGACY_THEME_STORAGE_KEY)).toBe('dark');
  });

  it('CHAL-4: Exhaustive corrupted payload resilience', () => {
    const payloads = [
      '',
      '   ',
      '\t\n',
      '0',
      '1',
      'false',
      'true',
      'undefined',
      'null',
      'NaN',
      'Infinity',
      'DARK',
      'LIGHT',
      'Dark',
      'Light',
      'light ',
      ' dark',
      '[object Object]',
      '{theme:light}',
      '<script>evil()</script>',
      'DROP TABLE themes;',
      '🎨',
      '\\x00\\x01',
    ];

    for (const payload of payloads) {
      window.localStorage.setItem(THEME_STORAGE_KEY, payload);
      const theme = getInitialTheme();
      expect(theme).toBe('dark');
    }
  });

  it('CHAL-5: Partial setItem failure (first succeeds, second throws)', () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    let callCount = 0;
    const originalSetItem = Storage.prototype.setItem;

    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function(key, value) {
      callCount++;
      if (callCount === 2) {
        throw new Error('Disk write error on second key');
      }
      return originalSetItem.call(this, key, value);
    });

    expect(() => applyTheme('light')).not.toThrow();
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('light');
    consoleWarnSpy.mockRestore();
  });
});
