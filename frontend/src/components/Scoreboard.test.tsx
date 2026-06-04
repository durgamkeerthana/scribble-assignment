import { describe, expect, it } from "vitest";
import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { RoomStore, RoomStoreContext } from "../state/roomStore";
import { Scoreboard } from "./Scoreboard";
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
    participants: [
      { id: "h1", name: "Host", joinedAt: new Date().toISOString() },
      { id: "g1", name: "Guesser", joinedAt: new Date().toISOString() },
    ],
    currentRound: null,
    availableWords: ["rocket"],
    roles: ["drawer", "guesser"],
    scores: {},
    ...overrides,
  };
}

describe("Scoreboard", () => {
  it("shows Waiting when no participants", () => {
    const store = new RoomStore();
    store.setRoomSession({ participantId: "h1", room: makeRoomSnapshot({ participants: [] }) });
    const { container, cleanup } = renderInStore(createElement(Scoreboard), store);
    expect(container.textContent).toContain("Waiting for players");
    cleanup();
  });

  it("renders participant scores sorted descending", () => {
    const store = new RoomStore();
    store.setRoomSession({
      participantId: "h1",
      room: makeRoomSnapshot({
        scores: { h1: 50, g1: 200 },
      }),
    });
    const { container, cleanup } = renderInStore(createElement(Scoreboard), store);
    const text = container.textContent!;
    expect(text).toContain("Scoreboard");
    expect(text).toContain("Guesser");
    expect(text).toContain("200");
    expect(text).toContain("Host");
    expect(text).toContain("50");
    // Guesser (200) should appear before Host (50) — descending
    expect(text.indexOf("Guesser")).toBeLessThan(text.indexOf("Host"));
    cleanup();
  });
});
