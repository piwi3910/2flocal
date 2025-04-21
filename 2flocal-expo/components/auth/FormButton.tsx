import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  TouchableOpacityProps, 
  View 
} from 'react-native';

interface FormButtonProps extends TouchableOpacityProps {
  title: string;
  isLoading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
  fullWidth?: boolean;
}

const FormButton: React.FC<FormButtonProps> = ({
  title,
  isLoading = false,
  variant = 'primary',
  fullWidth = true,
  style,
  disabled,
  ...rest
}) => {
  // Determine button styles based on variant
  const getButtonStyle = () => {
    switch (variant) {
      case 'secondary':
        return styles.secondaryButton;
      case 'outline':
        return styles.outlineButton;
      case 'primary':
      default:
        return styles.primaryButton;
    }
  };

  // Determine text styles based on variant
  const getTextStyle = () => {
    switch (variant) {
      case 'secondary':
        return styles.secondaryButtonText;
      case 'outline':
        return styles.outlineButtonText;
      case 'primary':
      default:
        return styles.primaryButtonText;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        getButtonStyle(),
        fullWidth && styles.fullWidth,
        disabled && styles.disabledButton,
        style,
      ]}
      disabled={disabled || isLoading}
      activeOpacity={0.7}
      {...rest}
    >
      {isLoading ? (
        <ActivityIndicator 
          size="small" 
          color={variant === 'outline' ? '#0066CC' : '#FFFFFF'} 
        />
      ) : (
        <Text 
          style={[
            styles.buttonText, 
            getTextStyle(),
            disabled && styles.disabledButtonText
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginVertical: 8,
  },
  fullWidth: {
    width: '100%',
  },
  primaryButton: {
    backgroundColor: '#0066CC',
  },
  secondaryButton: {
    backgroundColor: '#6c757d',
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#0066CC',
  },
  disabledButton: {
    backgroundColor: '#cccccc',
    borderColor: '#cccccc',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  primaryButtonText: {
    color: '#FFFFFF',
  },
  secondaryButtonText: {
    color: '#FFFFFF',
  },
  outlineButtonText: {
    color: '#0066CC',
  },
  disabledButtonText: {
    color: '#999999',
  },
});

export default FormButton;