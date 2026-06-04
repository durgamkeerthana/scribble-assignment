import { describe, expect, it } from "vitest";
import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { GameTimer } from "./GameTimer";

function render(element: React.ReactElement) {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => root.render(element));
  return { container, cleanup: () => { act(() => root.unmount()); document.body.removeChild(container); } };
}

describe("GameTimer", () => {
  it("renders remaining time as integer", () => {
    const { container, cleanup } = render(createElement(GameTimer, { remainingTime: 45.7 }));
    expect(container.textContent).toContain("45");
    expect(container.textContent).toContain("s");
    cleanup();
  });

  it("shows 0 when remainingTime is 0", () => {
    const { container, cleanup } = render(createElement(GameTimer, { remainingTime: 0 }));
    const text = container.textContent!;
    expect(text).toContain("0");
    expect(text).toContain("s");
    cleanup();
  });

  it("floors to 0 for negative values", () => {
    const { container, cleanup } = render(createElement(GameTimer, { remainingTime: -5 }));
    expect(container.textContent).toContain("0");
    cleanup();
  });
});
