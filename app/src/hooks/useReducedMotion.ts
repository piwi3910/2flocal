import { useEffect, useState } from 'react';
import { AccessibilityInfo, Platform } from 'react-native';

/**
 * Hook to detect if the user has enabled reduced motion preferences
 * @returns {boolean} True if reduced motion is enabled
 */
export const useReducedMotion = (): boolean => {
  const [isReducedMotionEnabled, setIsReducedMotionEnabled] = useState<boolean>(false);

  useEffect(() => {
    // Check initial state
    const checkReducedMotion = async () => {
      try {
        const isEnabled = await AccessibilityInfo.isReduceMotionEnabled();
        setIsReducedMotionEnabled(isEnabled);
      } catch (error) {
        console.error('Error checking reduced motion:', error);
        // Default to false if there's an error
        setIsReducedMotionEnabled(false);
      }
    };

    checkReducedMotion();

    // Set up event listener for changes
    const reduceMotionChangeListener = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      (isEnabled) => {
        setIsReducedMotionEnabled(isEnabled);
      }
    );

    // Clean up event listener
    return () => {
      if (Platform.OS !== 'web') {
        // Remove event listener (not needed for web)
        reduceMotionChangeListener.remove();
      }
    };
  }, []);

  return isReducedMotionEnabled;
};