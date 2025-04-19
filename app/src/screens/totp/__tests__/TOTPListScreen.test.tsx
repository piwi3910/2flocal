import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert, Share } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import TOTPListScreen from '../TOTPListScreen';
import { useAuth } from '../../../context/AuthContext';
import totpService from '../../../services/totpService';
import biometricService from '../../../services/biometricService';

// Mock the navigation hook
jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
}));

// Mock the useAuth hook
jest.mock('../../../context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

// Mock the TOTP service
jest.mock('../../../services/totpService', () => ({
  getSecrets: jest.fn(),
  deleteSecret: jest.fn(),
  generateQRCode: jest.fn(),
}));

// Mock the biometric service
jest.mock('../../../services/biometricService', () => ({
  isBiometricAvailable: jest.fn(),
  isBiometricsEnabled: jest.fn(),
  isBiometricsForTOTPAccessEnabled: jest.fn(),
}));

// Mock Alert
jest.spyOn(Alert, 'alert');

// Mock Share
jest.spyOn(Share, 'share').mockImplementation(() => Promise.resolve({ action: 'sharedAction' }));

// Mock the ActivityIndicator component to include a testID
jest.mock('react-native', () => {
  const rn = jest.requireActual('react-native');
  return {
    ...rn,
    ActivityIndicator: (props) => {
      return rn.createElement('ActivityIndicator', {
        ...props,
        testID: props.testID || 'loading-indicator',
      });
    },
  };
});

describe('TOTPListScreen', () => {
  // Mock navigation
  const mockNavigate = jest.fn();
  
  // Mock TOTP secrets
  const mockSecrets = [
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
  ];

  // Setup default mocks
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock navigation
    (useNavigation as jest.Mock).mockReturnValue({
      navigate: mockNavigate,
    });
    
    // Mock useAuth hook
    (useAuth as jest.Mock).mockReturnValue({
      authenticateWithBiometrics: jest.fn().mockResolvedValue(true),
    });
    
    // Mock biometric service
    (biometricService.isBiometricAvailable as jest.Mock).mockResolvedValue({ available: false });
    (biometricService.isBiometricsEnabled as jest.Mock).mockResolvedValue(false);
    (biometricService.isBiometricsForTOTPAccessEnabled as jest.Mock).mockResolvedValue(false);
    
    // Mock TOTP service
    (totpService.getSecrets as jest.Mock).mockResolvedValue(mockSecrets);
  });

  it('should render loading state initially', async () => {
    // Act
    const { getByTestId } = render(<TOTPListScreen />);
    
    // Assert
    expect(getByTestId('loading-indicator')).toBeTruthy();
  });

  it('should fetch and display TOTP secrets', async () => {
    // Act
    const { findByText } = render(<TOTPListScreen />);
    
    // Assert
    const exampleService = await findByText('Example Service');
    const anotherService = await findByText('Another Service');
    
    expect(exampleService).toBeTruthy();
    expect(anotherService).toBeTruthy();
    expect(totpService.getSecrets).toHaveBeenCalled();
  });

  it('should show empty state when no secrets are available', async () => {
    // Arrange
    (totpService.getSecrets as jest.Mock).mockResolvedValue([]);
    
    // Act
    const { findByText } = render(<TOTPListScreen />);
    
    // Assert
    const emptyTitle = await findByText('No TOTP Accounts');
    const emptyMessage = await findByText("You don't have any TOTP accounts yet. Add one to get started.");
    const addButton = await findByText('Add Account');
    
    expect(emptyTitle).toBeTruthy();
    expect(emptyMessage).toBeTruthy();
    expect(addButton).toBeTruthy();
  });

  it('should show error state when fetching fails', async () => {
    // Arrange
    const errorMessage = 'Failed to fetch TOTP secrets';
    (totpService.getSecrets as jest.Mock).mockRejectedValue(new Error(errorMessage));
    
    // Act
    const { findByText } = render(<TOTPListScreen />);
    
    // Assert
    const errorTitle = await findByText('Error');
    const errorText = await findByText(errorMessage);
    const tryAgainButton = await findByText('Try Again');
    
    expect(errorTitle).toBeTruthy();
    expect(errorText).toBeTruthy();
    expect(tryAgainButton).toBeTruthy();
  });

  it('should navigate to TOTPDetail when an item is pressed', async () => {
    // Act
    const { findByText } = render(<TOTPListScreen />);
    
    // Find and press the first item
    const exampleService = await findByText('Example Service');
    fireEvent.press(exampleService);
    
    // Assert
    expect(mockNavigate).toHaveBeenCalledWith('TOTPDetail', { secretId: 'totp-1' });
  });

  it('should navigate to AddTOTP when Add Manually button is pressed', async () => {
    // Act
    const { findByText } = render(<TOTPListScreen />);
    
    // Find and press the Add Manually button
    const addButton = await findByText('Add Manually');
    fireEvent.press(addButton);
    
    // Assert
    expect(mockNavigate).toHaveBeenCalledWith('AddTOTP');
  });

  it('should navigate to ScanQRCode when Scan QR Code button is pressed', async () => {
    // Act
    const { findByText } = render(<TOTPListScreen />);
    
    // Find and press the Scan QR Code button
    const scanButton = await findByText('Scan QR Code');
    fireEvent.press(scanButton);
    
    // Assert
    expect(mockNavigate).toHaveBeenCalledWith('ScanQRCode');
  });

  it('should delete a TOTP secret when delete is confirmed', async () => {
    // Arrange
    (totpService.deleteSecret as jest.Mock).mockResolvedValue(undefined);
    
    // Act
    const { findByText } = render(<TOTPListScreen />);
    
    // Find and press the Delete button on the first item
    const deleteButton = await findByText('Delete');
    fireEvent.press(deleteButton);
    
    // Get the delete confirmation from the Alert mock
    const alertMock = Alert.alert as jest.Mock;
    const alertTitle = alertMock.mock.calls[0][0];
    const alertMessage = alertMock.mock.calls[0][1];
    const cancelButton = alertMock.mock.calls[0][2][0];
    const confirmButton = alertMock.mock.calls[0][2][1];
    
    expect(alertTitle).toBe('Delete Account');
    expect(alertMessage).toContain('Example Service');
    expect(cancelButton.text).toBe('Cancel');
    expect(confirmButton.text).toBe('Delete');
    
    // Simulate confirming the delete
    confirmButton.onPress();
    
    // Assert
    await waitFor(() => {
      expect(totpService.deleteSecret).toHaveBeenCalledWith('totp-1');
    });
  });

  it('should share a TOTP secret when share button is pressed', async () => {
    // Arrange
    const mockQRCode = {
      qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...',
      uri: 'otpauth://totp/Example:user@example.com?secret=ABCDEFGHIJKLMNOP&issuer=Example',
    };
    (totpService.generateQRCode as jest.Mock).mockResolvedValue(mockQRCode);
    
    // Act
    const { findByText } = render(<TOTPListScreen />);
    
    // Find and press the Share button on the first item
    const shareButton = await findByText('Share');
    fireEvent.press(shareButton);
    
    // Assert
    await waitFor(() => {
      expect(totpService.generateQRCode).toHaveBeenCalledWith('totp-1');
      expect(Share.share).toHaveBeenCalledWith({
        message: expect.stringContaining('Example Service'),
        url: mockQRCode.qrCode,
        title: expect.stringContaining('Example Service'),
      });
    });
  });

  it('should filter secrets based on search query', async () => {
    // Act
    const { findByPlaceholderText, findByText, queryByText } = render(<TOTPListScreen />);
    
    // Wait for items to load
    await findByText('Example Service');
    await findByText('Another Service');
    
    // Find the search input and enter a search query
    const searchInput = await findByPlaceholderText('Search accounts...');
    fireEvent.changeText(searchInput, 'Another');
    
    // Assert
    await waitFor(() => {
      expect(queryByText('Example Service')).toBeNull();
      expect(queryByText('Another Service')).toBeTruthy();
    });
  });

  it('should show biometric authentication modal when biometrics are enabled', async () => {
    // Arrange
    (biometricService.isBiometricAvailable as jest.Mock).mockResolvedValue({ available: true });
    (biometricService.isBiometricsEnabled as jest.Mock).mockResolvedValue(true);
    (biometricService.isBiometricsForTOTPAccessEnabled as jest.Mock).mockResolvedValue(true);
    
    // Act
    const { findByText } = render(<TOTPListScreen />);
    
    // Assert
    const modalTitle = await findByText('Authentication Required');
    const modalText = await findByText('Please authenticate using biometrics to view your TOTP codes.');
    const authButton = await findByText('Authenticate');
    
    expect(modalTitle).toBeTruthy();
    expect(modalText).toBeTruthy();
    expect(authButton).toBeTruthy();
  });

  it('should authenticate with biometrics when authenticate button is pressed', async () => {
    // Arrange
    const mockAuthenticateWithBiometrics = jest.fn().mockResolvedValue(true);
    (useAuth as jest.Mock).mockReturnValue({
      authenticateWithBiometrics: mockAuthenticateWithBiometrics,
    });
    
    (biometricService.isBiometricAvailable as jest.Mock).mockResolvedValue({ available: true });
    (biometricService.isBiometricsEnabled as jest.Mock).mockResolvedValue(true);
    (biometricService.isBiometricsForTOTPAccessEnabled as jest.Mock).mockResolvedValue(true);
    
    // Act
    const { findByText } = render(<TOTPListScreen />);
    
    // Find and press the Authenticate button
    const authButton = await findByText('Authenticate');
    fireEvent.press(authButton);
    
    // Assert
    await waitFor(() => {
      expect(mockAuthenticateWithBiometrics).toHaveBeenCalledWith('Authenticate to view TOTP codes');
      expect(totpService.getSecrets).toHaveBeenCalled();
    });
  });

  it('should show alert when biometric authentication fails', async () => {
    // Arrange
    const mockAuthenticateWithBiometrics = jest.fn().mockResolvedValue(false);
    (useAuth as jest.Mock).mockReturnValue({
      authenticateWithBiometrics: mockAuthenticateWithBiometrics,
    });
    
    (biometricService.isBiometricAvailable as jest.Mock).mockResolvedValue({ available: true });
    (biometricService.isBiometricsEnabled as jest.Mock).mockResolvedValue(true);
    (biometricService.isBiometricsForTOTPAccessEnabled as jest.Mock).mockResolvedValue(true);
    
    // Act
    const { findByText } = render(<TOTPListScreen />);
    
    // Find and press the Authenticate button
    const authButton = await findByText('Authenticate');
    fireEvent.press(authButton);
    
    // Assert
    await waitFor(() => {
      expect(mockAuthenticateWithBiometrics).toHaveBeenCalledWith('Authenticate to view TOTP codes');
      expect(Alert.alert).toHaveBeenCalledWith(
        'Authentication Failed',
        'Biometric authentication failed. Please try again.'
      );
    });
  });
});