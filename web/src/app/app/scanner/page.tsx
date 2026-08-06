"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { DEMO_SCAN_CANDIDATES, dummyPriceForQuery } from "@/lib/store";
import { formatUsd, priceModeLabel } from "@/lib/format";
import type { PriceMode } from "@/lib/types";

type Phase = "idle" | "scanning" | "results" | "saved";

export default function ScannerPage() {
  const { user, addCard } = useApp();
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("idle");
  const [pick, setPick] = useState(0);
  const [collectionId, setCollectionId] = useState("");
  const [savedMsg, setSavedMsg] = useState("");

  const mode: PriceMode = user?.priceMode ?? "blend";

  const candidates = useMemo(() => {
    return DEMO_SCAN_CANDIDATES.map((c) => {
      const price = dummyPriceForQuery(`${c.catalogName} ${c.setName}`, mode);
      return { ...c, ...price };
    });
  }, [mode]);

  if (!user) return null;

  const activeCollectionId = collectionId || user.collections[0]?.id || "";
  const selected = candidates[pick];

  function startScan() {
    setPhase("scanning");
    setSavedMsg("");
    window.setTimeout(() => {
      setPick(0);
      setPhase("results");
    }, 1100);
  }

  function saveSelected() {
    if (!selected || !activeCollectionId) return;
    const raw = DEMO_SCAN_CANDIDATES[pick];
    addCard(activeCollectionId, {
      catalogName: selected.catalogName,
      setName: selected.setName,
      year: selected.year,
      category: selected.category,
      sport: "sport" in raw ? raw.sport : undefined,
      condition: selected.condition,
      grade: "grade" in raw ? raw.grade : undefined,
      grader: "grader" in raw ? raw.grader : undefined,
      quantity: 1,
      valueCents: selected.valueCents,
      sourceMode: mode,
      valueBreakdown: selected.breakdown,
      imageHint: selected.imageHint,
    });
    const colName = user!.collections.find((c) => c.id === activeCollectionId)?.name ?? "collection";
    setSavedMsg(`Saved ${selected.catalogName} → ${colName} at ${formatUsd(selected.valueCents)}`);
    setPhase("saved");
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold sm:text-3xl">Scanner</h1>
        <p className="mt-1 text-[var(--muted)]">
          Demo scanner — simulated identify in ~1s, then confirm and save. Real camera/ML
          comes later. Pricing uses your settings ({priceModeLabel(mode)}).
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <div>
          <div className="scan-frame">
            {phase === "scanning" && <div className="scan-line" />}
            <span className="relative z-10 text-5xl">
              {phase === "results" || phase === "saved" ? selected?.imageHint || "🃏" : "📷"}
            </span>
            <p className="relative z-10 px-4 text-center text-sm text-[var(--muted)]">
              {phase === "idle" && "Align card in frame"}
              {phase === "scanning" && "Identifying…"}
              {(phase === "results" || phase === "saved") && selected?.catalogName}
            </p>
          </div>
          <button
            type="button"
            className="btn btn-primary mt-4 w-full"
            onClick={startScan}
            disabled={phase === "scanning"}
          >
            {phase === "scanning" ? "Scanning…" : phase === "idle" ? "Capture & scan" : "Scan again"}
          </button>
        </div>

        <div className="space-y-4">
          <div className="card">
            <label className="label" htmlFor="save-col">
              Save to collection
            </label>
            <select
              id="save-col"
              className="input"
              value={activeCollectionId}
              onChange={(e) => setCollectionId(e.target.value)}
            >
              {user.collections.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {phase === "idle" && (
            <div className="card text-sm text-[var(--muted)]">
              Hit <strong className="text-white">Capture & scan</strong>. You&apos;ll get ranked
              candidates (top matches), pick the right card, see value, and save to a collection.
            </div>
          )}

          {phase === "scanning" && (
            <div className="card text-sm text-teal-200/90">
              On-device warp + embedding retrieve… ranking candidates…
            </div>
          )}

          {(phase === "results" || phase === "saved") && (
            <>
              <div className="card space-y-3">
                <p className="text-sm font-medium">Confirm match (top candidates)</p>
                {candidates.map((c, i) => (
                  <button
                    key={c.catalogName}
                    type="button"
                    onClick={() => setPick(i)}
                    className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition ${
                      pick === i
                        ? "border-teal-400/50 bg-teal-500/10"
                        : "border-[var(--border)] bg-black/20 hover:border-white/20"
                    }`}
                  >
                    <span className="text-2xl">{c.imageHint}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{c.catalogName}</p>
                      <p className="text-xs text-[var(--muted)]">
                        {c.year} · {c.setName} · {c.condition}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-teal-300">{formatUsd(c.valueCents)}</p>
                      <p className="text-[10px] text-[var(--muted)]">
                        {i === 0 ? "Best match" : `Alt #${i + 1}`}
                      </p>
                    </div>
                  </button>
                ))}
              </div>

              {selected && (
                <div className="card">
                  <p className="text-sm text-[var(--muted)]">Value breakdown ({priceModeLabel(mode)})</p>
                  <p className="mt-1 text-3xl font-semibold text-teal-300">
                    {formatUsd(selected.valueCents)}
                  </p>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                    <div className="rounded-lg border border-[var(--border)] bg-black/20 p-2">
                      <p className="text-xs text-[var(--muted)]">130point-style</p>
                      <p className="font-medium">
                        {formatUsd(selected.breakdown.oneThirtyPointCents)}
                      </p>
                    </div>
                    <div className="rounded-lg border border-[var(--border)] bg-black/20 p-2">
                      <p className="text-xs text-[var(--muted)]">Golden-style</p>
                      <p className="font-medium">{formatUsd(selected.breakdown.goldenCents)}</p>
                    </div>
                  </div>
                  {phase !== "saved" ? (
                    <button type="button" className="btn btn-primary mt-4 w-full" onClick={saveSelected}>
                      Save to collection
                    </button>
                  ) : (
                    <div className="mt-4 space-y-3">
                      <p className="rounded-lg border border-teal-500/30 bg-teal-500/10 px-3 py-2 text-sm text-teal-100">
                        {savedMsg}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <button type="button" className="btn btn-secondary" onClick={startScan}>
                          Scan another
                        </button>
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={() => router.push(`/app/collections/view/?id=${activeCollectionId}`)}
                        >
                          View collection
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
