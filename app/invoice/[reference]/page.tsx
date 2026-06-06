import Link from "next/link";
import { notFound } from "next/navigation";
import CancelBookingButton from "@/components/CancelBookingButton";
import { formatDateTime, formatDurationMinutes, formatMoney, minutesBetween } from "@/lib/format";
import { getBookingByReference } from "@/lib/serverData";

export default async function InvoicePage({ params }: { params: { reference: string } }) {
  const record = await getBookingByReference(params.reference);
  if (!record) notFound();
  const { booking, schedule } = record;

  return (
    <section className="page-shell invoice-shell">
      <article className="invoice-card">
        <div className="invoice-header">
          <div>
            <p className="eyebrow">Booking invoice</p>
            <h1>{booking.bookingRef}</h1>
          </div>
          <span className="pill">Confirmed</span>
        </div>

        <div className="route-line invoice-route">
          <strong>{schedule.origin}</strong>
          <span aria-hidden="true">→</span>
          <strong>{schedule.destination}</strong>
        </div>
        <p className="muted">{schedule.originName} to {schedule.destinationName}</p>

        <div className="invoice-grid">
          <div>
            <span>Passenger</span>
            <strong>{booking.title} {booking.firstName} {booking.lastName}</strong>
          </div>
          <div>
            <span>Email</span>
            <strong>{booking.email}</strong>
          </div>
          <div>
            <span>Flight number</span>
            <strong>{schedule.flightNo}</strong>
          </div>
          <div>
            <span>Aircraft</span>
            <strong>{schedule.aircraft.type}</strong>
          </div>
          <div>
            <span>Departure</span>
            <strong>{formatDateTime(schedule.departureTime, schedule.originTimeZone)}</strong>
          </div>
          <div>
            <span>Arrival</span>
            <strong>{formatDateTime(schedule.arrivalTime, schedule.destinationTimeZone)}</strong>
          </div>
          <div>
            <span>Flight duration</span>
            <strong>{formatDurationMinutes(minutesBetween(schedule.departureTime, schedule.arrivalTime))}</strong>
          </div>
          <div>
            <span>Price</span>
            <strong>{formatMoney(schedule.price)}</strong>
          </div>
        </div>

        <div className="invoice-total">
          <span>Total due</span>
          <strong>{formatMoney(schedule.price)}</strong>
        </div>

        <div className="invoice-actions">
          <Link className="button-link" href="/search">Book another flight</Link>
          <Link className="ghost-link" href="/customer">View passenger trips</Link>
        </div>
        <CancelBookingButton reference={booking.bookingRef} />
      </article>
    </section>
  );
}
