import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/auth-store';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to login page but save the current location they tried to visit
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const isProfileComplete = user?.profileCompleted;

  if (!isProfileComplete && location.pathname !== '/set-profile') {
    return <Navigate to="/set-profile" replace />;
  }

  if (isProfileComplete && location.pathname === '/set-profile') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
