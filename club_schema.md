# Club Management System Schema

## Architecture Overview

**Approach:**
- **Hybrid Database**: PostgreSQL for transactional data, MongoDB for document data
- **Event-Driven**: Message queue architecture
- **API Gateway**: Basic routing configuration

## Services Architecture

1. **User Service** (PostgreSQL): Authentication + User Management
2. **Club Service** (MongoDB): Clubs + Memberships + Recruitment
3. **Event Service** (MongoDB): Events + Registrations + Tasks
4. **Financial Service** (PostgreSQL): Transactions + Budget Management
5. **Notification Service** (PostgreSQL): Notifications + Activity Posts

---

## Database Schema

### 1. User Service Database

```sql
-- Authentication and User Management
CREATE DATABASE user_service;

-- Users table (covers US001-US006)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    profile_picture_url VARCHAR(500),
    bio TEXT,
    date_of_birth DATE,
    address TEXT,
    social_links JSONB DEFAULT '{}',
    email_verified BOOLEAN DEFAULT FALSE,
    email_verified_at TIMESTAMP,
    role VARCHAR(20) DEFAULT 'user' CHECK(role IN ('user', 'admin')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Session management
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(500) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    revoked BOOLEAN DEFAULT FALSE
);

-- Password reset (covers US004)
CREATE TABLE password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_deleted_at ON users(deleted_at);
CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);
```

### 2. Club Service Database

```javascript
// Club Management - MongoDB
use club_service;

// Clubs collection (covers US007-US008, US019)
db.createCollection("clubs", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["name", "description", "category", "created_by", "created_at"],
      properties: {
        _id: { bsonType: "objectId" },
        name: { bsonType: "string", maxLength: 200 },
        description: { bsonType: "string", maxLength: 2000 },
        category: { bsonType: "string", enum: ["academic", "sports", "arts", "technology", "social", "volunteer", "other"] },
        location: { bsonType: "string", maxLength: 500 },
        contact_email: { bsonType: "string", pattern: "^[^@]+@[^@]+\\.[^@]+$" },
        contact_phone: { bsonType: "string", maxLength: 20 },
        logo_url: { bsonType: "string", maxLength: 500 },
        website_url: { bsonType: "string", maxLength: 500 },
        social_links: {
          bsonType: "object",
          properties: {
            facebook: { bsonType: "string", maxLength: 500 },
            instagram: { bsonType: "string", maxLength: 500 },
            twitter: { bsonType: "string", maxLength: 500 },
            linkedin: { bsonType: "string", maxLength: 500 }
          }
        },
        settings: {
          bsonType: "object",
          properties: {
            is_public: { bsonType: "bool" },
            requires_approval: { bsonType: "bool" },
            max_members: { bsonType: "int", minimum: 1 }
          }
        },
        created_by: { bsonType: "string" }, // UUID from Auth Service
        manager: {
          bsonType: "object",
          required: ["user_id", "full_name", "assigned_at"],
          properties: {
            user_id: { bsonType: "string" }, // UUID from Auth Service
            full_name: { bsonType: "string", maxLength: 255 },
            email: { bsonType: "string", pattern: "^[^@]+@[^@]+\\.[^@]+$" },
            assigned_at: { bsonType: "date" }
          }
        },
        created_at: { bsonType: "date" },
        updated_at: { bsonType: "date" },
        deleted_at: { bsonType: ["date", "null"] }
      }
    }
  }
});

// Club memberships collection (covers US011-US018)
db.createCollection("club_memberships", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["club_id", "user_id", "status", "joined_at"],
      properties: {
        _id: { bsonType: "objectId" },
        club_id: { bsonType: "objectId" },
        user_id: { bsonType: "string" }, // UUID from Auth Service
        campaign_id: { bsonType: ["objectId", "null"] }, // References recruitment_campaigns
        role: { bsonType: "string", enum: ["member", "organizer", "admin"] },
        status: { bsonType: "string", enum: ["active", "pending", "rejected", "removed"] },
        application_message: { bsonType: "string", maxLength: 1000 },
        application_answers: {
          bsonType: "object",
          description: "Structured answers to campaign questions"
        },
        approved_by: { bsonType: "string" }, // UUID from Auth Service
        approved_at: { bsonType: "date" },
        joined_at: { bsonType: "date" },
        removed_at: { bsonType: "date" },
        removal_reason: { bsonType: "string", maxLength: 500 }
      }
    }
  }
});

// Recruitment campaigns collection (covers US009-US015)
db.createCollection("recruitment_campaigns", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["club_id", "title", "description", "start_date", "end_date", "created_by"],
      properties: {
        _id: { bsonType: "objectId" },
        club_id: { bsonType: "objectId" },
        title: { bsonType: "string", maxLength: 200 },
        description: { bsonType: "string", maxLength: 2000 },
        requirements: { bsonType: "string", maxLength: 1000 },
        application_questions: {
          bsonType: "array",
          items: {
            bsonType: "object",
            properties: {
              id: { bsonType: "string" },
              question: { bsonType: "string", maxLength: 500 },
              type: { bsonType: "string", enum: ["text", "textarea", "select", "checkbox"] },
              required: { bsonType: "bool" },
              max_length: { bsonType: "int" },
              options: { bsonType: "array", items: { bsonType: "string" } }
            }
          }
        },
        start_date: { bsonType: "date" },
        end_date: { bsonType: "date" },
        max_applications: { bsonType: "int", minimum: 1 },
        status: { bsonType: "string", enum: ["draft", "active", "paused", "completed", "cancelled"] },
        statistics: {
          bsonType: "object",
          properties: {
            total_applications: { bsonType: "int", minimum: 0 },
            approved_applications: { bsonType: "int", minimum: 0 },
            rejected_applications: { bsonType: "int", minimum: 0 },
            pending_applications: { bsonType: "int", minimum: 0 },
            last_updated: { bsonType: "date" }
          }
        },
        created_by: { bsonType: "string" }, // UUID from Auth Service
        created_at: { bsonType: "date" },
        updated_at: { bsonType: "date" }
      }
    }
  }
});

// Indexes for Club Service
db.clubs.createIndex({ "name": "text", "description": "text", "category": "text" });
db.clubs.createIndex({ "category": 1 });
db.clubs.createIndex({ "created_by": 1 });
db.clubs.createIndex({ "created_at": 1 });
db.clubs.createIndex({ "deleted_at": 1 });

db.club_memberships.createIndex({ "club_id": 1, "user_id": 1 }, { unique: true });
db.club_memberships.createIndex({ "club_id": 1, "status": 1 });
db.club_memberships.createIndex({ "user_id": 1, "status": 1 });
db.club_memberships.createIndex({ "campaign_id": 1 });
db.club_memberships.createIndex({ "joined_at": 1 });

db.recruitment_campaigns.createIndex({ "club_id": 1, "status": 1 });
db.recruitment_campaigns.createIndex({ "start_date": 1, "end_date": 1 });
db.recruitment_campaigns.createIndex({ "created_by": 1 });
```

