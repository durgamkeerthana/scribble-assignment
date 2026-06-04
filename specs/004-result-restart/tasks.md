# Tasks: Result Display & Restart

**Input**: Design documents from `specs/004-result-restart/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/api.md

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2)
- Include exact file paths in descriptions

## Path Conventions

- **Backend**: `backend/src/`
- **Frontend**: `frontend/src/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project already initialized from previous features. No setup tasks needed.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core model/type changes that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T001 Add `"result"` to `RoomStatus` union type in `backend/src/models/game.ts`
- [X] T002 Update `toRoomSnapshot()` in `backend/src/services/roomStore.ts` to reveal `secretWord` to ALL viewers when the round status is `"complete"` (not just drawer)

**Checkpoint**: Foundation ready — user story implementation can now begin

---

## Phase 3: User Story 1 — Round Result Display (Priority: P1) 🎯 MVP

**Goal**: When a correct guess concludes the round, all players see a shared result state showing the secret word (revealed), final scores, and complete guess history

**Independent Test**: Start a game, have a guesser submit the correct word. All player screens transition to a result view showing: the correct word visible to everyone, final scores, and the full list of guesses from that round. All players see the same data.

### Implementation for User Story 1

- [X] T003 [US1] Update `submitGuess()` in `backend/src/services/roomStore.ts` to transition `round.status` to `"complete"`, `room.status` to `"result"`, and return `roundComplete: true` on correct guess
- [X] T004 [P] [US1] Add `"result"` handling to display helpers if any in `backend/src/services/roomStore.ts` — flows through naturally via RoomStatus
- [X] T005 [P] [US1] Ensure `RoomSnapshot` and `RoundSnapshot` types in `frontend/src/services/api.ts` include `"result"` in RoomStatus
- [X] T006 [US1] Add result view to `frontend/src/pages/GamePage.tsx` that shows when `room.status === "result"`: the correct secret word, sorted final scores, and guess history
- [X] T007 [US1] Add result view CSS styles to `frontend/src/styles/app.css`

**Checkpoint**: US1 fully functional — correct guess triggers result state with word, scores, history visible to all

---

## Phase 4: User Story 2 — Host Restart (Priority: P1)

**Goal**: From the result screen, the host can restart the game. All players return to the lobby with participants preserved and all round state cleared.

**Independent Test**: From the result screen, the host clicks "Restart Game". All players see the lobby with the same participant list, scores reset to 0, and no current round. The host can start a new game.

### Implementation for User Story 2

- [X] T008 [P] [US2] Implement `restartGame(code, participantId)` in `backend/src/services/roomStore.ts` (validate host, clear rounds/scores, set status to "lobby", preserve participants)
- [X] T009 [US2] Add POST `/rooms/:code/restart` endpoint in `backend/src/api/rooms.ts` (reuses startRoomSchema)
- [X] T010 [P] [US2] Add `restartGame(code, participantId)` API method in `frontend/src/services/api.ts`
- [X] T011 [US2] Add `restartGame` method to RoomStore in `frontend/src/state/roomStore.ts`
- [X] T012 [US2] Add "Restart Game" button to result view in `frontend/src/pages/GamePage.tsx` (visible only when `room.status === "result"` and viewer is host)
- [X] T013 [US2] Wire restart button to call API in `frontend/src/pages/GamePage.tsx`

**Checkpoint**: US2 fully functional — host restarts from result, all players see lobby with same participants, ready for new game

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Verification that everything works together

- [X] T014 [P] Verify backend type checking: `cd backend && npx tsc --noEmit` — PASS
- [X] T015 [P] Verify frontend type checking: `cd frontend && npx tsc --noEmit` — PASS
- [X] T016 Run through manual test scenarios from `specs/004-result-restart/quickstart.md` — PASS (all endpoints verified)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 2)**: No dependencies — BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Foundational completion
- **US2 (Phase 4)**: Depends on US1 completion (restart button lives in the result view created by US1)
- **Polish (Phase 5)**: Depends on all user stories complete

### Within Each User Story

- Backend logic before frontend components
- Data model changes before service functions
- Endpoints before API methods
- API methods before store methods
- Store methods before component integration

### Parallel Opportunities

- T001, T002 (Foundational) can run in parallel
- T004, T005 (US1) can run in parallel
- T008, T010 (US2 backend + frontend API) can run in parallel
- T014, T015 (Polish) can run in parallel

---

## Parallel Example: User Story 1

```bash
# Run backend + frontend tasks together:
Task: "T003 submitGuess adds roundComplete logic in roomStore.ts"
Task: "T005 Update RoomStatus type in api.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 2: Foundational
2. Complete Phase 3: User Story 1 (Result Display)
3. **STOP and VALIDATE**: Test result state transition and display independently
4. Deploy/demo if ready

### Incremental Delivery

1. Complete Phase 2 → Foundation ready
2. Add US1 (Result Display, P1) → Test independently → **MVP!**
3. Add US2 (Restart, P1) → Test independently
4. Each story adds value without breaking previous stories
