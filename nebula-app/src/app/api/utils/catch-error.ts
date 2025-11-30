import { RESPONSE_CODE } from "@/types";
import HttpException from "./http-exception";
import sendResponse from "./send-response";

export default function CatchError(fn: Function) {
  return async function (req: Request, context?: any) {
    try {
      return await fn(req, context);
    } catch (err: any) {
      const code = err.code || RESPONSE_CODE.ERROR;
      console.log(`😥 Error [${code}]: ${err?.message}`);
      console.log(err);
      if (err instanceof HttpException) {
        return sendResponse.error(err.code, err.message, err.statusCode, err);
      }

      return sendResponse.error(
        RESPONSE_CODE.INTERNAL_SERVER_ERROR,
        "INTERNAL SERVER ERROR",
        500,
        err
      );
    }
  };
}
