import React, { useEffect } from 'react';
import { ViewProps } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';

interface ScaleProps extends ViewProps {
  initialScale?: number;
  finalScale?: number;
  duration?: number;
  delay?: number;
  children: React.ReactNode;
}

export const Scale: React.FC<ScaleProps> = ({
  children,
  initialScale = 0,
  finalScale = 1,
  duration = 300,
  delay = 0,
  style,
  ...props
}) => {
  const scale = useSharedValue(initialScale);
  const opacity = useSharedValue(initialScale === 0 ? 0 : 1);

  useEffect(() => {
    const timerId = setTimeout(() => {
      scale.value = withTiming(finalScale, {
        duration,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });
      
      // If we're scaling from 0, also animate opacity
      if (initialScale === 0) {
        opacity.value = withTiming(1, {
          duration,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        });
      }
      // If we're scaling to 0, also animate opacity
      else if (finalScale === 0) {
        opacity.value = withTiming(0, {
          duration,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        });
      }
    }, delay);

    return () => clearTimeout(timerId);
  }, [scale, opacity, initialScale, finalScale, duration, delay]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  return (
    <Animated.View style={[animatedStyle, style]} {...props}>
      {children}
    </Animated.View>
  );
};