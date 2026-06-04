import { describe, expect, it } from "vitest";
import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { RoomCodeBadge } from "./RoomCodeBadge";

function render(element: React.ReactElement) {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => root.render(element));
  return { container, cleanup: () => { act(() => root.unmount()); document.body.removeChild(container); } };
}

describe("RoomCodeBadge", () => {
  it("displays the room code", () => {
    const { container, cleanup } = render(createElement(RoomCodeBadge, { code: "ABCD" }));
    expect(container.textContent).toContain("ABCD");
    cleanup();
  });

  it("shows label and hint text", () => {
    const { container, cleanup } = render(createElement(RoomCodeBadge, { code: "XYZW" }));
    expect(container.textContent).toContain("Room Code");
    expect(container.textContent).toContain("Share this code");
    cleanup();
  });
});
