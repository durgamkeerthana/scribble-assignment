# Tasks: Room Setup and Lobby

**Input**: Design documents from `/specs/001-room-setup-lobby/`

**Prerequisites**: plan.md ✓, spec.md ✓, data-model.md ✓, contracts/api.md ✓, research.md ✓, quickstart.md ✓

**Tests**: Not explicitly requested — no test tasks generated. TDD tasks are omitted.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1–US4)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Verify project structure matches plan, and all dependencies are in place.

- [X] T001 Verify backend directory structure matches plan.md (`backend/src/api/`, `backend/src/services/`, `backend/src/models/`)
- [X] T002 Verify frontend directory structure matches plan.md (`frontend/src/pages/`, `frontend/src/state/`, `frontend/src/services/`)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core data models, schemas, and shared service infrastructure that ALL user stories depend on.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T003 Add `hostId` field to `Room` interface in `backend/src/models/game.ts`
- [X] T004 Add `"active"` to the `RoomStatus` union type in `backend/src/models/game.ts`
- [X] T005 [P] Add `hostId` field to `RoomSnapshot` interface in `backend/src/models/game.ts`
- [X] T006 [P] Add `hostId` field to `RoomSnapshot` type in `frontend/src/services/api.ts`
- [X] T007 Add `startGame` method to the `api` object in `frontend/src/services/api.ts`
- [X] T008 Update `createRoom` in `backend/src/services/roomStore.ts` to set `room.hostId = participant.id`
- [X] T009 Update `toRoomSnapshot` in `backend/src/services/roomStore.ts` to include `hostId` in the returned snapshot object
- [X] T010 Strengthen Zod schema for `playerName` in `backend/src/api/schemas.ts` to trim and enforce non-empty string (min 1 char)
- [X] T011 Add `startRoomSchema` Zod schema (body: `{ participantId: string }`) in `backend/src/api/schemas.ts`

**Checkpoint**: Data model, API types, and validation schemas updated — user story implementations can now proceed.

---

## Phase 3: User Story 1 — Hosting a New Room (Priority: P1) 🎯 MVP

**Goal**: A player can create a room; they are automatically designated as host and see themselves in the lobby with a unique 4-character room code.

**Independent Test**: Click "Create Room", enter a name, submit — redirected to `/lobby` showing room code and the creator's name. The creator is the host.

### Implementation for User Story 1

- [X] T012 [US1] Validate that `POST /rooms` response now includes `room.hostId` (manual test via `curl` or Postman against `backend` dev server)
- [X] T013 [US1] Update `CreateRoomPage.tsx` to trim `playerName` before calling `roomStore.createRoom` in `frontend/src/pages/CreateRoomPage.tsx`
- [X] T014 [US1] Display host badge next to the creator's name in the participants list on `LobbyPage.tsx` in `frontend/src/pages/LobbyPage.tsx`

**Checkpoint**: Room creation works end-to-end. The creator sees the lobby with their name and room code. `hostId` is present in snapshot.

---

## Phase 4: User Story 2 — Joining an Existing Room (Priority: P1)

**Goal**: A player can join a room with a valid code. Invalid, empty, or whitespace-only codes are rejected with clear error feedback before hitting the API.

**Independent Test**: Enter a valid room code → redirected to lobby. Enter empty or non-existent code → error message shown, stays on Join page.

### Implementation for User Story 2

- [X] T015 [US2] Add frontend validation in `JoinRoomPage.tsx`: trim room code, reject empty/whitespace with error "Room code cannot be empty." before API call in `frontend/src/pages/JoinRoomPage.tsx`
- [X] T016 [US2] Add frontend validation in `JoinRoomPage.tsx`: trim player name, reject empty/whitespace with error "Player name cannot be empty." in `frontend/src/pages/JoinRoomPage.tsx`
- [X] T017 [US2] Update `joinRoom` handler in `backend/src/api/rooms.ts` to return a specific 404 error message: `"Room ${code} not found"` when room doesn't exist
- [X] T018 [US2] Update `joinRoom` in `backend/src/services/roomStore.ts` to reject joins when `room.status !== "lobby"` (return `null` if room is already active)

