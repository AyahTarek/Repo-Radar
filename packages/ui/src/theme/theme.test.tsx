import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { createAppTheme } from './createAppTheme';
import { ThemeModeProvider } from './ThemeModeProvider';
import { ThemeToggleButton } from './ThemeToggleButton';
import type { ThemeMode } from './types';
import { useThemeMode } from './useThemeMode';

/**
 * The payoff of a controlled provider: state is a plain useState in the test, with
 * no storage to mock.
 */
function Harness({ initialMode = 'dark' as ThemeMode }) {
  const [mode, setMode] = useState<ThemeMode>(initialMode);

  return (
    <ThemeModeProvider mode={mode} onModeChange={setMode}>
      <ThemeToggleButton />
      <output>{mode}</output>
    </ThemeModeProvider>
  );
}

describe('createAppTheme', () => {
  it('is a pure function of the mode, so it is safe to memoise on mode alone', () => {
    expect(createAppTheme('dark').palette.mode).toBe('dark');
    expect(createAppTheme('light').palette.mode).toBe('light');
  });
});

describe('useThemeMode', () => {
  it('fails loudly outside a provider rather than silently doing nothing', () => {
    function Orphan() {
      useThemeMode();
      return null;
    }

    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    expect(() => render(<Orphan />)).toThrow(/ThemeModeProvider/);
    consoleError.mockRestore();
  });
});

describe('ThemeToggleButton', () => {
  it('reports the opposite mode to the consumer that owns the state', async () => {
    const onModeChange = vi.fn();

    render(
      <ThemeModeProvider mode="dark" onModeChange={onModeChange}>
        <ThemeToggleButton />
      </ThemeModeProvider>,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Switch to light theme' }));

    expect(onModeChange).toHaveBeenCalledWith('light');
  });

  it('switches both ways when the consumer stores the value', async () => {
    render(<Harness initialMode="dark" />);
    expect(screen.getByRole('status')).toHaveTextContent('dark');

    await userEvent.click(screen.getByRole('button', { name: 'Switch to light theme' }));
    expect(screen.getByRole('status')).toHaveTextContent('light');

    await userEvent.click(screen.getByRole('button', { name: 'Switch to dark theme' }));
    expect(screen.getByRole('status')).toHaveTextContent('dark');
  });
});
