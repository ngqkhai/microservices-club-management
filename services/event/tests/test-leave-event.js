#!/usr/bin/env node

/**
 * Manual test script for US-015 Leave Event API
 * 
 * This script tests the leave event functionality by:
 * 1. Testing successful leave event operation
 * 2. Testing error cases (event not found, not joined, etc.)
 * 
 * Run with: node test-leave-event.js
 * Requires Node.js v18+ for built-in fetch API
 */

const BASE_URL = 'http://localhost:3003'; // Updated to match your service port
const TEST_EVENT_ID = '507f1f77bcf86cd799439011'; // Sample ObjectId
const TEST_USER_ID = 'test-user-123';
const TEST_USER_EMAIL = 'test@example.com';
const TEST_USER_ROLE = 'USER';

// Helper function to make API calls
async function makeRequest(url, options = {}) {
  try {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };
    
    // Only add auth headers if not skipping auth
    if (!options.skipAuth) {
      headers['X-User-ID'] = options.userId || TEST_USER_ID;
      headers['X-User-Email'] = options.userEmail || TEST_USER_EMAIL;  
      headers['X-User-Role'] = options.userRole || TEST_USER_ROLE;
    }
    
    const response = await fetch(url, {
      headers,
      ...options
    });
    
    const data = await response.json();
    return { status: response.status, data };
  } catch (error) {
    return { error: error.message };
  }
}

// Test cases
const tests = [
  {
    name: 'Leave Event - Success Case',
    url: `${BASE_URL}/api/events/${TEST_EVENT_ID}/leave`,
    method: 'DELETE',
    expectedStatus: 200,
    description: 'Should successfully leave an event'
  },
  {
    name: 'Leave Event - Event Not Found',
    url: `${BASE_URL}/api/events/nonexistent123456789012/leave`,
    method: 'DELETE',
    expectedStatus: 404,
    description: 'Should return 404 for non-existent event'
  },
  {
    name: 'Leave Event - Invalid Event ID Format',
    url: `${BASE_URL}/api/events/invalid-id/leave`,
    method: 'DELETE',
    expectedStatus: 404,
    description: 'Should return 404 for invalid event ID format'
  },
  {
    name: 'Leave Event - Not Joined',
    url: `${BASE_URL}/api/events/${TEST_EVENT_ID}/leave`,
    method: 'DELETE',
    userId: 'different-user-456',
    userEmail: 'different@example.com',
    userRole: 'USER',
    expectedStatus: 400,
    description: 'Should return 400 when user has not joined the event'
  },
  {
    name: 'Leave Event - Missing Auth Headers',
    url: `${BASE_URL}/api/events/${TEST_EVENT_ID}/leave`,
    method: 'DELETE',
    headers: {}, // No auth headers
    skipAuth: true,
    expectedStatus: 401,
    description: 'Should return 401 when auth headers are missing'
  }
];

// Run tests
async function runTests() {
  console.log('🧪 Running US-015 Leave Event API Tests\n');
  console.log('📋 Test Configuration:');
  console.log(`   Base URL: ${BASE_URL}`);
  console.log(`   Test Event ID: ${TEST_EVENT_ID}`);
  console.log(`   Test User ID: ${TEST_USER_ID}`);
  console.log(`   Test User Email: ${TEST_USER_EMAIL}`);
  console.log(`   Test User Role: ${TEST_USER_ROLE}\n`);
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    console.log(`🔍 ${test.name}`);
    console.log(`   ${test.description}`);
    
    const requestOptions = {
      method: test.method
    };
    
    // Handle auth headers - pass user info directly to makeRequest
    if (!test.skipAuth) {
      requestOptions.userId = test.userId;
      requestOptions.userEmail = test.userEmail;
      requestOptions.userRole = test.userRole;
    } else {
      requestOptions.skipAuth = true;
    }
    
    // Add any custom headers
    if (test.headers) {
      requestOptions.headers = test.headers;
    }
    
    const result = await makeRequest(test.url, requestOptions);
    
    if (result.error) {
      console.log(`   ❌ Error: ${result.error}\n`);
      failed++;
      continue;
    }
    
    const statusMatch = result.status === test.expectedStatus;
    if (statusMatch) {
      console.log(`   ✅ Status: ${result.status} (Expected: ${test.expectedStatus})`);
      console.log(`   📄 Response:`, JSON.stringify(result.data, null, 4));
      passed++;
    } else {
      console.log(`   ❌ Status: ${result.status} (Expected: ${test.expectedStatus})`);
      console.log(`   📄 Response:`, JSON.stringify(result.data, null, 4));
      failed++;
    }
    console.log('');
  }
  
  console.log('📊 Test Results:');
  console.log(`   ✅ Passed: ${passed}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
  
  if (failed === 0) {
    console.log('\n🎉 All tests passed!');
  } else {
    console.log('\n⚠️  Some tests failed. Check the implementation.');
  }
}

// Check if server is running
async function checkServer() {
  console.log('🔍 Checking if event service is running...');
  const healthCheck = await makeRequest(`${BASE_URL}/health`);
  
  if (healthCheck.error) {
    console.log('❌ Event service is not running. Please start the service first:');
    console.log('   cd services/event');
    console.log('   npm run dev');
    return false;
  }
  
  console.log('✅ Event service is running\n');
  return true;
}

// Main execution
async function main() {
  const serverRunning = await checkServer();
  if (serverRunning) {
    await runTests();
  }
}

// Handle missing fetch API (for older Node.js versions)
try {
  await main();
} catch (error) {
  if (error.message.includes('fetch is not defined')) {
    console.log('❌ Built-in fetch API is not available.');
    console.log('💡 Please upgrade to Node.js v18+ or install node-fetch:');
    console.log('   npm install node-fetch');
    console.log('💡 Or use the Postman collection for testing instead.');
  } else {
    console.error('❌ Error running tests:', error.message);
  }
}
