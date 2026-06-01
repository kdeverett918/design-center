import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import SamplePage from './SamplePage';
import { configForTheme } from '../../preview/previewConfig';
import { themes } from '../../data/themes';

const base = configForTheme(themes[0]!);

describe('SamplePage composition', () => {
  it('renders hero, brand (nav/footer), and the default sections', () => {
    render(<SamplePage brand="Acme Care" config={base} />);
    expect(screen.getAllByText(/care that listens/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText('Acme Care').length).toBeGreaterThan(0);
    // default section: stats band uses "{brand}, by the numbers"
    expect(screen.getByText(/by the numbers/i)).toBeInTheDocument();
  });

  it('renders a section that is added to config.sections', () => {
    render(<SamplePage brand="Acme" config={{ ...base, sections: ['sec-pricing-tiers'] }} />);
    expect(screen.getByText(/most popular/i)).toBeInTheDocument();
  });

  it('omits sections that are not selected', () => {
    render(<SamplePage brand="Acme" config={{ ...base, sections: [] }} />);
    expect(screen.queryByText(/by the numbers/i)).not.toBeInTheDocument();
  });
});
