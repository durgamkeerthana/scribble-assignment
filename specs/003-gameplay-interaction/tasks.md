# Tasks: Gameplay Interaction

**Input**: Design documents from `specs/003-gameplay-interaction/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/api.md

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
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

- [ ] T001 Add `Stroke` (point[]), `Guess` (participantId, text, isCorrect, timestamp), and `guesses/strokes/scores` fields to backend models in `backend/src/models/game.ts`
- [ ] T002 [P] Update `RoundSnapshot` to include `strokes: Stroke[]` and `guesses: Guess[]` in `backend/src/models/game.ts`
- [ ] T003 [P] Update `RoomSnapshot` to include `scores: Record<string, number>` in `backend/src/models/game.ts`
- [ ] T004 [P] Add Zod schemas for `strokeSchema`, `guessSubmissionSchema`, `canvasClearSchema` in `backend/src/api/schemas.ts`

**Checkpoint**: Foundation ready — user story implementation can now begin

---

## Phase 3: User Story 1 — Interactive Drawing Canvas (Priority: P1) 🎯 MVP

**Goal**: The drawer can draw freeform lines on a canvas and clear it; guessers see the same drawing synced via polling

**Independent Test**: Open two browser windows. In window 1 (drawer), draw on the canvas. In window 2 (guesser), the drawing appears within the polling interval (~2s). Clear the canvas in window 1 — the cleared state appears in window 2.

### Implementation for User Story 1

- [ ] T005 [P] [US1] Implement `addStroke(roomCode, participantId, stroke)` and `clearCanvas(roomCode, participantId)` in `backend/src/services/roomStore.ts` (append to Round.strokes, validate drawer, reset strokes)
- [ ] T006 [P] [US1] Implement POST `/rooms/:code/canvas` endpoint in `backend/src/api/rooms.ts`
- [ ] T007 [P] [US1] Implement POST `/rooms/:code/canvas/clear` endpoint in `backend/src/api/rooms.ts`
- [ ] T008 [US1] Include `strokes` in RoundSnapshot for all viewers (guessers see strokes, drawer sees strokes) in `backend/src/services/roomStore.ts` `toRoomSnapshot()`
- [ ] T009 [P] [US1] Create `Canvas.tsx` component in `frontend/src/components/Canvas.tsx` (native HTML Canvas API, mouse events for drawing, display-only mode for guessers, Clear button)
- [ ] T010 [P] [US1] Add `addStroke(roomCode, participantId, stroke)` and `clearCanvas(roomCode, participantId)` API methods in `frontend/src/services/api.ts`
- [ ] T011 [US1] Add `addStroke` and `clearCanvas` methods to RoomStore in `frontend/src/state/roomStore.ts`
- [ ] T012 [US1] Wire Canvas into `frontend/src/pages/GamePage.tsx` (drawer gets interactive canvas, guessers get view-only canvas)
- [ ] T013 [US1] Add canvas-related CSS styles to `frontend/src/styles/app.css`

**Checkpoint**: US1 fully functional — drawer draws/clears, guessers see synced canvas

---

## Phase 4: User Story 2 — Guess Submission & Validation (Priority: P1)

**Goal**: Guessers can submit guesses that are validated (trimmed, case-insensitive, empty rejection) and receive correct/incorrect feedback

**Independent Test**: As a guesser, type a guess and submit. If correct (case-insensitive match), see "Correct!" notification. If incorrect, see "Incorrect" notification. Empty/whitespace guesses are rejected with "Guess cannot be empty" before reaching server.

### Implementation for User Story 2

- [ ] T014 [P] [US2] Implement `submitGuess(roomCode, participantId, text)` in `backend/src/services/roomStore.ts` (trim, validate non-empty, case-insensitive compare, append to Round.guesses, return isCorrect result)
- [ ] T015 [US2] Implement POST `/rooms/:code/guess` endpoint in `backend/src/api/rooms.ts`
- [ ] T016 [US2] Include `guesses` in RoundSnapshot for all viewers in `backend/src/services/roomStore.ts` `toRoomSnapshot()`
- [ ] T017 [P] [US2] Add `submitGuess(roomCode, participantId, text)` API method in `frontend/src/services/api.ts`
- [ ] T018 [US2] Add `submitGuess` method to RoomStore in `frontend/src/state/roomStore.ts`
- [ ] T019 [US2] Update `GuessForm.tsx` in `frontend/src/components/GuessForm.tsx` to call API, reject empty guesses client-side, and display correct/incorrect feedback message
- [ ] T020 [US2] Wire guess feedback display into `frontend/src/pages/GamePage.tsx`

**Checkpoint**: US2 fully functional — guessers submit validated guesses, see correct/incorrect feedback

---

## Phase 5: User Story 3 — Guess History & Scoring (Priority: P2)

**Goal**: All players see the complete guess history (with guesser names) and current scores, synced via polling. Correct guesses award 100 points.

**Independent Test**: Multiple guessers submit guesses during a round. The guess history shows all guesses with guesser names within the polling interval. Correct guesses add 100 to the guesser's score. All players see the same scores.

### Implementation for User Story 3

- [ ] T021 [P] [US3] Initialize scores map in `startRoom()` in `backend/src/services/roomStore.ts` (each participant starts at 0)
- [ ] T022 [US3] Update `submitGuess` in `backend/src/services/roomStore.ts` to increment score (+100) for correct guesses (skip score increment if guesser already correct)
- [ ] T023 [US3] Include `scores` in RoomSnapshot for all viewers in `backend/src/services/roomStore.ts` `toRoomSnapshot()`
- [ ] T024 [P] [US3] Update `Scoreboard.tsx` in `frontend/src/components/Scoreboard.tsx` to display real scores from `room.scores` data
- [ ] T025 [P] [US3] Create `GuessHistory.tsx` component in `frontend/src/components/GuessHistory.tsx` to display ordered guess list (guesser name + guess text + correct/incorrect indicator)
- [ ] T026 [US3] Wire Scoreboard and GuessHistory into `frontend/src/pages/GamePage.tsx` (replace placeholder Scoreboard, add GuessHistory to activity sidebar)
- [ ] T027 [US3] Add guess history and scoreboard CSS styles to `frontend/src/styles/app.css`

**Checkpoint**: US3 fully functional — scores tracked, guess history and scores visible to all players

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Verification that everything works together

- [ ] T028 [P] Verify backend type checking: `cd backend && npx tsc --noEmit`
- [ ] T029 [P] Verify frontend type checking: `cd frontend && npx tsc --noEmit`
- [ ] T030 Run through quickstart manual test scenarios from `specs/003-gameplay-interaction/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — skipped (project already initialized)
- **Foundational (Phase 2)**: No dependencies — BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Foundational completion
- **US2 (Phase 4)**: Depends on Foundational completion — independent of US1
- **US3 (Phase 5)**: Depends on Foundational, US2 completion (needs guess mechanism + scores integration)
- **Polish (Phase 6)**: Depends on all user stories complete

