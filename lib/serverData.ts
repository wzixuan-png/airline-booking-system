import { ObjectId } from "mongodb";
import { getDb } from "./mongodb";
import { serialiseBookingWithSchedule, serialiseSchedule } from "./serialise";

export async function getScheduleById(id: string) {
  if (!ObjectId.isValid(id)) return null;
  const db = await getDb();
  const schedule = await db.collection("schedules").findOne({ _id: new ObjectId(id) });
  if (!schedule) return null;
  return serialiseSchedule(schedule);
}

export async function getBookingByReference(reference: string) {
  const db = await getDb();
  const ref = reference.trim().toUpperCase();
  const result = await db
    .collection("schedules")
    .aggregate([
      { $match: { "bookings.bookingRef": ref } },
      {
        $project: {
          flightNo: 1,
          routeId: 1,
          origin: 1,
          destination: 1,
          originName: 1,
          destinationName: 1,
          originTimeZone: 1,
          destinationTimeZone: 1,
          departureTime: 1,
          arrivalTime: 1,
          departureDateLocal: 1,
          aircraft: 1,
          price: 1,
          bookings: 1,
          booking: {
            $first: {
              $filter: {
                input: "$bookings",
                as: "booking",
                cond: { $eq: ["$$booking.bookingRef", ref] }
              }
            }
          }
        }
      }
    ])
    .next();

  if (!result || !result.booking) return null;
  return serialiseBookingWithSchedule(result);
}

export async function getBookingsByEmail(email: string) {
  const db = await getDb();
  const normalisedEmail = email.trim().toLowerCase();
  const rows = await db
    .collection("schedules")
    .aggregate([
      { $match: { "bookings.email": normalisedEmail } },
      {
        $project: {
          flightNo: 1,
          routeId: 1,
          origin: 1,
          destination: 1,
          originName: 1,
          destinationName: 1,
          originTimeZone: 1,
          destinationTimeZone: 1,
          departureTime: 1,
          arrivalTime: 1,
          departureDateLocal: 1,
          aircraft: 1,
          price: 1,
          bookings: 1,
          booking: {
            $first: {
              $filter: {
                input: "$bookings",
                as: "booking",
                cond: { $eq: ["$$booking.email", normalisedEmail] }
              }
            }
          }
        }
      },
      { $sort: { departureTime: 1 } }
    ])
    .toArray();

  return rows.filter((row) => row.booking).map(serialiseBookingWithSchedule);
}
