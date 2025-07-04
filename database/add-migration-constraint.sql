-- Add unique constraint to migration_status table
ALTER TABLE migration_status 
ADD CONSTRAINT migration_status_entity_gitlab_unique 
UNIQUE(entity_type, gitlab_id);