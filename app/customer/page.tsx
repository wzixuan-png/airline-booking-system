import CustomerBookings from "@/components/CustomerBookings";

export default function CustomerPage() {
  return (
    <section className="page-shell">
      <div className="section-heading">
        <p className="eyebrow">Passenger lookup</p>
        <h1>Find all trips for a passenger</h1>
        <p>Use the email address entered at booking time to fetch every scheduled flight connected to that passenger.</p>
      </div>
      <CustomerBookings />
    </section>
  );
}
