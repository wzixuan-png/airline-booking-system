import { ObjectId, WithId } from "mongodb";
import { BookingWithSchedule, PublicSchedule, Schedule } from "./types";

export function serialiseSchedule(doc: WithId<any>): PublicSchedule {
  const bookings = Array.isArray(doc.bookings) ? doc.bookings : [];
  const capacity = doc.aircraft?.capacity ?? 0;
  return {
    _id: doc._id instanceof ObjectId ? doc._id.toString() : String(doc._id),
    flightNo: doc.flightNo,
    routeId: doc.routeId,
    origin: doc.origin,
    destination: doc.destination,
    originName: doc.originName,
    destinationName: doc.destinationName,
    originTimeZone: doc.originTimeZone,
    destinationTimeZone: doc.destinationTimeZone,
    departureTime: doc.departureTime instanceof Date ? doc.departureTime.toISOString() : doc.departureTime,
    arrivalTime: doc.arrivalTime instanceof Date ? doc.arrivalTime.toISOString() : doc.arrivalTime,
    departureDateLocal: doc.departureDateLocal,
    aircraft: doc.aircraft,
    price: doc.price,
    seatsBooked: bookings.length,
    seatsLeft: Math.max(capacity - bookings.length, 0)
  };
}

export function serialiseBookingWithSchedule(doc: any): BookingWithSchedule {
  const schedule = serialiseSchedule(doc);
  return {
    schedule,
    booking: {
      bookingRef: doc.booking.bookingRef,
      title: doc.booking.title,
      firstName: doc.booking.firstName,
      lastName: doc.booking.lastName,
      email: doc.booking.email,
      phone: doc.booking.phone,
      createdAt: doc.booking.createdAt instanceof Date ? doc.booking.createdAt.toISOString() : doc.booking.createdAt
    }
  };
}

export function publicScheduleFromSchedule(schedule: Schedule): PublicSchedule {
  const { bookings = [], ...rest } = schedule;
  return {
    ...rest,
    seatsBooked: bookings.length,
    seatsLeft: Math.max(schedule.aircraft.capacity - bookings.length, 0)
  };
}
