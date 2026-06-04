# API Contract: Scoring, Timers, and Host Migration

## Base URL

All endpoints are relative to `/rooms`.

---

## GET `/rooms/:code` (updated snapshot)

The snapshot response now includes timer and host-migration fields.

### Response — 200 OK (active round)

```json
{
  "room": {
    "code": "A1B2",
    "status": "active",
    "hostId": "uuid-host",
    "participants": [
      { "id": "uuid-host", "name": "Alice", "joinedAt": "2026-01-01T00:00:00.000Z" },
      { "id": "uuid-guesser", "name": "Bob", "joinedAt": "2026-01-01T00:00:01.000Z" }
    ],
    "currentRound": {
      "roundNumber": 1,
      "drawerId": "uuid-host",
      "secretWord": null,
      "status": "drawing",
      "strokes": [],
      "guesses": [],
      "remainingTime": 45.3               // NEW: seconds remaining (fractional)
    },
    "availableWords": ["rocket", "pizza", "castle", "guitar", "sunflower"],
    "roles": ["drawer", "guesser"],
    "scores": { "uuid-host": 0, "uuid-guesser": 0 }
  }
}
```

### Response — 200 OK (result state with timer expired)

```json
{
  "room": {
    "code": "A1B2",
    "status": "result",
    "hostId": "uuid-new-host",              // MAY CHANGE after host migration
    "currentRound": {
      "status": "complete",
      "remainingTime": 0,                   // NEW: 0 when round is complete
      "secretWord": "rocket",
      ...
    },
    "scores": { "uuid-host": 150, "uuid-guesser": 100 },
    ...
  }
}
```

### Error — Room not found

| Status | Body |
|--------|------|
| 404 | `{ "message": "Room A1B2 not found" }` |

---

## POST `/rooms/:code/guess` (updated scoring response)

### Request (unchanged)

```json
{
  "participantId": "uuid-guesser",
  "text": "rocket"
}
```

### Response — 200 OK (correct guess with time bonus)

```json
{
  "guess": {
    "participantId": "uuid-guesser",
    "participantName": "Bob",
    "text": "rocket",
    "isCorrect": true,
    "timestamp": "2026-01-01T00:00:45.000Z"
  },
  "isCorrect": true,
  "score": 137,
  "roundComplete": true,
  "timeBonus": 37,                          // NEW
  "timeToGuess": 22.4                       // NEW: seconds elapsed before correct
}
```

When the round completes (all-correct or last correct guesser), the response includes the drawer's accumulated score:

```json
{
  "guess": { ... },
  "isCorrect": true,
  "score": 137,
  "roundComplete": true,
  "timeBonus": 37,
  "timeToGuess": 22.4,
  "drawerScore": 100                        // NEW: drawer got 50×2 correct guessers
}
```

### Response — 200 OK (incorrect guess, unchanged)

```json
{
  "guess": { ... isCorrect: false ... },
  "isCorrect": false,
  "score": 0,
  "roundComplete": false
}
```

### Errors (unchanged)

| Status | Condition |
|--------|-----------|
| 400 | Guess is empty |
| 403 | Drawer cannot guess |
| 404 | Room not found or Participant not found |

---

## POST `/rooms/:code/start` (updated round creation)

### Request (unchanged)

```json
{
  "participantId": "uuid-host"
}
```

### Response — 200 OK (round now includes startedAt-derived timer)

```json
{
  "room": {
    "status": "active",
    "currentRound": {
      "roundNumber": 1,
      "drawerId": "uuid",
      "secretWord": null,
      "status": "drawing",
      "strokes": [],
      "guesses": [],
      "remainingTime": 60.0
    },
    ...
  }
}
```

### Errors (unchanged)

| Status | Condition |
|--------|-----------|
| 400 | Less than 2 players |
| 403 | Caller is not the host |
| 404 | Room not found |

---

## POST `/rooms/:code/restart` (unchanged from 004)

### Request

```json
{
  "participantId": "uuid-of-host"
}
```

### Response — 200 OK

```json
{
  "room": {
    "code": "A1B2",
    "status": "lobby",
    "hostId": "uuid",
    "participants": [...],
    "currentRound": null,
    "availableWords": [...],
    "roles": ["drawer", "guesser"],
    "scores": {}
  }
}
```

### Errors (unchanged)

| Status | Condition |
|--------|-----------|
| 403 | Caller is not the host |
| 404 | Room not found |
