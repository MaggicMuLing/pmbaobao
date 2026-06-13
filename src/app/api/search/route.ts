import { NextRequest, NextResponse } from "next/server";
import { searchSites } from "@/lib/repositories/catalog";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q") ?? "";
  const sites = q.trim() ? await searchSites(q) : [];
  return NextResponse.json({ sites });
}
