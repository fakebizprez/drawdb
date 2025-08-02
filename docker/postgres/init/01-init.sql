-- Initialize DrawDB Database

-- Create necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create schemas
CREATE SCHEMA IF NOT EXISTS public;
CREATE SCHEMA IF NOT EXISTS analytics;

-- Create tables for future backend implementation

-- Users table (for future authentication)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE
);

-- Diagrams table (for shared diagrams)
CREATE TABLE IF NOT EXISTS diagrams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    diagram_data JSONB NOT NULL,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Gists table (for GitHub gist integration)
CREATE TABLE IF NOT EXISTS gists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    gist_id VARCHAR(255) UNIQUE NOT NULL,
    github_gist_id VARCHAR(255),
    title VARCHAR(255),
    content JSONB NOT NULL,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics tables
CREATE TABLE IF NOT EXISTS analytics.page_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    page_path VARCHAR(255) NOT NULL,
    user_agent TEXT,
    ip_address INET,
    country VARCHAR(2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS analytics.feature_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    feature_name VARCHAR(100) NOT NULL,
    action VARCHAR(50) NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_diagrams_user_id ON diagrams(user_id);
CREATE INDEX IF NOT EXISTS idx_diagrams_created_at ON diagrams(created_at);
CREATE INDEX IF NOT EXISTS idx_diagrams_public ON diagrams(is_public) WHERE is_public = TRUE;
CREATE INDEX IF NOT EXISTS idx_gists_user_id ON gists(user_id);
CREATE INDEX IF NOT EXISTS idx_gists_gist_id ON gists(gist_id);
CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON analytics.page_views(created_at);
CREATE INDEX IF NOT EXISTS idx_feature_usage_created_at ON analytics.feature_usage(created_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_diagrams_updated_at BEFORE UPDATE ON diagrams FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_gists_updated_at BEFORE UPDATE ON gists FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO drawdb;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO drawdb;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA analytics TO drawdb;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA analytics TO drawdb;

-- Insert sample data for testing
INSERT INTO users (email, username) VALUES 
    ('demo@drawdb.app', 'demo_user')
ON CONFLICT (email) DO NOTHING;