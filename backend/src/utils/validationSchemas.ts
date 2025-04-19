/**
 * Validation schemas for API endpoints
 * 
 * This module defines validation schemas for all API endpoints using express-validator.
 * These schemas ensure that all input data is properly validated before processing.
 */

import expressValidator from 'express-validator';
const { body, param, query } = expressValidator;

// --- Auth Validation Schemas ---

/**
 * Validation schema for user registration
 */
export const registerValidation = [
  body('email')
    .isEmail()
    .withMessage('Must be a valid email address')
    .normalizeEmail()
    .trim(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/[a-z]/)
    .withMessage('Password must contain at least one lowercase letter')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/[0-9]/)
    .withMessage('Password must contain at least one number')
    .matches(/[!@#$%^&*(),.?":{}|<>]/)
    .withMessage('Password must contain at least one special character'),
  body('name')
    .optional()
    .isString()
    .withMessage('Name must be a string')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be between 1 and 100 characters'),
];

/**
 * Validation schema for user login
 */
export const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Must be a valid email address')
    .normalizeEmail()
    .trim(),
  body('password')
    .isString()
    .withMessage('Password must be a string')
    .notEmpty()
    .withMessage('Password is required'),
];

/**
 * Validation schema for forgot password
 */
export const forgotPasswordValidation = [
  body('email')
    .isEmail()
    .withMessage('Must be a valid email address')
    .normalizeEmail()
    .trim(),
];

/**
 * Validation schema for reset password
 */
export const resetPasswordValidation = [
  body('token')
    .isString()
    .withMessage('Token must be a string')
    .notEmpty()
    .withMessage('Token is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/[a-z]/)
    .withMessage('Password must contain at least one lowercase letter')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/[0-9]/)
    .withMessage('Password must contain at least one number')
    .matches(/[!@#$%^&*(),.?":{}|<>]/)
    .withMessage('Password must contain at least one special character'),
];

/**
 * Validation schema for email verification
 */
export const verifyEmailValidation = [
  param('token')
    .isString()
    .withMessage('Token must be a string')
    .notEmpty()
    .withMessage('Token is required'),
];

/**
 * Validation schema for profile update
 */
export const updateProfileValidation = [
  body('name')
    .optional()
    .isString()
    .withMessage('Name must be a string')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be between 1 and 100 characters'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Must be a valid email address')
    .normalizeEmail()
    .trim(),
];

// --- Account Validation Schemas ---

/**
 * Validation schema for adding account secret
 */
export const addAccountSecretValidation = [
  body('issuer')
    .isString()
    .withMessage('Issuer must be a string')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Issuer must be between 1 and 100 characters'),
  body('label')
    .isString()
    .withMessage('Label must be a string')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Label must be between 1 and 100 characters'),
  body('secret')
    .isString()
    .withMessage('Secret must be a string')
    .trim()
    .notEmpty()
    .withMessage('Secret is required'),
];

/**
 * Validation schema for account secret ID parameter
 */
export const accountSecretIdValidation = [
  param('id')
    .isString()
    .withMessage('Account Secret ID must be a string')
    .notEmpty()
    .withMessage('Account Secret ID is required'),
];

/**
 * Validation schema for parsing QR code
 */
export const parseQRCodeValidation = [
  body('image')
    .isString()
    .withMessage('Image data must be a string')
    .notEmpty()
    .withMessage('Image data is required'),
];

// --- Device Validation Schemas ---

/**
 * Validation schema for registering a device
 */
export const registerDeviceValidation = [
  body('name')
    .isString()
    .withMessage('Device name must be a string')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Device name must be between 1 and 100 characters'),
  body('deviceId')
    .isString()
    .withMessage('Device ID must be a string')
    .trim()
    .notEmpty()
    .withMessage('Device ID is required'),
  body('platform')
    .isString()
    .withMessage('Platform must be a string')
    .trim()
    .isIn(['ios', 'android', 'web'])
    .withMessage('Platform must be one of: ios, android, web'),
];

/**
 * Validation schema for device ID parameter
 */
export const deviceIdValidation = [
  param('id')
    .isString()
    .withMessage('Device ID must be a string')
    .notEmpty()
    .withMessage('Device ID is required'),
];