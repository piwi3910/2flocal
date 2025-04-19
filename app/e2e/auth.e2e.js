const { generateTestUser, login, registerUser, logout } = require('./utils/testUtils');

describe('Authentication Flow', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should register a new user successfully', async () => {
    const testUser = generateTestUser();
    
    // Navigate to registration screen
    await element(by.text('Sign Up')).tap();
    
    // Fill in registration form
    await element(by.id('name-input')).typeText(testUser.name);
    await element(by.id('email-input')).typeText(testUser.email);
    await element(by.id('password-input')).typeText(testUser.password);
    await element(by.id('confirm-password-input')).typeText(testUser.password);
    
    // Submit form
    await element(by.id('register-button')).tap();
    
    // Verify success message
    await expect(element(by.text('Registration successful'))).toBeVisible();
    await expect(element(by.text('Please check your email for verification'))).toBeVisible();
  });

  it('should show error message with invalid registration data', async () => {
    // Navigate to registration screen
    await element(by.text('Sign Up')).tap();
    
    // Fill in registration form with invalid data (short password)
    await element(by.id('name-input')).typeText('Test User');
    await element(by.id('email-input')).typeText('test@example.com');
    await element(by.id('password-input')).typeText('pass');
    await element(by.id('confirm-password-input')).typeText('pass');
    
    // Submit form
    await element(by.id('register-button')).tap();
    
    // Verify error message
    await expect(element(by.text('Password must be at least 8 characters'))).toBeVisible();
  });

  it('should login successfully with valid credentials', async () => {
    // We'll use a pre-registered user for this test
    const testUser = {
      email: 'test@example.com',
      password: 'Password123!'
    };
    
    // Fill in login form
    await element(by.id('email-input')).typeText(testUser.email);
    await element(by.id('password-input')).typeText(testUser.password);
    
    // Submit form
    await element(by.id('login-button')).tap();
    
    // Verify successful login (user is on the TOTP list screen)
    await expect(element(by.text('TOTP Codes'))).toBeVisible();
  });

  it('should show error message with invalid credentials', async () => {
    // Fill in login form with invalid credentials
    await element(by.id('email-input')).typeText('test@example.com');
    await element(by.id('password-input')).typeText('WrongPassword123!');
    
    // Submit form
    await element(by.id('login-button')).tap();
    
    // Verify error message
    await expect(element(by.text('Invalid credentials'))).toBeVisible();
  });

  it('should navigate to forgot password screen', async () => {
    // Navigate to forgot password screen
    await element(by.text('Forgot Password?')).tap();
    
    // Verify we're on the forgot password screen
    await expect(element(by.text('Reset Password'))).toBeVisible();
    
    // Fill in email
    await element(by.id('email-input')).typeText('test@example.com');
    
    // Submit form
    await element(by.id('reset-button')).tap();
    
    // Verify success message
    await expect(element(by.text('Password reset email sent'))).toBeVisible();
  });

  it('should logout successfully', async () => {
    // Login first
    const testUser = {
      email: 'test@example.com',
      password: 'Password123!'
    };
    
    await login(testUser.email, testUser.password);
    
    // Wait for the main app to load
    await expect(element(by.text('TOTP Codes'))).toBeVisible();
    
    // Navigate to settings
    await element(by.id('settings-tab')).tap();
    
    // Logout
    await element(by.id('logout-button')).tap();
    
    // Verify user is logged out (back on login screen)
    await expect(element(by.text('Sign in to your account'))).toBeVisible();
  });

  it('should handle email verification flow', async () => {
    // This test simulates the email verification flow
    // In a real test, we would need to intercept the email and extract the verification link
    // For this example, we'll just verify the UI flow
    
    // Register a new user
    const testUser = generateTestUser();
    await registerUser(testUser.name, testUser.email, testUser.password);
    
    // Verify we're on the email verification screen
    await expect(element(by.text('Verify Your Email'))).toBeVisible();
    
    // Test resend verification email
    await element(by.id('resend-button')).tap();
    await expect(element(by.text('Verification email sent'))).toBeVisible();
  });
});