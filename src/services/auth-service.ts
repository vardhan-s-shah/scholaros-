import { apiClient } from './api-client';
import type { User, AuthTokens, AuthResponseData } from '../types/auth.types';
import { isWhitelistedEmail } from '../utils/whitelist';
import { useAuthStore } from '../store/auth-store';


// Configuration to toggle mock API (defaults to true if not explicitly set to 'false')
const USE_MOCK = import.meta.env.VITE_USE_MOCK_API !== 'false';

// Helper for simulating network latency
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Mock Database Keys
const MOCK_USERS_KEY = 'mock_users_db';
const MOCK_OTP_KEY_PREFIX = 'mock_otp_';

// Helpers to read/write mock DB
const getMockUsers = (): any[] => {
  try {
    return JSON.parse(localStorage.getItem(MOCK_USERS_KEY) || '[]');
  } catch {
    return [];
  }
};

const saveMockUsers = (users: any[]) => {
  localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users));
};

export const authService = {
  /**
   * Register a new student
   */
  register: async (data: any): Promise<{ message: string; email: string }> => {
    if (!isWhitelistedEmail(data.email)) {
      throw new Error('Email domain is not whitelisted. Please use your official college email.');
    }

    if (USE_MOCK) {
      await delay(1000);
      const users = getMockUsers();
      
      if (users.some((u) => u.email === data.email)) {
        throw new Error('An account with this email already exists.');
      }

      // Save user as unverified initially
      const newUser = {
        id: Math.random().toString(36).substr(2, 9),
        name: data.fullName,
        email: data.email,
        password: data.password, // In real app, encrypted on server
        role: 'student',
        verified: false,
        createdAt: new Date().toISOString(),
      };
      
      users.push(newUser);
      saveMockUsers(users);

      // Generate a mock OTP and store it
      const otp = '123456'; // Default mock OTP for testing
      localStorage.setItem(`${MOCK_OTP_KEY_PREFIX}${data.email}`, JSON.stringify({
        code: otp,
        expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes expiry
      }));

      console.log(`[Mock API] Registration successful. Verification OTP for ${data.email} is: ${otp}`);
      return {
        message: 'Registration successful. Please verify your email with the OTP sent.',
        email: data.email,
      };
    } else {
      const response = await apiClient.post('/auth/register', data);
      return response.data;
    }
  },

  /**
   * Verify OTP Code
   */
  verifyOtp: async (data: { email: string; code: string }): Promise<AuthResponseData> => {
    if (USE_MOCK) {
      await delay(1200);
      const otpData = localStorage.getItem(`${MOCK_OTP_KEY_PREFIX}${data.email}`);
      
      if (!otpData) {
        throw new Error('No active OTP request found for this email.');
      }

      const parsedOtp = JSON.parse(otpData);
      
      if (Date.now() > parsedOtp.expiresAt) {
        throw new Error('OTP has expired. Please request a new one.');
      }

      if (parsedOtp.code !== data.code) {
        throw new Error('Invalid OTP code. Please check and try again.');
      }

      // OTP is valid, activate the user
      const users = getMockUsers();
      const userIndex = users.findIndex((u) => u.email === data.email);
      
      if (userIndex === -1) {
        throw new Error('User account not found.');
      }

      users[userIndex].verified = true;
      saveMockUsers(users);

      // Clear the used OTP
      localStorage.removeItem(`${MOCK_OTP_KEY_PREFIX}${data.email}`);

      const userProfile: User = {
        id: users[userIndex].id,
        name: users[userIndex].name,
        email: users[userIndex].email,
        role: users[userIndex].role,
        createdAt: users[userIndex].createdAt,
        branch: users[userIndex].branch,
        division: users[userIndex].division,
        group: users[userIndex].group,
        batch: users[userIndex].batch,
        semester: users[userIndex].semester,
        profileCompleted: users[userIndex].profileCompleted,
      };

      const tokens: AuthTokens = {
        accessToken: 'mock_access_token_' + Math.random().toString(36).substr(2),
        refreshToken: 'mock_refresh_token_' + Math.random().toString(36).substr(2),
      };

      return {
        user: userProfile,
        tokens,
      };
    } else {
      const response = await apiClient.post('/auth/verify-otp', data);
      return response.data;
    }
  },

  /**
   * Resend OTP
   */
  resendOtp: async (email: string): Promise<{ message: string }> => {
    if (USE_MOCK) {
      await delay(800);
      const users = getMockUsers();
      if (!users.some((u) => u.email === email)) {
        throw new Error('No registration found for this email address.');
      }

      // Rate limiting simulation (optional check - can resend after delay)
      const otp = Math.floor(100000 + Math.random() * 900000).toString(); // dynamic random OTP
      localStorage.setItem(`${MOCK_OTP_KEY_PREFIX}${email}`, JSON.stringify({
        code: otp,
        expiresAt: Date.now() + 10 * 60 * 1000,
      }));

      console.log(`[Mock API] OTP Resent. New verification OTP for ${email} is: ${otp}`);
      return { message: 'A new 6-digit OTP code has been sent to your email.' };
    } else {
      const response = await apiClient.post('/auth/resend-otp', { email });
      return response.data;
    }
  },

  /**
   * Login
   */
  login: async (credentials: any): Promise<AuthResponseData> => {
    if (USE_MOCK) {
      await delay(1200);
      const users = getMockUsers();
      const user = users.find((u) => u.email === credentials.email);

      if (!user) {
        throw new Error('Invalid email or password.');
      }

      if (user.password !== credentials.password) {
        throw new Error('Invalid email or password.');
      }

      if (!user.verified) {
        // Trigger OTP generation and throw unverified error
        const otp = '123456';
        localStorage.setItem(`${MOCK_OTP_KEY_PREFIX}${user.email}`, JSON.stringify({
          code: otp,
          expiresAt: Date.now() + 10 * 60 * 1000,
        }));
        console.log(`[Mock API] User login attempted but unverified. Verification OTP is: ${otp}`);
        throw new Error('unverified_email');
      }

      const userProfile: User = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        branch: user.branch,
        division: user.division,
        group: user.group,
        batch: user.batch,
        semester: user.semester,
        profileCompleted: user.profileCompleted,
      };

      const tokens: AuthTokens = {
        accessToken: 'mock_access_token_' + Math.random().toString(36).substr(2),
        refreshToken: 'mock_refresh_token_' + Math.random().toString(36).substr(2),
      };

      return {
        user: userProfile,
        tokens,
      };
    } else {
      const response = await apiClient.post('/auth/login', credentials);
      return response.data;
    }
  },

  /**
   * Forgot Password request
   */
  forgotPassword: async (email: string): Promise<{ message: string }> => {
    if (USE_MOCK) {
      await delay(1000);
      const users = getMockUsers();
      if (!users.some((u) => u.email === email)) {
        throw new Error('No account found with this email address.');
      }

      const otp = '123456'; // Default forgot password OTP
      localStorage.setItem(`${MOCK_OTP_KEY_PREFIX}${email}`, JSON.stringify({
        code: otp,
        expiresAt: Date.now() + 10 * 60 * 1000,
      }));

      console.log(`[Mock API] Forgot Password initiated. OTP for ${email} is: ${otp}`);
      return { message: 'Password reset OTP has been sent to your email.' };
    } else {
      const response = await apiClient.post('/auth/forgot-password', { email });
      return response.data;
    }
  },

  /**
   * Reset Password
   */
  resetPassword: async (data: any): Promise<{ message: string }> => {
    if (USE_MOCK) {
      await delay(1200);
      const otpData = localStorage.getItem(`${MOCK_OTP_KEY_PREFIX}${data.email}`);
      
      if (!otpData) {
        throw new Error('No password reset process active for this email.');
      }

      const parsedOtp = JSON.parse(otpData);
      if (parsedOtp.code !== data.code) {
        throw new Error('Invalid OTP. Please check the code and try again.');
      }

      if (Date.now() > parsedOtp.expiresAt) {
        throw new Error('OTP code has expired. Please request a new one.');
      }

      const users = getMockUsers();
      const userIndex = users.findIndex((u) => u.email === data.email);
      
      if (userIndex === -1) {
        throw new Error('User not found.');
      }

      // Update password and ensure verified (just in case)
      users[userIndex].password = data.password;
      users[userIndex].verified = true;
      saveMockUsers(users);

      localStorage.removeItem(`${MOCK_OTP_KEY_PREFIX}${data.email}`);
      console.log(`[Mock API] Password reset successful for ${data.email}`);
      
      return { message: 'Your password has been successfully reset. You can now login.' };
    } else {
      const response = await apiClient.post('/auth/reset-password', data);
      return response.data;
    }
  },

  /**
   * Logout
   */
  logout: async (): Promise<void> => {
    if (USE_MOCK) {
      await delay(500);
      console.log('[Mock API] Logout successful');
      return;
    } else {
      await apiClient.post('/auth/logout');
    }
  },

  /**
   * Update profile details
   */
  updateProfile: async (profileData: { name: string; branch: string; division: string; group: string; batch: string; semester: string }): Promise<{ message: string; user: User }> => {
    if (USE_MOCK) {
      await delay(800);
      const currentUser = useAuthStore.getState().user;
      if (!currentUser) throw new Error('Not authenticated.');

      const users = getMockUsers();
      const index = users.findIndex(u => u.id === currentUser.id);
      if (index === -1) throw new Error('User not found in mock database.');

      const updatedUser = {
        ...users[index],
        name: profileData.name,
        branch: profileData.branch,
        division: profileData.division,
        group: profileData.group,
        batch: profileData.batch,
        semester: profileData.semester,
        profileCompleted: true,
      };

      users[index] = updatedUser;
      saveMockUsers(users);

      const userProfile: User = {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        createdAt: updatedUser.createdAt,
        branch: updatedUser.branch,
        division: updatedUser.division,
        group: updatedUser.group,
        batch: updatedUser.batch,
        semester: updatedUser.semester,
        profileCompleted: updatedUser.profileCompleted,
      };

      return {
        message: 'Profile updated successfully.',
        user: userProfile
      };
    } else {
      const response = await apiClient.put('/auth/profile', profileData);
      return response.data;
    }
  }
};
