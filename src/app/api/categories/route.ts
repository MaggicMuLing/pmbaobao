import { NextResponse } from "next/server";
import { getCatalog } from "@/lib/repositories/catalog";

export async function GET() {
  const catalog = await getCatalog();
  return NextResponse.json(catalog);
}
