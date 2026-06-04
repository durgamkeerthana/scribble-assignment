# Feature Specification: Results & Restart (Preserved Scope)

**Feature Branch**: `005-scoring-hosting`

**Status**: Implemented

## Scope

This feature extends the result and restart flow from Feature 4 with flat 100-point scoring for correct guesses and ensures the room transitions to "result" status when all non-drawing guessers have correctly guessed the word.

The following items are explicitly out of scope per the assignment README and were NOT implemented in this feature:
- Timers, countdowns
- Speed bonuses, time-bonus scoring
- Drawer bonuses
- Host migration

## User Scenarios

### User Story — Scoring & Round End (In-Scope Only)

A guesser who submits the correct word receives 100 points. A duplicate correct guess from the same participant does not award additional points. When all non-drawing guessers have correctly guessed the word, the round ends and the room transitions to "result" status.

**Acceptance Scenarios**:

1. **Given** a round in progress, **When** a guesser submits the correct word, **Then** they receive 100 points.
2. **Given** a guesser has already submitted the correct word, **When** they submit the same correct word again, **Then** they do not receive additional points.
3. **Given** all non-drawing players have correctly guessed the word, **When** the final correct guess is submitted, **Then** the round status transitions to "complete" and the room transitions to "result".

### User Story — Results & Restart (unchanged from Feature 4)

After a round ends (all-correct), all players see the results screen showing the secret word, final scores, and full guess history. The host sees a "Restart Game" button. On restart, everyone returns to the lobby with participants preserved and all round state cleared.

**Acceptance Scenarios**:

1. **Given** a round has completed, **When** any player views the results screen, **Then** they see: the secret word, final scores for all participants, and the guess history.
2. **Given** the results screen is shown, **When** the viewer is the room host, **Then** a "Restart Game" button is visible.
3. **Given** the host clicks "Restart Game", **When** the restart completes, **Then** all players return to the lobby with participants preserved and scores/rounds cleared.

## Edge Cases

- What if a guesser submits the correct word more than once? (The first correct submission awards 100 points; subsequent correct submissions from the same participant do not re-award points.)
- What if all non-drawing participants disconnect mid-round? (The round continues; no additional guesses can be processed.)

## Requirements

### Functional Requirements

- **FR-001**: A correct guess MUST award 100 points to the guesser.
- **FR-002**: A duplicate correct guess from the same participant MUST NOT award additional points.
- **FR-003**: The room MUST transition to "result" status when all non-drawing participants have submitted a correct guess.
- **FR-004**: The host MUST be able to restart the game from the results screen, resetting the round state while preserving all participants.
