import { Card } from "./Card";
import { useRoomState } from "../state/roomStore";

export function Scoreboard() {
  const { room } = useRoomState();

  const scores = room?.scores ?? {};
  const participants = room?.participants ?? [];

  const sorted = [...participants]
    .map((p) => ({ name: p.name, score: scores[p.id] ?? 0 }))
    .sort((a, b) => b.score - a.score);

  return (
    <Card title="Scoreboard">
      {sorted.length === 0 ? (
        <div className="placeholder-block">
          <div className="placeholder-row">
            <span>Waiting for players...</span>
            <strong>0</strong>
          </div>
        </div>
      ) : (
        <div className="scoreboard-list">
          {sorted.map((entry) => (
            <div key={entry.name} className="scoreboard-row">
              <span className="scoreboard-name">{entry.name}</span>
              <strong className="scoreboard-value">{entry.score}</strong>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
