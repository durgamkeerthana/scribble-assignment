# Feature Specification: Gameplay Interaction

**Feature Branch**: `003-gameplay-interaction`

**Created**: 2026-06-04

**Status**: Draft

**Input**: User description: "Gameplay Interaction - Given a round is active with a drawer and guessers (all scores start at 0), When the drawer draws/clears the canvas and guessers submit their guesses, Then the drawing is visible on the drawer's screen; guesses are trimmed, case-insensitively compared, and empty ones rejected; the guess history is synced to all players via polling; correct guesses score 100 (incorrect add 0)."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Interactive Drawing Canvas (Priority: P1)

As the drawer, I want to draw freely on a canvas and clear it when needed so that I can visually represent the secret word for the guessers.

**Why this priority**: Without a functional drawing canvas, no visual communication can happen during the round.

**Independent Test**: In a game as the drawer, click and drag on the canvas to draw. The drawing appears immediately on the drawer's screen. Clear the canvas — the drawing is removed. A guesser in another window sees the same drawing within the polling interval.

**Acceptance Scenarios**:

1. **Given** the drawer is in an active round, **When** they draw on the canvas (click and drag), **Then** lines appear on the canvas in real-time.
2. **Given** the drawer has drawn on the canvas, **When** they click "Clear Canvas", **Then** all drawings are removed from the canvas.
3. **Given** the drawer has drawn on the canvas, **When** a guesser views the game screen, **Then** they see the same drawing (synced within the polling interval).
4. **Given** the drawer clears the canvas, **When** guessers view the game screen, **Then** the cleared canvas is visible to all.

---

### User Story 2 - Guess Submission and Validation (Priority: P1)

As a guesser, I want to submit my guess and receive clear feedback — correct or incorrect — so that I can participate in the round.

**Why this priority**: Guessing is the core mechanic for non-drawer players. Without it, there is no game for guessers.

**Independent Test**: A guesser types a guess and submits it. If the guess matches the secret word (case-insensitive, trimmed whitespace), they are notified they guessed correctly. If it does not match, they are told the guess is incorrect. Empty or whitespace-only guesses are rejected with an error message before submission.

**Acceptance Scenarios**:

1. **Given** the guesser types a guess that matches the secret word exactly (case-insensitive, trimmed), **When** they submit, **Then** they see a "Correct!" notification.
2. **Given** the guesser types a guess that does not match the secret word, **When** they submit, **Then** they see an "Incorrect" notification with no score change.
3. **Given** the guesser submits an empty or whitespace-only guess, **When** they attempt to submit, **Then** the submission is rejected and they see a "Guess cannot be empty" error message.

---

### User Story 3 - Guess History and Scoring (Priority: P2)

As a player, I want to see the history of all guesses submitted during the round and the current scores so that I can track progress.

**Why this priority**: Score tracking and guess history provide essential game feedback and competitive motivation.

**Independent Test**: Multiple guessers submit guesses during a round. The guess history updates to show all guesses (with the guesser's name) within the polling interval. When a guesser gets the word right, their score increases by 100. All players see the same scores and history.

**Acceptance Scenarios**:

1. **Given** a guesser submits a guess, **When** all players view the game screen, **Then** the guess appears in the guess history (with the guesser's name) within the polling interval.
2. **Given** a guesser submits a correct guess, **When** scores are displayed, **Then** that guesser's score increases by 100 points.
3. **Given** a guesser submits an incorrect guess, **When** scores are displayed, **Then** that guesser's score remains unchanged.
4. **Given** all players view the game screen, **When** scores are displayed, **Then** all players see the same scores for all participants.

---

### Edge Cases

- **Rapid consecutive guesses**: If a guesser submits multiple guesses quickly, each guess is processed independently and the history updates accordingly.
- **Guesser who already guessed correctly**: The system allows the guesser to continue seeing the round but their additional guesses are noted as already correct (no score change).
- **Canvas state on clear**: Clearing the canvas resets it to a blank state; all previous strokes are removed.
- **Whitespace-only canvas**: Not applicable (canvas is visual, not text-based).
- **Multiple guessers submitting simultaneously**: Each guess is validated independently; scoring is per-guesser.
- **Guess submitted during polling sync**: The guess is captured when the request is received; polling for history picks up the latest state.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The drawer MUST be able to draw freeform lines on a canvas by clicking and dragging.
- **FR-002**: The drawer MUST be able to clear the canvas with a single action, removing all drawings.
- **FR-003**: The current state of the canvas MUST be synced to all players so that guessers see the same drawing as the drawer.
- **FR-004**: Guesses MUST be trimmed of leading and trailing whitespace before validation.
- **FR-005**: Guesses MUST be compared to the secret word case-insensitively.
- **FR-006**: Empty or whitespace-only guesses MUST be rejected with a clear error message ("Guess cannot be empty").
- **FR-007**: A correct guess MUST result in a "Correct!" notification to the guesser.
- **FR-008**: An incorrect guess MUST result in an "Incorrect" notification to the guesser.
- **FR-009**: A correct guess MUST award the guesser exactly 100 points.
- **FR-010**: An incorrect guess MUST result in 0 points added.
- **FR-011**: All scores MUST start at 0 at the beginning of the game.
- **FR-012**: The guess history (all guesses with guesser names) MUST be visible to all players and update within the polling interval.
- **FR-013**: All players MUST see the same scores for all participants.
- **FR-014**: All players start with a score of 0.

### Key Entities

- **Canvas State**: Represents the current visual state of the drawing canvas. Updated by the drawer and synced to all players via polling.
- **Guess**: A text submission made by a guesser during a round. Contains the guesser's ID, the text (trimmed), and whether it was correct.
- **Guess History**: An ordered list of all guesses submitted during the current round, each with the guesser's name and the guessed text.
- **Score**: A numeric value associated with each participant, tracking correct guesses. Starts at 0; increased by 100 for each correct guess.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The drawer can draw and clear the canvas with no noticeable lag (canvas updates appear instantly on the drawer's screen).
- **SC-002**: Guessers see the drawer's canvas updates within 2 seconds of the drawing being made.
- **SC-003**: Guess submission (including validation and feedback) completes within 1 second.
- **SC-004**: A guess matching the secret word (ignoring case and whitespace) is always accepted as correct.
- **SC-005**: Guess history updates on all players' screens within 2 seconds of a new guess being submitted.
- **SC-006**: Scores are consistent across all players' screens at any point during the round.
- **SC-007**: Empty or whitespace-only guesses are always rejected before reaching the server.

## Assumptions

- The game has already started and a round is active with a designated drawer and secret word (handled by a separate feature).
- The drawing canvas uses a simple freeform line drawing interface (no shapes, text, or advanced tools in scope).
- Canvas data is synced via HTTP polling (sending canvas state snapshots) since WebSockets are not permitted.
- Only one round is active at a time; round advancement is out of scope.
- A guesser who has already guessed correctly can continue submitting guesses but without additional score impact.
- The drawing canvas only needs basic black line drawing — color selection and brush width are out of scope.
