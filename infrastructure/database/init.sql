-- =============================================================================
-- AlumniConnect Database Initialization Script
-- =============================================================================

-- Ensure required PostgreSQL extensions are enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "citext";

-- Set default timezone to UTC
SET timezone TO 'UTC';

-- Log initialization
DO $$
BEGIN
    RAISE NOTICE 'AlumniConnect database initialized successfully with UUID, pgcrypto, and citext extensions.';
END $$;
