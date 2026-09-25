import React from 'react';
import { StockQuote, HistoricalWindowData } from '../../types/finance';
import { TRACKED_COMPANIES } from '../../config/companies';
import { LineComparisonChart } from '../charts/LineComparisonChart';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface SevenDayViewProps {
  quotes: Record<string, StockQuote>;
  historical: Record<string, HistoricalWindowData>;
}

export const SevenDayView: React.FC<SevenDayViewProps> = ({ quotes, historical }) => {
  return (
    <div>
      <LineComparisonChart
        data={historical}
        window="7D"
        title="7-Day Trajectory Comparison"
        subtitle="Comparing rolling 7-day normalized performance for IBM vs competitors"
      />

      <div className="chart-card">
        <h3 className="chart-title">7-Day Performance Summary</h3>
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Company</th>
                <th>Symbol</th>
                <th>Current Price</th>
                <th>7-Day Net Return</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {TRACKED_COMPANIES.map((company) => {
                const quote = quotes[company.symbol];
                const hist = historical[company.symbol];
                const firstPt = hist?.points[0]?.price || quote?.currentPrice || 1;
                const lastPt = hist?.points[hist.points.length - 1]?.price || quote?.currentPrice || 1;
                const net7dReturn = Number((((lastPt - firstPt) / firstPt) * 100).toFixed(2));
                const isPositive = net7dReturn >= 0;

                return (
                  <tr key={company.symbol}>
                    <td style={{ fontWeight: company.isAnchor ? 700 : 400 }}>
                      {company.name} {company.isAnchor && '★'}
                    </td>
                    <td>
                      <span style={{ color: company.color, fontWeight: 600 }}>
                        {company.symbol}
                      </span>
                    </td>
                    <td>${quote?.currentPrice.toFixed(2)}</td>
                    <td className={isPositive ? 'positive' : 'negative'}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                        <span>
                          {isPositive ? '+' : ''}
                          {net7dReturn}%
                        </span>
                      </div>
                    </td>
                    <td>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          backgroundColor: isPositive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                          color: isPositive ? '#10b981' : '#ef4444',
                        }}
                      >
                        {isPositive ? 'Outperforming' : 'Retracting'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
