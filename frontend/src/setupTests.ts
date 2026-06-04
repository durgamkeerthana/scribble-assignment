import { afterAll, beforeAll } from "vitest";

let originalConsoleError: typeof console.error;

beforeAll(() => {
  originalConsoleError = console.error;
  console.error = (...args: unknown[]) => {
    const msg = typeof args[0] === "string" ? args[0] : "";
    if (msg.includes("not configured to support act")) {
      return;
    }
    if (msg.includes("Inside a test was not wrapped in act")) {
      return;
    }
    originalConsoleError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalConsoleError;
});
