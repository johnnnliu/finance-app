import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { HistoricalWindowData, TimeWindow } from '../../types/finance';
import { TRACKED_COMPANIES } from '../../config/companies';

interface LineComparisonChartProps {
  data: Record<string, HistoricalWindowData>;
  window: TimeWindow;
  title: string;
  subtitle?: string;
}

export const LineComparisonChart: React.FC<LineComparisonChartProps> = ({
  data,
  window,
  title,
  subtitle,
}) => {
  const [showNormalized, setShowNormalized] = useState(true);

  // Transform dictionary of symbols into recharts unified row format
  const symbols = Object.keys(data);
  if (symbols.length === 0) {
    return null;
  }

  const primarySymbol = symbols[0];
  const pointCount = data[primarySymbol]?.points.length || 0;

  const chartData = [];
  for (let i = 0; i < pointCount; i++) {
    const row: Record<string, any> = {
      date: data[primarySymbol].points[i]?.date || '',
    };

    for (const sym of symbols) {
      const pt = data[sym]?.points[i];
      if (pt) {
        row[sym] = showNormalized ? pt.normalizedPercentage : pt.price;
      }
    }
    chartData.push(row);
  }

  return (
    <div className="chart-card">
      <div className="chart-card-header">
        <div>
          <h2 className="chart-title">{title}</h2>
          {subtitle && <p className="chart-subtitle">{subtitle}</p>}
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className={`tab-btn ${showNormalized ? 'active' : ''}`}
            style={{ padding: '4px 10px', fontSize: '0.75rem' }}
            onClick={() => setShowNormalized(true)}
          >
            % Change
          </button>
          <button
            className={`tab-btn ${!showNormalized ? 'active' : ''}`}
            style={{ padding: '4px 10px', fontSize: '0.75rem' }}
            onClick={() => setShowNormalized(false)}
          >
            Price ($)
          </button>
        </div>
      </div>

      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="date" stroke="#94a3b8" tick={{ fontSize: 12 }} />
            <YAxis
              stroke="#94a3b8"
              tick={{ fontSize: 12 }}
              unit={showNormalized ? '%' : '$'}
              domain={['auto', 'auto']}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                borderColor: '#475569',
                borderRadius: '6px',
                color: '#f8fafc',
              }}
              formatter={(val: number) => [
                showNormalized ? `${val > 0 ? '+' : ''}${val}%` : `$${val.toFixed(2)}`,
              ]}
            />
            <Legend />
            {TRACKED_COMPANIES.map((company) => {
              if (!data[company.symbol]) return null;
              return (
                <Line
                  key={company.symbol}
                  type="monotone"
                  dataKey={company.symbol}
                  name={`${company.symbol} (${company.name.split(' ')[0]})`}
                  stroke={company.color}
                  strokeWidth={company.isAnchor ? 3 : 1.8}
                  dot={window === '7D'}
                  activeDot={{ r: 6 }}
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
