import { NextResponse } from "next/server";
import { getSyncStatus } from "@/lib/repositories/catalog";
import { syncPublicHome } from "@/lib/scraper/sync";

export async function GET() {
  const status = await getSyncStatus();
  return NextResponse.json(status);
}

export async function POST() {
  const result = await syncPublicHome();
  return NextResponse.json(result);
}
