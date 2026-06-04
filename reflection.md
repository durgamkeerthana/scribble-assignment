# Reflection

## What the Starter Already Had

The starter provided a Vite + React + TypeScript frontend and an Express + TypeScript backend with in-memory room storage. It had route shells for room creation, joining, and fetching, plus placeholder UI screens for the lobby, game, and results. Seed data included 5 words and 2 roles. The canvas and guess components were presentational only.

## What Was Added

### Per the assignment spec

- **Room setup & lobby**: Host tracking on creation, join validation, 2-second automatic polling, host-only start with ≥2 player minimum, non-empty name checks
- **Game start & drawer flow**: Drawer assignment to first player, deterministic cyclic word selection, secret word hidden from guessers during active round
- **Gameplay interaction**: Interactive canvas drawing with stroke persistence, clear canvas, guess submission with case-insensitive trimmed comparison, synced guess history via polling, 100-point scoring for correct guesses
- **Result & restart**: Shared result state with correct word reveal, final scores, guess history; host-only restart preserving participants while clearing rounds, scores, and round state; all-correct round-end detection

## Key Decisions

- HTTP polling (2s interval) over WebSockets for simplicity and spec compliance
- In-memory `Map` store — no database, as required
- No authentication — participantId-based sessions

## AI Usage

AI assisted with spec generation, plan decomposition, task breakdown, implementation, and test writing. All output was reviewed, adjusted, and committed incrementally. The constitution constrained AI from adding WebSockets, databases, or auth.
