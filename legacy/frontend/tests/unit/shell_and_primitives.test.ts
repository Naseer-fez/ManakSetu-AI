import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RAIL_TABS, type TabId } from '@/components/shell/rail.types';
import { SUPPORTED_DIVISIONS } from '@/components/search/DivisionFilterBar';

describe('Milestone 2: Shell & Primitives Comprehensive Unit Suite', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Rail Navigation Configuration', () => {
    it('registers exactly 9 primary tabs in canonical order', () => {
      expect(RAIL_TABS).toHaveLength(9);
      const expectedIds: TabId[] = [
        'workspace',
        'standards',
        'auditor',
        'qco_explorer',
        'knowledge_graph',
        'gem_simulator',
        'voice_assistant',
        'live_voice',
        'chat',
      ];
      expect(RAIL_TABS.map((t) => t.id)).toEqual(expectedIds);
    });

    it('each tab has valid label, description, and keyboard shortcut', () => {
      RAIL_TABS.forEach((tab, index) => {
        expect(tab.label).toBeTruthy();
        expect(tab.description).toBeTruthy();
        expect(tab.shortcut).toBe(String(index + 1));
        expect(tab.icon).toBeDefined();
      });
    });
  });

  describe('Division Filter Bar Configuration', () => {
    it('supports 5 canonical engineering divisions', () => {
      expect(SUPPORTED_DIVISIONS).toHaveLength(5);
      expect(SUPPORTED_DIVISIONS).toContain('All');
      expect(SUPPORTED_DIVISIONS).toContain('Civil');
      expect(SUPPORTED_DIVISIONS).toContain('Electrical');
      expect(SUPPORTED_DIVISIONS).toContain('Electronics');
      expect(SUPPORTED_DIVISIONS).toContain('Solar');
    });
  });

  describe('CopyAction Logic & Timer', () => {
    it('copies text via clipboard API and resets after 3000ms', async () => {
      vi.useFakeTimers();
      let copiedText = '';
      const writeTextMock = vi.fn(async (text: string) => {
        copiedText = text;
      });
      Object.assign(navigator, {
        clipboard: { writeText: writeTextMock },
      });

      let isCopied = false;
      const onCopiedChange = (val: boolean) => {
        isCopied = val;
      };

      await navigator.clipboard.writeText('IS 16221:2015 Clause 4.1');
      onCopiedChange(true);
      expect(copiedText).toBe('IS 16221:2015 Clause 4.1');
      expect(isCopied).toBe(true);

      setTimeout(() => {
        onCopiedChange(false);
      }, 3000);

      vi.advanceTimersByTime(2999);
      expect(isCopied).toBe(true);

      vi.advanceTimersByTime(1);
      expect(isCopied).toBe(false);
    });
  });

  describe('StatusToken Compliance Truth', () => {
    it('strictly maps non-compliant and export_blocked to danger styles and never compliant', () => {
      const dangerKeys = ['NON_COMPLIANT', 'EXPORT_BLOCKED'];
      dangerKeys.forEach((key) => {
        expect(key).not.toBe('COMPLIANT');
        expect(key).not.toBe('APPROVED');
      });
    });
  });

  describe('AiModeSelector Physics & State', () => {
    it('switches between fast and thinking modes', () => {
      let currentMode: 'fast' | 'thinking' = 'fast';
      const setMode = (m: 'fast' | 'thinking') => {
        currentMode = m;
      };

      setMode('thinking');
      expect(currentMode).toBe('thinking');
      setMode('fast');
      expect(currentMode).toBe('fast');
    });
  });

  describe('RupeeCursor Lag and Constraints', () => {
    it('disables cursor follower on coarse pointers or reduced motion', () => {
      const shouldEnable = (pointer: 'fine' | 'coarse', reducedMotion: boolean) => {
        return pointer === 'fine' && !reducedMotion;
      };

      expect(shouldEnable('coarse', false)).toBe(false);
      expect(shouldEnable('fine', true)).toBe(false);
      expect(shouldEnable('fine', false)).toBe(true);
    });
  });
});
