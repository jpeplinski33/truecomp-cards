"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useApp } from "@/context/AppContext";
import { collectionTotalCents, formatUsd } from "@/lib/format";

export default function CollectionsPage() {
  const { user, addCollection, removeCol } = useApp();
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  if (!user) return null;

  function onCreate(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    addCollection(name.trim());
    setName("");
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold sm:text-3xl">Collections</h1>
        <p className="mt-1 text-[var(--muted)]">
          Multiple collections under your profile. Totals roll up on the dashboard.
        </p>
      </div>

      <form onSubmit={onCreate} className="card flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label className="label" htmlFor="col-name">
            New collection name
          </label>
          <input
            id="col-name"
            className="input"
            placeholder="e.g. Flip binder, PC, Kids Pokémon"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <button type="submit" className="btn btn-primary shrink-0">
          Create collection
        </button>
      </form>

      {error && (
        <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
          {error}
        </p>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {user.collections.map((col) => {
          const total = collectionTotalCents(col.cards);
          const qty = col.cards.reduce((n, c) => n + c.quantity, 0);
          return (
            <div key={col.id} className="card flex flex-col">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold">{col.name}</h2>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    {qty} cards · created {new Date(col.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <p className="text-xl font-semibold text-teal-300">{formatUsd(total)}</p>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link href={`/app/collections/${col.id}`} className="btn btn-secondary !py-1.5 text-sm">
                  Open
                </Link>
                <Link href="/app/scanner" className="btn btn-ghost !py-1.5 text-sm">
                  Scan into…
                </Link>
                <button
                  type="button"
                  className="btn btn-danger !py-1.5 text-sm"
                  onClick={() => {
                    setError("");
                    const res = removeCol(col.id);
                    if (!res.ok) setError(res.error);
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
