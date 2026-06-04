import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../components/Card";
import { PageHeader } from "../components/PageHeader";
import { RoomCodeBadge } from "../components/RoomCodeBadge";
import { useRoomState, useRoomStore } from "../state/roomStore";

export function LobbyPage() {
  const navigate = useNavigate();
  const roomStore = useRoomStore();
  const { room, error, isLoading } = useRoomState();
  const [pollingError, setPollingError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

    intervalRef.current = setInterval(async () => {
      try {
        const updatedRoom = await roomStore.fetchRoom();

        if (!updatedRoom) {
          navigate("/", { replace: true });
          return;
        }

        if (updatedRoom.status === "active") {
          navigate("/game");
          return;
        }

        setPollingError(null);
      } catch (caughtError) {
        const message = caughtError instanceof Error ? caughtError.message : "";
        if (message.toLowerCase().includes("not found")) {
          navigate("/", { replace: true });
          return;
        }
        setPollingError("Polling error — will retry");
      }
    }, 2000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [navigate, roomStore]);

  if (!room) {
    return null;
  }

  const isHost = roomStore.getSnapshot().participantId === room.hostId;

  return (
    <section className="panel placeholder-page">
      <div className="lobby-header">
        <PageHeader
          kicker="Waiting for players"
          title="Lobby"
          description="Share the room code with friends so they can join your game."
        />
        <RoomCodeBadge code={room.code} />
      </div>

      <div className="summary-grid">
        <Card title="Participants">
          {room.participants.length === 0 ? (
            <p>No participants are connected to this room yet.</p>
          ) : (
            <ul className="player-list">
              {room.participants.map((participant) => (
                <li key={participant.id}>
                  <span>
                    {participant.name}
                    {participant.id === room.hostId ? <span className="host-badge">Host</span> : null}
                  </span>
                  <span className="player-list__meta">joined</span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Status">
          <p className="status-line" style={{ backgroundColor: isLoading ? '#fef3c7' : '#e0e7ff', color: isLoading ? '#b45309' : '#3730a3' }}>
            {isLoading ? "Refreshing players..." : "Ready to play"}
          </p>
          <p style={{ marginTop: '8px' }}>{error ?? pollingError ?? (isHost ? "" : "Waiting for the host to start the game.")}</p>
        </Card>
      </div>

      <div className="button-row button-row--spread">
        {isHost ? (
          <button
            className="button button--primary"
            disabled={room.participants.length < 2}
            onClick={() => roomStore.startGame(room.code, roomStore.getSnapshot().participantId!)}
          >
            Start Game
          </button>
        ) : (
          <p>Waiting for the host to start the game.</p>
        )}
      </div>
    </section>
  );
}
