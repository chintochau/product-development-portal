# GitLab YAML to PostgreSQL Migration Plan

## Overview
This document tracks the migration from storing structured data as YAML in GitLab issues to a proper PostgreSQL database, while keeping GitLab for actual issue tracking.

**Created**: 2025-07-04  
**Status**: In Progress  
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

### Phase 1: Database Design 📐 ✅
- [x] Design PostgreSQL schema
- [x] Create database tables for products, features, etc.
- [x] Set up proper relationships and constraints
- [x] Create indexes for performance
- [x] Document the schema

### Phase 2: API Development 🔌 ✅
- [x] ~~Create Node.js/Express API server~~ Use Electron main process
- [x] Implement CRUD operations in PostgreSQL API module
- [ ] Add authentication/authorization
- [x] Create migration functions for data sync
- [x] Add validation layer

### Phase 3: Electron Integration 🖥️ 🔄
- [x] Add PostgreSQL client to main process
- [x] Create new IPC channels for database operations
- [ ] Update contexts to use new API
- [x] Add connection configuration (.env)
- [x] Implement error handling
- [x] Create connection test UI in Admin Panel

### Phase 4: Data Migration Tools 🔄 ✅
- [x] Create scripts to extract YAML from GitLab
- [x] Transform YAML data to SQL format
- [x] Handle data validation and cleanup
- [x] Create rollback procedures
- [x] Test migration with sample data

### Phase 5: Gradual Migration 🚀 🔄
- [x] Migrate products first (lowest risk) - 30 products migrated
- [x] Update UI to read from PostgreSQL - Features now read from PostgreSQL
- [x] Keep GitLab as backup (read-only) - Implemented fallback mechanism
- [x] Migrate features - 65 features migrated from GitLab notes
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

## Progress Log

### 2025-07-04 (Part 2)
- Created UI/UX requests table schema (uiux_requests)
- Built UI/UX API module (uiuxAPI.ts) with full CRUD operations
- Added IPC handlers for UI/UX operations in main process
- Created TypeScript types for UI/UX requests
- Updated preload script to expose UI/UX API
- Converted uiuxContext from JSX to TypeScript with PostgreSQL support
- Updated UiUxPage to use PostgreSQL operations with GitLab fallback
- Successfully created uiux_requests table in PostgreSQL database

### 2025-07-04
- Created PostgreSQL API module (postgresqlAPI.ts)
- Added database connection configuration to .env
- Implemented IPC handlers for database operations
- Created PostgreSQL connection test component
- Added Database Connection tab to Admin Panel
- Converted files to TypeScript:
  - index.js → index.ts (main process)
  - AdminPanel.jsx → AdminPanel.tsx
- Created full PostgreSQL schema with all tables
- Built PostgreSQL CRUD operations in Electron main process
- Successfully migrated 30 products from GitLab to PostgreSQL
- Created @types folder structure for TypeScript
- Updated CLAUDE.md with TypeScript requirements
- Discovered features are stored as GitLab notes, not issues
- Successfully migrated 65 features from GitLab notes to PostgreSQL
- Updated features context to read from PostgreSQL with GitLab fallback
- Modified feature components to use PostgreSQL API
- Implemented navigation and detail views for PostgreSQL features
- Found that products UI is already using PostgreSQL (not GitLab)
- Created comments table schema and migration script
- Built comments API module with CRUD operations
- Added IPC handlers for comment operations
- Created TypeScript types for comments
- Updated singleProductContext to TypeScript and PostgreSQL
- Fixed ProductDetailPage to use PostgreSQL product ID
- Added comments API to preload script
- Created window.d.ts for type definitions
- Fixed context filename typos (roadmapConetxt → roadmapContext, projecstContext → projectsContext)
- Removed dependency on ProductsProvider from SingleProductProvider
- Fixed provider ordering issues
- Created mock RoadmapContext to avoid complex data dependencies during migration
- Added error handling for context access in ProductDetailPage
- Added ErrorBoundary component for better error reporting
- Fixed typo: findProductsById → findProductById in multiple components
- Fixed Select component empty value error in ProcessStepper
- Removed all RoadmapContext dependencies temporarily
- Created placeholder pages for roadmap features
- Removed roadmap imports from FeaturesPage, DeveloperPage, and OldFeaturesPage

## Current Status

### ✅ Completed
- PostgreSQL database setup and schema
- PostgreSQL CRUD operations in Electron main process
- Product migration (30 products migrated)
- Feature migration (65 features migrated from GitLab notes)
- Type definitions in @types folder
- IPC handlers for database operations
- Products context already using PostgreSQL
- Features context updated to use PostgreSQL with GitLab fallback
- Feature CRUD operations using PostgreSQL
- Feature navigation and detail views working with PostgreSQL
- Comments table schema created
- Comments API module with full CRUD operations
- IPC handlers for comment operations
- TypeScript types for comments
- ProductDetailPage tested and working with PostgreSQL data (navigates via `/dashboard/:id` with UUID)
- UI/UX requests table schema created
- UI/UX API module with full CRUD operations
- IPC handlers for UI/UX request operations
- TypeScript types for UI/UX requests
- Updated UiUxPage to use PostgreSQL with GitLab fallback
- Converted uiuxContext to TypeScript with PostgreSQL support

### 🔄 In Progress
- Testing comment migration scripts
- Creating UI components for comments
- Running UI/UX data migration from GitLab

### 📋 Next Steps
1. Run UI/UX migration script to import GitLab UI/UX requests to PostgreSQL
2. Run comment migration script to import GitLab comments
3. Create UI components to display comments on products and features
4. Create admin UI for managing PostgreSQL data
5. Implement proper pagination for features
6. Reimplement RoadmapContext with PostgreSQL data
7. Remove GitLab YAML dependencies once fully migrated

## Notes
- Consider using TypeORM or Prisma for database management
- Implement caching layer for frequently accessed data
- Add real-time updates using WebSockets
- Consider PostgreSQL's JSONB for flexible fields
- Keep audit trail of all data changes