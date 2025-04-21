"use strict";
/**
 * Validation middleware for request validation
 *
 * This middleware uses express-validator to validate request data
 * and provides consistent error handling for validation failures.
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
// @ts-ignore
const expressValidator = require('express-validator');
const { validationResult } = expressValidator;
const errors_1 = require("../utils/errors");
/**
 * Middleware to validate request data using express-validator rules
 *
 * @param validations Array of express-validator validation chains
 * @returns Middleware function that validates request data
 */
const validate = (validations) => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        // Execute all validations
        yield Promise.all(validations.map(validation => validation.run(req)));
        // Check if there are validation errors
        const errors = validationResult(req);
        if (errors.isEmpty()) {
            return next();
        }
        // Format validation errors
        const formattedErrors = errors.array().map((error) => ({
            field: error.param,
            message: error.msg,
            value: error.value
        }));
        // Throw a ValidationError with the formatted errors
        next(new errors_1.ValidationError('Validation failed', 'VALIDATION_ERROR', formattedErrors));
    });
};
exports.validate = validate;
