# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the BluOS Product Development Portal - an Electron desktop application built with React that manages product development workflows, feature requests, roadmaps, and integrations with GitLab, Wrike, and other services.

**Note: This project is currently being migrated from JavaScript to TypeScript. See TYPESCRIPT_MIGRATION.md for progress tracking.**

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

## Architecture Overview

### Tech Stack
- **Electron 31** with electron-vite for desktop app framework
- **React 18** with React Router for UI
- **Tailwind CSS** with shadcn/ui components
- **JavaScript** (no TypeScript)
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