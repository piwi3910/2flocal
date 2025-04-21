"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendPasswordResetEmail = exports.sendVerificationEmail = exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
// Email configuration
const EMAIL_HOST = process.env.EMAIL_HOST || 'smtp.example.com';
const EMAIL_PORT = parseInt(process.env.EMAIL_PORT || '587', 10);
const EMAIL_USER = process.env.EMAIL_USER || '';
const EMAIL_PASS = process.env.EMAIL_PASS || '';
const EMAIL_FROM = process.env.EMAIL_FROM || '2FLocal <noreply@2flocal.com>';
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
// Create a transporter with conditional authentication
const transporterConfig = {
    host: EMAIL_HOST,
    port: EMAIL_PORT,
    secure: EMAIL_PORT === 465, // true for 465, false for other ports
};
// Only add auth if credentials are provided
if (EMAIL_USER && EMAIL_PASS) {
    transporterConfig.auth = {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
    };
}
const transporter = nodemailer_1.default.createTransport(transporterConfig);
/**
 * Send an email
 * @param to Recipient email
 * @param subject Email subject
 * @param html Email content (HTML)
 * @returns Promise resolving to the send result
 */
const sendEmail = (to, subject, html) => __awaiter(void 0, void 0, void 0, function* () {
    const mailOptions = {
        from: EMAIL_FROM,
        to,
        subject,
        html,
    };
    try {
        const info = yield transporter.sendMail(mailOptions);
        console.log('Email sent: %s', info.messageId);
        return info;
    }
    catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
});
exports.sendEmail = sendEmail;
/**
 * Send a verification email to a user
 * @param user User object
 * @param token Verification token
 * @returns Promise resolving to the send result
 */
const sendVerificationEmail = (user, token) => __awaiter(void 0, void 0, void 0, function* () {
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
    return (0, exports.sendEmail)(user.email, 'Verify Your Email - 2FLocal', html);
});
exports.sendVerificationEmail = sendVerificationEmail;
/**
 * Send a password reset email to a user
 * @param user User object
 * @param token Password reset token
 * @returns Promise resolving to the send result
 */
const sendPasswordResetEmail = (user, token) => __awaiter(void 0, void 0, void 0, function* () {
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
    return (0, exports.sendEmail)(user.email, 'Password Reset - 2FLocal', html);
});
exports.sendPasswordResetEmail = sendPasswordResetEmail;
