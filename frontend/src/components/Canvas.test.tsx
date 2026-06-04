import { describe, expect, it, vi } from "vitest";
import { act, createElement } from "react";
import { createRoot } from "react-dom/client";

function render(element: React.ReactElement) {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => root.render(element));
  return { container, root, cleanup: () => { act(() => root.unmount()); document.body.removeChild(container); } };
}

// Use dynamic import to avoid Canvas dependency at module level
async function createCanvas() {
  const { Canvas } = await import("./Canvas");
  return Canvas;
}

describe("Canvas", () => {
  it("renders a canvas element", async () => {
    const Canvas = await createCanvas();
    const { container, cleanup } = render(createElement(Canvas, { strokes: [], isDrawer: false }));
    expect(container.querySelector("canvas")).not.toBeNull();
    cleanup();
  });

  it("shows clear button when isDrawer is true", async () => {
    const Canvas = await createCanvas();
    const { container, cleanup } = render(createElement(Canvas, { strokes: [], isDrawer: true }));
    expect(container.textContent).toContain("Clear Canvas");
    cleanup();
  });

  it("hides clear button when isDrawer is false", async () => {
    const Canvas = await createCanvas();
    const { container, cleanup } = render(createElement(Canvas, { strokes: [], isDrawer: false }));
    expect(container.textContent).not.toContain("Clear Canvas");
    cleanup();
  });

  it("calls onClear when clear button clicked", async () => {
    const Canvas = await createCanvas();
    const onClear = vi.fn();
    const { container, cleanup } = render(createElement(Canvas, { strokes: [], isDrawer: true, onClear }));
    const button = container.querySelector("button")!;
    act(() => { button.click(); });
    expect(onClear).toHaveBeenCalledTimes(1);
    cleanup();
  });
});
