# GitLab YAML to PostgreSQL Migration Plan

## Overview
This document tracks the migration from storing structured data as YAML in GitLab issues to a proper PostgreSQL database, while keeping GitLab for actual issue tracking.

**Created**: 2025-07-04  
**Status**: Planning  
**Goal**: Separate data storage (PostgreSQL) from issue tracking (GitLab)

## Current State Analysis

### What's Stored in GitLab as YAML
1. **Products** (GitLab Project: 61440508)
   - Basic info: name, brand, model, status
   - Dates: MP1, launch dates
   - Relationships: epicId, lookup codes
   
2. **Features** (GitLab Project: 36518895)
   - Feature requests with requirements
   - Platform assignments
   - Priority and estimates
   
3. **Related Data** (Stored as issue comments)
   - Hardware specifications
   - Software requirements
   - PIFs (Product Information Forms)
   - Development notes

### Problems with Current Approach
- Poor query performance
- No referential integrity
- Limited search capabilities
- Mixing data storage with issue tracking
- No proper backup strategy

## Migration Strategy

### Phase 1: Database Design 📐
- [ ] Design PostgreSQL schema
- [ ] Create database tables for products, features, etc.
- [ ] Set up proper relationships and constraints
- [ ] Create indexes for performance
- [ ] Document the schema

### Phase 2: API Development 🔌
- [ ] Create Node.js/Express API server (or similar)
- [ ] Implement CRUD endpoints for each entity
- [ ] Add authentication/authorization
- [ ] Create migration endpoints for data sync
- [ ] Add validation layer

### Phase 3: Electron Integration 🖥️
- [ ] Add PostgreSQL client to main process
- [ ] Create new IPC channels for database operations
- [ ] Update contexts to use new API
- [ ] Add connection configuration
- [ ] Implement error handling

### Phase 4: Data Migration Tools 🔄
- [ ] Create scripts to extract YAML from GitLab
- [ ] Transform YAML data to SQL format
- [ ] Handle data validation and cleanup
- [ ] Create rollback procedures
- [ ] Test migration with sample data

### Phase 5: Gradual Migration 🚀
- [ ] Migrate products first (lowest risk)
- [ ] Update UI to read from PostgreSQL
- [ ] Keep GitLab as backup (read-only)
- [ ] Migrate features
- [ ] Migrate related data (comments)

### Phase 6: GitLab Cleanup 🧹
- [ ] Convert YAML issues to regular GitLab issues
- [ ] Archive old YAML data
- [ ] Update GitLab projects for pure issue tracking
- [ ] Remove YAML parsing code
- [ ] Update documentation

## Database Schema (Proposed)

```sql
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
    gitlab_issue_id INTEGER -- Reference to actual GitLab issue
);

-- Features table
CREATE TABLE features (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id),
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
    feature_id UUID REFERENCES features(id),
    platform VARCHAR(50),
    PRIMARY KEY (feature_id, platform)
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
```

## Implementation Checklist

### Backend Changes
- [ ] Set up PostgreSQL database
- [ ] Create API server project
- [ ] Design RESTful or GraphQL API
- [ ] Implement database models
- [ ] Add data validation
- [ ] Create migration scripts
- [ ] Set up database backups

### Frontend Changes
- [ ] Update `firebaseAPI.js` to include PostgreSQL operations
- [ ] Create new `postgresqlAPI.js` for database operations
- [ ] Update all contexts to support dual data sources during migration
- [ ] Add database connection status to UI
- [ ] Create admin panel for migration monitoring

### Migration Tools
```javascript
// Example migration script structure
async function migrateProducts() {
  // 1. Fetch all products from GitLab
  const gitlabProducts = await getProductsFromGitLab();
  
  // 2. Transform YAML to database format
  const dbProducts = gitlabProducts.map(transformProduct);
  
  // 3. Insert into PostgreSQL
  await insertProductsBatch(dbProducts);
  
  // 4. Verify migration
  await verifyProductMigration();
}
```

## Testing Strategy
1. **Unit tests** for data transformation
2. **Integration tests** for API endpoints
3. **Migration tests** with sample data
4. **Performance tests** comparing GitLab vs PostgreSQL
5. **Data integrity checks**

## Rollback Plan
1. Keep GitLab YAML data intact during migration
2. Dual-write to both systems during transition
3. Feature flags to switch between data sources
4. Full database backups before each migration phase

## Success Metrics
- [ ] All YAML data successfully migrated
- [ ] Query performance improved by >50%
- [ ] Zero data loss during migration
- [ ] GitLab issues converted to standard format
- [ ] All features working with PostgreSQL

## Timeline Estimate
- Phase 1-2: 2 weeks (Database & API setup)
- Phase 3: 1 week (Electron integration)
- Phase 4: 1 week (Migration tools)
- Phase 5: 2 weeks (Gradual migration)
- Phase 6: 1 week (Cleanup)

Total: ~7 weeks for complete migration

## Notes
- Consider using TypeORM or Prisma for database management
- Implement caching layer for frequently accessed data
- Add real-time updates using WebSockets
- Consider PostgreSQL's JSONB for flexible fields
- Keep audit trail of all data changes