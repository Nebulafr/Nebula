import { sendError } from "./send-response";
import { ZodError } from "zod";
import HttpException from "./http-exception";

export default function catchError(fn: Function) {
  return async function (req: Request, context?: any) {
    try {
      return await fn(req, context);
    } catch (err: any) {
      console.error("API Error:", { err });

      if (err instanceof HttpException) {
        return sendError(err.message, err.statusCode, (err as any)?.code);
      }

      if (err instanceof ZodError) {
        const validationMessage = err.errors
          .map((e) => `${e.path.join(".")}: ${e.message}`)
          .join(", ");
        return sendError(
          `Validation failed: ${validationMessage}`,
          400,
          "VALIDATION_ERROR"
        );
      }
      return sendError("Internal server error", 500, "INTERNAL_SERVER_ERROR");
    }
  };
}
