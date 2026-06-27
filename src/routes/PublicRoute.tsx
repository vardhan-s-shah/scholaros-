import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth-store';

interface PublicRouteProps {
  children: React.ReactNode;
}

export const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();

  if (isAuthenticated) {
    // Redirect authenticated users to the dashboard
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
