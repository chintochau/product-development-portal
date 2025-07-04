# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the BluOS Product Development Portal - an Electron desktop application built with React that manages product development workflows, feature requests, roadmaps, and integrations with GitLab, Wrike, and other services.

**Note: This project is currently being migrated from JavaScript to TypeScript. See TYPESCRIPT_MIGRATION.md for progress tracking.**

### TypeScript Migration Strategy
- **New files**: Always create as `.ts` or `.tsx`
- **Modified files**: Convert to TypeScript when making changes
- **Priority conversions**: API files, contexts, and shared utilities
- **Gradual migration**: Convert files as you work on them, not all at once
- **Always use ts, not js**
- **While changing a js file, convert it to ts**

### TypeScript Best Practices
1. **Type Organization**:
   ```
   src/types/
   ├── models/
   │   ├── product.types.ts    # Product-related types
   │   ├── feature.types.ts    # Feature-related types
   │   ├── ticket.types.ts     # Ticket-related types
   │   ├── user.types.ts       # User and auth types
   │   ├── roadmap.types.ts    # Roadmap types
   │   └── index.ts           # Re-export all model types
   ├── api/
   │   ├── gitlab.types.ts     # GitLab API types
   │   ├── wrike.types.ts      # Wrike API types
   │   ├── firebase.types.ts   # Firebase types
   │   └── index.ts           # Re-export all API types
   ├── components/
   │   └── common.types.ts     # Shared component prop types
   └── index.ts               # Main export file
   ```

2. **Type Definition Guidelines**:
   - Define types in dedicated `.types.ts` files, not inline
   - Export all types from `src/types/index.ts` for easy imports
   - Use interfaces for object shapes, types for unions/primitives
   - Prefix type-only imports with `type` keyword: `import type { User } from '@/types'`

3. **Validation Workflow**:
   - **Before committing**: Always run `npm run typecheck` to ensure no type errors
   - **After significant changes**: Run `npm run typecheck` to validate types
   - **After converting files**: Run `npm run lint` and `npm run typecheck`
   - **During development**: VSCode will show type errors in real-time
   - **CI/CD**: Add `npm run typecheck` to build pipeline

4. **Example Type Structure**:
   ```typescript
   // src/types/models/product.types.ts
   export interface Product {
     id: string;
     name: string;
     features: Feature[];
     createdAt: Date;
   }

   // src/types/models/index.ts
   export * from './product.types';
   export * from './feature.types';
   export * from './ticket.types';

   // src/components/ProductCard.tsx
   import type { Product } from '@/types/models';
   ```

5. **Type File Naming Convention**:
   - Model types: `{model}.types.ts` (e.g., `product.types.ts`)
   - API types: `{service}.types.ts` (e.g., `gitlab.types.ts`)
   - Keep related types together (e.g., `Product`, `ProductStatus`, `ProductFilter` in same file)
   - One main entity per file for better organization

### Additional TypeScript Best Practices

1. **Strict Type Safety**:
   ```typescript
   // ❌ Avoid
   function processData(data: any) { }
   
   // ✅ Prefer
   function processData(data: unknown) {
     if (isValidData(data)) { /* type guard */ }
   }
   ```

2. **Error Handling Types**:
   ```typescript
   // Define consistent error types
   type Result<T, E = Error> = 
     | { success: true; data: T }
     | { success: false; error: E };
   ```

3. **Const Assertions for Literals**:
   ```typescript
   // Use 'as const' for literal types
   const STATUS = {
     ACTIVE: 'active',
     PENDING: 'pending',
     CLOSED: 'closed'
   } as const;
   ```

4. **Type Guards**:
   ```typescript
   // Create type guards for runtime checks
   function isProduct(item: unknown): item is Product {
     return (item as Product).id !== undefined;
   }
   ```

5. **Utility Types**:
   - Use `Partial<T>` for optional properties
   - Use `Required<T>` for required properties
   - Use `Pick<T, K>` to select properties
   - Use `Omit<T, K>` to exclude properties
   - Use `Record<K, T>` for object types

6. **React Component Types**:
   ```typescript
   // Consistent component typing
   import { FC, ReactNode } from 'react';
   
   interface Props {
     children: ReactNode;
     onClose: () => void;
   }
   
   export const Modal: FC<Props> = ({ children, onClose }) => { }
   ```

7. **Async Function Types**:
   ```typescript
   // Type async functions properly
   type AsyncFunction<T> = () => Promise<T>;
   type AsyncCallback<T> = (data: T) => Promise<void>;
   ```

