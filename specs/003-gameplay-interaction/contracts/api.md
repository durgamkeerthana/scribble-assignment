# API Contract: Gameplay Interaction

## Base URL

All endpoints are relative to `/rooms`.

---

## POST `/rooms/:code/canvas`

Submit a new stroke to the canvas. Append-only — each call adds one stroke.

### Request

```json
{
  "participantId": "uuid-of-drawer",
  "stroke": {
    "points": [{ "x": 10, "y": 20 }, { "x": 15, "y": 25 }]
  }
}
```

**Validation** (Zod):
- `participantId`: string, min 1 char
- `stroke`: object with `points` array
  - `points`: array, min 2 items
  - Each `point`: `{ x: number, y: number }`

### Response — 200 OK

```json
{
  "round": {
    "strokes": [
      { "points": [{ "x": 10, "y": 20 }, { "x": 15, "y": 25 }] },
      { "points": [{ "x": 5, "y": 5 }, { "x": 30, "y": 40 }] }
    ]
  }
}
```

### Errors

| Status | Condition |
|--------|-----------|
| 400 | Invalid stroke data (0 or 1 points) |
| 403 | Caller is not the current round's drawer |
| 404 | Room or round not found |

---

## POST `/rooms/:code/canvas/clear`

Clear all strokes from the current round's canvas. Only the drawer may clear.

### Request

```json
{
  "participantId": "uuid-of-drawer"
}
```

### Response — 200 OK

```json
{
  "round": {
    "strokes": []
  }
}
```

### Errors

| Status | Condition |
|--------|-----------|
| 403 | Caller is not the current round's drawer |
| 404 | Room or round not found |

---

## POST `/rooms/:code/guess`

Submit a guess for the current round.

### Request

```json
{
  "participantId": "uuid-of-guesser",
  "text": "my guess"
}
```

**Validation** (Zod):
- `participantId`: string, min 1 char
- `text`: string, `.trim()` non-empty — MUST reject whitespace-only

### Response — 200 OK (correct)

```json
{
  "guess": {
    "participantId": "uuid-of-guesser",
    "participantName": "Alice",
    "text": "rocket",
    "isCorrect": true,
    "timestamp": "2026-06-04T12:00:00.000Z"
  },
  "isCorrect": true,
  "score": 100
}
```

### Response — 200 OK (incorrect)

```json
{
  "guess": {
    "participantId": "uuid-of-guesser",
    "participantName": "Alice",
    "text": "wrong",
    "isCorrect": false,
    "timestamp": "2026-06-04T12:00:00.000Z"
  },
  "isCorrect": false,
  "score": 0
}
```

### Errors

| Status | Condition |
|--------|-----------|
| 400 | Empty guess text after trim |
| 403 | Guesser is the current round's drawer |
| 404 | Room or round not found |

---

## GET `/rooms/:code`

Existing endpoint. The `RoomSnapshot` response now includes additional fields for gameplay:

```json
{
  "room": {
    "code": "A1B2",
    "status": "active",
    "participants": [{ "id": "...", "name": "Alice", "joinedAt": "..." }],
    "currentRound": {
      "roundNumber": 1,
      "drawerId": "uuid",
      "secretWord": "rocket",
      "status": "drawing",
      "strokes": [{ "points": [...] }],
      "guesses": [
        {
          "participantId": "uuid",
          "participantName": "Alice",
          "text": "rocket",
          "isCorrect": true,
          "timestamp": "2026-06-04T12:00:00.000Z"
        }
      ]
    },
    "scores": {
      "uuid-player1": 0,
      "uuid-player2": 100,
      "uuid-player3": 0
    },
    "hostId": "uuid",
    "availableWords": ["rocket", "pizza", "castle", "guitar", "sunflower"],
    "roles": ["drawer", "guesser"]
  }
}
```

**Note**: `strokes` is only populated if the viewer is the drawer or the round is complete. For guessers during an active round, `strokes` is always included (they need to see the drawing). The `secretWord` remains drawer-only (existing behavior).

### Zod Schema for RoundSnapshot (updated)

```typescript
const pointSchema = z.object({
  x: z.number(),
  y: z.number()
});

const strokeSchema = z.object({
  points: z.array(pointSchema).min(2)
});

const guessSchema = z.object({
  participantId: z.string(),
  participantName: z.string(),
  text: z.string(),
  isCorrect: z.boolean(),
  timestamp: z.string()
});

const roundSnapshotSchema = z.object({
  roundNumber: z.number(),
  drawerId: z.string(),
  secretWord: z.string().nullable(),
  status: z.enum(["drawing", "complete"]),
  strokes: z.array(strokeSchema),
  guesses: z.array(guessSchema)
});

const roomSnapshotSchema = z.object({
  code: z.string(),
  status: z.enum(["lobby", "active"]),
  hostId: z.string(),
  participants: z.array(participantSchema),
  currentRound: roundSnapshotSchema.nullable(),
  availableWords: z.array(z.string()),
  roles: z.array(z.enum(["drawer", "guesser"])),
  scores: z.record(z.string(), z.number())
});
```
