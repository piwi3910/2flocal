import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { useForm, Controller } from 'react-hook-form';
import FormInput from '../FormInput';

// Mock react-hook-form
jest.mock('react-hook-form', () => ({
  useForm: jest.fn(),
  Controller: ({ render, ...props }: any) => (
    <>{render({ field: { onChange: jest.fn(), onBlur: jest.fn(), value: '' } })}</>
  ),
}));

// Create a wrapper component to provide the form context
const FormInputWrapper = ({ name, label, error, ...props }: any) => {
  return (
    <FormInput
      name={name}
      label={label}
      control={{} as any}
      error={error}
      {...props}
    />
  );
};

describe('FormInput', () => {
  it('should render correctly with label', () => {
    // Arrange & Act
    const { getByText } = render(
      <FormInputWrapper name="email" label="Email Address" />
    );

    // Assert
    expect(getByText('Email Address')).toBeTruthy();
  });

  it('should render with placeholder', () => {
    // Arrange & Act
    const { getByPlaceholderText } = render(
      <FormInputWrapper
        name="email"
        label="Email"
        placeholder="Enter your email"
      />
    );

    // Assert
    expect(getByPlaceholderText('Enter your email')).toBeTruthy();
  });

  it('should display error message when provided', () => {
    // Arrange & Act
    const { getByText } = render(
      <FormInputWrapper
        name="email"
        label="Email"
        error={{ message: 'Email is required' }}
      />
    );

    // Assert
    expect(getByText('Email is required')).toBeTruthy();
  });

  it('should apply error styles when error is provided', () => {
    // Arrange & Act
    const { getByTestId } = render(
      <FormInputWrapper
        name="email"
        label="Email"
        error={{ message: 'Email is required' }}
        testID="input"
      />
    );

    // Assert
    const input = getByTestId('input');
    const inputStyle = input.props.style;
    
    // Check if the error style is applied (borderColor should be '#ff3b30')
    expect(inputStyle.some((style: any) => style && style.borderColor === '#ff3b30')).toBe(true);
  });

  it('should set secureTextEntry when specified', () => {
    // Arrange & Act
    const { getByTestId } = render(
      <FormInputWrapper
        name="password"
        label="Password"
        secureTextEntry={true}
        testID="input"
      />
    );

    // Assert
    const input = getByTestId('input');
    expect(input.props.secureTextEntry).toBe(true);
  });

  it('should pass additional props to TextInput', () => {
    // Arrange & Act
    const { getByTestId } = render(
      <FormInputWrapper
        name="email"
        label="Email"
        testID="input"
        autoCapitalize="none"
        keyboardType="email-address"
        autoComplete="email"
      />
    );

    // Assert
    const input = getByTestId('input');
    expect(input.props.autoCapitalize).toBe('none');
    expect(input.props.keyboardType).toBe('email-address');
    expect(input.props.autoComplete).toBe('email');
  });
});