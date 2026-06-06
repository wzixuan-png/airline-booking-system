import Link from "next/link";
import { notFound } from "next/navigation";
import BookingForm from "@/components/BookingForm";
import { formatDateTime, formatDurationMinutes, formatMoney, minutesBetween } from "@/lib/format";
import { getScheduleById } from "@/lib/serverData";

export default async function BookPage({ params }: { params: { id: string } }) {
  const schedule = await getScheduleById(params.id);
  if (!schedule) notFound();
  const full = schedule.seatsLeft <= 0;

  return (
    <section className="page-shell split-layout">
      <article className="flight-card sticky-card">
        <div className="flight-card-topline">
          <span className="pill">{schedule.flightNo}</span>
          <span className={full ? "seat-alert" : "seat-ok"}>{full ? "Full" : `${schedule.seatsLeft} seats left`}</span>
        </div>
        <h1>{schedule.originName} → {schedule.destinationName}</h1>
        <div className="flight-meta">
          <div>
            <span>Departure</span>
            <strong>{formatDateTime(schedule.departureTime, schedule.originTimeZone)}</strong>
          </div>
          <div>
            <span>Arrival</span>
            <strong>{formatDateTime(schedule.arrivalTime, schedule.destinationTimeZone)}</strong>
          </div>
          <div>
            <span>Duration</span>
            <strong>{formatDurationMinutes(minutesBetween(schedule.departureTime, schedule.arrivalTime))}</strong>
          </div>
          <div>
            <span>Aircraft</span>
            <strong>{schedule.aircraft.type} ({schedule.aircraft.capacity} seats)</strong>
          </div>
          <div>
            <span>Price</span>
            <strong>{formatMoney(schedule.price)}</strong>
          </div>
        </div>
        <Link className="ghost-link" href="/search">← Back to search</Link>
      </article>

      <article className="card-section">
        <p className="eyebrow">Passenger details</p>
        <h2>Complete your booking</h2>
        {full ? (
          <div className="empty-state">
            <h3>This scheduled flight is full</h3>
            <p>Please return to the search page and choose another service.</p>
          </div>
        ) : (
          <BookingForm scheduleId={schedule._id} />
        )}
      </article>
    </section>
  );
}
