---
description: "Task list for Scoring, Timers, and Host Migration"
---

# Tasks: Scoring, Timers, and Host Migration

**Input**: Design documents from `specs/005-scoring-hosting/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/api.md

**Tests**: Included — the plan's Testing Strategy defines 38 test cases.

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to
- Include exact file paths

---

## Phase 1: Setup

**Purpose**: Project is already initialized. No setup tasks needed.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Model and snapshot changes that all user stories depend on.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [ ] T001 [P] Add `startedAt` field to `Round` interface in `backend/src/models/game.ts`
- [ ] T002 [P] Add `lastPollAt` field to `Participant` interface in `backend/src/models/game.ts`
- [ ] T003 [P] Add `remainingTime` and `drawerScore` fields to response types in `frontend/src/services/api.ts`
- [ ] T004 Add `roundTimerEndedAt` or similar constant for 60s timer in `backend/src/seed/starterData.ts`
- [ ] T005 [P] Update `toRoomSnapshot` in `backend/src/services/roomStore.ts` to compute `remainingTime` and include it in `RoundSnapshot`
- [ ] T006 Update `startRoom` in `backend/src/services/roomStore.ts` to set `round.startedAt = Date.now()`
- [ ] T007 Update `restartGame` in `backend/src/services/roomStore.ts` to reset host migration state (clear `lastPollAt` on participants)

**Checkpoint**: Foundation ready — user story implementation can now begin.

---

## Phase 3: User Story 1 — Dynamic Scoring (Priority: P1) 🎯 MVP

**Goal**: Guesses receive time-based bonus points; drawer earns 50 points per correct guesser.

**Independent Test**: Start a round, have two guessers submit the correct word at different times. Verify faster guesser gets more points. Verify drawer receives 50 points per correct guesser at round end.

### Tests for User Story 1

- [ ] T008 [P] [US1] Unit test: correct guess with full time remaining awards 150 points in `backend/src/services/roomStore.test.ts`
- [ ] T009 [P] [US1] Unit test: correct guess at half time (30s) awards 125 points in `backend/src/services/roomStore.test.ts`
- [ ] T010 [P] [US1] Unit test: incorrect guess awards 0 points in `backend/src/services/roomStore.test.ts`
- [ ] T011 [P] [US1] Unit test: duplicate correct guess does not award additional points in `backend/src/services/roomStore.test.ts`
- [ ] T012 [P] [US1] Unit test: drawer receives 50 points per correct guesser at round end in `backend/src/services/roomStore.test.ts`
- [ ] T013 [P] [US1] Unit test: drawer receives 0 points if no one guesses correctly in `backend/src/services/roomStore.test.ts`
- [ ] T014 [P] [US1] Unit test: time bonus uses correct-guess timestamp, not first incorrect attempt in `backend/src/services/roomStore.test.ts`

### Implementation for User Story 1

- [ ] T015 [US1] Implement time-bonus calculation in `submitGuess` in `backend/src/services/roomStore.ts` (base 100 + time bonus 50 × remainingTime/60)
- [ ] T016 [US1] Implement drawer scoring in `submitGuess` at round conclusion (50 per correct non-drawing participant) in `backend/src/services/roomStore.ts`
- [ ] T017 [US1] Return `timeBonus`, `timeToGuess`, and `drawerScore` fields from `submitGuess` in `backend/src/services/roomStore.ts`
- [ ] T018 [US1] Update `submitGuess` return type and `GuessResponse` in `frontend/src/services/api.ts` to match new response fields

**Checkpoint**: Scoring is dynamic and differential — fast guessers and good drawers are rewarded.

---

## Phase 4: User Story 2 — Timer-Based Round End (Priority: P1)

**Goal**: 60-second round timer; round auto-ends on expiry or all-correct, transitioning to results.

**Independent Test**: Start a round, wait 60 seconds without guessing. Verify room auto-transitions to result. Start another round, have all guessers guess correctly before expiry. Verify room transitions immediately.

### Tests for User Story 2

- [ ] T019 [P] [US2] Unit test: `remainingTime` is positive during active round in `backend/src/services/roomStore.test.ts`
- [ ] T020 [P] [US2] Unit test: `remainingTime` is 0 after round concludes in `backend/src/services/roomStore.test.ts`
- [ ] T021 [P] [US2] Unit test: poll with `remainingTime ≤ 0` transitions round to complete and room to result in `backend/src/services/roomStore.test.ts`
- [ ] T022 [P] [US2] Unit test: no further guesses accepted after timer expiry (room is "result") in `backend/src/services/roomStore.test.ts`
- [ ] T023 [P] [US2] Unit test: all-non-drawing-guessers-correct transitions room to result (existing test updated) in `backend/src/services/roomStore.test.ts`

### Implementation for User Story 2

- [ ] T024 [US2] Add lazy timer-expiry check in `getRoom`/`toRoomSnapshot` in `backend/src/services/roomStore.ts`: when `remainingTime ≤ 0`, set round.status="complete", room.status="result", compute drawer score
- [ ] T025 [P] [US2] Create `GameTimer` component in `frontend/src/components/GameTimer.tsx` that displays `remainingTime` as integer countdown
- [ ] T026 [US2] Add timer-expiry and all-correct logic to `submitGuess` in `backend/src/services/roomStore.ts` (when last correct guesser submits, transition immediately)
- [ ] T027 [P] [US2] Add `GameTimer` CSS styles to `frontend/src/styles/app.css`
- [ ] T028 [US2] Integrate `GameTimer` into `GamePage.tsx` in the active round layout
- [ ] T029 [P] [US2] Frontend test: `GameTimer` renders remaining time as integer in `frontend/src/components/GameTimer.test.tsx`
- [ ] T030 [P] [US2] Frontend test: `GameTimer` shows "0" when remainingTime is 0 in `frontend/src/components/GameTimer.test.tsx`
- [ ] T031 [P] [US2] Frontend API test: fetchRoom returns `remainingTime` field in `frontend/src/services/api.test.ts`

**Checkpoint**: Rounds are bounded by a 60-second timer. Timer expiry and all-correct both transition to results.

---

## Phase 5: User Story 3 — Enhanced Results Screen (Priority: P2)

**Goal**: Results screen shows secret word, correct guessers with time-to-guess, ranked leaderboard, host restart button.

**Independent Test**: Complete a round (all-correct or timer expiry). Verify the results display shows: secret word, correct guessers with time, ranked scores, host restart button. Verify non-host sees "Waiting for host" instead of button.

### Tests for User Story 3

- [ ] T032 [P] [US3] Frontend component test: `Scoreboard` shows ranked positions (1st, 2nd, 3rd) in `frontend/src/components/Scoreboard.test.tsx`
- [ ] T033 [P] [US3] Frontend component test: `Scoreboard` shows tied scores sharing same rank in `frontend/src/components/Scoreboard.test.tsx`
- [ ] T034 [P] [US3] Frontend component test: enhanced `ResultPanel` displays time-to-guess for correct guessers in `frontend/src/components/ResultPanel.test.tsx`
- [ ] T035 [P] [US3] Frontend component test: `ResultPanel` shows "Did not guess" for non-guessers after timer expiry in `frontend/src/components/ResultPanel.test.tsx`
- [ ] T036 [P] [US3] Frontend component test: host restart button only visible to host in `frontend/src/pages/GamePage.test.tsx`

### Implementation for User Story 3

- [ ] T037 [US3] Enhance `Scoreboard` component in `frontend/src/components/Scoreboard.tsx` to show ranked positions (1st, 2nd, 3rd) with tie handling
- [ ] T038 [US3] Enhance `ResultPanel` in `frontend/src/components/ResultPanel.tsx` to display: secret word, correct guessers with time-to-guess, drawer highlighted, "Did not guess" labels
- [ ] T039 [P] [US3] Add `timeToGuess` display in `GuessHistory` component in `frontend/src/components/GuessHistory.tsx`
- [ ] T040 [US3] Ensure host restart button is conditional on `participantId === room.hostId` in `frontend/src/pages/GamePage.tsx` result view
- [ ] T041 [P] [US3] Add CSS for leaderboard ranks, time-to-guess, "Did not guess" labels in `frontend/src/styles/app.css`

**Checkpoint**: Results screen is fully informative — players see ranks, times, and who guessed correctly.

---

## Phase 6: User Story 4 — Host Migration (Priority: P2)

**Goal**: Auto-reassign host to longest-joined active participant when current host stops polling for 6+ seconds.

**Independent Test**: Create room with 2+ players. Close host browser. Wait 7 seconds. Poll from remaining player — verify they are now host and can restart.

### Tests for User Story 4

- [ ] T042 [P] [US4] Unit test: host with recent poll (< 6s) retains host status in `backend/src/services/roomStore.test.ts`
- [ ] T043 [P] [US4] Unit test: host with stale poll (> 6s) triggers migration in `backend/src/services/roomStore.test.ts`
- [ ] T044 [P] [US4] Unit test: new host is participant with earliest `joinedAt` in `backend/src/services/roomStore.test.ts`
- [ ] T045 [P] [US4] Unit test: migration preserves disconnected host in participant list in `backend/src/services/roomStore.test.ts`
- [ ] T046 [P] [US4] Unit test: no migration when room has only one participant in `backend/src/services/roomStore.test.ts`
- [ ] T047 [P] [US4] Unit test: migration does not affect active round state in `backend/src/services/roomStore.test.ts`
- [ ] T048 [P] [US4] Unit test: poll updates `lastPollAt` on requesting participant in `backend/src/services/roomStore.test.ts`

### Implementation for User Story 4

- [ ] T049 [US4] Update `getRoom` in `backend/src/services/roomStore.ts` to update `lastPollAt` on the requesting participant
- [ ] T050 [US4] Implement `checkHostMigration` helper in `backend/src/services/roomStore.ts`: check host `lastPollAt`, promote longest-joined active participant if stale
- [ ] T051 [US4] Call `checkHostMigration` before returning snapshot in `toRoomSnapshot` in `backend/src/services/roomStore.ts`
- [ ] T052 [US4] Handle host migration edge case: disconnected host returns as regular participant (no auto-re-promotion)

**Checkpoint**: Rooms survive host disconnection — new host can restart the game.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Validation, type checking, and final verification.

### Remaining Tests from Testing Strategy

- [ ] T053 [P] Frontend API test: submitGuess returns `timeBonus`, `timeToGuess`, `drawerScore` in `frontend/src/services/api.test.ts`
- [ ] T054 [P] Frontend store test: room snapshot includes `remainingTime` in `frontend/src/state/roomStore.test.ts`
- [ ] T055 [P] Frontend store test: hostId change detected via poll in `frontend/src/state/roomStore.test.ts`

### Validation

- [ ] T056 Run backend type check: `cd backend && npx tsc --noEmit`
- [ ] T057 Run frontend type check: `cd frontend && npx tsc --noEmit`
- [ ] T058 Run all backend tests: `cd backend && npx vitest run`
- [ ] T059 Run all frontend tests: `cd frontend && npx vitest run`
- [ ] T060 Run integration test (full flow: create room → start → guess with time bonus → timer expiry → host migration) using curl or test server

---

## Dependencies & Execution Order

### Phase Dependencies

| Phase | Depends On | Blocks |
|-------|-----------|--------|
| Phase 1: Setup | — | Phase 2 |
| Phase 2: Foundational | Phase 1 | Phases 3-6 |
| Phase 3: US1 — Scoring | Phase 2 | — |
| Phase 4: US2 — Timer | Phase 2 | Phase 5 (results display needs timer) |
| Phase 5: US3 — Results | Phase 4 | — |
| Phase 6: US4 — Host Migration | Phase 2 | — |
| Phase 7: Polish | Phases 3-6 | — |

### User Story Dependencies

- **US1 (Scoring)**: Can start after Phase 2 — fully independent
- **US2 (Timer)**: Can start after Phase 2 — fully independent
- **US3 (Results)**: Depends on US2 (needs timer expiry / all-correct transitions)
- **US4 (Host Migration)**: Can start after Phase 2 — fully independent

### Within Each User Story

- Tests are written first (and should fail before implementation)
- Implementation follows tests
- Story complete before moving to next

### Parallel Opportunities

- **Phase 2**: T001, T002, T003, T005 can run in parallel (different files)
- **US1 Tests**: T008-T014 can all run in parallel
- **US1 vs US2 vs US4**: Can run in parallel after Phase 2
- **US3**: Blocks on US2 completion

---

## Parallel Execution Examples

```bash
# Phase 2 — Foundational (parallel):
Task: "T001 Add startedAt to Round in backend/src/models/game.ts"
Task: "T002 Add lastPollAt to Participant in backend/src/models/game.ts"
Task: "T003 Add remainingTime to frontend types in frontend/src/services/api.ts"
Task: "T005 Update toRoomSnapshot in backend/src/services/roomStore.ts"

