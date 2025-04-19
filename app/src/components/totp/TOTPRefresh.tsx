import React, { useEffect } from 'react';
import { StyleSheet, ViewProps } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  Easing,
  runOnJS,
} from 'react-native-reanimated';

interface TOTPRefreshProps extends ViewProps {
  isRefreshing: boolean;
  onAnimationComplete?: () => void;
  children: React.ReactNode;
}

export const TOTPRefresh: React.FC<TOTPRefreshProps> = ({
  isRefreshing,
  onAnimationComplete,
  children,
  style,
  ...props
}) => {
  const opacity = useSharedValue(1);
  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);

  useEffect(() => {
    if (isRefreshing) {
      // Define the animation completion handler inside useEffect
      const handleAnimationComplete = () => {
        if (onAnimationComplete) {
          onAnimationComplete();
        }
      };

      // Sequence: fade out while scaling down and moving up, then fade in while scaling up
      opacity.value = withSequence(
        withTiming(0.3, {
          duration: 150,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        }),
        withTiming(1, {
          duration: 300,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        }, () => {
          runOnJS(handleAnimationComplete)();
          return true;
        })
      );

      scale.value = withSequence(
        withTiming(0.95, {
          duration: 150,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        }),
        withTiming(1, {
          duration: 300,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        })
      );

      translateY.value = withSequence(
        withTiming(-5, {
          duration: 150,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        }),
        withTiming(0, {
          duration: 300,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        })
      );
    }
  }, [isRefreshing, opacity, scale, translateY, onAnimationComplete]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [
        { scale: scale.value },
        { translateY: translateY.value },
      ],
    };
  });

  return (
    <Animated.View style={[styles.container, animatedStyle, style]} {...props}>
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
});