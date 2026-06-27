import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // 16-character Gmail App Password
  },
});

// Helper to wrap OTP emails in a beautiful responsive HTML container
const getHtmlTemplate = (title: string, message: string, code: string, actionText: string) => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background-color: #0f172a;
            color: #f1f5f9;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 580px;
            margin: 30px auto;
            background-color: #1e293b;
            border-radius: 12px;
            border: 1px solid rgba(255, 255, 255, 0.08);
            overflow: hidden;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
          }
          .header {
            background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);
            padding: 30px 20px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            color: #ffffff;
            font-size: 24px;
            font-weight: 700;
            letter-spacing: -0.025em;
          }
          .content {
            padding: 40px 30px;
            text-align: center;
          }
          .content p {
            font-size: 15px;
            line-height: 1.6;
            color: #94a3b8;
            margin-top: 0;
            margin-bottom: 24px;
          }
          .code-box {
            display: inline-block;
            background-color: #0f172a;
            border: 1px solid rgba(99, 102, 241, 0.2);
            color: #6366f1;
            font-size: 32px;
            font-weight: 700;
            letter-spacing: 0.15em;
            padding: 14px 28px;
            border-radius: 8px;
            margin-bottom: 24px;
            text-align: center;
          }
          .footer {
            background-color: #0f172a;
            padding: 20px;
            text-align: center;
            border-top: 1px solid rgba(255, 255, 255, 0.04);
          }
          .footer p {
            font-size: 12px;
            color: #64748b;
            margin: 0;
          }
          .footer a {
            color: #6366f1;
            text-decoration: none;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>ScholarOS</h1>
          </div>
          <div class="content">
            <p>${message}</p>
            <div class="code-box">${code}</div>
            <p style="font-size: 13px; color: #64748b; margin-top: 8px;">
              This verification code expires in 10 minutes. If you did not request this code, you can safely ignore this email.
            </p>
          </div>
          <div class="footer">
            <p>Empowering Academic Analytics & Performance</p>
            <p style="margin-top: 6px;">&copy; 2026 ScholarOS. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
};

export const EmailService = {
  /**
   * Verify SMTP credentials connection status
   */
  verifyConnection: async (): Promise<boolean> => {
    try {
      await transporter.verify();
      console.log('[EmailService] Gmail SMTP Connection verified successfully!');
      return true;
    } catch (error) {
      console.error('[EmailService] Gmail SMTP Connection Error:', error);
      return false;
    }
  },

  /**
   * Send Email OTP Code for registration
   */
  sendOtpEmail: async (to: string, code: string): Promise<void> => {
    const title = 'Verify your ScholarOS Account';
    const message = 'Thank you for registering with ScholarOS. Please use the following 6-digit OTP code to verify your college email and activate your account:';
    
    const mailOptions = {
      from: `"ScholarOS" <${process.env.EMAIL_USER}>`,
      to,
      subject: 'ScholarOS - Email Verification OTP',
      html: getHtmlTemplate(title, message, code, 'Verify Email'),
    };

    await transporter.sendMail(mailOptions);
    console.log(`[EmailService] Verification OTP email successfully sent to ${to}`);
  },

  /**
   * Send Password Reset OTP Code
   */
  sendPasswordResetEmail: async (to: string, code: string): Promise<void> => {
    const title = 'Reset your ScholarOS Password';
    const message = 'We received a request to reset your password. Use the following 6-digit verification code to proceed with the password reset process:';
    
    const mailOptions = {
      from: `"ScholarOS" <${process.env.EMAIL_USER}>`,
      to,
      subject: 'ScholarOS - Password Reset Verification OTP',
      html: getHtmlTemplate(title, message, code, 'Reset Password'),
    };

    await transporter.sendMail(mailOptions);
    console.log(`[EmailService] Password reset OTP email successfully sent to ${to}`);
  }
};
