import { Card } from "./Card";
import { useRoomState } from "../state/roomStore";

export function GuessHistory() {
  const { room } = useRoomState();
  const guesses = room?.currentRound?.guesses ?? [];

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
          </div>
        ))}
      </div>
    </Card>
  );
}
