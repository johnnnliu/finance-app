import { CompanyInfo } from '../types/finance';

/**
 * Default Tracked Companies for IBM and its key enterprise competitors
 */
export const DEFAULT_TRACKED_COMPANIES: CompanyInfo[] = [
  {
    symbol: 'IBM',
    name: 'International Business Machines',
    color: '#0f62fe', // IBM Blue
    isAnchor: true,
  },
  {
    symbol: 'MSFT',
    name: 'Microsoft Corp.',
    color: '#00a4ef',
  },
  {
    symbol: 'ORCL',
    name: 'Oracle Corp.',
    color: '#f80000',
  },
  {
    symbol: 'SAP',
    name: 'SAP SE',
    color: '#f0ab00',
  },
  {
    symbol: 'CRM',
    name: 'Salesforce Inc.',
    color: '#00a1e0',
  },
];

// Color palette for dynamically added companies
export const DYNAMIC_PALETTE = [
  '#8a3ffc', // Purple
  '#33b1ff', // Cyan
  '#007d79', // Teal
  '#ff7eb6', // Magenta
  '#6fdc8c', // Mint
  '#d12771', // Ruby
];

/**
 * Extensible Company Registry
 */
class CompanyRegistry {
  private companies: Map<string, CompanyInfo> = new Map();

  constructor(initialList: CompanyInfo[] = DEFAULT_TRACKED_COMPANIES) {
    initialList.forEach((c) => this.registerCompany(c));
  }

  registerCompany(company: CompanyInfo): void {
    this.companies.set(company.symbol.toUpperCase(), company);
  }

  getCompany(symbol: string): CompanyInfo {
    const sym = symbol.toUpperCase();
    if (this.companies.has(sym)) {
      return this.companies.get(sym)!;
    }

    // Auto-assign a consistent color and info for newly discovered companies
    const colorIndex = Math.abs(
      sym.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0) % DYNAMIC_PALETTE.length
    );

    const dynamicCompany: CompanyInfo = {
      symbol: sym,
      name: `${sym} Corp.`,
      color: DYNAMIC_PALETTE[colorIndex],
      isAnchor: false,
    };

    this.companies.set(sym, dynamicCompany);
    return dynamicCompany;
  }

  getAllTracked(): CompanyInfo[] {
    return Array.from(this.companies.values());
  }

  getDefaultSymbols(): string[] {
    return DEFAULT_TRACKED_COMPANIES.map((c) => c.symbol);
  }
}

export const companyRegistry = new CompanyRegistry();

export const TRACKED_COMPANIES = DEFAULT_TRACKED_COMPANIES;
export const DEFAULT_SYMBOLS = DEFAULT_TRACKED_COMPANIES.map((c) => c.symbol);
export const COMPANY_MAP = DEFAULT_TRACKED_COMPANIES.reduce<Record<string, CompanyInfo>>((acc, company) => {
  acc[company.symbol] = company;
  return acc;
}, {});
