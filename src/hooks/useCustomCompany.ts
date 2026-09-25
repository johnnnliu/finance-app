import { useState, useCallback, useEffect } from 'react';
import { StockQuote, HistoricalWindowData, TimeWindow } from '../types/finance';
import { companyRegistry } from '../config/companies';
import { financeService } from '../services';

interface UseCustomCompanyResult {
  symbol: string;
  quote: StockQuote | null;
  historical: HistoricalWindowData | null;
  isLoading: boolean;
  error: string | null;
  searchSymbol: (inputSymbol: string) => Promise<void>;
  clear: () => void;
}

export const useCustomCompany = (activeWindow: TimeWindow): UseCustomCompanyResult => {
  const [symbol, setSymbol] = useState<string>('');
  const [quote, setQuote] = useState<StockQuote | null>(null);
  const [historical, setHistorical] = useState<HistoricalWindowData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomData = useCallback(
    async (sym: string, window: TimeWindow) => {
      const cleanSym = sym.trim().toUpperCase();
      if (!cleanSym) {
        setQuote(null);
        setHistorical(null);
        setError(null);
        return;
      }

      // Ensure company is registered for color / metadata
      companyRegistry.getCompany(cleanSym);

      setIsLoading(true);
      setError(null);

      try {
        const [q, hist] = await Promise.all([
          financeService.searchQuote(cleanSym),
          financeService.searchHistorical(cleanSym, window),
        ]);

        if (!q && !hist) {
          setQuote(null);
          setHistorical(null);
          setError(`No data available for symbol "${cleanSym}". Please check the ticker symbol and try again.`);
        } else {
          setQuote(q);
          setHistorical(hist);
          setError(null);
        }
      } catch (err: any) {
        setQuote(null);
        setHistorical(null);
        setError(err?.message || `Unable to fetch data for "${cleanSym}".`);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const clear = useCallback(() => {
    setSymbol('');
    setQuote(null);
    setHistorical(null);
    setError(null);
    setIsLoading(false);
  }, []);

  const searchSymbol = useCallback(
    async (inputSymbol: string) => {
      const clean = inputSymbol.trim().toUpperCase();
      setSymbol(clean);
      if (clean) {
        await fetchCustomData(clean, activeWindow);
      } else {
        clear();
      }
    },
    [activeWindow, fetchCustomData, clear]
  );

  // Re-fetch historical data when the active time window changes if a symbol is selected
  useEffect(() => {
    if (symbol) {
      fetchCustomData(symbol, activeWindow);
    }
  }, [activeWindow, symbol, fetchCustomData]);

  return {
    symbol,
    quote,
    historical,
    isLoading,
    error,
    searchSymbol,
    clear,
  };
};
