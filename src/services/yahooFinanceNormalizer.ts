import {
  StockQuote,
  HistoricalWindowData,
  TimeSeriesPoint,
  TimeWindow,
} from '../types/finance';
import { COMPANY_MAP } from '../config/companies';

/**
 * Raw Yahoo Finance v8 /chart API response shape
 */
export interface YahooChartResponse {
  chart?: {
    result?: Array<{
      meta: {
        currency?: string;
        symbol: string;
        exchangeName?: string;
        instrumentType?: string;
        firstTradeDate?: number;
        regularMarketTime?: number;
        gmtoffset?: number;
        timezone?: string;
        exchangeTimezoneName?: string;
        regularMarketPrice?: number;
        chartPreviousClose?: number;
        previousClose?: number;
        scale?: number;
        priceHint?: number;
        currentTradingPeriod?: {
          pre?: { start: number; end: number };
          regular?: { start: number; end: number };
          post?: { start: number; end: number };
        };
        tradingPeriods?: Array<Array<{ start: number; end: number }>>;
        dataGranularity?: string;
        range?: string;
        validRanges?: string[];
      };
      timestamp?: number[];
      indicators?: {
        quote?: Array<{
          open?: (number | null)[];
          high?: (number | null)[];
          low?: (number | null)[];
          close?: (number | null)[];
          volume?: (number | null)[];
        }>;
      };
    }>;
    error?: {
      code: string;
      description: string;
    } | null;
  };
}

/**
 * Normalizes a raw Yahoo Finance v8 chart JSON response into a clean StockQuote
 */
