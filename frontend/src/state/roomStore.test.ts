import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { RoomStore } from "./roomStore";
import type { RoomSessionResponse, RoomSnapshot } from "../services/api";

const { mockApi } = vi.hoisted(() => ({
  mockApi: {
    createRoom: vi.fn(),
    joinRoom: vi.fn(),
    fetchRoom: vi.fn(),
    startGame: vi.fn(),
    addStroke: vi.fn(),
    clearCanvas: vi.fn(),
    submitGuess: vi.fn(),
    restartGame: vi.fn(),
  },
}));

vi.mock("../services/api", () => ({ api: mockApi }));

function makeRoomSnapshot(overrides: Partial<RoomSnapshot> = {}): RoomSnapshot {
  return {
    code: "ABCD",
    status: "lobby",
    hostId: "host-1",
    participants: [{ id: "host-1", name: "Host", joinedAt: new Date().toISOString() }],
    currentRound: null,
    availableWords: ["rocket", "pizza"],
    roles: ["drawer", "guesser"],
    scores: {},
    ...overrides,
  };
}

describe("RoomStore", () => {
  let store: RoomStore;

  beforeEach(() => {
    store = new RoomStore();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // --- initial state ---

  it("starts with null room, null participantId, no error, not loading", () => {
    const snapshot = store.getSnapshot();
    expect(snapshot.room).toBeNull();
    expect(snapshot.participantId).toBeNull();
    expect(snapshot.error).toBeNull();
    expect(snapshot.isLoading).toBe(false);
  });

  // --- setRoomSession ---

  it("setRoomSession updates participantId and room", () => {
    const response: RoomSessionResponse = {
      participantId: "p1",
      room: makeRoomSnapshot(),
    };
    store.setRoomSession(response);
    const snapshot = store.getSnapshot();
    expect(snapshot.participantId).toBe("p1");
    expect(snapshot.room?.code).toBe("ABCD");
    expect(snapshot.error).toBeNull();
  });

  // --- setRoomSnapshot ---

  it("setRoomSnapshot updates room without changing participantId", () => {
    store.setRoomSession({ participantId: "p1", room: makeRoomSnapshot() });
    const updated = makeRoomSnapshot({ code: "XYZW" });
    store.setRoomSnapshot(updated);
    expect(store.getSnapshot().room?.code).toBe("XYZW");
    expect(store.getSnapshot().participantId).toBe("p1");
  });

  // --- createRoom ---

  it("createRoom calls api.createRoom and sets session", async () => {
    const response = { participantId: "p1", room: makeRoomSnapshot() };
    mockApi.createRoom.mockResolvedValue(response);

    const result = await store.createRoom("Alice");

    expect(mockApi.createRoom).toHaveBeenCalledWith("Alice");
    expect(result).toEqual(response);
    expect(store.getSnapshot().participantId).toBe("p1");
  });

  it("createRoom sets error on failure", async () => {
    mockApi.createRoom.mockRejectedValue(new Error("Creation failed"));
    await expect(store.createRoom("Alice")).rejects.toThrow("Creation failed");
    expect(store.getSnapshot().error).toBe("Creation failed");
  });

  it("createRoom sets isLoading during operation", async () => {
    let resolvePromise!: (value: RoomSessionResponse) => void;
    mockApi.createRoom.mockReturnValue(new Promise((resolve) => { resolvePromise = resolve; }));
    const promise = store.createRoom("Alice");
    expect(store.getSnapshot().isLoading).toBe(true);
    resolvePromise({ participantId: "p1", room: makeRoomSnapshot() });
    await promise;
    expect(store.getSnapshot().isLoading).toBe(false);
  });

  // --- joinRoom ---

  it("joinRoom calls api.joinRoom and sets session", async () => {
    const response = { participantId: "p2", room: makeRoomSnapshot() };
    mockApi.joinRoom.mockResolvedValue(response);
    const result = await store.joinRoom("ABCD", "Bob");
    expect(mockApi.joinRoom).toHaveBeenCalledWith("ABCD", "Bob");
    expect(result).toEqual(response);
    expect(store.getSnapshot().participantId).toBe("p2");
  });

  // --- fetchRoom ---

  it("fetchRoom returns null when no room is set", async () => {
    const result = await store.fetchRoom();
    expect(result).toBeNull();
  });

  it("fetchRoom calls api.fetchRoom and updates snapshot", async () => {
    const room = makeRoomSnapshot({ code: "ABCD", status: "active" });
    store.setRoomSession({ participantId: "p1", room: makeRoomSnapshot() });
    mockApi.fetchRoom.mockResolvedValue({ room });
    const result = await store.fetchRoom();
    expect(mockApi.fetchRoom).toHaveBeenCalledWith("ABCD", "p1");
    expect(result).toBe(room);
    expect(store.getSnapshot().room).toBe(room);
  });

  // --- startGame ---

  it("startGame calls api.startGame and updates room", async () => {
    const room = makeRoomSnapshot({ status: "active" });
    store.setRoomSession({ participantId: "p1", room: makeRoomSnapshot() });
    mockApi.startGame.mockResolvedValue({ room });
    const result = await store.startGame("ABCD", "p1");
    expect(mockApi.startGame).toHaveBeenCalledWith("ABCD", "p1");
    expect(result).toBe(room);
    expect(store.getSnapshot().room?.status).toBe("active");
  });

  // --- addStroke ---

  it("addStroke calls api.addStroke then fetchRoom", async () => {
    const stroke = { points: [{ x: 0, y: 0 }, { x: 10, y: 10 }] };
    const room = makeRoomSnapshot();
    store.setRoomSession({ participantId: "p1", room });
    mockApi.addStroke.mockResolvedValue({ round: { strokes: [stroke] } });
    mockApi.fetchRoom.mockResolvedValue({ room });
    await store.addStroke("ABCD", "p1", stroke);
    expect(mockApi.addStroke).toHaveBeenCalledWith("ABCD", "p1", stroke);
    expect(mockApi.fetchRoom).toHaveBeenCalled();
  });

  // --- clearCanvas ---

  it("clearCanvas calls api.clearCanvas then fetchRoom", async () => {
    const room = makeRoomSnapshot();
    store.setRoomSession({ participantId: "p1", room });
    mockApi.clearCanvas.mockResolvedValue({ round: { strokes: [] } });
    mockApi.fetchRoom.mockResolvedValue({ room });
    await store.clearCanvas("ABCD", "p1");
    expect(mockApi.clearCanvas).toHaveBeenCalledWith("ABCD", "p1");
    expect(mockApi.fetchRoom).toHaveBeenCalled();
  });

  // --- submitGuess ---

  it("submitGuess calls api.submitGuess then fetchRoom", async () => {
    const room = makeRoomSnapshot();
    store.setRoomSession({ participantId: "p2", room });
    const guessResult = { guess: {} as any, isCorrect: true, score: 100, roundComplete: false };
    mockApi.submitGuess.mockResolvedValue(guessResult);
    mockApi.fetchRoom.mockResolvedValue({ room });
    const result = await store.submitGuess("ABCD", "p2", "rocket");
    expect(mockApi.submitGuess).toHaveBeenCalledWith("ABCD", "p2", "rocket");
    expect(mockApi.fetchRoom).toHaveBeenCalled();
    expect(result).toEqual(guessResult);
  });

  // --- restartGame ---

  it("restartGame calls api.restartGame and sets room snapshot", async () => {
    const room = makeRoomSnapshot({ status: "lobby" });
    store.setRoomSession({ participantId: "host-1", room: makeRoomSnapshot({ status: "result" }) });
    mockApi.restartGame.mockResolvedValue({ room });
    const result = await store.restartGame("ABCD", "host-1");
    expect(mockApi.restartGame).toHaveBeenCalledWith("ABCD", "host-1");
    expect(result).toBe(room);
    expect(store.getSnapshot().room?.status).toBe("lobby");
  });

  it("fetchRoom includes remainingTime in snapshot", async () => {
    const updatedRoom = makeRoomSnapshot({
      status: "active",
      currentRound: { roundNumber: 1, drawerId: "host-1", secretWord: null, status: "drawing", strokes: [], guesses: [], remainingTime: 45 },
    });
    store.setRoomSession({ participantId: "p1", room: makeRoomSnapshot() });
    mockApi.fetchRoom.mockResolvedValue({ room: updatedRoom });
    await store.fetchRoom();
    expect(store.getSnapshot().room?.currentRound?.remainingTime).toBe(45);
  });

  it("detects hostId change via poll", async () => {
    const originalRoom = makeRoomSnapshot({ hostId: "host-1" });
    store.setRoomSession({ participantId: "p1", room: originalRoom });
    const migratedRoom = makeRoomSnapshot({ hostId: "p1" });
    mockApi.fetchRoom.mockResolvedValue({ room: migratedRoom });
    await store.fetchRoom();
    const snapshot = store.getSnapshot();
    expect(snapshot.room?.hostId).toBe("p1");
    expect(snapshot.room?.hostId).not.toBe("host-1");
  });

  // --- subscribe / listener ---

  it("subscribe notifies listeners on state change", () => {
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);
    store.setRoomSession({ participantId: "p1", room: makeRoomSnapshot() });
    expect(listener).toHaveBeenCalledTimes(1);
    unsubscribe();
    store.setRoomSession({ participantId: "p2", room: makeRoomSnapshot() });
    expect(listener).toHaveBeenCalledTimes(1);
  });
});
