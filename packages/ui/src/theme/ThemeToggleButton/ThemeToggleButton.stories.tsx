import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { DEFAULT_THEME_MODE } from '../constants';
import { ThemeModeProvider } from '../ThemeModeProvider';
import type { ThemeMode } from '../types';
import { ThemeToggleButton } from './index';

/** Story-only wrapper: ThemeToggleButton is controlled, so it needs a mode to toggle. */
function ControlledToggle() {
  const [mode, setMode] = useState<ThemeMode>(DEFAULT_THEME_MODE);
  return (
    <ThemeModeProvider mode={mode} onModeChange={setMode}>
      <ThemeToggleButton />
    </ThemeModeProvider>
  );
}

const meta = {
  title: 'UI/ThemeToggleButton',
  component: ThemeToggleButton,
} satisfies Meta<typeof ThemeToggleButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <ControlledToggle />,
};
