import { describe, it, expect } from 'vitest';
import { MockFinanceService } from '../../services/mockFinanceService';
import { TRACKED_COMPANIES } from '../../config/companies';

describe('MockFinanceService', () => {
  const service = new MockFinanceService();
  const symbols = ['IBM', 'MSFT', 'ORCL', 'SAP', 'CRM'];

  it('retrieves quotes for all requested symbols with valid price and volume', async () => {
    const quotes = await service.getQuotes(symbols);

    expect(Object.keys(quotes)).toHaveLength(5);
    for (const sym of symbols) {
      expect(quotes[sym]).toBeDefined();
      expect(quotes[sym].symbol).toBe(sym);
      expect(quotes[sym].currentPrice).toBeGreaterThan(0);
      expect(quotes[sym].volume).toBeGreaterThan(0);
      expect(typeof quotes[sym].percentChange).toBe('number');
    }
  });

  it('generates normalized historical time series data for 1D, 7D, and 1Q', async () => {
    const windows = ['1D', '7D', '1Q'] as const;

    for (const window of windows) {
      const historical = await service.getHistoricalData(symbols, window);

      expect(Object.keys(historical)).toHaveLength(5);
      const ibmData = historical['IBM'];
      expect(ibmData).toBeDefined();
      expect(ibmData.window).toBe(window);
      expect(ibmData.points.length).toBeGreaterThan(0);

      // Verify points contain price and normalized percentage
      for (const point of ibmData.points) {
        expect(point.price).toBeGreaterThan(0);
        expect(typeof point.normalizedPercentage).toBe('number');
        expect(point.date).toBeDefined();
      }
    }
  });

  it('includes proper company naming from company registry', async () => {
    const quotes = await service.getQuotes(['IBM']);
    const ibmCompany = TRACKED_COMPANIES.find((c) => c.symbol === 'IBM');
    expect(quotes['IBM'].name).toBe(ibmCompany?.name);
  });
});
