import { z } from "zod";
import SchemaHelper from "../../../utils/schema_helper"

export const ShortenRequestSchema = z
  .object({
    originalUrl: SchemaHelper.urlSchema,
    
    isQr: z.boolean().optional().default(false),

    activateAt: SchemaHelper.dateSchema.optional(),

    expiresAt: SchemaHelper.dateSchema.optional(),

    customAlias: z
      .string()
      .min(3, "customAlias must be at least 3 characters")
      .max(7, "customAlias must be at most 7 characters")
      .regex(/^[A-Za-z0-9_-]+$/, "customAlias can only contain A-Za-z0-9-_")
      .optional(),

    password: z
      .string()
      .min(6, "password must be at least 6 characters")
      .optional(),
  })
  .refine(
    (data) =>
      !data.activateAt ||
      !data.expiresAt ||
      data.expiresAt > data.activateAt,
    {
      message: "expiresAt must be greater than activateAt",
      path: ["expiresAt"],
    }
  );

export type ShortenRequestDTO = z.infer<typeof ShortenRequestSchema>;