**Checkpoint**: Invalid codes fail fast on the client. Non-existent codes produce a clear 404 message. Active rooms cannot be joined.

---

## Phase 5: User Story 3 — Synced Lobby View via Polling (Priority: P2)

**Goal**: The lobby participant list automatically refreshes every ~2 seconds without any manual interaction.

**Independent Test**: With two browser windows open, when guest joins, host's lobby updates within 2 seconds without clicking refresh.

### Implementation for User Story 3

- [X] T019 [US3] Replace the manual "Refresh Room" button logic in `LobbyPage.tsx` with a `setInterval`-based auto-poll calling `roomStore.fetchRoom()` every 2000ms, cleaned up on unmount in `frontend/src/pages/LobbyPage.tsx`
- [X] T020 [US3] Handle polling errors gracefully in `LobbyPage.tsx`: catch errors from `fetchRoom()`, store in a `pollingError` state (shown as a subtle status note), and allow the interval to continue silently in `frontend/src/pages/LobbyPage.tsx`
- [X] T021 [US3] Remove the manual "Refresh Room" button from `LobbyPage.tsx` UI now that auto-polling is active in `frontend/src/pages/LobbyPage.tsx`
- [X] T022 [US3] In `LobbyPage.tsx`, add auto-navigation to `/game` when the polled `room.status` transitions to `"active"` in `frontend/src/pages/LobbyPage.tsx`

**Checkpoint**: Lobby refreshes automatically. Both host and guest windows stay in sync within 2 seconds. Room status transition triggers navigation.

---

## Phase 6: User Story 4 — Host-Only Start Game Control (Priority: P2)

**Goal**: Only the host sees and can click the "Start Game" button. It is disabled until at least 2 players are in the lobby. The game start is validated on the server.

**Independent Test**: Host alone → Start Game disabled. Guest → no Start Game button (only a waiting message). Host with 2+ players → Start Game enabled; clicking starts game for all.

### Implementation for User Story 4

- [X] T023 [US4] Add `POST /rooms/:code/start` endpoint in `backend/src/api/rooms.ts` that: validates `participantId` in body, checks caller is host (403 if not), checks participant count ≥ 2 (400 if not), sets `room.status = "active"` via a new `startRoom` service function
- [X] T024 [US4] Add `startRoom` function in `backend/src/services/roomStore.ts` that validates host + participant count, updates status to `"active"`, and returns the updated snapshot
- [X] T025 [US4] Register the `/rooms` router to include the new start route — verify `router.ts` or `app.ts` mounts the rooms router correctly in `backend/src/api/router.ts`
- [X] T026 [US4] Add `startGame` method to the `api` object in `frontend/src/services/api.ts`: `POST /rooms/:code/start` with body `{ participantId }`
- [X] T027 [US4] Add `startGame` action to `RoomStore` class in `frontend/src/state/roomStore.ts` that calls `api.startGame` and updates local room state on success
- [X] T028 [US4] In `LobbyPage.tsx`, derive `isHost` as `roomState.participantId === room.hostId` in `frontend/src/pages/LobbyPage.tsx`
- [X] T029 [US4] In `LobbyPage.tsx`, render "Start Game" button only when `isHost === true`; disable it when `room.participants.length < 2` in `frontend/src/pages/LobbyPage.tsx`
- [X] T030 [US4] In `LobbyPage.tsx`, render a "Waiting for the host to start the game." message for non-host participants in `frontend/src/pages/LobbyPage.tsx`
- [X] T031 [US4] Wire "Start Game" button click to call `roomStore.startGame(room.code, participantId)` in `frontend/src/pages/LobbyPage.tsx`

**Checkpoint**: Start Game is host-only, gated at 2+ players, validated on server. Non-hosts see waiting message. All participants navigate to `/game` automatically via polling.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final cleanup, resilience improvements, and edge-case coverage across all stories.

