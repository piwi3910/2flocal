import React, { useEffect } from 'react';
import { StyleSheet, View, Text, ViewStyle, TextStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { useAppTheme } from '../../theme/ThemeProvider';

type FeedbackType = 'success' | 'error' | 'warning' | 'info';

interface FormFeedbackProps {
  visible: boolean;
  type?: FeedbackType;
  message: string;
  duration?: number;
  onHide?: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const FormFeedback: React.FC<FormFeedbackProps> = ({
  visible,
  type = 'success',
  message,
  duration = 3000,
  onHide,
  style,
  textStyle,
  icon,
}) => {
  const { theme } = useAppTheme();
  const translateY = useSharedValue(-20);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.9);

  // Get color based on feedback type
  const getBackgroundColor = () => {
    switch (type) {
      case 'error':
        return theme.colors.errorContainer;
      case 'warning':
        return theme.colors.warningContainer;
      case 'info':
        return theme.colors.infoContainer;
      case 'success':
      default:
        return theme.colors.successContainer;
    }
  };

  // Get text color based on feedback type
  const getTextColor = () => {
    switch (type) {
      case 'error':
        return theme.colors.onErrorContainer;
      case 'warning':
        return theme.colors.onWarningContainer;
      case 'info':
        return theme.colors.onInfoContainer;
      case 'success':
      default:
        return theme.colors.onSuccessContainer;
    }
  };

  // Show/hide animation based on visible prop
  useEffect(() => {
    // Handle hiding the feedback
    const handleHide = () => {
      if (onHide) {
        onHide();
      }
    };
    
    if (visible) {
      // Show animation
      translateY.value = withTiming(0, {
        duration: 300,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });
      opacity.value = withTiming(1, {
        duration: 300,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });
      scale.value = withTiming(1, {
        duration: 300,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });

      // Auto-hide after duration
      if (duration > 0) {
        opacity.value = withDelay(
          duration,
          withTiming(0, {
            duration: 300,
            easing: Easing.bezier(0.25, 0.1, 0.25, 1),
          }, () => {
            runOnJS(handleHide)();
            return true;
          })
        );
        translateY.value = withDelay(
          duration,
          withTiming(-20, {
            duration: 300,
            easing: Easing.bezier(0.25, 0.1, 0.25, 1),
          })
        );
        scale.value = withDelay(
          duration,
          withTiming(0.9, {
            duration: 300,
            easing: Easing.bezier(0.25, 0.1, 0.25, 1),
          })
        );
      }
    } else {
      // Hide animation
      translateY.value = withTiming(-20, {
        duration: 300,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });
      opacity.value = withTiming(0, {
        duration: 300,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });
      scale.value = withTiming(0.9, {
        duration: 300,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });
    }
  }, [visible, duration, translateY, opacity, scale, onHide]);

  // Animated styles
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: translateY.value },
        { scale: scale.value },
      ],
      opacity: opacity.value,
    };
  });

  // If not visible and opacity is 0, don't render
  if (!visible && opacity.value === 0) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: getBackgroundColor(),
        },
        animatedStyle,
        style,
      ]}
    >
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      <Text
        style={[
          styles.message,
          {
            color: getTextColor(),
          },
          textStyle,
        ]}
      >
        {message}
      </Text>
    </Animated.View>
  );
};

// Success feedback with default success message
export const SuccessFeedback: React.FC<Omit<FormFeedbackProps, 'type'>> = ({
  message = "Operation completed successfully",
  ...props
}) => (
  <FormFeedback type="success" message={message} {...props} />
);

// Error feedback with default error message
export const ErrorFeedback: React.FC<Omit<FormFeedbackProps, 'type'>> = ({
  message = "An error occurred",
  ...props
}) => (
  <FormFeedback type="error" message={message} {...props} />
);

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    marginRight: 12,
  },
  message: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
});