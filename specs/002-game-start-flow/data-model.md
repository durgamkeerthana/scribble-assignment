# Data Model: Game Start and Drawer Flow

## Entities

### Round

Represents a single drawing-guessing round within a game.

| Field | Type | Description |
|-------|------|-------------|
| `roundNumber` | number | 1-indexed round number |
| `drawerId` | string | Participant ID of the player drawing this round |
| `secretWord` | string | The word the drawer must draw |
| `status` | `"drawing"` \| `"complete"` | Current state of the round |

### Room — New/Modified Fields

The existing `Room` interface gains round tracking:

| Field | Type | Description |
|-------|------|-------------|
| `rounds` | `Round[]` | All rounds played in this game (appended as game progresses) |
| `currentRoundNumber` | number | The active round number; 0 if game hasn't started |

### RoomSnapshot — New/Modified Fields

| Field | Type | Description |
|-------|------|-------------|
| `currentRound` | `RoundSnapshot \| null` | Snapshot of the active round (see below) |

### RoundSnapshot

Public representation of a round, with access-controlled fields.

| Field | Type | Visible To | Description |
|-------|------|------------|-------------|
| `roundNumber` | number | All | 1-indexed round number |
| `drawerId` | string | All | Participant ID of the current drawer |
| `secretWord` | string | Drawer only | The word being drawn |
| `status` | `"drawing"` \| `"complete"` | All | Current round state |

## State Transitions

### Room Status

```
lobby ────(startGame, valid names)────→ active
  │                                       │
  └── all participants valid              └── round 1 created,
       → status = "active"                    drawer = host,
       → currentRoundNumber = 1              secretWord deterministically
       → round 1 appended to rounds[]        selected
```

### Round Status

```
created ────→ "drawing" ────→ "complete"
(at game start)     │           (future)
                    └── round active
```

## Validation Rules

- **Name validation**: All participant names must be non-empty after trimming before game can start.
- **Drawer assignment**: The first participant in the room's participants array (the host) is assigned as drawer for round 1.
- **Word selection**: `wordList[(roundNumber - 1) % wordList.length]` — deterministic, 0-indexed.
- **Minimum players**: At least 2 participants required (enforced before game start).
- **Host check**: Only the room host (matching `hostId`) can start the game.

## Existing Entity Reference

### Participant (unchanged)

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | UUID |
| `name` | string | Display name (trimmed, non-empty) |
| `joinedAt` | string | ISO 8601 timestamp |

### ParticipantRole (unchanged)

```typescript
type ParticipantRole = "drawer" | "guesser";
```
