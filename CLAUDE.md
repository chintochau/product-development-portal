# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## Project Overview

BluOS Product Development Portal - Electron desktop app with React for managing product development workflows.

## TypeScript Requirements

### ALWAYS USE TYPESCRIPT
- **All new files**: Create as `.ts` or `.tsx`
- **When modifying JS files**: Convert to TypeScript
- **Never use JavaScript** for new code

### Type Organization
```
src/@types/
├── models/
│   ├── product.types.ts
│   ├── feature.types.ts
│   ├── user.types.ts
│   └── index.ts         # Re-export all
├── api/
│   ├── gitlab.types.ts
│   ├── firebase.types.ts
│   └── index.ts
└── index.ts             # Main export
```

### Type Definition Rules
1. **Define types in `@types` folder**, never inline
2. **Use interfaces** for objects, **types** for unions/primitives
3. **Import with type prefix**: `import type { User } from '@/types'`
4. **Export all types** from index files for clean imports

### Required Type Checks
**ALWAYS run `npm run typecheck` after code changes**

### Example Type Structure
```typescript
// src/@types/models/product.types.ts
export interface Product {
  id: string;
  name: string;
  features: Feature[];
}

// Usage in component
import type { Product } from '@/types/models';
```

## Development Commands

```bash
npm run dev          # Start development
npm run lint         # Lint code
npm run typecheck    # Check types (REQUIRED)
npm run format       # Format code
```

## Tech Stack
- **Electron 31** + React 18 + TypeScript
- **Tailwind CSS** + shadcn/ui
- **PostgreSQL** for data (migrating from GitLab)
- **Firebase** for auth

## Architecture
**This is an Electron desktop application** - all backend operations run in the Electron main process:
- PostgreSQL queries execute directly from main process
- No separate Express/API server needed
- IPC communication between main and renderer processes
- All data operations go through `window.api` calls

## Database Migration
See `GITLAB_TO_POSTGRESQL_MIGRATION.md` for current migration progress and plan.

## Project Structure
```
src/
├── @types/          # All type definitions
├── main/            # Electron main process (PostgreSQL runs here)
├── renderer/        # React app
└── components/      # shadcn/ui components
```