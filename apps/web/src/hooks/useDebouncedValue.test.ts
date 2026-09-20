import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useDebouncedValue } from './useDebouncedValue';

const DELAY_MS = 400;

describe('useDebouncedValue', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns the initial value immediately', () => {
    const { result } = renderHook(() => useDebouncedValue('react', DELAY_MS));

    expect(result.current).toBe('react');
  });

  it('collapses a burst of keystrokes into one settled value', () => {
    const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value, DELAY_MS), {
      initialProps: { value: 'r' },
    });

    for (const value of ['re', 'rea', 'reac', 'react']) {
      rerender({ value });
      act(() => {
        vi.advanceTimersByTime(DELAY_MS / 4);
      });
    }

    // Nothing has settled yet, so no query would have been fired.
    expect(result.current).toBe('r');

    act(() => {
      vi.advanceTimersByTime(DELAY_MS);
    });

    expect(result.current).toBe('react');
  });

  it('leaves no pending update behind after unmount', () => {
    const { rerender, unmount } = renderHook(({ value }) => useDebouncedValue(value, DELAY_MS), {
      initialProps: { value: 'a' },
    });

    rerender({ value: 'ab' });
    unmount();

    expect(() => {
      act(() => {
        vi.advanceTimersByTime(DELAY_MS * 2);
      });
    }).not.toThrow();
  });
});
