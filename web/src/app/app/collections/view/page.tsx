"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useApp } from "@/context/AppContext";
import { collectionTotalCents, formatUsd, priceModeLabel } from "@/lib/format";

function CollectionViewInner() {
  const search = useSearchParams();
  const id = search.get("id") || "";
  const { user, renameCol, deleteCard } = useApp();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");

  if (!user) return null;
  const col = user.collections.find((c) => c.id === id);
  if (!col) {
    return (
      <div className="card">
        <p>Collection not found.</p>
        <Link href="/app/collections/" className="mt-3 inline-block text-teal-300 hover:underline">
          ← Back to collections
        </Link>
      </div>
    );
  }

  const total = collectionTotalCents(col.cards);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/app/collections/" className="text-sm text-teal-300 hover:underline">
          ← Collections
        </Link>
        <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
          <div>
            {editing ? (
              <form
                className="flex flex-wrap gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  renameCol(col.id, name || col.name);
                  setEditing(false);
                }}
              >
                <input
                  className="input max-w-xs"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoFocus
                />
                <button type="submit" className="btn btn-primary !py-2 text-sm">
                  Save
                </button>
                <button
                  type="button"
                  className="btn btn-ghost !py-2 text-sm"
                  onClick={() => setEditing(false)}
                >
                  Cancel
                </button>
              </form>
            ) : (
              <>
                <h1 className="text-2xl font-semibold sm:text-3xl">{col.name}</h1>
                <button
                  type="button"
                  className="mt-1 text-sm text-[var(--muted)] hover:text-white"
                  onClick={() => {
                    setName(col.name);
                    setEditing(true);
                  }}
                >
                  Rename
                </button>
              </>
            )}
          </div>
          <div className="text-right">
            <p className="text-sm text-[var(--muted)]">Collection value</p>
            <p className="text-3xl font-semibold text-teal-300">{formatUsd(total)}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link href="/app/scanner/" className="btn btn-primary">
          Scan card into collection
        </Link>
      </div>

      {col.cards.length === 0 ? (
        <div className="card text-[var(--muted)]">
          Empty collection.{" "}
          <Link href="/app/scanner/" className="text-teal-300 hover:underline">
            Scan a card
          </Link>{" "}
          to add one.
        </div>
      ) : (
        <div className="card overflow-x-auto !p-0">
          <table className="table">
            <thead>
              <tr>
                <th className="pl-4">Card</th>
                <th>Condition</th>
                <th>Qty</th>
                <th>Pricing</th>
                <th className="text-right">Unit</th>
                <th className="pr-4 text-right">Line total</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {col.cards.map((c) => (
                <tr key={c.id}>
                  <td className="pl-4">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{c.imageHint || "🃏"}</span>
                      <div>
                        <p className="font-medium">{c.catalogName}</p>
                        <p className="text-xs text-[var(--muted)]">
                          {c.year} · {c.setName} · {c.category}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="text-sm">{c.condition}</td>
                  <td className="text-sm">{c.quantity}</td>
                  <td className="text-xs text-[var(--muted)]">{priceModeLabel(c.sourceMode)}</td>
                  <td className="text-right text-sm">{formatUsd(c.valueCents)}</td>
                  <td className="pr-4 text-right font-medium">
                    {formatUsd(c.valueCents == null ? null : c.valueCents * c.quantity)}
                  </td>
                  <td className="pr-3">
                    <button
                      type="button"
                      className="text-xs text-rose-300 hover:underline"
                      onClick={() => deleteCard(col.id, c.id)}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function CollectionViewPage() {
  return (
    <Suspense fallback={<div className="text-[var(--muted)]">Loading…</div>}>
      <CollectionViewInner />
    </Suspense>
  );
}