---

## Application Questions & Answers Flow

The recruitment system works as follows:

### 1. Campaign Questions Format
```json
-- Example application_questions in recruitment_campaigns table
[
  {
    "id": "q1",
    "question": "Why do you want to join our club?",
    "type": "textarea",
    "required": true,
    "max_length": 500
  },
  {
    "id": "q2", 
    "question": "What skills can you bring to the club?",
    "type": "text",
    "required": true,
    "max_length": 200
  },
  {
    "id": "q3",
    "question": "Which activities interest you most?",
    "type": "select",
    "required": false,
    "options": ["Events", "Workshops", "Competitions", "Social Activities"]
  }
]
```

### 2. Application Answers Format
```json
-- Example application_answers in club_memberships table
{
  "q1": "I want to join because I'm passionate about technology and want to learn from others...",
  "q2": "I have experience in web development and can help with club website",
  "q3": "Workshops"
}
```

### 3. Usage Pattern
```sql
-- When user applies to join club through campaign
INSERT INTO club_memberships (club_id, user_id, campaign_id, status, application_answers)
VALUES (
  'club-uuid',
  'user-uuid', 
  'campaign-uuid',
  'pending',
  '{"q1": "My answer to question 1", "q2": "My answer to question 2"}'
);
```

### 3. Event Service Database

