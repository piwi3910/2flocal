import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import LoginScreen from '../LoginScreen';
import { useAuth } from '../../../context/AuthContext';
import biometricService from '../../../services/biometricService';

// Mock the useAuth hook
jest.mock('../../../context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

// Mock biometricService
jest.mock('../../../services/biometricService', () => ({
  isBiometricAvailable: jest.fn(),
  isBiometricsEnabled: jest.fn(),
  isBiometricsForAppAccessEnabled: jest.fn(),
  authenticate: jest.fn(),
}));

// Mock Alert
jest.spyOn(Alert, 'alert');

describe('LoginScreen', () => {
  // Mock navigation
  const mockNavigation = {
    navigate: jest.fn(),
  };

  // Setup default mocks
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock useAuth hook
    (useAuth as jest.Mock).mockReturnValue({
      login: jest.fn().mockResolvedValue({}),
      authenticateWithBiometrics: jest.fn().mockResolvedValue(true),
    });
    
    // Mock biometric service
    (biometricService.isBiometricAvailable as jest.Mock).mockResolvedValue({ available: false });
    (biometricService.isBiometricsEnabled as jest.Mock).mockResolvedValue(false);
    (biometricService.isBiometricsForAppAccessEnabled as jest.Mock).mockResolvedValue(false);
  });

  it('should render login form correctly', async () => {
    // Act
    const { getByText, getByPlaceholderText } = render(
      <LoginScreen navigation={mockNavigation as any} />
    );

    // Assert
    await waitFor(() => {
      expect(getByText('Welcome Back')).toBeTruthy();
      expect(getByText('Sign in to your account')).toBeTruthy();
      expect(getByPlaceholderText('Enter your email')).toBeTruthy();
      expect(getByPlaceholderText('Enter your password')).toBeTruthy();
      expect(getByText('Sign In')).toBeTruthy();
      expect(getByText('Forgot Password?')).toBeTruthy();
      expect(getByText('Don\'t have an account?')).toBeTruthy();
      expect(getByText('Sign Up')).toBeTruthy();
    });
  });

  it('should show validation errors for empty fields', async () => {
    // Arrange
    const { getByText } = render(
      <LoginScreen navigation={mockNavigation as any} />
    );
    
    // Act
    fireEvent.press(getByText('Sign In'));

    // Assert
    await waitFor(() => {
      expect(getByText('Email is required')).toBeTruthy();
      expect(getByText('Password is required')).toBeTruthy();
    });
  });

  it('should call login with correct credentials', async () => {
    // Arrange
    const mockLogin = jest.fn().mockResolvedValue({});
    (useAuth as jest.Mock).mockReturnValue({
      login: mockLogin,
      authenticateWithBiometrics: jest.fn().mockResolvedValue(true),
    });

    const { getByPlaceholderText, getByText } = render(
      <LoginScreen navigation={mockNavigation as any} />
    );
    
    // Act
    fireEvent.changeText(getByPlaceholderText('Enter your email'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('Enter your password'), 'Password123!');
    fireEvent.press(getByText('Sign In'));

    // Assert
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'Password123!');
    });
  });

  it('should show error alert when login fails', async () => {
    // Arrange
    const mockLogin = jest.fn().mockRejectedValue(new Error('Invalid credentials'));
    (useAuth as jest.Mock).mockReturnValue({
      login: mockLogin,
      authenticateWithBiometrics: jest.fn().mockResolvedValue(true),
    });

    const { getByPlaceholderText, getByText } = render(
      <LoginScreen navigation={mockNavigation as any} />
    );
    
    // Act
    fireEvent.changeText(getByPlaceholderText('Enter your email'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('Enter your password'), 'WrongPassword123!');
    fireEvent.press(getByText('Sign In'));

    // Assert
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'WrongPassword123!');
      expect(Alert.alert).toHaveBeenCalledWith('Login Failed', 'Invalid credentials');
    });
  });

  it('should navigate to Register screen when Sign Up is pressed', () => {
    // Arrange
    const { getByText } = render(
      <LoginScreen navigation={mockNavigation as any} />
    );
    
    // Act
    fireEvent.press(getByText('Sign Up'));

    // Assert
    expect(mockNavigation.navigate).toHaveBeenCalledWith('Register');
  });

  it('should navigate to ForgotPassword screen when Forgot Password is pressed', () => {
    // Arrange
    const { getByText } = render(
      <LoginScreen navigation={mockNavigation as any} />
    );
    
    // Act
    fireEvent.press(getByText('Forgot Password?'));

    // Assert
    expect(mockNavigation.navigate).toHaveBeenCalledWith('ForgotPassword');
  });

  it('should show biometric button when biometrics are available and enabled', async () => {
    // Arrange
    (biometricService.isBiometricAvailable as jest.Mock).mockResolvedValue({ available: true });
    (biometricService.isBiometricsEnabled as jest.Mock).mockResolvedValue(true);
    (biometricService.isBiometricsForAppAccessEnabled as jest.Mock).mockResolvedValue(true);

    // Act
    const { findByText } = render(
      <LoginScreen navigation={mockNavigation as any} />
    );

    // Assert
    const biometricButton = await findByText('Sign in with Biometrics');
    expect(biometricButton).toBeTruthy();
  });

  it('should call authenticateWithBiometrics when biometric button is pressed', async () => {
    // Arrange
    const mockAuthenticateWithBiometrics = jest.fn().mockResolvedValue(true);
    (useAuth as jest.Mock).mockReturnValue({
      login: jest.fn().mockResolvedValue({}),
      authenticateWithBiometrics: mockAuthenticateWithBiometrics,
    });

    (biometricService.isBiometricAvailable as jest.Mock).mockResolvedValue({ available: true });
    (biometricService.isBiometricsEnabled as jest.Mock).mockResolvedValue(true);
    (biometricService.isBiometricsForAppAccessEnabled as jest.Mock).mockResolvedValue(true);

    // Act
    const { findByText } = render(
      <LoginScreen navigation={mockNavigation as any} />
    );
    
    const biometricButton = await findByText('Sign in with Biometrics');
    fireEvent.press(biometricButton);

    // Assert
    await waitFor(() => {
      expect(mockAuthenticateWithBiometrics).toHaveBeenCalledWith('Unlock 2FLocal');
    });
  });

  it('should show error alert when biometric authentication fails', async () => {
    // Arrange
    const mockAuthenticateWithBiometrics = jest.fn().mockResolvedValue(false);
    (useAuth as jest.Mock).mockReturnValue({
      login: jest.fn().mockResolvedValue({}),
      authenticateWithBiometrics: mockAuthenticateWithBiometrics,
    });

    (biometricService.isBiometricAvailable as jest.Mock).mockResolvedValue({ available: true });
    (biometricService.isBiometricsEnabled as jest.Mock).mockResolvedValue(true);
    (biometricService.isBiometricsForAppAccessEnabled as jest.Mock).mockResolvedValue(true);

    // Act
    const { findByText } = render(
      <LoginScreen navigation={mockNavigation as any} />
    );
    
    const biometricButton = await findByText('Sign in with Biometrics');
    fireEvent.press(biometricButton);

    // Assert
    await waitFor(() => {
      expect(mockAuthenticateWithBiometrics).toHaveBeenCalledWith('Unlock 2FLocal');
      expect(Alert.alert).toHaveBeenCalledWith(
        'Authentication Failed',
        'Biometric authentication failed. Please try again or use your email and password.'
      );
    });
  });
});