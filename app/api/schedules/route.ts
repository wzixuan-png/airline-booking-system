import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { serialiseSchedule } from "@/lib/serialise";

function addDays(date: Date, days: number) {
  const copy = new Date(date);
  copy.setUTCDate(copy.getUTCDate() + days);
  return copy;
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function isoDateAfter(days: number) {
  return addDays(new Date(), days).toISOString().slice(0, 10);
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const origin = searchParams.get("orig")?.trim().toUpperCase();
  const destination = searchParams.get("dest")?.trim().toUpperCase();
  const date1 = searchParams.get("date1") || todayIso();
  const date2 = searchParams.get("date2") || isoDateAfter(30);

  const query: Record<string, unknown> = {
    departureDateLocal: { $gte: date1, $lte: date2 }
  };

  if (origin) query.origin = origin;
  if (destination) query.destination = destination;

  const db = await getDb();
  const schedules = await db
    .collection("schedules")
    .find(query)
    .sort({ departureTime: 1 })
    .limit(200)
    .toArray();

  return NextResponse.json({ schedules: schedules.map(serialiseSchedule) });
}