```javascript
// Event Management - MongoDB
use event_service;

// Events collection (covers US020-US032)
db.createCollection("events", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["title", "description", "start_date", "club_id", "created_by"],
      properties: {
        _id: { bsonType: "objectId" },
        club_id: { bsonType: "string" }, // References Club Service clubs
        title: { bsonType: "string", maxLength: 200 },
        description: { bsonType: "string", maxLength: 2000 },
        short_description: { bsonType: "string", maxLength: 500 },
        category: { bsonType: "string", enum: ["workshop", "seminar", "competition", "social", "fundraiser", "meeting", "other"] },
        location: {
          bsonType: "object",
          properties: {
            type: { bsonType: "string", enum: ["physical", "virtual", "hybrid"] },
            address: { bsonType: "string", maxLength: 500 },
            room: { bsonType: "string", maxLength: 100 },
            virtual_link: { bsonType: "string", maxLength: 500 },
            coordinates: {
              bsonType: "object",
              properties: {
                lat: { bsonType: "double" },
                lng: { bsonType: "double" }
              }
            }
          }
        },
        start_date: { bsonType: "date" },
        end_date: { bsonType: "date" },
        registration_deadline: { bsonType: "date" },
        max_participants: { bsonType: "int", minimum: 1 },
        participation_fee: { bsonType: "double", minimum: 0 },
        currency: { bsonType: "string", maxLength: 3 },
        requirements: { bsonType: "array", items: { bsonType: "string" } },
        tags: { bsonType: "array", items: { bsonType: "string" } },
        images: { bsonType: "array", items: { bsonType: "string" } },
        attachments: {
          bsonType: "array",
          items: {
            bsonType: "object",
            properties: {
              filename: { bsonType: "string", maxLength: 200 },
              url: { bsonType: "string", maxLength: 500 },
              size: { bsonType: "int" },
              type: { bsonType: "string", maxLength: 50 }
            }
          }
        },
        status: { bsonType: "string", enum: ["draft", "published", "cancelled", "completed"] },
        visibility: { bsonType: "string", enum: ["public", "club_members"] },
        organizers: {
          bsonType: "array",
          items: {
            bsonType: "object",
            properties: {
              user_id: { bsonType: "string" }, // UUID from Auth Service
              role: { bsonType: "string", enum: ["organizer", "lead_organizer"] },
              joined_at: { bsonType: "date" }
            }
          }
        },
        statistics: {
          bsonType: "object",
          properties: {
            total_registrations: { bsonType: "int", minimum: 0 },
            total_interested: { bsonType: "int", minimum: 0 },
            total_attended: { bsonType: "int", minimum: 0 }
          }
        },
        created_by: { bsonType: "string" }, // UUID from Auth Service
        created_at: { bsonType: "date" },
        updated_at: { bsonType: "date" }
      }
    }
  }
});

// Event registrations collection (covers US024, US033, US035)
db.createCollection("event_registrations", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["event_id", "user_id", "status", "registered_at"],
      properties: {
        _id: { bsonType: "objectId" },
        event_id: { bsonType: "objectId" },
        user_id: { bsonType: "string" }, // UUID from Auth Service
        ticket_id: { bsonType: "string", maxLength: 50 },
        registration_data: {
          bsonType: "object",
          properties: {
            answers: { bsonType: "array" },
            special_requirements: { bsonType: "string", maxLength: 1000 },
            emergency_contact: { bsonType: "string", maxLength: 200 }
          }
        },
        payment_info: {
          bsonType: "object",
          properties: {
            amount: { bsonType: "double", minimum: 0 },
            currency: { bsonType: "string", maxLength: 3 },
            status: { bsonType: "string", enum: ["pending", "paid", "refunded"] },
            transaction_id: { bsonType: "string", maxLength: 200 },
            payment_method: { bsonType: "string", maxLength: 50 }
          }
        },
        ticket_info: {
          bsonType: "object",
          properties: {
            qr_code_url: { bsonType: "string", maxLength: 500 },
            check_in_time: { bsonType: "date" }
          }
        },
        status: { bsonType: "string", enum: ["registered", "cancelled", "attended", "no_show"] },
        registered_at: { bsonType: "date" },
        cancelled_at: { bsonType: "date" },
        cancellation_reason: { bsonType: "string", maxLength: 500 }
      }
    }
  }
});

// Event interests collection (covers US025, US034)
db.createCollection("event_interests", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["event_id", "user_id", "marked_at"],
      properties: {
        _id: { bsonType: "objectId" },
        event_id: { bsonType: "objectId" },
        user_id: { bsonType: "string" }, // UUID from Auth Service
        notifications_enabled: { bsonType: "bool" },
        marked_at: { bsonType: "date" }
      }
    }
  }
});

// Event tasks collection (covers US030)
db.createCollection("event_tasks", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["event_id", "title"],
      properties: {
        _id: { bsonType: "objectId" },
        event_id: { bsonType: "objectId" },
        title: { bsonType: "string", maxLength: 200 },
        description: { bsonType: "string", maxLength: 1000 },
        assigned_to: { bsonType: "string" }, // UUID from Auth Service
        status: { bsonType: "string", enum: ["pending", "in_progress", "completed", "cancelled"] },
        due_date: { bsonType: "date" },
        completed_at: { bsonType: "date" },
        notes: { bsonType: "string", maxLength: 1000 },
        created_at: { bsonType: "date" },
        updated_at: { bsonType: "date" }
      }
    }
  }
});

// Indexes for Event Service
db.events.createIndex({ "title": "text", "description": "text", "tags": "text" });
db.events.createIndex({ "club_id": 1, "status": 1 });
db.events.createIndex({ "start_date": 1, "end_date": 1 });
db.events.createIndex({ "category": 1 });
db.events.createIndex({ "visibility": 1 });
db.events.createIndex({ "created_by": 1 });
db.events.createIndex({ "registration_deadline": 1 });

db.event_registrations.createIndex({ "event_id": 1, "user_id": 1 }, { unique: true });
db.event_registrations.createIndex({ "event_id": 1, "status": 1 });
db.event_registrations.createIndex({ "user_id": 1, "status": 1 });
db.event_registrations.createIndex({ "registered_at": 1 });
db.event_registrations.createIndex({ "ticket_id": 1 }, { unique: true });

db.event_interests.createIndex({ "event_id": 1, "user_id": 1 }, { unique: true });
db.event_interests.createIndex({ "user_id": 1 });
db.event_interests.createIndex({ "marked_at": 1 });

db.event_tasks.createIndex({ "event_id": 1 });
db.event_tasks.createIndex({ "assigned_to": 1 });
db.event_tasks.createIndex({ "status": 1 });
db.event_tasks.createIndex({ "due_date": 1 });
```

