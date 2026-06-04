# Feature Specification: Result Display & Restart

**Feature Branch**: `004-result-restart`

**Created**: 2026-06-04

**Status**: Draft

**Input**: User description: "Result, Restart & Final Validation - Given a round has ended, When the result state is displayed and the host restarts, Then all players see the correct word, final scores, and full guess history; on restart, everyone returns to the lobby with players preserved and all round state cleared. Shared result state visible to all players, clean restart to lobby with players preserved and round state cleared."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Round Result Display (Priority: P1)

As a player, when the current round concludes (someone correctly guesses the secret word), I want to see the correct word, the final scores for all participants, and the full guess history of the round so that I can understand the outcome.

**Why this priority**: Without a result state, players cannot see the answer or the final standings, leaving the round incomplete.

**Independent Test**: Start a game, have a guesser submit a correct guess. All players' screens automatically transition to a result view showing: the secret word (now visible to everyone), the final scores for all participants, and the complete list of guesses made during the round. The result view is the same for all players.

**Acceptance Scenarios**:

1. **Given** a round is active and a guesser submits a correct guess, **When** the round concludes, **Then** all players' screens show the result state.
2. **Given** the result state is displayed, **When** any player views the screen, **Then** they see the correct secret word (previously hidden from guessers is now revealed to all).
3. **Given** the result state is displayed, **When** any player views the screen, **Then** they see the final scores for all participants (consistent across all screens).
4. **Given** the result state is displayed, **When** any player views the screen, **Then** they see the complete guess history from the concluded round (with guesser names, guessed text, and whether each guess was correct or incorrect).
5. **Given** a round concludes without the game being restarted, **When** players view the screen, **Then** the result state persists until the host restarts and all players see the same information.

---

### User Story 2 - Host Restart (Priority: P1)

As the host, from the result screen, I want to restart the game so that all players return to the lobby and we can start a new round without having to create a new room.

**Why this priority**: A clean restart is essential to keep the game session going without forcing all players to disconnect and rejoin.

**Independent Test**: From the result screen, the host clicks "Restart Game". All players' screens automatically transition to the lobby view. The same participant list appears in the lobby (no one was removed). The round-specific data (scores, guesses, strokes) is reset. The host can then click "Start Game" to begin a new round.

**Acceptance Scenarios**:

1. **Given** the result state is displayed, **When** the host clicks "Restart Game", **Then** all players' screens transition to the lobby view.
2. **Given** the host restarts the game, **When** players view the lobby, **Then** the participant list contains all the same players (no one was removed or had to rejoin).
3. **Given** the host restarts the game, **When** the lobby is shown, **Then** all round-specific data is cleared (no current round, no strokes, no guesses, all scores reset to 0).
4. **Given** the lobby is shown after restart, **When** the host clicks "Start Game", **Then** a new round begins normally.
5. **Given** a non-host player views the result screen, **When** they attempt to restart, **Then** the restart action is rejected and only the host can restart.

---

### Edge Cases

- **Last-minute guesses**: If a guesser submits a correct guess at the same time as the round is being marked complete, the guess is still captured and included in the result history.
- **Round ends with unguessed word**: The secret word is revealed to all players regardless of whether the correct guess came from one player or the round ended by other means.
- **Host disconnects during result**: If the host leaves before restarting, the remaining players see the result state but cannot restart (host-only action). The players can still exit the game manually.
- **Rapid restart**: If the host restarts and immediately clicks "Start Game", the new lobby should behave as expected — scores are 0, no round state persists, and a fresh round begins.
- **Multiple restarts**: The game can be restarted any number of times. Each restart fully resets game state while keeping the participant list intact.
- **Restart visibility**: When the host restarts, the lobby transition happens for all players within the polling interval — no player remains on the result screen.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The round MUST automatically conclude when any guesser submits a correct guess.
- **FR-002**: On round conclusion, the system MUST transition the game to a "result" state visible to all players.
- **FR-003**: In the result state, the correct secret word MUST be displayed to all players (it was previously hidden from guessers).
- **FR-004**: In the result state, the final scores for all participants MUST be visible and consistent across all players.
- **FR-005**: In the result state, the complete guess history from the concluded round MUST be displayed (guesser name, guessed text, correct/incorrect indicator).
- **FR-006**: The result state MUST persist until the host triggers a restart.
- **FR-007**: Only the host MAY trigger a restart from the result state. Non-host players MUST NOT be able to restart.
- **FR-008**: On restart, all players MUST be returned to the lobby view.
- **FR-009**: On restart, all round-specific data MUST be cleared (rounds array, strokes, guesses, scores reset to 0).
- **FR-010**: On restart, the participant list MUST remain intact — no players are removed or need to rejoin.
- **FR-011**: After restart, the lobby MUST behave identically to a fresh lobby, allowing the host to start a new game.
- **FR-012**: The result state and the restart transition MUST be synced to all players via polling within the standard polling interval.

### Key Entities

- **Room Status**: Adds a new status `"result"` to represent the round-end state (in addition to existing `"lobby"` and `"active"`).
- **Round Status**: The current round transitions from `"drawing"` to `"complete"` when the round concludes.
- **Round Result Data**: The set of information displayed in the result state: the secret word (revealed), final scores for all participants, and the complete guess history.
- **Restart Action**: A host-only action that clears round state (rounds, scores, strokes, guesses) and sets room status back to `"lobby"` while preserving the participants list.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: When a correct guess is submitted, all players see the result state within the polling interval (2 seconds).
- **SC-002**: The result state shows the correct secret word, final scores, and guess history consistently across all player screens at any point.
- **SC-003**: When the host clicks restart, all players see the lobby view within the polling interval.
- **SC-004**: After restart, the lobby contains the same participant list as before, with scores reset to 0.
- **SC-005**: The host can successfully start a new game from the post-restart lobby with no errors or stale state.
- **SC-006**: Non-host players cannot trigger a restart (the restart button/action is disabled or hidden for them).

## Assumptions

- The game has already started with a round in progress (handled by an existing feature — gameplay interaction).
- Scores, guess history, and stroke data are already tracked by existing gameplay features.
- The standard polling interval (2 seconds) is the mechanism for syncing the result state and restart transition.
- Multiple rounds within a single game session are out of scope — each restart creates a clean slate from the lobby.
- The restart does not change the room code — players stay in the same room identifier throughout.
- The host is identified the same way as in the room setup feature (the participant who created the room).
