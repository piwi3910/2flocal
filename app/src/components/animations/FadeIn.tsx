import React, { useEffect } from 'react';
import { ViewProps } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';

interface FadeInProps extends ViewProps {
  duration?: number;
  delay?: number;
  children: React.ReactNode;
}

export const FadeIn: React.FC<FadeInProps> = ({
  children,
  duration = 300,
  delay = 0,
  style,
  ...props
}) => {
  const opacity = useSharedValue(0);

  useEffect(() => {
    const timerId = setTimeout(() => {
      opacity.value = withTiming(1, {
        duration,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });
    }, delay);

    return () => clearTimeout(timerId);
  }, [opacity, duration, delay]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  return (
    <Animated.View style={[animatedStyle, style]} {...props}>
      {children}
    </Animated.View>
  );
};