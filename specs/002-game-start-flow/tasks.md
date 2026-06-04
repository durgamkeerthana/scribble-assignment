# Tasks: Game Start and Drawer Flow

**Input**: Design documents from `/specs/002-game-start-flow/`

**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, contracts/api.md ✓, quickstart.md ✓

**Tests**: Not explicitly requested — no test tasks generated. TDD tasks are omitted.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1–US2)

---

## Phase 1: Setup

**Purpose**: Verify project structure matches plan and all dependencies are in place.

- [X] T001 Verify backend directory structure matches plan.md (`backend/src/models/`, `backend/src/services/`, `backend/src/api/`, `backend/src/seed/`)
- [X] T002 Verify frontend directory structure matches plan.md (`frontend/src/pages/`, `frontend/src/state/`, `frontend/src/services/`)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core data model types that both user stories depend on.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T003 Add `Round` and `RoundSnapshot` interfaces to `backend/src/models/game.ts` — `Round` has `roundNumber`, `drawerId`, `secretWord`, `status`; `RoundSnapshot` has `roundNumber`, `drawerId`, `secretWord`, `status`
- [X] T004 Add `currentRound: RoundSnapshot | null` field to `RoomSnapshot` interface in both `backend/src/models/game.ts` and `frontend/src/services/api.ts`
- [X] T005 [P] Add `RoundSnapshot` type to `frontend/src/services/api.ts` mirroring the backend definition

**Checkpoint**: Data model types updated — user story implementations can now proceed.

---

## Phase 3: User Story 1 — Starting a Game and Assigning the Drawer (Priority: P1) 🎯 MVP

**Goal**: When the host starts a game, participant names are validated, the game becomes active, and the host is assigned as the first round's drawer.

**Independent Test**: Host clicks "Start Game" with 2+ players with valid names. All players navigate to `/game`. The drawer (host) is clearly identified with a badge. If a name is empty, the game does not start and an error is shown.

### Implementation for User Story 1

- [X] T006 [US1] Update `startRoom` in `backend/src/services/roomStore.ts` — before transitioning to `"active"`, validate all participant names: trim whitespace, reject empty/whitespace-only with `HttpError(400, "Player name cannot be empty")`. If all valid, create round 1 with `drawerId = room.participants[0].id` (the host), `secretWord` selected deterministically via `STARTER_WORDS[(roundNumber - 1) % STARTER_WORDS.length]`, and `status = "drawing"`. Set `currentRound` on the room state.
- [X] T007 [US1] Update `toRoomSnapshot` in `backend/src/services/roomStore.ts` — include `currentRound` in the returned snapshot. When `viewerParticipantId` is provided and does not match the round's `drawerId`, set `secretWord` to `null` (drawer-only visibility).
- [X] T008 [US1] Update `POST /rooms/:code/start` handler in `backend/src/api/rooms.ts` to pass `participantId` to `toRoomSnapshot` for word visibility control
- [X] T009 [US1] Update `GET /rooms/:code` handler in `backend/src/api/rooms.ts` — verify `participantId` from query is passed to `toRoomSnapshot` so word visibility works on polled fetches
- [X] T010 [US1] Update `GamePage.tsx` in `frontend/src/pages/` — display a "You are drawing!" badge when `viewerParticipantId === room.currentRound.drawerId`, or display "X is drawing" with the drawer's name when viewer is a guesser. Use `room.currentRound` from the room state.

**Checkpoint**: Game start works end-to-end. Host is identified as drawer. Empty names block game start. All players see the correct drawer identity.

---

## Phase 4: User Story 2 — Secret Word Selection and Visibility (Priority: P1)

**Goal**: The secret word is shown only to the drawer. Guessers see a placeholder message.

**Independent Test**: After game start, the drawer sees the secret word on screen. A guesser (in another window) does not see the word — only a message like "Alice is drawing".

### Implementation for User Story 2

- [X] T011 [US2] In `GamePage.tsx`, display the `secretWord` from `room.currentRound` when the viewer is the drawer. Display a placeholder message (e.g., "{drawerName} is drawing") when the viewer is a guesser.
- [X] T012 [US2] Add auto-polling in `GamePage.tsx` — use `setInterval` to call `roomStore.fetchRoom()` every 2000ms to keep `currentRound` state in sync, with cleanup on unmount and graceful error handling

**Checkpoint**: Secret word is displayed to drawer only. Guessers see a placeholder. Game state updates via polling.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Final cleanup, resilience improvements, and edge-case coverage.

- [ ] T013 [P] Verify multi-room isolation: create two games in two separate incognito windows; confirm drawer identity and secret word from Game A do not leak to Game B (manual)
- [X] T014 [P] Verify redirect: accessing `/game` without active room state redirects to `/` with no crash — implemented via `useEffect` redirect guard in `GamePage.tsx`
- [ ] T015 Run through the full quickstart.md manual verification checklist end-to-end (manual)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 — **BLOCKS all user stories**
- **Phase 3 (US1)**: Depends on Phase 2 — implement before US2
- **Phase 4 (US2)**: Depends on Phase 3 (needs working game start with currentRound)
- **Phase 5 (Polish)**: Depends on Phases 3–4 complete

### User Story Dependencies

- **US1 (P1)**: Unblocked after Phase 2 — MVP
- **US2 (P1)**: Requires US1 to be complete (needs `currentRound` with drawer assigned and word selected)

### Within Each User Story

- Backend model changes before service changes
- Service changes before API endpoint changes
- API endpoint changes before frontend changes

### Parallel Opportunities

- T003 and T004 are sequential (same file), but T004 and T005 can proceed after T003
- T009 is a verification task that can run alongside T010

---

## Parallel Example: User Story 1

```text
Sequential:
  T006  (backend/src/services/roomStore.ts — startRoom update)
  T007  (backend/src/services/roomStore.ts — toRoomSnapshot update)  ← sequence after T006

Then:
  T008  (backend/src/api/rooms.ts — start handler)
  T009  (backend/src/api/rooms.ts — get handler)  ← can proceed in parallel with T008
  T010  (frontend/src/pages/GamePage.tsx)  ← can proceed after T007
```

---

## Implementation Strategy

### MVP First (User Story 1)

1. Complete Phase 1: Setup verification
2. Complete Phase 2: Foundational models
3. Complete Phase 3: User Story 1 (game start + drawer assignment)
4. **STOP and VALIDATE**: Test game start + drawer identity end-to-end
5. Complete Phase 4: User Story 2 (word visibility)

### Incremental Delivery

1. Phase 1 + 2 → Foundation ready
2. Phase 3 (US1) → Game starts, drawer assigned, names validated ✓
3. Phase 4 (US2) → Secret word visible only to drawer ✓
4. Phase 5 → Polish and edge cases ✓

---

## Notes

- All TypeScript interfaces must be updated before implementing logic that uses them
- `currentRound` flows from `startRoom` → `room` state → `toRoomSnapshot` → API response → frontend — update in this order
- Word selection uses deterministic index: `STARTER_WORDS[(roundNumber - 1) % STARTER_WORDS.length]`
- Secret word is conditionally set to `null` in `toRoomSnapshot` when `viewerParticipantId` is not the drawer
- Existing `POST /rooms/:code/start` and `GET /rooms/:code` endpoints are modified, not replaced
- Existing `GamePage.tsx` in frontend already has a `/game` route — update in place
- No new external packages should be added (constitution rule: no unjustified dependencies)
- `setInterval` in `GamePage` must be cleaned up via `useEffect` return function to avoid memory leaks
