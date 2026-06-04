import { describe, expect, it, vi, beforeEach } from "vitest";
import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { RoomStore, RoomStoreContext } from "../state/roomStore";
import { GuessForm } from "./GuessForm";
import type { RoomSnapshot } from "../services/api";

function renderInStore(element: React.ReactElement, store: RoomStore) {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => root.render(createElement(RoomStoreContext.Provider, { value: store }, element)));
  return { container, root, cleanup: () => { act(() => root.unmount()); document.body.removeChild(container); } };
}

function makeRoomSnapshot(overrides: Partial<RoomSnapshot> = {}): RoomSnapshot {
  return {
    code: "ABCD",
    status: "active",
    hostId: "h1",
    participants: [],
    currentRound: { roundNumber: 1, drawerId: "h1", secretWord: null, status: "drawing", strokes: [], guesses: [], remainingTime: 60 },
    availableWords: ["rocket"],
    roles: ["drawer", "guesser"],
    scores: {},
    ...overrides,
  };
}

describe("GuessForm", () => {
  let store: RoomStore;

  beforeEach(() => {
    store = new RoomStore();
    store.setRoomSession({ participantId: "g1", room: makeRoomSnapshot() });
  });

  it("renders input and submit button", () => {
    const { container, cleanup } = renderInStore(createElement(GuessForm), store);
    expect(container.querySelector("input")).not.toBeNull();
    expect(container.textContent).toContain("Submit Guess");
    cleanup();
  });

  it("shows error on empty submission", () => {
    const { container, root, cleanup } = renderInStore(createElement(GuessForm), store);
    const form = container.querySelector("form")!;
    act(() => form.dispatchEvent(new window.Event("submit", { bubbles: true })));
    expect(container.textContent).toContain("Guess cannot be empty");
    cleanup();
  });
});
