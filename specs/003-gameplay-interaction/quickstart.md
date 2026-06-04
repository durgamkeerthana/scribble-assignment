# Quickstart: Gameplay Interaction

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

Backend runs on `http://localhost:3001`.
Frontend runs on `http://localhost:5173`.

## Test

Backend unit tests:
```bash
cd backend && npx vitest run
```

Frontend unit tests:
```bash
cd frontend && npx vitest run
```

Type checking:
```bash
cd backend && npx tsc --noEmit
cd frontend && npx tsc --noEmit
```

## Manual Test

1. Open two browser windows to `http://localhost:5173`
2. Create a room in window 1 → note the room code
3. Join the room in window 2 using the code
4. Click "Start Game" as the host
5. Verify: Window 1 shows "You are the Drawer!" with secret word
6. Draw on the canvas in window 1
7. Verify: Window 2 (guesser) sees the same drawing within 2 seconds
8. Type a guess in window 2 and submit
9. Verify: Correct guesses show "Correct!" and +100 score; incorrect guesses show "Incorrect"
10. Verify: Both windows show the same guess history and scores

## Feature Verification Checklist

- [ ] Drawer can draw freeform lines on canvas (click and drag)
- [ ] Drawer can clear canvas with single action
- [ ] Guessers see drawing within 2s polling interval
- [ ] Empty/whitespace guesses rejected with "Guess cannot be empty"
- [ ] Case-insensitive guess matching works
- [ ] Correct guess → "Correct!" notification + 100 points
- [ ] Incorrect guess → "Incorrect" notification + 0 points
- [ ] Guess history visible to all players
- [ ] Scores consistent across all players
- [ ] Already-correct guesser can continue guessing but score unchanged
