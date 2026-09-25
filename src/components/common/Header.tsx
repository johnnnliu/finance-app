import React from 'react';
import { RefreshCw, TrendingUp } from 'lucide-react';

interface HeaderProps {
  onRefresh: () => void;
  isLoading: boolean;
  lastUpdated?: string;
}

export const Header: React.FC<HeaderProps> = ({ onRefresh, isLoading, lastUpdated }) => {
  return (
    <header className="header">
      <div className="header-title-group">
        <TrendingUp size={28} color="#0f62fe" />
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>IBM Market Analytics</h1>
          <p style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
            Enterprise Tech Benchmarking & Competitor Analysis
          </p>
        </div>
        <span className="header-badge">Live Lab Demo</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {lastUpdated && (
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
            Last updated: {lastUpdated}
          </span>
        )}
        <button
          className="btn-refresh"
          onClick={onRefresh}
          disabled={isLoading}
          aria-label="Refresh Market Data"
        >
          <RefreshCw size={14} className={isLoading ? 'spinner' : ''} />
          Refresh
        </button>
      </div>
    </header>
  );
};
