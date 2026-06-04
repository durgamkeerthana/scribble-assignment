# Research Notes: Result Display & Restart

**Date**: 2026-06-04
**Status**: All decisions resolved — no NEEDS CLARIFICATION remaining

## Decisions

### D1: Round Conclusion Trigger

- **Decision**: The round concludes automatically when `submitGuess` returns a correct answer. At that point, `round.status` transitions to `"complete"` and `room.status` transitions to `"result"`.
- **Rationale**: Simplest trigger — no manual "end round" action needed. Matches the user story "when a correct guess concludes the round."
- **Alternatives considered**: Manual end-round by drawer (adds complexity, unnecessary for MVP).

### D2: Result State Data

- **Decision**: Reuse existing `RoomSnapshot` fields. Room status becomes `"result"`. The secret word is revealed to ALL viewers regardless of role. Scores and guesses already present in the snapshot from feature 003.
- **Rationale**: No new data model needed — just a status transition and visibility change for `secretWord`.
- **Alternatives considered**: Separate result endpoint (unnecessary — snapshot already contains all data).

### D3: Restart Mechanism

- **Decision**: POST `/:code/restart` endpoint. Host-only (validated by `participantId`). Clears `room.rounds`, `room.scores`, sets `room.currentRoundNumber = 0`, `room.status = "lobby"`. Participant list is preserved.
- **Rationale**: Simple, atomic reset. Frontend picks up the new lobby state via polling.
- **Alternatives considered**: DELETE + recreate room (more complex, changes room code).

### D4: Frontend Result View

- **Decision**: GamePage renders the result view when `room.status === "result"`. Shows the correct word, sorted scores, and guess history. Restart button visible only to host.
- **Rationale**: No new route or page needed. Single conditional in existing GamePage.
- **Alternatives considered**: Separate `/result` route (unnecessary complexity).

### D5: Dependencies

- **Decision**: No new npm packages.
- **Rationale**: All work uses existing Express, Zod, React infrastructure.
