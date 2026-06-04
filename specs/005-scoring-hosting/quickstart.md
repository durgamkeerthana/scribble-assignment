# Quickstart: Scoring & Results

## Run

```bash
cd backend && npm run dev
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

## Manual Test: Scoring & Round End

1. Open two browser windows to `http://localhost:5173`
2. Create a room in window 1 → note room code
3. Join in window 2
4. Start game as host (window 1 — drawer)
5. Submit the correct word as guesser (window 2)
6. Verify: score shows 100 points
7. Verify: round transitions to result
8. Verify: results screen shows the secret word, final scores, and guess history
9. Verify: host can click "Restart Game" to return to lobby

## Feature Verification Checklist

- [ ] Correct guess awards exactly 100 points
- [ ] Duplicate correct guess does not award additional points
- [ ] All-correct → immediate result transition
- [ ] Results screen shows the secret word and final scores
- [ ] Host can restart the game from the results screen
