"use client";

import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { collectionTotalCents, formatUsd, priceModeLabel } from "@/lib/format";

export default function DashboardPage() {
  const { user, portfolioCents } = useApp();
  if (!user) return null;

  const totalCards = user.collections.reduce((n, c) => n + c.cards.reduce((a, x) => a + x.quantity, 0), 0);
  const recent = user.collections
    .flatMap((c) => c.cards.map((card) => ({ ...card, collectionName: c.name, collectionId: c.id })))
    .sort((a, b) => b.addedAt.localeCompare(a.addedAt))
    .slice(0, 6);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold sm:text-3xl">
            Hey, {user.displayName}
          </h1>
          <p className="mt-1 text-[var(--muted)]">
            Pricing mode: {priceModeLabel(user.priceMode)}
          </p>
        </div>
        <Link href="/app/scanner" className="btn btn-primary">
          Scan a card
        </Link>
      </div>

      <div className="grid-stats">
        <div className="card">
          <p className="text-sm text-[var(--muted)]">Total portfolio value</p>
          <p className="mt-1 text-3xl font-semibold tracking-tight text-teal-300">
            {formatUsd(portfolioCents)}
          </p>
          <p className="mt-1 text-xs text-[var(--muted)]">Sum of all collections</p>
        </div>
        <div className="card">
          <p className="text-sm text-[var(--muted)]">Collections</p>
          <p className="mt-1 text-3xl font-semibold">{user.collections.length}</p>
          <Link href="/app/collections" className="mt-1 inline-block text-xs text-teal-300 hover:underline">
            Manage →
          </Link>
        </div>
        <div className="card">
          <p className="text-sm text-[var(--muted)]">Cards tracked</p>
          <p className="mt-1 text-3xl font-semibold">{totalCards}</p>
          <p className="mt-1 text-xs text-[var(--muted)]">Across every collection</p>
        </div>
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Your collections</h2>
          <Link href="/app/collections" className="text-sm text-teal-300 hover:underline">
            View all
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {user.collections.map((col) => {
            const total = collectionTotalCents(col.cards);
            const qty = col.cards.reduce((n, c) => n + c.quantity, 0);
            return (
              <Link
                key={col.id}
                href={`/app/collections/${col.id}`}
                className="card transition hover:border-teal-500/30"
              >
                <h3 className="font-semibold">{col.name}</h3>
                <p className="mt-2 text-2xl font-semibold text-teal-300">{formatUsd(total)}</p>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  {qty} card{qty === 1 ? "" : "s"} · {col.cards.length} line item
                  {col.cards.length === 1 ? "" : "s"}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Recently added</h2>
        {recent.length === 0 ? (
          <div className="card text-[var(--muted)]">
            No cards yet.{" "}
            <Link href="/app/scanner" className="text-teal-300 hover:underline">
              Scan your first card
            </Link>
            .
          </div>
        ) : (
          <div className="card overflow-x-auto !p-0">
            <table className="table">
              <thead>
                <tr>
                  <th className="pl-4">Card</th>
                  <th>Collection</th>
                  <th>Condition</th>
                  <th className="pr-4 text-right">Value</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((c) => (
                  <tr key={c.id}>
                    <td className="pl-4">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{c.imageHint || "🃏"}</span>
                        <div>
                          <p className="font-medium">{c.catalogName}</p>
                          <p className="text-xs text-[var(--muted)]">
                            {c.year} {c.setName}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="text-sm text-[var(--muted)]">{c.collectionName}</td>
                    <td className="text-sm">{c.condition}</td>
                    <td className="pr-4 text-right font-medium">
                      {formatUsd(c.valueCents * c.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
