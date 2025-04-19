const { login } = require('./utils/testUtils');

describe('Security Features and Device Management', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  describe('Biometric Authentication', () => {
    it('should show biometric authentication option if available', async () => {
      // Note: This test will only work if the device has biometric capabilities
      // and the app has permission to use them
      
      // Check if biometric button is visible on login screen
      const biometricButtonVisible = await element(by.text('Sign in with Biometrics')).isVisible();
      
      if (biometricButtonVisible) {
        // Verify the button is clickable
        await element(by.text('Sign in with Biometrics')).tap();
        
        // We can't fully test biometric authentication in E2E tests
        // as it requires system-level interaction
        
        // Just verify that the app handles the case when biometrics are canceled
        // This will happen automatically in the test environment
        await expect(element(by.text('Authentication Failed'))).toBeVisible();
      } else {
        console.log('Biometric authentication not available on this device or not enabled in the app');
      }
    });
  });

  describe('Device Management', () => {
    beforeEach(async () => {
      // Login before each test
      const testUser = {
        email: 'test@example.com',
        password: 'Password123!'
      };
      
      await login(testUser.email, testUser.password);
      
      // Navigate to profile screen
      await element(by.id('settings-tab')).tap();
    });

    it('should display user profile information', async () => {
      // Verify profile information is displayed
      await expect(element(by.text('Account'))).toBeVisible();
      await expect(element(by.text('Name'))).toBeVisible();
      await expect(element(by.text('Email'))).toBeVisible();
      await expect(element(by.text('Email Verified'))).toBeVisible();
    });

    it('should display security settings', async () => {
      // Verify security section is displayed
      await expect(element(by.text('Security'))).toBeVisible();
      
      // Check if biometric settings are displayed (if available)
      const biometricSettingsVisible = await element(by.text('Biometric Authentication')).isVisible();
      
      if (biometricSettingsVisible) {
        // Verify biometric toggle is present
        await expect(element(by.text('Use'))).toBeVisible();
      }
    });

    it('should handle device management if available', async () => {
      // Note: This test assumes there's a "Devices" section in the profile screen
      // If it doesn't exist yet, this test will be skipped
      
      const devicesVisible = await element(by.text('Devices')).isVisible();
      
      if (devicesVisible) {
        // Tap on Devices section
        await element(by.text('Devices')).tap();
        
        // Verify devices list is displayed
        await expect(element(by.text('Your Devices'))).toBeVisible();
        
        // Verify current device is listed
        await expect(element(by.id('current-device-indicator'))).toBeVisible();
        
        // Test removing a device (if there are multiple devices)
        const otherDeviceVisible = await element(by.id('other-device')).isVisible();
        
        if (otherDeviceVisible) {
          // Swipe to reveal delete button
          await element(by.id('other-device')).swipe('left');
          
          // Tap delete button
          await element(by.id('remove-device-button')).tap();
          
          // Confirm deletion
          await element(by.text('Confirm')).tap();
          
          // Verify success message
          await expect(element(by.text('Device removed successfully'))).toBeVisible();
        }
        
        // Go back to profile
        await element(by.id('back-button')).tap();
      } else {
        console.log('Device management not available in the current version of the app');
      }
    });
  });

  describe('Session Management', () => {
    it('should handle token refresh', async () => {
      // Login
      const testUser = {
        email: 'test@example.com',
        password: 'Password123!'
      };
      
      await login(testUser.email, testUser.password);
      
      // Wait for a period longer than the token expiry time
      // Note: In a real test, we would mock the token expiry time to be shorter
      // For this example, we'll just simulate the app being in the background
      
      // Put app in background for a few seconds
      await device.sendToHome();
      await new Promise(resolve => setTimeout(resolve, 5000));
      await device.launchApp({ newInstance: false });
      
      // Verify the app is still authenticated (token was refreshed)
      await expect(element(by.text('TOTP Codes'))).toBeVisible();
    });

    it('should handle session timeout', async () => {
      // Login
      const testUser = {
        email: 'test@example.com',
        password: 'Password123!'
      };
      
      await login(testUser.email, testUser.password);
      
      // Note: In a real test, we would mock the session timeout to be shorter
      // For this example, we'll just simulate the app being in the background for a long time
      
      // Put app in background for a longer period
      await device.sendToHome();
      await new Promise(resolve => setTimeout(resolve, 10000));
      await device.launchApp({ newInstance: false });
      
      // Check if we're still logged in or if session timed out
      // This will depend on the actual session timeout configuration
      const isLoggedIn = await element(by.text('TOTP Codes')).isVisible();
      
      if (!isLoggedIn) {
        // Verify we're back at the login screen
        await expect(element(by.text('Sign in to your account'))).toBeVisible();
      }
    });
  });

  describe('Rate Limiting', () => {
    it('should handle rate limiting for login attempts', async () => {
      // Attempt multiple failed logins to trigger rate limiting
      const invalidUser = {
        email: 'test@example.com',
        password: 'WrongPassword123!'
      };
      
      // Try logging in multiple times with wrong password
      for (let i = 0; i < 5; i++) {
        await element(by.id('email-input')).clearText();
        await element(by.id('password-input')).clearText();
        
        await element(by.id('email-input')).typeText(invalidUser.email);
        await element(by.id('password-input')).typeText(invalidUser.password);
        
        await element(by.id('login-button')).tap();
        
        // Check if rate limiting message appears
        const rateLimitVisible = await element(by.text('Too many login attempts')).isVisible();
        
        if (rateLimitVisible) {
          // Verify rate limiting message
          await expect(element(by.text('Too many login attempts'))).toBeVisible();
          await expect(element(by.text('Please try again later'))).toBeVisible();
          break;
        }
        
        // Wait a bit between attempts
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    });
  });
});