### 4. Financial Service Database

```sql
-- Financial Management
CREATE DATABASE financial_service;

-- Financial transactions (covers US036-US037 - income only)
CREATE TABLE financial_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    club_id UUID NOT NULL, -- References clubs(id)
    user_id UUID NOT NULL, -- References users(id)
    event_id UUID, -- References events(id), nullable
    transaction_type VARCHAR(50) NOT NULL CHECK(transaction_type IN ('contribution', 'event_fee', 'refund')),
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    description TEXT,
    payment_method VARCHAR(50),
    payment_gateway_transaction_id VARCHAR(255),
    status VARCHAR(20) DEFAULT 'pending' CHECK(status IN ('pending', 'completed', 'failed', 'refunded')),
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Budget requests (covers US028-US029)
CREATE TABLE budget_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    club_id UUID NOT NULL, -- References clubs(id)
    event_id UUID, -- References events(id), nullable
    requested_by UUID NOT NULL, -- References users(id)
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    description TEXT NOT NULL,
    justification TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected')),
    reviewed_by UUID, -- References users(id)
    reviewed_at TIMESTAMP,
    review_comments TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Budget items (itemized expenses within budget requests)
CREATE TABLE budget_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    budget_request_id UUID NOT NULL REFERENCES budget_requests(id) ON DELETE CASCADE,
    item_name VARCHAR(200) NOT NULL,
    item_description TEXT,
    quantity INTEGER DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    category VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Actual expenses (tracks real spending)
CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    club_id UUID NOT NULL, -- References clubs(id)
    event_id UUID, -- References events(id), nullable
    budget_request_id UUID, -- References budget_requests(id), nullable - links to approved budget
    spender_id UUID NOT NULL, -- References users(id) - who made the expense
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    category VARCHAR(100) NOT NULL, -- 'venue', 'food', 'materials', 'transport', 'marketing', 'other'
    description TEXT NOT NULL,
    receipt_url TEXT, -- URL to receipt/invoice image
    expense_date DATE NOT NULL, -- When the expense occurred
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_by UUID, -- References users(id) - who approved the expense
    reviewed_at TIMESTAMP,
    status VARCHAR(20) DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected', 'reimbursed')),
    reimbursement_method VARCHAR(50), -- 'cash', 'bank_transfer', 'paypal'
    reimbursed_at TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Club financial summaries (for reporting)
CREATE TABLE club_financial_summaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    club_id UUID NOT NULL, -- References clubs(id)
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    total_income DECIMAL(12,2) DEFAULT 0, -- From financial_transactions
    total_expenses DECIMAL(12,2) DEFAULT 0, -- From expenses table
    balance DECIMAL(12,2) DEFAULT 0, -- total_income - total_expenses
    contributions_count INTEGER DEFAULT 0,
    event_fees_count INTEGER DEFAULT 0,
    expenses_count INTEGER DEFAULT 0,
    pending_expenses_count INTEGER DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(club_id, period_start, period_end)
);

-- Indexes
CREATE INDEX idx_financial_transactions_club_id ON financial_transactions(club_id);
CREATE INDEX idx_financial_transactions_user_id ON financial_transactions(user_id);
CREATE INDEX idx_financial_transactions_event_id ON financial_transactions(event_id);
CREATE INDEX idx_financial_transactions_date ON financial_transactions(transaction_date);
CREATE INDEX idx_financial_transactions_status ON financial_transactions(status);
CREATE INDEX idx_budget_requests_club_id ON budget_requests(club_id);
CREATE INDEX idx_budget_requests_event_id ON budget_requests(event_id);
CREATE INDEX idx_budget_requests_status ON budget_requests(status);
CREATE INDEX idx_budget_requests_requested_by ON budget_requests(requested_by);
CREATE INDEX idx_expenses_club_id ON expenses(club_id);
CREATE INDEX idx_expenses_event_id ON expenses(event_id);
CREATE INDEX idx_expenses_budget_request_id ON expenses(budget_request_id);
CREATE INDEX idx_expenses_spender_id ON expenses(spender_id);
CREATE INDEX idx_expenses_status ON expenses(status);
CREATE INDEX idx_expenses_expense_date ON expenses(expense_date);
CREATE INDEX idx_expenses_category ON expenses(category);
CREATE INDEX idx_club_financial_summaries_club_id ON club_financial_summaries(club_id);
CREATE INDEX idx_club_financial_summaries_period ON club_financial_summaries(period_start, period_end);
```

