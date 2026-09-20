import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { BarDatum } from '../types';
import { StarsBarChart } from '.';

const data: readonly BarDatum[] = [
  { id: 'facebook/react', label: 'react', value: 231_000 },
  { id: 'vuejs/core', label: 'core', value: 49_000 },
];

// jsdom reports zero-size elements, so an explicit width is what makes the axis
// labels render at all.
const TEST_WIDTH = 640;

describe('StarsBarChart', () => {
  it('plots one bar per datum', () => {
    render(<StarsBarChart data={data} valueLabel="Stars" width={TEST_WIDTH} />);

    // Asserting on data binding, not pixels: the axis labels are the contract.
    expect(screen.getByText('react')).toBeInTheDocument();
    expect(screen.getByText('core')).toBeInTheDocument();
  });

  it('explains itself instead of drawing an empty axis', () => {
    render(<StarsBarChart data={[]} valueLabel="Stars" emptyLabel="Nothing to plot." />);

    expect(screen.getByRole('status')).toHaveTextContent('Nothing to plot.');
  });

  it('renders the caption used to say which page is plotted', () => {
    render(<StarsBarChart data={data} valueLabel="Stars" width={TEST_WIDTH} caption="Page 1 of 3" />);

    expect(screen.getByText('Page 1 of 3')).toBeInTheDocument();
  });
});
