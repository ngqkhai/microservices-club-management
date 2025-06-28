# Unit Testing Documentation - Club Service

## Overview

This document describes the unit tests for the Club Service in the Club Management System. The tests ensure code quality, validate business logic, and verify that the system works correctly.

## Test Structure

The test suite is organized into the following sections:

- **Model Tests**: Test database operations and business logic
- **Controller Tests**: Test API endpoints and request handling
- **Middleware Tests**: Test authentication and error handling
- **Integration Tests**: Test end-to-end API functionality

## Model Tests

These tests verify that the Club model correctly interacts with the database and implements business logic.

### `ClubModel` Tests

File: `/tests/models/club.test.js`

#### `findAll` Method
- **Test**: Should return all clubs when no filters are applied
  - Verifies that the method returns all clubs in the database without filtering
- **Test**: Should filter clubs by name
  - Checks that text search on club names works correctly (case-insensitive)
- **Test**: Should filter clubs by type
  - Verifies filtering by club type (ACADEMIC, SPORTS, etc.)
- **Test**: Should filter clubs by status
  - Verifies filtering by club status (ACTIVE, INACTIVE)
- **Test**: Should implement pagination correctly
  - Checks that pagination returns correct result set and total count

#### `findById` Method
- **Test**: Should find a club by its ID
  - Verifies retrieving a specific club by its MongoDB ID
- **Test**: Should return null for non-existent ID
  - Checks error handling for IDs that don't exist

#### `create` Method
- **Test**: Should create a new club
  - Verifies club creation and database persistence
- **Test**: Should set default status to ACTIVE if not provided
  - Checks that default values are applied correctly
- **Test**: Should throw error for duplicate club name
  - Validates uniqueness constraints on club names

#### `findRecruitments` Method
- **Test**: Should find all recruitment rounds for a club
  - Verifies retrieval of related recruitment rounds
- **Test**: Should return empty array for club with no recruitment rounds
  - Checks handling of clubs without recruitment rounds

#### `updateSize` Method
- **Test**: Should update club size
  - Verifies that club membership counts can be updated

## Controller Tests

These tests verify that the controllers handle HTTP requests correctly, including parameter validation, error handling, and response formatting.

### `ClubController` Tests

File: `/tests/controllers/clubController.test.js`

#### `getClubs` Method
- **Test**: Should return all clubs with 200 status code
  - Verifies proper response for GET /clubs
- **Test**: Should pass filters to model
  - Checks that query parameters are correctly passed to the model
- **Test**: Should handle errors with next
  - Verifies error handling middleware is called when errors occur

#### `getClubById` Method
- **Test**: Should return a club with 200 status code when found
  - Checks that valid club IDs return the correct club
- **Test**: Should return 404 when club not found
  - Verifies proper error response for non-existent clubs
- **Test**: Should handle errors with next
  - Tests error propagation

#### `createClub` Method
- **Test**: Should create a club with 201 status code
  - Verifies club creation via API
- **Test**: Should handle validation error when name or type is missing
  - Checks input validation for required fields
- **Test**: Should handle duplicate club name error
  - Verifies uniqueness constraints are enforced

#### `getClubRecruitments` Method
- **Test**: Should return recruitments with 200 status code
  - Checks retrieval of a club's recruitment rounds
- **Test**: Should return 404 when club not found
  - Verifies error handling for invalid club IDs

## Middleware Tests

These tests verify that middleware functions work correctly for authentication and error handling.

### `AuthMiddleware` Tests

File: `/tests/middlewares/authMiddleware.test.js`

#### `extractUserFromHeaders` Method
- **Test**: Should extract user information from headers
  - Verifies JWT token data is correctly extracted from headers
- **Test**: Should handle missing headers
  - Checks behavior when authorization headers are absent
- **Test**: Should handle invalid roles format
  - Tests error handling for malformed role data

### `ErrorMiddleware` Tests

File: `/tests/middleware/errorMiddleware.test.js`

#### `errorHandler` Method
- **Test**: Should handle MongoDB duplicate key error with 409 status
  - Verifies proper handling of database uniqueness constraint errors
- **Test**: Should handle generic errors with provided status code
  - Tests that HTTP status codes from errors are preserved
- **Test**: Should handle generic errors with default 500 status if no status provided
  - Checks default error behavior

## Integration Tests

These tests verify that the entire API works correctly end-to-end.

### Club API Integration Tests

File: `/tests/integration/clubApi.test.js`

#### GET /api/clubs
- **Test**: Should return all clubs
  - Verifies the endpoint returns a list of clubs
- **Test**: Should filter clubs by name
  - Checks search functionality

#### GET /api/clubs/:id
- **Test**: Should return a club by ID
  - Verifies retrieving specific club details
- **Test**: Should return 404 for non-existent club
  - Tests error handling

#### POST /api/clubs
- **Test**: Should create a new club
  - Verifies club creation through the API
- **Test**: Should return 400 for missing required fields
  - Tests input validation
- **Test**: Should return 409 for duplicate club name
  - Checks uniqueness constraints

#### GET /api/clubs/:id/recruitments
- **Test**: Should return recruitments for a club
  - Verifies retrieving related recruitments
- **Test**: Should return 404 for non-existent club
  - Tests error handling

## Running Tests

```bash
# Run all tests
npm test

# Run specific test groups
npm run test:unit           # Run model tests
npm run test:controllers    # Run controller tests
npm run test:middlewares    # Run middleware tests
npm run test:middleware     # Run middleware tests
npm run test:integration    # Run integration tests

# Run with coverage report
npm run test:coverage
```

## Test Coverage

The tests aim to achieve at least 80% code coverage across the codebase, including:
- 80% branch coverage
- 80% function coverage
- 80% line coverage

## Known Issues

Currently, some integration tests may fail due to:
1. Database setup and teardown issues
2. Status enum inconsistencies (lowercase vs uppercase)
3. Mock data requirements

## Notes for Developers

When adding new features:
1. Write tests before implementation (TDD approach)
2. Ensure both happy path and error cases are tested
3. Use the in-memory MongoDB server for database tests
4. Run the full test suite before submitting changes

## Future Test Improvements

- Add performance tests for API endpoints
- Implement end-to-end tests with UI components
- Add load testing for high-volume scenarios
- Improve test coverage for edge cases
