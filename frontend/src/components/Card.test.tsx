import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { Card } from "./Card";

function render(element: React.ReactElement) {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => root.render(element));
  return { container, root, cleanup: () => { act(() => root.unmount()); document.body.removeChild(container); } };
}

describe("Card", () => {
  it("renders title", () => {
    const { container, cleanup } = render(createElement(Card, { title: "My Card" }, "Content"));
    expect(container.textContent).toContain("My Card");
    expect(container.textContent).toContain("Content");
    cleanup();
  });

  it("renders badge when provided", () => {
    const { container, cleanup } = render(createElement(Card, { title: "Card", badge: "New" }));
    expect(container.textContent).toContain("New");
    cleanup();
  });

  it("does not render badge when not provided", () => {
    const { container, cleanup } = render(createElement(Card, { title: "Card" }));
    expect(container.querySelector(".card__badge")).toBeNull();
    cleanup();
  });

  it("renders footer when provided", () => {
    const { container, cleanup } = render(createElement(Card, { title: "Card", footer: createElement("span", null, "Footer") }));
    expect(container.querySelector(".card__footer")).not.toBeNull();
    expect(container.textContent).toContain("Footer");
    cleanup();
  });

  it("does not render footer when not provided", () => {
    const { container, cleanup } = render(createElement(Card, { title: "Card" }));
    expect(container.querySelector(".card__footer")).toBeNull();
    cleanup();
  });
});
