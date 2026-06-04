# Feature Specification: Scoring, Timers, and Host Migration

**Feature Branch**: `005-scoring-hosting`

**Created**: 2026-06-04

**Status**: Draft

**Input**: User description: "Dynamic Scoring: Implemented a comprehensive scoring algorithm. Guessers receive points based on how quickly they guess the word, while the drawer receives points proportional to the number of players who guessed correctly. Game End, Results & Restart: The game now automatically halts and transitions to a results screen either when the round timer expires or when all non-drawing players have correctly guessed the word. Leaderboard UI: Developed a ResultScreen component that displays the final word, highlights who successfully guessed it, and ranks players by their total accumulated score. Host Controls & Reset: The room host has the ability to trigger a game reset from the results screen. This instantly transitions the room and all currently connected players back to the lobby state, ready for another round under the same room code. Host Migration: Implemented fallback logic to automatically reassign the host privileges to another active player if the original host disconnects."

## User Scenarios & Testing

### User Story 1 — Dynamic Scoring (Priority: P1)

A guesser who correctly identifies the word early in the round receives more points than someone who guesses later. The drawer also earns points for each player who successfully guesses their drawing, rewarding drawings that are clear and effective.

**Why this priority**: Scoring is the core game loop incentive — without meaningful differential scoring, guesses feel flat and the drawer has no motivation to draw well.

**Independent Test**: Can be tested by having two guessers submit the correct word at different times and verifying the faster guesser receives more points. The drawer's score can be verified after each correct guess.

**Acceptance Scenarios**:

1. **Given** a round in progress, **When** a guesser submits the correct word within the first 50% of the round timer, **Then** they receive the base score (100 points) plus a time bonus (up to 50 additional points based on remaining time).
2. **Given** a round in progress, **When** a guesser submits the correct word in the last 10% of the round timer, **Then** they receive only the base score with minimal or no time bonus.
3. **Given** a guesser submits an incorrect guess, **When** they later submit the correct word, **Then** their time bonus is calculated from the correct submission time, not the first incorrect attempt.
4. **Given** a round ends with correct guesses, **When** scoring is calculated, **Then** the drawer receives 50 points for each non-drawing player who correctly guessed the word (excluding themselves).
5. **Given** no players correctly guess the word, **When** the round ends, **Then** the drawer receives 0 points for that round.

---

### User Story 2 — Timer-Based Round End (Priority: P1)

Each round has a visible countdown timer. When the timer expires, the round ends immediately, all guesses are frozen, and the room transitions to the results phase — even if some guessers have not yet guessed correctly.

**Why this priority**: Without a timer, rounds could run indefinitely. A bounded round duration creates urgency, keeps games moving, and provides a fair endpoint for scoring.

**Independent Test**: Can be tested by starting a round, letting the timer expire without any correct guesses, and verifying the room transitions to results with scores frozen at that point.

**Acceptance Scenarios**:

1. **Given** a round starts, **When** the round timer reaches 0, **Then** the round status transitions to "complete", the room transitions to "result", and no further guesses are accepted.
2. **Given** a round timer is at 30 seconds remaining, **When** all non-drawing players have correctly guessed, **Then** the round ends immediately (no need to wait for timer expiry).
3. **Given** a round ends via timer expiry, **When** the results are displayed, **Then** players who did not guess correctly are marked as such, and the secret word is revealed to all.
4. **Given** a round starts, **When** the timer begins counting down, **Then** all participants see the remaining time (in seconds) on their screen.
5. **Given** a round concludes via timer without any correct guesses, **When** scores are tallied, **Then** no points are awarded to any participant for that round.

---

### User Story 3 — Enhanced Results Screen (Priority: P2)

After a round ends (by timer or all-correct), all players see a results screen showing: the secret word, which players guessed correctly (and their time to guess), a leaderboard of all players ranked by total score, and the drawer identified. The host sees a "Restart Game" button.

**Why this priority**: The results screen is the payoff moment — players want to see how they performed, compare with others, and understand scoring.

**Independent Test**: Can be tested by completing a round and verifying the results display shows all required information: secret word, correct guessers, ranked leaderboard, and host restart button.

**Acceptance Scenarios**:

1. **Given** a round has completed, **When** any player views the results screen, **Then** they see: the secret word, a list of which players guessed it correctly, the time each correct guesser took, a leaderboard of all players sorted by total score descending, and the drawer highlighted.
2. **Given** a round completed via timer, **When** results are shown, **Then** players who did not guess correctly are displayed with a "Did not guess" label and the time they spent is not shown.
3. **Given** the results screen is shown, **When** the viewer is the room host, **Then** a "Restart Game" button is visible.
4. **Given** the results screen is shown, **When** the viewer is not the host, **Then** no restart button is shown and a "Waiting for host to restart" message is displayed instead.

---

### User Story 4 — Host Migration (Priority: P2)

If the original room host disconnects (stops polling), the host privileges are automatically reassigned to another active participant. The new host can then start or restart the game.

**Why this priority**: Without host migration, a disconnected host makes the room permanently unable to start or restart games, stranding all other players.

**Independent Test**: Can be tested by having a host create a room, then stop sending poll requests. After a configured timeout, verify that another participant is automatically assigned as host.

**Acceptance Scenarios**:

