# Reflection

## What the Starter Already Had

The starter provided a Vite + React + TypeScript frontend and an Express + TypeScript backend with in-memory room storage. It had route shells for room creation, joining, and fetching, plus placeholder UI screens for the lobby, game, and results. Seed data included 5 words and 2 roles. The canvas and guess components were presentational only.

## What Was Added

### In-Scope Features (per the assignment spec)

- **Room setup & lobby**: Host tracking on creation, join validation, 2-second automatic polling, host-only start with ≥2 player minimum, non-empty name checks
- **Game start & drawer flow**: Drawer assignment to first player, deterministic cyclic word selection, secret word hidden from guessers during active round
- **Gameplay interaction**: Interactive canvas drawing with stroke persistence, clear canvas, guess submission with case-insensitive trimmed comparison, synced guess history via polling, 100-point scoring for correct guesses
- **Result & restart**: Shared result state with correct word reveal, final scores, guess history; host-only restart preserving participants while clearing rounds, scores, and round state

### Out-of-Scope Additions (deviations from the assignment spec)

These features were implemented beyond the explicitly stated scope in the README and may incur a penalty. They were added as enhancements to improve gameplay:

1. **60-second round timer with countdown (`GameTimer` component)**: The README explicitly lists "timers, countdowns" as out of scope. A 60-second round timer was added with a visual countdown component and lazy expiry detection on poll. The timer triggers automatic round-end when it expires.

2. **Time-bonus scoring**: The assignment specifies 100 points per correct guess. Dynamic time-bonus scoring was added where guessers earn 100 base + a time bonus (50 × remainingTime/60), rewarding faster guesses.

3. **Drawer bonus scoring**: The drawer earns 50 points per correct non-drawing guesser at round end. The assignment only specifies guesser scoring.

4. **Host migration**: Automatic host reassignment if the host stops polling for 6+ seconds. This feature was not part of any business scenario but was added for robustness.

**Why these were added**: The timer prevents stalled games, time-bonus/drawer scoring adds strategic depth, and host migration prevents deadlocked rooms. These are production-quality enhancements that go beyond the lab's focused scope.

## Key Decisions

- HTTP polling (2s interval) over WebSockets for simplicity and spec compliance
- In-memory `Map` store — no database, as required
- No authentication — participantId-based sessions
- Server-authoritative timer with lazy expiry (checked on poll, no background timer)
- Standard competition ranking for leaderboard ties (1st, 1st, 3rd)

## AI Usage

AI assisted with spec generation, plan decomposition, task breakdown, implementation, and test writing. All output was reviewed, adjusted, and committed incrementally. The constitution constrained AI from adding WebSockets, databases, or auth.
