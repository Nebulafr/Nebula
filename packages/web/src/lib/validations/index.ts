import { z } from "zod";

export * from "./auth";
export * from "./user";
export * from "./program";
export * from "./coach";
export * from "./student";
export * from "./enrollment";
export * from "./session";
export * from "./review";
export * from "./event";
export * from "./category";
export * from "./messaging";
export * from "./admin";
export * from "./contact";
export * from "./agents";
export * from "./checkout";

export function validateRequest<T>(schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const formattedError = error.errors
        .map((err) => `${err.path.join(".")}: ${err.message}`)
        .join(", ");
      throw new Error(`Validation failed: ${formattedError}`);
    }
    throw error;
  }
}
