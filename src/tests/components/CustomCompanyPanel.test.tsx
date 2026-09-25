import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CustomCompanyPanel } from '../../components/dashboard/CustomCompanyPanel';
import { StockQuote, HistoricalWindowData } from '../../types/finance';
import { MockFinanceService } from '../../services/mockFinanceService';

describe('CustomCompanyPanel Component', () => {
  const mockQuote: StockQuote = {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    currentPrice: 178.5,
    change: 1.25,
    percentChange: 0.71,
    open: 177.0,
    high: 179.2,
    low: 176.8,
    volume: 52000000,
    previousClose: 177.25,
    lastUpdated: '11:00 AM',
  };

  const mockHistorical: HistoricalWindowData = {
    symbol: 'AAPL',
    window: '1D',
    points: [
      { timestamp: '2026-09-25T14:30:00Z', date: '09:30 AM', price: 177.0, normalizedPercentage: 0 },
      { timestamp: '2026-09-25T15:00:00Z', date: '10:00 AM', price: 178.5, normalizedPercentage: 0.85 },
    ],
  };

  it('renders search input and quick suggestion buttons', () => {
    render(
      <CustomCompanyPanel
        activeWindow="1D"
        quote={null}
        historical={null}
        isLoading={false}
        error={null}
        currentSymbol=""
        onSearch={vi.fn()}
        onClear={vi.fn()}
      />
    );

    expect(screen.getByPlaceholderText(/Enter symbol/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'NVDA' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'AAPL' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Look Up/i })).toBeInTheDocument();
  });

  it('triggers onSearch when form is submitted or quick pill clicked', () => {
    const handleSearch = vi.fn();
    render(
      <CustomCompanyPanel
        activeWindow="1D"
        quote={null}
        historical={null}
        isLoading={false}
        error={null}
        currentSymbol=""
        onSearch={handleSearch}
        onClear={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'NVDA' }));
    expect(handleSearch).toHaveBeenCalledWith('NVDA');

    const input = screen.getByPlaceholderText(/Enter symbol/i);
    fireEvent.change(input, { target: { value: 'googl' } });
    fireEvent.click(screen.getByRole('button', { name: /Look Up/i }));
    expect(handleSearch).toHaveBeenCalledWith('GOOGL');
  });

  it('shows clear no-data message when error prop is provided', () => {
    render(
      <CustomCompanyPanel
        activeWindow="1D"
        quote={null}
        historical={null}
        isLoading={false}
        error='No data available for symbol "INVALID123".'
        currentSymbol="INVALID123"
        onSearch={vi.fn()}
        onClear={vi.fn()}
      />
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('No Data Available')).toBeInTheDocument();
    expect(screen.getByText('No data available for symbol "INVALID123".')).toBeInTheDocument();
  });

  it('renders quote metrics and standalone area chart when data is available', () => {
    render(
      <CustomCompanyPanel
        activeWindow="1D"
        quote={mockQuote}
        historical={mockHistorical}
        isLoading={false}
        error={null}
        currentSymbol="AAPL"
        onSearch={vi.fn()}
        onClear={vi.fn()}
      />
    );

    expect(screen.getByText('Apple Inc.')).toBeInTheDocument();
    expect(screen.getByText('$178.50')).toBeInTheDocument();
    expect(screen.getByText(/\+1.25 \(\+0.71%\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Vol: 52.00M/i)).toBeInTheDocument();
  });
});

describe('MockFinanceService search behavior', () => {
  const service = new MockFinanceService();

  it('resolves quote and historical for valid new symbols without altering fixed companies', async () => {
    const quote = await service.searchQuote('NVDA');
    const historical = await service.searchHistorical('NVDA', '1D');

    expect(quote).not.toBeNull();
    expect(quote?.symbol).toBe('NVDA');
    expect(quote?.currentPrice).toBeGreaterThan(0);
    expect(historical).not.toBeNull();
    expect(historical?.symbol).toBe('NVDA');
    expect(historical?.points.length).toBeGreaterThan(0);
  });

  it('returns null for explicitly invalid/unrecognized symbols', async () => {
    const quote = await service.searchQuote('INVALIDTICKER123');
    const historical = await service.searchHistorical('INVALIDTICKER123', '1D');

    expect(quote).toBeNull();
    expect(historical).toBeNull();
  });
});
