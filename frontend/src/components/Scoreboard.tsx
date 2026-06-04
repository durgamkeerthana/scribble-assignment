import { Card } from "./Card";
import { useRoomState } from "../state/roomStore";

function rankLabel(rank: number): string {
  if (rank === 1) return "1st";
  if (rank === 2) return "2nd";
  if (rank === 3) return "3rd";
  return `${rank}th`;
}

export function Scoreboard() {
  const { room } = useRoomState();

  const scores = room?.scores ?? {};
  const participants = room?.participants ?? [];

  const sorted = [...participants]
    .map((p) => ({ name: p.name, score: scores[p.id] ?? 0 }))
    .sort((a, b) => b.score - a.score);

  let currentRank = 0;

  const ranked = sorted.map((entry, index) => {
    if (index === 0 || entry.score !== sorted[index - 1].score) {
      currentRank = index + 1;
    }
    return { ...entry, rank: currentRank };
  });

  return (
    <Card title="Scoreboard">
      {ranked.length === 0 ? (
        <div className="placeholder-block">
          <div className="placeholder-row">
            <span>Waiting for players...</span>
            <strong>0</strong>
          </div>
        </div>
      ) : (
        <div className="scoreboard-list">
          {ranked.map((entry) => (
            <div key={entry.name} className="scoreboard-row">
              <span className="scoreboard-rank">{rankLabel(entry.rank)}</span>
              <span className="scoreboard-name">{entry.name}</span>
              <strong className="scoreboard-value">{entry.score}</strong>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
