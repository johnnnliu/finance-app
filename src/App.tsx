import React from 'react';
import { useMarketData } from './hooks/useMarketData';
import { useCustomCompany } from './hooks/useCustomCompany';
import { Header } from './components/common/Header';
import { TimeWindowTabs } from './components/common/TimeWindowTabs';
import { LoadingState, ErrorBanner } from './components/common/FeedbackStates';
import { CurrentDayView } from './components/dashboard/CurrentDayView';
import { SevenDayView } from './components/dashboard/SevenDayView';
import { QuarterView } from './components/dashboard/QuarterView';
import { CustomCompanyPanel } from './components/dashboard/CustomCompanyPanel';
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

  const customCompany = useCustomCompany(activeWindow);

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

          {/* User-Selected Custom Company Exploration Panel */}
          <CustomCompanyPanel
            activeWindow={activeWindow}
            quote={customCompany.quote}
            historical={customCompany.historical}
            isLoading={customCompany.isLoading}
            error={customCompany.error}
            currentSymbol={customCompany.symbol}
            onSearch={customCompany.searchSymbol}
            onClear={customCompany.clear}
          />
        </main>
      )}
    </div>
  );
};

export default App;
