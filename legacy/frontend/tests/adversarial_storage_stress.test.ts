import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  useTheme,
  getInitialTheme,
  applyTheme,
  DEFAULT_THEME,
  THEME_STORAGE_KEY,
} from '@/hooks/useTheme';
import { App } from '@/App';
import * as fs from 'fs';
import * as path from 'path';

describe('Adversarial Storage & Disabled localStorage Stress Suite', () => {
  const originalLocalStorage = window.localStorage;

  beforeEach(() => {
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

  it('ADV-1: Survives SecurityError when window.localStorage property getter throws', () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    Object.defineProperty(window, 'localStorage', {
      get() {
        throw new DOMException('The operation is insecure.', 'SecurityError');
      },
      configurable: true,
    });

    // getInitialTheme must not throw and must return DEFAULT_THEME ('dark')
    expect(() => getInitialTheme()).not.toThrow();
    expect(getInitialTheme()).toBe(DEFAULT_THEME);

    // applyTheme must not throw and must still apply data-theme to documentElement
    expect(() => applyTheme('light')).not.toThrow();
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');

    // useTheme hook must mount and operate safely
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe(DEFAULT_THEME);

    // Toggle theme must flip state without crashing
    act(() => {
      result.current.toggleTheme();
    });
    expect(result.current.theme).toBe('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');

    consoleWarnSpy.mockRestore();
  });

  it('ADV-2: Survives QuotaExceededError when setItem throws during storage quota saturation', () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Storage quota exceeded.', 'QuotaExceededError');
    });

    expect(() => applyTheme('light')).not.toThrow();
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');

    const { result } = renderHook(() => useTheme());
    act(() => {
      result.current.toggleTheme();
    });
    expect(result.current.theme).toBe('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');

    consoleWarnSpy.mockRestore();
  });

  it('ADV-3: Handles localStorage being null or undefined in restricted environments', () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    Object.defineProperty(window, 'localStorage', {
      value: null,
      configurable: true,
      writable: true,
    });

    expect(() => getInitialTheme()).not.toThrow();
    expect(getInitialTheme()).toBe(DEFAULT_THEME);

    expect(() => applyTheme('dark')).not.toThrow();
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');

    consoleWarnSpy.mockRestore();
  });

  it('ADV-4: Rejects corrupted or invalid stored theme values gracefully', () => {
    const invalidValues = [
      'blue',
      'DARK',
      'LIGHT',
      'system',
      'null',
      'undefined',
      '{"theme":"dark"}',
      '<script>alert(1)</script>',
      '   ',
      'dark ',
    ];

    for (const val of invalidValues) {
      window.localStorage.setItem(THEME_STORAGE_KEY, val);
      expect(getInitialTheme()).toBe(DEFAULT_THEME);
    }
  });

  it('ADV-5: Rapid state flapping under failing storage preserves theme integrity', () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Storage disabled by policy');
    });

    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe('dark');

    // Rapidly toggle 50 times
    for (let i = 0; i < 50; i++) {
      act(() => {
        result.current.toggleTheme();
      });
      const expected = i % 2 === 0 ? 'light' : 'dark';
      expect(result.current.theme).toBe(expected);
      expect(document.documentElement.getAttribute('data-theme')).toBe(expected);
    }

    consoleWarnSpy.mockRestore();
  });

  it('ADV-6: Absolute import verification across all source files', () => {
    const srcDir = path.resolve(__dirname, '../src');
    const files = fs.readdirSync(srcDir, { recursive: true }) as string[];

    const tsFiles = files.filter(
      (f) => (f.endsWith('.ts') || f.endsWith('.tsx')) && !f.endsWith('.d.ts')
    );

    const relativeImportRegex = /from\s+['"]\.\.?\//g;

    for (const file of tsFiles) {
      const fullPath = path.join(srcDir, file);
      const content = fs.readFileSync(fullPath, 'utf-8');
      const matches = content.match(relativeImportRegex);

      expect(
        matches,
        `File ${file} contains relative imports: ${JSON.stringify(matches)}. Must use absolute imports (@/...)`
      ).toBeNull();
    }
  });

  it('ADV-7: Component line count verification (<100 lines for all components)', () => {
    const srcDir = path.resolve(__dirname, '../src');
    const files = fs.readdirSync(srcDir, { recursive: true }) as string[];

    const componentFiles = files.filter((f) => f.endsWith('.tsx'));

    for (const file of componentFiles) {
      const fullPath = path.join(srcDir, file);
      const content = fs.readFileSync(fullPath, 'utf-8');
      const lineCount = content.split('\n').length;

      expect(
        lineCount,
        `Component ${file} has ${lineCount} lines, which violates Rule [R2] (<100 lines)`
      ).toBeLessThan(100);
    }
  });
});
