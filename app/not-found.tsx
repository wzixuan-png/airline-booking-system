import Link from "next/link";

export default function NotFound() {
  return (
    <section className="page-shell">
      <div className="empty-state">
        <h1>Record not found</h1>
        <p>The scheduled flight or booking reference could not be found.</p>
        <Link className="button-link" href="/search">Search flights</Link>
      </div>
    </section>
  );
}
