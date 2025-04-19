# End-to-End Testing Guidelines for 2FLocal

This document outlines the approach, structure, and best practices for end-to-end (E2E) testing of the 2FLocal application.

## Overview

End-to-end tests verify that the entire application works correctly as a whole, simulating real user interactions across the complete system. These tests ensure that all components of the application work together as expected in real-world scenarios.

## Test Environment Setup

### Prerequisites

- Node.js (v18 or higher)
- Xcode (for iOS testing)
- Android Studio (for Android testing)
- iOS Simulator
- Android Emulator

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Install Detox CLI globally:
   ```bash
   npm install -g detox-cli
   ```

3. Build the app for testing:
   ```bash
   # For iOS
   npm run e2e:build:ios
   
   # For Android
   npm run e2e:build:android
   ```

## Running Tests

### iOS

```bash
# Debug build
npm run e2e:test:ios

# Release build
npm run e2e:test:ios:release
```

### Android

```bash
# Debug build
npm run e2e:test:android

# Release build
npm run e2e:test:android:release
```

### Running Specific Tests

```bash
# Run a specific test file
detox test --configuration ios.debug e2e/auth.e2e.js

# Run tests with a specific tag
detox test --configuration ios.debug --testNamePattern="Authentication Flow"
```

## Test Organization

The E2E tests are organized into the following categories:

1. **Authentication Flow** (`auth.e2e.js`)
   - User registration
   - Email verification
   - User login
   - Password reset
   - Logout

2. **TOTP Management Flow** (`totp.e2e.js`)
   - Adding TOTP accounts manually
   - Adding TOTP accounts via QR code
   - Viewing TOTP codes
   - Deleting TOTP accounts
   - Searching and filtering TOTP accounts

3. **Security Features and Device Management** (`security.e2e.js`)
   - Biometric authentication
   - Device management
   - Session management (token refresh, session timeout)
   - Rate limiting

## Test Utilities

Common test utilities are located in the `e2e/utils` directory:

- `testUtils.js`: Contains helper functions for common operations like login, registration, TOTP management, etc.

## Best Practices

### Writing Effective E2E Tests

1. **Focus on critical user flows**: Prioritize testing the most important user journeys.

2. **Keep tests independent**: Each test should be able to run independently of others.

3. **Use descriptive test names**: Test names should clearly describe what is being tested.

4. **Handle asynchronous operations correctly**: Use `async/await` for all asynchronous operations.

5. **Use test data generators**: Create random test data to avoid conflicts between test runs.

6. **Clean up after tests**: Remove any test data created during the test to avoid affecting subsequent tests.

7. **Test on both platforms**: Ensure tests run on both iOS and Android.

### Element Selection Strategy

For reliable element selection in E2E tests, use the following strategies in order of preference:

1. **Test IDs**: Use `testID` props on components for the most reliable selection.
   ```jsx
   <TextInput testID="email-input" />
   ```

2. **Accessibility Labels**: Use accessibility labels when test IDs are not available.
   ```jsx
   <Button accessibilityLabel="Login Button" />
   ```

3. **Text Content**: Use text content as a last resort.
   ```jsx
   await element(by.text('Login')).tap();
   ```

### Handling Flakiness

E2E tests can sometimes be flaky due to timing issues, animations, or other factors. To minimize flakiness:

1. **Use explicit waits**: Wait for elements to be visible or enabled before interacting with them.
   ```javascript
   await waitFor(element(by.id('email-input'))).toBeVisible().withTimeout(5000);
   ```

2. **Increase timeouts for slow operations**: Some operations may take longer than the default timeout.
   ```javascript
   jest.setTimeout(30000); // Increase test timeout
   ```

3. **Disable animations**: Animations can cause timing issues in tests.
   ```javascript
   // In app setup for testing
   if (process.env.NODE_ENV === 'test') {
     UIManager.setLayoutAnimationEnabledExperimental && 
     UIManager.setLayoutAnimationEnabledExperimental(false);
   }
   ```

4. **Retry mechanisms**: Implement retry mechanisms for particularly flaky operations.
   ```javascript
   async function retryOperation(operation, maxRetries = 3) {
     let lastError;
     for (let i = 0; i < maxRetries; i++) {
       try {
         await operation();
         return;
       } catch (error) {
         lastError = error;
         await new Promise(resolve => setTimeout(resolve, 1000));
       }
     }
     throw lastError;
   }
   ```

## CI Integration

The E2E tests are configured to run in CI environments. The configuration includes:

1. **Test runs on pull requests**: Tests are automatically run when a pull request is created or updated.

2. **Test reporting**: Test results are reported and stored for review.

3. **Environment setup and teardown**: The test environment is automatically set up and torn down for each test run.

## Troubleshooting

### Common Issues

1. **Tests fail with timeout errors**:
   - Increase the timeout for the specific test or globally.
   - Check if the element is actually visible or if there's a condition preventing it from appearing.

2. **Element not found errors**:
   - Verify that the element exists in the app.
   - Check if the element has the correct test ID, accessibility label, or text.
   - Use `await device.takeScreenshot('debug')` to capture the screen state.

3. **Tests pass locally but fail in CI**:
   - CI environments may have different timing characteristics.
   - Ensure tests are not dependent on specific device configurations.
   - Add more explicit waits for CI environments.

## Maintenance

To keep the E2E tests maintainable:

1. **Update tests when the UI changes**: When the UI changes, update the corresponding tests.

2. **Regularly run all tests**: Run the full test suite regularly to catch regressions.

3. **Review and refactor tests**: Periodically review and refactor tests to keep them clean and efficient.

4. **Keep test utilities up to date**: Update test utilities when new features are added or existing ones change.

## Resources

- [Detox Documentation](https://github.com/wix/Detox)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)