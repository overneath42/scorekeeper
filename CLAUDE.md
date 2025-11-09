# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Development server**: `npm run dev` (runs on port 3000)
- **Build**: `npm run build` (outputs to `dist/`)
- **Linting**: `npm run lint` (ESLint for TypeScript/JavaScript)
- **Type checking**: `npm run typecheck` (TypeScript compiler check)
- **Preview build**: `npm run preview`
- **Storybook**: `npm run storybook` (dev server on port 6006)
- **Build Storybook**: `npm run build-storybook`

## Architecture Overview

This is a TypeScript-based scorekeeper application built with:

- **Lit**: Web Components framework for UI components
- **Vite**: Build tool and dev server
- **Tailwind CSS**: Utility-first CSS framework
- **Local Storage**: Game data persistence

### Core Architecture Patterns

**Component-Based Architecture**: Uses Lit web components with custom element registration. All components extend `BaseComponent` which disables Shadow DOM to work with global Tailwind styles.

**Context Pattern**: Uses `@lit/context` for state management:
- `GameContext`: Manages individual game state and operations
- `GameListContext`: Manages list of all games

**Provider Pattern**: Context providers supply data and methods to child components:
- `x-game-provider`: Provides game state and game manipulation methods
- `x-game-list-provider`: Provides list of games and game management

**Storage Service**: `GameStorageService` singleton handles all persistence using localStorage with adapter pattern for potential future backend integration.

### Key Components Structure

- **Providers** (`src/components/providers/`): Context providers that manage state
- **Game Components** (`src/components/game/`): Individual game view components
- **Game Detail** (`src/components/game-detail/`): Game creation/editing forms
- **Game List** (`src/components/game-list/`): Game listing and selection

### Data Flow

1. `GameStorageService` manages all game persistence
2. Provider components load data from storage and expose methods via context
3. UI components consume context to display data and trigger actions
4. Actions flow back through provider methods to update storage

### Multi-Page Structure

The app uses Vite's multi-page build with separate HTML entry points:
- `index.html`: Game list (home page)
- `pages/new.html`: Create new game
- `pages/edit.html`: Edit existing game
- `pages/play.html`: Play game interface

### File Organization

- `src/context/`: Context definitions for state management
- `src/services/`: Business logic and storage services
- `src/utils/`: Shared utilities including `BaseComponent`
- `src/types/`: TypeScript type definitions
- `src/styles/`: CSS organization with component-specific styles
- `src/templates/`: HTML templates (if used)

### Development Notes

- Components are registered in `src/main.ts`
- No Shadow DOM - components render directly to light DOM for Tailwind compatibility
- Uses `.js` imports in TypeScript files (Vite handles the resolution)
- Local storage adapter pattern allows for future storage backend changes