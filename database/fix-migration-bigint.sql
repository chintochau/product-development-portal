-- Fix migration_status table to handle large GitLab IDs
ALTER TABLE migration_status 
ALTER COLUMN gitlab_id TYPE BIGINT;