import { useState, useEffect, useCallback } from 'react';
import { StockQuote, HistoricalWindowData, TimeWindow } from '../types/finance';
import { DEFAULT_SYMBOLS } from '../config/companies';
import { financeService } from '../services';

interface UseMarketDataResult {
  quotes: Record<string, StockQuote>;
  historical: Record<string, HistoricalWindowData>;
  activeWindow: TimeWindow;
  setActiveWindow: (window: TimeWindow) => void;
  isLoading: boolean;
  error: string | null;
  lastUpdated: string;
  refreshData: () => Promise<void>;
}

export const useMarketData = (symbols: string[] = DEFAULT_SYMBOLS): UseMarketDataResult => {
  const [activeWindow, setActiveWindow] = useState<TimeWindow>('1D');
  const [quotes, setQuotes] = useState<Record<string, StockQuote>>({});
  const [historical, setHistorical] = useState<Record<string, HistoricalWindowData>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [quotesData, histData] = await Promise.all([
        financeService.getQuotes(symbols),
        financeService.getHistoricalData(symbols, activeWindow),
      ]);

      setQuotes(quotesData);
      setHistorical(histData);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch market data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [symbols, activeWindow]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    quotes,
    historical,
    activeWindow,
    setActiveWindow,
    isLoading,
    error,
    lastUpdated,
    refreshData: fetchData,
  };
};
