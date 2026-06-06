import ManageBooking from "@/components/ManageBooking";

export default function ManagePage() {
  return (
    <section className="page-shell">
      <div className="section-heading">
        <p className="eyebrow">Booking management</p>
        <h1>Cancel a booking</h1>
        <p>Enter a unique booking reference, open the invoice, and cancel the booking if required.</p>
      </div>
      <ManageBooking />
    </section>
  );
}
