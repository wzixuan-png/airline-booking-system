import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { getBookingByReference } from "@/lib/serverData";

export async function GET(_request: NextRequest, { params }: { params: { reference: string } }) {
  const booking = await getBookingByReference(params.reference);
  if (!booking) {
    return NextResponse.json({ error: "Booking reference not found." }, { status: 404 });
  }
  return NextResponse.json({ booking });
}

export async function DELETE(_request: NextRequest, { params }: { params: { reference: string } }) {
  const reference = params.reference.trim().toUpperCase();
  const db = await getDb();
  const schedule = await db.collection("schedules").findOne({ "bookings.bookingRef": reference });
  if (!schedule) {
    return NextResponse.json({ error: "Booking reference not found." }, { status: 404 });
  }

  const booking = (schedule.bookings || []).find((item: any) => item.bookingRef === reference);
  if (!booking) {
    return NextResponse.json({ error: "Booking reference not found." }, { status: 404 });
  }

  const result = await db.collection("schedules").updateOne(
    { _id: schedule._id, "bookings.bookingRef": reference },
    { $pull: { bookings: { bookingRef: reference } } } as any
  );

  await db.collection("passengers").updateOne(
    { email: booking.email },
    { $pull: { bookingRefs: reference }, $set: { updatedAt: new Date() } } as any
  );

  if (result.modifiedCount !== 1) {
    return NextResponse.json({ error: "Unable to cancel this booking." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, cancelled: reference });
}
