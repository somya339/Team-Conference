import React, { Suspense, useEffect } from 'react';
import type { AuthState } from './lib/auth/AuthService';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SnackbarProvider } from 'notistack';
import { authService } from './lib/auth/AuthService';
import { config } from './lib/config';

// Lazy load components for better performance
const SignIn = React.lazy(() => import('./pages/SignIn'));
const SignUp = React.lazy(() => import('./pages/SignUp'));
const Dashboard = React.lazy(() => import('./pages/Dashboard/Dashboard').then(module => ({ default: module.Dashboard })));
const Meeting = React.lazy(() => import('./pages/Meeting/Meeting'));
const MeetingHistory = React.lazy(() => import('./pages/MeetingHistory/MeetingHistory').then(m => ({ default: m.MeetingHistory })));

// Loading component
const LoadingSpinner: React.FC = () => (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
    <div className="text-center space-y-6">
      <div className="relative">
        <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
        <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-t-blue-400 rounded-full animate-spin mx-auto" style={{ animationDelay: '-0.5s' }}></div>
      </div>
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Loading {config.appName}</h3>
        <p className="text-gray-600">Please wait while we prepare your experience...</p>
      </div>
    </div>
  </div>
);

// Error boundary component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error; componentStack?: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any) {
    const normalized = error instanceof Error ? error : new Error(typeof error === 'string' ? error : JSON.stringify(error));
    return { hasError: true, error: normalized };
  }

  componentDidCatch(error: any, errorInfo: React.ErrorInfo) {
    const normalized = error instanceof Error ? error : new Error(typeof error === 'string' ? error : JSON.stringify(error));
    console.error('Error caught by boundary:', normalized, errorInfo);
    this.setState({ error: normalized, componentStack: errorInfo.componentStack });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-8">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">Something went wrong</h1>
            <p className="text-gray-600 mb-4 leading-relaxed">
              {this.state.error?.message || "We're sorry, but something unexpected happened."}
            </p>
            {this.state.componentStack && (
              <pre className="text-left text-xs bg-gray-100 p-3 rounded-lg overflow-auto max-h-48 text-gray-700 mb-4">
                {this.state.componentStack}
              </pre>
            )}
            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors duration-200 font-medium"
              >
                Refresh Page
              </button>
              <button
                onClick={() => window.location.href = '/dashboard'}
                className="w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-200 transition-colors duration-200 font-medium"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook to read auth state safely
function useAuthSnapshot(): AuthState {
  const [state, setState] = React.useState<AuthState>(authService.getSnapshot());
  useEffect(() => {
    return authService.subscribe(() => {
      const next = authService.getSnapshot();
      setState((prev) =>
        prev.isLoading === next.isLoading && prev.isAuthenticated === next.isAuthenticated
          ? prev
          : next
      );
    });
  }, []);
  return state;
}

// Protected route component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  console.log('🔒 ProtectedRoute rendering');
  try {
    const authState = useAuthSnapshot();

    console.log('🔒 ProtectedRoute current state:', authState);

    if (authState.isLoading || (authState as any).isAuthenticated === null) {
      console.log('🔒 ProtectedRoute showing loading spinner');
      return <LoadingSpinner />;
    }

    if (!authState.isAuthenticated) {
      console.log('🔒 ProtectedRoute redirecting to signin');
      return <Navigate to="/signin" replace />;
    }

    console.log('🔒 ProtectedRoute rendering children');
    return <>{children}</>;
  } catch (err) {
    console.error('🚨 ProtectedRoute crashed:', err);
    return <Navigate to="/signin" replace />;
  }
};

// Public route component (redirects if already authenticated)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const authState = useAuthSnapshot();

  if (authState.isLoading || authState.isAuthenticated === null) {
    return <LoadingSpinner />;
  }

  if (authState.isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  useEffect(() => {
    // Start token refresh mechanism
    authService.startTokenRefresh();

    // Add service worker for PWA capabilities
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    }

    // Set up error handling for unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason);
    };

    // Capture window errors (including errors thrown from React rendering)
    const handleWindowError = (event: ErrorEvent) => {
      console.error('Window error:', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error,
      });
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleWindowError);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleWindowError);
    };
  }, []);

  return (
    <ErrorBoundary>
      <SnackbarProvider
        maxSnack={3}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        autoHideDuration={4000}
      >
        <Router>
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              {/* Public routes */}
              <Route
                path="/signin"
                element={
                  <PublicRoute>
                    <SignIn />
                  </PublicRoute>
                }
              />
              <Route
                path="/signup"
                element={
                  <PublicRoute>
                    <SignUp />
                  </PublicRoute>
                }
              />

              {/* Protected routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/meeting/:meetingId"
                element={
                  <ProtectedRoute>
                    <Meeting />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/meeting-history"
                element={
                  <ProtectedRoute>
                    <MeetingHistory />
                  </ProtectedRoute>
                }
              />

              {/* Default redirects */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Suspense>
        </Router>
      </SnackbarProvider>
    </ErrorBoundary>
  );
};

export default App;
