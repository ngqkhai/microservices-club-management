#!/usr/bin/env node
/**
 * US007 Search & Filter Test Suite
 * Tests the club search and filtering functionality
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:8000/api';
const API_GATEWAY_SECRET = 'your-secret-key';

// Helper function to make API requests
async function makeRequest(endpoint, params = {}) {
  try {
    const queryString = new URLSearchParams(params).toString();
    const url = `${API_BASE_URL}${endpoint}${queryString ? `?${queryString}` : ''}`;
    
    const response = await axios.get(url, {
      headers: {
        'X-API-Gateway-Secret': API_GATEWAY_SECRET,
        'Content-Type': 'application/json'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error(`❌ Error calling ${endpoint}:`, error.response?.data || error.message);
    return null;
  }
}

// Test function to display results
function displayResults(title, data, showDetails = false) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🔍 ${title}`);
  console.log(`${'='.repeat(60)}`);
  
  if (!data || !data.data) {
    console.log('❌ No data returned');
    return;
  }
  
  const { results, total, page, totalPages } = data.data;
  
  console.log(`📊 Found ${total} clubs (Page ${page}/${totalPages})`);
  
  if (results && results.length > 0) {
    results.forEach((club, index) => {
      console.log(`\n  ${index + 1}. ${club.name}`);
      console.log(`     Category: ${club.category}`);
      console.log(`     Location: ${club.location}`);
      console.log(`     Members: ${club.member_count}`);
      if (showDetails) {
        console.log(`     Description: ${club.description.substring(0, 100)}...`);
        if (club.relevance_score) {
          console.log(`     Relevance: ${club.relevance_score.toFixed(2)}`);
        }
      }
    });
  } else {
    console.log('🚫 No clubs found');
  }
}

// Main test suite
async function runTests() {
  console.log('🚀 Starting US007 Club Search & Filter Tests');
  console.log('=' .repeat(60));
  
  // Test 1: Basic search functionality
  console.log('\n📝 Test 1: Basic Search Tests');
  
  // Search by name
  let result = await makeRequest('/clubs', { search: 'Computer Science' });
  displayResults('Search: "Computer Science"', result);
  
  // Search by category
  result = await makeRequest('/clubs', { search: 'technology' });
  displayResults('Search: "technology"', result);
  
  // Search by location
  result = await makeRequest('/clubs', { search: 'Engineering Building' });
  displayResults('Search: "Engineering Building"', result);
  
  // Test 2: Category filtering
  console.log('\n📝 Test 2: Category Filter Tests');
  
  const categories = ['technology', 'sports', 'arts', 'academic', 'social'];
  for (const category of categories) {
    result = await makeRequest('/clubs', { category });
    displayResults(`Filter by category: "${category}"`, result);
  }
  
  // Test 3: Location filtering
  console.log('\n📝 Test 3: Location Filter Tests');
  
  result = await makeRequest('/clubs', { location: 'Engineering' });
  displayResults('Filter by location: "Engineering"', result);
  
  result = await makeRequest('/clubs', { location: 'Student Center' });
  displayResults('Filter by location: "Student Center"', result);
  
  // Test 4: Sorting tests
  console.log('\n📝 Test 4: Sort Tests');
  
  const sortOptions = ['name', 'name_desc', 'category', 'newest', 'oldest', 'relevance'];
  for (const sort of sortOptions) {
    result = await makeRequest('/clubs', { sort, limit: 5 });
    displayResults(`Sort by: "${sort}" (top 5)`, result);
  }
  
  // Test 5: Combined filters
  console.log('\n📝 Test 5: Combined Filter Tests');
  
  result = await makeRequest('/clubs', { 
    category: 'arts',
    sort: 'name',
    limit: 10 
  });
  displayResults('Arts clubs sorted by name', result);
  
  result = await makeRequest('/clubs', { 
    search: 'club',
    category: 'technology',
    sort: 'relevance'
  });
  displayResults('Search "club" in technology category', result, true);
  
  // Test 6: Pagination tests
  console.log('\n📝 Test 6: Pagination Tests');
  
  result = await makeRequest('/clubs', { page: 1, limit: 3 });
  displayResults('Page 1, limit 3', result);
  
  result = await makeRequest('/clubs', { page: 2, limit: 3 });
  displayResults('Page 2, limit 3', result);
  
  // Test 7: Helper endpoints
  console.log('\n📝 Test 7: Helper Endpoints');
  
  result = await makeRequest('/clubs/categories');
  console.log('\n🏷️ Available Categories:', result?.data || 'Error');
  
  result = await makeRequest('/clubs/locations');
  console.log('\n📍 Available Locations:', result?.data || 'Error');
  
  result = await makeRequest('/clubs/stats');
  console.log('\n📊 Club Statistics:', result?.data || 'Error');
  
  // Test 8: Edge cases
  console.log('\n📝 Test 8: Edge Cases');
  
  // Empty search
  result = await makeRequest('/clubs', { search: '' });
  displayResults('Empty search', result);
  
  // Non-existent category
  result = await makeRequest('/clubs', { category: 'nonexistent' });
  displayResults('Non-existent category', result);
  
  // Invalid sort parameter
  result = await makeRequest('/clubs', { sort: 'invalid' });
  displayResults('Invalid sort parameter', result);
  
  // Large page number
  result = await makeRequest('/clubs', { page: 999 });
  displayResults('Page 999', result);
  
  console.log('\n✅ US007 Test Suite Completed');
  console.log('=' .repeat(60));
}

// Run the tests
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests };
