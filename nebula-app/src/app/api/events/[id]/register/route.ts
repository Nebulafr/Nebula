import { NextRequest, NextResponse } from "next/server";
import { extractUserFromRequest } from "@/app/api/utils/extract-user";
import { EventService } from "@/app/api/services/event.service";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await extractUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { id } = await params;
    const result = await EventService.registerForEvent(user.id, id);
    return result;
  } catch (error) {
    console.error("Event registration error:", error);
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: error.message.includes("not found") ? 404 : 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to register for event" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await extractUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { id } = await params;
    const result = await EventService.unregisterFromEvent(user.id, id);
    return result;
  } catch (error) {
    console.error("Event unregistration error:", error);
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: error.message.includes("not found") ? 404 : 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to unregister from event" },
      { status: 500 }
    );
  }
}