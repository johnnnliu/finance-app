import React from 'react';
import { StockQuote, HistoricalWindowData } from '../../types/finance';
import { TRACKED_COMPANIES } from '../../config/companies';
import { LineComparisonChart } from '../charts/LineComparisonChart';
import { Award, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface QuarterViewProps {
  quotes: Record<string, StockQuote>;
  historical: Record<string, HistoricalWindowData>;
}

export const QuarterView: React.FC<QuarterViewProps> = ({ quotes, historical }) => {
  // Rank companies by quarterly gain
  const rankings = TRACKED_COMPANIES.map((company) => {
    const hist = historical[company.symbol];
    const points = hist?.points || [];
    const firstPrice = points[0]?.price || 1;
    const lastPrice = points[points.length - 1]?.price || 1;
    const qGain = Number((((lastPrice - firstPrice) / firstPrice) * 100).toFixed(2));
    const highestPrice = points.reduce((max, p) => (p.price > max ? p.price : max), 0);
    const lowestPrice = points.reduce((min, p) => (p.price < min ? p.price : min), Infinity);

    return {
      ...company,
      qGain,
      currentPrice: quotes[company.symbol]?.currentPrice || lastPrice,
      highestPrice,
      lowestPrice: lowestPrice === Infinity ? 0 : lowestPrice,
    };
  }).sort((a, b) => b.qGain - a.qGain);

  return (
    <div>
      <LineComparisonChart
        data={historical}
        window="1Q"
        title="Quarterly Trend & Volatility Analysis (90-Day)"
        subtitle="13-week performance trajectory showing long-term momentum"
      />

      <div className="chart-card">
        <div className="chart-card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Award size={20} color="#f0ab00" />
            <h3 className="chart-title">Quarterly Leaderboard & Relative Strength</h3>
          </div>
        </div>

        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Company</th>
                <th>Ticker</th>
                <th>Quarter Return</th>
                <th>90-Day Low</th>
                <th>90-Day High</th>
              </tr>
            </thead>
            <tbody>
              {rankings.map((item, index) => {
                const isPositive = item.qGain >= 0;
                return (
                  <tr key={item.symbol}>
                    <td>
                      <span
                        style={{
                          fontWeight: 700,
                          color: index === 0 ? '#f0ab00' : '#94a3b8',
                        }}
                      >
                        #{index + 1}
                      </span>
                    </td>
                    <td style={{ fontWeight: item.isAnchor ? 700 : 400 }}>
                      {item.name} {item.isAnchor && '★'}
                    </td>
                    <td>
                      <span style={{ color: item.color, fontWeight: 600 }}>{item.symbol}</span>
                    </td>
                    <td className={isPositive ? 'positive' : 'negative'}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {isPositive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                        <span>
                          {isPositive ? '+' : ''}
                          {item.qGain}%
                        </span>
                      </div>
                    </td>
                    <td>${item.lowestPrice.toFixed(2)}</td>
                    <td>${item.highestPrice.toFixed(2)}</td>
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
