import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { PublicLayout } from '../layouts/PublicLayout';
import { AuthLayout } from '../layouts/AuthLayout';
import { AppLayout } from '../layouts/AppLayout';
import { LandingPage } from '../pages/LandingPage';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { OtpPage } from '../pages/OtpPage';
import { ForgotPasswordPage } from '../pages/ForgotPasswordPage';
import { DashboardPage } from '../pages/DashboardPage';
import { SetProfilePage } from '../pages/SetProfilePage';
import { FeedMarksPage } from '../pages/FeedMarksPage';
import { MarksCalculatorPage } from '../pages/MarksCalculatorPage';
import { SettingsPage } from '../pages/SettingsPage';
import { LeaderboardPage } from '../pages/LeaderboardPage';
import { ProtectedRoute } from './ProtectedRoute';
import { PublicRoute } from './PublicRoute';
import { AdminRoute } from './AdminRoute';
import { AdminUpdatesPage } from '../pages/AdminUpdatesPage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes (Accessible by anyone) */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
      </Route>

      {/* Guest/Auth Routes (Only accessible when NOT logged in) */}
      <Route element={<AuthLayout />}>
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          }
        />
        <Route
          path="/verify-otp"
          element={
            <PublicRoute>
              <OtpPage />
            </PublicRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <PublicRoute>
              <ForgotPasswordPage />
            </PublicRoute>
          }
        />
      </Route>

      {/* Protected Setup Route (Standalone) */}
      <Route
        path="/set-profile"
        element={
          <ProtectedRoute>
            <SetProfilePage />
          </ProtectedRoute>
        }
      />

      {/* Protected App Routes (Inside AppLayout) */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route
          path="/admin/updates"
          element={
            <AdminRoute>
              <AdminUpdatesPage />
            </AdminRoute>
          }
        />
        <Route path="/feed-marks" element={<FeedMarksPage />} />
        <Route path="/marks-calculator" element={<MarksCalculatorPage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      {/* Catch-all Redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
