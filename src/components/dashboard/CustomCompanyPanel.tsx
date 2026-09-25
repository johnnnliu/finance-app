import React, { useState } from 'react';
import { Search, X, TrendingUp, TrendingDown, HelpCircle, Layers } from 'lucide-react';
import { StockQuote, HistoricalWindowData, TimeWindow } from '../../types/finance';
import { companyRegistry } from '../../config/companies';
import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area,
} from 'recharts';

interface CustomCompanyPanelProps {
  activeWindow: TimeWindow;
  quote: StockQuote | null;
  historical: HistoricalWindowData | null;
  isLoading: boolean;
  error: string | null;
  currentSymbol: string;
  onSearch: (symbol: string) => void;
  onClear: () => void;
}

const QUICK_SUGGESTIONS = ['AAPL', 'NVDA', 'GOOGL', 'AMZN', 'META', 'INTC'];

export const CustomCompanyPanel: React.FC<CustomCompanyPanelProps> = ({
  activeWindow,
  quote,
  historical,
  isLoading,
  error,
  currentSymbol,
  onSearch,
  onClear,
}) => {
  const [inputValue, setInputValue] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = inputValue.trim().toUpperCase();
    if (clean) {
      onSearch(clean);
    }
  };

  const handleSelectQuick = (sym: string) => {
    setInputValue(sym);
    onSearch(sym);
  };

  const company = currentSymbol ? companyRegistry.getCompany(currentSymbol) : null;
  const isPositive = quote ? quote.change >= 0 : true;
  const themeColor = company?.color || '#8a3ffc';

  return (
    <div className="chart-card" style={{ marginTop: '24px', border: '1px solid #475569' }}>
      <div className="chart-card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Search size={20} color="#38bdf8" />
          <div>
            <h2 className="chart-title" style={{ fontSize: '1.2rem' }}>
              Explore Custom Company
            </h2>
            <p className="chart-subtitle">
              Look up any stock ticker to view standalone metrics and time-series performance
            </p>
          </div>
        </div>

        {currentSymbol && (
          <button
            onClick={() => {
              setInputValue('');
              onClear();
            }}
            className="tab-btn"
            style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem' }}
          >
            <X size={14} /> Clear Selection
          </button>
        )}
      </div>

      {/* Search Input and Quick Ticker Selector */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1', minWidth: '220px' }}>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Enter symbol (e.g. AAPL, NVDA, GOOGL)..."
            aria-label="Stock ticker input"
            style={{
              width: '100%',
              padding: '10px 14px',
              backgroundColor: '#0f172a',
              border: '1px solid #334155',
              borderRadius: '6px',
              color: '#f8fafc',
              fontSize: '0.875rem',
            }}
          />
        </div>
        <button
          type="submit"
          className="tab-btn active"
          disabled={isLoading || !inputValue.trim()}
          style={{ padding: '10px 20px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <Search size={16} /> Look Up
        </button>
      </form>

      {/* Quick Select Tickers */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Popular tickers:</span>
        {QUICK_SUGGESTIONS.map((sym) => (
          <button
            key={sym}
            type="button"
            onClick={() => handleSelectQuick(sym)}
            style={{
              background: currentSymbol === sym ? 'rgba(56, 189, 248, 0.2)' : '#0f172a',
              border: `1px solid ${currentSymbol === sym ? '#38bdf8' : '#334155'}`,
              color: currentSymbol === sym ? '#38bdf8' : '#cbd5e1',
              padding: '3px 8px',
              borderRadius: '4px',
              fontSize: '0.75rem',
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            {sym}
          </button>
        ))}
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="loading-container" style={{ minHeight: '180px' }}>
          <div className="spinner"></div>
          <p>Retrieving market data for {currentSymbol || inputValue}...</p>
        </div>
      )}

      {/* Explicit No-Data / Error message */}
      {!isLoading && error && (
        <div
          role="alert"
          style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid #ef4444',
            borderRadius: '6px',
            padding: '16px',
            color: '#fca5a5',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <HelpCircle size={24} color="#ef4444" />
          <div>
            <strong style={{ display: 'block', marginBottom: '2px', color: '#fecaca' }}>
              No Data Available
            </strong>
            <span style={{ fontSize: '0.875rem' }}>{error}</span>
          </div>
        </div>
      )}

      {/* Result view: Quote summary + Custom Graph */}
      {!isLoading && !error && quote && historical && historical.points.length > 0 && (
        <div>
          {/* Quote KPI Summary Header */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '12px',
              backgroundColor: '#0f172a',
              padding: '16px',
              borderRadius: '8px',
              marginBottom: '20px',
              border: `1px solid ${themeColor}`,
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.25rem', fontWeight: 700, color: themeColor }}>
                  {quote.symbol}
                </span>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{quote.name}</span>
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, marginTop: '4px' }}>
                ${quote.currentPrice.toFixed(2)}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Session Change</div>
              <div
                className={`metric-change ${isPositive ? 'positive' : 'negative'}`}
                style={{ fontSize: '1rem', marginTop: '4px' }}
              >
                {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                <span>
                  {isPositive ? '+' : ''}
                  {quote.change.toFixed(2)} ({isPositive ? '+' : ''}
                  {quote.percentChange.toFixed(2)}%)
                </span>
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Day Range & Volume</div>
              <div style={{ fontSize: '0.875rem', marginTop: '4px', color: '#f8fafc' }}>
                ${quote.low.toFixed(2)} - ${quote.high.toFixed(2)}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                Vol: {(quote.volume / 1000000).toFixed(2)}M
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Active Time Window</div>
              <div style={{ fontSize: '0.875rem', marginTop: '4px', fontWeight: 600, color: '#38bdf8' }}>
                {activeWindow === '1D' ? 'Current Day (15m intervals)' : activeWindow === '7D' ? 'Last 7 Days (Daily)' : 'Last Quarter (Weekly)'}
              </div>
            </div>
          </div>

          {/* Standalone Chart for Selected Company */}
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historical.points} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id={`grad-${quote.symbol}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={themeColor} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={themeColor} stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                <YAxis
                  stroke="#94a3b8"
                  tick={{ fontSize: 12 }}
                  domain={['auto', 'auto']}
                  tickFormatter={(val) => `$${val}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderColor: '#475569',
                    borderRadius: '6px',
                    color: '#f8fafc',
                  }}
                  formatter={(val: number) => [`$${Number(val).toFixed(2)}`, quote.symbol]}
                />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke={themeColor}
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill={`url(#grad-${quote.symbol})`}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Initial Empty State guidance */}
      {!isLoading && !error && !quote && (
        <div
          style={{
            textAlign: 'center',
            padding: '32px 16px',
            backgroundColor: 'rgba(15, 23, 42, 0.5)',
            borderRadius: '6px',
            color: '#94a3b8',
          }}
        >
          <Layers size={32} style={{ margin: '0 auto 8px auto', opacity: 0.6 }} />
          <p style={{ fontSize: '0.875rem' }}>
            Enter a ticker symbol above or click a suggestion to generate a dedicated performance graph.
          </p>
        </div>
      )}
    </div>
  );
};
