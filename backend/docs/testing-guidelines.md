# 2FLocal Backend Testing Guidelines

This document outlines the testing approach, organization, and best practices for the 2FLocal backend.

## Testing Structure

The 2FLocal backend uses a comprehensive testing approach with the following types of tests:

1. **Unit Tests**: Test individual functions and components in isolation
2. **Integration Tests**: Test interactions between different components
3. **API Tests**: Test the API endpoints from an external perspective

### Directory Structure

Tests are organized in the following directory structure:

```
backend/
├── src/
│   ├── __tests__/           # Root test directory
│   │   ├── setup.ts         # Global test setup
│   │   ├── integration/     # Integration tests
│   │   │   └── auth.test.ts # API endpoint tests
│   ├── controllers/
│   │   ├── __tests__/       # Controller unit tests
│   │   │   └── authController.test.ts
│   ├── utils/
│   │   ├── __tests__/       # Utility function unit tests
│   │   │   └── tokenService.test.ts
```

## Testing Tools

The 2FLocal backend uses the following testing tools:

- **Jest**: Testing framework
- **Supertest**: HTTP assertions for API testing
- **jest-mock-extended**: For mocking TypeScript interfaces (e.g., Prisma client)

## Mocking Strategy

### Database Mocking

We use `jest-mock-extended` to mock the Prisma client. This allows us to test database interactions without requiring a real database connection.

```typescript
// Example of mocking Prisma client
import { PrismaClient } from '@prisma/client';
import { mockDeep } from 'jest-mock-extended';

export const prismaMock = mockDeep<PrismaClient>();
(PrismaClient as jest.Mock).mockImplementation(() => prismaMock);
```

### External Dependencies

External dependencies like email services, encryption, and third-party APIs should be mocked to isolate the component being tested.

```typescript
// Example of mocking external dependencies
jest.mock('../../utils/emailService', () => ({
  sendVerificationEmail: jest.fn().mockResolvedValue(true),
}));
```

## Test Organization

### Unit Tests

Unit tests should focus on testing a single function or component in isolation. They should be organized by the module they are testing.

```typescript
// Example unit test structure
describe('Auth Controller', () => {
  describe('loginUser', () => {
    it('should return 400 if email or password is missing', async () => {
      // Test implementation
    });
    
    it('should return 401 if user is not found', async () => {
      // Test implementation
    });
  });
});
```

### Integration Tests

Integration tests should focus on testing the interactions between different components, such as controllers and services.

```typescript
// Example integration test structure
describe('Auth API', () => {
  describe('POST /api/auth/login', () => {
    it('should login a user and return tokens', async () => {
      // Test implementation
    });
    
    it('should return 401 if credentials are invalid', async () => {
      // Test implementation
    });
  });
});
```

## Best Practices

### 1. Follow the AAA Pattern

Tests should follow the Arrange-Act-Assert pattern:

```typescript
// Arrange
const userData = { email: 'test@example.com', password: 'password123' };
prismaMock.user.findUnique.mockResolvedValue(null);

// Act
const response = await request(app).post('/api/auth/register').send(userData);

// Assert
expect(response.status).toBe(409);
expect(response.body).toHaveProperty('message', 'User with this email already exists');
```

### 2. Use Descriptive Test Names

Test names should clearly describe what is being tested and the expected outcome.

```typescript
// Good
it('should return 401 if user is not found', async () => {
  // Test implementation
});

// Bad
it('test login failure', async () => {
  // Test implementation
});
```

### 3. Test Both Happy Paths and Error Cases

Make sure to test both successful scenarios and error cases.

### 4. Keep Tests Independent

Tests should not depend on the state created by other tests. Each test should set up its own state and clean up after itself.

### 5. Use Test Fixtures for Common Test Data

Extract common test data into fixtures to avoid duplication.

```typescript
// Example of a test fixture
const mockUser = {
  id: '1',
  email: 'test@example.com',
  passwordHash: 'hashedPassword',
  name: 'Test User',
  isEmailVerified: true,
  // ...other properties
};
```

### 6. Mock External Dependencies

Always mock external dependencies to isolate the component being tested.

### 7. Test Edge Cases

Make sure to test edge cases, such as empty inputs, invalid inputs, and boundary conditions.

## Running Tests

To run the tests, use the following commands:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Code Coverage

The 2FLocal backend aims for at least 80% code coverage for statements, branches, functions, and lines. Coverage reports are generated when running tests with the `--coverage` flag.

```bash
npm run test:coverage
```

## Continuous Integration

Tests are automatically run on pull requests and commits to the main branch. The CI pipeline will fail if any tests fail or if the code coverage falls below the threshold.

## Troubleshooting

### Common Issues

1. **Missing Environment Variables**: Make sure all required environment variables are set in the test environment.
2. **Database Connection Issues**: Ensure that the Prisma client is properly mocked.
3. **Async Test Failures**: Make sure to use `async/await` or return promises in async tests.

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [TypeScript Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)