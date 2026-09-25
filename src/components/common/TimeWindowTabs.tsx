import React from 'react';
import { TimeWindow } from '../../types/finance';

interface TimeWindowTabsProps {
  activeWindow: TimeWindow;
  onChange: (window: TimeWindow) => void;
}

const TABS: { id: TimeWindow; label: string }[] = [
  { id: '1D', label: 'Current Day' },
  { id: '7D', label: 'Last 7 Days' },
  { id: '1Q', label: 'Last Quarter' },
];

export const TimeWindowTabs: React.FC<TimeWindowTabsProps> = ({ activeWindow, onChange }) => {
  return (
    <div className="tabs-container" role="tablist" aria-label="Market Time Windows">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={activeWindow === tab.id}
          className={`tab-btn ${activeWindow === tab.id ? 'active' : ''}`}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};
