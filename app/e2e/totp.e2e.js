const { 
  generateTestUser, 
  login, 
  generateTestTOTP, 
  addTOTPManually, 
  deleteTOTP, 
  searchTOTP, 
  clearSearch 
} = require('./utils/testUtils');

describe('TOTP Management Flow', () => {
  beforeAll(async () => {
    await device.launchApp();
    
    // Login before tests
    const testUser = {
      email: 'test@example.com',
      password: 'Password123!'
    };
    
    await login(testUser.email, testUser.password);
    
    // Verify we're logged in
    await expect(element(by.text('TOTP Codes'))).toBeVisible();
  });

  beforeEach(async () => {
    // Ensure we're on the TOTP list screen
    await element(by.id('totp-tab')).tap();
  });

  it('should add a new TOTP account manually', async () => {
    const testTOTP = generateTestTOTP();
    
    // Tap add button
    await element(by.id('add-totp-button')).tap();
    
    // Fill in manual entry form
    await element(by.id('manual-entry-button')).tap();
    await element(by.id('issuer-input')).typeText(testTOTP.issuer);
    await element(by.id('label-input')).typeText(testTOTP.label);
    await element(by.id('secret-input')).typeText(testTOTP.secret);
    
    // Save
    await element(by.id('save-button')).tap();
    
    // Verify new account is added
    await expect(element(by.text(testTOTP.issuer))).toBeVisible();
    await expect(element(by.text(testTOTP.label))).toBeVisible();
  });

  it('should display TOTP code with countdown', async () => {
    // Find the TOTP item we just added
    const testTOTP = generateTestTOTP();
    await element(by.text(testTOTP.issuer)).tap();
    
    // Verify TOTP code is displayed
    await expect(element(by.id('totp-code'))).toBeVisible();
    await expect(element(by.id('countdown-timer'))).toBeVisible();
    
    // Go back to the list
    await element(by.id('back-button')).tap();
  });

  it('should delete a TOTP account', async () => {
    // Add a TOTP account to delete
    const testTOTP = generateTestTOTP();
    await addTOTPManually(testTOTP.issuer, testTOTP.label, testTOTP.secret);
    
    // Verify it was added
    await expect(element(by.text(testTOTP.issuer))).toBeVisible();
    
    // Swipe left on the TOTP item to reveal delete button
    await element(by.text(testTOTP.issuer)).swipe('left');
    
    // Tap delete button
    await element(by.id('delete-button')).tap();
    
    // Confirm deletion
    await element(by.text('Confirm')).tap();
    
    // Verify account is deleted
    await expect(element(by.text(testTOTP.issuer))).not.toBeVisible();
  });

  it('should search for TOTP accounts', async () => {
    // Add multiple accounts for testing search
    const googleTOTP = {
      issuer: 'Google',
      label: 'test@gmail.com',
      secret: 'JBSWY3DPEHPK3PXP'
    };
    
    const facebookTOTP = {
      issuer: 'Facebook',
      label: 'test@facebook.com',
      secret: 'JBSWY3DPEHPK3PXP'
    };
    
    await addTOTPManually(googleTOTP.issuer, googleTOTP.label, googleTOTP.secret);
    await addTOTPManually(facebookTOTP.issuer, facebookTOTP.label, facebookTOTP.secret);
    
    // Search for Google
    await element(by.id('search-input')).typeText('Google');
    
    // Verify only Google account is visible
    await expect(element(by.text('Google'))).toBeVisible();
    await expect(element(by.text('Facebook'))).not.toBeVisible();
    
    // Clear search
    await element(by.id('clear-search-button')).tap();
    
    // Verify all accounts are visible
    await expect(element(by.text('Google'))).toBeVisible();
    await expect(element(by.text('Facebook'))).toBeVisible();
    
    // Clean up - delete the test accounts
    await deleteTOTP('Google');
    await deleteTOTP('Facebook');
  });

  it('should handle QR code scanning', async () => {
    // Note: Actual QR code scanning is difficult to test in E2E tests
    // This test will verify the navigation and UI elements
    
    // Tap scan button
    await element(by.id('scan-qr-button')).tap();
    
    // Verify camera view is visible
    await expect(element(by.id('qr-scanner-view'))).toBeVisible();
    
    // Verify manual entry button is available
    await expect(element(by.id('manual-entry-button'))).toBeVisible();
    
    // Go back to the list
    await element(by.id('close-scanner-button')).tap();
    
    // Verify we're back on the TOTP list
    await expect(element(by.text('TOTP Codes'))).toBeVisible();
  });
});