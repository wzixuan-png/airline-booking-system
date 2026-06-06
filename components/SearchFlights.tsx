"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { airports } from "@/lib/airports";
import { formatDateTime, formatDurationMinutes, formatMoney, minutesBetween } from "@/lib/format";
import { PublicSchedule } from "@/lib/types";

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function isoDateAfter(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

export default function SearchFlights({ compact = false }: { compact?: boolean }) {
  const [origin, setOrigin] = useState("NZNE");
  const [destination, setDestination] = useState("YSSY");
  const [date1, setDate1] = useState(todayIso());
  const [date2, setDate2] = useState(isoDateAfter(30));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [schedules, setSchedules] = useState<PublicSchedule[]>([]);
  const [searched, setSearched] = useState(false);

  const airportOptions = useMemo(() => airports, []);

  async function fetchSchedules(nextOrigin = origin, nextDestination = destination, nextDate1 = date1, nextDate2 = date2) {
    setLoading(true);
    setError("");
    setSearched(true);

    try {
      const params = new URLSearchParams({ orig: nextOrigin, dest: nextDestination, date1: nextDate1, date2: nextDate2 });
      const response = await fetch(`/api/schedules?${params.toString()}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Search failed.");
      setSchedules(data.schedules || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed.");
    } finally {
      setLoading(false);
    }
  }

  function openNativeDatePicker(event: any) {
    const input = event.currentTarget as HTMLInputElement & { showPicker?: () => void };
    if (typeof input.showPicker !== "function") return;
    try {
      input.showPicker();
    } catch {
      // Some browsers only allow showPicker during specific user gestures.
      // Ignore the error and keep the normal native date input behavior.
    }
  }


  async function runSearch(event?: FormEvent) {
    event?.preventDefault();
    const params = new URLSearchParams({ orig: origin, dest: destination, date1, date2 });
    if (compact) {
      window.location.href = `/search?${params.toString()}`;
      return;
    }
    await fetchSchedules();
  }

  useEffect(() => {
    if (compact) return;
    const params = new URLSearchParams(window.location.search);
    const initialOrigin = params.get("orig") || origin;
    const initialDestination = params.get("dest") || destination;
    const initialDate1 = params.get("date1") || date1;
    const initialDate2 = params.get("date2") || date2;
    setOrigin(initialOrigin);
    setDestination(initialDestination);
    setDate1(initialDate1);
    setDate2(initialDate2);
    fetchSchedules(initialOrigin, initialDestination, initialDate1, initialDate2);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className={compact ? "search-panel compact" : "search-panel"}>
      <form className="search-form" onSubmit={runSearch}>
        <label>
          From
          <select value={origin} onChange={(event) => setOrigin(event.target.value)}>
            {airportOptions.map((airport) => (
              <option key={airport.code} value={airport.code}>
                {airport.shortName} ({airport.code})
              </option>
            ))}
          </select>
        </label>

        <label>
          To
          <select value={destination} onChange={(event) => setDestination(event.target.value)}>
            {airportOptions
              .filter((airport) => airport.code !== origin)
              .map((airport) => (
                <option key={airport.code} value={airport.code}>
                  {airport.shortName} ({airport.code})
                </option>
              ))}
          </select>
        </label>

        <label>
          Depart from
          <span className="date-field">
            <input
              type="date"
              value={date1}
              onClick={openNativeDatePicker}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") openNativeDatePicker(event);
              }}
              onChange={(event) => setDate1(event.target.value)}
            />
            <span className="date-icon" aria-hidden="true">▦</span>
          </span>
        </label>

        <label>
          Depart to
          <span className="date-field">
            <input
              type="date"
              value={date2}
              onClick={openNativeDatePicker}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") openNativeDatePicker(event);
              }}
              onChange={(event) => setDate2(event.target.value)}
            />
            <span className="date-icon" aria-hidden="true">▦</span>
          </span>
        </label>

        <button type="submit" disabled={loading || origin === destination}>
          {loading ? "Searching..." : "Search flights"}
        </button>
      </form>

      <p className="hint">
        Tip: use a wider date range for infrequent destinations such as Sydney, Chatham Islands, and Lake Tekapo.
      </p>

      {error && <p className="error">{error}</p>}

      {!compact && searched && schedules.length === 0 && !loading && (
        <div className="empty-state">
          <h3>No flights found</h3>
          <p>Try another destination or extend the date range. Some services operate only once or twice a week.</p>
        </div>
      )}

      {!compact && schedules.length > 0 && (
        <div className="results-grid">
          {schedules.map((schedule) => {
            const full = schedule.seatsLeft <= 0;
            return (
              <article className="flight-card" key={schedule._id}>
                <div className="flight-card-topline">
                  <span className="pill">{schedule.flightNo}</span>
                  <span className={full ? "seat-alert" : "seat-ok"}>
                    {full ? "Full" : `${schedule.seatsLeft} seats left`}
                  </span>
                </div>
                <div className="route-line">
                  <strong>{schedule.origin}</strong>
                  <span aria-hidden="true">→</span>
                  <strong>{schedule.destination}</strong>
                </div>
                <p className="muted">
                  {schedule.originName} to {schedule.destinationName}
                </p>
                <div className="flight-meta">
                  <div>
                    <span>Depart</span>
                    <strong>{formatDateTime(schedule.departureTime, schedule.originTimeZone)}</strong>
                  </div>
                  <div>
                    <span>Arrive</span>
                    <strong>{formatDateTime(schedule.arrivalTime, schedule.destinationTimeZone)}</strong>
                  </div>
                  <div>
                    <span>Duration</span>
                    <strong>{formatDurationMinutes(minutesBetween(schedule.departureTime, schedule.arrivalTime))}</strong>
                  </div>
                  <div>
                    <span>Aircraft</span>
                    <strong>{schedule.aircraft.type}</strong>
                  </div>
                </div>
                <div className="card-footer">
                  <span className="price">{formatMoney(schedule.price)}</span>
                  {full ? (
                    <button className="secondary" disabled>
                      Fully booked
                    </button>
                  ) : (
                    <Link className="button-link" href={`/book/${schedule._id}`}>
                      Book this flight
                    </Link>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
