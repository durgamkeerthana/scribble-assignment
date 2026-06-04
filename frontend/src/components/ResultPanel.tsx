import { Card } from "./Card";
import { useRoomState } from "../state/roomStore";

export function ResultPanel() {
  const { room } = useRoomState();

  if (!room) {
    return null;
  }

  const guesses = room.currentRound?.guesses ?? [];
  const participants = room.participants;
  const drawerId = room.currentRound?.drawerId;

  const guessersWithCorrect = new Set(
    guesses.filter((g) => g.isCorrect).map((g) => g.participantId)
  );

  return (
    <Card title="Round Results">
      <div className="guess-history-list">
        {participants
          .filter((p) => p.id !== drawerId)
          .map((p) => {
            const correctGuess = guesses.find(
              (g) => g.participantId === p.id && g.isCorrect
            );
            const hasGuessed = guessersWithCorrect.has(p.id);
            return (
              <div
                key={p.id}
                className={`guess-history-row${!hasGuessed ? " guess-history-row--missed" : ""}`}
              >
                <span className="guess-history-name">{p.name}</span>
                {hasGuessed && correctGuess ? (
                  <>
                    <span className="guess-history-text">{correctGuess.text}</span>
                    <span className="guess-history-time">{correctGuess.timeToGuess}s</span>
                    <span className="guess-history-badge guess-history-badge--correct">✓</span>
                  </>
                ) : (
                  <span className="guess-history-text guess-history-text--missed">
                    Did not guess
                  </span>
                )}
              </div>
            );
          })}
      </div>
    </Card>
  );
}
