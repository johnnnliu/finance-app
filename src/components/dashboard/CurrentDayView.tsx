import React from 'react';
import { StockQuote, HistoricalWindowData } from '../../types/finance';
import { TRACKED_COMPANIES } from '../../config/companies';
import { MetricCard } from '../common/MetricCard';
import { LineComparisonChart } from '../charts/LineComparisonChart';

interface CurrentDayViewProps {
  quotes: Record<string, StockQuote>;
  historical: Record<string, HistoricalWindowData>;
}

export const CurrentDayView: React.FC<CurrentDayViewProps> = ({ quotes, historical }) => {
  return (
    <div>
      <div className="cards-grid">
        {TRACKED_COMPANIES.map((company) => {
          const quote = quotes[company.symbol];
          if (!quote) return null;
          return (
            <MetricCard
              key={company.symbol}
              quote={quote}
              isAnchor={company.isAnchor}
            />
          );
        })}
      </div>

      <LineComparisonChart
        data={historical}
        window="1D"
        title="Intraday Relative Performance"
        subtitle="Tracking today's percentage & price variance relative to open"
      />
    </div>
  );
};
