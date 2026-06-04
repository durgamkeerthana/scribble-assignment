# Implementation Plan: Game Start and Drawer Flow

**Branch**: `002-game-start-flow` | **Date**: 2026-06-04 | **Spec**: [spec.md](file:///Users/keerthana/Documents/scribble-assignment/specs/002-game-start-flow/spec.md)

**Input**: Feature specification from `/specs/002-game-start-flow/spec.md`

## Summary

This plan implements the Game Start & Drawer Flow feature. When the host starts a game with 2+ valid participants, the first round begins: the host is designated as drawer, a secret word is deterministically selected from the starter list, and the word is shown only to the drawer. Participant names are trimmed and validated at game start.

## Technical Context

**Language/Version**: TypeScript / Node.js 18+ (ES Modules)

**Primary Dependencies**: React (v18), React Router (v6), Vite, Express, Zod, tsx

**Storage**: In-memory storage using JS Map on the backend (within `backend/src/services/roomStore.ts`).

**Testing**: Vitest (unit/integration tests)

**Target Platform**: Web (Modern Browsers)

**Project Type**: Web application (Monolithic frontend/backend repository)

**Performance Goals**: Game start completes within 1 second; secret word displayed to drawer within the next polling cycle (~2s).

**Constraints**: No WebSockets (use HTTP polling only), no databases (in-memory only), no authentication (session tracked via `participantId`).

**Scale/Scope**: Local/testing multiplayer support with isolated concurrent rooms.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Principle I (TypeScript)**: Passed. All backend/frontend code is written in TS.
- **Principle II (HTTP Polling)**: Passed. Client sync uses HTTP polling. No WebSockets.
- **Principle III (In-Memory)**: Passed. Round and game state stored in-memory via the existing `rooms` Map.
- **Principle IV (No Auth)**: Passed. Identifiers are dynamic `participantId` strings, no user account credentials/auth.
- **Principle V (Error Handling)**: Passed. Zod validates inputs; errors returned via Express handlers and rendered client-side.
- **Principle VI (React & CSS)**: Passed. Frontend uses functional components/hooks and standard CSS modules or global styles in `app.css`.

All constitution rules are strictly satisfied. No complexity tracking exceptions are required.

## Project Structure

### Documentation (this feature)

```text
specs/002-game-start-flow/
├── plan.md              # This file
├── research.md          # Design decisions and alternatives
├── data-model.md        # State representations and fields
├── quickstart.md        # Developer setup and manual verification steps
├── contracts/           # API contract definitions
│   └── api.md
└── tasks.md             # Implementation tasks (generated next)
```

### Source Code

```text
backend/
├── src/
│   ├── api/
│   │   ├── rooms.ts     # Start game endpoint already exists (POST /rooms/:code/start)
│   │   └── schemas.ts   # Zod schemas for game start and round
│   ├── models/
│   │   └── game.ts      # TypeScript interfaces — add Round, GameState, update Room
│   ├── services/
│   │   └── roomStore.ts # Add round creation, word selection, drawer assignment
│   ├── seed/
│   │   └── starterData.ts # Starter words and roles
│   ├── app.ts
│   └── server.ts

frontend/
├── src/
│   ├── pages/
│   │   └── GamePage.tsx # New game page — drawer/guesser views
│   ├── state/
│   │   └── roomStore.ts # Add game state and round data
│   └── services/
│       └── api.ts       # Add game state fetch endpoint
```

**Structure Decision**: Web application option. Both frontend and backend directories exist and are modified to support this feature. The existing room store and API patterns are reused.

## Complexity Tracking

No violations of core principles are proposed. Simplicity is maintained by following pre-existing architecture patterns.
