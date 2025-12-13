import { sendError } from "./send-response";

export default function catchError(fn: Function) {
  return async function (req: Request, context?: any) {
    try {
      return await fn(req, context);
    } catch (err: any) {
      console.error("API Error:", { err });

      if (err.name === "HttpException") {
        return sendError(err.message, err.statusCode, err.code);
      }
      return sendError("Internal server error", 500, "INTERNAL_SERVER_ERROR");
    }
  };
}
