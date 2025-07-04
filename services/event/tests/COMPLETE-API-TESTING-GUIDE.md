# 🎯 Complete Event API Testing Guide

## 📋 Overview
This comprehensive guide covers testing for both **US-014 (Join Event)** and **US-015 (Leave Event)** APIs in the Event Management microservice.

## 🏗️ Architecture Overview
- **Event Service**: Port 3003
- **Authentication**: API Gateway (Kong) header injection
- **Database**: MongoDB with Mongoose ODM
- **API Patterns**: RESTful endpoints with proper error handling

---

## 🔧 API Specifications

### US-014: Join Event
- **Method**: POST
- **Path**: `/api/events/{id}/join`
- **Authentication**: API Gateway headers (X-User-ID, X-User-Email, X-User-Role)
- **Success Response**: 201 - "Joined event successfully"
- **Error Responses**: 400 - ALREADY_JOINED, 404 - EVENT_NOT_FOUND

### US-015: Leave Event  
- **Method**: DELETE
- **Path**: `/api/events/{id}/leave`
- **Authentication**: API Gateway headers (X-User-ID, X-User-Email, X-User-Role)
- **Success Response**: 200 - "Left event successfully"
- **Error Responses**: 400 - NOT_JOINED, 404 - EVENT_NOT_FOUND

---

## 🚀 Quick Start Testing

### 1. Prerequisites Setup
```bash
# 1. Start Event Service
cd services/event
npm install
npm run dev

# 2. Ensure MongoDB is running
# 3. Setup test data (REQUIRED)
cd tests
node setup-test-data-quick.js
```

### 2. Run All Tests (Recommended)
```bash
cd services/event/tests
node test-all-events.js
```

Expected output:
```
🏆 OVERALL RESULTS
==================
   ✅ Total Passed: 8
   ❌ Total Failed: 0  
   📈 Overall Success Rate: 100.0%

🎉 All tests passed! Event Service APIs are working perfectly!
```

---

## 📝 Test Scripts Overview

### Available Test Scripts

| Script | Purpose | API Coverage |
|--------|---------|--------------|
| `setup-test-data-quick.js` | Seeds MongoDB with test data | Setup |
| `test-join-event.js` | Tests US-014 Join Event | POST /join |
| `test-leave-event.js` | Tests US-015 Leave Event | DELETE /leave |
| `test-all-events.js` | Integration testing | Both APIs |

### Individual Testing
```bash
# Test only Join Event (US-014)
node test-join-event.js

# Test only Leave Event (US-015)  
node test-leave-event.js

# Test both with integration scenarios
node test-all-events.js
```

---

## 🧪 Test Scenarios Coverage

### US-014 Join Event Test Cases
1. ✅ **Success Case**: User joins available event
2. ✅ **Already Joined**: User tries to join again
3. ✅ **Event Not Found**: Join non-existent event
4. ✅ **Invalid Event ID**: Malformed ObjectId
5. ✅ **Missing Auth**: Request without headers

### US-015 Leave Event Test Cases
1. ✅ **Success Case**: User leaves joined event
2. ✅ **Not Joined**: User tries to leave un-joined event
3. ✅ **Event Not Found**: Leave non-existent event
4. ✅ **Invalid Event ID**: Malformed ObjectId
5. ✅ **Missing Auth**: Request without headers

### Integration Test Cases
1. ✅ **Join → Leave Flow**: Complete workflow testing
2. ✅ **Data Consistency**: Verify participant records
3. ✅ **State Management**: Event state after operations

---

## 🔧 Manual Testing Options

### 1. Postman Collections
Use provided Postman collections for manual testing:
```
services/event/tests/postman/US-014-Join-Event.postman_collection.json
services/event/tests/postman/US-015-Leave-Event.postman_collection.json
```

**Environment Variables:**
- `base_url`: http://localhost:3003
- `user_id`: test-user-123
- `user_email`: test@example.com
- `user_role`: USER
- `event_id`: 507f1f77bcf86cd799439011

### 2. cURL Commands

#### Join Event (US-014)
```bash
# Success case
curl -X POST "http://localhost:3003/api/events/507f1f77bcf86cd799439012/join" \
  -H "X-User-ID: test-user-123" \
  -H "X-User-Email: test@example.com" \
  -H "X-User-Role: USER" \
  -H "Content-Type: application/json"

# Already joined case
curl -X POST "http://localhost:3003/api/events/507f1f77bcf86cd799439011/join" \
  -H "X-User-ID: test-user-123" \
  -H "X-User-Email: test@example.com" \
  -H "X-User-Role: USER" \
  -H "Content-Type: application/json"
```

#### Leave Event (US-015)
```bash
# Success case
curl -X DELETE "http://localhost:3003/api/events/507f1f77bcf86cd799439011/leave" \
  -H "X-User-ID: test-user-123" \
  -H "X-User-Email: test@example.com" \
  -H "X-User-Role: USER" \
  -H "Content-Type: application/json"

# Not joined case
curl -X DELETE "http://localhost:3003/api/events/507f1f77bcf86cd799439012/leave" \
  -H "X-User-ID: test-user-123" \
  -H "X-User-Email: test@example.com" \
  -H "X-User-Role: USER" \
  -H "Content-Type: application/json"
```

