# Discovery Notes

## Starter Codebase Inspection

### What the Starter Already Has

- **Backend**: Express + TypeScript with in-memory `Map<string, Room>` store, routes for `GET /health`, `POST /rooms`, `POST /rooms/:code/join`, `GET /rooms/:code`
- **Frontend**: Vite + React 18 + TypeScript with React Router v6, a `RoomStore` class with `useSyncExternalStore`, starter pages (Start, Create Room, Join Room, Lobby, Game)
- **Seed data**: 5 words (`rocket`, `pizza`, `castle`, `guitar`, `sunflower`), 2 roles (`drawer`, `guesser`)
- **Models**: `Room`, `Participant`, `Round`, `Guess`, `Stroke`, `Point` interfaces in `backend/src/models/game.ts`
- **API service**: `frontend/src/services/api.ts` with `request<T>` helper, typed endpoints for room CRUD

### Identified Gaps / Incomplete Behaviors

1. **Host tracking & permissions**: `Room.hostId` is set on creation but no enforcement — any participant could start the game. No host-only guard on start, restart, or other actions.
2. **Lobby polling**: The Lobby page has a manual "Refresh" button but no automatic polling. Players must manually refresh to see new joiners.
3. **Game start**: `POST /rooms/:code/start` endpoint exists in the API service but no backend route handler. The frontend has no flow to transition from lobby to game.
4. **Drawer assignment**: No mechanism to assign the first drawer. The `Round` model exists but no logic to create rounds or select drawers.
5. **Secret word visibility**: No word selection logic. The secret word is not hidden from guessers during active rounds.
6. **Canvas interaction**: `POST /rooms/:code/canvas` and `POST /rooms/:code/canvas/clear` route handlers exist in the API service but no backend implementation. The canvas component exists but has no drawing interaction.
7. **Guess submission**: `POST /rooms/:code/guess` endpoint exists in API service but no backend handler. Guess validation, case-insensitive comparison, and scoring are unimplemented.
8. **Result state**: No mechanism to transition from active round to result. No result screen implementation.
9. **Restart flow**: No restart endpoint or logic to clear round state while preserving participants.

### Assumptions

1. **2-second polling interval**: The lobby and game pages should poll the room snapshot every ~2 seconds. This matches the "about 2 seconds" language in the spec and is the minimum viable sync mechanism without WebSockets.
2. **In-memory only**: All state lives in a `Map` and is lost on server restart. No persistence or database is expected.
3. **Single-round flow**: The game supports exactly one round per game session. "Restart" returns to lobby to begin a new session. Multi-round with drawer rotation is explicitly out of scope.
4. **Deterministic word selection**: Words are chosen cyclically by round number modulo the word list, so all players deterministically agree on the word without server broadcast.

### Relevant Files

- `backend/src/models/game.ts` — Room, Round, Participant, Guess, Stroke types
- `backend/src/services/roomStore.ts` — In-memory store with CRUD operations
- `backend/src/seed/starterData.ts` — Word list and role definitions
- `backend/src/api/rooms.ts` — Express route definitions
- `frontend/src/services/api.ts` — Typed API client
- `frontend/src/state/roomStore.ts` — Client-side state management
- `frontend/src/pages/GamePage.tsx` — Game screen layout
- `frontend/src/pages/LobbyPage.tsx` — Lobby screen with manual refresh
- `frontend/src/components/Canvas.tsx` — Canvas placeholder component
