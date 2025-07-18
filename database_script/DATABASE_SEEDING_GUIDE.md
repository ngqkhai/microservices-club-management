# Database Seeding Guide

This guide explains how to seed your Club Management System databases with realistic test data that maintains consistency across all services.

## Overview

The seeding process creates comprehensive test data for:
- **PostgreSQL databases**: Auth, Finance, and Notify services
- **MongoDB databases**: Club and Event services
- **Cross-service consistency**: Foreign key relationships maintained using string UUIDs

## Prerequisites

1. Ensure all database services are running:
   ```bash
   # Start PostgreSQL (Auth, Finance, Notify services)
   # Start MongoDB (Club, Event services)
   ```

2. Ensure databases are created and schemas are set up:
   ```bash
   # Run setup scripts first
   psql -U postgres -h localhost -p 5432 -d auth_service < database_script/setup-postgresql.sql
   mongo "mongodb://localhost:27017" < database_script/setup-mongodb.js
   ```

## Seeding Process

### Step 1: Seed PostgreSQL Databases

```bash
# Seed Auth, Finance, and Notify services
psql -U postgres -h localhost -p 5432 -d auth_service < database_script/seed-postgresql.sql
```

This will create:
- **10 test users** with different roles (admin, club managers, students)
- **Financial data** for 3 clubs with budgets, requests, and expenses
- **Notification system** with various notification types
- **Activity posts** with user interactions

### Step 2: Seed MongoDB Databases

```bash
# Seed Club and Event services
mongo "mongodb://localhost:27017" < database_script/seed-mongodb.js
```

This will create:
- **4 clubs** representing different categories (Tech, Sports, Arts, Business)
- **10 memberships** linking users to clubs with different roles
- **4 recruitment campaigns** with Vietnamese localization
- **5 events** including tournaments, workshops, and exhibitions
- **Event registrations and interactions**

## Test Data Overview

### Users (PostgreSQL - Auth Service)
| User | Email | Role | Club Affiliation |
|------|-------|------|------------------|
| Nguyễn Văn Admin | admin@university.edu | ADMIN | System Administrator |
| Trần Thị Minh | manager.tech@university.edu | CLUB_MANAGER | Tech Club Manager |
| Lê Văn Thể | manager.sports@university.edu | CLUB_MANAGER | Sports Club Manager |
| Phạm Thị Hoa | manager.arts@university.edu | CLUB_MANAGER | Arts Club Manager |
| Nguyễn Thành Đạt | student1@university.edu | STUDENT | Tech Club Member |
| Võ Thị Lan | student2@university.edu | STUDENT | Multiple Clubs |
| Hoàng Minh Tú | student3@university.edu | STUDENT | Sports Club Member |
| Đặng Thị Mai | student4@university.edu | STUDENT | Pending Arts Club |
| Bùi Văn Hùng | student5@university.edu | STUDENT | Sports Club Member |
| Lý Thị Thu | student6@university.edu | STUDENT | Arts Club Member |

### Clubs (MongoDB - Club Service)
| Club | Category | Size | Manager | Status |
|------|----------|------|---------|--------|
| Câu lạc bộ Công nghệ | Công nghệ | 45 | Trần Thị Minh | ACTIVE |
| Câu lạc bộ Thể thao | Thể thao | 67 | Lê Văn Thể | ACTIVE |
| Câu lạc bộ Nghệ thuật | Nghệ thuật | 28 | Phạm Thị Hoa | ACTIVE |
| CLB Kinh doanh & Khởi nghiệp | Chuyên nghiệp | 32 | Võ Thị Lan | ACTIVE |

### Events (MongoDB - Event Service)
| Event | Club | Date | Capacity | Fee |
|-------|------|------|----------|-----|
| Giải bóng đá sinh viên 2025 | Sports | July 20 | 200 | 50,000 VND |
| Hackathon 2025 | Tech | July 20-21 | 100 | Free |
| Triển lãm Nghệ thuật 2025 | Arts | Aug 15-17 | 300 | Free |
| Workshop Kỹ năng thuyết trình | Business | Aug 5 | 40 | 100,000 VND |
| Giao lưu nghề nghiệp | Tech | Aug 10 | 200 | Free |