1. **Given** a room in any state, **When** the host has not polled for more than 3 consecutive polling intervals (6 seconds), **Then** the room reassigns host privileges to the participant who has been in the room the longest (by join time).
2. **Given** a host is migrating, **When** a new host is selected, **Then** the previous host is still listed as a participant (they may reconnect) but no longer has host privileges.
3. **Given** host migration occurs, **When** the original host resumes polling, **Then** they remain as a regular participant and are not automatically re-assigned as host.
4. **Given** a room has only one participant left, **When** that participant is the host and disconnects, **Then** the room remains in its current state but no host migration occurs (no other participant to assign to).
5. **Given** host migration occurs during an active game round, **When** the new host takes over, **Then** the round continues uninterrupted and the new host can restart the game from the results screen.

---

### Edge Cases

- What happens when a guesser submits the correct word at exactly the same time as the timer expires? (The guess is processed if it arrives before the timer expiry check.)
- How does the system handle a tie in scoring at the top of the leaderboard? (Players with equal scores share the same rank position.)
- What if all non-drawing participants disconnect mid-round? (The round continues; if no one can guess, it ends by timer.)
- What if the host disconnects and reconnects within the same polling window? (No migration occurs — the grace period prevents flapping.)
- What if the drawer disconnects mid-round? (The round continues; the timer will eventually end the round and the drawer receives 0 points.)

## Requirements

### Functional Requirements

- **FR-001**: The scoring system MUST award guessers a base score of 100 points for a correct guess, plus a time bonus of up to 50 additional points calculated as `50 × (remainingTime / totalRoundTime)`.
- **FR-002**: The scoring system MUST award the drawer 50 points for each non-drawing participant who correctly guesses the word during the round.
- **FR-003**: The round timer MUST be set to 60 seconds when a round starts.
- **FR-004**: The room MUST transition to "result" status when the round timer reaches 0, regardless of how many players have guessed correctly.
- **FR-005**: The room MUST transition to "result" status when all non-drawing participants have submitted a correct guess, without waiting for the timer.
- **FR-006**: The remaining round time (in seconds) MUST be visible to all participants during an active round.
- **FR-007**: The results screen MUST display the secret word, highlight which players guessed correctly, show each correct guesser's time-to-guess, and rank all players by total score descending.
- **FR-008**: The host MUST be able to restart the game from the results screen, resetting the room to lobby state while preserving all participants.
- **FR-009**: Host migration MUST trigger after a host fails to poll for more than 3 consecutive 2-second polling intervals (6 seconds of inactivity).
- **FR-010**: Host migration MUST select the new host as the remaining participant who has been in the room the longest (earliest join time).
- **FR-011**: Host migration MUST NOT remove the disconnected host from the participant list — they may reconnect as a regular participant.
- **FR-012**: Host migration MUST NOT interrupt an active game round — the round continues normally.
- **FR-013**: The drawer MUST NOT receive any points if no non-drawing participant correctly guesses the word before round end.
- **FR-014**: A guesser who submits an incorrect guess before the correct one MUST have their time bonus calculated from the timestamp of the correct submission, not the first incorrect one.

### Key Entities

- **Round Timer**: A countdown timer associated with each round, set to 60 seconds at round start, decrementing in real-time across all participants.
- **Score Entry**: Per-participant total score accumulated across rounds, stored in the room's scores map.
- **Time Bonus The component of a guesser's score determined by how much time remained on the round timer when they submitted the correct word.
- **Drawer Score**: Points awarded to the drawer based on the number of correct guessers (50 per correct guesser).
- **Host Eligibility**: A dynamic property of each participant determining if they can be promoted to host based on join order.

## Success Criteria

### Measurable Outcomes

- **SC-001**: A guesser who guesses correctly within the first 30 seconds receives at least 125 points (100 base + 25+ time bonus), while a guesser at 59 seconds receives approximately 100 points.
- **SC-002**: A drawer with 3 correct guessers receives 150 points (50 × 3) for that round.
- **SC-003**: The room transitions to result status within 1 second of the round timer reaching 0.
- **SC-004**: The room transitions to result status within 1 second of the final non-drawing player submitting a correct guess.
- **SC-005**: All participants see the same remaining timer value within 1 second of each other.
- **SC-006**: The results screen is readable at a glance — a player can identify their rank and the correct word within 3 seconds of viewing.
- **SC-007**: Host migration completes within 7 seconds (3 polling intervals + processing) of the host's last successful poll.
- **SC-008**: A game room with a disconnected host remains playable — the new host can restart the game without any interruption.

## Assumptions

- Timer synchronization is best-effort based on server time — clients poll the current timer value from the server snapshot rather than running local timers independently.
- The 60-second round timer includes a reasonable grace period for the final guess to be processed.
- Host migration uses polling-based detection since the system uses HTTP polling (no WebSockets). The 6-second threshold (3 missed polls) balances responsiveness with false-positive tolerance.
- Host migration selects the longest-joined participant as the simplest fair strategy; no voting or explicit opt-in is required.
- The drawer is excluded from scoring calculations for drawer points (the drawer does not earn drawer points for themselves).
- The results screen reuses and enhances the existing result view from the previous feature — it is not built from scratch.
- A single-remaining-participant room does not trigger host migration since there is no other eligible player to assign to.