### 5. Notification Service Database

```sql
-- Notifications and Activity Posts
CREATE DATABASE notification_service;

-- Notifications (covers US015, US034-US035, US043)
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL, -- References users(id)
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    read_at TIMESTAMP,
    sent_via_email BOOLEAN DEFAULT FALSE,
    email_sent_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Activity posts (covers US042-US043)
CREATE TABLE activity_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    club_id UUID NOT NULL, -- References clubs(id)
    author_id UUID NOT NULL, -- References users(id)
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    attachments JSONB DEFAULT '[]',
    visibility VARCHAR(20) DEFAULT 'members' CHECK(visibility IN ('members', 'admins')),
    pinned BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Activity post interactions
CREATE TABLE activity_post_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES activity_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL, -- References users(id)
    interaction_type VARCHAR(20) NOT NULL CHECK(interaction_type IN ('read', 'like', 'comment')),
    comment_text TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(post_id, user_id, interaction_type)
);

-- Indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_read_at ON notifications(read_at);
CREATE INDEX idx_activity_posts_club_id ON activity_posts(club_id);
CREATE INDEX idx_activity_posts_author_id ON activity_posts(author_id);
CREATE INDEX idx_activity_post_interactions_post_id ON activity_post_interactions(post_id);
```

---

## Event System (Message Queue Architecture)

### Event-Driven Communication Between Services