export function normalizeYahooQuote(raw: any, symbol: string): StockQuote {
  const result = raw?.chart?.result?.[0] || raw;
  if (!result) {
    throw new Error(`Invalid Yahoo Finance quote response for symbol: ${symbol}`);
  }

  const meta = result.meta || {};
  const companyInfo = COMPANY_MAP[symbol.toUpperCase()];

  const currentPrice = meta.regularMarketPrice ?? meta.chartPreviousClose ?? 0;
  const previousClose = meta.chartPreviousClose ?? meta.previousClose ?? currentPrice;
  const change = Number((currentPrice - previousClose).toFixed(2));
  const percentChange = previousClose !== 0
    ? Number(((change / previousClose) * 100).toFixed(2))
    : 0;

  let open = meta.regularMarketOpen ?? currentPrice;
  let high = meta.regularMarketDayHigh ?? currentPrice;
  let low = meta.regularMarketDayLow ?? currentPrice;
  let volume = meta.regularMarketVolume ?? 0;

  // If quotes array is provided (yahoo-finance2 format)
  if (Array.isArray(result.quotes) && result.quotes.length > 0) {
    const quotes = result.quotes;
    const opens = quotes.map((q: any) => q.open).filter((v: any) => v != null && !isNaN(v));
    const highs = quotes.map((q: any) => q.high).filter((v: any) => v != null && !isNaN(v));
    const lows = quotes.map((q: any) => q.low).filter((v: any) => v != null && !isNaN(v));
    const volumes = quotes.map((q: any) => q.volume).filter((v: any) => v != null && !isNaN(v));

    if (opens.length > 0) open = opens[0];
    if (highs.length > 0) high = Math.max(...highs, currentPrice);
    if (lows.length > 0) low = Math.min(...lows, currentPrice);
    if (volumes.length > 0) volume = volumes.reduce((a: number, b: number) => a + b, 0);
  } else if (result.indicators?.quote?.[0]) {
    // raw Yahoo v8 format
    const quoteData = result.indicators.quote[0];
    const opens = (quoteData.open || []).filter((v: any) => v != null && !isNaN(v));
    const highs = (quoteData.high || []).filter((v: any) => v != null && !isNaN(v));
    const lows = (quoteData.low || []).filter((v: any) => v != null && !isNaN(v));
    const volumes = (quoteData.volume || []).filter((v: any) => v != null && !isNaN(v));

    if (opens.length > 0) open = opens[0];
    if (highs.length > 0) high = Math.max(...highs, currentPrice);
    if (lows.length > 0) low = Math.min(...lows, currentPrice);
    if (volumes.length > 0) volume = volumes.reduce((a: number, b: number) => a + b, 0);
  }

  const lastUpdated = meta.regularMarketTime
    ? new Date(meta.regularMarketTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return {
    symbol: symbol.toUpperCase(),
    name: meta.shortName || meta.longName || companyInfo?.name || `${symbol.toUpperCase()} Corp.`,
    currentPrice: Number(currentPrice.toFixed(2)),
    change,
    percentChange,
    open: Number(Number(open).toFixed(2)),
    high: Number(Number(high).toFixed(2)),
    low: Number(Number(low).toFixed(2)),
    volume: Math.round(volume),
    previousClose: Number(Number(previousClose).toFixed(2)),
    lastUpdated,
  };
}

/**
 * Normalizes Yahoo Finance chart timestamps and closes into HistoricalWindowData
 * Supports both yahoo-finance2 (result.quotes: [{date, close, ...}]) and raw Yahoo v8 format
 */
export function normalizeYahooHistorical(
  raw: any,
  symbol: string,
  window: TimeWindow
): HistoricalWindowData {
  const result = raw?.chart?.result?.[0] || raw;
  if (!result) {
    return {
      symbol: symbol.toUpperCase(),
      window,
      points: [],
    };
  }

  const validEntries: { time: Date; price: number }[] = [];

  // Support yahoo-finance2 format: result.quotes = [{ date, close, open, ... }]
  if (Array.isArray(result.quotes)) {
    for (const q of result.quotes) {
      if (q && q.close != null && !isNaN(q.close)) {
        validEntries.push({
          time: new Date(q.date),
          price: Number(q.close.toFixed(2)),
        });
      }
    }
  } else if (result.timestamp && result.indicators?.quote?.[0]) {
    // Support raw Yahoo v8 format: timestamp[] and indicators.quote[0].close[]
    const timestamps = result.timestamp;
    const closes = result.indicators.quote[0].close || [];

    for (let i = 0; i < timestamps.length; i++) {
      const price = closes[i];
      if (price !== null && price !== undefined && !isNaN(price)) {
        validEntries.push({
          time: new Date(timestamps[i] * 1000),
          price: Number(price.toFixed(2)),
        });
      }
    }
  }

  if (validEntries.length === 0) {
    return {
      symbol: symbol.toUpperCase(),
      window,
      points: [],
    };
  }

  const basePrice = validEntries[0].price;

  const points: TimeSeriesPoint[] = validEntries.map((entry) => {
    const normalizedPercentage = basePrice !== 0
      ? Number((((entry.price - basePrice) / basePrice) * 100).toFixed(2))
      : 0;

    let dateLabel: string;
    if (window === '1D') {
      dateLabel = entry.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (window === '7D') {
      dateLabel = entry.time.toLocaleDateString([], { weekday: 'short', month: 'numeric', day: 'numeric' });
    } else {
      dateLabel = entry.time.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }

    return {
      timestamp: entry.time.toISOString(),
      date: dateLabel,
      price: entry.price,
      normalizedPercentage,
    };
  });

  return {
    symbol: symbol.toUpperCase(),
    window,
    points,
  };
}

/**
 * Maps dashboard TimeWindow to Yahoo Finance API range and interval parameters
 */
export function mapWindowToYahooParams(window: TimeWindow): { range: string; interval: string } {
  switch (window) {
    case '1D':
      return { range: '1d', interval: '15m' };
    case '7D':
      return { range: '5d', interval: '1d' };
    case '1Q':
      return { range: '3mo', interval: '1wk' };
    default:
      return { range: '1d', interval: '15m' };
  }
}
