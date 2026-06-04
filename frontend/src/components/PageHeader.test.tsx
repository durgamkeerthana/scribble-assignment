import { describe, expect, it } from "vitest";
import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { PageHeader } from "./PageHeader";

function render(element: React.ReactElement) {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => root.render(element));
  return { container, root, cleanup: () => { act(() => root.unmount()); document.body.removeChild(container); } };
}

describe("PageHeader", () => {
  it("renders kicker, title, and description", () => {
    const { container, cleanup } = render(
      createElement(PageHeader, { kicker: "Info", title: "My Title", description: "A description" })
    );
    expect(container.textContent).toContain("Info");
    expect(container.textContent).toContain("My Title");
    expect(container.textContent).toContain("A description");
    cleanup();
  });
});
