# API Contracts: Game Start and Drawer Flow

## Modified Endpoints

### POST /rooms/:code/start

**Purpose**: Start the game, validate names, assign drawer, select secret word, create round 1.

**Request**:
```json
{
  "participantId": "string (required)"
}
```

**Validation**:
- `participantId` must be a non-empty string (existing)
- All room participants must have non-empty names after trimming (new)
- Caller must be the room host (existing)
- Room must have at least 2 participants (existing)
- Room must be in `"lobby"` status (existing)

**Success Response (200)**:
```json
{
  "room": {
    "code": "ABCD",
    "status": "active",
    "hostId": "uuid",
    "participants": [
      { "id": "uuid", "name": "Player1", "joinedAt": "ISO8601" },
      { "id": "uuid", "name": "Player2", "joinedAt": "ISO8601" }
    ],
    "currentRound": {
      "roundNumber": 1,
      "drawerId": "uuid-of-drawer",
      "secretWord": "rocket",
      "status": "drawing"
    }
  }
}
```

**Notes**:
- `secretWord` is included only for the drawer participant in the response
- For non-drawer participants, `secretWord` is `null`

**Error Responses**:
- `400`: `{ "message": "Player name cannot be empty" }` — participant has invalid name
- `403`: `{ "message": "Only the host can start the game" }` — non-host attempted to start
- `400`: `{ "message": "At least 2 players are required to start the game" }` — insufficient players
- `404`: `{ "message": "Room CODE not found" }` — room doesn't exist

### GET /rooms/:code

**Purpose**: Fetch room snapshot. Existing endpoint, now includes `currentRound`.

**Request Query**:
```json
{
  "participantId": "string (optional)"
}
```

**Success Response (200)**:
```json
{
  "room": {
    "code": "ABCD",
    "status": "active",
    "hostId": "uuid",
    "participants": [...],
    "currentRound": {
      "roundNumber": 1,
      "drawerId": "uuid-of-drawer",
      "secretWord": "rocket",
      "status": "drawing"
    }
  }
}
```

**Notes**:
- `secretWord` is included only when `participantId` matches `currentRound.drawerId`
- For non-drawer participants or when `participantId` is not provided, `secretWord` is `null`
- When room status is `"lobby"`, `currentRound` is `null`

**Error Responses**:
- `404`: `{ "message": "Room CODE not found" }` — room doesn't exist

## Unchanged Endpoints

- `POST /rooms` — create room (unchanged)
- `POST /rooms/:code/join` — join room (unchanged)

## API Client Contract (frontend)

### api.fetchRoom — Modified

```typescript
api.fetchRoom(code: string, participantId?: string):
  Promise<{ room: RoomSnapshot }>
```

`RoomSnapshot` gains `currentRound` field.

### api.startGame — Existing, with updated return type

```typescript
api.startGame(code: string, participantId: string):
  Promise<{ room: RoomSnapshot }>
```

Return type remains the same; `RoomSnapshot.currentRound` is now populated.

### RoomSnapshot Type — New Fields

```typescript
interface RoomSnapshot {
  code: string;
  status: "lobby" | "active";
  hostId: string;
  participants: Participant[];
  currentRound: RoundSnapshot | null;
  availableWords: string[];      // unchanged
  roles: ParticipantRole[];      // unchanged
}

interface RoundSnapshot {
  roundNumber: number;
  drawerId: string;
  secretWord: string | null;     // null for non-drawer participants
  status: "drawing" | "complete";
}
```
