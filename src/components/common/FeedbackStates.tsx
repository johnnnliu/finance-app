import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorBannerProps {
  message: string;
  onRetry?: () => void;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({ message, onRetry }) => {
  return (
    <div className="error-banner" role="alert">
      <div className="error-content">
        <AlertCircle size={20} />
        <span>{message}</span>
      </div>
      {onRetry && (
        <button className="btn-retry" onClick={onRetry}>
          Try Again
        </button>
      )}
    </div>
  );
};

export const LoadingState: React.FC<{ message?: string }> = ({ message = 'Loading market analytics...' }) => {
  return (
    <div className="loading-container">
      <div className="spinner"></div>
      <p>{message}</p>
    </div>
  );
};
