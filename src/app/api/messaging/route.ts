import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  return new Response("Messaging API is under construction.", { status: 501 });
}
