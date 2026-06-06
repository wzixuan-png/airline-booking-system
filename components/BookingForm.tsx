"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function BookingForm({ scheduleId }: { scheduleId: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    const form = new FormData(event.currentTarget);

    const payload = {
      scheduleId,
      title: form.get("title"),
      firstName: form.get("firstName"),
      lastName: form.get("lastName"),
      email: form.get("email"),
      phone: form.get("phone")
    };

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Booking failed.");
      router.push(`/invoice/${data.bookingRef}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Booking failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="booking-form" onSubmit={handleSubmit}>
      <div className="form-grid small-first">
        <label>
          Title
          <select name="title" defaultValue="Mr">
            <option>Mr</option>
            <option>Mrs</option>
            <option>Miss</option>
            <option>Ms</option>
            <option>Dr</option>
          </select>
        </label>
        <label>
          First name
          <input name="firstName" required minLength={1} placeholder="Ella" />
        </label>
        <label>
          Last name
          <input name="lastName" required minLength={1} placeholder="Lee" />
        </label>
      </div>
      <div className="form-grid">
        <label>
          Email
          <input name="email" type="email" required placeholder="ella.lee@example.com" />
        </label>
        <label>
          Phone <span className="optional">optional</span>
          <input name="phone" type="tel" placeholder="+64 21 000 000" />
        </label>
      </div>
      {error && <p className="error">{error}</p>}
      <button type="submit" disabled={loading}>
        {loading ? "Creating booking..." : "Confirm booking"}
      </button>
      <p className="hint">No account is required. Your booking reference will be shown on the invoice page.</p>
    </form>
  );
}
