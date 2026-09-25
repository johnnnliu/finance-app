import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TimeWindowTabs } from '../../components/common/TimeWindowTabs';
import { MetricCard } from '../../components/common/MetricCard';
import { StockQuote } from '../../types/finance';

describe('TimeWindowTabs Component', () => {
  it('renders all three time window tabs', () => {
    const handleChange = vi.fn();
    render(<TimeWindowTabs activeWindow="1D" onChange={handleChange} />);

    expect(screen.getByText('Current Day')).toBeInTheDocument();
    expect(screen.getByText('Last 7 Days')).toBeInTheDocument();
    expect(screen.getByText('Last Quarter')).toBeInTheDocument();
  });

  it('triggers onChange callback with target window on tab click', () => {
    const handleChange = vi.fn();
    render(<TimeWindowTabs activeWindow="1D" onChange={handleChange} />);

    fireEvent.click(screen.getByText('Last 7 Days'));
    expect(handleChange).toHaveBeenCalledWith('7D');

    fireEvent.click(screen.getByText('Last Quarter'));
    expect(handleChange).toHaveBeenCalledWith('1Q');
  });
});

describe('MetricCard Component', () => {
  const mockQuote: StockQuote = {
    symbol: 'IBM',
    name: 'International Business Machines',
    currentPrice: 191.45,
    change: 2.35,
    percentChange: 1.24,
    open: 189.1,
    high: 192.5,
    low: 188.5,
    volume: 3500000,
    previousClose: 189.1,
    lastUpdated: '10:30 AM',
  };

  it('renders quote details, ticker, and primary badge when isAnchor is true', () => {
    render(<MetricCard quote={mockQuote} isAnchor={true} />);

    expect(screen.getByText('IBM')).toBeInTheDocument();
    expect(screen.getByText('Primary')).toBeInTheDocument();
    expect(screen.getByText('$191.45')).toBeInTheDocument();
    expect(screen.getByText('+2.35 (+1.24%)')).toBeInTheDocument();
  });

  it('handles negative price deltas with proper sign and class', () => {
    const negativeQuote: StockQuote = {
      ...mockQuote,
      symbol: 'MSFT',
      change: -4.5,
      percentChange: -1.05,
    };

    render(<MetricCard quote={negativeQuote} isAnchor={false} />);
    expect(screen.getByText('-4.50 (-1.05%)')).toBeInTheDocument();
  });
});
