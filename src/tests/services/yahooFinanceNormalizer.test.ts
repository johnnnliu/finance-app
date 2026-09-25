import { describe, it, expect } from 'vitest';
import {
  normalizeYahooQuote,
  normalizeYahooHistorical,
  mapWindowToYahooParams,
  YahooChartResponse,
} from '../../services/yahooFinanceNormalizer';
import { companyRegistry } from '../../config/companies';

describe('yahooFinanceNormalizer', () => {
  const sampleRawChart: YahooChartResponse = {
    chart: {
      result: [
        {
          meta: {
            symbol: 'IBM',
            regularMarketPrice: 195.5,
            chartPreviousClose: 190.0,
            regularMarketTime: 1710427800,
          },
          timestamp: [1710424200, 1710426000, 1710427800],
          indicators: {
            quote: [
              {
                open: [190.5, 192.0, 194.0],
                high: [193.0, 195.0, 196.2],
                low: [189.5, 191.0, 193.8],
                close: [191.0, 193.5, 195.5],
                volume: [100000, 150000, 200000],
              },
            ],
          },
        },
      ],
      error: null,
    },
  };

  it('correctly normalizes quote metrics including current price, delta and percent change', () => {
    const quote = normalizeYahooQuote(sampleRawChart, 'IBM');

    expect(quote.symbol).toBe('IBM');
    expect(quote.name).toBe('International Business Machines');
    expect(quote.currentPrice).toBe(195.5);
    expect(quote.previousClose).toBe(190.0);
    expect(quote.change).toBe(5.5);
    expect(quote.percentChange).toBe(2.89);
    expect(quote.high).toBe(196.2);
    expect(quote.low).toBe(189.5);
    expect(quote.volume).toBe(450000);
  });

  it('normalizes historical time series data with percentage change relative to period start', () => {
    const historical = normalizeYahooHistorical(sampleRawChart, 'IBM', '1D');

    expect(historical.symbol).toBe('IBM');
    expect(historical.window).toBe('1D');
    expect(historical.points).toHaveLength(3);

    // First point should have 0% baseline normalized percentage
    expect(historical.points[0].price).toBe(191.0);
    expect(historical.points[0].normalizedPercentage).toBe(0);

    // Last point calculation: ((195.5 - 191.0) / 191.0) * 100 = 2.36%
    expect(historical.points[2].price).toBe(195.5);
    expect(historical.points[2].normalizedPercentage).toBe(2.36);
  });

  it('maps time windows to appropriate Yahoo Finance range and interval parameters', () => {
    expect(mapWindowToYahooParams('1D')).toEqual({ range: '1d', interval: '15m' });
    expect(mapWindowToYahooParams('7D')).toEqual({ range: '5d', interval: '1d' });
    expect(mapWindowToYahooParams('1Q')).toEqual({ range: '3mo', interval: '1wk' });
  });

  it('dynamically assigns company details for untracked companies in companyRegistry', () => {
    const customCompany = companyRegistry.getCompany('NVDA');
    expect(customCompany.symbol).toBe('NVDA');
    expect(customCompany.name).toBe('NVDA Corp.');
    expect(customCompany.color).toBeDefined();
    expect(customCompany.isAnchor).toBe(false);
  });
});
