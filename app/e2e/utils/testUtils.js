/**
 * Test utilities for E2E tests
 */

/**
 * Generate a random email for testing
 * @returns {string} Random email address
 */
function generateRandomEmail() {
  const timestamp = new Date().getTime();
  const random = Math.floor(Math.random() * 10000);
  return `test-${timestamp}-${random}@example.com`;
}

/**
 * Generate test user data
 * @returns {Object} Test user data
 */
function generateTestUser() {
  return {
    name: 'Test User',
    email: generateRandomEmail(),
    password: 'Password123!',
  };
}

/**
 * Generate test TOTP data
 * @returns {Object} Test TOTP data
 */
function generateTestTOTP() {
  return {
    issuer: 'Test Service',
    label: `test-${Math.floor(Math.random() * 10000)}@testservice.com`,
    secret: 'JBSWY3DPEHPK3PXP', // This is a valid TOTP secret for testing
  };
}

/**
 * Wait for an element to be visible with timeout
 * @param {string} elementId The element ID to wait for
 * @param {number} timeout Timeout in milliseconds
 * @returns {Promise<void>}
 */
async function waitForElementToBeVisible(elementId, timeout = 5000) {
  await waitFor(element(by.id(elementId)))
    .toBeVisible()
    .withTimeout(timeout);
}

/**
 * Login with the provided credentials
 * @param {string} email Email address
 * @param {string} password Password
 * @returns {Promise<void>}
 */
async function login(email, password) {
  await element(by.id('email-input')).typeText(email);
  await element(by.id('password-input')).typeText(password);
  await element(by.id('login-button')).tap();
}

/**
 * Register a new user
 * @param {string} name User name
 * @param {string} email Email address
 * @param {string} password Password
 * @returns {Promise<void>}
 */
async function registerUser(name, email, password) {
  await element(by.text('Sign Up')).tap();
  await element(by.id('name-input')).typeText(name);
  await element(by.id('email-input')).typeText(email);
  await element(by.id('password-input')).typeText(password);
  await element(by.id('confirm-password-input')).typeText(password);
  await element(by.id('register-button')).tap();
}

/**
 * Logout the current user
 * @returns {Promise<void>}
 */
async function logout() {
  await element(by.id('settings-tab')).tap();
  await element(by.id('logout-button')).tap();
}

/**
 * Add a TOTP account manually
 * @param {string} issuer Service name
 * @param {string} label Account label
 * @param {string} secret TOTP secret
 * @returns {Promise<void>}
 */
async function addTOTPManually(issuer, label, secret) {
  await element(by.id('add-totp-button')).tap();
  await element(by.id('manual-entry-button')).tap();
  await element(by.id('issuer-input')).typeText(issuer);
  await element(by.id('label-input')).typeText(label);
  await element(by.id('secret-input')).typeText(secret);
  await element(by.id('save-button')).tap();
}

/**
 * Delete a TOTP account
 * @param {string} issuer Service name to delete
 * @returns {Promise<void>}
 */
async function deleteTOTP(issuer) {
  await element(by.text(issuer)).swipe('left');
  await element(by.id('delete-button')).tap();
  await element(by.text('Confirm')).tap();
}

/**
 * Search for a TOTP account
 * @param {string} searchText Text to search for
 * @returns {Promise<void>}
 */
async function searchTOTP(searchText) {
  await element(by.id('search-input')).typeText(searchText);
}

/**
 * Clear the search input
 * @returns {Promise<void>}
 */
async function clearSearch() {
  await element(by.id('clear-search-button')).tap();
}

module.exports = {
  generateRandomEmail,
  generateTestUser,
  generateTestTOTP,
  waitForElementToBeVisible,
  login,
  registerUser,
  logout,
  addTOTPManually,
  deleteTOTP,
  searchTOTP,
  clearSearch,
};