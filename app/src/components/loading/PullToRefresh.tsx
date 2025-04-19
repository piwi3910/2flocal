import React, { useCallback } from 'react';
import { StyleSheet, RefreshControl, ScrollView, ScrollViewProps } from 'react-native';
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useAppTheme } from '../../theme/ThemeProvider';

// Create an animated version of ScrollView
const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

interface PullToRefreshProps extends ScrollViewProps {
  refreshing: boolean;
  onRefresh: () => void;
  pullDistance?: number;
  refreshColor?: string;
  backgroundColor?: string;
  progressBackgroundColor?: string;
  children: React.ReactNode;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  refreshing,
  onRefresh,
  pullDistance = 60,
  refreshColor,
  backgroundColor,
  progressBackgroundColor,
  children,
  style,
  ...props
}) => {
  const { theme } = useAppTheme();
  const scrollY = useSharedValue(0);
  const refreshIndicatorScale = useSharedValue(0);

  // Colors with defaults from theme
  const bgColor = backgroundColor || theme.colors.background;
  const progressBgColor = progressBackgroundColor ||
    (theme.dark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)');

  // Handle scroll events
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
      
      // Calculate refresh indicator scale based on pull distance
      if (event.contentOffset.y < 0) {
        // Map the pull distance to a scale value between 0 and 1
        const pullRatio = Math.min(Math.abs(event.contentOffset.y) / pullDistance, 1);
        refreshIndicatorScale.value = pullRatio;
      } else {
        refreshIndicatorScale.value = 0;
      }
    },
    onBeginDrag: () => {},
    onEndDrag: () => {
      // Animate the scale back to 0 when drag ends
      refreshIndicatorScale.value = withTiming(0, {
        duration: 300,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });
    },
  });

  // Create the refresh control component
  const renderRefreshControl = useCallback(() => {
    // Define colors inside the callback to avoid dependency issues
    const refreshColors = refreshColor ? [refreshColor] : [theme.colors.primary];
    
    return (
      <RefreshControl
        refreshing={refreshing}
        onRefresh={onRefresh}
        colors={refreshColors}
        progressBackgroundColor={progressBgColor}
        tintColor={refreshColors[0]}
      />
    );
  }, [refreshing, onRefresh, refreshColor, progressBgColor, theme.colors.primary]);

  return (
    <AnimatedScrollView
      style={[styles.container, { backgroundColor: bgColor }, style]}
      scrollEventThrottle={16}
      onScroll={scrollHandler}
      refreshControl={renderRefreshControl()}
      showsVerticalScrollIndicator={false}
      {...props}
    >
      {children}
    </AnimatedScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});