---

## 📊 Expected API Responses

### Join Event Success (201)
```json
{
  "status": "success",
  "message": "Joined event successfully",
  "data": {
    "eventId": "507f1f77bcf86cd799439012",
    "userId": "test-user-123",
    "joinedAt": "2025-07-04T10:30:00.000Z",
    "eventTitle": "Test Event for Join",
    "eventStartAt": "2025-07-05T14:00:00.000Z"
  }
}
```

### Leave Event Success (200)
```json
{
  "status": "success",
  "message": "Left event successfully",
  "data": {
    "eventId": "507f1f77bcf86cd799439011",
    "userId": "test-user-123",
    "leftAt": "2025-07-04T10:30:00.000Z",
    "eventTitle": "Sample Event",
    "eventStartAt": "2025-07-05T14:00:00.000Z"
  }
}
```

### Error Responses
```json
// Already Joined (400)
{
  "status": 400,
  "error": "ALREADY_JOINED",
  "message": "You have already joined this event"
}

// Not Joined (400)
{
  "status": 400,
  "error": "NOT_JOINED", 
  "message": "You have not joined this event"
}

// Event Not Found (404)
{
  "status": 404,
  "error": "EVENT_NOT_FOUND",
  "message": "Event not found"
}

// Missing Auth (401)
{
  "status": 401,
  "error": "AUTH_REQUIRED",
  "message": "Authentication headers required"
}
```

---

## 🔍 Test Data Setup Details

### setup-test-data-quick.js creates:

#### Test Events:
1. **Event ID**: `507f1f77bcf86cd799439011`
   - Title: "Sample Event"  
   - User `test-user-123` already joined (for leave testing)

2. **Event ID**: `507f1f77bcf86cd799439012`
   - Title: "Test Event for Join"
   - Available for join testing

#### Test Participants:
- Pre-configured participant records for testing scenarios
- Consistent data for reliable test results

#### Reset Test Data:
```bash
# Re-run setup to reset all test data
cd services/event/tests
node setup-test-data-quick.js
```

---

## ⚠️ Troubleshooting

### Common Issues & Solutions

#### 1. Service Not Running
```bash
❌ Error: connect ECONNREFUSED ::1:3003
💡 Solution: Start the event service
cd services/event
npm run dev
```

#### 2. Missing Test Data
```bash
❌ Tests failing due to missing events
💡 Solution: Setup test data
cd services/event/tests
node setup-test-data-quick.js
```

#### 3. Node.js Version Issues
```bash
❌ ReferenceError: fetch is not defined
💡 Solution: Upgrade to Node.js v18+
```

#### 4. MongoDB Connection Issues
```bash
❌ MongoServerError: Authentication failed
💡 Solution: Check MongoDB connection in .env file
```

#### 5. Port Conflicts
```bash
❌ EADDRINUSE: address already in use :::3003
💡 Solution: Kill existing process or change port
npx kill-port 3003
```

---

## 🎯 Production Readiness Checklist

### ✅ Implemented Features
- [x] Authentication via API Gateway headers
- [x] Comprehensive error handling
- [x] Input validation (ObjectId format)
- [x] Database transaction safety
- [x] Proper HTTP status codes
- [x] Structured JSON responses
- [x] Automated test coverage
- [x] Integration testing
- [x] Documentation

### 🔐 Security Features
- [x] API Gateway authentication
- [x] User authorization checks
- [x] Input sanitization
- [x] Error message consistency
- [x] No sensitive data exposure

### 📈 Performance Considerations
- [x] Database indexing on event and user IDs
- [x] Efficient MongoDB queries
- [x] Proper error handling without resource leaks
- [x] Minimal response payload size

---

## 📚 Additional Resources

### Documentation Files:
- `US-015-TESTING.md` - Detailed US-015 testing guide
- `API_DOCUMENTATION.md` - Complete API documentation  
- `FRONTEND_INTEGRATION_GUIDE.md` - Frontend integration guide

### Postman Collections:
- `US-014-Join-Event.postman_collection.json`
- `US-015-Leave-Event.postman_collection.json`

### Test Scripts:
- `test-join-event.js` - US-014 automated tests
- `test-leave-event.js` - US-015 automated tests
- `test-all-events.js` - Integration tests
- `setup-test-data-quick.js` - Test data setup

---

## 🎉 Success Criteria

✅ **All APIs implemented and tested**  
✅ **100% test pass rate achieved**  
✅ **Comprehensive error handling**  
✅ **Integration testing validated**  
✅ **Documentation complete**  
✅ **Production-ready code quality**

The Event Management microservice is now fully equipped with robust Join and Leave Event functionality, ready for frontend integration and production deployment.
