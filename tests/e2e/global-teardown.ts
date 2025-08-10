import { APIHelper } from './utils/api-helper';
import { TestDataManager } from './utils/test-data-manager';

async function globalTeardown() {
  console.log('🧹 Starting E2E Global Teardown...');
  
  try {
    // Cleanup test data
    console.log('⏳ Cleaning up test data...');
    const apiHelper = new APIHelper();
    const testDataManager = new TestDataManager(apiHelper);
    await testDataManager.cleanupTestData();
    console.log('✅ Test data cleanup complete');
    
    console.log('🎉 E2E Global Teardown Complete!');
    
  } catch (error) {
    console.error('❌ Global Teardown Failed:', error);
    // Don't throw error to avoid failing the test suite
    console.log('⚠️  Continuing despite teardown errors...');
  }
}

export default globalTeardown;
