# 2FLocal Frontend Testing Guidelines

This document outlines the testing approach, organization, and best practices for the 2FLocal React Native frontend application.

## Testing Approach

The 2FLocal frontend uses a comprehensive testing strategy that includes:

1. **Unit Tests**: Testing individual functions and components in isolation
2. **Component Tests**: Testing UI components with their interactions
3. **Integration Tests**: Testing interactions between components and services
4. **End-to-End Tests**: Testing complete user flows (handled separately)

## Test Organization

Tests are organized following the same structure as the source code:

```
app/
├── src/
│   ├── components/
│   │   ├── auth/
│   │   │   ├── __tests__/
│   │   │   │   ├── FormButton.test.tsx
│   │   │   │   └── FormInput.test.tsx
│   │   ├── totp/
│   │   │   ├── __tests__/
│   │   │   │   ├── EmptyState.test.tsx
│   │   │   │   ├── SearchBar.test.tsx
│   │   │   │   └── TOTPItem.test.tsx
│   ├── screens/
│   │   ├── auth/
│   │   │   ├── __tests__/
│   │   │   │   └── LoginScreen.test.tsx
│   │   ├── totp/
│   │   │   ├── __tests__/
│   │   │   │   └── TOTPListScreen.test.tsx
│   ├── services/
│   │   ├── __tests__/
│   │   │   ├── apiClient.test.ts
│   │   │   ├── authService.test.ts
│   │   │   ├── biometricService.test.ts
│   │   │   ├── secureStorageService.test.ts
│   │   │   └── totpService.test.ts
│   ├── utils/
│   │   ├── __tests__/
│   │   │   └── validationSchemas.test.ts
```

## Mocking Strategies

### External Dependencies

External dependencies are mocked to isolate the code being tested:

- **React Navigation**: Mock the `useNavigation` hook to test navigation logic
- **AsyncStorage**: Mock for testing storage operations
- **Keychain**: Mock for testing secure storage operations
- **Biometrics**: Mock for testing biometric authentication
- **API Calls**: Mock using Jest's mock functions

Example of mocking a service:

```typescript
// Mock the TOTP service
jest.mock('../../services/totpService', () => ({
  getSecrets: jest.fn(),
  deleteSecret: jest.fn(),
  generateQRCode: jest.fn(),
}));
```

### Context Providers

For components that use React Context (like AuthContext), we provide mock context values:

```typescript
// Mock the useAuth hook
jest.mock('../../context/AuthContext', () => ({
  useAuth: jest.fn().mockReturnValue({
    login: jest.fn().mockResolvedValue({}),
    authenticateWithBiometrics: jest.fn().mockResolvedValue(true),
  }),
}));
```

## Test Utilities

Common test utilities are located in `app/src/__tests__/utils/testUtils.ts` and include:

- Mock navigation props
- Mock authentication context
- Helper functions for testing

## Best Practices

### General Testing Principles

1. **Test Behavior, Not Implementation**: Focus on what the component does, not how it does it
2. **Isolation**: Tests should be independent and not rely on the state of other tests
3. **Readability**: Tests should be easy to read and understand
4. **Maintainability**: Tests should be easy to maintain and update

### Writing Effective Tests

1. **Arrange-Act-Assert Pattern**: Structure tests with clear setup, action, and verification phases
2. **Descriptive Test Names**: Use descriptive names that explain what is being tested
3. **Test Edge Cases**: Test both happy paths and error cases
4. **Avoid Test Duplication**: Use setup functions for common test scenarios
5. **Keep Tests Focused**: Each test should verify a single behavior

### Example Test Structure

```typescript
describe('ComponentName', () => {
  // Setup common test data and mocks
  beforeEach(() => {
    // Clear mocks and set up test environment
  });

  it('should render correctly', () => {
    // Arrange: Set up the test
    
    // Act: Perform the action being tested
    
    // Assert: Verify the expected outcome
  });

  // More test cases...
});
```

## Running Tests

To run all tests:

```bash
npm test
```

To run tests with coverage:

```bash
npm test -- --coverage
```

To run a specific test file:

```bash
npm test -- path/to/test/file.test.ts
```

## Coverage Requirements

The project aims for at least 70% code coverage across:

- Statements
- Branches
- Functions
- Lines

## Continuous Integration

Tests are automatically run on pull requests and commits to the main branch. The CI pipeline will:

1. Run all tests
2. Generate a coverage report
3. Fail if coverage thresholds are not met
4. Fail if any tests fail

## Troubleshooting Common Issues

### Tests Failing Due to Timeouts

If tests are failing due to timeouts, you may need to increase the timeout for that test:

```typescript
it('should complete a long-running operation', async () => {
  // Test code here
}, 10000); // Increase timeout to 10 seconds
```

### Mocking Issues

If you're having trouble with mocks, ensure you're mocking at the correct level:

- Mock modules at the top of the file
- Use `jest.spyOn` for specific methods
- Clear mocks in `beforeEach` to avoid test interference

### Snapshot Testing

Use snapshot testing sparingly and only for stable components. Snapshots can be updated with:

```bash
npm test -- -u
```

## Additional Resources

- [React Native Testing Library Documentation](https://callstack.github.io/react-native-testing-library/)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Hook Form Testing](https://react-hook-form.com/advanced-usage#TestingForm)
- [Testing React Navigation](https://reactnavigation.org/docs/testing/)