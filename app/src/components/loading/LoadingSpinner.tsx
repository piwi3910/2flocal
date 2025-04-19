import React, { useEffect } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';
import { useAppTheme } from '../../theme/ThemeProvider';

interface LoadingSpinnerProps {
  size?: number;
  color?: string;
  style?: ViewStyle;
  thickness?: number;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 40,
  color,
  style,
  thickness = 3,
}) => {
  const { theme } = useAppTheme();
  const spinnerColor = color || theme.colors.primary;
  const rotation = useSharedValue(0);

  useEffect(() => {
    // Continuous rotation animation
    rotation.value = withRepeat(
      withTiming(360, {
        duration: 1000,
        easing: Easing.linear,
      }),
      -1, // Infinite repeat
      false // Don't reverse
    );

    return () => {
      // Cleanup animation
      cancelAnimation(rotation);
    };
  }, [rotation]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotateZ: `${rotation.value}deg` }],
    };
  });

  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      <Animated.View
        style={[
          styles.spinner,
          {
            width: size,
            height: size,
            borderColor: spinnerColor,
            borderWidth: thickness,
          },
          animatedStyle,
        ]}
      />
    </View>
  );
};

interface LoadingOverlayProps {
  visible: boolean;
  backgroundColor?: string;
  spinnerColor?: string;
  spinnerSize?: number;
  style?: ViewStyle;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  visible,
  backgroundColor,
  spinnerColor,
  spinnerSize = 50,
  style,
}) => {
  const { theme } = useAppTheme();
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(visible ? 1 : 0, {
      duration: 200,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
  }, [visible, opacity]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      // Hide the view completely when opacity is 0
      display: opacity.value === 0 ? 'none' : 'flex',
    };
  });

  const bgColor = backgroundColor || 
    (theme.dark ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)');

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.overlay,
        { backgroundColor: bgColor },
        animatedStyle,
        style,
      ]}
    >
      <LoadingSpinner size={spinnerSize} color={spinnerColor} />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinner: {
    borderRadius: 999,
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
});