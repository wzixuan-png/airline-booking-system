import SearchFlights from "@/components/SearchFlights";

export default function SearchPage() {
  return (
    <section className="page-shell">
      <div className="section-heading">
        <p className="eyebrow">Flight search</p>
        <h1>Search scheduled flights</h1>
        <p>Choose an origin, destination, and real calendar date range. Results show remaining seats and route timing.</p>
      </div>
      <SearchFlights />
    </section>
  );
}
