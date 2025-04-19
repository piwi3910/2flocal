import React from 'react';
import { StyleSheet, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { Button as PaperButton } from 'react-native-paper';
import { useAppTheme } from '../../theme/ThemeProvider';

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'outline' | 'text';
export type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps {
  /**
   * Button label text
   */
  label: string;
  
  /**
   * Function to call when button is pressed
   */
  onPress: () => void;
  
  /**
   * Button variant
   * @default 'primary'
   */
  variant?: ButtonVariant;
  
  /**
   * Button size
   * @default 'medium'
   */
  size?: ButtonSize;
  
  /**
   * Whether to show a loading indicator
   * @default false
   */
  loading?: boolean;
  
  /**
   * Whether the button is disabled
   * @default false
   */
  disabled?: boolean;
  
  /**
   * Icon to display on the left of the button text
   */
  icon?: string;
  
  /**
   * Additional styles for the button
   */
  style?: StyleProp<ViewStyle>;
  
  /**
   * Additional styles for the button label
   */
  labelStyle?: StyleProp<TextStyle>;
  
  /**
   * Test ID for testing
   */
  testID?: string;
}

/**
 * A customized button component based on React Native Paper's Button
 */
export const Button: React.FC<ButtonProps> = ({
  label,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  icon,
  style,
  labelStyle,
  testID,
}) => {
  const { theme, isDarkMode } = useAppTheme();
  
  // Determine button mode based on variant
  const getMode = (): 'text' | 'outlined' | 'contained' | 'contained-tonal' | 'elevated' => {
    switch (variant) {
      case 'primary':
        return 'contained';
      case 'secondary':
        return 'contained-tonal';
      case 'tertiary':
        return 'elevated';
      case 'outline':
        return 'outlined';
      case 'text':
        return 'text';
      default:
        return 'contained';
    }
  };
  
  // Determine button color based on variant
  const getButtonColor = () => {
    switch (variant) {
      case 'primary':
        return theme.colors.primary;
      case 'secondary':
        return theme.colors.secondary;
      case 'tertiary':
        return theme.colors.tertiary;
      case 'outline':
      case 'text':
        return 'transparent';
      default:
        return theme.colors.primary;
    }
  };
  
  // Determine text color based on variant
  const getTextColor = () => {
    switch (variant) {
      case 'primary':
        return theme.colors.onPrimary;
      case 'secondary':
        return theme.colors.onSecondary;
      case 'tertiary':
        return theme.colors.onTertiary;
      case 'outline':
      case 'text':
        return isDarkMode ? theme.colors.primary : theme.colors.primary;
      default:
        return theme.colors.onPrimary;
    }
  };
  
  // Determine button size styles
  const getSizeStyles = (): StyleProp<ViewStyle> => {
    switch (size) {
      case 'small':
        return styles.smallButton;
      case 'medium':
        return styles.mediumButton;
      case 'large':
        return styles.largeButton;
      default:
        return styles.mediumButton;
    }
  };
  
  // Determine label size styles
  const getLabelSizeStyles = (): StyleProp<TextStyle> => {
    switch (size) {
      case 'small':
        return styles.smallLabel;
      case 'medium':
        return styles.mediumLabel;
      case 'large':
        return styles.largeLabel;
      default:
        return styles.mediumLabel;
    }
  };
  
  return (
    <PaperButton
      mode={getMode()}
      onPress={onPress}
      loading={loading}
      disabled={disabled}
      icon={icon}
      style={[getSizeStyles(), { backgroundColor: getButtonColor() }, style]}
      labelStyle={[getLabelSizeStyles(), { color: getTextColor() }, labelStyle]}
      testID={testID}
    >
      {label}
    </PaperButton>
  );
};

const styles = StyleSheet.create({
  smallButton: {
    borderRadius: 4,
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  mediumButton: {
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 16,
  },
  largeButton: {
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 24,
  },
  smallLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  mediumLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  largeLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default Button;