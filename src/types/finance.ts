export type TimeWindow = '1D' | '7D' | '1Q';

export interface StockQuote {
  symbol: string;
  name: string;
  currentPrice: number;
  change: number;
  percentChange: number;
  open: number;
  high: number;
  low: number;
  volume: number;
  previousClose: number;
  marketCap?: string;
  lastUpdated: string;
}

export interface TimeSeriesPoint {
  timestamp: string;
  date: string;
  price: number;
  normalizedPercentage?: number;
}

export interface HistoricalWindowData {
  symbol: string;
  window: TimeWindow;
  points: TimeSeriesPoint[];
}

export interface CompanyInfo {
  symbol: string;
  name: string;
  color: string;
  isAnchor?: boolean;
}

export interface MarketDataset {
  quotes: Record<string, StockQuote>;
  historical: Record<string, HistoricalWindowData>;
}

export interface IFinanceService {
  getQuotes(symbols: string[]): Promise<Record<string, StockQuote>>;
  getHistoricalData(symbols: string[], window: TimeWindow): Promise<Record<string, HistoricalWindowData>>;
  searchQuote(symbol: string): Promise<StockQuote>;
}