### Financial Data (PostgreSQL - Finance Service)
- **3 club budgets** with realistic Vietnamese amounts
- **Budget requests** for events and equipment
- **Expense tracking** with proper categories
- **Financial transactions** linked to specific events

## Data Consistency Features

### Cross-Service References
- **User IDs**: String UUIDs used consistently across all services
- **Club IDs**: MongoDB ObjectIds converted to strings for PostgreSQL references
- **Event IDs**: MongoDB ObjectIds converted to strings for financial tracking

### Vietnamese Localization
- **User profiles**: Vietnamese names, phone numbers, addresses
- **Content**: Event descriptions, club information in Vietnamese
- **Categories**: Localized categories (Công nghệ, Thể thao, Nghệ thuật, etc.)
- **Financial data**: Vietnamese currency (VND) and transaction descriptions

### Realistic Relationships
- **Club memberships**: Users have appropriate roles and join dates
- **Event registrations**: Students register for relevant events
- **Financial flows**: Money flows between clubs, events, and budgets
- **Notifications**: System notifications for various user actions

## Validation Scripts

### Check Data Integrity

```javascript
// MongoDB validation
use('club_service');
db.clubs.countDocuments(); // Should return 4
db.memberships.countDocuments(); // Should return 10

use('event_service');
db.events.countDocuments(); // Should return 5
db.registrations.countDocuments(); // Should return 5
```

```sql
-- PostgreSQL validation
-- Check in auth_service database
SELECT COUNT(*) FROM users; -- Should return 10
SELECT COUNT(*) FROM user_profiles; -- Should return 10

-- Check in finance_service database  
SELECT COUNT(*) FROM club_budgets; -- Should return 3
SELECT COUNT(*) FROM budget_requests; -- Should return 6
SELECT COUNT(*) FROM expenses; -- Should return 9

-- Check in notify_service database
SELECT COUNT(*) FROM notifications; -- Should return 15
SELECT COUNT(*) FROM activity_posts; -- Should return 8
```

### Verify Cross-Service References

```sql
-- Check if all club_ids in PostgreSQL exist in MongoDB
-- (Run this manually to verify consistency)
SELECT DISTINCT club_id FROM club_budgets;
-- Compare with: db.clubs.distinct("_id") in MongoDB

-- Check if all user_ids exist across services
SELECT DISTINCT user_id FROM user_profiles; 
-- Should match user_ids in MongoDB collections
```

## Usage Examples

### Login Test Users
```bash
# Test login with these credentials:
# Email: admin@university.edu, Password: admin123
# Email: manager.tech@university.edu, Password: manager123
# Email: student1@university.edu, Password: student123
```

### API Testing Scenarios
1. **Club Management**: Use club manager accounts to manage their clubs
2. **Event Registration**: Students can register for public events
3. **Financial Tracking**: Test budget requests and expense management
4. **Notifications**: Verify notification delivery for various actions

## Cleanup (Optional)

To reset the databases before re-seeding:

```sql
-- PostgreSQL cleanup
TRUNCATE users, user_profiles, club_budgets, budget_requests, expenses, notifications, activity_posts, interactions RESTART IDENTITY CASCADE;
```

```javascript
// MongoDB cleanup
use('club_service');
db.clubs.deleteMany({});
db.memberships.deleteMany({});
db.recruitment_campaigns.deleteMany({});

use('event_service');
db.events.deleteMany({});
db.registrations.deleteMany({});
db.event_interests.deleteMany({});
db.participants.deleteMany({});
db.organizers.deleteMany({});
```

## Troubleshooting

### Common Issues

1. **Foreign Key Violations**: Ensure PostgreSQL seeding runs before MongoDB seeding
2. **Duplicate Key Errors**: Run cleanup scripts before re-seeding
3. **Connection Issues**: Verify all database services are running and accessible

### Verify Database Connections

```bash
# Test PostgreSQL connection
psql -U postgres -h localhost -p 5432 -d auth_service -c "SELECT version();"

# Test MongoDB connection  
mongo "mongodb://localhost:27017" --eval "db.runCommand('ping')"
```

### Check Service Status
```bash
# Using PM2 (if services are running via PM2)
pm2 status

# Check specific service logs
pm2 logs auth-service
pm2 logs club-service
```

---

**Note**: This seed data is designed for development and testing purposes. Do not use in production environments. All passwords are weak and should be changed in production systems.
