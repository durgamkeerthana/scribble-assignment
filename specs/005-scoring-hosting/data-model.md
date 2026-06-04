# Data Model: Scoring, Timers, and Host Migration

## Entity Changes

### Round (updated)

```typescript
interface Round {
  // Existing fields
  roundNumber: number;
  drawerId: string;
  secretWord: string;
  status: RoundStatus;             // "drawing" | "complete"
  strokes: Stroke[];
  guesses: Guess[];

  // NEW FIELDS
  startedAt: number;               // Date.now() when round started (ms since epoch)
}
```

**`startedAt`**: Records the server timestamp when the round was created. Used to compute elapsed time and remaining time for time-bonus scoring and timer display.

---

### Room (updated)

```typescript
interface Room {
  // Existing fields
  code: string;
  status: RoomStatus;              // "lobby" | "active" | "result"
  hostId: string;
  participants: Participant[];
  rounds: Round[];
  currentRoundNumber: number;
  createdAt: string;
  updatedAt: string;
  scores: Record<string, number>;
}
```

No new fields on Room. Host migration tracking uses participant-scoped lastPoll timestamps.

---

### Participant (updated)

```typescript
interface Participant {
  // Existing fields
  id: string;
  name: string;
  joinedAt: string;

  // NEW FIELD
  lastPollAt: number;              // Date.now() of most recent poll (ms since epoch)
}
```

**`lastPollAt`**: Updated on every GET /rooms/:code request (poll). Used by host migration logic to determine if the host is still active.

---

### RoomSnapshot (updated)

```typescript
interface RoundSnapshot {
  // Existing fields
  roundNumber: number;
  drawerId: string;
  secretWord: string | null;
  status: RoundStatus;
  strokes: Stroke[];
  guesses: Guess[];

  // NEW FIELD
  remainingTime: number;           // seconds remaining (may be fractional), 0 if round complete
}
```

**`remainingTime`**: Computed as `max(0, 60 - (Date.now() - round.startedAt) / 1000)`. Sent to all clients on every snapshot.

---

### GuessResponse (updated behavior)

```typescript
// The submitGuess endpoint now returns additional scoring context:
{
  guess: Guess;
  isCorrect: boolean;
  score: number;                    // Guesser's total cumulative score after this guess
  roundComplete: boolean;
  drawerScore: number;              // NEW: points awarded to drawer (only populated when round completes)
  timeBonus: number;                // NEW: time bonus points earned by this correct guess
  timeToGuess: number;              // NEW: seconds elapsed before correct guess
}
```

Note: `drawerScore` and `timeBonus` and `timeToGuess` are informational for the UI results screen. They are calculated at round-end.

---

## Scoring Algorithm

### Guesser Score (on correct guess)

```
baseScore = 100
timeBonus = Math.round(50 × (remainingTime / 60))
totalGuesserScore = baseScore + timeBonus
```

- `remainingTime` is the round timer remaining at the moment of correct guess.
- The time bonus is capped at 50 (when guessed at 60s remaining) and approaches 0 as time expires.
- Incorrect guesses do not affect scoring; only the first correct guess by each participant earns points.
- Duplicate correct guesses from the same participant do not award additional points.

### Drawer Score (on round conclusion)

```
drawerScore = 50 × (number of non-drawing participants who correctly guessed the word)
```

- The drawer is excluded from this count.
- Calculated when the round concludes (either all correct or timer expiry).
- If no one correctly guesses the word, the drawer receives 0 points.

---

## Timer Model

### Server-Side Timer

- `round.startedAt` is set to `Date.now()` when `startRoom` creates the round.
- On each snapshot request, compute: `remainingTime = Math.max(0, 60 - (Date.now() - round.startedAt) / 1000)`.
- When the round is fetched and `remainingTime <= 0`, the server auto-transitions:
  - `round.status = "complete"`
  - `room.status = "result"`
  - (Drawer score is computed and applied)
- This transition happens lazily on the next poll after expiry, not via a background timer.

### Client-Side Display

- Clients receive `remainingTime` in the round snapshot.
- The `GameTimer` component displays the integer floor of this value.
- Between polls, the component decrements locally:
  ```typescript
  const [displayTime, setDisplayTime] = useState(remainingTime);
  useEffect(() => {
    const interval = setInterval(() => {
      setDisplayTime((t) => Math.max(0, t - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [remainingTime]);
  ```
- On each new poll response, `remainingTime` is reset to the server value (correcting drift).

---

## Host Migration State Machine

```
                    Host misses 3+ polls (6s)
                    ┌───────────────────────┐
                    │                       │
                    ▼                       │
┌─────────┐   ┌──────────┐            ┌─────────┐
│  Host    │   │  Host    │            │ Ex-Host │
│ Active   │──►│ Suspect  │──►(timeout)──►│ Inactive│
│          │   │ (1 miss) │            │         │
└─────────┘   └──────────┘            └─────────┘
     ▲                                      │
     │                                      │
     └──────(poll resumes)──────────────────┘
                     
                     New host elected (longest-joined active participant)
```

### Detection

- Every `GET /rooms/:code` (poll) call updates the polling participant's `lastPollAt` timestamp.
- Before returning the snapshot, the server checks: if `room.status !== "lobby"` (to allow lobby host changes, though lobby doesn't need it), and specifically in "active" or "result" state, check the host's `lastPollAt`.
- If `Date.now() - hostParticipant.lastPollAt > 6000`, trigger host migration.

### Selection

1. Filter participants to those who have polled within the last 6 seconds.
2. Sort by `joinedAt` (ascending — oldest first).
3. Select the first non-host participant as new host.
4. Set `room.hostId = selectedParticipant.id`.
5. The old host remains in the participant list with `lastPollAt` unchanged (they may reconnect).

### Edge Cases

- If no other participants are active, no migration occurs.
- If the host is the only participant, no migration occurs.
- Migration does not affect active round state.
- Migration does not affect scores or round data.
