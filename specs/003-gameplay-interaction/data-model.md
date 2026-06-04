# Data Model: Gameplay Interaction

## Entities

### Stroke

A single continuous line drawn on the canvas. Stored as part of the Round.

```typescript
interface Point {
  x: number;
  y: number;
}

interface Stroke {
  points: Point[];
}

interface Round {
  // ...existing fields...
  strokes: Stroke[];
}
```

**Validation**:
- `points` array MUST contain at least 2 points
- Each point MUST have finite numeric `x` and `y` values
- `color` is omitted (black only per scope)

**State transitions**: Strokes are append-only during a round. Clearing replaces the array with `[]`.

---

### Guess

A single guess submission during a round.

```typescript
interface Guess {
  participantId: string;
  participantName: string;
  text: string;
  isCorrect: boolean;
  timestamp: string; // ISO 8601
}

interface Round {
  // ...existing fields, strokes...
  guesses: Guess[];
}
```

**Validation rules** (from FR-004, FR-005, FR-006):
- Text MUST be trimmed of leading/trailing whitespace
- Trimmed text MUST NOT be empty (reject with "Guess cannot be empty")
- Correctness determined by case-insensitive comparison to `secretWord`: `text.trim().toLowerCase() === secretWord.toLowerCase()`
- A guesser who already submitted a correct guess: subsequent guesses still recorded, `isCorrect` returns `true`, but score not incremented

---

### Score

Per-participant score tracked on the Room.

```typescript
interface Room {
  // ...existing fields...
  scores: Record<string, number>; // participantId → score
}
```

**Rules** (from FR-009, FR-010, FR-011, FR-014):
- All participants start at score 0 when game starts (`startRoom`)
- Correct guess adds 100 points
- Incorrect guess adds 0 points
- Guesser who already guessed correctly: score does not increase on subsequent correct guesses
- Scores are visible to all players (FR-013)

---

## State Transitions

```
Round Status: "drawing"
  ├── Drawer draws stroke → strokes array grows (append)
  ├── Drawer clears canvas → strokes = []
  ├── Guesser submits guess → guesses array grows
  │   └── Correct → update Room.scores[guesserId] += 100 (if not already correct)
  └── (Round continues)

Round Status: "complete"
  └── All mutations locked (out of scope for this feature)
```

---

## Relationships

```
Room (1) ──has many──→ Participant (0..*)
  └── scores: Record<participantId, number>

Room (1) ──has many──→ Round (0..*)
  └── Round.current (active round)
       ├── strokes: Stroke[]
       └── guesses: Guess[]
            ├── participantId → Participant.id
            └── isCorrect → secretWord comparison
```
