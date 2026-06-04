import { describe, expect, it } from "vitest";
import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { ResultPanel } from "./ResultPanel";

function render(element: React.ReactElement) {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => root.render(element));
  return { container, cleanup: () => { act(() => root.unmount()); document.body.removeChild(container); } };
}

describe("ResultPanel", () => {
  it("renders placeholder activity text", () => {
    const { container, cleanup } = render(createElement(ResultPanel));
    expect(container.textContent).toContain("Activity");
    expect(container.textContent).toContain("Game activity and guesses will appear here");
    cleanup();
  });
});
