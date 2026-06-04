# Implementation Plan: Results & Restart (Preserved Scope)

**Branch**: `005-scoring-hosting`

## Summary

This feature extends the result and restart flow with flat 100-point scoring for correct guesses and all-correct round-end detection. No timers, time bonuses, drawer bonuses, or host migration were implemented (these are out of scope per the assignment README).

## Project Structure

### Source Code

```
backend/
├── src/
│   ├── models/
│   │   └── game.ts              # No model changes needed
│   └── services/
│       └── roomStore.ts         # submitGuess: flat 100 scoring, all-correct detection
```

## Testing Strategy

### Backend Unit Tests

| # | Test | Expected |
|---|------|----------|
| 1 | Correct guess awards 100 points | score = 100 |
| 2 | Incorrect guess awards 0 points | score unchanged |
| 3 | Duplicate correct guess from same player does not award points again | score stays 100 |
| 4 | All-correct transitions room to result | status = "result" |

### Frontend Component Tests

| # | Test | Expected |
|---|------|----------|
| 5 | Scoreboard shows participants sorted by score descending | correct order |
| 6 | ResultPanel shows correct guesses | checkmarks on correct |
| 7 | GuessHistory shows guesses with correct/incorrect badges | ✓ / ✗ |
