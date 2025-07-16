-- =====================================================
-- Auth Service Database Setup
-- Run this on your Auth Service Supabase project
-- =====================================================

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

-- Indexes for Auth Service
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_deleted_at ON users(deleted_at);
CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);

-- =====================================================
-- Financial Service Database Setup  
-- Run this on your Financial Service Supabase project
-- =====================================================

-- Financial transactions (covers US036-US037 - income only)
CREATE TABLE financial_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    club_id VARCHAR(255) NOT NULL, -- References clubs from Club Service
    user_id UUID NOT NULL, -- References users from Auth Service
    event_id VARCHAR(255), -- References events from Event Service
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
    club_id VARCHAR(255) NOT NULL, -- References clubs from Club Service
    event_id VARCHAR(255), -- References events from Event Service
    requested_by UUID NOT NULL, -- References users from Auth Service
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    description TEXT NOT NULL,
    justification TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected')),
    reviewed_by UUID, -- References users from Auth Service
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
    club_id VARCHAR(255) NOT NULL, -- References clubs from Club Service
    event_id VARCHAR(255), -- References events from Event Service
    budget_request_id UUID, -- References budget_requests
    spender_id UUID NOT NULL, -- References users from Auth Service
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    category VARCHAR(100) NOT NULL, -- 'venue', 'food', 'materials', 'transport', 'marketing', 'other'
    description TEXT NOT NULL,
    receipt_url TEXT, -- URL to receipt/invoice image
    expense_date DATE NOT NULL, -- When the expense occurred
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_by UUID, -- References users from Auth Service
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
    club_id VARCHAR(255) NOT NULL, -- References clubs from Club Service
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

-- Indexes for Financial Service
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

-- =====================================================
-- Notification Service Database Setup
-- Run this on your Notification Service Supabase project  
-- =====================================================

-- Notifications (covers US015, US034-US035, US043)
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL, -- References users from Auth Service
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
    club_id VARCHAR(255) NOT NULL, -- References clubs from Club Service
    author_id UUID NOT NULL, -- References users from Auth Service
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
    user_id UUID NOT NULL, -- References users from Auth Service
    interaction_type VARCHAR(20) NOT NULL CHECK(interaction_type IN ('read', 'like', 'comment')),
    comment_text TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(post_id, user_id, interaction_type)
);

-- Indexes for Notification Service
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_read_at ON notifications(read_at);
CREATE INDEX idx_activity_posts_club_id ON activity_posts(club_id);
CREATE INDEX idx_activity_posts_author_id ON activity_posts(author_id);
CREATE INDEX idx_activity_post_interactions_post_id ON activity_post_interactions(post_id); 