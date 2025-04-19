import * as yup from 'yup';
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updateProfileSchema,
} from '../validationSchemas';

describe('Validation Schemas', () => {
  describe('loginSchema', () => {
    it('should validate a valid login input', async () => {
      // Arrange
      const validInput = {
        email: 'test@example.com',
        password: 'Password123!',
      };

      // Act
      let error;
      try {
        await loginSchema.validate(validInput);
      } catch (e) {
        error = e;
      }

      // Assert
      expect(error).toBeUndefined();
    });

    it('should reject an invalid email', async () => {
      // Arrange
      const invalidInput = {
        email: 'not-an-email',
        password: 'Password123!',
      };

      // Act & Assert
      await expect(loginSchema.validate(invalidInput)).rejects.toThrow(/email/i);
    });

    it('should reject a missing password', async () => {
      // Arrange
      const invalidInput = {
        email: 'test@example.com',
        password: '',
      };

      // Act & Assert
      await expect(loginSchema.validate(invalidInput)).rejects.toThrow(/password/i);
    });
  });

  describe('registerSchema', () => {
    it('should validate a valid registration input', async () => {
      // Arrange
      const validInput = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      };

      // Act
      let error;
      try {
        await registerSchema.validate(validInput);
      } catch (e) {
        error = e;
      }

      // Assert
      expect(error).toBeUndefined();
    });

    it('should reject when passwords do not match', async () => {
      // Arrange
      const invalidInput = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123!',
        confirmPassword: 'DifferentPassword123!',
      };

      // Act & Assert
      await expect(registerSchema.validate(invalidInput)).rejects.toThrow(/match/i);
    });

    it('should reject when name is missing', async () => {
      // Arrange
      const invalidInput = {
        name: '',
        email: 'test@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      };

      // Act & Assert
      await expect(registerSchema.validate(invalidInput)).rejects.toThrow(/name/i);
    });

    it('should reject when password is too short', async () => {
      // Arrange
      const invalidInput = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'Short1!',
        confirmPassword: 'Short1!',
      };

      // Act & Assert
      await expect(registerSchema.validate(invalidInput)).rejects.toThrow(/at least/i);
    });
  });

  describe('forgotPasswordSchema', () => {
    it('should validate a valid email', async () => {
      // Arrange
      const validInput = {
        email: 'test@example.com',
      };

      // Act
      let error;
      try {
        await forgotPasswordSchema.validate(validInput);
      } catch (e) {
        error = e;
      }

      // Assert
      expect(error).toBeUndefined();
    });

    it('should reject an invalid email', async () => {
      // Arrange
      const invalidInput = {
        email: 'not-an-email',
      };

      // Act & Assert
      await expect(forgotPasswordSchema.validate(invalidInput)).rejects.toThrow(/email/i);
    });
  });

  describe('resetPasswordSchema', () => {
    it('should validate valid password reset input', async () => {
      // Arrange
      const validInput = {
        password: 'NewPassword123!',
        confirmPassword: 'NewPassword123!',
      };

      // Act
      let error;
      try {
        await resetPasswordSchema.validate(validInput);
      } catch (e) {
        error = e;
      }

      // Assert
      expect(error).toBeUndefined();
    });

    it('should reject when passwords do not match', async () => {
      // Arrange
      const invalidInput = {
        password: 'NewPassword123!',
        confirmPassword: 'DifferentPassword123!',
      };

      // Act & Assert
      await expect(resetPasswordSchema.validate(invalidInput)).rejects.toThrow(/match/i);
    });
  });

  describe('updateProfileSchema', () => {
    it('should validate valid profile update input', async () => {
      // Arrange
      const validInput = {
        name: 'Updated Name',
        email: 'updated@example.com',
      };

      // Act
      let error;
      try {
        await updateProfileSchema.validate(validInput);
      } catch (e) {
        error = e;
      }

      // Assert
      expect(error).toBeUndefined();
    });

    it('should reject an invalid email', async () => {
      // Arrange
      const invalidInput = {
        name: 'Updated Name',
        email: 'not-an-email',
      };

      // Act & Assert
      await expect(updateProfileSchema.validate(invalidInput)).rejects.toThrow(/email/i);
    });
  });
});