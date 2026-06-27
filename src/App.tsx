import React, { useEffect } from 'react';
import { BrowserRouter, useNavigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './app/theme-provider';
import { AppRoutes } from './routes';
import { useAuthStore } from './store/auth-store';

// Initialize TanStack Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Session expiry handler component that needs routing context
const SessionExpiryListener: React.FC = () => {
  const navigate = useNavigate();
  const { clearAuth } = useAuthStore();

  useEffect(() => {
    const handleSessionExpired = () => {
      clearAuth();
      // Navigate to login with expired state
      navigate('/login', {
        state: {
          message: 'Your session has expired. Please log in again to continue.',
        },
        replace: true,
      });
    };

    window.addEventListener('auth:session-expired', handleSessionExpired);
    return () => {
      window.removeEventListener('auth:session-expired', handleSessionExpired);
    };
  }, [navigate, clearAuth]);

  return null;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="scholaros-theme">
        <BrowserRouter>
          <SessionExpiryListener />
          <AppRoutes />
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
