/**
 * Rate limiting middleware for preventing abuse
 * 
 * This middleware uses express-rate-limit to limit the number of requests
 * a client can make in a given time period, helping to prevent brute force
 * attacks, denial of service attacks, and other types of abuse.
 */

import rateLimit from 'express-rate-limit';
import { Request, Response, NextFunction } from 'express';
import { TooManyRequestsError } from '../utils/errors';

// Default rate limit options
const defaultOptions = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: 'Too many requests from this IP, please try again later',
  handler: (req: Request, res: Response, next: NextFunction, options: any) => {
    next(new TooManyRequestsError(options.message as string));
  },
};

/**
 * General API rate limiter
 * Limits all API requests to prevent abuse
 */
export const apiLimiter = rateLimit({
  ...defaultOptions,
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per 15 minutes
});

/**
 * Authentication rate limiter
 * More strict limits for authentication endpoints to prevent brute force attacks
 */
export const authLimiter = rateLimit({
  ...defaultOptions,
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 login/register attempts per 15 minutes
  message: 'Too many authentication attempts, please try again later',
});

/**
 * Password reset rate limiter
 * Strict limits for password reset to prevent abuse
 */
export const passwordResetLimiter = rateLimit({
  ...defaultOptions,
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 password reset attempts per hour
  message: 'Too many password reset attempts, please try again later',
});

/**
 * Account creation rate limiter
 * Limits account creation to prevent spam
 */
export const accountCreationLimiter = rateLimit({
  ...defaultOptions,
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 5, // 5 account creations per day
  message: 'Too many accounts created from this IP, please try again later',
});

/**
 * TOTP generation rate limiter
 * Limits TOTP code generation to prevent abuse
 */
export const totpGenerationLimiter = rateLimit({
  ...defaultOptions,
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 30, // 30 TOTP generations per 5 minutes
  message: 'Too many TOTP code generation attempts, please try again later',
});