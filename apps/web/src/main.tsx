import React from 'react';
import ReactDOM from 'react-dom/client';
import '@fontsource-variable/inter';
import './index.css';
import App from './App';

// Error handling for React rendering
const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
  console.error('React rendering error:', error, errorInfo);
  
  // You could send this to an error reporting service
  // reportError(error, errorInfo);
};

// Global error handler
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

// Performance monitoring
if (process.env.NODE_ENV === 'production') {
  // Add performance monitoring here
  console.log('Production mode enabled');
}

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

// Strict mode for development
const AppWrapper = () => {
  if (process.env.NODE_ENV === 'development') {
    return (
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  }
  return <App />;
};

root.render(<AppWrapper />);
