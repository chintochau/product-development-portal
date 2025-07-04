-- Create UI/UX requests table
CREATE TABLE IF NOT EXISTS uiux_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    priority VARCHAR(20) CHECK (priority IN ('critical', 'high', 'medium', 'low')),
    status VARCHAR(20) DEFAULT 'todo' CHECK (status IN ('todo', 'in-progress', 'review', 'completed')),
    step VARCHAR(50), -- For timeline progress tracking
    assignee VARCHAR(255),
    requestor VARCHAR(255),
    due_date DATE,
    completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
    tags TEXT[], -- Array of tags
    gitlab_tickets INTEGER[], -- Array of GitLab ticket IDs
    gitlab_note_id INTEGER, -- Reference to original GitLab note
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255)
);

-- Create indexes for better performance
CREATE INDEX idx_uiux_requests_product_id ON uiux_requests(product_id);
CREATE INDEX idx_uiux_requests_status ON uiux_requests(status);
CREATE INDEX idx_uiux_requests_priority ON uiux_requests(priority);
CREATE INDEX idx_uiux_requests_assignee ON uiux_requests(assignee);
CREATE INDEX idx_uiux_requests_created_at ON uiux_requests(created_at DESC);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_uiux_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER uiux_requests_updated_at_trigger
BEFORE UPDATE ON uiux_requests
FOR EACH ROW
EXECUTE FUNCTION update_uiux_requests_updated_at();

-- Add comments
COMMENT ON TABLE uiux_requests IS 'UI/UX design requests and tasks';
COMMENT ON COLUMN uiux_requests.step IS 'Current step in the UI/UX workflow';
COMMENT ON COLUMN uiux_requests.gitlab_tickets IS 'Array of related GitLab ticket IDs';
COMMENT ON COLUMN uiux_requests.tags IS 'Array of tags for categorization';