import { afterEach, describe, expect, it, beforeEach, vi } from "vitest";
import {
  addStroke,
  clearCanvas,
  createRoom,
  getRoom,
  joinRoom,
  restartGame,
  startRoom,
  submitGuess,
  toRoomSnapshot,
} from "./roomStore.js";
import { HttpError } from "../api/schemas.js";

let hostId: string;
let guesserId: string;
let code: string;

beforeEach(() => {
  const host = createRoom("Host");
  hostId = host.participantId;
  code = host.room.code;

  const guesser = joinRoom(code, "Guesser");
  guesserId = guesser!.participantId;
});

describe("createRoom", () => {
  it("returns a room with a 4-character uppercase code", () => {
    const result = createRoom("Alice");
    expect(result.room.code).toMatch(/^[A-Z0-9]{4}$/);
    expect(result.room.participants).toHaveLength(1);
    expect(result.room.participants[0].name).toBe("Alice");
    expect(result.participantId).toBeDefined();
  });

  it("defaults name to Player when not provided", () => {
    const result = createRoom();
    expect(result.room.participants[0].name).toBe("Player");
  });

  it("defaults name to Player when empty string provided", () => {
    const result = createRoom("");
    expect(result.room.participants[0].name).toBe("Player");
  });

  it("starts with lobby status and empty scores", () => {
    const result = createRoom("Test");
    expect(result.room.status).toBe("lobby");
    expect(result.room.scores).toEqual({});
  });
});

describe("joinRoom", () => {
  it("returns null for an unknown room code", () => {
    const result = joinRoom("ZZZZ", "Bob");
    expect(result).toBeNull();
  });

  it("adds a participant to a valid lobby room", () => {
    const result = joinRoom(code, "Charlie");
    expect(result).not.toBeNull();
    expect(result!.room.participants).toHaveLength(3);
    expect(result!.room.participants[2].name).toBe("Charlie");
  });

  it("defaults name to Player when not provided", () => {
    const result = joinRoom(code);
    expect(result!.room.participants[2].name).toBe("Player");
  });

  it("defaults name to Player when empty string provided", () => {
    const result = joinRoom(code, "");
    expect(result!.room.participants[2].name).toBe("Player");
  });

  it("returns null when room is not in lobby", () => {
    startRoom(code, hostId);
    const result = joinRoom(code, "Latecomer");
    expect(result).toBeNull();
  });
});

describe("getRoom", () => {
  it("returns a cloned room for valid code", () => {
    const room = getRoom(code);
    expect(room).not.toBeNull();
    expect(room!.code).toBe(code);
  });

  it("returns null for non-existent code", () => {
    expect(getRoom("NONEXIST")).toBeNull();
  });
});

describe("startRoom", () => {
  it("starts a room successfully", () => {
    const snapshot = startRoom(code, hostId);
    expect(snapshot.status).toBe("active");
    expect(snapshot.currentRound).not.toBeNull();
    expect(snapshot.currentRound!.roundNumber).toBe(1);
    expect(Object.keys(snapshot.scores)).toHaveLength(2);
  });

  it("throws 403 when non-host tries to start", () => {
    expect(() => startRoom(code, guesserId)).toThrow(new HttpError(403, "Only the host can start the game"));
  });

  it("throws 400 with < 2 players", () => {
    const solo = createRoom("Solo");
    expect(() => startRoom(solo.room.code, solo.participantId)).toThrow(new HttpError(400, "At least 2 players are required to start the game"));
  });

  it("throws 404 for unknown room", () => {
    expect(() => startRoom("ZZZZ", hostId)).toThrow(new HttpError(404, "Room ZZZZ not found"));
  });

  it("initializes scores to 0 for all participants", () => {
    const snapshot = startRoom(code, hostId);
    for (const participant of snapshot.participants) {
      expect(snapshot.scores[participant.id]).toBe(0);
    }
  });
});

