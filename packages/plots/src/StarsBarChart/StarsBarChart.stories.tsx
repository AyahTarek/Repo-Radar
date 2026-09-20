import type { Meta, StoryObj } from '@storybook/react-vite';
import { StarsBarChart } from './index';
import type { BarDatum } from '../types';

const data: BarDatum[] = [
  { id: 'facebook/react', label: 'react', fullLabel: 'facebook/react', value: 228_000 },
  { id: 'vuejs/vue', label: 'vue', fullLabel: 'vuejs/vue', value: 207_000 },
  { id: 'angular/angular', label: 'angular', fullLabel: 'angular/angular', value: 96_000 },
  { id: 'sveltejs/svelte', label: 'svelte', fullLabel: 'sveltejs/svelte', value: 80_000 },
];

const meta = {
  title: 'Plots/StarsBarChart',
  component: StarsBarChart,
  args: {
    data,
    valueLabel: 'Stars',
    height: 340,
  },
} satisfies Meta<typeof StarsBarChart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Empty: Story = {
  args: {
    data: [],
    emptyLabel: 'Track a repository to see its stars here.',
  },
};
