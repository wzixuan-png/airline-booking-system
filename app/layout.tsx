import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dairy Flat Air",
  description: "Online booking system for a fictitious airline operating from Dairy Flat Airport."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <Link href="/" className="brand" aria-label="Dairy Flat Air home">
            <span className="brand-mark">DF</span>
            <span>Dairy Flat Air</span>
          </Link>
          <nav aria-label="Main navigation">
            <Link href="/search">Search flights</Link>
            <Link href="/customer">My trips</Link>
            <Link href="/manage">Cancel booking</Link>
          </nav>
        </header>
        <main>{children}</main>
        <footer className="site-footer">
          <p>Assignment 2  WANG ZIXUAN 24024996</p>
        </footer>
      </body>
    </html>
  );
}
