import { render } from '@testing-library/react-native';

// Mock AuthContext values for testing components that use useAuth
export const mockAuthContextValue = {
  user: {
    id: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User',
    isEmailVerified: true,
  },
  token: 'test-token',
  refreshToken: 'test-refresh-token',
  isLoading: false,
  isAuthenticated: true,
  isBiometricsAvailable: true,
  isBiometricsEnabled: true,
  biometryType: 'FaceID',
  login: jest.fn().mockResolvedValue({ message: 'Login successful' }),
  register: jest.fn().mockResolvedValue({ message: 'Registration successful' }),
  logout: jest.fn().mockResolvedValue(undefined),
  forgotPassword: jest.fn().mockResolvedValue({ message: 'Password reset email sent' }),
  resetPassword: jest.fn().mockResolvedValue({ message: 'Password reset successful' }),
  verifyEmail: jest.fn().mockResolvedValue({ message: 'Email verified' }),
  updateProfile: jest.fn().mockResolvedValue({ message: 'Profile updated' }),
  resendVerificationEmail: jest.fn().mockResolvedValue({ message: 'Verification email sent' }),
  refreshAccessToken: jest.fn().mockResolvedValue({ accessToken: 'new-token' }),
  revokeToken: jest.fn().mockResolvedValue({ message: 'Token revoked' }),
  authenticateWithBiometrics: jest.fn().mockResolvedValue(true),
  enableBiometrics: jest.fn().mockResolvedValue(true),
  disableBiometrics: jest.fn().mockResolvedValue(true),
  setBiometricsForAppAccess: jest.fn().mockResolvedValue(true),
  isBiometricsForAppAccessEnabled: jest.fn().mockResolvedValue(true),
  setBiometricsForTOTPAccess: jest.fn().mockResolvedValue(true),
  isBiometricsForTOTPAccessEnabled: jest.fn().mockResolvedValue(true),
};

// Mock navigation props
export const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  setOptions: jest.fn(),
  addListener: jest.fn(),
  removeListener: jest.fn(),
  dispatch: jest.fn(),
  reset: jest.fn(),
  isFocused: jest.fn(() => true),
  canGoBack: jest.fn(() => false),
};

// Mock route props
export const mockRoute = {
  params: {},
  key: 'test-route',
  name: 'TestScreen',
};

// Helper to wait for promises to resolve
export const flushPromises = () => new Promise(resolve => setImmediate(resolve));

// Mock API response data
export const mockApiResponses = {
  login: {
    message: 'Login successful',
    accessToken: 'test-access-token',
    refreshToken: 'test-refresh-token',
    user: {
      id: 'test-user-id',
      email: 'test@example.com',
      name: 'Test User',
      isEmailVerified: true,
    },
  },
  register: {
    message: 'Registration successful',
  },
  totpSecrets: [
    {
      id: 'totp-1',
      issuer: 'Example Service',
      label: 'user@example.com',
      createdAt: '2025-04-01T12:00:00Z',
      updatedAt: '2025-04-01T12:00:00Z',
    },
    {
      id: 'totp-2',
      issuer: 'Another Service',
      label: 'user@anotherexample.com',
      createdAt: '2025-04-02T12:00:00Z',
      updatedAt: '2025-04-02T12:00:00Z',
    },
  ],
  totpCode: {
    code: '123456',
    remainingSeconds: 25,
    period: 30,
    issuer: 'Example Service',
    label: 'user@example.com',
  },
};