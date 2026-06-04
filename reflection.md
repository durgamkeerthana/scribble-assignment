# Reflection

## Features Implemented

### Phase 1: Room Setup & Lobby
Created room creation with unique 4-character codes, join room flow with validation, lobby UI with player list and room code display. Host-only start with minimum 2 players and non-empty name checks.

### Phase 2: Game Start & Drawer Flow
Round management with single drawer per round, secret word hidden from guessers during active round, canvas drawing with stroke persistence, drawer-only canvas controls.

### Phase 3: Gameplay Interaction
Guess submission with case-insensitive matching, real-time sync via 2s HTTP polling, guess history with correct/incorrect badges, validation for drawer guesses, empty guesses, and unknown entities.

### Phase 4: Result & Restart + Enhanced Results
Result screen with secret word reveal, read-only canvas replay, ranked leaderboard with competition ranking (1st/2nd/3rd with tie handling), time-to-guess display, "Did not guess" labels for non-guessers. Host-only restart preserving participants while clearing scores and rounds.

### Phase 4 (cont): Timer & Scoring
60-second countdown with GameTimer component, lazy timer expiry detection on poll, all-correct immediate transition. Dynamic scoring: guesser base 100 + time bonus (50 x remainingTime/60), drawer earns 50 points per correct guesser at round end.
lastPollAt tracking per participant, auto-reassign host after 6 seconds of missed polls, promote longest-joined active participant, disconnected host returns as regular participant.

## Key Decisions
- HTTP polling over WebSockets for simplicity
- In-memory state (no database) as required
- No authentication — participantId-based session
- Server-authoritative timer with lazy expiry detection
- Standard competition ranking for leaderboard ties
