-- Add comments table for storing GitLab issue/note comments
-- Created: 2025-07-04
-- Purpose: Store comments from GitLab issues and notes

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type VARCHAR(50) NOT NULL, -- 'product' or 'feature'
    entity_id UUID NOT NULL, -- References either product.id or feature.id
    author VARCHAR(255),
    author_username VARCHAR(255),
    content TEXT NOT NULL,
    gitlab_note_id INTEGER,
    gitlab_created_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Add constraints
    CONSTRAINT valid_entity_type CHECK (entity_type IN ('product', 'feature'))
);

-- Indexes for performance
CREATE INDEX idx_comments_entity ON comments(entity_type, entity_id);
CREATE INDEX idx_comments_author ON comments(author_username);
CREATE INDEX idx_comments_gitlab_id ON comments(gitlab_note_id);
CREATE INDEX idx_comments_created_at ON comments(created_at DESC);

-- Update timestamp trigger
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Audit trigger
CREATE TRIGGER audit_comments AFTER INSERT OR UPDATE OR DELETE ON comments
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();