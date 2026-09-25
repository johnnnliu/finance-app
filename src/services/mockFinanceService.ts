import {
  IFinanceService,
  StockQuote,
  HistoricalWindowData,
  TimeWindow,
  TimeSeriesPoint,
} from '../types/finance';
import { TRACKED_COMPANIES } from '../config/companies';

// Baseline prices for deterministic generation
const BASE_PRICES: Record<string, number> = {
  IBM: 191.45,
  MSFT: 425.22,
  ORCL: 125.8,
  SAP: 198.6,
  CRM: 304.15,
};

const BASE_VOLUMES: Record<string, number> = {
  IBM: 3820400,
  MSFT: 21540300,
  ORCL: 8940100,
  SAP: 2450000,
  CRM: 5120000,
};

export class MockFinanceService implements IFinanceService {
  private getDeterministicPoints(
    symbol: string,
    window: TimeWindow,
    basePrice: number
  ): TimeSeriesPoint[] {
    const points: TimeSeriesPoint[] = [];
    const now = new Date();
    let pointCount = 12; // default for 1D (hours/intervals)
    let stepMs = 30 * 60 * 1000; // 30 min

    if (window === '7D') {
      pointCount = 7;
      stepMs = 24 * 60 * 60 * 1000; // 1 day
    } else if (window === '1Q') {
      pointCount = 13; // 13 weeks
      stepMs = 7 * 24 * 60 * 60 * 1000; // 1 week
    }

    // Generate seed variance based on symbol characters
    const seed = symbol.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

    const initialPrice =
      window === '1D'
        ? basePrice * (1 - ((seed % 10) - 5) * 0.003)
        : window === '7D'
        ? basePrice * (1 - ((seed % 20) - 10) * 0.008)
        : basePrice * (1 - ((seed % 30) - 15) * 0.015);

    let currentPrice = initialPrice;

    for (let i = 0; i < pointCount; i++) {
      const timeOffset = (pointCount - 1 - i) * stepMs;
      const pointDate = new Date(now.getTime() - timeOffset);

      // Deterministic wave fluctuation
      const deltaFactor = Math.sin((i + (seed % 7)) * 0.8) * 0.012 + ((seed % 5) - 2) * 0.002;
      currentPrice = Number((currentPrice * (1 + deltaFactor)).toFixed(2));

      const normalizedPercentage = Number(
        (((currentPrice - initialPrice) / initialPrice) * 100).toFixed(2)
      );

      let dateLabel = pointDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      if (window === '7D') {
        dateLabel = pointDate.toLocaleDateString([], { weekday: 'short', month: 'numeric', day: 'numeric' });
      } else if (window === '1Q') {
        dateLabel = pointDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
      }

      points.push({
        timestamp: pointDate.toISOString(),
        date: dateLabel,
        price: currentPrice,
        normalizedPercentage,
      });
    }

    return points;
  }

  async getQuotes(symbols: string[]): Promise<Record<string, StockQuote>> {
    // Artificial small latency for realistic UI feel
    await new Promise((resolve) => setTimeout(resolve, 80));

    const result: Record<string, StockQuote> = {};

    for (const symbol of symbols) {
      const company = TRACKED_COMPANIES.find((c) => c.symbol === symbol);
      const base = BASE_PRICES[symbol] || 150.0;
      const seed = symbol.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

      // Realistic daily fluctuation
      const percentChange = Number((((seed % 60) - 28) * 0.08).toFixed(2));
      const currentPrice = Number((base * (1 + percentChange / 100)).toFixed(2));
      const change = Number((currentPrice - base).toFixed(2));
      const high = Number((Math.max(currentPrice, base) * 1.012).toFixed(2));
      const low = Number((Math.min(currentPrice, base) * 0.988).toFixed(2));
      const open = Number((base * 0.998).toFixed(2));
      const volume = BASE_VOLUMES[symbol] || 1000000;

      result[symbol] = {
        symbol,
        name: company ? company.name : `${symbol} Corp.`,
        currentPrice,
        change,
        percentChange,
        open,
        high,
        low,
        volume,
        previousClose: base,
        lastUpdated: new Date().toLocaleTimeString(),
      };
    }

    return result;
  }

  async getHistoricalData(
    symbols: string[],
    window: TimeWindow
  ): Promise<Record<string, HistoricalWindowData>> {
    await new Promise((resolve) => setTimeout(resolve, 100));

    const result: Record<string, HistoricalWindowData> = {};

    for (const symbol of symbols) {
      const base = BASE_PRICES[symbol] || 150.0;
      const points = this.getDeterministicPoints(symbol, window, base);
      result[symbol] = {
        symbol,
        window,
        points,
      };
    }

    return result;
  }

  async searchQuote(symbol: string): Promise<StockQuote | null> {
    const cleanSym = symbol.toUpperCase().trim();
    if (!cleanSym) return null;
    // For mock testing, symbols like 'INVALID', 'NOTFOUND', 'UNKNOWN', 'FAIL' return null
    if (['INVALID', 'NOTFOUND', 'UNKNOWN', 'FAIL', 'INVALIDTICKER123'].includes(cleanSym)) {
      return null;
    }
    const quotes = await this.getQuotes([cleanSym]);
    return quotes[cleanSym] || null;
  }

  async searchHistorical(symbol: string, window: TimeWindow): Promise<HistoricalWindowData | null> {
    const cleanSym = symbol.toUpperCase().trim();
    if (!cleanSym) return null;
    if (['INVALID', 'NOTFOUND', 'UNKNOWN', 'FAIL', 'INVALIDTICKER123'].includes(cleanSym)) {
      return null;
    }
    const data = await this.getHistoricalData([cleanSym], window);
    return data[cleanSym] || null;
  }
}
