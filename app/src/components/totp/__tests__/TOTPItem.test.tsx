import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Alert } from 'react-native';
import TOTPItem from '../TOTPItem';

// Mock Alert
jest.spyOn(Alert, 'alert');

describe('TOTPItem', () => {
  // Mock TOTP secret
  const mockItem = {
    id: 'totp-1',
    issuer: 'Example Service',
    label: 'user@example.com',
    createdAt: '2025-04-01T12:00:00Z',
    updatedAt: '2025-04-01T12:00:00Z',
  };

  // Mock handlers
  const mockOnPress = jest.fn();
  const mockOnDelete = jest.fn();
  const mockOnShare = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render correctly with item data', () => {
    // Act
    const { getByText } = render(
      <TOTPItem
        item={mockItem}
        onPress={mockOnPress}
        onDelete={mockOnDelete}
        onShare={mockOnShare}
      />
    );

    // Assert
    expect(getByText('Example Service')).toBeTruthy();
    expect(getByText('user@example.com')).toBeTruthy();
    expect(getByText('Share')).toBeTruthy();
    expect(getByText('Delete')).toBeTruthy();
  });

  it('should call onPress when item is pressed', () => {
    // Act
    const { getByText } = render(
      <TOTPItem
        item={mockItem}
        onPress={mockOnPress}
        onDelete={mockOnDelete}
        onShare={mockOnShare}
      />
    );

    // Press the item (by pressing the issuer text)
    fireEvent.press(getByText('Example Service'));

    // Assert
    expect(mockOnPress).toHaveBeenCalledWith(mockItem);
  });

  it('should call onShare when Share button is pressed', () => {
    // Act
    const { getByText } = render(
      <TOTPItem
        item={mockItem}
        onPress={mockOnPress}
        onDelete={mockOnDelete}
        onShare={mockOnShare}
      />
    );

    // Press the Share button
    fireEvent.press(getByText('Share'));

    // Assert
    expect(mockOnShare).toHaveBeenCalledWith(mockItem);
  });

  it('should show confirmation dialog when Delete button is pressed', () => {
    // Act
    const { getByText } = render(
      <TOTPItem
        item={mockItem}
        onPress={mockOnPress}
        onDelete={mockOnDelete}
        onShare={mockOnShare}
      />
    );

    // Press the Delete button
    fireEvent.press(getByText('Delete'));

    // Assert
    expect(Alert.alert).toHaveBeenCalledWith(
      'Delete Account',
      'Are you sure you want to delete Example Service (user@example.com)?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', onPress: expect.any(Function), style: 'destructive' }
      ]
    );
  });

  it('should call onDelete when delete is confirmed', () => {
    // Act
    const { getByText } = render(
      <TOTPItem
        item={mockItem}
        onPress={mockOnPress}
        onDelete={mockOnDelete}
        onShare={mockOnShare}
      />
    );

    // Press the Delete button
    fireEvent.press(getByText('Delete'));

    // Get the delete confirmation from the Alert mock
    const alertMock = Alert.alert as jest.Mock;
    const confirmButton = alertMock.mock.calls[0][2][1];
    
    // Simulate confirming the delete
    confirmButton.onPress();

    // Assert
    expect(mockOnDelete).toHaveBeenCalledWith(mockItem);
  });

  it('should not call onDelete when delete is canceled', () => {
    // Act
    const { getByText } = render(
      <TOTPItem
        item={mockItem}
        onPress={mockOnPress}
        onDelete={mockOnDelete}
        onShare={mockOnShare}
      />
    );

    // Press the Delete button
    fireEvent.press(getByText('Delete'));

    // Get the delete confirmation from the Alert mock
    const alertMock = Alert.alert as jest.Mock;
    const cancelButton = alertMock.mock.calls[0][2][0];
    
    // Simulate canceling the delete
    if (cancelButton.onPress) {
      cancelButton.onPress();
    }

    // Assert
    expect(mockOnDelete).not.toHaveBeenCalled();
  });
});