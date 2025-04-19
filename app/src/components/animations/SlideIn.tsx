import React, { useEffect } from 'react';
import { ViewProps } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';

type Direction = 'left' | 'right' | 'top' | 'bottom';

interface SlideInProps extends ViewProps {
  direction?: Direction;
  distance?: number;
  duration?: number;
  delay?: number;
  children: React.ReactNode;
}

export const SlideIn: React.FC<SlideInProps> = ({
  children,
  direction = 'left',
  distance = 100,
  duration = 300,
  delay = 0,
  style,
  ...props
}) => {
  const translateX = useSharedValue(direction === 'left' ? -distance : direction === 'right' ? distance : 0);
  const translateY = useSharedValue(direction === 'top' ? -distance : direction === 'bottom' ? distance : 0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    const timerId = setTimeout(() => {
      translateX.value = withTiming(0, {
        duration,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });
      translateY.value = withTiming(0, {
        duration,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });
      opacity.value = withTiming(1, {
        duration,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });
    }, delay);

    return () => clearTimeout(timerId);
  }, [translateX, translateY, opacity, duration, delay, distance]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
      ],
      opacity: opacity.value,
    };
  });

  return (
    <Animated.View style={[animatedStyle, style]} {...props}>
      {children}
    </Animated.View>
  );
};