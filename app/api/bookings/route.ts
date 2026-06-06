import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { makeBookingRef } from "@/lib/bookingRefs";
import { getDb } from "@/lib/mongodb";
import { getBookingsByEmail } from "@/lib/serverData";

function cleanString(value: unknown) {
  return String(value ?? "").trim();
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

async function uniqueBookingRef(db: Awaited<ReturnType<typeof getDb>>) {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const ref = makeBookingRef();
    const exists = await db.collection("schedules").findOne({ "bookings.bookingRef": ref }, { projection: { _id: 1 } });
    if (!exists) return ref;
  }
  throw new Error("Could not generate a unique booking reference. Please try again.");
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");
  if (!email) {
    return NextResponse.json({ error: "Please provide an email query parameter." }, { status: 400 });
  }
  const bookings = await getBookingsByEmail(email);
  return NextResponse.json({ bookings });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const scheduleId = cleanString(body.scheduleId);
  const title = cleanString(body.title) || "Mr/Ms";
  const firstName = cleanString(body.firstName);
  const lastName = cleanString(body.lastName);
  const email = cleanString(body.email).toLowerCase();
  const phone = cleanString(body.phone);

  if (!ObjectId.isValid(scheduleId)) {
    return NextResponse.json({ error: "Invalid scheduled flight id." }, { status: 400 });
  }
  if (!firstName || !lastName || !isEmail(email)) {
    return NextResponse.json({ error: "Please enter a first name, last name, and valid email address." }, { status: 400 });
  }

  const db = await getDb();
  const scheduleObjectId = new ObjectId(scheduleId);
  const schedule = await db.collection("schedules").findOne({ _id: scheduleObjectId });
  if (!schedule) {
    return NextResponse.json({ error: "Scheduled flight not found." }, { status: 404 });
  }

  if (new Date(schedule.departureTime).getTime() < Date.now()) {
    return NextResponse.json({ error: "This flight has already departed." }, { status: 400 });
  }

  if ((schedule.bookings || []).some((booking: any) => booking.email === email)) {
    return NextResponse.json({ error: "This passenger is already booked on this scheduled flight." }, { status: 409 });
  }

  const bookingRef = await uniqueBookingRef(db);
  const booking = {
    bookingRef,
    title,
    firstName,
    lastName,
    email,
    phone,
    createdAt: new Date()
  };

  const updateResult = await db.collection("schedules").updateOne(
    {
      _id: scheduleObjectId,
      "bookings.email": { $ne: email },
      $expr: { $lt: [{ $size: { $ifNull: ["$bookings", []] } }, "$aircraft.capacity"] }
    },
    { $push: { bookings: booking } } as any
  );

  if (updateResult.modifiedCount !== 1) {
    return NextResponse.json({ error: "This scheduled flight is now full. Please select another flight." }, { status: 409 });
  }

  await db.collection("passengers").updateOne(
    { email },
    {
      $set: {
        title,
        firstName,
        lastName,
        email,
        phone,
        updatedAt: new Date()
      },
      $setOnInsert: { createdAt: new Date() },
      $addToSet: { bookingRefs: bookingRef }
    } as any,
    { upsert: true }
  );

  return NextResponse.json({ bookingRef }, { status: 201 });
}
