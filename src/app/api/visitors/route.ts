import { NextRequest, NextResponse } from "next/server";
import { getViewerCount, recordVisitor } from "@/lib/repositories/visitors";

export async function GET() {
  return NextResponse.json({ viewerCount: await getViewerCount() });
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { browserId?: unknown };

    if (typeof body.browserId !== "string") {
      return NextResponse.json({ error: "browserId is required" }, { status: 400 });
    }

    const result = await recordVisitor({
      browserId: body.browserId,
      userAgent: request.headers.get("user-agent")
    });

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Bad request";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
