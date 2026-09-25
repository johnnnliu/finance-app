import {
  IFinanceService,
  StockQuote,
  HistoricalWindowData,
  TimeWindow,
} from '../types/finance';
import { MockFinanceService } from './mockFinanceService';
import {
  normalizeYahooQuote,
  normalizeYahooHistorical,
  mapWindowToYahooParams,
  YahooChartResponse,
} from './yahooFinanceNormalizer';

/**
 * YahooFinanceService
 * Retrieves and normalizes real-time and historical financial data from Yahoo Finance API.
 * Supports configurable proxy URL (e.g. backend CORS proxy) and provides fallback resilience
 * to ensure robust offline and testing operation.
 */
export class YahooFinanceService implements IFinanceService {
  private fallbackService: MockFinanceService;
  private proxyUrl?: string;
  private baseUrl: string;

  constructor(proxyUrl?: string) {
    this.fallbackService = new MockFinanceService();
    this.proxyUrl = proxyUrl ?? '';
    // Direct Yahoo v8 chart API or routed through proxy
    this.baseUrl = this.proxyUrl.replace(/\/$/, '');
  }

  /**
   * Fetch raw chart payload for a single symbol
   */
  private async fetchChartPayload(symbol: string, range = '1d', interval = '15m'): Promise<YahooChartResponse> {
    const url = `${this.baseUrl}/api/chart/${encodeURIComponent(symbol)}?range=${range}&interval=${interval}`;

    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Yahoo Finance request failed for ${symbol} with status ${response.status}`);
    }

    return (await response.json()) as YahooChartResponse;
  }

  /**
   * Fetches latest quote summaries for multiple symbols
   */
  async getQuotes(symbols: string[]): Promise<Record<string, StockQuote>> {
    const result: Record<string, StockQuote> = {};
    const failedSymbols: string[] = [];

    await Promise.all(
      symbols.map(async (sym) => {
        try {
          const raw = await this.fetchChartPayload(sym, '1d', '15m');
          result[sym] = normalizeYahooQuote(raw, sym);
        } catch (err) {
          failedSymbols.push(sym);
        }
      })
    );

    // If all or some symbols fail (e.g., direct browser CORS without backend proxy), gracefully fallback
    if (failedSymbols.length > 0) {
      const fallbackQuotes = await this.fallbackService.getQuotes(failedSymbols);
      for (const sym of failedSymbols) {
        result[sym] = fallbackQuotes[sym];
      }
    }

    return result;
  }

  /**
   * Fetches historical time-series data for multiple symbols normalized by TimeWindow
   */
  async getHistoricalData(
    symbols: string[],
    window: TimeWindow
  ): Promise<Record<string, HistoricalWindowData>> {
    const { range, interval } = mapWindowToYahooParams(window);
    const result: Record<string, HistoricalWindowData> = {};
    const failedSymbols: string[] = [];

    await Promise.all(
      symbols.map(async (sym) => {
        try {
          const raw = await this.fetchChartPayload(sym, range, interval);
          result[sym] = normalizeYahooHistorical(raw, sym, window);
        } catch (err) {
          failedSymbols.push(sym);
        }
      })
    );

    if (failedSymbols.length > 0) {
      const fallbackHistorical = await this.fallbackService.getHistoricalData(failedSymbols, window);
      for (const sym of failedSymbols) {
        result[sym] = fallbackHistorical[sym];
      }
    }

    return result;
  }

  /**
   * Searches and normalizes single quote summary
   */
  async searchQuote(symbol: string): Promise<StockQuote> {
    const cleanSym = symbol.toUpperCase().trim();
    const quotes = await this.getQuotes([cleanSym]);
    return quotes[cleanSym];
  }
}