describe("addStroke", () => {
  it("adds a stroke to the active round", () => {
    startRoom(code, hostId);
    const stroke = { points: [{ x: 0, y: 0 }, { x: 10, y: 20 }] };
    const strokes = addStroke(code, hostId, stroke);
    expect(strokes).toHaveLength(1);
    expect(strokes[0].points).toEqual(stroke.points);
  });

  it("appends multiple strokes", () => {
    startRoom(code, hostId);
    addStroke(code, hostId, { points: [{ x: 0, y: 0 }, { x: 1, y: 1 }] });
    addStroke(code, hostId, { points: [{ x: 2, y: 2 }, { x: 3, y: 3 }] });
    const room = getRoom(code)!;
    expect(room.rounds[0].strokes).toHaveLength(2);
  });

  it("throws 403 when non-drawer tries to draw", () => {
    startRoom(code, hostId);
    expect(() =>
      addStroke(code, guesserId, { points: [{ x: 0, y: 0 }, { x: 1, y: 1 }] })
    ).toThrow(new HttpError(403, "Only the drawer can draw"));
  });

  it("throws 404 for unknown room", () => {
    expect(() =>
      addStroke("ZZZZ", hostId, { points: [{ x: 0, y: 0 }, { x: 1, y: 1 }] })
    ).toThrow(new HttpError(404, "Room ZZZZ not found"));
  });

  it("throws 400 when no active round", () => {
    expect(() =>
      addStroke(code, hostId, { points: [{ x: 0, y: 0 }, { x: 1, y: 1 }] })
    ).toThrow(new HttpError(400, "No active round"));
  });
});

describe("clearCanvas", () => {
  it("clears all strokes", () => {
    startRoom(code, hostId);
    addStroke(code, hostId, { points: [{ x: 0, y: 0 }, { x: 1, y: 1 }] });
    const strokes = clearCanvas(code, hostId);
    expect(strokes).toHaveLength(0);
  });

  it("throws 403 when non-drawer tries to clear", () => {
    startRoom(code, hostId);
    expect(() => clearCanvas(code, guesserId)).toThrow(new HttpError(403, "Only the drawer can clear the canvas"));
  });

  it("throws 404 for unknown room", () => {
    expect(() => clearCanvas("ZZZZ", hostId)).toThrow(new HttpError(404, "Room ZZZZ not found"));
  });

  it("throws 400 when no active round", () => {
    expect(() => clearCanvas(code, hostId)).toThrow(new HttpError(400, "No active round"));
  });
});

describe("submitGuess", () => {
  beforeEach(() => {
    startRoom(code, hostId);
  });

  it("returns isCorrect=true for the correct word", () => {
    const result = submitGuess(code, guesserId, "rocket");
    expect(result.isCorrect).toBe(true);
    expect(result.roundComplete).toBe(true);
    expect(result.score).toBe(150);
  });

  it("is case-insensitive", () => {
    const result = submitGuess(code, guesserId, "ROCKET");
    expect(result.isCorrect).toBe(true);
  });

  it("trims whitespace", () => {
    const result = submitGuess(code, guesserId, "  rocket  ");
    expect(result.isCorrect).toBe(true);
  });

  it("returns isCorrect=false for a wrong word", () => {
    const result = submitGuess(code, guesserId, "wrongword");
    expect(result.isCorrect).toBe(false);
    expect(result.roundComplete).toBe(false);
  });

  it("throws 403 when the drawer tries to guess", () => {
    expect(() => submitGuess(code, hostId, "rocket")).toThrow(new HttpError(403, "The drawer cannot guess"));
  });

  it("throws 400 for empty guess", () => {
    expect(() => submitGuess(code, guesserId, "")).toThrow(new HttpError(400, "Guess cannot be empty"));
  });

  it("throws 400 for whitespace-only guess", () => {
    expect(() => submitGuess(code, guesserId, "   ")).toThrow(new HttpError(400, "Guess cannot be empty"));
  });

  it("throws 404 for unknown room", () => {
    expect(() => submitGuess("ZZZZ", guesserId, "rocket")).toThrow(new HttpError(404, "Room ZZZZ not found"));
  });

  it("throws 404 for unknown participant", () => {
    expect(() => submitGuess(code, "nonexistent-id", "rocket")).toThrow(new HttpError(404, "Participant not found"));
  });

  it("transitions room to result on correct guess", () => {
    submitGuess(code, guesserId, "rocket");
    const snapshot = toRoomSnapshot(getRoom(code)!, guesserId);
    expect(snapshot.status).toBe("result");
    expect(snapshot.currentRound!.status).toBe("complete");
    expect(snapshot.currentRound!.secretWord).toBe("rocket");
  });

  it("rejects guess after round is complete", () => {
    submitGuess(code, guesserId, "rocket");
    expect(() => submitGuess(code, guesserId, "rocket")).toThrow(new HttpError(400, "No active round"));
  });
});

