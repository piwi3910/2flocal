import {
  TransitionPresets,
} from '@react-navigation/stack';

// Use predefined transitions from React Navigation
export const fadeTransition = TransitionPresets.FadeFromBottomAndroid;
export const slideTransition = TransitionPresets.SlideFromRightIOS;
export const modalTransition = TransitionPresets.ModalSlideFromBottomIOS;
export const fadeFromCenterTransition = TransitionPresets.DefaultTransition;

// Custom transitions for specific screens
export const getTransitionForRoute = (routeName: string) => {
  switch (routeName) {
    case 'TOTPDetail':
      return modalTransition;
    case 'ScanQRCode':
      return fadeTransition;
    case 'AddTOTP':
      return fadeFromCenterTransition;
    case 'ThemeSettings':
      return slideTransition;
    case 'Register':
    case 'Login':
      return TransitionPresets.FadeFromBottomAndroid;
    case 'ForgotPassword':
    case 'ResetPassword':
    case 'EmailVerification':
      return slideTransition;
    default:
      return slideTransition;
  }
};

// Tab transition configuration
export const tabTransition = {
  tabBarStyle: {
    elevation: 0,
    shadowOpacity: 0,
    borderTopWidth: 0,
  },
};