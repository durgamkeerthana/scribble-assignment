import { describe, expect, it } from "vitest";
import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { RoomStore, RoomStoreContext } from "../state/roomStore";
import { ResultPanel } from "./ResultPanel";
import type { RoomSnapshot } from "../services/api";

function renderInStore(element: React.ReactElement, store: RoomStore) {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => root.render(createElement(RoomStoreContext.Provider, { value: store }, element)));
  return { container, cleanup: () => { act(() => root.unmount()); document.body.removeChild(container); } };
}

function makeRoomSnapshot(overrides: Partial<RoomSnapshot> = {}): RoomSnapshot {
  return {
    code: "ABCD",
    status: "result",
    hostId: "h1",
    participants: [
      { id: "h1", name: "Host", joinedAt: new Date().toISOString() },
      { id: "g1", name: "Guesser1", joinedAt: new Date().toISOString() },
      { id: "g2", name: "Guesser2", joinedAt: new Date().toISOString() },
    ],
    currentRound: {
      roundNumber: 1,
      drawerId: "h1",
      secretWord: "rocket",
      status: "complete",
      strokes: [],
      guesses: [
        { participantId: "g1", participantName: "Guesser1", text: "rocket", isCorrect: true, timestamp: "t1", timeToGuess: 5 },
      ],
      remainingTime: 0,
    },
    availableWords: ["rocket"],
    roles: ["drawer", "guesser"],
    scores: { h1: 50, g1: 150, g2: 0 },
    ...overrides,
  };
}

describe("ResultPanel", () => {
  it("renders correct guessers with time-to-guess", () => {
    const store = new RoomStore();
    store.setRoomSession({ participantId: "g1", room: makeRoomSnapshot() });
    const { container, cleanup } = renderInStore(createElement(ResultPanel), store);
    expect(container.textContent).toContain("Guesser1");
    expect(container.textContent).toContain("5s");
    expect(container.textContent).toContain("✓");
    cleanup();
  });

  it("shows Did not guess for non-guessers", () => {
    const store = new RoomStore();
    store.setRoomSession({ participantId: "g1", room: makeRoomSnapshot() });
    const { container, cleanup } = renderInStore(createElement(ResultPanel), store);
    expect(container.textContent).toContain("Guesser2");
    expect(container.textContent).toContain("Did not guess");
    cleanup();
  });
});
