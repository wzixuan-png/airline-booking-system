"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { formatDateTime, formatMoney } from "@/lib/format";
import { BookingWithSchedule } from "@/lib/types";

export default function CustomerBookings() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [bookings, setBookings] = useState<BookingWithSchedule[]>([]);
  const [searched, setSearched] = useState(false);

  async function search(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSearched(true);
    try {
      const response = await fetch(`/api/bookings?email=${encodeURIComponent(email)}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Search failed.");
      setBookings(data.bookings || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="card-section">
      <form className="inline-form" onSubmit={search}>
        <label>
          Passenger email
          <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required placeholder="ella.lee@example.com" />
        </label>
        <button type="submit" disabled={loading}>{loading ? "Checking..." : "Find bookings"}</button>
      </form>

      {error && <p className="error">{error}</p>}
      {searched && !loading && bookings.length === 0 && <p className="hint">No bookings were found for this email.</p>}

      {bookings.length > 0 && (
        <div className="results-grid compact-results">
          {bookings.map(({ booking, schedule }) => (
            <article className="flight-card" key={booking.bookingRef}>
              <div className="flight-card-topline">
                <span className="pill">{booking.bookingRef}</span>
                <span>{schedule.flightNo}</span>
              </div>
              <div className="route-line">
                <strong>{schedule.origin}</strong>
                <span aria-hidden="true">→</span>
                <strong>{schedule.destination}</strong>
              </div>
              <p className="muted">{booking.title} {booking.firstName} {booking.lastName}</p>
              <div className="flight-meta two-col">
                <div>
                  <span>Departure</span>
                  <strong>{formatDateTime(schedule.departureTime, schedule.originTimeZone)}</strong>
                </div>
                <div>
                  <span>Price</span>
                  <strong>{formatMoney(schedule.price)}</strong>
                </div>
              </div>
              <Link className="button-link" href={`/invoice/${booking.bookingRef}`}>Open invoice</Link>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
