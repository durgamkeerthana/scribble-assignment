# Implementation Plan: Scoring, Timers, and Host Migration

**Branch**: `005-scoring-hosting` | **Date**: 2026-06-04 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/005-scoring-hosting/spec.md`

## Summary

Enhance the multiplayer drawing game with three major systems: (1) dynamic scoring that rewards fast guessers with time bonuses and gives the drawer points per correct guesser, (2) a 60-second round timer with countdown display and auto-transition to results on expiry or all-correct, and (3) host migration that reassigns host privileges after 6 seconds of polling inactivity. All systems build on existing HTTP-polling infrastructure without adding new dependencies.

## Technical Context

**Language/Version**: TypeScript 5.6 (backend + frontend)

**Primary Dependencies**: Node.js/Express (backend), React 18 + Vite (frontend), Zod (validation), Vitest (testing)

**Storage**: In-memory (JavaScript `Map` in `backend/src/services/roomStore.ts`)

**Testing**: Vitest (both backend and frontend)

**Target Platform**: Node.js server (backend), modern browsers (frontend)

**Project Type**: Web application (monorepo: `backend/` + `frontend/`)

**Performance Goals**: Round timer accurate within 1 second across all clients via polling; host migration detectable within 6 seconds.

**Constraints**: HTTP polling only (2s interval); no databases; no authentication; no new npm packages; in-memory state only.

**Scale/Scope**: Single-server, single-round concurrent games (typical party game usage: 2-8 players per room).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Gates

| # | Principle | Assessment | Violation? |
|---|-----------|------------|------------|
| I | TypeScript First & Strict Typing | All new fields and functions will be fully typed with interfaces | No |
| II | HTTP Polling Only | Timer values served via HTTP polling response; no push protocol | No |
| III | In-Memory State Only | Timer state stored on Room/Round in-memory objects; uses `Date.now()` for elapsed time | No |
| IV | No Authentication | Host identity tracked by participantId; no sessions or auth | No |
| V | Fail Fast | Error handling via existing `HttpError` + Express error middleware | No |
| VI | Component Cleanliness | New frontend components follow functional hooks pattern; CSS in `app.css` | No |
| VII | No Unjustified Dependencies | No new npm packages required | No |
| VIII | Granular Git Commits | Commits will be incremental per component | No |

**Result**: ALL GATES PASS. No complexity tracking needed.

## Project Structure

### Documentation (this feature)

```text
specs/005-scoring-hosting/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── api.md
└── tasks.md             # Phase 2 output (speckit-tasks)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── models/
│   │   └── game.ts              # Add timer/host fields to Round/Room
│   ├── services/
│   │   └── roomStore.ts         # Scoring, timer, host migration logic
│   └── api/
│       └── rooms.ts             # Add timer to snapshot response
└── tests/                       # Tests in src/ (existing pattern)
    └── services/
        └── roomStore.test.ts    # New scoring/timer/migration tests

