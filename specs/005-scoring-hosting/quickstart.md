# Quickstart: Scoring, Timers, and Host Migration

## Prerequisites

- Node.js >= 20
- npm

## Install

```bash
cd backend && npm install
cd ../frontend && npm install
```

## Run

Start backend (terminal 1):
```bash
cd backend && npm run dev
```

Start frontend (terminal 2):
```bash
cd frontend && npm run dev
```

## Type Checking

```bash
cd backend && npx tsc --noEmit
cd frontend && npx tsc --noEmit
```

## Tests

```bash
cd backend && npx vitest run
cd frontend && npx vitest run
```

## Manual Test: Dynamic Scoring

1. Open two browser windows to `http://localhost:5173`
2. Create a room in window 1 → note room code
3. Join in window 2
4. Start game as host (window 1 — drawer)
5. Wait ~20 seconds after round starts, then submit the correct word as guesser (window 2)
6. Verify: score shows 100 base + ~33 time bonus = ~133 points
7. The drawer's score should be visible on the results screen (50 points)

## Manual Test: Timer

1. Start a game round (2+ players)
2. Verify: both players see a countdown timer starting at 60
3. Wait for timer to reach 0 without guessing
4. Verify: room transitions to results automatically
5. Verify: players who did not guess are marked as "Did not guess"
6. Verify: no points are awarded to anyone

## Manual Test: Host Migration

1. Create room with 2+ players
2. Start the game
3. Close the host's browser window
4. Wait ~7 seconds
5. Poll the room from the remaining player's browser (refresh or let polling catch up)
6. Verify: the remaining player is now the host
7. After the round ends, the new host can restart the game

## Feature Verification Checklist

- [ ] Fast guessers receive more points than slow guessers
- [ ] Drawer receives 50 points per correct guesser
- [ ] Round timer countdown is visible to all players
- [ ] Timer expiry triggers result transition
- [ ] All-correct triggers immediate result transition
- [ ] Time bonus formula applied correctly on results screen
- [ ] Host migration triggers after 6s of host inactivity
- [ ] New host is the longest-joined active participant
- [ ] Old host can rejoin as regular participant
- [ ] Migration does not interrupt active rounds
- [ ] Results screen shows leaderboard with ranks
- [ ] Tie scores share the same rank position
