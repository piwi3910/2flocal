import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import FormButton from '../FormButton';

describe('FormButton', () => {
  it('should render correctly with title', () => {
    // Arrange
    const onPress = jest.fn();
    
    // Act
    const { getByText } = render(
      <FormButton title="Submit" onPress={onPress} />
    );

    // Assert
    expect(getByText('Submit')).toBeTruthy();
  });

  it('should call onPress when pressed', () => {
    // Arrange
    const onPress = jest.fn();
    
    // Act
    const { getByText } = render(
      <FormButton title="Submit" onPress={onPress} />
    );
    
    fireEvent.press(getByText('Submit'));

    // Assert
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('should not call onPress when disabled', () => {
    // Arrange
    const onPress = jest.fn();
    
    // Act
    const { getByText } = render(
      <FormButton title="Submit" onPress={onPress} disabled={true} />
    );
    
    fireEvent.press(getByText('Submit'));

    // Assert
    expect(onPress).not.toHaveBeenCalled();
  });

  it('should show loading indicator when isLoading is true', () => {
    // Arrange
    const onPress = jest.fn();
    
    // Act
    const { getByTestId, queryByText } = render(
      <FormButton 
        title="Submit" 
        onPress={onPress} 
        isLoading={true} 
        testID="button"
      />
    );
    
    // Assert
    expect(getByTestId('button')).toBeTruthy();
    expect(queryByText('Submit')).toBeNull();
  });

  it('should apply primary button style by default', () => {
    // Arrange
    const onPress = jest.fn();
    
    // Act
    const { getByTestId } = render(
      <FormButton 
        title="Submit" 
        onPress={onPress} 
        testID="button"
      />
    );
    
    // Assert
    const button = getByTestId('button');
    const buttonStyle = button.props.style;
    
    // Check if the primary button style is applied (backgroundColor should be '#007AFF')
    expect(buttonStyle.some((style: any) => style && style.backgroundColor === '#007AFF')).toBe(true);
  });

  it('should apply secondary button style when variant is secondary', () => {
    // Arrange
    const onPress = jest.fn();
    
    // Act
    const { getByTestId } = render(
      <FormButton 
        title="Submit" 
        onPress={onPress} 
        variant="secondary"
        testID="button"
      />
    );
    
    // Assert
    const button = getByTestId('button');
    const buttonStyle = button.props.style;
    
    // Check if the secondary button style is applied (backgroundColor should be '#5AC8FA')
    expect(buttonStyle.some((style: any) => style && style.backgroundColor === '#5AC8FA')).toBe(true);
  });

  it('should apply outline button style when variant is outline', () => {
    // Arrange
    const onPress = jest.fn();
    
    // Act
    const { getByTestId } = render(
      <FormButton 
        title="Submit" 
        onPress={onPress} 
        variant="outline"
        testID="button"
      />
    );
    
    // Assert
    const button = getByTestId('button');
    const buttonStyle = button.props.style;
    
    // Check if the outline button style is applied (backgroundColor should be 'transparent')
    expect(buttonStyle.some((style: any) => style && style.backgroundColor === 'transparent')).toBe(true);
    expect(buttonStyle.some((style: any) => style && style.borderWidth === 1)).toBe(true);
    expect(buttonStyle.some((style: any) => style && style.borderColor === '#007AFF')).toBe(true);
  });

  it('should apply disabled style when disabled', () => {
    // Arrange
    const onPress = jest.fn();
    
    // Act
    const { getByTestId } = render(
      <FormButton 
        title="Submit" 
        onPress={onPress} 
        disabled={true}
        testID="button"
      />
    );
    
    // Assert
    const button = getByTestId('button');
    const buttonStyle = button.props.style;
    
    // Check if the disabled style is applied (backgroundColor should be '#E5E5EA')
    expect(buttonStyle.some((style: any) => style && style.backgroundColor === '#E5E5EA')).toBe(true);
  });

  it('should apply custom style when provided', () => {
    // Arrange
    const onPress = jest.fn();
    const customStyle = { marginTop: 20, width: '50%' };
    
    // Act
    const { getByTestId } = render(
      <FormButton 
        title="Submit" 
        onPress={onPress} 
        style={customStyle}
        testID="button"
      />
    );
    
    // Assert
    const button = getByTestId('button');
    const buttonStyle = button.props.style;
    
    // Check if the custom style is applied
    expect(buttonStyle.some((style: any) => style && style.marginTop === 20)).toBe(true);
    expect(buttonStyle.some((style: any) => style && style.width === '50%')).toBe(true);
  });
});