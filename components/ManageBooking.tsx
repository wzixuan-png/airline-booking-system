"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function ManageBooking() {
  const router = useRouter();
  const [reference, setReference] = useState("");

  function openBooking(event: FormEvent) {
    event.preventDefault();
    const ref = reference.trim().toUpperCase();
    if (!ref) return;
    router.push(`/invoice/${encodeURIComponent(ref)}`);
  }

  return (
    <section className="card-section narrow">
      <form className="inline-form" onSubmit={openBooking}>
        <label>
          Booking reference
          <input value={reference} onChange={(event) => setReference(event.target.value)} placeholder="DF-ABC123" required />
        </label>
        <button type="submit">Open booking</button>
      </form>
      <p className="hint">Open the invoice page first, then use the cancellation button at the bottom of that page.</p>
    </section>
  );
}
