# Data Model: Scoring & Results

## Entity Changes

No new fields were added to any entity for this feature. The following describes the existing state model relevant to scoring and round-end behavior.

### Round

```typescript
interface Round {
  roundNumber: number;
  drawerId: string;
  secretWord: string;
  status: RoundStatus;  // "drawing" | "complete"
  strokes: Stroke[];
  guesses: Guess[];
}
```

Round status transitions from "drawing" to "complete" when all non-drawing participants have submitted a correct guess.

### Guess

```typescript
interface Guess {
  participantId: string;
  participantName: string;
  text: string;
  isCorrect: boolean;
  timestamp: string;
}
```

### RoomSnapshot

```typescript
interface RoundSnapshot {
  roundNumber: number;
  drawerId: string;
  secretWord: string | null;
  status: RoundStatus;
  strokes: Stroke[];
  guesses: Guess[];
}
```

## Scoring

### Guesser Score (on correct guess)

```
score = 100
```

- A correct guess awards exactly 100 points.
- Incorrect guesses do not affect scoring.
- Duplicate correct guesses from the same participant do not award additional points.
- When all non-drawing participants have correctly guessed, the round ends immediately.

## Round End

The round ends (transitions to "result") when all non-drawing participants have submitted a correct guess. This is checked in the `submitGuess` handler on each correct guess submission.
