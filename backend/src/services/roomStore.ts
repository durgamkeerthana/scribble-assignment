import { randomUUID } from "node:crypto";
import type { Guess, Participant, Room, RoomSnapshot, Round, Stroke } from "../models/game.js";
import { HttpError } from "../api/schemas.js";
import { ROUND_TIMER_SECONDS, STARTER_ROLES, STARTER_WORDS } from "../seed/starterData.js";

const rooms = new Map<string, Room>();

function now() {
  return new Date().toISOString();
}

function generateCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";

  for (let index = 0; index < 4; index += 1) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }

  return code;
}

function generateUniqueCode() {
  let code = generateCode();

  while (rooms.has(code)) {
    code = generateCode();
  }

  return code;
}

function displayName(name?: string) {
  return name || "Player";
}

function createParticipant(name?: string): Participant {
  return {
    id: randomUUID(),
    name: displayName(name),
    joinedAt: now(),
    lastPollAt: 0
  };
}

function cloneRoom(room: Room) {
  return structuredClone(room);
}

export function listWords() {
  return [...STARTER_WORDS];
}

export function createRoom(playerName?: string) {
  const participant = createParticipant(playerName);
  const room: Room = {
    code: generateUniqueCode(),
    status: "lobby",
    hostId: participant.id,
    participants: [participant],
    rounds: [],
    currentRoundNumber: 0,
    createdAt: now(),
    updatedAt: now(),
    scores: {}
  };

  rooms.set(room.code, room);

  return {
    room: cloneRoom(room),
    participantId: participant.id
  };
}

export function joinRoom(code: string, playerName?: string) {
  const room = rooms.get(code);

  if (!room || room.status !== "lobby") {
    return null;
  }

  const participant = createParticipant(playerName);
  room.participants.push(participant);
  room.updatedAt = now();
  rooms.set(room.code, room);

  return {
    room: cloneRoom(room),
    participantId: participant.id
  };
}

const HOST_MIGRATION_TIMEOUT_MS = 6_000;

function checkHostMigration(room: Room): void {
  const now = Date.now();
  const host = room.participants.find((p) => p.id === room.hostId);
  if (!host) return;

  if (host.lastPollAt > 0 && now - host.lastPollAt < HOST_MIGRATION_TIMEOUT_MS) {
    return;
  }

  if (room.participants.length < 2) return;

  const candidates = room.participants
    .filter(
      (p) =>
        p.id !== room.hostId &&
        p.lastPollAt > 0 &&
        now - p.lastPollAt < HOST_MIGRATION_TIMEOUT_MS
    )
    .sort((a, b) => a.joinedAt.localeCompare(b.joinedAt));

  if (candidates.length > 0) {
    room.hostId = candidates[0].id;
  }
}

export function getRoom(code: string, participantId?: string) {
  const room = rooms.get(code);
  if (!room) return null;

  if (participantId) {
    const participant = room.participants.find((p) => p.id === participantId);
    if (participant) {
      participant.lastPollAt = Date.now();
    }
  }

  if (room.status === "active" && room.rounds.length > 0) {
    const round = room.rounds[room.rounds.length - 1];
    if (round.status === "drawing") {
      const elapsed = (Date.now() - round.startedAt) / 1000;
      if (elapsed >= ROUND_TIMER_SECONDS) {
        round.status = "complete";
        room.status = "result";
        const nonDrawers = room.participants.filter((p) => p.id !== round.drawerId);
        const correctCount = nonDrawers.filter((p) =>
          round.guesses.some((g) => g.participantId === p.id && g.isCorrect)
        ).length;
        room.scores[round.drawerId] = (room.scores[round.drawerId] ?? 0) + correctCount * 50;
      }
    }
  }

  checkHostMigration(room);

  return cloneRoom(room);
}

export function saveRoom(room: Room) {
  room.updatedAt = now();
  rooms.set(room.code, cloneRoom(room));
  return getRoom(room.code);
}

function selectWord(roundNumber: number): string {
  return STARTER_WORDS[(roundNumber - 1) % STARTER_WORDS.length];
}

export function startRoom(code: string, participantId: string): RoomSnapshot {
  const room = rooms.get(code);

  if (!room) {
    throw new HttpError(404, `Room ${code} not found`);
  }

  if (room.hostId !== participantId) {
    throw new HttpError(403, "Only the host can start the game");
  }

  if (room.participants.length < 2) {
    throw new HttpError(400, "At least 2 players are required to start the game");
  }

  for (const participant of room.participants) {
    if (!participant.name.trim()) {
      throw new HttpError(400, "Player name cannot be empty");
    }
  }

  const roundNumber = 1;
  const round: Round = {
    roundNumber,
    drawerId: room.participants[0].id,
    secretWord: selectWord(roundNumber),
    status: "drawing",
    strokes: [],
    guesses: [],
    startedAt: Date.now()
  };

  room.scores = Object.fromEntries(room.participants.map((p) => [p.id, 0]));

  room.rounds.push(round);
  room.currentRoundNumber = roundNumber;
  room.status = "active";
  room.updatedAt = now();
  rooms.set(room.code, room);

  return toRoomSnapshot(cloneRoom(room), participantId);
}

function getActiveRound(room: Room): Round {
  if (room.status !== "active" || room.rounds.length === 0) {
    throw new HttpError(400, "No active round");
  }
  return room.rounds[room.rounds.length - 1];
}