### User Story Dependencies

- **US1 (P1)**: Can start after Foundational — No dependencies on other stories
- **US2 (P1)**: Can start after Foundational — No dependencies on US1
- **US3 (P2)**: Depends on US2 (needs guess submission mechanism for scoring)

### Within Each User Story

- Models before services
- Services before endpoints
- Backend endpoints before frontend API methods
- Frontend API methods before store methods
- Store methods before component wiring

### Parallel Opportunities

- All Foundational tasks marked [P] can run in parallel
- T005, T006, T007 (US1 backend) can run in parallel
- T009, T010 (US1 frontend) can run in parallel
- T014 (US2 backend), T017 (US2 frontend API) can run in parallel
- T021, T024, T025 (US3) can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch all backend tasks together:
Task: "T005 addStroke/clearCanvas in roomStore.ts"
Task: "T006 POST /canvas endpoint in rooms.ts"
Task: "T007 POST /canvas/clear endpoint in rooms.ts"

# Launch all frontend tasks together:
Task: "T009 Create Canvas.tsx component"
Task: "T010 Add addStroke/clearCanvas in api.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 2: Foundational
2. Complete Phase 3: User Story 1 (Canvas)
3. **STOP and VALIDATE**: Test canvas drawing + clearing + sync independently
4. Deploy/demo if ready

### Incremental Delivery

1. Complete Phase 2 → Foundation ready
2. Add US1 (Canvas, P1) → Test independently → **MVP!**
3. Add US2 (Guesses, P1) → Test independently
4. Add US3 (Scoring, P2) → Test independently
5. Each story adds value without breaking previous stories
