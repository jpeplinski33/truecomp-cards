"use client";

import { useApp } from "@/context/AppContext";
import type { PriceMode } from "@/lib/types";
import { priceModeLabel } from "@/lib/format";

const modes: { id: PriceMode; title: string; body: string }[] = [
  {
    id: "one_thirty_point",
    title: "130point-style",
    body: "Liquidity comps — multi-venue solds, eBay-weighted. Matches how 130point aggregates marketplaces.",
  },
  {
    id: "golden",
    title: "Golden / Goldin-style",
    body: "Premium auction bias — high-end venue comps (Goldin and similar). Better for slabs / whales.",
  },
  {
    id: "blend",
    title: "Combined (recommended)",
    body: "Default 70% liquidity + 30% premium. Transparent breakdown on every card.",
  },
];

export default function SettingsPage() {
  const { user, setPriceMode } = useApp();
  if (!user) return null;

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold sm:text-3xl">Settings</h1>
        <p className="mt-1 text-[var(--muted)]">Profile and pricing methodology</p>
      </div>

      <div className="card">
        <h2 className="font-semibold">Account</h2>
        <dl className="mt-3 space-y-2 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-[var(--muted)]">Name</dt>
            <dd>{user.displayName}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[var(--muted)]">Email</dt>
            <dd>{user.email}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[var(--muted)]">Active pricing</dt>
            <dd>{priceModeLabel(user.priceMode)}</dd>
          </div>
        </dl>
      </div>

      <div className="card space-y-3">
        <h2 className="font-semibold">Default value source</h2>
        <p className="text-sm text-[var(--muted)]">
          Used for new scans. Demo numbers are simulated; production will use licensed comps.
        </p>
        {modes.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setPriceMode(m.id)}
            className={`w-full rounded-xl border p-4 text-left transition ${
              user.priceMode === m.id
                ? "border-teal-400/50 bg-teal-500/10"
                : "border-[var(--border)] bg-black/20 hover:border-white/20"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <p className="font-medium">{m.title}</p>
              {user.priceMode === m.id && <span className="badge">Active</span>}
            </div>
            <p className="mt-1 text-sm text-[var(--muted)]">{m.body}</p>
          </button>
        ))}
      </div>

      <div className="card text-sm text-[var(--muted)]">
        <p className="font-medium text-white">Demo notice</p>
        <p className="mt-2">
          Accounts and collections are stored in this browser&apos;s localStorage only. Not
          affiliated with 130point, Goldin, Card Ladder, PSA, or any card brand.
        </p>
      </div>
    </div>
  );
}
