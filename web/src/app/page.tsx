"use client";

import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { useApp } from "@/context/AppContext";

export default function LandingPage() {
  const { session } = useApp();
  const cta = session ? "/app" : "/signup";

  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="container relative overflow-hidden pb-16 pt-14 sm:pt-20">
          <div className="hero-glow -left-20 top-0" />
          <div className="hero-glow -right-10 top-40 opacity-70" style={{ background: "radial-gradient(circle, rgba(56,189,248,0.2), transparent 65%)" }} />

          <div className="relative grid items-center gap-12 lg:grid-cols-2">
            <div>
              <span className="badge mb-4">Demo build · local accounts</span>
              <h1 className="mt-3 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-[3.25rem]">
                Know what your cards are worth.
                <span className="block bg-gradient-to-r from-teal-300 to-sky-400 bg-clip-text text-transparent">
                  Scan. Save. Track every collection.
                </span>
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-[var(--muted)]">
                Sports cards and Pokémon in one place. Values from multi-source comps
                (130point-style liquidity + Golden/Goldin-style premium), blended your way.
                Log in, scan, and watch portfolio totals update live.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href={cta} className="btn btn-primary">
                  {session ? "Go to dashboard" : "Create free account"}
                </Link>
                <Link href="/login" className="btn btn-secondary">
                  Log in
                </Link>
              </div>
              <p className="mt-4 text-sm text-[var(--muted)]">
                Dummy site for now — pricing and scanner are simulated. Domain TBD.
              </p>
            </div>

            <div className="card relative overflow-hidden p-6 shadow-2xl shadow-teal-950/40">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-[var(--muted)]">Portfolio value</p>
                  <p className="text-3xl font-semibold tracking-tight">$12,847</p>
                </div>
                <span className="badge badge-gold">Combined pricing</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { name: "Main collection", n: 48, v: "$9,420" },
                  { name: "PC / forever", n: 12, v: "$2,110" },
                  { name: "Flip binder", n: 31, v: "$890" },
                  { name: "Pokémon modern", n: 64, v: "$427" },
                ].map((c) => (
                  <div
                    key={c.name}
                    className="rounded-xl border border-[var(--border)] bg-black/20 p-3"
                  >
                    <p className="text-xs text-[var(--muted)]">{c.name}</p>
                    <p className="mt-1 font-semibold">{c.v}</p>
                    <p className="text-xs text-[var(--muted)]">{c.n} cards</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-xl border border-teal-500/20 bg-teal-500/5 p-3 text-sm text-teal-100/90">
                Scanner locked a PSA slab cert in under 1s · top-5 confirm · saved to Flip binder
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="border-t border-[var(--border)] bg-black/20 py-16">
          <div className="container">
            <h2 className="text-center text-2xl font-semibold sm:text-3xl">
              Built for collectors who want real numbers
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-center text-[var(--muted)]">
              Everything you asked for — card value, multi-collections under one profile,
              portfolio totals, and a scanner path that doesn&apos;t take forever.
            </p>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  t: "Instant card value",
                  d: "See estimated market value after identify — 130point-style, Golden-style, or combined.",
                },
                {
                  t: "Save to collections",
                  d: "Add any scanned or searched card to a collection with grade, qty, and comps snapshot.",
                },
                {
                  t: "Multiple collections",
                  d: "Main PC, flips, kids, set builds — unlimited collections under one login.",
                },
                {
                  t: "Portfolio total",
                  d: "Dashboard rolls up every collection so you always know the full stack value.",
                },
              ].map((f) => (
                <div key={f.t} className="card">
                  <h3 className="font-semibold">{f.t}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{f.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing modes */}
        <section className="container py-16">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <h2 className="text-2xl font-semibold sm:text-3xl">Your pricing methodology</h2>
              <p className="mt-3 text-[var(--muted)]">
                Charlie&apos;s tools: <strong className="text-white">130point</strong> aggregates
                eBay, Golden/Goldin, and other venues. You choose how we estimate value.
              </p>
              <ul className="mt-6 space-y-3 text-sm">
                <li className="flex gap-3">
                  <span className="badge shrink-0">130</span>
                  <span>
                    <strong>Liquidity comps</strong> — multi-venue solds, eBay-weighted
                    (130point-style).
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="badge badge-gold shrink-0">Gold</span>
                  <span>
                    <strong>Premium auction</strong> — Goldin / high-end venue bias
                    (Golden-style).
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="badge shrink-0">Blend</span>
                  <span>
                    <strong>Combined</strong> — default 70/30 liquidity + premium with transparent
                    breakdown.
                  </span>
                </li>
              </ul>
            </div>
            <div className="card">
              <p className="text-sm text-[var(--muted)]">Example · same card, three modes</p>
              <div className="mt-4 space-y-3">
                {[
                  { m: "130point-style", v: "$382", w: "85%" },
                  { m: "Golden-style", v: "$441", w: "62%" },
                  { m: "Combined", v: "$400", w: "100%" },
                ].map((row) => (
                  <div key={row.m}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span>{row.m}</span>
                      <span className="font-semibold">{row.v}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-white/5">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-teal-400 to-sky-400"
                        style={{ width: row.w }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-[var(--border)] py-16">
          <div className="container text-center">
            <h2 className="text-2xl font-semibold sm:text-3xl">Ready to track the stack?</h2>
            <p className="mx-auto mt-3 max-w-lg text-[var(--muted)]">
              Create an account, open the scanner, save cards into multiple collections, and
              watch totals update.
            </p>
            <Link href={cta} className="btn btn-primary mt-8">
              {session ? "Open dashboard" : "Start free — demo login"}
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-[var(--border)] py-8">
        <div className="container flex flex-col items-center justify-between gap-3 text-sm text-[var(--muted)] sm:flex-row">
          <span>TrueComp Cards · demo / dummy data · not affiliated with 130point or Goldin</span>
          <span>Local browser accounts only</span>
        </div>
      </footer>
    </div>
  );
}
