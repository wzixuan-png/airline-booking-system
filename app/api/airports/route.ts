import { NextResponse } from "next/server";
import { airports } from "@/lib/airports";

export async function GET() {
  return NextResponse.json({ airports });
}
