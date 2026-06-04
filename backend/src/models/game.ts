export type ParticipantRole = "drawer" | "guesser";
export type RoomStatus = "lobby" | "active" | "result";
export type RoundStatus = "drawing" | "complete";

export interface Point {
  x: number;
  y: number;
}

export interface Stroke {
  points: Point[];
}

export interface Guess {
  participantId: string;
  participantName: string;
  text: string;
  isCorrect: boolean;
  timestamp: string;
}

export interface Participant {
  id: string;
  name: string;
  joinedAt: string;
}

export interface Round {
  roundNumber: number;
  drawerId: string;
  secretWord: string;
  status: RoundStatus;
  strokes: Stroke[];
  guesses: Guess[];
}

export interface Room {
  code: string;
  status: RoomStatus;
  hostId: string;
  participants: Participant[];
  rounds: Round[];
  currentRoundNumber: number;
  createdAt: string;
  updatedAt: string;
  scores: Record<string, number>;
}

export interface RoundSnapshot {
  roundNumber: number;
  drawerId: string;
  secretWord: string | null;
  status: RoundStatus;
  strokes: Stroke[];
  guesses: Guess[];
}

export interface RoomSnapshot {
  code: string;
  status: RoomStatus;
  hostId: string;
  participants: Participant[];
  currentRound: RoundSnapshot | null;
  availableWords: string[];
  roles: ParticipantRole[];
  scores: Record<string, number>;
}

export interface RoomSessionResponse {
  participantId: string;
  room: RoomSnapshot;
}
