import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../components/Card";
import { GuessForm } from "../components/GuessForm";
import { ResultPanel } from "../components/ResultPanel";
import { RoomCodeBadge } from "../components/RoomCodeBadge";
import { Scoreboard } from "../components/Scoreboard";
import { useRoomState, useRoomStore } from "../state/roomStore";

export function GamePage() {
  const navigate = useNavigate();
  const roomStore = useRoomStore();
  const { room, participantId } = useRoomState();
  const [pollingError, setPollingError] = useState<string | null>(null);

  useEffect(() => {
    if (!room) {
      navigate("/", { replace: true });
      return;
    }
  }, [navigate, room]);

  useEffect(() => {
    if (!room) {
      return;
    }

    const interval = setInterval(async () => {
      try {
        const updatedRoom = await roomStore.fetchRoom();
        if (!updatedRoom) {
          navigate("/", { replace: true });
          return;
        }
        setPollingError(null);
      } catch {
        setPollingError("Polling error — will retry");
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [navigate, roomStore]);

  if (!room) {
    return null;
  }

  const viewer = room.participants.find((p) => p.id === participantId) ?? null;
  const currentRound = room.currentRound;
  const isDrawer = currentRound !== null && participantId === currentRound.drawerId;
  const drawerName = currentRound
    ? room.participants.find((p) => p.id === currentRound.drawerId)?.name ?? "Unknown"
    : null;

  return (
    <section className="panel game-page">
      <div className="game-page__header">
        <div className="game-page__header-left">
          <span className="section-kicker">Round {currentRound?.roundNumber ?? 1}</span>
          <h1 className="game-page__title">
            {isDrawer ? "You are the Drawer!" : "Guess the Word!"}
          </h1>
        </div>
        <RoomCodeBadge code={room.code} />
      </div>

      <div className="game-page__layout">
        <aside className="game-page__sidebar game-page__sidebar--left">
          <Scoreboard />
          <ResultPanel />
        </aside>

        <div className="game-page__main">
          {isDrawer ? (
            <Card title="Your Secret Word">
              <p className="secret-word-display" style={{ fontSize: '2rem', textAlign: 'center', padding: '2rem', backgroundColor: '#fef3c7', borderRadius: '8px', fontWeight: 'bold' }}>
                {currentRound?.secretWord ?? "Loading..."}
              </p>
              <p style={{ textAlign: 'center', marginTop: '8px', color: '#6b7280' }}>
                Draw this word for the other players to guess!
              </p>
            </Card>
          ) : (
            <Card title="Canvas">
              <div className="canvas-placeholder" style={{ minHeight: '500px', backgroundColor: '#ffffff', border: '1px solid #e5e7eb' }}>
                {currentRound
                  ? `${drawerName ?? "The drawer"} is drawing...`
                  : "Waiting for the game to start..."
                }
              </div>
            </Card>
          )}
        </div>

        <aside className="game-page__sidebar game-page__sidebar--right">
          <Card title="Player Info">
            <dl className="detail-list">
              <div>
                <dt>Name</dt>
                <dd>{viewer?.name ?? "Unknown player"}</dd>
              </div>
              <div>
                <dt>Role</dt>
                <dd>{isDrawer ? "Drawer" : "Guesser"}</dd>
              </div>
              {drawerName && !isDrawer ? (
                <div>
                  <dt>Drawing</dt>
                  <dd>{drawerName}</dd>
                </div>
              ) : null}
            </dl>
          </Card>

          {!isDrawer ? (
            <Card title="Your Guess">
              <GuessForm />
            </Card>
          ) : null}
        </aside>
      </div>

      <div className="button-row">
        <button className="button button--secondary" onClick={() => navigate("/lobby")}>
          Exit Game
        </button>
      </div>
    </section>
  );
}
