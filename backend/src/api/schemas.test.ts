import { describe, expect, it } from "vitest";
import { z } from "zod";
import {
  canvasClearSchema,
  canvasStrokeSchema,
  createRoomSchema,
  guessSubmissionSchema,
  joinRoomSchema,
  roomCodeParamsSchema,
  roomViewerQuerySchema,
  startRoomSchema
} from "./schemas.js";

describe("createRoomSchema", () => {
  it("accepts a valid name", () => {
    expect(createRoomSchema.parse({ playerName: "Alice" })).toEqual({ playerName: "Alice" });
  });

  it("rejects empty string", () => {
    expect(() => createRoomSchema.parse({ playerName: "" })).toThrow(z.ZodError);
  });

  it("rejects whitespace-only string after trim", () => {
    expect(() => createRoomSchema.parse({ playerName: "   " })).toThrow(z.ZodError);
  });

  it("rejects missing field", () => {
    expect(() => createRoomSchema.parse({})).toThrow(z.ZodError);
  });
});

describe("joinRoomSchema", () => {
  it("accepts a valid name", () => {
    expect(joinRoomSchema.parse({ playerName: "Bob" })).toEqual({ playerName: "Bob" });
  });

  it("rejects empty string", () => {
    expect(() => joinRoomSchema.parse({ playerName: "" })).toThrow(z.ZodError);
  });
});

describe("roomCodeParamsSchema", () => {
  it("accepts a 4-letter code", () => {
    expect(roomCodeParamsSchema.parse({ code: "ABCD" })).toEqual({ code: "ABCD" });
  });

  it("rejects missing code", () => {
    expect(() => roomCodeParamsSchema.parse({})).toThrow(z.ZodError);
  });
});

describe("roomViewerQuerySchema", () => {
  it("accepts empty query", () => {
    expect(roomViewerQuerySchema.parse({})).toEqual({});
  });

  it("accepts participantId", () => {
    expect(roomViewerQuerySchema.parse({ participantId: "abc-123" })).toEqual({ participantId: "abc-123" });
  });
});

describe("startRoomSchema", () => {
  it("accepts a participantId", () => {
    expect(startRoomSchema.parse({ participantId: "abc-123" })).toEqual({ participantId: "abc-123" });
  });

  it("rejects empty participantId", () => {
    expect(() => startRoomSchema.parse({ participantId: "" })).toThrow(z.ZodError);
  });

  it("rejects missing participantId", () => {
    expect(() => startRoomSchema.parse({})).toThrow(z.ZodError);
  });
});

describe("canvasStrokeSchema", () => {
  it("accepts a valid stroke with 2+ points", () => {
    const data = { participantId: "p1", stroke: { points: [{ x: 0, y: 0 }, { x: 10, y: 20 }] } };
    expect(canvasStrokeSchema.parse(data)).toEqual(data);
  });

  it("accepts a stroke with 3+ points", () => {
    const data = { participantId: "p1", stroke: { points: [{ x: 0, y: 0 }, { x: 5, y: 5 }, { x: 10, y: 10 }] } };
    expect(canvasStrokeSchema.parse(data)).toEqual(data);
  });

  it("rejects stroke with 1 point", () => {
    expect(() =>
      canvasStrokeSchema.parse({ participantId: "p1", stroke: { points: [{ x: 0, y: 0 }] } })
    ).toThrow(z.ZodError);
  });

  it("rejects missing stroke", () => {
    expect(() => canvasStrokeSchema.parse({ participantId: "p1" })).toThrow(z.ZodError);
  });

  it("rejects missing participantId", () => {
    expect(() =>
      canvasStrokeSchema.parse({ stroke: { points: [{ x: 0, y: 0 }, { x: 1, y: 1 }] } })
    ).toThrow(z.ZodError);
  });
});

describe("canvasClearSchema", () => {
  it("accepts a participantId", () => {
    expect(canvasClearSchema.parse({ participantId: "p1" })).toEqual({ participantId: "p1" });
  });

  it("rejects empty participantId", () => {
    expect(() => canvasClearSchema.parse({ participantId: "" })).toThrow(z.ZodError);
  });
});

describe("guessSubmissionSchema", () => {
  it("accepts a valid guess", () => {
    const data = { participantId: "p1", text: "rocket" };
    expect(guessSubmissionSchema.parse(data)).toEqual(data);
  });

  it("rejects empty text", () => {
    expect(() => guessSubmissionSchema.parse({ participantId: "p1", text: "" })).toThrow(z.ZodError);
  });

  it("rejects missing text", () => {
    expect(() => guessSubmissionSchema.parse({ participantId: "p1" })).toThrow(z.ZodError);
  });

  it("rejects missing participantId", () => {
    expect(() => guessSubmissionSchema.parse({ text: "hello" })).toThrow(z.ZodError);
  });
});
