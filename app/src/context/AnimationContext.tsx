import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useReducedMotion } from '../hooks/useReducedMotion';

interface AnimationContextType {
  /**
   * Whether animations should be enabled
   */
  animationsEnabled: boolean;
  
  /**
   * Duration multiplier for animations (1.0 is normal speed)
   */
  durationMultiplier: number;
  
  /**
   * Whether to use alternative visual cues instead of animations
   */
  useAlternativeVisualCues: boolean;
  
  /**
   * Set whether animations should be enabled
   */
  setAnimationsEnabled: (enabled: boolean) => void;
  
  /**
   * Set the duration multiplier for animations
   */
  setDurationMultiplier: (multiplier: number) => void;
  
  /**
   * Set whether to use alternative visual cues
   */
  setUseAlternativeVisualCues: (use: boolean) => void;
  
  /**
   * Calculate the actual duration based on preferences
   */
  getAdjustedDuration: (baseDuration: number) => number;
}

const AnimationContext = createContext<AnimationContextType | undefined>(undefined);

interface AnimationProviderProps {
  children: ReactNode;
}

export const AnimationProvider: React.FC<AnimationProviderProps> = ({ children }) => {
  const isReducedMotionEnabled = useReducedMotion();
  
  // State for animation preferences
  const [animationsEnabled, setAnimationsEnabled] = useState<boolean>(true);
  const [durationMultiplier, setDurationMultiplier] = useState<number>(1.0);
  const [useAlternativeVisualCues, setUseAlternativeVisualCues] = useState<boolean>(false);
  
  // Update animation settings when reduced motion preference changes
  useEffect(() => {
    if (isReducedMotionEnabled) {
      // If reduced motion is enabled, disable animations or use shorter durations
      setAnimationsEnabled(false);
      setUseAlternativeVisualCues(true);
    }
  }, [isReducedMotionEnabled]);
  
  // Calculate adjusted duration based on preferences
  const getAdjustedDuration = (baseDuration: number): number => {
    if (!animationsEnabled) {
      return 0; // No animation
    }
    return baseDuration * durationMultiplier;
  };
  
  const value = {
    animationsEnabled,
    durationMultiplier,
    useAlternativeVisualCues,
    setAnimationsEnabled,
    setDurationMultiplier,
    setUseAlternativeVisualCues,
    getAdjustedDuration,
  };
  
  return (
    <AnimationContext.Provider value={value}>
      {children}
    </AnimationContext.Provider>
  );
};

/**
 * Hook to access animation settings
 * @returns Animation context
 */
export const useAnimation = (): AnimationContextType => {
  const context = useContext(AnimationContext);
  
  if (context === undefined) {
    throw new Error('useAnimation must be used within an AnimationProvider');
  }
  
  return context;
};