frontend/
├── src/
│   ├── components/
│   │   ├── Canvas.tsx           # Unchanged
│   │   ├── GameTimer.tsx        # NEW: countdown display
│   │   ├── Scoreboard.tsx       # Enhanced: show per-round scoring details
│   │   ├── GuessHistory.tsx     # Enhanced: show time-to-guess
│   │   └── ResultPanel.tsx      # Enhanced: leaderboard with ranks
│   ├── pages/
│   │   └── GamePage.tsx         # Add timer display, enhanced results
│   ├── services/
│   │   └── api.ts               # Add timer field to RoundSnapshot interface
│   └── state/
│       └── roomStore.ts         # Add host-lastPoll tracking for migration
```

**Structure Decision**: Web application monorepo (backend/ + frontend/) — same as existing project structure.

## Complexity Tracking

*No constitution violations — Complexity Tracking is empty.*

## Testing Strategy

### Backend Unit Tests (`backend/src/services/roomStore.test.ts`)

**Scoring Algorithm (submitGuess)**

| # | Test | Expected |
|---|------|----------|
| 1 | Guesser with full time remaining gets 150 points | base 100 + max time bonus 50 = 150 |
| 2 | Guesser at 30s (half time) gets 125 points | base 100 + 50 × (30/60) = 125 |
| 3 | Guesser at 59s gets ~100 points | base 100 + 50 × (1/60) rounded = ~101 or 100 |
| 4 | Incorrect guess awards 0 points | score unchanged |
| 5 | Duplicate correct guess from same player does not award points again | score stays same, no additional points |
| 6 | Drawer receives 50 points per correct guesser at round end | drawer awarded 50 × N on round conclusion |
| 7 | Drawer receives 0 points if no one guesses correctly | verify 0 points on timer-expiry conclusion |
| 8 | Guesser who submitted incorrect before correct gets time bonus from correct timestamp only | time bonus uses correct guess time, not first attempt time |
| 9 | Scores for multiple guessers calculated independently | two guessers at different times get different scores |

**Timer Logic (submitGuess + getRoom)**

| # | Test | Expected |
|---|------|----------|
| 10 | Round transitions to "result" when timer would be ≤ 0 | lazy check on poll: `remainingTime ≤ 0` triggers end |
| 11 | Round transitions to "result" when all non-drawing guessers are correct | existing test updated with new scoring |
| 12 | `remainingTime` is positive during active round | computed from `Date.now() - round.startedAt` |
| 13 | `remainingTime` is 0 after round concludes | returned as 0 in snapshot |
| 14 | No guesses accepted after timer expiry | `getActiveRound` throws 400 when room is "result" |

**Host Migration (getRoom)**

| # | Test | Expected |
|---|------|----------|
| 15 | Host with recent poll (< 6s) retains host status | `hostId` unchanged |
| 16 | Host with stale poll (> 6s) triggers migration | `hostId` reassigned to longest-joined active participant |
| 17 | New host is the participant with earliest `joinedAt` | among active pollers, oldest wins |
| 18 | Migration preserves disconnected host in participant list | old host still in `.participants` |
| 19 | No migration when room has only one participant | `hostId` unchanged |
| 20 | Migration logs do not affect active round | round continues with same `status`, `strokes`, etc. |
| 21 | Poll updates `lastPollAt` on the requesting participant | on GET, participant's `lastPollAt` refreshed |

### Backend Schema Tests (`backend/src/api/schemas.test.ts`)

| # | Test | Expected |
|---|------|----------|
| 22 | Timer-related fields pass existing schema validation | existing schemas unchanged, no new schemas needed |

### Frontend Service Tests (`frontend/src/services/api.test.ts`)

| # | Test | Expected |
|---|------|----------|
| 23 | fetchRoom returns `remainingTime` field | mock response includes `remainingTime: 45` |
| 24 | submitGuess returns `timeBonus` and `timeToGuess` fields | mock response includes new scoring fields |
| 25 | submitGuess returns `drawerScore` when round completes | mock response includes `drawerScore: 100` |

### Frontend Store Tests (`frontend/src/state/roomStore.test.ts`)

| # | Test | Expected |
|---|------|----------|
| 26 | Room snapshot includes `remainingTime` on currentRound | store state reflects new field |
| 27 | Host migration notifies on poll (hostId change detected) | store detects `hostId` change via poll |

### Frontend Component Tests

**GameTimer (new component)**

| # | Test | Expected |
|---|------|----------|
| 28 | Renders remaining time as integer | `remainingTime=45.3` shows "45" |
| 29 | Shows "0" when remainingTime is 0 | displays "0" |
| 30 | Uses correct CSS class or layout | timer has distinct style in app.css |

**Scoreboard (enhanced)**

| # | Test | Expected |
|---|------|----------|
| 31 | Shows ranked positions (1st, 2nd, 3rd) | scores displayed with rank numbers |
| 32 | Tied scores share same rank | equal scores show same rank number |

**ResultPanel (enhanced)**

| # | Test | Expected |
|---|------|----------|
| 33 | Displays time-to-guess for each correct guesser | each correct guess shows "Guessed in Xs" |
| 34 | Shows "Did not guess" for non-guessers on timer expiry | label for players who did not guess |
| 35 | Shows host restart button only for host | conditional rendering test |

### Integration / E2E (manual via quickstart.md)

| # | Test | Reference |
|---|------|-----------|
| 36 | Dynamic scoring with browser test | `quickstart.md` manual test 1 |
| 37 | Timer expiry → result transition | `quickstart.md` manual test 2 |
| 38 | Host migration after browser close | `quickstart.md` manual test 3 |
