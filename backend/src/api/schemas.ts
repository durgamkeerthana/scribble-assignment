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

export class HttpError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
  }
}
