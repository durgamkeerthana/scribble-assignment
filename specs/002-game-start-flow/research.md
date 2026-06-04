# Research: Game Start and Drawer Flow

## Design Decisions

### Decision 1: Drawer Assignment

- **Decision**: The host (first participant in the participants array, who is also the room creator) becomes the drawer for round 1.
- **Rationale**: The host is always the first player to join (they created the room), and the spec explicitly mentions "host (or first player)". Since they are the same person, this is unambiguous.
- **Alternatives considered**: Alphabetical selection, random selection — rejected because the host should have the first turn as the game organizer.

### Decision 2: Deterministic Word Selection

- **Decision**: The secret word is selected using `roundNumber % wordList.length` as the index into the word list.
- **Rationale**: This is deterministic — the same room with the same word list and same round number always produces the same word. Using modulo arithmetic guarantees valid indices even as rounds progress.
- **Alternatives considered**: Hashing the room code + round number — unnecessarily complex for a starter feature; random selection — violates the "deterministic" constraint.

### Decision 3: Drawer-Only Word Visibility

- **Decision**: The backend returns the secret word only when the requesting `participantId` matches the current drawer's ID. For all other participants, the field is omitted or set to null.
- **Rationale**: The server is the single source of truth for authorization. The client should never receive data it shouldn't display.
- **Alternatives considered**: Client-side filtering — insecure, since the word could be read from network inspection; separate endpoints for drawer vs guesser — unnecessary complexity.

### Decision 4: Name Validation at Game Start

- **Decision**: The `startRoom` service function validates all participant names before transitioning the room to active. Names are trimmed; empty or whitespace-only names cause a 400 error with a clear message identifying the invalid participant.
- **Rationale**: This is a belt-and-suspenders check ensuring data integrity even if client-side validation was bypassed during join/create.
- **Alternatives considered**: Only validating on create/join — names could theoretically be empty if future changes bypass validation.

### Decision 5: Round Data Model

- **Decision**: Round data (round number, drawer, secret word) is stored as part of the room state in the in-memory Map, not as a separate entity collection.
- **Rationale**: Simple and consistent with the existing pattern. A single game will have a small number of rounds (fewer than 10 in a typical session), so storing them inline is practical.
- **Alternatives considered**: Separate `Round` table/Map — overengineered for the current scope; storing only current round — insufficient for future features like round history/replay.
