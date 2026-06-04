# Feature Specification: Game Start and Drawer Flow

**Feature Branch**: `002-game-start-flow`

**Created**: 2026-06-04

**Status**: Draft

**Input**: User description: "Game Start & Drawer Flow - Given a game is starting and player names are trimmed (empty/whitespace-only rejected with a message), When the first round begins, Then the host (or first player) becomes the clearly-identified drawer, and the secret word (deterministically selected from the starter list) is visible only to the drawer."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Starting a Game and Assigning the Drawer (Priority: P1)

As a host, when I start the game, I want the game to validate all participant names and designate the first drawer so that the first round can begin fairly and with clean data.

**Why this priority**: Without drawer assignment, no rounds can proceed. This is the foundational mechanic for game play.

**Independent Test**: The host clicks "Start Game" with 2+ players. The lobby transitions to a game view, all player names are trimmed, and the first drawer is clearly identified. If a player somehow has an empty name, the game does not start and an error is shown.

**Acceptance Scenarios**:

1. **Given** the host is in the lobby with at least 2 players, **When** they click "Start Game", **Then** the game transitions to active status and the host (first player) is designated as the drawer.
2. **Given** the game has started, **When** any player views the game screen, **Then** the current drawer is clearly indicated with a visible label or badge.
3. **Given** the game is starting, **When** any participant's name is empty or whitespace-only, **Then** the game does not start and an error message is displayed indicating the invalid name.

---

### User Story 2 - Secret Word Selection and Visibility (Priority: P1)

As a drawer, when the first round begins, I want a secret word to be selected from the available word list and shown only to me so that I can draw it while the other players guess.

**Why this priority**: The secret word is the core mechanic of each round. Without it, no drawing or guessing can happen.

**Independent Test**: When the game starts, the drawer sees a word displayed on their screen. Other players see a message that the drawer has received their word but cannot see the word itself.

**Acceptance Scenarios**:

1. **Given** the first round has started, **When** the drawer views the game screen, **Then** they see a secret word displayed.
2. **Given** the first round has started, **When** a non-drawer (guesser) views the game screen, **Then** they do not see the secret word; instead they see a message indicating the drawer is drawing.
3. **Given** the first round has started, **When** the drawer views the secret word, **Then** the word is selected deterministically from the available word list.

---

### Edge Cases

- **Empty or whitespace-only player name at game start**: If a participant somehow has an empty or whitespace-only name (e.g., due to bypassing client-side validation), the game start is blocked with a clear error.
- **Single-player room attempting to start**: This should be prevented by existing lobby validation, but the game start flow should gracefully handle the case if reached.
- **Drawer leaves mid-round**: Not in scope for this feature; round cancellation or re-assignment on disconnect is a future concern.
- **Word list exhaustion after multiple rounds**: Not in scope; word list recycling and round advancement beyond the first round is a future concern.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST validate all participant names when the game starts — trimming whitespace and rejecting empty or whitespace-only names.
- **FR-002**: When the game starts, the first player in the participant list (the host) MUST be designated as the drawer for the first round.
- **FR-003**: The system MUST expose the current drawer's identity in the game state so the client can display who is drawing.
- **FR-004**: The drawer MUST be clearly identifiable to all players on the game screen.
- **FR-005**: When the first round begins, a secret word MUST be selected deterministically from the available word list.
- **FR-006**: The secret word MUST be visible only to the drawer.
- **FR-007**: Non-drawer participants MUST see a placeholder message instead of the secret word (e.g., "The drawer is drawing").
- **FR-008**: The game MUST NOT start if any participant has an empty or whitespace-only name.

### Key Entities

- **Round**: Represents a single drawing-guessing round within a game. Key attributes: round number, current drawer, secret word, status (in-progress, complete).
- **Drawer**: The participant assigned to draw during a given round. There is exactly one drawer per round.
- **Secret Word**: The word assigned to the drawer for the current round, drawn deterministically from the available word list. Visible only to the drawer.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: When the host starts a game with 2+ valid participants, the game transitions to active and the drawer is identified within 1 second.
- **SC-002**: The drawer can see the secret word on their screen within 1 second of the round starting.
- **SC-003**: Non-drawer players cannot see the secret word under any circumstances during the round.
- **SC-004**: All participant names are trimmed and validated; any empty or whitespace-only name blocks game start with a clear error message.
- **SC-005**: The same initial conditions (same player list, same word list) always produce the same secret word selection.

## Assumptions

- A participant list of at least 2 is already enforced by the lobby "Start Game" validation (handled by a separate feature).
- The available word list contains at least one word when the game starts.
- Drawer assignment for the first round is deterministic: the host (first participant in the list) becomes the drawer.
- Deterministic word selection means the word is chosen based on the round number or a similar stable index (e.g., word list index = round number modulo word list length).
- The "starter data" word list used during lobby/room creation is available at game start time.
- Round advancement beyond the first round is not in scope for this feature.
