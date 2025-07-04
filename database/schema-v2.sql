-- GitLab to PostgreSQL Migration Schema V2
-- Created: 2025-07-04
-- Purpose: Clean PostgreSQL schema without GitLab dependencies

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
    lookup_code VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255)
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
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Feature platforms (many-to-many)
CREATE TABLE feature_platforms (
    feature_id UUID REFERENCES features(id) ON DELETE CASCADE,
    platform VARCHAR(50),
    PRIMARY KEY (feature_id, platform)
);

-- Tickets table (for future use)
CREATE TABLE tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    feature_id UUID REFERENCES features(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50), -- bug, enhancement, task
    status VARCHAR(50),
    priority VARCHAR(50),
    assignee VARCHAR(255),
    reporter VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Comments table (for any entity)
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type VARCHAR(50) NOT NULL, -- product, feature, ticket
    entity_id UUID NOT NULL,
    content TEXT NOT NULL,
    author VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Attachments table
CREATE TABLE attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    filename VARCHAR(255) NOT NULL,
    file_url TEXT,
    file_size INTEGER,
    mime_type VARCHAR(100),
    uploaded_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tags table
CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    color VARCHAR(7), -- hex color
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Entity tags (many-to-many)
CREATE TABLE entity_tags (
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (entity_type, entity_id, tag_id)
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

-- Indexes for performance
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_brand ON products(brand);
CREATE INDEX idx_features_product_id ON features(product_id);
CREATE INDEX idx_features_status ON features(status);
CREATE INDEX idx_features_priority ON features(priority);
CREATE INDEX idx_tickets_product_id ON tickets(product_id);
CREATE INDEX idx_tickets_feature_id ON tickets(feature_id);
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_comments_entity ON comments(entity_type, entity_id);
CREATE INDEX idx_attachments_entity ON attachments(entity_type, entity_id);
CREATE INDEX idx_entity_tags_entity ON entity_tags(entity_type, entity_id);
CREATE INDEX idx_audit_log_table_record ON audit_log(table_name, record_id);
CREATE INDEX idx_audit_log_timestamp ON audit_log(timestamp);

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

CREATE TRIGGER update_tickets_updated_at BEFORE UPDATE ON tickets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
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

CREATE TRIGGER audit_tickets AFTER INSERT OR UPDATE OR DELETE ON tickets
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
    COUNT(DISTINCT t.id) as ticket_count,
    COUNT(DISTINCT c.id) as comment_count
FROM products p
LEFT JOIN features f ON p.id = f.product_id
LEFT JOIN tickets t ON p.id = t.product_id
LEFT JOIN comments c ON c.entity_type = 'product' AND c.entity_id = p.id
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
    STRING_AGG(DISTINCT fp.platform, ', ') as platforms,
    COUNT(DISTINCT t.id) as ticket_count,
    COUNT(DISTINCT c.id) as comment_count
FROM features f
LEFT JOIN products p ON f.product_id = p.id
LEFT JOIN feature_platforms fp ON f.id = fp.feature_id
LEFT JOIN tickets t ON f.id = t.feature_id
LEFT JOIN comments c ON c.entity_type = 'feature' AND c.entity_id = f.id
GROUP BY f.id, f.title, f.status, f.priority, f.estimate, p.name, p.brand;