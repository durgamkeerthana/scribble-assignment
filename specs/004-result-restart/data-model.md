# Data Model: Result Display & Restart

## Entity Changes

### RoomStatus (updated)

```typescript
export type RoomStatus = "lobby" | "active" | "result";
```

Adds `"result"` to the existing union type. Represents the round-end state where the correct word, scores, and guess history are displayed to all players.

### Room (updated behavior)

```typescript
interface Room {
  // Existing fields unchanged
  status: RoomStatus; // "lobby" | "active" | "result"
  participants: Participant[]; // Preserved on restart
  rounds: Round[]; // Cleared on restart
  scores: Record<string, number>; // Reset to {} on restart
  currentRoundNumber: number; // Reset to 0 on restart
}
```

### Round (updated behavior)

```typescript
interface Round {
  // Existing fields unchanged
  status: RoundStatus; // "drawing" | "complete"
}
```

When the round concludes: `status` transitions from `"drawing"` to `"complete"`.

---

## State Transitions

```
Room Status: "active" ──(correct guess)──→ "result"
                    │                          │
                    │                          │
                    └──(host restart)──────────→ "lobby"
                                                  │
                                                  │
                                    (host start)──┘
                                                  ↓
                                             "active"
```

### Round Status Transition

```
Round Status: "drawing" ──(conclusion)──→ "complete"
```

On restart:
- All round objects are removed from `room.rounds[]`
- `room.currentRoundNumber` is set to 0
- `room.scores` is reset to `{}`
- Participants are preserved
- A new game from lobby creates fresh rounds and scores

---

## Restart Action

```typescript
interface RestartAction {
  triggeredBy: string; // participantId of host
  timestamp: string; // ISO 8601
}
```

**Validation**: Only the host (`room.hostId`) may restart. Non-host requests return 403.

**Effects**:
1. `room.status` → `"lobby"`
2. `room.rounds` → `[]`
3. `room.currentRoundNumber` → `0`
4. `room.scores` → `{}`
5. `room.participants` — unchanged
6. `room.updatedAt` → current timestamp
