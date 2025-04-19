import React, { useEffect } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { useAppTheme } from '../../theme/ThemeProvider';

type SkeletonShape = 'rectangle' | 'circle' | 'text' | 'card';

interface SkeletonLoaderProps {
  width?: number | `${number}%`;
  height?: number | `${number}%`;
  shape?: SkeletonShape;
  borderRadius?: number;
  style?: ViewStyle;
  shimmerEnabled?: boolean;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  width = '100%',
  height = 20,
  shape = 'rectangle',
  borderRadius,
  style,
  shimmerEnabled = true,
}) => {
  const { theme } = useAppTheme();
  const opacity = useSharedValue(0.5);
  
  // Calculate the appropriate border radius based on shape
  const getBorderRadius = () => {
    if (borderRadius !== undefined) return borderRadius;
    
    switch (shape) {
      case 'circle':
        return typeof height === 'number' ? height / 2 : 999;
      case 'text':
        return 4;
      case 'card':
        return 8;
      default:
        return 4;
    }
  };

  // Start shimmer animation
  useEffect(() => {
    if (shimmerEnabled) {
      opacity.value = withRepeat(
        withSequence(
          withTiming(0.8, { duration: 700, easing: Easing.bezier(0.4, 0.0, 0.6, 1) }),
          withTiming(0.5, { duration: 700, easing: Easing.bezier(0.4, 0.0, 0.6, 1) })
        ),
        -1, // Infinite repeat
        true // Reverse
      );
    }
    
    return () => {
      // Cleanup animation
      opacity.value = 0.5;
    };
  }, [opacity, shimmerEnabled]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  const skeletonStyles = [
    styles.skeleton,
    {
      width,
      height,
      borderRadius: getBorderRadius(),
      backgroundColor: theme.dark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
    },
    animatedStyle,
    style,
  ];

  return <Animated.View style={skeletonStyles} />;
};

// Predefined skeleton components for common use cases
export const TextRowSkeleton: React.FC<{ width?: number | `${number}%`, style?: ViewStyle }> = ({
  width = '100%' as `${number}%`,
  style
}) => (
  <SkeletonLoader shape="text" width={width} height={16} style={style} />
);

export const CircleSkeleton: React.FC<{ size?: number, style?: ViewStyle }> = ({
  size = 40,
  style
}) => (
  <SkeletonLoader shape="circle" width={size} height={size} style={style} />
);

export const CardSkeleton: React.FC<{ height?: number, style?: ViewStyle }> = ({
  height = 120,
  style
}) => (
  <SkeletonLoader shape="card" height={height} style={style} />
);

export const TOTPItemSkeleton: React.FC<{ style?: ViewStyle }> = ({ style }) => (
  <View style={[styles.totpItem, style]}>
    <CircleSkeleton size={40} style={styles.totpIcon} />
    <View style={styles.totpContent}>
      <TextRowSkeleton width="60%" />
      <View style={styles.spacer} />
      <TextRowSkeleton width="40%" />
    </View>
  </View>
);

const styles = StyleSheet.create({
  skeleton: {
    marginVertical: 4,
  },
  totpItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginVertical: 4,
    borderRadius: 8,
  },
  totpIcon: {
    marginRight: 12,
  },
  totpContent: {
    flex: 1,
  },
  spacer: {
    height: 8,
  },
});