# Implementation Plan: Room Setup and Lobby

**Branch**: `001-room-setup-lobby` | **Date**: 2026-06-03 | **Spec**: [specs/001-room-setup-lobby/spec.md](file:///Users/keerthana/Documents/scribble-assignment/specs/001-room-setup-lobby/spec.md)

**Input**: Feature specification from `/specs/001-room-setup-lobby/spec.md`

## Summary

This plan details the implementation of Room Setup & Lobby (Scenario 1). It enables players to create or join isolated game rooms via unique codes. The creator is designated as the host. The lobby updates automatically using ~2-second HTTP polling. Only the host can start the game, and only when there are at least 2 players in the lobby.

## Technical Context

**Language/Version**: TypeScript / Node.js 18+ (ES Modules)

**Primary Dependencies**: React (v18), React Router (v6), Vite, Express, Zod, tsx

**Storage**: In-memory storage using JS Map on the backend (within `backend/src/services/roomStore.ts`).

**Testing**: Vitest (unit/integration tests)

**Target Platform**: Web (Modern Browsers)

**Project Type**: Web application (Monolithic frontend/backend repository)

**Performance Goals**: Lobby polling cadence of ~2 seconds; API response time under 100ms.

**Constraints**: No WebSockets (use HTTP polling only), no databases (in-memory only), no authentication (session tracked via `participantId`).

**Scale/Scope**: Local/testing multiplayer support with isolated concurrent rooms.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Principle I (TypeScript)**: Passed. All backend/frontend code is written in TS.
- **Principle II (HTTP Polling)**: Passed. Client sync uses 2-second HTTP polling. No WebSockets.
- **Principle III (In-Memory)**: Passed. State is stored in-memory using `rooms` Map. Inactive rooms will be cleaned up.
- **Principle IV (No Auth)**: Passed. Identifiers are dynamic `participantId` strings, no user account credentials/auth.
- **Principle V (Error Handling)**: Passed. Zod validates API inputs; errors are returned via Express handlers and rendered nicely on client.
- **Principle VI (React & CSS)**: Passed. Frontend uses functional components/hooks and standard CSS modules or global styles in `app.css`.

All constitution rules are strictly satisfied. No complexity tracking exceptions are required.

## Project Structure

### Documentation (this feature)

```text
specs/001-room-setup-lobby/
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
│   │   ├── rooms.ts     # Express endpoints (POST /rooms, POST /rooms/:code/join, GET /rooms/:code, POST /rooms/:code/start)
│   │   └── schemas.ts   # Zod request validation schemas
│   ├── models/
│   │   └── game.ts      # TypeScript interfaces for Room, Participant, RoomSnapshot
│   ├── services/
│   │   └── roomStore.ts # Room CRUD and core state mutation service
│   ├── app.ts
│   └── server.ts
└── tests/

frontend/
├── src/
│   ├── pages/
│   │   ├── LobbyPage.tsx # Automatically polls every 2 seconds; host-only Start button
│   │   ├── JoinRoomPage.tsx # Trims inputs, uppercase code, clear error messages
│   │   └── CreateRoomPage.tsx # Trims inputs, creates room, redirects to lobby
│   ├── state/
│   │   └── roomStore.ts  # Zustand/Context state and api helpers
│   └── services/
│       └── api.ts       # API client methods (createRoom, joinRoom, fetchRoom, startGame)
└── tests/
```

**Structure Decision**: Web application option. Both frontend and backend directories exist and are modified to support this feature.

## Complexity Tracking

No violations of core principles are proposed. Simplicity is maintained by following pre-existing architecture patterns.
