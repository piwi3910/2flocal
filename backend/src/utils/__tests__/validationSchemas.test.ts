import * as validationSchemas from '../validationSchemas';

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