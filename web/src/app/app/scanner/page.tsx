"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { dummyPriceForQuery } from "@/lib/store";
import { formatUsd, priceModeLabel } from "@/lib/format";
import { identifyFromImage } from "@/lib/identify";
import { searchCatalog, type MatchResult } from "@/lib/catalog";
import type { PriceMode } from "@/lib/types";

type Phase = "live" | "scanning" | "results" | "saved";

type PricedMatch = MatchResult & {
  valueCents: number;
  breakdown: { oneThirtyPointCents: number; goldenCents: number };
};

function priceMatch(m: MatchResult, mode: PriceMode): PricedMatch {
  const price = dummyPriceForQuery(`${m.catalogName} ${m.setName} ${m.year}`, mode);
  return { ...m, ...price };
}

export default function ScannerPage() {
  const { user, addCard } = useApp();
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const startingRef = useRef(false);

  const [phase, setPhase] = useState<Phase>("live");
  const [pick, setPick] = useState(0);
  const [collectionId, setCollectionId] = useState("");
  const [savedMsg, setSavedMsg] = useState("");
  const [capturedUrl, setCapturedUrl] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [statusMsg, setStatusMsg] = useState("");
  const [ocrText, setOcrText] = useState("");
  const [candidates, setCandidates] = useState<PricedMatch[]>([]);
  const [manualQuery, setManualQuery] = useState("");

  const mode: PriceMode = user?.priceMode ?? "blend";

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    const v = videoRef.current;
    if (v) {
      v.srcObject = null;
    }
    setCameraReady(false);
  }, []);

  const attachStream = useCallback(async (stream: MediaStream) => {
    streamRef.current = stream;
    const video = videoRef.current;
    if (!video) return;
    video.setAttribute("playsinline", "true");
    video.setAttribute("webkit-playsinline", "true");
    video.muted = true;
    video.playsInline = true;
    video.srcObject = stream;
    try {
      await video.play();
    } catch {
      // iOS sometimes needs a second play after metadata
      await new Promise((r) => setTimeout(r, 100));
      await video.play().catch(() => undefined);
    }
    setCameraReady(true);
  }, []);

  const startCamera = useCallback(
    async (facing: "environment" | "user" = facingMode) => {
      if (startingRef.current) return;
      startingRef.current = true;
      setCameraError(null);
      setCameraReady(false);
      stopCamera();

      if (typeof window === "undefined" || !navigator.mediaDevices?.getUserMedia) {
        setCameraError("Camera API unavailable. Use Safari or Chrome over HTTPS.");
        startingRef.current = false;
        return;
      }

      try {
        let stream: MediaStream | null = null;
        const attempts: MediaStreamConstraints[] = [
          {
            audio: false,
            video: {
              facingMode: { ideal: facing },
              width: { ideal: 1920 },
              height: { ideal: 1080 },
            },
          },
          {
            audio: false,
            video: { facingMode: facing },
          },
          { audio: false, video: true },
        ];

        let lastErr: unknown;
        for (const constraints of attempts) {
          try {
            stream = await navigator.mediaDevices.getUserMedia(constraints);
            break;
          } catch (e) {
            lastErr = e;
          }
        }

        if (!stream) throw lastErr ?? new Error("getUserMedia failed");

        await attachStream(stream);
      } catch (err) {
        const name = err instanceof DOMException ? err.name : "Error";
        if (name === "NotAllowedError" || name === "PermissionDeniedError") {
          setCameraError(
            "Camera blocked. On iPhone: Settings → Safari → Camera → Allow, then reload this page."
          );
        } else if (name === "NotFoundError" || name === "DevicesNotFoundError") {
          setCameraError("No camera found on this device.");
        } else if (name === "NotReadableError") {
          setCameraError("Camera busy in another app. Close it and tap Retry.");
        } else {
          setCameraError("Could not open camera. Tap Retry camera, or use photo upload below.");
        }
      } finally {
        startingRef.current = false;
      }
    },
    [attachStream, facingMode, stopCamera]
  );

  // Start camera when entering live phase
  useEffect(() => {
    if (phase === "live") {
      void startCamera(facingMode);
    }
    return () => {
      // only stop when leaving page entirely — handled below
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  if (!user) return null;

  const activeCollectionId = collectionId || user.collections[0]?.id || "";
  const selected = candidates[pick] ?? null;

  function captureFrame(): string | null {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return null;
    const w = video.videoWidth;
    const h = video.videoHeight;
    if (!w || !h) return null;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(video, 0, 0, w, h);
    return canvas.toDataURL("image/jpeg", 0.92);
  }

  async function runIdentify(dataUrl: string) {
    setPhase("scanning");
    setStatusMsg("Identifying…");
    setCandidates([]);
    setOcrText("");
    setPick(0);

    try {
      const outcome = await identifyFromImage(dataUrl, setStatusMsg);
      setOcrText(outcome.ocrText);
      const priced = outcome.matches.map((m) => priceMatch(m, mode));
      setCandidates(priced);
      setPhase("results");
      setStatusMsg(
        priced.length
          ? `Found ${priced.length} match${priced.length === 1 ? "" : "es"}`
          : "Couldn't read the card — search manually below"
      );
    } catch {
      setCandidates([]);
      setPhase("results");
      setStatusMsg("Identify failed — search manually below");
    }
  }

  async function onScanTap() {
    setSavedMsg("");
    setCameraError(null);
    const dataUrl = captureFrame();
    if (!dataUrl) {
      setCameraError("Camera not ready. Wait for the live preview, then tap Scan card.");
      return;
    }
    setCapturedUrl(dataUrl);
    stopCamera();
    await runIdentify(dataUrl);
  }

  async function onFileUpload(file: File | null) {
    if (!file) return;
    setSavedMsg("");
    setCameraError(null);
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
    setCapturedUrl(dataUrl);
    stopCamera();
    await runIdentify(dataUrl);
  }

  function scanAgain() {
    setCapturedUrl(null);
    setCandidates([]);
    setOcrText("");
    setManualQuery("");
    setSavedMsg("");
    setStatusMsg("");
    setPhase("live");
  }

  async function flipCamera() {
    const next = facingMode === "environment" ? "user" : "environment";
    setFacingMode(next);
    if (phase === "live") await startCamera(next);
  }

  function applyManualSearch() {
    const hits = searchCatalog(manualQuery, 8).map((m) => priceMatch(m, mode));
    setCandidates(hits);
    setPick(0);
    setStatusMsg(
      hits.length ? `Search: ${hits.length} result(s)` : "No catalog hits — try another name"
    );
    if (phase === "live") setPhase("results");
  }

  function saveSelected() {
    if (!selected || !activeCollectionId) return;
    addCard(activeCollectionId, {
      catalogName: selected.catalogName,
      setName: selected.setName,
      year: selected.year,
      category: selected.category,
      sport: selected.sport,
      condition: selected.condition,
      grade: selected.grade,
      grader: selected.grader,
      quantity: 1,
      valueCents: selected.valueCents,
      sourceMode: mode,
      valueBreakdown: selected.breakdown,
      imageHint: selected.imageHint,
    });
    const colName =
      user!.collections.find((c) => c.id === activeCollectionId)?.name ?? "collection";
    setSavedMsg(
      `Saved ${selected.catalogName} → ${colName} at ${formatUsd(selected.valueCents)}`
    );
    setPhase("saved");
  }

  const showLive = phase === "live";
  const showCapture = phase === "scanning" || phase === "results" || phase === "saved";

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold sm:text-3xl">Scanner</h1>
        <p className="mt-1 text-[var(--muted)]">
          Live camera → capture → read text → match catalog → value. Pricing:{" "}
          {priceModeLabel(mode)}.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,320px)_1fr]">
        <div>
          <div className="scan-viewport">
            <video
              ref={videoRef}
              className={`scan-video ${showLive ? "is-visible" : "is-hidden"}`}
              playsInline
              muted
              autoPlay
            />

            {capturedUrl && showCapture && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={capturedUrl} alt="Captured card" className="scan-capture" />
            )}

            {phase === "scanning" && <div className="scan-line" />}

            {showLive && cameraReady && (
              <div className="scan-guide" aria-hidden>
                <div className="scan-guide-inner" />
              </div>
            )}

            {showLive && !cameraReady && !cameraError && (
              <div className="scan-status">Starting camera…</div>
            )}

            {cameraError && showLive && (
              <div className="scan-status scan-status-error">{cameraError}</div>
            )}

            {phase === "scanning" && (
              <div className="scan-status">{statusMsg || "Identifying…"}</div>
            )}
          </div>

          <canvas ref={canvasRef} className="hidden" />

          <div className="mt-3 flex flex-col gap-2">
            {phase === "live" && (
              <>
                <button
                  type="button"
                  className="btn btn-primary w-full"
                  onClick={() => void onScanTap()}
                  disabled={!cameraReady}
                >
                  {cameraReady ? "Scan card" : "Waiting for camera…"}
                </button>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="btn btn-secondary flex-1"
                    onClick={() => void flipCamera()}
                  >
                    Flip camera
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary flex-1"
                    onClick={() => void startCamera(facingMode)}
                  >
                    Retry camera
                  </button>
                </div>
                <label className="btn btn-secondary w-full cursor-pointer">
                  Upload photo instead
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={(e) => void onFileUpload(e.target.files?.[0] ?? null)}
                  />
                </label>
              </>
            )}

            {(phase === "results" || phase === "saved") && (
              <button type="button" className="btn btn-secondary w-full" onClick={scanAgain}>
                Scan another
              </button>
            )}
          </div>
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

          <div className="card space-y-2">
            <label className="label" htmlFor="manual">
              Search catalog (if camera miss)
            </label>
            <div className="flex gap-2">
              <input
                id="manual"
                className="input"
                placeholder="e.g. Gengar VMAX Fusion Strike"
                value={manualQuery}
                onChange={(e) => setManualQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    applyManualSearch();
                  }
                }}
              />
              <button type="button" className="btn btn-secondary shrink-0" onClick={applyManualSearch}>
                Search
              </button>
            </div>
          </div>

          {phase === "live" && (
            <div className="card text-sm text-[var(--muted)]">
              Fill the green guide with the card under good light, then{" "}
              <strong className="text-white">Scan card</strong>. We read text off the card and
              match a local catalog (not the old fake random list).
            </div>
          )}

          {(phase === "results" || phase === "saved") && (
            <>
              {statusMsg && (
                <p className="text-sm text-teal-200/90">{statusMsg}</p>
              )}
              {ocrText && (
                <div className="card !py-2 text-xs text-[var(--muted)]">
                  <span className="font-medium text-white">OCR: </span>
                  {ocrText.slice(0, 220)}
                  {ocrText.length > 220 ? "…" : ""}
                </div>
              )}

              <div className="card space-y-3">
                <p className="text-sm font-medium">Confirm match</p>
                {candidates.length === 0 ? (
                  <p className="text-sm text-[var(--muted)]">
                    No auto-match. Type the card name above and hit Search, then save.
                  </p>
                ) : (
                  candidates.map((c, i) => (
                    <button
                      key={`${c.catalogName}-${c.setName}-${i}`}
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
                        <p className="text-[10px] text-teal-200/70">{c.reason}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-teal-300">
                          {formatUsd(c.valueCents)}
                        </p>
                        <p className="text-[10px] text-[var(--muted)]">
                          {i === 0 ? "Best match" : `Alt #${i + 1}`}
                        </p>
                      </div>
                    </button>
                  ))
                )}
              </div>

              {selected && (
                <div className="card">
                  <p className="text-sm text-[var(--muted)]">
                    Value ({priceModeLabel(mode)})
                  </p>
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
                      <p className="font-medium">
                        {formatUsd(selected.breakdown.goldenCents)}
                      </p>
                    </div>
                  </div>
                  {phase !== "saved" ? (
                    <button
                      type="button"
                      className="btn btn-primary mt-4 w-full"
                      onClick={saveSelected}
                    >
                      Save to collection
                    </button>
                  ) : (
                    <div className="mt-4 space-y-3">
                      <p className="rounded-lg border border-teal-500/30 bg-teal-500/10 px-3 py-2 text-sm text-teal-100">
                        {savedMsg}
                      </p>
                      <button
                        type="button"
                        className="btn btn-primary w-full"
                        onClick={() =>
                          router.push(`/app/collections/view/?id=${activeCollectionId}`)
                        }
                      >
                        View collection
                      </button>
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
