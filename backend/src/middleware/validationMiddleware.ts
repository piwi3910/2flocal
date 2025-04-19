/**
 * Validation middleware for request validation
 * 
 * This middleware uses express-validator to validate request data
 * and provides consistent error handling for validation failures.
 */

import { Request, Response, NextFunction } from 'express';
// @ts-ignore
const expressValidator = require('express-validator');
const { validationResult } = expressValidator;
// Define ValidationChain type
type ValidationChain = any;
import { ValidationError } from '../utils/errors';

/**
 * Middleware to validate request data using express-validator rules
 * 
 * @param validations Array of express-validator validation chains
 * @returns Middleware function that validates request data
 */
export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Execute all validations
    await Promise.all(validations.map(validation => validation.run(req)));

    // Check if there are validation errors
    const errors = validationResult(req);
    
    if (errors.isEmpty()) {
      return next();
    }

    // Format validation errors
    const formattedErrors = errors.array().map((error: any) => ({
      field: error.param,
      message: error.msg,
      value: error.value
    }));

    // Throw a ValidationError with the formatted errors
    next(new ValidationError('Validation failed', 'VALIDATION_ERROR', formattedErrors));
  };
};