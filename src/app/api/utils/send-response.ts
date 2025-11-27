import { NextResponse } from "next/server";
import { RESPONSE_CODE } from "@/types";

class SendResponse {
  success<T = any>(data: T, message: string = "Success", statusCode: number = 200) {
    return NextResponse.json(
      {
        success: true,
        code: RESPONSE_CODE.SUCCESS,
        message,
        data,
      },
      { status: statusCode }
    );
  }

  error(
    code: RESPONSE_CODE,
    message: string,
    statusCode: number = 500,
    error?: any
  ) {
    return NextResponse.json(
      {
        success: false,
        code,
        message,
        ...(process.env.NODE_ENV === "development" && error && { error }),
      },
      { status: statusCode }
    );
  }
}

const sendResponse = new SendResponse();
export default sendResponse;