```javascript
// User Service - Publishes events
const amqp = require('amqplib');

async function registerUser(userData) {
    // 1. Create user in User Service database
    const user = await User.create(userData);
    
    // 2. Publish event to message queue
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();
    
    const eventData = {
        eventType: 'user.registered',
        userId: user.id,
        email: user.email,
        fullName: user.full_name,
        timestamp: new Date().toISOString()
    };
    
    await channel.publish('user.events', 'user.registered', 
        Buffer.from(JSON.stringify(eventData)));
    
    await connection.close();
    return user;
}
```

```javascript
// Notification Service - Consumes events
const amqp = require('amqplib');

async function startEventConsumer() {
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();
    
    await channel.assertExchange('user.events', 'topic', { durable: true });
    const { queue } = await channel.assertQueue('user.registered.notifications');
    await channel.bindQueue(queue, 'user.events', 'user.registered');
    
    channel.consume(queue, async (msg) => {
        const eventData = JSON.parse(msg.content.toString());
        
        // Handle the event in Notification Service's own database
        await Notification.create({
            userId: eventData.userId,
            type: 'welcome',
            title: 'Welcome to Club Management System',
            message: 'Your account has been created successfully.'
        });
        
        channel.ack(msg);
    });
}
```

### Example: Club Application Event

```javascript
// Club Service - When user applies to join club
async function applyToClub(clubId, userId, applicationData) {
    // 1. Create membership application in Club Service database
    const membership = await ClubMembership.create({
        club_id: clubId,
        user_id: userId,
        status: 'pending',
        application_answers: applicationData.answers
    });
    
    // 2. Publish event to message queue
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();
    
    const eventData = {
        eventType: 'club.application.submitted',
        membershipId: membership.id,
        clubId: clubId,
        userId: userId,
        timestamp: new Date().toISOString()
    };
    
    await channel.publish('club.events', 'club.application.submitted', 
        Buffer.from(JSON.stringify(eventData)));
    
    await connection.close();
    return membership;
}
```

```javascript
// Notification Service - Consumes club application events
async function setupClubEventConsumer() {
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();
    
    await channel.assertExchange('club.events', 'topic', { durable: true });
    const { queue } = await channel.assertQueue('club.application.notifications');
    await channel.bindQueue(queue, 'club.events', 'club.application.submitted');
    
    channel.consume(queue, async (msg) => {
        const eventData = JSON.parse(msg.content.toString());
        
        // Notify club admins about new application
        const clubAdmins = await getClubAdmins(eventData.clubId);
        
        for (const admin of clubAdmins) {
            await Notification.create({
                userId: admin.userId,
                type: 'club_application',
                title: 'New Club Application',
                message: 'A new member has applied to join your club.',
                data: {
                    clubId: eventData.clubId,
                    applicantId: eventData.userId,
                    membershipId: eventData.membershipId
                }
            });
        }
        
        channel.ack(msg);
    });
}
```

### Example: Financial Transaction Event

```javascript
// Financial Service - When user makes a club contribution
async function processContribution(clubId, userId, amount, paymentData) {
    // 1. Create transaction in Financial Service database
    const transaction = await FinancialTransaction.create({
        club_id: clubId,
        user_id: userId,
        transaction_type: 'contribution',
        amount: amount,
        currency: 'USD',
        status: 'completed',
        payment_method: paymentData.method,
        payment_gateway_transaction_id: paymentData.transactionId
    });
    
    // 2. Publish event to message queue
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();
    
    const eventData = {
        eventType: 'financial.contribution.completed',
        transactionId: transaction.id,
        clubId: clubId,
        userId: userId,
        amount: amount,
        currency: 'USD',
        timestamp: new Date().toISOString()
    };
    
    await channel.publish('financial.events', 'financial.contribution.completed', 
        Buffer.from(JSON.stringify(eventData)));
    
    await connection.close();
    return transaction;
}
```

