import { IFinanceService } from '../types/finance';
import { MockFinanceService } from './mockFinanceService';
import { YahooFinanceService } from './yahooFinanceService';

// Singleton instance providing the active finance service
// Defaults to live Yahoo Finance service via the backend proxy
export const financeService: IFinanceService =
  import.meta.env?.VITE_USE_MOCK === 'true'
    ? new MockFinanceService()
    : new YahooFinanceService(import.meta.env?.VITE_PROXY_URL || '');

export * from './mockFinanceService';
export * from './yahooFinanceService';