8. **Discriminated Unions**:
   ```typescript
   // Use for state management
   type LoadingState<T> = 
     | { status: 'idle' }
     | { status: 'loading' }
     | { status: 'success'; data: T }
     | { status: 'error'; error: Error };
   ```

9. **Avoid Common Pitfalls**:
   - Never use `any` unless absolutely necessary (use `unknown` instead)
   - Don't use `Function` type (specify the function signature)
   - Avoid using `object` (use `Record<string, unknown>` or specific interface)
   - Don't ignore TypeScript errors with `@ts-ignore` (fix them or use `@ts-expect-error` with explanation)

10. **Electron-Specific Types**:
    ```typescript
    // Type IPC channels and payloads
    interface IpcChannels {
      'gitlab:get-projects': {
        request: { userId: string };
        response: GitLabProject[];
      };
      'auth:sign-in': {
        request: { email: string; password: string };
        response: { user: User; token: string };
      };
    }
    ```

11. **Context Type Patterns**:
    ```typescript
    // Define context types with proper defaults
    interface ProductContextType {
      products: Product[];
      loading: boolean;
      error: Error | null;
      addProduct: (product: Product) => Promise<void>;
      updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
    }
    
    const ProductContext = createContext<ProductContextType | undefined>(undefined);
    
    // Custom hook with type safety
    export const useProducts = (): ProductContextType => {
      const context = useContext(ProductContext);
      if (!context) {
        throw new Error('useProducts must be used within ProductProvider');
      }
      return context;
    };
    ```

## Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Lint and fix code
npm run lint

# Format code with Prettier
npm run format

# Type check TypeScript files
npm run typecheck

# Build for specific platforms
npm run build:win    # Windows
npm run build:mac    # macOS
npm run build:linux  # Linux

# Publish to S3
npm run publish
```

### When to Run Type Checks
- **Always run `npm run typecheck`**:
  - Before committing any changes
  - After converting any file to TypeScript
  - After modifying type definitions
  - After pulling latest changes from repository
  - Before creating a pull request

## Architecture Overview

### Tech Stack
- **Electron 31** with electron-vite for desktop app framework
- **React 18** with React Router for UI
- **Tailwind CSS** with shadcn/ui components
- **JavaScript + TypeScript** (migrating gradually - always run `npm run typecheck`)
- **Vite** as build tool
- **Firebase** for backend services
- **No testing framework**

### Project Structure

```
src/
├── main/           # Electron main process
│   ├── index.js    # Main entry, window creation, IPC handlers
│   ├── firebaseAPI.js
│   ├── gitlabAPI.js
│   ├── wrikeAPI.js
│   ├── graphAPI.js
│   └── excelAPI.js
├── preload/        # Preload scripts for renderer access
├── renderer/       # React application
│   └── src/
│       ├── components/    # UI components
│       ├── contexts/      # React contexts (11 total)
│       ├── services/      # API integrations
│       └── App.jsx        # Main React app with providers
└── components/     # shadcn/ui components
```

### Key Architectural Patterns

1. **Context-Heavy Architecture**: The app uses 11 nested React contexts for state management:
   - UserProvider (authentication)
   - ProductsProvider & SingleProductProvider
   - TicketsProvider
   - RoadmapProvider
   - ProjectsProvider
   - AnalyticsProvider
   - DeveloperProvider
   - UiuxProvider
   - BrowsingProvider
   - AuthPermissionWrapper

2. **IPC Communication**: Main process APIs are exposed to renderer via IPC:
   - GitLab API operations
   - Wrike project management
   - Firebase authentication and data
   - Excel file operations
   - Microsoft Graph API

3. **Auto-Updates**: Configured with electron-updater publishing to AWS S3

### External Service Integrations

- **GitLab**: Project and issue management
- **Wrike**: Task and project tracking
- **Firebase**: Authentication and Firestore database
- **Microsoft Graph**: Microsoft services integration
- **Aelix AI**: AI-powered features

### UI Component Library

Uses shadcn/ui with Radix UI primitives. Components are in `/components` directory with configuration in `components.json`.

### Important Notes

- No TypeScript - pure JavaScript project
- No test suite - no testing commands available
- Path aliases configured in jsconfig.json (`@/` maps to `src/renderer/src/`)
- Auto-updater is set to manual download mode
- Uses HashRouter for React Router (Electron compatibility)