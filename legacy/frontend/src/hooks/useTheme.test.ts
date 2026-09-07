import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  useTheme,
  getInitialTheme,
  applyTheme,
  THEME_STORAGE_KEY,
} from '@/hooks/useTheme';

describe('useTheme hook and theme utilities', (): void => {
  beforeEach((): void => {
    window.localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  it('defaults to dark theme when localStorage is empty', (): void => {
    expect(getInitialTheme()).toBe('dark');
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
  });

  it('restores light theme when present in localStorage', (): void => {
    window.localStorage.setItem(THEME_STORAGE_KEY, 'light');
    expect(getInitialTheme()).toBe('light');
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('restores theme when set in legacy bis-theme key', (): void => {
    window.localStorage.setItem('bis-theme', 'light');
    expect(getInitialTheme()).toBe('light');
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe('light');
  });

  it('toggles theme between dark and light', (): void => {
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe('dark');

    act((): void => {
      result.current.toggleTheme();
    });
    expect(result.current.theme).toBe('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('light');

    act((): void => {
      result.current.toggleTheme();
    });
    expect(result.current.theme).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
  });

  it('sets theme directly using setTheme', (): void => {
    const { result } = renderHook(() => useTheme());
    act((): void => {
      result.current.setTheme('light');
    });
    expect(result.current.theme).toBe('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('applies theme via applyTheme function', (): void => {
    applyTheme('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('light');
  });

  it('falls back to default dark theme on localStorage errors', (): void => {
    const getItemSpy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation((): string => {
      throw new Error('Access denied');
    });
    expect(getInitialTheme()).toBe('dark');
    getItemSpy.mockRestore();
  });
});
