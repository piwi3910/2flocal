import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import EmptyState from '../EmptyState';

describe('EmptyState', () => {
  it('should render correctly with title and message', () => {
    // Act
    const { getByText } = render(
      <EmptyState
        title="Test Title"
        message="Test message content"
      />
    );

    // Assert
    expect(getByText('Test Title')).toBeTruthy();
    expect(getByText('Test message content')).toBeTruthy();
  });

  it('should render button when buttonText and onButtonPress are provided', () => {
    // Arrange
    const onButtonPress = jest.fn();
    
    // Act
    const { getByText } = render(
      <EmptyState
        title="Test Title"
        message="Test message content"
        buttonText="Test Button"
        onButtonPress={onButtonPress}
      />
    );

    // Assert
    expect(getByText('Test Button')).toBeTruthy();
  });

  it('should not render button when buttonText is not provided', () => {
    // Arrange
    const onButtonPress = jest.fn();
    
    // Act
    const { queryByText } = render(
      <EmptyState
        title="Test Title"
        message="Test message content"
        onButtonPress={onButtonPress}
      />
    );

    // Assert
    expect(queryByText('Test Button')).toBeNull();
  });

  it('should not render button when onButtonPress is not provided', () => {
    // Act
    const { queryByText } = render(
      <EmptyState
        title="Test Title"
        message="Test message content"
        buttonText="Test Button"
      />
    );

    // Assert
    expect(queryByText('Test Button')).toBeNull();
  });

  it('should call onButtonPress when button is pressed', () => {
    // Arrange
    const onButtonPress = jest.fn();
    
    // Act
    const { getByText } = render(
      <EmptyState
        title="Test Title"
        message="Test message content"
        buttonText="Test Button"
        onButtonPress={onButtonPress}
      />
    );

    // Press the button
    fireEvent.press(getByText('Test Button'));

    // Assert
    expect(onButtonPress).toHaveBeenCalledTimes(1);
  });
});