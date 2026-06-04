# Research Notes: Gameplay Interaction

**Date**: 2026-06-04
**Status**: All decisions resolved — no NEEDS CLARIFICATION remaining

## Decisions

### D1: Canvas Sync Mechanism

- **Decision**: Store strokes as serializable JSON array on the Round model. Drawer sends new strokes via POST after each stroke completes (mouseup). GET returns current strokes array. Guessers poll and replay strokes on a `<canvas>` element.
- **Rationale**: Stroke-based data is compact (points array), suitable for HTTP polling within 2s intervals. No pixel-buffer bloat. Aligns with in-memory storage constraint.
- **Alternatives considered**: Base64 pixel snapshots (too large for polling), WebSockets (forbidden by constitution).

### D2: Guess Storage

- **Decision**: Add `Guess[]` array to the Round model. Each guess stores `participantId`, `text` (trimmed), `isCorrect`, `timestamp`. The array grows linearly with guesses — acceptable for small game sessions.
- **Rationale**: Simple array on in-memory Round object. No separate guess store needed.
- **Alternatives considered**: Separate GuessStore Map (unnecessary indirection).

### D3: Score Tracking

- **Decision**: Add `Map<participantId, number>` on the Room model. Initialized to 0 for each participant when game starts. Updated atomically (read + increment + write) on correct guess.
- **Rationale**: Direct lookup per participantId. Simple and performant for 2-10 player games.
- **Alternatives considered**: Deriving scores from guess history (O(n) per score read — wasteful).

### D4: Correct Guesser Re-entry

- **Decision**: If a guesser has already submitted a correct guess, subsequent guesses are still recorded (for history). The `isCorrect` field returns `true` but score is not incremented again.
- **Rationale**: Other players benefit from seeing "X already has it right" in the history. Prevents score farming.
- **Alternatives considered**: Reject additional guesses entirely (loses history value).

### D5: Canvas Rendering

- **Decision**: Use native HTML Canvas API. `mouseDown/mouseMove/mouseUp` for drawing. `clearRect` for clearing. On the guesser side, iterate stored strokes and replay using `lineTo` calls.
- **Rationale**: Zero external dependencies. Sufficient for basic line drawing.
- **Alternatives considered**: p5.js, Fabric.js (unjustified dependencies).

### D6: Dependencies

- **Decision**: No new npm packages. All functionality uses native browser Canvas API, existing Express/Zod on backend, and existing React infrastructure.
- **Rationale**: Canvas drawing, array manipulation, and simple math require no external libraries.
- **Alternatives considered**: (none — no packages justified)
