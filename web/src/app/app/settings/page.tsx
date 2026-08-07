"use client";

import { useApp } from "@/context/AppContext";
import type { PriceMode } from "@/lib/types";
import { priceModeLabel } from "@/lib/format";

const modes: { id: PriceMode; title: string; body: string }[] = [
  {
    id: "one_thirty_point",
    title: "Liquidity comps (130point-style)",
    body: "Multi-venue solds, eBay-weighted. Best for liquid modern raw and common graded.",
  },
  {
    id: "golden",
    title: "Premium auction (Goldin-style)",
    body: "High-end auction bias for slabs, low-pop, and premium pieces.",
  },
  {
    id: "blend",
    title: "Combined (recommended)",
    body: "Use both lenses when you research — then save the value you trust.",
  },
];

export default function SettingsPage() {
  const { user, setPriceMode } = useApp();
  if (!user) return null;

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold sm:text-3xl">Settings</h1>
        <p className="mt-1 text-[var(--muted)]">Account and comps preference</p>
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
            <dt className="text-[var(--muted)]">Comps preference</dt>
            <dd>{priceModeLabel(user.priceMode)}</dd>
          </div>
        </dl>
      </div>

      <div className="card space-y-3">
        <h2 className="font-semibold">Default comps lens</h2>
        <p className="text-sm text-[var(--muted)]">
          Guides which market sources we open first after a scan. Values in your portfolio
          are only what you enter from real solds — we never invent a price.
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
        <p className="font-medium text-white">About data</p>
        <p className="mt-2">
          Card identity uses on-device camera + text match against our catalog. Market value
          comes from sources you open (130point, Goldin, eBay sold) and optional values you
          save. TrueComp Cards is not affiliated with those services.
        </p>
      </div>
    </div>
  );
}
