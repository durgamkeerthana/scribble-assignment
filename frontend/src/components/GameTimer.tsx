interface GameTimerProps {
  remainingTime: number;
}

export function GameTimer({ remainingTime }: GameTimerProps) {
  const displayTime = Math.max(0, Math.floor(remainingTime));
  const isUrgent = displayTime <= 10;

  return (
    <div className={`game-timer${isUrgent ? " game-timer--urgent" : ""}`}>
      <span className="game-timer__value">{displayTime}</span>
      <span className="game-timer__label">s</span>
    </div>
  );
}
