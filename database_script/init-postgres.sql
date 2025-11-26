-- =============================================================================
-- PostgreSQL Initialization Script for Auth Service
-- =============================================================================
-- This script runs automatically when the PostgreSQL container starts for the
-- first time. It creates the necessary database and extensions.
-- =============================================================================

-- Create the auth_service database (if not exists via POSTGRES_DB env)
-- The database is already created by the POSTGRES_DB environment variable,
-- so we just need to set up extensions.

-- Enable UUID extension for generating UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pgcrypto for cryptographic functions (useful for password hashing verification)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Grant all privileges on the database to the postgres user
GRANT ALL PRIVILEGES ON DATABASE auth_service_db TO postgres;

-- Log successful initialization
DO $$
BEGIN
    RAISE NOTICE '✅ PostgreSQL initialized successfully for auth_service_db';
END $$;

