import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import SearchBar from '../SearchBar';

describe('SearchBar', () => {
  it('should render correctly with default placeholder', () => {
    // Arrange
    const onSearch = jest.fn();
    
    // Act
    const { getByPlaceholderText } = render(
      <SearchBar onSearch={onSearch} />
    );

    // Assert
    expect(getByPlaceholderText('Search accounts...')).toBeTruthy();
  });

  it('should render with custom placeholder', () => {
    // Arrange
    const onSearch = jest.fn();
    const customPlaceholder = 'Custom placeholder text';
    
    // Act
    const { getByPlaceholderText } = render(
      <SearchBar onSearch={onSearch} placeholder={customPlaceholder} />
    );

    // Assert
    expect(getByPlaceholderText(customPlaceholder)).toBeTruthy();
  });

  it('should call onSearch when text changes', () => {
    // Arrange
    const onSearch = jest.fn();
    
    // Act
    const { getByPlaceholderText } = render(
      <SearchBar onSearch={onSearch} />
    );

    const input = getByPlaceholderText('Search accounts...');
    fireEvent.changeText(input, 'test query');

    // Assert
    expect(onSearch).toHaveBeenCalledWith('test query');
  });

  it('should show clear button when text is entered', () => {
    // Arrange
    const onSearch = jest.fn();
    
    // Act
    const { getByPlaceholderText, queryByText } = render(
      <SearchBar onSearch={onSearch} />
    );

    // Initially, clear button should not be visible
    expect(queryByText('✕')).toBeNull();

    // Enter text
    const input = getByPlaceholderText('Search accounts...');
    fireEvent.changeText(input, 'test query');

    // Now clear button should be visible
    expect(queryByText('✕')).toBeTruthy();
  });

  it('should clear text and call onSearch with empty string when clear button is pressed', () => {
    // Arrange
    const onSearch = jest.fn();
    
    // Act
    const { getByPlaceholderText, getByText } = render(
      <SearchBar onSearch={onSearch} />
    );

    // Enter text
    const input = getByPlaceholderText('Search accounts...');
    fireEvent.changeText(input, 'test query');
    
    // Clear onSearch mock calls
    onSearch.mockClear();
    
    // Press clear button
    const clearButton = getByText('✕');
    fireEvent.press(clearButton);

    // Assert
    expect(onSearch).toHaveBeenCalledWith('');
    
    // Input should be cleared
    expect(input.props.value).toBe('');
  });
});