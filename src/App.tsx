import React from 'react';
import { useMarketData } from './hooks/useMarketData';
import { Header } from './components/common/Header';
import { TimeWindowTabs } from './components/common/TimeWindowTabs';
import { LoadingState, ErrorBanner } from './components/common/FeedbackStates';
import { CurrentDayView } from './components/dashboard/CurrentDayView';
import { SevenDayView } from './components/dashboard/SevenDayView';
import { QuarterView } from './components/dashboard/QuarterView';
import './App.css';

export const App: React.FC = () => {
  const {
    quotes,
    historical,
    activeWindow,
    setActiveWindow,
    isLoading,
    error,
    lastUpdated,
    refreshData,
  } = useMarketData();

  return (
    <div className="app-container">
      <Header
        onRefresh={refreshData}
        isLoading={isLoading}
        lastUpdated={lastUpdated}
      />

      <TimeWindowTabs
        activeWindow={activeWindow}
        onChange={setActiveWindow}
      />

      {error && <ErrorBanner message={error} onRetry={refreshData} />}

      {isLoading && Object.keys(quotes).length === 0 ? (
        <LoadingState />
      ) : (
        <main>
          {activeWindow === '1D' && (
            <CurrentDayView quotes={quotes} historical={historical} />
          )}
          {activeWindow === '7D' && (
            <SevenDayView quotes={quotes} historical={historical} />
          )}
          {activeWindow === '1Q' && (
            <QuarterView quotes={quotes} historical={historical} />
          )}
        </main>
      )}
    </div>
  );
};

export default App;
