-- GitLab to PostgreSQL Migration Schema
-- Created: 2025-07-04
-- Purpose: Migrate structured data from GitLab YAML to PostgreSQL

-- Grant permissions on schema public (if needed)
-- GRANT CREATE ON SCHEMA public TO CURRENT_USER;
-- GRANT USAGE ON SCHEMA public TO CURRENT_USER;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Products table
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    brand VARCHAR(100),
    model VARCHAR(100),
    status VARCHAR(50),
    mp1_date DATE,
    launch_date DATE,
    description TEXT,
    epic_id INTEGER,
    lookup_code VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    gitlab_issue_id INTEGER, -- Reference to actual GitLab issue
    gitlab_issue_iid INTEGER, -- GitLab internal issue ID
    gitlab_project_id INTEGER -- GitLab project ID
);

-- Features table
CREATE TABLE features (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    overview TEXT,
    current_problems TEXT,
    requirements TEXT,
    priority VARCHAR(50),
    estimate INTEGER,
    status VARCHAR(50),
    requestor VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    gitlab_issue_id INTEGER,
    gitlab_issue_iid INTEGER,
    gitlab_project_id INTEGER
);

-- Feature platforms (many-to-many)
CREATE TABLE feature_platforms (
    feature_id UUID REFERENCES features(id) ON DELETE CASCADE,
    platform VARCHAR(50),
    PRIMARY KEY (feature_id, platform)
);

-- Hardware specifications
CREATE TABLE hardware_specs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    spec_type VARCHAR(100),
    spec_value TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Software requirements
CREATE TABLE software_requirements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    requirement_type VARCHAR(100),
    requirement_value TEXT,
    version VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Product Information Forms (PIFs)
CREATE TABLE pifs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    document_url TEXT,
    version VARCHAR(50),
    status VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255)
);

-- Development notes
CREATE TABLE development_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    feature_id UUID REFERENCES features(id) ON DELETE CASCADE,
    note_type VARCHAR(50),
    content TEXT,
    author VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit log for all changes
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name VARCHAR(100),
    record_id UUID,
    action VARCHAR(50),
    old_data JSONB,
    new_data JSONB,
    user_id VARCHAR(255),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Migration tracking table
CREATE TABLE migration_status (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type VARCHAR(50) NOT NULL,
    gitlab_id INTEGER,
    postgres_id UUID,
    status VARCHAR(50),
    error_message TEXT,
    migrated_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(entity_type, gitlab_id)
);

-- Indexes for performance
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_brand ON products(brand);
CREATE INDEX idx_products_gitlab_id ON products(gitlab_issue_id);
CREATE INDEX idx_features_product_id ON features(product_id);
CREATE INDEX idx_features_status ON features(status);
CREATE INDEX idx_features_priority ON features(priority);
CREATE INDEX idx_features_gitlab_id ON features(gitlab_issue_id);
CREATE INDEX idx_audit_log_table_record ON audit_log(table_name, record_id);
CREATE INDEX idx_audit_log_timestamp ON audit_log(timestamp);
CREATE INDEX idx_migration_status_entity ON migration_status(entity_type, gitlab_id);

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_features_updated_at BEFORE UPDATE ON features
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hardware_specs_updated_at BEFORE UPDATE ON hardware_specs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_software_requirements_updated_at BEFORE UPDATE ON software_requirements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pifs_updated_at BEFORE UPDATE ON pifs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_development_notes_updated_at BEFORE UPDATE ON development_notes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Audit trigger function
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO audit_log(table_name, record_id, action, new_data, user_id)
        VALUES (TG_TABLE_NAME, NEW.id, TG_OP, to_jsonb(NEW), current_user);
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_log(table_name, record_id, action, old_data, new_data, user_id)
        VALUES (TG_TABLE_NAME, NEW.id, TG_OP, to_jsonb(OLD), to_jsonb(NEW), current_user);
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO audit_log(table_name, record_id, action, old_data, user_id)
        VALUES (TG_TABLE_NAME, OLD.id, TG_OP, to_jsonb(OLD), current_user);
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Create audit triggers for main tables
CREATE TRIGGER audit_products AFTER INSERT OR UPDATE OR DELETE ON products
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_features AFTER INSERT OR UPDATE OR DELETE ON features
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Views for common queries
CREATE VIEW product_summary AS
SELECT 
    p.id,
    p.name,
    p.brand,
    p.model,
    p.status,
    p.mp1_date,
    p.launch_date,
    COUNT(DISTINCT f.id) as feature_count,
    COUNT(DISTINCT hs.id) as hardware_spec_count,
    COUNT(DISTINCT sr.id) as software_req_count
FROM products p
LEFT JOIN features f ON p.id = f.product_id
LEFT JOIN hardware_specs hs ON p.id = hs.product_id
LEFT JOIN software_requirements sr ON p.id = sr.product_id
GROUP BY p.id;

CREATE VIEW feature_summary AS
SELECT 
    f.id,
    f.title,
    f.status,
    f.priority,
    f.estimate,
    p.name as product_name,
    p.brand as product_brand,
    STRING_AGG(fp.platform, ', ') as platforms
FROM features f
LEFT JOIN products p ON f.product_id = p.id
LEFT JOIN feature_platforms fp ON f.id = fp.feature_id
GROUP BY f.id, f.title, f.status, f.priority, f.estimate, p.name, p.brand;

-- Grant permissions (adjust as needed)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_app_user;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO your_app_user;