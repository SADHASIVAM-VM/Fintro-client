import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { HelmetProvider } from 'react-helmet-async';
import { SnackbarProvider } from 'notistack';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from 'react-error-boundary';
import { Toaster } from 'sonner';
import { store } from '@/app/store';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/Button';
import { useAppDispatch } from '@/hooks/redux';
import { logout, setCredentials } from '@/features/auth/authSlice';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

// Global error fallback component
const GlobalErrorFallback = ({ error, resetErrorBoundary }: { error: any; resetErrorBoundary: () => void }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center bg-background text-foreground">
      <div className="max-w-md w-full p-8 border rounded-xl shadow-lg bg-card">
        <h2 className="text-2xl font-bold text-destructive mb-2 font-sans">Something went wrong</h2>
        <p className="text-muted-foreground text-sm mb-6 font-sans">
          An unexpected error occurred in the application. Please try reloading the page.
        </p>
        <pre className="p-4 bg-muted text-left text-xs overflow-auto rounded-lg mb-6 max-h-40 font-mono text-muted-foreground border">
          {error.message || 'No stack trace details.'}
        </pre>
        <div className="flex justify-center gap-4">
          <Button onClick={resetErrorBoundary} variant="primary">
            Try Again
          </Button>
          <Button onClick={() => window.location.reload()} variant="outline">
            Reload Page
          </Button>
        </div>
      </div>
    </div>
  );
};

// Sync component to handle Axios-level Auth events (token refresh, auto-logout)
const AuthEventsSync: React.FC = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const handleLogout = () => {
      dispatch(logout());
    };

    const handleRefresh = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        dispatch(setCredentials(customEvent.detail));
      }
    };

    window.addEventListener('auth-logout', handleLogout);
    window.addEventListener('auth-refresh-success', handleRefresh);

    return () => {
      window.removeEventListener('auth-logout', handleLogout);
      window.removeEventListener('auth-refresh-success', handleRefresh);
    };
  }, [dispatch]);

  return null;
};

export const Providers: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ErrorBoundary FallbackComponent={GlobalErrorFallback} onReset={() => window.location.replace('/')}>
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <AuthEventsSync />
          <ThemeProvider>
            <HelmetProvider>
              <SnackbarProvider maxSnack={3} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
                {children}
                <Toaster richColors closeButton position="top-right" />
              </SnackbarProvider>
            </HelmetProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </Provider>
    </ErrorBoundary>
  );
};