export function addStroke(code: string, participantId: string, stroke: Stroke): Stroke[] {
  const room = rooms.get(code);

  if (!room) {
    throw new HttpError(404, `Room ${code} not found`);
  }

  const round = getActiveRound(room);

  if (round.drawerId !== participantId) {
    throw new HttpError(403, "Only the drawer can draw");
  }

  round.strokes.push(stroke);
  room.updatedAt = now();
  rooms.set(room.code, room);

  return [...round.strokes];
}

export function clearCanvas(code: string, participantId: string): Stroke[] {
  const room = rooms.get(code);

  if (!room) {
    throw new HttpError(404, `Room ${code} not found`);
  }

  const round = getActiveRound(room);

  if (round.drawerId !== participantId) {
    throw new HttpError(403, "Only the drawer can clear the canvas");
  }

  round.strokes = [];
  room.updatedAt = now();
  rooms.set(room.code, room);

  return [];
}

export function restartGame(code: string, participantId: string): RoomSnapshot {
  const room = rooms.get(code);

  if (!room) {
    throw new HttpError(404, `Room ${code} not found`);
  }

  if (room.hostId !== participantId) {
    throw new HttpError(403, "Only the host can restart the game");
  }

  room.status = "lobby";
  room.rounds = [];
  room.currentRoundNumber = 0;
  room.scores = {};
  for (const p of room.participants) {
    p.lastPollAt = 0;
  }
  room.updatedAt = now();
  rooms.set(room.code, room);

  return toRoomSnapshot(cloneRoom(room), participantId);
}

export function submitGuess(code: string, participantId: string, text: string): {
  guess: Guess;
  isCorrect: boolean;
  score: number;
  roundComplete: boolean;
  timeBonus: number;
  timeToGuess: number;
  drawerScore: number;
} {
  const room = rooms.get(code);

  if (!room) {
    throw new HttpError(404, `Room ${code} not found`);
  }

  const round = getActiveRound(room);

  if (round.drawerId === participantId) {
    throw new HttpError(403, "The drawer cannot guess");
  }

  const trimmed = text.trim();

  if (!trimmed) {
    throw new HttpError(400, "Guess cannot be empty");
  }

  const participant = room.participants.find((p) => p.id === participantId);

  if (!participant) {
    throw new HttpError(404, "Participant not found");
  }

  const isCorrect = trimmed.toLowerCase() === round.secretWord.toLowerCase();
  const alreadyCorrect = round.guesses.some(
    (g) => g.participantId === participantId && g.isCorrect
  );

  const elapsedSeconds = (Date.now() - round.startedAt) / 1000;
  const timeToGuess = Math.round(elapsedSeconds);
  const remainingTime = Math.max(0, ROUND_TIMER_SECONDS - Math.floor(elapsedSeconds));
  const timeBonus = (isCorrect && !alreadyCorrect) ? Math.round(50 * (remainingTime / ROUND_TIMER_SECONDS)) : 0;

  const guess: Guess = {
    participantId,
    participantName: participant.name,
    text: trimmed,
    isCorrect,
    timestamp: now(),
    timeToGuess
  };

  round.guesses.push(guess);

  let score = room.scores[participantId] ?? 0;

  if (isCorrect && !alreadyCorrect) {
    room.scores[participantId] = score + 100 + timeBonus;
    score = room.scores[participantId];
  }

  const nonDrawers = room.participants.filter((p) => p.id !== round.drawerId);
  const allCorrect = nonDrawers.every((p) =>
    round.guesses.some((g) => g.participantId === p.id && g.isCorrect)
  );

  let drawerScore = 0;
  let roundComplete = false;

  if (allCorrect) {
    round.status = "complete";
    room.status = "result";
    roundComplete = true;
    const correctCount = nonDrawers.filter((p) =>
      round.guesses.some((g) => g.participantId === p.id && g.isCorrect)
    ).length;
    drawerScore = correctCount * 50;
    room.scores[round.drawerId] = (room.scores[round.drawerId] ?? 0) + drawerScore;
  }

  room.updatedAt = now();
  rooms.set(room.code, room);

  return {
    guess,
    isCorrect,
    score,
    roundComplete,
    timeBonus,
    timeToGuess,
    drawerScore
  };
}

export function toRoomSnapshot(room: Room, viewerParticipantId?: string): RoomSnapshot {
  const currentRound = room.currentRoundNumber > 0
    ? room.rounds[room.rounds.length - 1]
    : null;

  const remainingTime = currentRound && currentRound.status === "drawing"
    ? Math.max(0, ROUND_TIMER_SECONDS - Math.floor((Date.now() - currentRound.startedAt) / 1000))
    : 0;

  return {
    code: room.code,
    status: room.status,
    hostId: room.hostId,
    participants: room.participants.map((participant) => ({ ...participant })),
    currentRound: currentRound
      ? {
          roundNumber: currentRound.roundNumber,
          drawerId: currentRound.drawerId,
          secretWord: currentRound.status === "complete" || viewerParticipantId === currentRound.drawerId
            ? currentRound.secretWord
            : null,
          status: currentRound.status,
          strokes: currentRound.strokes,
          guesses: currentRound.guesses,
          remainingTime
        }
      : null,
    availableWords: listWords(),
    roles: [...STARTER_ROLES],
    scores: { ...room.scores }
  };
}
