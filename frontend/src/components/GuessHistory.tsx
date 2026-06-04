import { Card } from "./Card";
import { useRoomState } from "../state/roomStore";

export function GuessHistory() {
  const { room } = useRoomState();
  const guesses = room?.currentRound?.guesses ?? [];
  const participants = room?.participants ?? [];

  if (guesses.length === 0) {
    return (
      <Card title="Activity">
        <div className="placeholder-block">
          <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>
            No guesses yet. Waiting for guessers...
          </p>
        </div>
      </Card>
    );
  }

  const hasResultTiming = room?.status === "result";
  const guessersWithCorrect = new Set(
    guesses.filter((g) => g.isCorrect).map((g) => g.participantId)
  );

  return (
    <Card title="Activity">
      <div className="guess-history-list">
        {guesses.map((g, index) => (
          <div key={`${g.participantId}-${index}`} className="guess-history-row">
            <span className="guess-history-name">{g.participantName}</span>
            <span className="guess-history-text">"{g.text}"</span>
            <span className={`guess-history-badge guess-history-badge--${g.isCorrect ? "correct" : "incorrect"}`}>
              {g.isCorrect ? "✓" : "✗"}
            </span>
            {g.isCorrect && hasResultTiming ? (
              <span className="guess-history-time">{g.timeToGuess}s</span>
            ) : null}
          </div>
        ))}
        {hasResultTiming ? (
          participants
            .filter((p) => p.id !== room?.currentRound?.drawerId && !guessersWithCorrect.has(p.id))
            .map((p) => (
              <div key={p.id} className="guess-history-row guess-history-row--missed">
                <span className="guess-history-name">{p.name}</span>
                <span className="guess-history-text guess-history-text--missed">Did not guess</span>
              </div>
            ))
        ) : null}
      </div>
    </Card>
  );
}
