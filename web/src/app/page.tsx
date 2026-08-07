"use client";

import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { useApp } from "@/context/AppContext";

export default function LandingPage() {
  const { session } = useApp();
  const cta = session ? "/app/" : "/signup/";

  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader />

      <main className="flex-1">
        <section className="container relative overflow-hidden pb-16 pt-14 sm:pt-20">
          <div className="hero-glow -left-20 top-0" />
          <div
            className="hero-glow -right-10 top-40 opacity-70"
            style={{
              background:
                "radial-gradient(circle, rgba(56,189,248,0.2), transparent 65%)",
            }}
          />

          <div className="relative grid items-center gap-12 lg:grid-cols-2">
            <div>
              <span className="badge mb-4">Sports · Pokémon · All cards</span>
              <h1 className="mt-3 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-[3.25rem]">
                Your cards.
                <span className="block bg-gradient-to-r from-teal-300 to-sky-400 bg-clip-text text-transparent">
                  True comps. Real collection.
                </span>
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-[var(--muted)]">
                Scan a card, confirm the match, open real market solds from the sources
                collectors actually use, and save everything under your account — with
                multiple collections and a live portfolio total.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href={cta} className="btn btn-primary">
                  {session ? "Open app" : "Create free account"}
                </Link>
                <Link href="/login/" className="btn btn-secondary">
                  Log in
                </Link>
              </div>
            </div>

            <div className="card relative overflow-hidden p-6 shadow-2xl shadow-teal-950/40">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-[var(--muted)]">Portfolio</p>
                  <p className="text-3xl font-semibold tracking-tight">Track every stack</p>
                </div>
                <span className="badge">True comps</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { name: "Main collection", d: "PC & keepers" },
                  { name: "Flip binder", d: "Inventory to move" },
                  { name: "Pokémon modern", d: "Sets & hits" },
                  { name: "Slabs", d: "Graded only" },
                ].map((c) => (
                  <div
                    key={c.name}
                    className="rounded-xl border border-[var(--border)] bg-black/20 p-3"
                  >
                    <p className="text-xs text-[var(--muted)]">{c.name}</p>
                    <p className="mt-1 font-semibold">{c.d}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-xl border border-teal-500/20 bg-teal-500/5 p-3 text-sm text-teal-100/90">
                Scan → confirm ID → open 130point / Goldin / eBay solds → save with a value you trust
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-[var(--border)] bg-black/20 py-16">
          <div className="container">
            <h2 className="text-center text-2xl font-semibold sm:text-3xl">
              Built the way collectors actually work
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-center text-[var(--muted)]">
              No fake portfolio numbers. Identify the card, pull real comps from market
              sources, save to the right collection.
            </p>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  t: "Fast scanner",
                  d: "Live camera, auto-scan when steady, or upload a photo. Confirm the match before anything is saved.",
                },
                {
                  t: "True comps",
                  d: "One tap into multi-marketplace solds (130point-style liquidity) and premium auction venues (Goldin).",
                },
                {
                  t: "Multiple collections",
                  d: "PC, flips, kids, set builds — unlimited collections under one login.",
                },
                {
                  t: "Portfolio total",
                  d: "Dashboard sums every collection so you always know the stack — only values you enter.",
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

        <section className="container py-16">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <h2 className="text-2xl font-semibold sm:text-3xl">Your pricing method</h2>
              <p className="mt-3 text-[var(--muted)]">
                Collectors research value with multi-venue sold comps and premium auction
                results. TrueComp Cards lets you choose how you think about that research —
                then opens the real sources so you&apos;re never guessing.
              </p>
              <ul className="mt-6 space-y-3 text-sm">
                <li className="flex gap-3">
                  <span className="badge shrink-0">130</span>
                  <span>
                    <strong className="text-white">Liquidity comps</strong> — multi-marketplace
                    solds (eBay-weighted), the way 130point-style tools work.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="badge badge-gold shrink-0">Gold</span>
                  <span>
                    <strong className="text-white">Premium auction</strong> — Goldin and high-end
                    venue bias for slabs and whales.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="badge shrink-0">Both</span>
                  <span>
                    <strong className="text-white">Combined</strong> — use both lenses, enter the
                    value you trust after you check solds.
                  </span>
                </li>
              </ul>
            </div>
            <div className="card">
              <p className="text-sm text-[var(--muted)]">How a lookup works</p>
              <ol className="mt-4 space-y-4 text-sm">
                {[
                  "Scan or search to identify the card",
                  "Open 130point, Goldin, or eBay sold in one tap",
                  "Enter the comps value you believe — or save with no value yet",
                  "Portfolio totals update from what you saved",
                ].map((step, i) => (
                  <li key={step} className="flex gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal-500/15 text-xs font-semibold text-teal-300">
                      {i + 1}
                    </span>
                    <span className="pt-0.5">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        <section className="border-t border-[var(--border)] py-16">
          <div className="container text-center">
            <h2 className="text-2xl font-semibold sm:text-3xl">Ready to track the stack?</h2>
            <p className="mx-auto mt-3 max-w-lg text-[var(--muted)]">
              Create an account, scan your first card, and build collections that actually
              mean something.
            </p>
            <Link href={cta} className="btn btn-primary mt-8">
              {session ? "Open dashboard" : "Get started free"}
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-[var(--border)] py-8">
        <div className="container flex flex-col items-center justify-between gap-3 text-sm text-[var(--muted)] sm:flex-row">
          <span>© {new Date().getFullYear()} TrueComp Cards · truecompcards.com</span>
          <span>Not affiliated with 130point, Goldin, eBay, or any grading company</span>
        </div>
      </footer>
    </div>
  );
}