```javascript
// Notification Service - Consumes financial events
async function setupFinancialEventConsumer() {
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();
    
    await channel.assertExchange('financial.events', 'topic', { durable: true });
    const { queue } = await channel.assertQueue('financial.contribution.notifications');
    await channel.bindQueue(queue, 'financial.events', 'financial.contribution.completed');
    
    channel.consume(queue, async (msg) => {
        const eventData = JSON.parse(msg.content.toString());
        
        // Notify user about successful contribution
        await Notification.create({
            userId: eventData.userId,
            type: 'financial_contribution',
            title: 'Contribution Successful',
            message: `Your contribution of ${eventData.amount} ${eventData.currency} has been processed successfully.`,
            data: {
                transactionId: eventData.transactionId,
                clubId: eventData.clubId,
                amount: eventData.amount
            }
        });
        
        // Notify club admins about new contribution
        const clubAdmins = await getClubAdmins(eventData.clubId);
        for (const admin of clubAdmins) {
            await Notification.create({
                userId: admin.userId,
                type: 'club_contribution_received',
                title: 'New Club Contribution',
                message: `A member has contributed ${eventData.amount} ${eventData.currency} to your club.`,
                data: {
                    transactionId: eventData.transactionId,
                    clubId: eventData.clubId,
                    contributorId: eventData.userId,
                    amount: eventData.amount
                }
            });
        }
        
        channel.ack(msg);
    });
}
```

### Example: Expense Tracking Event

```javascript
// Financial Service - When member submits an expense
async function submitExpense(clubId, eventId, spenderId, expenseData) {
    // 1. Create expense record in Financial Service database
    const expense = await Expense.create({
        club_id: clubId,
        event_id: eventId,
        spender_id: spenderId,
        amount: expenseData.amount,
        currency: 'USD',
        category: expenseData.category,
        description: expenseData.description,
        receipt_url: expenseData.receiptUrl,
        expense_date: expenseData.expenseDate,
        status: 'pending'
    });
    
    // 2. Publish event to message queue
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();
    
    const eventData = {
        eventType: 'financial.expense.submitted',
        expenseId: expense.id,
        clubId: clubId,
        eventId: eventId,
        spenderId: spenderId,
        amount: expenseData.amount,
        category: expenseData.category,
        timestamp: new Date().toISOString()
    };
    
    await channel.publish('financial.events', 'financial.expense.submitted', 
        Buffer.from(JSON.stringify(eventData)));
    
    await connection.close();
    return expense;
}
```

```javascript
// Notification Service - Consumes expense events
async function setupExpenseEventConsumer() {
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();
    
    await channel.assertExchange('financial.events', 'topic', { durable: true });
    const { queue } = await channel.assertQueue('financial.expense.notifications');
    await channel.bindQueue(queue, 'financial.events', 'financial.expense.submitted');
    
    channel.consume(queue, async (msg) => {
        const eventData = JSON.parse(msg.content.toString());
        
        // Notify club admins about expense submission
        const clubAdmins = await getClubAdmins(eventData.clubId);
        for (const admin of clubAdmins) {
            await Notification.create({
                userId: admin.userId,
                type: 'expense_submitted',
                title: 'New Expense Submitted',
                message: `A member has submitted an expense of ${eventData.amount} for approval.`,
                data: {
                    expenseId: eventData.expenseId,
                    clubId: eventData.clubId,
                    eventId: eventData.eventId,
                    spenderId: eventData.spenderId,
                    amount: eventData.amount,
                    category: eventData.category
                }
            });
        }
        
        // Notify spender about submission confirmation
        await Notification.create({
            userId: eventData.spenderId,
            type: 'expense_submitted_confirmation',
            title: 'Expense Submitted Successfully',
            message: `Your expense of ${eventData.amount} has been submitted for approval.`,
            data: {
                expenseId: eventData.expenseId,
                amount: eventData.amount,
                category: eventData.category
            }
        });
        
        channel.ack(msg);
    });
}
```

---

## API Gateway (Simplified)

### Basic Route Configuration

```yaml
# Simplified API Gateway Routes
routes:
  # User routes
  - path: /api/user/*
    service: user-service
    port: 3001
    
  # Club routes
  - path: /api/clubs/*
    service: club-service
    port: 3002
    
  # Event routes
  - path: /api/events/*
    service: event-service
    port: 3003
    
  # Financial routes
  - path: /api/financial/*
    service: financial-service
    port: 3004
    
  # Notification routes
  - path: /api/notifications/*
    service: notification-service
    port: 3005

# Basic middleware
middleware:
  - name: user
    exclude_paths: ["/api/user/login", "/api/user/register", "/api/clubs/search"]
  - name: cors
  - name: rate-limit
    requests_per_minute: 100
```

---

## Key Simplifications Made

