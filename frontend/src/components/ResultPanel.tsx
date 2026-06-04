import { Card } from "./Card";
import { useRoomState } from "../state/roomStore";

export function ResultPanel() {
  const { room } = useRoomState();

  if (!room) {
    return null;
  }

  const guesses = room.currentRound?.guesses ?? [];
  const drawerId = room.currentRound?.drawerId;

  return (
    <Card title="Round Results">
      <div className="guess-history-list">
        {guesses
          .filter((g) => g.participantId !== drawerId)
          .map((g) => (
            <div key={g.participantId} className="guess-history-row">
              <span className="guess-history-name">{g.participantName}</span>
              <span className="guess-history-text">"{g.text}"</span>
              {g.isCorrect ? (
                <span className="guess-history-badge guess-history-badge--correct">✓</span>
              ) : null}
            </div>
          ))}
      </div>
    </Card>
  );
}
