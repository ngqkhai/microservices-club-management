# E2E Tests for Club Management System

This directory contains comprehensive End-to-End (E2E) tests for the Club Management System, covering complete user journeys across the entire application stack.

## 🎯 Test Coverage

### 1. User Authentication Journey (`01-user-authentication.spec.ts`)
- ✅ Complete user registration flow
- ✅ User login with valid/invalid credentials  
- ✅ User logout flow
- ✅ Protected route access control
- ✅ Session persistence across page refreshes
- ✅ Password and email validation

### 2. Club Management Journey (`02-club-management.spec.ts`)
- ✅ Complete club creation and management flow
- ✅ Club search and filtering functionality
- ✅ Club membership flow (join/leave)
- ✅ Club listing and display
- ✅ Club categories and filtering
- ✅ Club details page comprehensive information

### 3. Event Management Journey (`03-event-management.spec.ts`)
- ✅ Complete event creation and management flow
- ✅ Event search and filtering functionality
- ✅ Event registration flow (RSVP/unregister)
- ✅ Event listing and display
- ✅ Event categories and time filtering
- ✅ Event capacity limits enforcement

### 4. User Profile Management (`04-user-profile.spec.ts`)
- ✅ View and update user profile
- ✅ Profile displays user activity and memberships
- ✅ Profile navigation and accessibility
- ✅ Profile validation and error handling
- ✅ Password change functionality
- ✅ Profile data persistence across sessions

### 5. API Integration Testing (`05-api-integration.spec.ts`)
- ✅ API Gateway routes requests correctly
- ✅ Authentication flow through API Gateway
- ✅ Club service integration through API Gateway
- ✅ Event service integration through API Gateway
- ✅ API Gateway security headers validation
- ✅ Rate limiting and throttling
- ✅ CORS headers configuration
- ✅ Service discovery and load balancing
- ✅ Error handling and status codes
- ✅ JWT token validation and refresh
- ✅ Database connectivity through services

## 🏗️ Architecture

### Test Infrastructure
- **Playwright**: Modern E2E testing framework with cross-browser support
- **TypeScript**: Type-safe test development
- **Page Object Model**: Maintainable test structure
- **Fixtures**: Reusable test setup and teardown
- **API Helper**: Direct API testing capabilities

### Key Components

#### Global Setup & Teardown
- `global-setup.ts`: Waits for services, creates test data
- `global-teardown.ts`: Cleans up test data

#### Utilities
- `api-helper.ts`: Direct API interaction for setup and validation
- `test-data-manager.ts`: Manages test users, clubs, and events
- `page-objects.ts`: Page Object Models for all frontend pages

#### Fixtures
- `test-fixtures.ts`: Reusable test fixtures for authenticated contexts

## 🚀 Running E2E Tests

### Prerequisites
```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install
```

### Local Development
```bash
# Start the full stack
docker-compose up

# Run E2E tests (headless)
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Run E2E tests in headed mode
npm run test:e2e:headed

# Run specific test file
npx playwright test tests/e2e/specs/01-user-authentication.spec.ts
```

### CI/CD Integration
E2E tests are automatically run in the CI pipeline after:
1. All unit tests pass
2. All Docker images are built
3. Services are started with docker-compose

## 📊 Test Reports

### HTML Report
After running tests, view the HTML report:
```bash
npx playwright show-report
```

### Test Results
- **JUnit XML**: `test-results/e2e-results.xml`
- **JSON Report**: `test-results/e2e-results.json`
- **Screenshots**: Captured on failure
- **Videos**: Recorded on failure
- **Traces**: Available for debugging

## 🛠️ Configuration

### Environment Variables
```bash
BASE_URL=http://localhost:3000          # Frontend URL
API_GATEWAY_URL=http://localhost:8000   # API Gateway URL
API_GATEWAY_SECRET=test-secret-e2e      # Gateway authentication
NODE_ENV=test                           # Test environment
```

### Browser Configuration
Tests run on:
- ✅ Chromium (Desktop)
- ✅ Firefox (Desktop) 
- ✅ WebKit/Safari (Desktop)
- ✅ Mobile Chrome (Pixel 5)
- ✅ Mobile Safari (iPhone 12)

## 🧪 Test Data

### Test Users
- `admin@test.com` - Admin user for management operations
- `user1@test.com` - Regular user for standard operations
- `user2@test.com` - Second user for multi-user scenarios
- `clubmanager@test.com` - Club manager for club operations

### Test Clubs
- E2E Test Tech Club (Technology category)
- E2E Test Sports Club (Sports category)  
- E2E Test Art Club (Arts category)

### Test Events
- Workshop events for each club
- Meeting events for each club
- Various categories and time periods

## 🔧 Debugging

### Debug Failed Tests
```bash
# Run with debug mode
npx playwright test --debug

# Run specific test with debug
npx playwright test tests/e2e/specs/01-user-authentication.spec.ts --debug

# View trace files
npx playwright show-trace test-results/trace.zip
```

### Common Issues
1. **Services not ready**: Increase wait time in global setup
2. **Authentication failures**: Check API_GATEWAY_SECRET configuration
3. **Database connection**: Verify MongoDB/PostgreSQL are running
4. **Port conflicts**: Ensure ports 3000, 8000, 27017, 5432 are available

## 📈 Metrics & Performance

### Test Execution Time
- **Authentication tests**: ~30-60 seconds
- **Club management tests**: ~45-90 seconds  
- **Event management tests**: ~45-90 seconds
- **Profile tests**: ~30-60 seconds
- **API integration tests**: ~60-120 seconds

### Coverage Metrics
- **User Journeys**: 100% of critical paths
- **API Endpoints**: 90%+ of public endpoints
- **Frontend Components**: 80%+ of core components
- **Cross-browser**: 5 browser/device combinations

## 🔄 Maintenance

### Adding New Tests
1. Create spec file in `tests/e2e/specs/`
2. Use existing fixtures and page objects
3. Follow naming convention: `##-feature-name.spec.ts`
4. Add test data setup if needed

### Updating Page Objects
1. Update page objects in `utils/page-objects.ts`
2. Add new locators for new UI elements
3. Maintain backward compatibility

### Test Data Management
1. Use `TestDataManager` for consistent test data
2. Clean up test data in teardown
3. Use unique identifiers (timestamps) for test isolation

## 🎯 Best Practices

### Test Design
- ✅ Test complete user journeys, not just individual features
- ✅ Use realistic test data and scenarios
- ✅ Test both happy paths and error conditions
- ✅ Ensure tests are independent and can run in any order

### Maintenance
- ✅ Use Page Object Model for maintainable tests
- ✅ Keep locators flexible (data-testid preferred)
- ✅ Regular test data cleanup
- ✅ Monitor test execution times

### CI/CD Integration
- ✅ Run E2E tests after unit tests
- ✅ Parallel execution where possible
- ✅ Artifact collection for debugging
- ✅ Retry logic for flaky tests
