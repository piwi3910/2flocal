import nodemailer from 'nodemailer';
import { User } from '../../prisma/src/generated/prisma';

// Email configuration
const EMAIL_HOST = process.env.EMAIL_HOST || 'smtp.example.com';
const EMAIL_PORT = parseInt(process.env.EMAIL_PORT || '587', 10);
const EMAIL_USER = process.env.EMAIL_USER || 'user@example.com';
const EMAIL_PASS = process.env.EMAIL_PASS || 'password';
const EMAIL_FROM = process.env.EMAIL_FROM || '2FLocal <noreply@2flocal.com>';
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

// Create a transporter
const transporter = nodemailer.createTransport({
  host: EMAIL_HOST,
  port: EMAIL_PORT,
  secure: EMAIL_PORT === 465, // true for 465, false for other ports
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

/**
 * Send an email
 * @param to Recipient email
 * @param subject Email subject
 * @param html Email content (HTML)
 * @returns Promise resolving to the send result
 */
export const sendEmail = async (to: string, subject: string, html: string): Promise<any> => {
  const mailOptions = {
    from: EMAIL_FROM,
    to,
    subject,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

/**
 * Send a verification email to a user
 * @param user User object
 * @param token Verification token
 * @returns Promise resolving to the send result
 */
export const sendVerificationEmail = async (user: User, token: string): Promise<any> => {
  const verificationUrl = `${BASE_URL}/verify-email?token=${token}`;
  
  const html = `
    <h1>Email Verification</h1>
    <p>Hello,</p>
    <p>Please verify your email address by clicking the link below:</p>
    <p><a href="${verificationUrl}">Verify Email</a></p>
    <p>If you did not create an account, please ignore this email.</p>
    <p>Thank you,</p>
    <p>The 2FLocal Team</p>
  `;

  return sendEmail(user.email, 'Verify Your Email - 2FLocal', html);
};

/**
 * Send a password reset email to a user
 * @param user User object
 * @param token Password reset token
 * @returns Promise resolving to the send result
 */
export const sendPasswordResetEmail = async (user: User, token: string): Promise<any> => {
  const resetUrl = `${BASE_URL}/reset-password?token=${token}`;
  
  const html = `
    <h1>Password Reset</h1>
    <p>Hello,</p>
    <p>You requested a password reset. Please click the link below to reset your password:</p>
    <p><a href="${resetUrl}">Reset Password</a></p>
    <p>If you did not request a password reset, please ignore this email.</p>
    <p>Thank you,</p>
    <p>The 2FLocal Team</p>
  `;

  return sendEmail(user.email, 'Password Reset - 2FLocal', html);
};