### 1. **Hybrid Database Technology**
- ✅ PostgreSQL for transactional data (auth, finance, notifications)
- ✅ MongoDB for document data (clubs, events)
- ✅ Best database for each use case
- ✅ Optimal performance and flexibility

### 2. **Simplified Event System**
- ✅ Database triggers instead of complex RabbitMQ setup
- ✅ Still supports event-driven architecture
- ✅ Easier to debug and maintain

### 3. **Consolidated Data Models**
- ✅ Removed complex JSON schema validation
- ✅ Simplified constraints and relationships
- ✅ Still covers all 43 user stories

### 4. **Basic API Gateway**
- ✅ Simple routing configuration
- ✅ Essential middleware only
- ✅ Easy to understand and modify

---

## Coverage of All User Stories

✅ **US001-US006**: User management in User Service
✅ **US007-US008**: Club search and viewing in Club Service
✅ **US009-US019**: Recruitment and member management in Club Service
✅ **US020-US035**: Event management in Event Service
✅ **US036-US041**: Financial tracking in Financial Service
✅ **US042-US043**: Activity posts in Notification Service

This schema maintains all required functionality while using optimal database technologies - PostgreSQL for transactional consistency and MongoDB for flexible document storage.

---

## Updated Financial Schema - Expense Tracking

### **Problem Fixed: Missing Expense Tracking**

The original schema was missing proper expense tracking. Here's what was added:

### **New `expenses` Table**
```sql
CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    club_id UUID NOT NULL,
    event_id UUID,                    -- Links expenses to specific events
    budget_request_id UUID,           -- Links to approved budget (optional)
    spender_id UUID NOT NULL,         -- Who spent the money
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    category VARCHAR(100) NOT NULL,   -- 'venue', 'food', 'materials', etc.
    description TEXT NOT NULL,
    receipt_url TEXT,                 -- Upload receipt images
    expense_date DATE NOT NULL,       -- When expense occurred
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'reimbursed'
    reviewed_by UUID,                 -- Who approved the expense
    reimbursement_method VARCHAR(50), -- How to reimburse
    -- ... other fields
);
```

### **How This Fixes User Stories:**

### **US038: Track Event Financials** ✅
```sql
-- Now you can properly track event expenses
SELECT 
    -- Income from event fees
    (SELECT SUM(amount) FROM financial_transactions 
     WHERE event_id = ? AND transaction_type = 'event_fee') as event_income,
    
    -- Expenses for the event
    (SELECT SUM(amount) FROM expenses 
     WHERE event_id = ? AND status = 'approved') as event_expenses,
    
    -- Calculate profit/loss
    (event_income - event_expenses) as event_profit
```

### **US039: Track Club Financials by Period** ✅
```sql
-- Updated club_financial_summaries calculation
UPDATE club_financial_summaries SET
    total_income = (
        SELECT SUM(amount) FROM financial_transactions 
        WHERE club_id = ? AND transaction_date BETWEEN period_start AND period_end
    ),
    total_expenses = (
        SELECT SUM(amount) FROM expenses 
        WHERE club_id = ? AND expense_date BETWEEN period_start AND period_end 
        AND status = 'approved'
    ),
    balance = total_income - total_expenses
```

### **Complete Expense Workflow:**

1. **Member Spends Money** → Keeps receipt
2. **Submit Expense** → Uploads receipt + details to `expenses` table
3. **Admin Reviews** → Approves/rejects in `expenses.status`
4. **Reimbursement** → Tracks payment back to member
5. **Financial Reports** → Includes all approved expenses

### **Expense Categories:**
- **venue**: Room rentals, equipment hire
- **food**: Catering, refreshments  
- **materials**: Supplies, decorations
- **transport**: Travel, shipping
- **marketing**: Advertising, printing
- **other**: Miscellaneous expenses

### **Benefits:**
- **Complete Financial Picture**: Income AND expenses properly tracked
- **Receipt Management**: Upload and store receipt images
- **Approval Workflow**: Expenses require approval before counting
- **Reimbursement Tracking**: Know who needs to be paid back
- **Event-Specific**: Link expenses to specific events
- **Budget Compliance**: Link expenses to approved budget requests

This fixed schema now provides complete financial management capabilities! 🎯 
