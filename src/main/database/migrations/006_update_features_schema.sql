-- Update features table schema to match requirements

-- Add new columns
ALTER TABLE features 
ADD COLUMN IF NOT EXISTS developers TEXT[], -- Array of developer IDs/usernames
ADD COLUMN IF NOT EXISTS start_date DATE,
ADD COLUMN IF NOT EXISTS due_date DATE,
ADD COLUMN IF NOT EXISTS hardware BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS software BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS gitlab_url TEXT,
ADD COLUMN IF NOT EXISTS description TEXT; -- Add description if it doesn't exist

-- Drop unnecessary columns
ALTER TABLE features
DROP COLUMN IF EXISTS gitlab_issue_id,
DROP COLUMN IF EXISTS gitlab_issue_iid,
DROP COLUMN IF EXISTS gitlab_project_id;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_features_start_date ON features(start_date);
CREATE INDEX IF NOT EXISTS idx_features_due_date ON features(due_date);
CREATE INDEX IF NOT EXISTS idx_features_developers ON features USING GIN(developers);

-- Add comments
COMMENT ON COLUMN features.developers IS 'Array of developer IDs/usernames assigned to this feature';
COMMENT ON COLUMN features.start_date IS 'Feature development start date';
COMMENT ON COLUMN features.due_date IS 'Feature development due date';
COMMENT ON COLUMN features.hardware IS 'Whether this feature involves hardware development';
COMMENT ON COLUMN features.software IS 'Whether this feature involves software development';
COMMENT ON COLUMN features.gitlab_url IS 'URL to the GitLab ticket/issue';
COMMENT ON COLUMN features.description IS 'Detailed description of the feature';