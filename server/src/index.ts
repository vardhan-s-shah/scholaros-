import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { AuthController } from './controllers/auth.controller.js';
import { UpdateController } from './controllers/update.controller.js';
import { EmailService } from './services/email.service.js';
import { authMiddleware } from './middleware/auth.middleware.js';
import { adminMiddleware } from './middleware/admin.middleware.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Configure CORS
app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true, // Crucial for reading/setting HTTP-only cookies across domains
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// Middleware
app.use(express.json());
app.use(cookieParser());

// Logging middleware for development
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Authentication Routes
app.post('/api/auth/register', AuthController.register);
app.post('/api/auth/verify-otp', AuthController.verifyOtp);
app.post('/api/auth/resend-otp', AuthController.resendOtp);
app.post('/api/auth/login', AuthController.login);
app.post('/api/auth/forgot-password', AuthController.forgotPassword);
app.post('/api/auth/reset-password', AuthController.resetPassword);
app.post('/api/auth/refresh', AuthController.refresh);
app.post('/api/auth/logout', AuthController.logout);

// Protected Profile & Marks Routes
app.put('/api/auth/profile', authMiddleware, AuthController.updateProfile);
app.get('/api/marks', authMiddleware, AuthController.getMarks);
app.post('/api/marks', authMiddleware, AuthController.addMark);
app.put('/api/marks/:id', authMiddleware, AuthController.updateMark);
app.delete('/api/marks/:id', authMiddleware, AuthController.deleteMark);

// Leaderboard Route
app.get('/api/leaderboard', authMiddleware, AuthController.getLeaderboard);

// Updates / Announcements Routes
app.get('/api/updates', authMiddleware, UpdateController.getUpdates);
app.post('/api/updates', authMiddleware, adminMiddleware, UpdateController.createUpdate);
app.put('/api/updates/:id', authMiddleware, adminMiddleware, UpdateController.updateUpdate);
app.delete('/api/updates/:id', authMiddleware, adminMiddleware, UpdateController.deleteUpdate);

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', service: 'ScholarOS Auth Server' });
});

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({ message: 'An unexpected server error occurred.' });
});

// Start Server and verify SMTP connection
app.listen(PORT, async () => {
  console.log(`===================================================`);
  console.log(`ScholarOS Auth Server running on port ${PORT}`);
  console.log(`Allowed Frontend URL: ${FRONTEND_URL}`);
  console.log(`===================================================`);

  // Verify SMTP Gmail Connection
  console.log('[EmailService] Verifying Gmail SMTP configuration...');
  const isSmtpConnected = await EmailService.verifyConnection();
  if (isSmtpConnected) {
    console.log('[EmailService] SMTP Status: Connected & Ready to send emails.');
  } else {
    console.warn(
      '[EmailService] SMTP Status: Connection failed! OTP emails will NOT send until EMAIL_USER and EMAIL_PASS are set correctly in .env.'
    );
  }
});
