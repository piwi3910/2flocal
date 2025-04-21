"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const validationSchemas = __importStar(require("../validationSchemas"));
describe('Validation Schemas', () => {
    describe('Auth Validation Schemas', () => {
        it('should export registerValidation', () => {
            expect(validationSchemas.registerValidation).toBeDefined();
            expect(Array.isArray(validationSchemas.registerValidation)).toBe(true);
            expect(validationSchemas.registerValidation.length).toBeGreaterThan(0);
        });
        it('should export loginValidation', () => {
            expect(validationSchemas.loginValidation).toBeDefined();
            expect(Array.isArray(validationSchemas.loginValidation)).toBe(true);
            expect(validationSchemas.loginValidation.length).toBeGreaterThan(0);
        });
        it('should export forgotPasswordValidation', () => {
            expect(validationSchemas.forgotPasswordValidation).toBeDefined();
            expect(Array.isArray(validationSchemas.forgotPasswordValidation)).toBe(true);
            expect(validationSchemas.forgotPasswordValidation.length).toBeGreaterThan(0);
        });
        it('should export resetPasswordValidation', () => {
            expect(validationSchemas.resetPasswordValidation).toBeDefined();
            expect(Array.isArray(validationSchemas.resetPasswordValidation)).toBe(true);
            expect(validationSchemas.resetPasswordValidation.length).toBeGreaterThan(0);
        });
        it('should export verifyEmailValidation', () => {
            expect(validationSchemas.verifyEmailValidation).toBeDefined();
            expect(Array.isArray(validationSchemas.verifyEmailValidation)).toBe(true);
            expect(validationSchemas.verifyEmailValidation.length).toBeGreaterThan(0);
        });
        it('should export updateProfileValidation', () => {
            expect(validationSchemas.updateProfileValidation).toBeDefined();
            expect(Array.isArray(validationSchemas.updateProfileValidation)).toBe(true);
            expect(validationSchemas.updateProfileValidation.length).toBeGreaterThan(0);
        });
    });
    describe('Account Validation Schemas', () => {
        it('should export addAccountSecretValidation', () => {
            expect(validationSchemas.addAccountSecretValidation).toBeDefined();
            expect(Array.isArray(validationSchemas.addAccountSecretValidation)).toBe(true);
            expect(validationSchemas.addAccountSecretValidation.length).toBeGreaterThan(0);
        });
        it('should export accountSecretIdValidation', () => {
            expect(validationSchemas.accountSecretIdValidation).toBeDefined();
            expect(Array.isArray(validationSchemas.accountSecretIdValidation)).toBe(true);
            expect(validationSchemas.accountSecretIdValidation.length).toBeGreaterThan(0);
        });
        it('should export parseQRCodeValidation', () => {
            expect(validationSchemas.parseQRCodeValidation).toBeDefined();
            expect(Array.isArray(validationSchemas.parseQRCodeValidation)).toBe(true);
            expect(validationSchemas.parseQRCodeValidation.length).toBeGreaterThan(0);
        });
    });
    describe('Device Validation Schemas', () => {
        it('should export registerDeviceValidation', () => {
            expect(validationSchemas.registerDeviceValidation).toBeDefined();
            expect(Array.isArray(validationSchemas.registerDeviceValidation)).toBe(true);
            expect(validationSchemas.registerDeviceValidation.length).toBeGreaterThan(0);
        });
        it('should export deviceIdValidation', () => {
            expect(validationSchemas.deviceIdValidation).toBeDefined();
            expect(Array.isArray(validationSchemas.deviceIdValidation)).toBe(true);
            expect(validationSchemas.deviceIdValidation.length).toBeGreaterThan(0);
        });
    });
});
