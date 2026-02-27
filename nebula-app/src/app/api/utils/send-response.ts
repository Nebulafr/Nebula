import { NextResponse } from "next/server";

 
export function sendSuccess<T = any>(
  data: T,
  message: string = "Success",
  status = 200
) {
  return NextResponse.json(
    {
      success: true,
      message,
      data,
    },
    { status }
  );
}

export function sendError(message: string, status = 400, code?: string) {
  return NextResponse.json(
    {
      success: false,
      error: message,
      message,
      code,
    },
    { status }
  );
}
