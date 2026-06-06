import Link from "next/link";
import SearchFlights from "@/components/SearchFlights";

const timetable = [
  ["Sydney", "Fri outbound · Sun return", "SyberJet SJ30i · 6 seats"],
  ["Rotorua", "Twice each weekday", "Cirrus SF50 · 4 seats"],
  ["Great Barrier / Claris", "Mon/Wed/Fri outbound · Tue/Thu/Sat return", "Cirrus SF50 · 4 seats"],
  ["Chatham Islands / Tuuta", "Tue/Fri outbound · Wed/Sat return", "HondaJet Elite · 5 seats"],
  ["Lake Tekapo", "Mon outbound · Tue return", "HondaJet Elite · 5 seats"]
];

export default function HomePage() {
  return (
    <>
      <section className="hero">
        <div className="hero-content">
          <p className="eyebrow">Light jet services from Dairy Flat Airport</p>
          <h1>Book point-to-point flights across New Zealand and Sydney.</h1>
          <p className="hero-copy">
            Search real scheduled flights, reserve a seat, receive an invoice, cancel a booking,
            and view all trips connected to a passenger email.
          </p>
          <div className="hero-actions">
            <Link className="button-link" href="/search">Start search</Link>
            <Link className="ghost-link" href="/customer">Find my trips</Link>
          </div>
        </div>
        <div className="hero-card" aria-label="Flight network summary">
          <span className="large-stat">5</span>
          <span>specialised routes</span>
          <span className="large-stat">34</span>
          <span>flight legs per week</span>
        </div>
      </section>

      <section className="section-block">
        <div className="section-heading">
          <p className="eyebrow">Quick search</p>
          <h2>Find an available scheduled flight</h2>
        </div>
        <SearchFlights compact />
        <p className="center-note"><Link href="/search">Open full search results →</Link></p>
      </section>

      <section className="section-block">
        <div className="section-heading">
          <p className="eyebrow">Weekly timetable</p>
          <h2>Routes loaded as real calendar dates</h2>
          <p>Search across multiple weeks of scheduled flights using real calendar dates.</p>
        </div>
        <div className="timetable-grid">
          {timetable.map(([place, frequency, aircraft]) => (
            <article className="timetable-card" key={place}>
              <h3>{place}</h3>
              <p>{frequency}</p>
              <span>{aircraft}</span>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