- [ ] T032 [P] Verify multi-room isolation: create two rooms in two separate incognito windows; confirm participants in Room A do not appear in Room B (manual)
- [X] T033 [P] Verify direct URL access to `/lobby` without room state redirects to `/` with no crash
- [X] T034 Handle the edge case in `LobbyPage.tsx` where `room` becomes `null` mid-poll (e.g., server restart) gracefully — redirect to `/` in `frontend/src/pages/LobbyPage.tsx`
- [ ] T035 [P] Run through the full quickstart.md manual verification checklist end-to-end (manual)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 — **BLOCKS all user stories**
- **Phase 3 (US1)**: Depends on Phase 2 — can start once foundational types are updated
- **Phase 4 (US2)**: Depends on Phase 2 — can proceed in parallel with Phase 3
- **Phase 5 (US3)**: Depends on Phase 3 (needs working room fetch + status field)
- **Phase 6 (US4)**: Depends on Phase 3 + Phase 5 (needs `hostId` in snapshot + polling for game start navigation)
- **Phase 7 (Polish)**: Depends on Phases 3–6 complete

### User Story Dependencies

- **US1 (P1)**: Unblocked after Phase 2
- **US2 (P1)**: Unblocked after Phase 2 — can run in parallel with US1
- **US3 (P2)**: Requires US1 to be complete (needs working room state + `status` field)
- **US4 (P2)**: Requires US1 + US3 (needs `hostId` in snapshot and polling for game-start navigation)

### Within Each User Story

- Backend model/service/schema changes before endpoint changes
- Endpoint changes before frontend API client changes
- Frontend API client before state store changes
- State store changes before page component changes

### Parallel Opportunities

- T003 and T004 must be sequential (same file), but T005 and T006 can run in parallel (different files)
- T010 and T011 can run in parallel (same file but independent schemas — sequence them for safety)
- US1 and US2 can be implemented in parallel (different pages, independent backend changes)
- T032 and T033 can run in parallel during Polish

---

## Parallel Example: Foundational Phase (Phase 2)

```text
Sequential first:
  T003 → T004 → T005  (all backend/src/models/game.ts — sequential for safety)

Then parallel:
  T006  (frontend/src/services/api.ts — hostId type)
  T007  (frontend/src/services/api.ts — startGame method)  ← sequence after T006

  T008  (backend/src/services/roomStore.ts — createRoom hostId)
  T009  (backend/src/services/roomStore.ts — toRoomSnapshot hostId)  ← sequence after T008

  T010  (backend/src/api/schemas.ts — playerName)
  T011  (backend/src/api/schemas.ts — startRoomSchema)  ← sequence after T010
```

---

## Implementation Strategy

### MVP First (User Stories 1 & 2)

1. Complete Phase 1: Setup verification
2. Complete Phase 2: Foundational models and schemas
3. Complete Phase 3: User Story 1 (host tracking)
4. Complete Phase 4: User Story 2 (join validation)
5. **STOP and VALIDATE**: Test create + join flows end-to-end
6. Demo or proceed to polling + game start

### Incremental Delivery

1. Phase 1 + 2 → Foundation ready
2. Phase 3 (US1) → Room creation with host identity ✓
3. Phase 4 (US2) → Join validation with clear errors ✓
4. Phase 5 (US3) → Auto-polling lobby sync ✓
5. Phase 6 (US4) → Host-only game start ✓
6. Phase 7 → Polish and edge cases ✓

---

## Notes

- All TypeScript interfaces must be updated before implementing logic that uses them
- `hostId` flows from `Room` → `roomStore.ts` service → `RoomSnapshot` → API response → frontend `RoomSnapshot` type — update in this order
- No new external packages should be added (constitution rule: no unjustified dependencies)
- `setInterval` in `LobbyPage` must be cleaned up via `useEffect` return function to avoid memory leaks
- The "Start Game" backend validation (403/400) must be enforced server-side regardless of UI gating
