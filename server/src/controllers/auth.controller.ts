import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserModel, UserSchema } from '../models/user.model.js';
import { EmailService } from '../services/email.service.js';

const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

const getPdeuTotal = (mid: number, ia: number, endSem?: number): number | null => {
  if (endSem === undefined) return null;
  return endSem / 2 + mid + ia;
};

const getGradePoints = (total: number, endSem?: number): number => {
  if (endSem !== undefined && endSem <= 35) return 0;
  if (total >= 80) return 10;
  if (total >= 70) return 9;
  if (total >= 60) return 8;
  if (total >= 55) return 7;
  if (total >= 50) return 6;
  if (total >= 45) return 5;
  if (total >= 40) return 4;
  return 0;
};

// Helper to generate access & refresh tokens
const generateTokens = (user: UserSchema) => {
  const accessToken = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_ACCESS_SECRET || 'scholaros_access_secret_key_12345',
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );

  const refreshToken = jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET || 'scholaros_refresh_secret_key_12345',
    { expiresIn: REFRESH_TOKEN_EXPIRY }
  );

  return { accessToken, refreshToken };
};

// Helper to set refresh token cookie
const setRefreshTokenCookie = (res: Response, token: string) => {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: false, // Set to true in production with HTTPS
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

export const AuthController = {
  /**
   * Register a new user
   */
  register: async (req: Request, res: Response): Promise<void> => {
    try {
      const { fullName, email, password } = req.body;

      if (!fullName || !email || !password) {
        res.status(400).json({ message: 'All fields are required.' });
        return;
      }

      // Check if user already exists
      const existingUser = await UserModel.findByEmail(email);
      if (existingUser) {
        res.status(400).json({ message: 'An account with this email already exists.' });
        return;
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Generate 6-digit OTP
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes expiry

      // Save user as unverified
      const newUser = await UserModel.create({
        name: fullName,
        email,
        password: hashedPassword,
        role: 'student',
        verified: false,
        otp: {
          code: otpCode,
          expiresAt: otpExpires,
        },
      });

      // Send verification email
      try {
        await EmailService.sendOtpEmail(email, otpCode);
      } catch (emailError) {
        console.error('Failed to send verification email:', emailError);
        // Continue, but warn in log
      }

      console.log(`[Backend] User registered. Email: ${email}, Verification OTP: ${otpCode}`);

      res.status(201).json({
        message: 'Registration successful. Please verify your email with the OTP sent.',
        email,
      });
    } catch (error: any) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Internal server error during registration.' });
    }
  },

  /**
   * Verify OTP Code
   */
  verifyOtp: async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, code } = req.body;

      if (!email || !code) {
        res.status(400).json({ message: 'Email and OTP code are required.' });
        return;
      }

      const user = await UserModel.findByEmail(email);
      if (!user) {
        res.status(404).json({ message: 'User account not found.' });
        return;
      }

      if (!user.otp) {
        res.status(400).json({ message: 'No active OTP request found for this email.' });
        return;
      }

      if (Date.now() > user.otp.expiresAt) {
        res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
        return;
      }

      if (user.otp.code !== code) {
        res.status(400).json({ message: 'Invalid OTP code. Please check and try again.' });
        return;
      }

      // Mark user as verified and clear OTP
      const updatedUser = await UserModel.update(user.id, {
        verified: true,
        otp: undefined,
      });

      if (!updatedUser) {
        res.status(500).json({ message: 'Failed to update user status.' });
        return;
      }

      // Generate tokens
      const { accessToken, refreshToken } = generateTokens(updatedUser);
      setRefreshTokenCookie(res, refreshToken);

      res.status(200).json({
        user: {
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
          profileCompleted: updatedUser.profileCompleted || false,
        },
        tokens: {
          accessToken,
          refreshToken, // Fallback for clients not using cookies
        },
      });
    } catch (error) {
      console.error('OTP verification error:', error);
      res.status(500).json({ message: 'Internal server error during verification.' });
    }
  },

  /**
   * Resend OTP
   */
  resendOtp: async (req: Request, res: Response): Promise<void> => {
    try {
      const { email } = req.body;

      if (!email) {
        res.status(400).json({ message: 'Email address is required.' });
        return;
      }

      const user = await UserModel.findByEmail(email);
      if (!user) {
        res.status(404).json({ message: 'No registration found for this email address.' });
        return;
      }

      // Generate new OTP
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpires = Date.now() + 10 * 60 * 1000;

      // Update user OTP
      await UserModel.update(user.id, {
        otp: {
          code: otpCode,
          expiresAt: otpExpires,
        },
      });

      // Send email
      await EmailService.sendOtpEmail(email, otpCode);

      console.log(`[Backend] Resent OTP to: ${email}, Code: ${otpCode}`);

      res.status(200).json({
        message: 'A new 6-digit OTP code has been sent to your email.',
      });
    } catch (error) {
      console.error('Resend OTP error:', error);
      res.status(500).json({ message: 'Failed to resend verification code.' });
    }
  },

  /**
   * Login
   */
  login: async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ message: 'Email and password are required.' });
        return;
      }

      const user = await UserModel.findByEmail(email);
      if (!user || !user.password) {
        res.status(400).json({ message: 'Invalid email or password.' });
        return;
      }

      // Compare passwords
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        res.status(400).json({ message: 'Invalid email or password.' });
        return;
      }

      // Check if verified
      if (!user.verified) {
        // Trigger a new OTP and send it
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = Date.now() + 10 * 60 * 1000;

        await UserModel.update(user.id, {
          otp: {
            code: otpCode,
            expiresAt: otpExpires,
          },
        });

        try {
          await EmailService.sendOtpEmail(user.email, otpCode);
        } catch (emailError) {
          console.error('Failed to send verification email on login:', emailError);
        }

        console.log(`[Backend] Login attempted but unverified. Verification OTP sent to ${user.email}: ${otpCode}`);

        // Return a specific message that the frontend catches
        res.status(400).json({ message: 'unverified_email' });
        return;
      }

      // Generate tokens
      const { accessToken, refreshToken } = generateTokens(user);
      setRefreshTokenCookie(res, refreshToken);

      res.status(200).json({
        user: {
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
          profileCompleted: user.profileCompleted || false,
        },
        tokens: {
          accessToken,
          refreshToken,
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Internal server error during login.' });
    }
  },

  /**
   * Forgot Password request
   */
  forgotPassword: async (req: Request, res: Response): Promise<void> => {
    try {
      const { email } = req.body;

      if (!email) {
        res.status(400).json({ message: 'Email address is required.' });
        return;
      }

      const user = await UserModel.findByEmail(email);
      if (!user) {
        res.status(404).json({ message: 'No account found with this email address.' });
        return;
      }

      // Generate OTP
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpires = Date.now() + 10 * 60 * 1000;

      // Update user OTP
      await UserModel.update(user.id, {
        otp: {
          code: otpCode,
          expiresAt: otpExpires,
        },
      });

      // Send email
      await EmailService.sendPasswordResetEmail(email, otpCode);

      console.log(`[Backend] Forgot Password OTP sent to ${email}: ${otpCode}`);

      res.status(200).json({
        message: 'Password reset OTP has been sent to your email.',
      });
    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json({ message: 'Failed to send password reset code.' });
    }
  },

  /**
   * Reset Password
   */
  resetPassword: async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, code, password } = req.body;

      if (!email || !code || !password) {
        res.status(400).json({ message: 'All fields (email, code, password) are required.' });
        return;
      }

      const user = await UserModel.findByEmail(email);
      if (!user) {
        res.status(404).json({ message: 'User not found.' });
        return;
      }

      if (!user.otp) {
        res.status(400).json({ message: 'No password reset process active for this email.' });
        return;
      }

      if (user.otp.code !== code) {
        res.status(400).json({ message: 'Invalid OTP. Please check the code and try again.' });
        return;
      }

      if (Date.now() > user.otp.expiresAt) {
        res.status(400).json({ message: 'OTP code has expired. Please request a new one.' });
        return;
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Update password, mark as verified, clear OTP
      await UserModel.update(user.id, {
        password: hashedPassword,
        verified: true,
        otp: undefined,
      });

      console.log(`[Backend] Password successfully reset for user: ${email}`);

      res.status(200).json({
        message: 'Your password has been successfully reset. You can now login.',
      });
    } catch (error) {
      console.error('Reset password error:', error);
      res.status(500).json({ message: 'Internal server error during password reset.' });
    }
  },

  /**
   * Refresh token
   */
  refresh: async (req: Request, res: Response): Promise<void> => {
    try {
      const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

      if (!refreshToken) {
        res.status(401).json({ message: 'Access denied. Refresh token missing.' });
        return;
      }

      // Verify token
      let decoded: any;
      try {
        decoded = jwt.verify(
          refreshToken,
          process.env.JWT_REFRESH_SECRET || 'scholaros_refresh_secret_key_12345'
        );
      } catch (jwtError) {
        res.status(401).json({ message: 'Invalid or expired refresh token.' });
        return;
      }

      const user = await UserModel.findById(decoded.id);
      if (!user) {
        res.status(401).json({ message: 'User account not found.' });
        return;
      }

      // Generate new tokens
      const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);
      setRefreshTokenCookie(res, newRefreshToken);

      // Response format MUST match the frontend's apiClient.interceptors.response expectations:
      // response.data must resolve to { data: { accessToken } }
      res.status(200).json({
        data: {
          accessToken,
        },
      });
    } catch (error) {
      console.error('Refresh token error:', error);
      res.status(500).json({ message: 'Internal server error during token refresh.' });
    }
  },

  /**
   * Logout
   */
  logout: async (req: Request, res: Response): Promise<void> => {
    try {
      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: false, // Match configuration of cookie setting
        sameSite: 'lax',
      });
      res.status(200).json({ message: 'Logout successful.' });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ message: 'Internal server error during logout.' });
    }
  },

  /**
   * Update student profile details
   */
  updateProfile: async (req: any, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: 'Unauthorized.' });
        return;
      }

      const { name, branch, division, group, batch, semester } = req.body;
      if (!name || !branch || !division || !group || !batch || !semester) {
        res.status(400).json({ message: 'All profile fields are required.' });
        return;
      }

      const updatedUser = await UserModel.update(userId, {
        name,
        branch,
        division,
        group,
        batch,
        semester: String(semester),
        profileCompleted: true
      });

      if (!updatedUser) {
        res.status(404).json({ message: 'User not found.' });
        return;
      }

      res.status(200).json({
        message: 'Profile updated successfully.',
        user: {
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
        }
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ message: 'Failed to update profile.' });
    }
  },

  /**
   * Get all marks for the user
   */
  getMarks: async (req: any, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: 'Unauthorized.' });
        return;
      }

      const user = await UserModel.findById(userId);
      if (!user) {
        res.status(404).json({ message: 'User not found.' });
        return;
      }

      res.status(200).json({
        marks: user.marks || []
      });
    } catch (error) {
      console.error('Get marks error:', error);
      res.status(500).json({ message: 'Failed to fetch marks.' });
    }
  },

  /**
   * Add a mark entry
   */
  addMark: async (req: any, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: 'Unauthorized.' });
        return;
      }

      const { subjectCode, subjectName, semester, credits, midSemMarks, midSemMax, endSemMarks, endSemMax, internalMarks, internalMax } = req.body;

      if (!subjectCode || !subjectName || !semester || credits === undefined || midSemMarks === undefined || midSemMax === undefined || internalMarks === undefined || internalMax === undefined) {
        res.status(400).json({ message: 'Required mark details are missing.' });
        return;
      }

      const user = await UserModel.findById(userId);
      if (!user) {
        res.status(404).json({ message: 'User not found.' });
        return;
      }

      const newMark = {
        id: Math.random().toString(36).substring(2, 11),
        subjectCode,
        subjectName,
        semester: String(semester),
        credits: Number(credits),
        midSemMarks: Number(midSemMarks),
        midSemMax: Number(midSemMax),
        endSemMarks: endSemMarks !== undefined && endSemMarks !== null && endSemMarks !== '' ? Number(endSemMarks) : undefined,
        endSemMax: endSemMax !== undefined && endSemMax !== null && endSemMax !== '' ? Number(endSemMax) : 60,
        internalMarks: Number(internalMarks),
        internalMax: Number(internalMax),
      };

      const currentMarks = user.marks || [];
      currentMarks.push(newMark);

      await UserModel.update(userId, { marks: currentMarks });

      res.status(201).json({
        message: 'Mark entry added successfully.',
        mark: newMark
      });
    } catch (error) {
      console.error('Add mark error:', error);
      res.status(500).json({ message: 'Failed to add mark entry.' });
    }
  },

  /**
   * Update an existing mark entry
   */
  updateMark: async (req: any, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      const { id } = req.params;

      if (!userId) {
        res.status(401).json({ message: 'Unauthorized.' });
        return;
      }

      const { subjectCode, subjectName, semester, credits, midSemMarks, midSemMax, endSemMarks, endSemMax, internalMarks, internalMax } = req.body;

      const user = await UserModel.findById(userId);
      if (!user || !user.marks) {
        res.status(404).json({ message: 'Mark entry not found.' });
        return;
      }

      const index = user.marks.findIndex((m: import('../models/user.model.js').MarkEntry) => m.id === id);
      if (index === -1) {
        res.status(404).json({ message: 'Mark entry not found.' });
        return;
      }

      const updatedMark = {
        ...user.marks[index],
        subjectCode: subjectCode ?? user.marks[index].subjectCode,
        subjectName: subjectName ?? user.marks[index].subjectName,
        semester: semester ? String(semester) : user.marks[index].semester,
        credits: credits !== undefined ? Number(credits) : user.marks[index].credits,
        midSemMarks: midSemMarks !== undefined ? Number(midSemMarks) : user.marks[index].midSemMarks,
        midSemMax: midSemMax !== undefined ? Number(midSemMax) : user.marks[index].midSemMax,
        endSemMarks: endSemMarks !== undefined ? (endSemMarks !== null && endSemMarks !== '' ? Number(endSemMarks) : undefined) : user.marks[index].endSemMarks,
        endSemMax: endSemMax !== undefined ? Number(endSemMax) : user.marks[index].endSemMax,
        internalMarks: internalMarks !== undefined ? Number(internalMarks) : user.marks[index].internalMarks,
        internalMax: internalMax !== undefined ? Number(internalMax) : user.marks[index].internalMax,
      };

      user.marks[index] = updatedMark;

      await UserModel.update(userId, { marks: user.marks });

      res.status(200).json({
        message: 'Mark entry updated successfully.',
        mark: updatedMark
      });
    } catch (error) {
      console.error('Update mark error:', error);
      res.status(500).json({ message: 'Failed to update mark entry.' });
    }
  },

  /**
   * Delete a mark entry
   */
  deleteMark: async (req: any, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      const { id } = req.params;

      if (!userId) {
        res.status(401).json({ message: 'Unauthorized.' });
        return;
      }

      const user = await UserModel.findById(userId);
      if (!user || !user.marks) {
        res.status(404).json({ message: 'Mark entry not found.' });
        return;
      }

      const filteredMarks = user.marks.filter((m: import('../models/user.model.js').MarkEntry) => m.id !== id);
      if (filteredMarks.length === user.marks.length) {
        res.status(404).json({ message: 'Mark entry not found.' });
        return;
      }

      await UserModel.update(userId, { marks: filteredMarks });

      res.status(200).json({
        message: 'Mark entry deleted successfully.'
      });
    } catch (error) {
      console.error('Delete mark error:', error);
      res.status(500).json({ message: 'Failed to delete mark entry.' });
    }
  },

  /**
   * Get leaderboard rankings
   */
  getLeaderboard: async (req: Request, res: Response): Promise<void> => {
    try {
      const { branch, semester } = req.query;
      
      const allUsers = await UserModel.findAll();
      
      let filteredUsers = allUsers.filter(u => u.role === 'student' && u.verified && u.branch);
      
      if (branch) {
        filteredUsers = filteredUsers.filter(u => u.branch === branch);
      }
      if (semester) {
        filteredUsers = filteredUsers.filter(u => u.semester === semester);
      }
      
      const leaderboard = filteredUsers.map(u => {
        let cgpaTotalCredits = 0;
        let cgpaTotalPoints = 0;
        let sgpaTotalCredits = 0;
        let sgpaTotalPoints = 0;
        
        const targetSem = semester ? String(semester) : u.semester;

        (u.marks || []).forEach((m: import('../models/user.model.js').MarkEntry) => {
          const total = getPdeuTotal(m.midSemMarks, m.internalMarks, m.endSemMarks);
          if (total !== null) {
            const gp = getGradePoints(total, m.endSemMarks);
            cgpaTotalCredits += m.credits;
            cgpaTotalPoints += gp * m.credits;
            
            if (m.semester === targetSem) {
              sgpaTotalCredits += m.credits;
              sgpaTotalPoints += gp * m.credits;
            }
          }
        });
        
        const cgpa = cgpaTotalCredits > 0 ? (cgpaTotalPoints / cgpaTotalCredits) : 0;
        const sgpa = sgpaTotalCredits > 0 ? (sgpaTotalPoints / sgpaTotalCredits) : 0;
        
        return {
          id: u.id,
          name: u.name,
          branch: u.branch,
          semester: u.semester,
          cgpa: Math.round(cgpa * 100) / 100,
          sgpa: Math.round(sgpa * 100) / 100,
        };
      });
      
      // Sort by CGPA descending, then SGPA descending
      leaderboard.sort((a, b) => {
        if (b.cgpa !== a.cgpa) return b.cgpa - a.cgpa;
        return b.sgpa - a.sgpa;
      });
      
      res.status(200).json({ leaderboard });
    } catch (error) {
      console.error('Get leaderboard error:', error);
      res.status(500).json({ message: 'Failed to fetch leaderboard.' });
    }
  }
};
