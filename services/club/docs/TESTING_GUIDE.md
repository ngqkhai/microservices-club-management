# Testing Guide - Club Service

## Introduction

This guide provides instructions on how to write, run, and maintain tests for the Club Management System's Club Service. Following these practices will ensure code quality and prevent regressions.

## Testing Setup

The Club Service uses:
- **Jest**: JavaScript testing framework
- **mongodb-memory-server**: In-memory MongoDB for database testing
- **supertest**: HTTP assertions for API testing

## Test Environment

Tests run in isolated environments to avoid affecting development or production data. The `tests/setup.js` file configures:

1. In-memory MongoDB for database tests
2. Automatic database cleanup between tests
3. Test environment variables

## Writing Tests

### Directory Structure

```
tests/
├── models/                # Tests for database models
├── controllers/           # Tests for API controllers
├── middlewares/           # Tests for middlewares
├── middleware/            # Tests for error handling middleware
├── integration/           # Integration tests for API
└── setup.js              # Test environment setup
```

### Writing Model Tests

Model tests verify database operations and business logic. Example:

```javascript
describe('Club Model', () => {
  describe('findAll', () => {
    test('should return all clubs when no filters are applied', async () => {
      // Setup test data
      
      // Call the method
      const result = await ClubModel.findAll({});
      
      // Assertions
      expect(result.total).toBe(3);
      expect(result.results.length).toBe(3);
    });
  });
});
```

### Writing Controller Tests

Controller tests verify HTTP handling logic with mocked models:

```javascript
describe('Club Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getClubs', () => {
    test('should return all clubs with 200 status code', async () => {
      // Mock data
      const mockClubs = { total: 2, results: [...] };
      Club.findAll.mockResolvedValue(mockClubs);
      
      // Mock request/response
      const req = { query: {} };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();
      
      // Call the controller
      await clubController.getClubs(req, res, next);
      
      // Assertions
      expect(Club.findAll).toHaveBeenCalledWith({});
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockClubs);
    });
  });
});
```

### Writing Middleware Tests

Middleware tests verify request/response processing:

```javascript
describe('Auth Middleware', () => {
  test('should extract user information from headers', () => {
    // Mock request
    const req = {
      headers: {
        'x-user-id': 'user123',
        'x-user-roles': 'ADMIN,USER'
      }
    };
    const res = {};
    const next = jest.fn();
    
    // Call middleware
    extractUserFromHeaders(req, res, next);
    
    // Assertions
    expect(req.user).toBeDefined();
    expect(req.user.roles).toEqual(['ADMIN', 'USER']);
    expect(next).toHaveBeenCalled();
  });
});
```

### Writing Integration Tests

Integration tests verify end-to-end functionality:

```javascript
describe('Club API Integration Tests', () => {
  describe('GET /api/clubs', () => {
    test('should return all clubs', async () => {
      const response = await request(app)
        .get('/api/clubs')
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('results');
    });
  });
});
```

## Running Tests

### Running All Tests

```bash
npm test
```

### Running Specific Test Groups

```bash
npm run test:unit           # Run model tests
npm run test:controllers    # Run controller tests
npm run test:middleware     # Run middleware tests
npm run test:integration    # Run integration tests
```

### Running Tests with Coverage Report

```bash
npm run test:coverage
```

## Test Coverage Requirements

All code should strive for at least 80% coverage across:
- Branches
- Functions
- Statements

## Common Testing Patterns

### Testing Error Handling

Always test both happy paths and error conditions:

```javascript
test('should handle errors with next', async () => {
  // Mock error
  const mockError = new Error('Database error');
  Club.findAll.mockRejectedValue(mockError);
  
  // Call the controller
  await clubController.getClubs(req, res, next);
  
  // Assert error handling
  expect(next).toHaveBeenCalledWith(mockError);
});
```

### Testing Validation

Validate input validation and constraints:

```javascript
test('should handle validation error when name is missing', async () => {
  const req = {
    body: { description: 'Missing name', type: 'ACADEMIC' },
    user: { id: 'user123' }
  };
  
  await clubController.createClub(req, res, next);
  
  expect(next).toHaveBeenCalled();
  expect(next.mock.calls[0][0].status).toBe(400);
});
```

## Debugging Tests

When tests fail:

1. Check console output for error messages
2. Use `console.log` for debugging (but remove before committing)
3. Isolate specific test with `test.only()`
4. Verify that mocks are correctly set up

## Best Practices

1. **Test Independence**: Each test should run independently from others
2. **Clean Setup/Teardown**: Reset state between tests
3. **Mock External Dependencies**: Avoid network calls or real database usage
4. **Clear Assertions**: Tests should clearly indicate what's being tested
5. **Avoid Test Interdependence**: Tests shouldn't rely on other tests

## Mocking Strategies

### Mocking Models

```javascript
jest.mock('../../src/models/club');

// Before each test
beforeEach(() => {
  jest.clearAllMocks();
  Club.findAll.mockResolvedValue({ total: 0, results: [] });
});
```

### Mocking Middleware

```javascript
const req = {};
const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
const next = jest.fn();
```

## CI Integration

Tests run automatically in the CI pipeline:

1. On every push to main branch
2. On every pull request
3. Before deployment to staging/production

Failed tests will block merges and deployments to ensure code quality.
