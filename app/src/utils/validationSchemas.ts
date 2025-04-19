import * as yup from 'yup';

// Common validation patterns
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordMinLength = 8;

// Login form validation schema
export const loginSchema = yup.object().shape({
  email: yup
    .string()
    .required('Email is required')
    .matches(emailRegex, 'Invalid email format')
    .trim(),
  password: yup.string().required('Password is required'),
});

// Registration form validation schema
export const registerSchema = yup.object().shape({
  name: yup.string().required('Name is required').trim(),
  email: yup
    .string()
    .required('Email is required')
    .matches(emailRegex, 'Invalid email format')
    .trim(),
  password: yup
    .string()
    .required('Password is required')
    .min(passwordMinLength, `Password must be at least ${passwordMinLength} characters`),
  confirmPassword: yup
    .string()
    .required('Please confirm your password')
    .oneOf([yup.ref('password')], 'Passwords must match'),
});

// Forgot password form validation schema
export const forgotPasswordSchema = yup.object().shape({
  email: yup
    .string()
    .required('Email is required')
    .matches(emailRegex, 'Invalid email format')
    .trim(),
});

// Reset password form validation schema
export const resetPasswordSchema = yup.object().shape({
  password: yup
    .string()
    .required('Password is required')
    .min(passwordMinLength, `Password must be at least ${passwordMinLength} characters`),
  confirmPassword: yup
    .string()
    .required('Please confirm your password')
    .oneOf([yup.ref('password')], 'Passwords must match'),
});

// Update profile form validation schema
export const updateProfileSchema = yup.object().shape({
  name: yup.string().required('Name is required').trim(),
  email: yup
    .string()
    .required('Email is required')
    .matches(emailRegex, 'Invalid email format')
    .trim(),
});