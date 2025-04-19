// Import fetch mock
import fetchMock from 'jest-fetch-mock';

fetchMock.enableMocks();

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  multiRemove: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
  getAllKeys: jest.fn(() => Promise.resolve([])),
  multiGet: jest.fn(() => Promise.resolve([])),
}));

// Mock react-native-keychain
jest.mock('react-native-keychain', () => ({
  setGenericPassword: jest.fn(() => Promise.resolve(true)),
  getGenericPassword: jest.fn(() => Promise.resolve(null)),
  resetGenericPassword: jest.fn(() => Promise.resolve(true)),
}));

// Mock react-native-biometrics
jest.mock('react-native-biometrics', () => ({
  BiometryTypes: {
    TouchID: 'TouchID',
    FaceID: 'FaceID',
    Biometrics: 'Biometrics',
  },
  default: jest.fn().mockImplementation(() => ({
    isSensorAvailable: jest.fn(() => Promise.resolve({ available: false })),
    simplePrompt: jest.fn(() => Promise.resolve({ success: false })),
    createKeys: jest.fn(() => Promise.resolve({ publicKey: 'mock-public-key' })),
    deleteKeys: jest.fn(() => Promise.resolve({ keysDeleted: true })),
    biometricKeysExist: jest.fn(() => Promise.resolve({ keysExist: false })),
    createSignature: jest.fn(() => Promise.resolve({ success: false, signature: null })),
  })),
}));

// Mock react-native-camera
jest.mock('react-native-camera', () => ({
  RNCamera: {
    Constants: {
      Type: {
        back: 'back',
        front: 'front',
      },
      FlashMode: {
        off: 'off',
        on: 'on',
        auto: 'auto',
      },
    },
  },
}));

// Mock navigation
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    setOptions: jest.fn(),
  }),
  useRoute: () => ({
    params: {},
  }),
  useIsFocused: () => true,
}));

// Mock stack navigation
jest.mock('@react-navigation/stack', () => ({
  createStackNavigator: jest.fn(() => ({
    Navigator: 'Navigator',
    Screen: 'Screen',
  })),
}));

// Mock bottom tabs navigation
jest.mock('@react-navigation/bottom-tabs', () => ({
  createBottomTabNavigator: jest.fn(() => ({
    Navigator: 'Navigator',
    Screen: 'Screen',
  })),
}));

// Silence the warning: Animated: `useNativeDriver` is not supported
// Use a more generic approach that doesn't rely on specific file paths
jest.mock('react-native', () => {
  const rn = jest.requireActual('react-native');
  rn.NativeModules.StatusBarManager = { getHeight: jest.fn() };
  rn.NativeAnimatedHelper = { 
    shouldUseNativeDriver: () => false 
  };
  rn.Alert.alert = jest.fn();
  return rn;
});

// Mock console.error to keep test output clean
const originalConsoleError = console.error;
console.error = (...args) => {
  // Filter out specific React Native warnings that are expected during tests
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('Warning: ') || 
     args[0].includes('React does not recognize the') ||
     args[0].includes('The above error occurred in the'))
  ) {
    return;
  }
  originalConsoleError(...args);
};