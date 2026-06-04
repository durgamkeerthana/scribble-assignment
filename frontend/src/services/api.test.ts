import { beforeEach, describe, expect, it, vi } from "vitest";
import { api, type Guess, type Stroke } from "./api";

describe("api service", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  function mockFetch(ok: boolean, data: unknown) {
    vi.mocked(fetch).mockResolvedValue({
      ok,
      json: () => Promise.resolve(data),
    } as unknown as Response);
  }

  function mockFetchError(status: number, message: string) {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status,
      json: () => Promise.resolve({ message }),
    } as unknown as Response);
  }

  // --- createRoom ---

  it("createRoom sends POST to /rooms with playerName", async () => {
    mockFetch(true, { participantId: "p1", room: { code: "ABCD" } });
    await api.createRoom("Alice");

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/rooms"),
      expect.objectContaining({ method: "POST", body: JSON.stringify({ playerName: "Alice" }) })
    );
  });

  it("createRoom returns RoomSessionResponse on success", async () => {
    const data = { participantId: "p1", room: { code: "ABCD", status: "lobby", participants: [] } };
    mockFetch(true, data);
    await expect(api.createRoom("Alice")).resolves.toEqual(data);
  });

  // --- joinRoom ---

  it("joinRoom sends POST to /rooms/:code/join with playerName", async () => {
    mockFetch(true, {});
    await api.joinRoom("ABCD", "Bob");

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/rooms/ABCD/join"),
      expect.objectContaining({ method: "POST", body: JSON.stringify({ playerName: "Bob" }) })
    );
  });

  it("joinRoom encodes the room code", async () => {
    mockFetch(true, {});
    await api.joinRoom("A B", "Bob");

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining(encodeURIComponent("A B")),
      expect.anything()
    );
  });

  // --- fetchRoom ---

  it("fetchRoom sends GET to /rooms/:code with participantId query param", async () => {
    mockFetch(true, { room: { code: "XYZW" } });
    await api.fetchRoom("XYZW", "p1");

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/rooms/XYZW?participantId=p1"),
      expect.anything()
    );
  });

  it("fetchRoom omits query when no participantId", async () => {
    mockFetch(true, { room: { code: "XYZW" } });
    await api.fetchRoom("XYZW");

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/rooms/XYZW"),
      expect.anything()
    );
    expect(fetch).toHaveBeenCalledWith(
      expect.not.stringContaining("participantId"),
      expect.anything()
    );
  });

  // --- startGame ---

  it("startGame sends POST to /rooms/:code/start", async () => {
    mockFetch(true, { room: { code: "ABCD", status: "active" } });
    await api.startGame("ABCD", "p1");

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/rooms/ABCD/start"),
      expect.objectContaining({ method: "POST", body: JSON.stringify({ participantId: "p1" }) })
    );
  });

  // --- addStroke ---

  it("addStroke sends POST to /rooms/:code/canvas with stroke", async () => {
    const stroke: Stroke = { points: [{ x: 0, y: 0 }, { x: 10, y: 20 }] };
    mockFetch(true, { round: { strokes: [stroke] } });
    await api.addStroke("ABCD", "p1", stroke);

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/rooms/ABCD/canvas"),
      expect.objectContaining({ method: "POST", body: JSON.stringify({ participantId: "p1", stroke }) })
    );
  });

  // --- clearCanvas ---

  it("clearCanvas sends POST to /rooms/:code/canvas/clear", async () => {
    mockFetch(true, { round: { strokes: [] } });
    await api.clearCanvas("ABCD", "p1");

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/rooms/ABCD/canvas/clear"),
      expect.objectContaining({ method: "POST", body: JSON.stringify({ participantId: "p1" }) })
    );
  });

  // --- submitGuess ---

  it("submitGuess sends POST to /rooms/:code/guess with text", async () => {
    const guessResponse = { guess: {} as Guess, isCorrect: true, score: 100, roundComplete: true };
    mockFetch(true, guessResponse);
    const result = await api.submitGuess("ABCD", "p1", "rocket");

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/rooms/ABCD/guess"),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ participantId: "p1", text: "rocket" })
      })
    );
    expect(result).toEqual(guessResponse);
  });

  // --- restartGame ---

  it("restartGame sends POST to /rooms/:code/restart", async () => {
    mockFetch(true, { room: { code: "ABCD", status: "lobby" } });
    await api.restartGame("ABCD", "p1");

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/rooms/ABCD/restart"),
      expect.objectContaining({ method: "POST", body: JSON.stringify({ participantId: "p1" }) })
    );
  });

  // --- error handling ---

  it("throws error on non-ok response with message", async () => {
    mockFetchError(400, "Bad request");
    await expect(api.createRoom("")).rejects.toThrow("Bad request");
  });

  it("throws generic error on non-ok response without message", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.reject(new Error("invalid json")),
    } as unknown as Response);

    await expect(api.fetchRoom("ABCD")).rejects.toThrow("Request failed");
  });

  it("throws error when network fails", async () => {
    vi.mocked(fetch).mockRejectedValue(new Error("Network error"));
    await expect(api.fetchRoom("ABCD")).rejects.toThrow("Network error");
  });
});
