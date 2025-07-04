#!/usr/bin/env node

/**
 * Comprehensive test runner for Event Service APIs
 * 
 * This script runs tests for both Join Event (US-014) and Leave Event (US-015)
 * 
 * Run with: node test-all-events.js
 * Requires Node.js v18+ for built-in fetch API
 */

const BASE_URL = 'http://localhost:3003';

// Helper function to make API calls
async function makeRequest(url, options = {}) {
  try {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };
    
    // Only add auth headers if not skipping auth
    if (!options.skipAuth) {
      headers['X-User-ID'] = options.userId || 'default-user';
      headers['X-User-Email'] = options.userEmail || 'default@example.com';  
      headers['X-User-Role'] = options.userRole || 'USER';
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

// All test suites
const testSuites = [
  {
    name: 'US-014 Join Event API Tests',
    tests: [
      {
        name: 'Join Event - Success Case',
        url: `${BASE_URL}/api/events/507f1f77bcf86cd799439012/join`,
        method: 'POST',
        userId: 'test-user-789',
        userEmail: 'join-new@example.com',
        userRole: 'USER',
        expectedStatus: 200,
        description: 'Should successfully join an event'
      },
      {
        name: 'Join Event - Already Joined',
        url: `${BASE_URL}/api/events/507f1f77bcf86cd799439012/join`,
        method: 'POST',
        userId: 'test-user-456', // This user joined in previous test
        userEmail: 'join-test@example.com',
        userRole: 'USER',
        expectedStatus: 400,
        description: 'Should return 400 when user already joined'
      },
      {
        name: 'Join Event - Event Not Found',
        url: `${BASE_URL}/api/events/nonexistent123456789012/join`,
        method: 'POST',
        userId: 'test-user-999',
        userEmail: 'test999@example.com',
        userRole: 'USER',
        expectedStatus: 404,
        description: 'Should return 404 for non-existent event'
      },
      {
        name: 'Join Event - Missing Auth',
        url: `${BASE_URL}/api/events/507f1f77bcf86cd799439012/join`,
        method: 'POST',
        skipAuth: true,
        expectedStatus: 401,
        description: 'Should return 401 when auth headers missing'
      }
    ]
  },
  {
    name: 'US-015 Leave Event API Tests',
    tests: [
      {
        name: 'Leave Event - Success Case',
        url: `${BASE_URL}/api/events/507f1f77bcf86cd799439012/leave`,
        method: 'DELETE',
        userId: 'test-user-789', // User who just joined above
        userEmail: 'join-new@example.com',
        userRole: 'USER',
        expectedStatus: 200,
        description: 'Should successfully leave an event'
      },
      {
        name: 'Leave Event - Not Joined',
        url: `${BASE_URL}/api/events/507f1f77bcf86cd799439012/leave`,
        method: 'DELETE',
        userId: 'never-joined-user',
        userEmail: 'never@example.com',
        userRole: 'USER',
        expectedStatus: 400,
        description: 'Should return 400 when user not joined'
      },
      {
        name: 'Leave Event - Event Not Found',
        url: `${BASE_URL}/api/events/nonexistent123456789012/leave`,
        method: 'DELETE',
        userId: 'test-user-999',
        userEmail: 'test999@example.com',
        userRole: 'USER',
        expectedStatus: 404,
        description: 'Should return 404 for non-existent event'
      },
      {
        name: 'Leave Event - Missing Auth',
        url: `${BASE_URL}/api/events/507f1f77bcf86cd799439012/leave`,
        method: 'DELETE',
        skipAuth: true,
        expectedStatus: 401,
        description: 'Should return 401 when auth headers missing'
      }
    ]
  }
];

// Run a single test
async function runTest(test) {
  const requestOptions = {
    method: test.method
  };
  
  // Handle auth headers
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
    return { success: false, error: result.error };
  }
  
  const statusMatch = result.status === test.expectedStatus;
  return {
    success: statusMatch,
    actualStatus: result.status,
    expectedStatus: test.expectedStatus,
    response: result.data
  };
}

// Run all test suites
async function runAllTests() {
  console.log('🚀 Running Comprehensive Event Service API Tests\n');
  console.log('📋 Test Configuration:');
  console.log(`   Base URL: ${BASE_URL}`);
  console.log(`   Test Events: 507f1f77bcf86cd799439011, 507f1f77bcf86cd799439012\n`);
  
  let totalPassed = 0;
  let totalFailed = 0;
  
  for (const suite of testSuites) {
    console.log(`📦 ${suite.name}`);
    console.log(''.padEnd(suite.name.length + 4, '='));
    
    let suitePassed = 0;
    let suiteFailed = 0;
    
    for (const test of suite.tests) {
      console.log(`🔍 ${test.name}`);
      console.log(`   ${test.description}`);
      
      const result = await runTest(test);
      
      if (result.success) {
        console.log(`   ✅ Status: ${result.actualStatus} (Expected: ${result.expectedStatus})`);
        if (result.response?.data) {
          console.log(`   📄 Data: ${JSON.stringify(result.response.data, null, 4)}`);
        } else {
          console.log(`   📄 Response: ${JSON.stringify(result.response, null, 4)}`);
        }
        suitePassed++;
        totalPassed++;
      } else {
        console.log(`   ❌ Status: ${result.actualStatus || 'ERROR'} (Expected: ${result.expectedStatus})`);
        if (result.error) {
          console.log(`   📄 Error: ${result.error}`);
        } else if (result.response) {
          console.log(`   📄 Response: ${JSON.stringify(result.response, null, 4)}`);
        }
        suiteFailed++;
        totalFailed++;
      }
      console.log('');
    }
    
    console.log(`📊 ${suite.name} Results:`);
    console.log(`   ✅ Passed: ${suitePassed}`);
    console.log(`   ❌ Failed: ${suiteFailed}`);
    console.log(`   📈 Success Rate: ${((suitePassed / (suitePassed + suiteFailed)) * 100).toFixed(1)}%\n`);
  }
  
  console.log('🏆 OVERALL RESULTS');
  console.log('==================');
  console.log(`   ✅ Total Passed: ${totalPassed}`);
  console.log(`   ❌ Total Failed: ${totalFailed}`);
  console.log(`   📈 Overall Success Rate: ${((totalPassed / (totalPassed + totalFailed)) * 100).toFixed(1)}%`);
  
  if (totalFailed === 0) {
    console.log('\n🎉 All tests passed! Event Service APIs are working perfectly!');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the implementation.');
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
    await runAllTests();
  }
}

// Handle missing fetch API
try {
  await main();
} catch (error) {
  if (error.message.includes('fetch is not defined')) {
    console.log('❌ Built-in fetch API is not available.');
    console.log('💡 Please upgrade to Node.js v18+ or install node-fetch');
  } else {
    console.error('❌ Error running tests:', error.message);
  }
}
