export type ParticipantRole = "drawer" | "guesser";
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
  status: "lobby" | "active";
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

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

async function request<T>(path: string, init?: RequestInit) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {})
    },
    ...init
  });

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => ({ message: "Request failed" }))) as {
      message?: string;
    };

    throw new Error(errorBody.message ?? "Request failed");
  }

  return (await response.json()) as T;
}

export const api = {
  createRoom(playerName: string) {
    return request<RoomSessionResponse>("/rooms", {
      method: "POST",
      body: JSON.stringify({ playerName })
    });
  },
  joinRoom(code: string, playerName: string) {
    return request<RoomSessionResponse>(`/rooms/${encodeURIComponent(code)}/join`, {
      method: "POST",
      body: JSON.stringify({ playerName })
    });
  },
  fetchRoom(code: string, participantId?: string) {
    const query = participantId ? `?participantId=${encodeURIComponent(participantId)}` : "";
    return request<{ room: RoomSnapshot }>(`/rooms/${encodeURIComponent(code)}${query}`);
  },
  startGame(code: string, participantId: string) {
    return request<{ room: RoomSnapshot }>(`/rooms/${encodeURIComponent(code)}/start`, {
      method: "POST",
      body: JSON.stringify({ participantId })
    });
  },
  addStroke(code: string, participantId: string, stroke: Stroke) {
    return request<{ round: { strokes: Stroke[] } }>(`/rooms/${encodeURIComponent(code)}/canvas`, {
      method: "POST",
      body: JSON.stringify({ participantId, stroke })
    });
  },
  clearCanvas(code: string, participantId: string) {
    return request<{ round: { strokes: Stroke[] } }>(`/rooms/${encodeURIComponent(code)}/canvas/clear`, {
      method: "POST",
      body: JSON.stringify({ participantId })
    });
  },
  submitGuess(code: string, participantId: string, text: string) {
    return request<{ guess: Guess; isCorrect: boolean; score: number }>(`/rooms/${encodeURIComponent(code)}/guess`, {
      method: "POST",
      body: JSON.stringify({ participantId, text })
    });
  }
};
