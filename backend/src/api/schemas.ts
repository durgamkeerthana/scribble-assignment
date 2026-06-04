import { z } from "zod";

export const createRoomSchema = z.object({
  playerName: z.string().trim().min(1)
});

export const joinRoomSchema = z.object({
  playerName: z.string().trim().min(1)
});

export const roomCodeParamsSchema = z.object({
  code: z.string()
});

export const roomViewerQuerySchema = z.object({
  participantId: z.string().optional()
});

export const startRoomSchema = z.object({
  participantId: z.string().min(1)
});

export const pointSchema = z.object({
  x: z.number(),
  y: z.number()
});

export const strokeSchema = z.object({
  points: z.array(pointSchema).min(2)
});

export const canvasStrokeSchema = z.object({
  participantId: z.string().min(1),
  stroke: strokeSchema
});

export const canvasClearSchema = z.object({
  participantId: z.string().min(1)
});

export const guessSubmissionSchema = z.object({
  participantId: z.string().min(1),
  text: z.string().min(1, "Guess cannot be empty")
});

export class HttpError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
  }
}
