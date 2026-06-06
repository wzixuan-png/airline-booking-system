"use client";

import { useState } from "react";

export default function CancelBookingButton({ reference }: { reference: string }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function cancelBooking() {
    const ok = window.confirm(`Cancel booking ${reference}? This cannot be undone.`);
    if (!ok) return;

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(`/api/bookings/${encodeURIComponent(reference)}`, {
        method: "DELETE"
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Cancellation failed.");
      }

      setMessage(`Booking ${reference} cancelled successfully.`);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Cancellation failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="action-stack">
      <button className="danger" type="button" disabled={loading} onClick={cancelBooking}>
        {loading ? "Cancelling..." : "Cancel this booking"}
      </button>

      {message && <p className="hint success-text">{message}</p>}
    </div>
  );
}