# US1 Tests (all parallel):
Task: "T008 Full-time guess awards 150 points"
Task: "T009 Half-time guess awards 125 points"
Task: "T012 Drawer gets 50 per correct guesser"

# US2 + US4 (parallel after Phase 2):
Task: "T024 Add timer-expiry check in roomStore.ts"
Task: "T049 Update getRoom for lastPollAt in roomStore.ts"
```

---

## Implementation Strategy

### MVP First (US1 + US2)

1. Complete Phase 2: Foundational (model changes)
2. Complete Phase 3: US1 → Dynamic scoring works independently
3. Complete Phase 4: US2 → Timer works independently
4. **MVP VALIDATE**: Game with scoring and timer. Stop and test.
5. Add Phase 5: US3 → Enhanced results screen
6. Add Phase 6: US4 → Host migration
7. Phase 7: Polish everything

### Incremental Delivery

- **Iteration 1**: Foundational models + US1 (scoring) → deploy/demo
- **Iteration 2**: US2 (timer) → deploy/demo
- **Iteration 3**: US3 (enhanced results) → deploy/demo
- **Iteration 4**: US4 (host migration) → deploy/demo

---

## Notes

- [P] tasks = different files, no dependencies
- [US1-4] label maps task to specific user story
- Tests should fail before implementation (TDD approach for scoring/migration logic)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- 60 tasks total
