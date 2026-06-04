# Research: Scoring, Timers, and Host Migration

## Overview

No NEEDS CLARIFICATION markers exist in the spec. This document consolidates design decisions for implementation.

## Design Decisions

### 1. Timer Implementation

- **Decision**: Server-authoritative timer using `Date.now()` at round start; clients poll remaining time from snapshot.
- **Rationale**: Since we use HTTP polling (2s interval), a local client timer would drift. Instead, the server records `startedAt` on the round, and computes `remainingTime = max(0, 60 - (Date.now() - startedAt) / 1000)` on each snapshot response. Clients display this value and interpolate locally between polls for smooth countdown.
- **Alternatives considered**:
  - Pure client-side timer: Would drift and mismatch server state.
  - WebSocket push: Forbidden by constitution.

### 2. Scoring Algorithm

- **Decision**: Guesser base = 100 points; time bonus = 50 × (remainingTime / totalRoundTime); drawer score = 50 per correct guesser.
- **Rationale**: Matches spec FR-001 and FR-002 exactly. The time bonus is a linear function of remaining time — simple to compute and communicate.
- **Alternatives considered**:
  - Exponential bonus for very fast guesses: More complex, less predictable.
  - Flat score per guess regardless of time: Replaced by this feature.

### 3. Host Migration Detection

- **Decision**: Track `lastPollTimestamp` on each participant. On every fetchRoom/getRoom call, update the polling participant's timestamp. Before returning snapshot, check if host's timestamp is more than 6 seconds old; if so, promote the longest-joined active participant.
- **Rationale**: No need for external heartbeat mechanism — existing polling naturally provides liveness signals.
- **Alternatives considered**:
  - Dedicated heartbeat endpoint: Unnecessary; polling already serves this purpose.
  - Leader election / voting: Over-engineered for party game context.

### 4. Timer on Frontend

- **Decision**: The snapshot includes `remainingTime` (number of seconds, possibly fractional). The `GameTimer` component displays it as an integer countdown, updating on each poll response. Between polls, it decrements locally for smooth visual updates.
- **Rationale**: Polling at 2s intervals would make the timer visibly jump. Local interpolation between server ticks provides smooth UX while the server remains the source of truth.
- **Alternatives considered**:
  - Server-only timing with 2s updates: Acceptable but less polished UX.