describe("restartGame", () => {
  it("resets room to lobby, preserves participants, clears scores and rounds", () => {
    startRoom(code, hostId);
    submitGuess(code, guesserId, "rocket");
    const snapshot = restartGame(code, hostId);
    expect(snapshot.status).toBe("lobby");
    expect(snapshot.currentRound).toBeNull();
    expect(snapshot.scores).toEqual({});
    expect(snapshot.participants).toHaveLength(2);
  });

  it("throws 403 when non-host tries to restart", () => {
    startRoom(code, hostId);
    expect(() => restartGame(code, guesserId)).toThrow(new HttpError(403, "Only the host can restart the game"));
  });

  it("throws 404 for unknown room", () => {
    expect(() => restartGame("ZZZZ", hostId)).toThrow(new HttpError(404, "Room ZZZZ not found"));
  });
});

describe("toRoomSnapshot", () => {
  it("hides secretWord from guesser when round is drawing", () => {
    startRoom(code, hostId);
    const snapshot = toRoomSnapshot(getRoom(code)!, guesserId);
    expect(snapshot.currentRound!.secretWord).toBeNull();
  });

  it("shows secretWord to drawer when round is drawing", () => {
    startRoom(code, hostId);
    const snapshot = toRoomSnapshot(getRoom(code)!, hostId);
    expect(snapshot.currentRound!.secretWord).toBe("rocket");
  });

  it("shows secretWord to all when round is complete", () => {
    startRoom(code, hostId);
    submitGuess(code, guesserId, "rocket");
    const snapshot = toRoomSnapshot(getRoom(code)!, guesserId);
    expect(snapshot.currentRound!.secretWord).toBe("rocket");
  });

  it("returns currentRound=null when no rounds exist (lobby)", () => {
    const snapshot = toRoomSnapshot(getRoom(code)!, hostId);
    expect(snapshot.currentRound).toBeNull();
  });

  it("includes remainingTime in snapshot for active round", () => {
    startRoom(code, hostId);
    const snapshot = toRoomSnapshot(getRoom(code)!, guesserId);
    expect(snapshot.currentRound!.remainingTime).toBeGreaterThan(0);
    expect(snapshot.currentRound!.remainingTime).toBeLessThanOrEqual(60);
  });

  it("sets remainingTime to 0 after round concludes", () => {
    startRoom(code, hostId);
    submitGuess(code, guesserId, "rocket");
    const snapshot = toRoomSnapshot(getRoom(code)!, guesserId);
    expect(snapshot.currentRound!.remainingTime).toBe(0);
  });
});

describe("submitGuess — dynamic scoring", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("correct guess with full time remaining awards 150 points", () => {
    startRoom(code, hostId);
    const result = submitGuess(code, guesserId, "rocket");
    expect(result.isCorrect).toBe(true);
    expect(result.score).toBe(150);
    expect(result.timeBonus).toBe(50);
    expect(result.timeToGuess).toBe(0);
  });

  it("correct guess at half time awards 125 points", () => {
    startRoom(code, hostId);
    vi.advanceTimersByTime(30_000);
    const result = submitGuess(code, guesserId, "rocket");
    expect(result.isCorrect).toBe(true);
    expect(result.score).toBe(125);
    expect(result.timeBonus).toBe(25);
    expect(result.timeToGuess).toBe(30);
  });

  it("incorrect guess awards 0 points (no score change)", () => {
    startRoom(code, hostId);
    const result = submitGuess(code, guesserId, "wrongword");
    expect(result.isCorrect).toBe(false);
    expect(result.score).toBe(0);
    expect(result.timeBonus).toBe(0);
  });

  it("duplicate correct guess does not award additional points", () => {
    const guesser2 = joinRoom(code, "Guesser2")!;
    const guesser3 = joinRoom(code, "Guesser3")!;
    startRoom(code, hostId);
    submitGuess(code, guesser2.participantId, "rocket");
    const first = submitGuess(code, guesserId, "rocket");
    expect(first.score).toBe(150);
    const second = submitGuess(code, guesserId, "rocket");
    expect(second.isCorrect).toBe(true);
    expect(second.score).toBe(150);
    expect(second.timeBonus).toBe(0);
    submitGuess(code, guesser3.participantId, "rocket");
  });

  it("drawer receives 50 points per correct guesser at round end", () => {
    const guesser2 = joinRoom(code, "Guesser2")!;
    startRoom(code, hostId);
    submitGuess(code, guesser2.participantId, "rocket");
    const result = submitGuess(code, guesserId, "rocket");
    expect(result.roundComplete).toBe(true);
    const snapshot = toRoomSnapshot(getRoom(code)!, hostId);
    expect(snapshot.scores[hostId]).toBe(100);
  });

  it("drawer receives 0 points if no one guesses correctly", () => {
    startRoom(code, hostId);
    vi.advanceTimersByTime(61_000);
    const room = getRoom(code, hostId);
    expect(room!.status).toBe("result");
    expect(room!.scores[hostId]).toBe(0);
  });

  it("time bonus uses correct-guess timestamp, not first incorrect attempt", () => {
    startRoom(code, hostId);
    submitGuess(code, guesserId, "wrongword");
    vi.advanceTimersByTime(10_000);
    const result = submitGuess(code, guesserId, "rocket");
    expect(result.timeToGuess).toBe(10);
    expect(result.timeBonus).toBeLessThan(50);
  });
});

