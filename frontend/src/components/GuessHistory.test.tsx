import { describe, expect, it } from "vitest";
import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { RoomStore, RoomStoreContext } from "../state/roomStore";
import { GuessHistory } from "./GuessHistory";
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
    status: "active",
    hostId: "h1",
    participants: [],
    currentRound: null,
    availableWords: ["rocket"],
    roles: ["drawer", "guesser"],
    scores: {},
    ...overrides,
  };
}

describe("GuessHistory", () => {
  it("shows waiting message when no guesses yet", () => {
    const store = new RoomStore();
    store.setRoomSession({
      participantId: "g1",
      room: makeRoomSnapshot({
        currentRound: { roundNumber: 1, drawerId: "h1", secretWord: null, status: "drawing", strokes: [], guesses: [], remainingTime: 60 },
      }),
    });
    const { container, cleanup } = renderInStore(createElement(GuessHistory), store);
    expect(container.textContent).toContain("Waiting for guessers");
    cleanup();
  });

  it("renders guesses with name, text, and correct/incorrect badge", () => {
    const store = new RoomStore();
    store.setRoomSession({
      participantId: "g1",
      room: makeRoomSnapshot({
        currentRound: {
          roundNumber: 1,
          drawerId: "h1",
          secretWord: null,
          status: "drawing",
          strokes: [],
          remainingTime: 60,
          guesses: [
            { participantId: "g1", participantName: "Guesser", text: "rocket", isCorrect: true, timestamp: "t1", timeToGuess: 5 },
            { participantId: "g2", participantName: "Loser", text: "wrong", isCorrect: false, timestamp: "t2", timeToGuess: 10 },
          ],
        },
      }),
    });
    const { container, cleanup } = renderInStore(createElement(GuessHistory), store);
    const text = container.textContent!;
    expect(text).toContain("Guesser");
    expect(text).toContain("rocket");
    expect(text).toContain("✓");
    expect(text).toContain("Loser");
    expect(text).toContain("wrong");
    expect(text).toContain("✗");
    cleanup();
  });
});
