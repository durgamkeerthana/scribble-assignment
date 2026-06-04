# Research: Scoring & Results

## Design Decisions

### 1. Scoring

- **Decision**: Flat 100 points per correct guess; duplicate correct guesses do not re-award points.
- **Rationale**: Matches the assignment spec (Scenario 3: "correct guesses score 100"). Simple, deterministic, and predictable.

### 2. Round End Detection

- **Decision**: The room transitions to "result" when all non-drawing participants have submitted a correct guess. This is checked in `submitGuess` on each guess submission.
- **Rationale**: The only supported round-end trigger (timers are out of scope). All-correct detection provides a natural conclusion point.

## Out-of-Scope Items (per assignment README)

The following were intentionally excluded:
- Timers / countdowns
- Speed bonuses / time-bonus scoring
- Drawer bonuses (drawer scoring per correct guesser)
- Host migration
- Multi-round / drawer rotation
