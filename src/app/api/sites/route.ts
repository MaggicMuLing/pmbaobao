import { NextRequest, NextResponse } from "next/server";
import { getSites } from "@/lib/repositories/catalog";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const sites = await getSites({
    category: searchParams.get("category"),
    q: searchParams.get("q"),
    limit: Number(searchParams.get("limit") || 80),
    offset: Number(searchParams.get("offset") || 0)
  });

  return NextResponse.json({ sites });
}
