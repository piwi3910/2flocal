import React from 'react';
import {
  StyleSheet,
  TouchableWithoutFeedback,
  ViewStyle,
  TextStyle,
  Text,
  View,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useAppTheme } from '../../theme/ThemeProvider';

interface AnimatedButtonProps {
  onPress?: () => void;
  title: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'outline' | 'text';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  loading?: boolean;
}

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  onPress,
  title,
  style,
  textStyle,
  disabled = false,
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  startIcon,
  endIcon,
  loading = false,
}) => {
  const { theme } = useAppTheme();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  // Handle press animations
  const handlePressIn = () => {
    scale.value = withTiming(0.95, {
      duration: 100,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
    opacity.value = withTiming(0.9, {
      duration: 100,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, {
      duration: 200,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
    opacity.value = withTiming(1, {
      duration: 200,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
  };

  // Get button styles based on variant and size
  const getButtonStyles = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
    };

    // Size styles
    switch (size) {
      case 'small':
        baseStyle.paddingVertical = 8;
        baseStyle.paddingHorizontal = 16;
        break;
      case 'large':
        baseStyle.paddingVertical = 16;
        baseStyle.paddingHorizontal = 24;
        break;
      default: // medium
        baseStyle.paddingVertical = 12;
        baseStyle.paddingHorizontal = 20;
        break;
    }

    // Full width style
    if (fullWidth) {
      baseStyle.width = '100%';
    }

    // Variant styles
    switch (variant) {
      case 'secondary':
        baseStyle.backgroundColor = theme.colors.secondary;
        break;
      case 'outline':
        baseStyle.backgroundColor = 'transparent';
        baseStyle.borderWidth = 1;
        baseStyle.borderColor = theme.colors.primary;
        break;
      case 'text':
        baseStyle.backgroundColor = 'transparent';
        break;
      default: // primary
        baseStyle.backgroundColor = theme.colors.primary;
        break;
    }

    // Disabled style
    if (disabled) {
      baseStyle.opacity = 0.5;
    }

    return baseStyle;
  };

  // Get text styles based on variant and size
  const getTextStyles = (): TextStyle => {
    const baseStyle: TextStyle = {
      fontWeight: '600',
    };

    // Size styles
    switch (size) {
      case 'small':
        baseStyle.fontSize = 14;
        break;
      case 'large':
        baseStyle.fontSize = 18;
        break;
      default: // medium
        baseStyle.fontSize = 16;
        break;
    }

    // Variant styles
    switch (variant) {
      case 'outline':
      case 'text':
        baseStyle.color = theme.colors.primary;
        break;
      default: // primary, secondary
        baseStyle.color = theme.dark ? '#000' : '#fff';
        break;
    }

    return baseStyle;
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  return (
    <TouchableWithoutFeedback
      onPress={disabled || loading ? undefined : onPress}
      onPressIn={disabled || loading ? undefined : handlePressIn}
      onPressOut={disabled || loading ? undefined : handlePressOut}
    >
      <Animated.View
        style={[
          styles.button,
          getButtonStyles(),
          animatedStyle,
          style,
        ]}
      >
        {startIcon && <View style={styles.startIcon}>{startIcon}</View>}
        <Text style={[getTextStyles(), textStyle]}>{title}</Text>
        {endIcon && <View style={styles.endIcon}>{endIcon}</View>}
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  button: {
    minWidth: 80,
  },
  startIcon: {
    marginRight: 8,
  },
  endIcon: {
    marginLeft: 8,
  },
});