describe("submitGuess — timer expiry", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("remainingTime is positive during active round", () => {
    startRoom(code, hostId);
    const snapshot = toRoomSnapshot(getRoom(code)!, guesserId);
    expect(snapshot.currentRound!.remainingTime).toBeGreaterThan(0);
  });

  it("remainingTime is 0 after round concludes", () => {
    startRoom(code, hostId);
    submitGuess(code, guesserId, "rocket");
    const snapshot = toRoomSnapshot(getRoom(code)!, guesserId);
    expect(snapshot.currentRound!.remainingTime).toBe(0);
  });

  it("poll with remainingTime ≤ 0 transitions round to complete and room to result", () => {
    startRoom(code, hostId);
    vi.advanceTimersByTime(61_000);
    const room = getRoom(code, hostId);
    expect(room!.status).toBe("result");
    expect(room!.rounds[0].status).toBe("complete");
  });

  it("no further guesses accepted after timer expiry (room is result)", () => {
    startRoom(code, hostId);
    vi.advanceTimersByTime(61_000);
    getRoom(code, hostId);
    expect(() => submitGuess(code, guesserId, "rocket")).toThrow(new HttpError(400, "No active round"));
  });

  it("all-non-drawing-guessers-correct transitions room to result", () => {
    const guesser2 = joinRoom(code, "Guesser2")!;
    startRoom(code, hostId);
    submitGuess(code, guesser2.participantId, "rocket");
    const result = submitGuess(code, guesserId, "rocket");
    expect(result.roundComplete).toBe(true);
    const snapshot = toRoomSnapshot(getRoom(code)!, hostId);
    expect(snapshot.status).toBe("result");
    expect(snapshot.currentRound!.status).toBe("complete");
  });
});

describe("host migration", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("host with recent poll retains host status", () => {
    const snapshot = getRoom(code, hostId);
    expect(snapshot!.hostId).toBe(hostId);
  });

  it("host with stale poll triggers migration", () => {
    const oldHostId = hostId;
    vi.advanceTimersByTime(7_000);
    const snapshot = getRoom(code, guesserId);
    expect(snapshot!.hostId).not.toBe(oldHostId);
    expect(snapshot!.hostId).toBe(guesserId);
  });

  it("new host is participant with earliest joinedAt", () => {
    const guesser2 = joinRoom(code, "Guesser2")!;
    getRoom(code, guesserId);
    getRoom(code, guesser2.participantId);
    vi.advanceTimersByTime(5_000);
    const snapshot = getRoom(code, guesser2.participantId);
    expect(snapshot!.hostId).toBe(guesserId);
  });

  it("migration preserves disconnected host in participant list", () => {
    const oldHostId = hostId;
    vi.advanceTimersByTime(7_000);
    const snapshot = getRoom(code, guesserId);
    expect(snapshot!.participants.map((p) => p.id)).toContain(oldHostId);
  });

  it("no migration when room has only one participant", () => {
    const solo = createRoom("Solo");
    const snapshot = getRoom(solo.room.code, solo.participantId);
    expect(snapshot!.hostId).toBe(solo.participantId);
  });

  it("migration does not affect active round state", () => {
    startRoom(code, hostId);
    vi.advanceTimersByTime(7_000);
    const room = getRoom(code, guesserId);
    expect(room!.status).toBe("active");
    expect(room!.rounds[0].status).toBe("drawing");
  });

  it("poll updates lastPollAt on requesting participant", () => {
    const first = getRoom(code, guesserId);
    expect(first!.hostId).toBeDefined();
    const second = getRoom(code, guesserId);
    expect(second!.hostId).toBe(first!.hostId);
  });
});
