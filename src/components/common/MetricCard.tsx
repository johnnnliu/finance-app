import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { StockQuote } from '../../types/finance';

interface MetricCardProps {
  quote: StockQuote;
  isAnchor?: boolean;
}

export const MetricCard: React.FC<MetricCardProps> = ({ quote, isAnchor }) => {
  const isPositive = quote.change >= 0;

  return (
    <div className={`metric-card ${isAnchor ? 'anchor' : ''}`} data-testid={`metric-card-${quote.symbol}`}>
      <div className="metric-card-header">
        <div>
          <div className="symbol-badge">
            {quote.symbol}
            {isAnchor && <span className="anchor-indicator">Primary</span>}
          </div>
          <div className="company-name" title={quote.name}>
            {quote.name}
          </div>
        </div>
      </div>

      <div className="metric-price">${quote.currentPrice.toFixed(2)}</div>

      <div className={`metric-change ${isPositive ? 'positive' : 'negative'}`}>
        {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
        <span>
          {isPositive ? '+' : ''}
          {quote.change.toFixed(2)} ({isPositive ? '+' : ''}
          {quote.percentChange.toFixed(2)}%)
        </span>
      </div>

      <div className="metric-stats">
        <span>Range: ${quote.low.toFixed(2)} - ${quote.high.toFixed(2)}</span>
        <span>Vol: {(quote.volume / 1000000).toFixed(1)}M</span>
      </div>
    </div>
  );
};
