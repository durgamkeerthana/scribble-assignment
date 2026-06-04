# API Contract: Result Display & Restart

## Base URL

All endpoints are relative to `/rooms`.

---

## POST `/rooms/:code/restart`

Restart the game from result state. Host-only. Clears all round data, returns to lobby with participants preserved.

### Request

```json
{
  "participantId": "uuid-of-host"
}
```

**Validation** (Zod):
- `participantId`: string, min 1 char

### Response — 200 OK

```json
{
  "room": {
    "code": "A1B2",
    "status": "lobby",
    "hostId": "uuid",
    "participants": [
      { "id": "uuid-1", "name": "Alice", "joinedAt": "..." },
      { "id": "uuid-2", "name": "Bob", "joinedAt": "..." }
    ],
    "currentRound": null,
    "availableWords": ["rocket", "pizza", "castle", "guitar", "sunflower"],
    "roles": ["drawer", "guesser"],
    "scores": {}
  }
}
```

### Errors

| Status | Condition |
|--------|-----------|
| 403 | Caller is not the host of the room |
| 404 | Room not found |

---

## GET `/rooms/:code` (updated)

Existing endpoint. When room is in `"result"` state, the snapshot now returns the round as `"complete"` with the secret word visible to ALL viewers:

```json
{
  "room": {
    "code": "A1B2",
    "status": "result",
    "participants": [...],
    "currentRound": {
      "roundNumber": 1,
      "drawerId": "uuid",
      "secretWord": "rocket",        // ← revealed to ALL viewers
      "status": "complete",
      "strokes": [...],
      "guesses": [
        {
          "participantId": "uuid",
          "participantName": "Bob",
          "text": "rocket",
          "isCorrect": true,
          "timestamp": "..."
        }
      ]
    },
    "scores": {
      "uuid-alice": 0,
      "uuid-bob": 100
    },
    "availableWords": [...],
    "roles": ["drawer", "guesser"]
  }
}
```

### Updated `toRoomSnapshot` Logic

```typescript
// Current logic (hidden from non-drawer during active round):
secretWord: viewerParticipantId === currentRound.drawerId
  ? currentRound.secretWord
  : null

// New logic (revealed to all when round is complete):
secretWord: currentRound.status === "complete"
  ? currentRound.secretWord
  : viewerParticipantId === currentRound.drawerId
    ? currentRound.secretWord
    : null
```

---

## POST `/rooms/:code/guess` (updated behavior)

When a correct guess is submitted, the round status transitions to `"complete"` automatically and the room status transitions to `"result"`.

### Updated Response (correct guess)

```json
{
  "guess": { ... },
  "isCorrect": true,
  "score": 100,
  "roundComplete": true,
  "roomStatus": "result"
}
```

The caller does not need this data explicitly — the next poll will show the new room status. But the response now indicates the round is complete so the UI can react instantly rather than waiting for the next poll.
