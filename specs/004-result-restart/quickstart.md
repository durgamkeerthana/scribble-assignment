# Quickstart: Result Display & Restart

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

## Test

Type checking:
```bash
cd backend && npx tsc --noEmit
cd frontend && npx tsc --noEmit
```

## Manual Test

1. Open two browser windows to `http://localhost:5173`
2. Create a room in window 1 → note the room code
3. Join the room in window 2
4. Click "Start Game" as the host (window 1)
5. Window 1 is drawer, window 2 is guesser
6. Draw on canvas in window 1
7. Submit a correct guess in window 2
8. Verify: Both windows transition to result view showing:
   - The correct secret word (revealed to all)
   - Final scores (0 for drawer, 100 for guesser)
   - Full guess history
9. Click "Restart Game" (host only, in window 1)
10. Verify: Both windows return to lobby with same players
11. Verify: Scores are reset to 0
12. Click "Start Game" to begin a new round

## Feature Verification Checklist

- [ ] Correct guess triggers round conclusion → result state shown
- [ ] Secret word visible to all players in result state
- [ ] Final scores visible and consistent across all players
- [ ] Guess history visible in result state
- [ ] Host can restart from result state
- [ ] Non-host cannot restart (no button)
- [ ] Restart returns all players to lobby
- [ ] Participant list preserved after restart
- [ ] All scores reset to 0 after restart
- [ ] New game can be started from post-restart lobby
