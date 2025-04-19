import React, { useState } from 'react';
import { StyleSheet, StyleProp, ViewStyle, TextStyle, View } from 'react-native';
import { TextInput as PaperTextInput, HelperText } from 'react-native-paper';
import { useAppTheme } from '../../theme/ThemeProvider';

export type InputVariant = 'default' | 'outlined' | 'flat';
export type InputSize = 'small' | 'medium' | 'large';

interface TextInputProps {
  /**
   * Input label
   */
  label: string;
  
  /**
   * Current value of the input
   */
  value: string;
  
  /**
   * Function to call when input value changes
   */
  onChangeText: (text: string) => void;
  
  /**
   * Input variant
   * @default 'outlined'
   */
  variant?: InputVariant;
  
  /**
   * Input size
   * @default 'medium'
   */
  size?: InputSize;
  
  /**
   * Placeholder text when input is empty
   */
  placeholder?: string;
  
  /**
   * Whether the input is disabled
   * @default false
   */
  disabled?: boolean;
  
  /**
   * Whether the input is in error state
   * @default false
   */
  error?: boolean;
  
  /**
   * Error message to display
   */
  errorMessage?: string;
  
  /**
   * Helper text to display below the input
   */
  helperText?: string;
  
  /**
   * Left icon name
   */
  leftIcon?: string;
  
  /**
   * Right icon name
   */
  rightIcon?: string;
  
  /**
   * Function to call when right icon is pressed
   */
  onRightIconPress?: () => void;
  
  /**
   * Whether the input is for password entry
   * @default false
   */
  secureTextEntry?: boolean;
  
  /**
   * Keyboard type
   * @default 'default'
   */
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad' | 'number-pad';
  
  /**
   * Auto capitalize behavior
   * @default 'sentences'
   */
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  
  /**
   * Auto correct behavior
   * @default true
   */
  autoCorrect?: boolean;
  
  /**
   * Maximum length of input
   */
  maxLength?: number;
  
  /**
   * Additional styles for the input container
   */
  style?: StyleProp<ViewStyle>;
  
  /**
   * Additional styles for the input
   */
  inputStyle?: StyleProp<TextStyle>;
  
  /**
   * Test ID for testing
   */
  testID?: string;
}

/**
 * A customized text input component based on React Native Paper's TextInput
 */
export const TextInput: React.FC<TextInputProps> = ({
  label,
  value,
  onChangeText,
  variant = 'outlined',
  size = 'medium',
  placeholder,
  disabled = false,
  error = false,
  errorMessage,
  helperText,
  leftIcon,
  rightIcon,
  onRightIconPress,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  autoCorrect = true,
  maxLength,
  style,
  inputStyle,
  testID,
}) => {
  const { theme } = useAppTheme();
  const [secureText, setSecureText] = useState(secureTextEntry);
  
  // Determine input mode based on variant
  const getMode = (): 'outlined' | 'flat' => {
    switch (variant) {
      case 'outlined':
        return 'outlined';
      case 'flat':
        return 'flat';
      case 'default':
      default:
        return 'outlined';
    }
  };
  
  // Determine input size styles
  const getSizeStyles = (): StyleProp<ViewStyle> => {
    switch (size) {
      case 'small':
        return styles.smallInput;
      case 'medium':
        return styles.mediumInput;
      case 'large':
        return styles.largeInput;
      default:
        return styles.mediumInput;
    }
  };
  
  // Handle right icon for password visibility toggle
  const getRightIcon = () => {
    if (secureTextEntry) {
      return secureText ? 'eye-off' : 'eye';
    }
    return rightIcon;
  };
  
  // Handle right icon press for password visibility toggle
  const handleRightIconPress = () => {
    if (secureTextEntry) {
      setSecureText(!secureText);
    } else if (onRightIconPress) {
      onRightIconPress();
    }
  };
  
  return (
    <View style={[styles.container, style]}>
      <PaperTextInput
        label={label}
        value={value}
        onChangeText={onChangeText}
        mode={getMode()}
        placeholder={placeholder}
        disabled={disabled}
        error={error}
        left={leftIcon ? <PaperTextInput.Icon icon={leftIcon} /> : undefined}
        right={
          getRightIcon() ? (
            <PaperTextInput.Icon 
              icon={getRightIcon() as string} 
              onPress={handleRightIconPress}
            />
          ) : undefined
        }
        secureTextEntry={secureText}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoCorrect={autoCorrect}
        maxLength={maxLength}
        style={[getSizeStyles(), inputStyle]}
        testID={testID}
        theme={theme}
      />
      
      {(error && errorMessage) && (
        <HelperText type="error" visible={error}>
          {errorMessage}
        </HelperText>
      )}
      
      {(!error && helperText) && (
        <HelperText type="info" visible={!!helperText}>
          {helperText}
        </HelperText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  smallInput: {
    height: 40,
    fontSize: 12,
  },
  mediumInput: {
    height: 50,
    fontSize: 14,
  },
  largeInput: {
    height: 60,
    fontSize: 16,
  },
});

export default TextInput;