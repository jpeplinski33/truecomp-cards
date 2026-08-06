"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { DEMO_SCAN_CANDIDATES, dummyPriceForQuery } from "@/lib/store";
import { formatUsd, priceModeLabel } from "@/lib/format";
import type { PriceMode } from "@/lib/types";

type Phase = "live" | "scanning" | "results" | "saved";

export default function ScannerPage() {
  const { user, addCard } = useApp();
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [phase, setPhase] = useState<Phase>("live");
  const [pick, setPick] = useState(0);
  const [collectionId, setCollectionId] = useState("");
  const [savedMsg, setSavedMsg] = useState("");
  const [capturedUrl, setCapturedUrl] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");

  const mode: PriceMode = user?.priceMode ?? "blend";

  const candidates = useMemo(() => {
    return DEMO_SCAN_CANDIDATES.map((c) => {
      const price = dummyPriceForQuery(`${c.catalogName} ${c.setName}`, mode);
      return { ...c, ...price };
    });
  }, [mode]);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraReady(false);
  }, []);

  const startCamera = useCallback(async (facing: "environment" | "user" = facingMode) => {
    setCameraError(null);
    setCameraReady(false);
    stopCamera();

    if (typeof window === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setCameraError("This browser cannot access the camera. Use Safari/Chrome on HTTPS.");
      return;
    }

    try {
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            facingMode: { ideal: facing },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
        });
      } catch {
        // Fallback: any camera
        stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: true,
        });
      }

      streamRef.current = stream;
      const video = videoRef.current;
      if (video) {
        video.srcObject = stream;
        video.setAttribute("playsinline", "true");
        video.muted = true;
        await video.play();
        setCameraReady(true);
      }
    } catch (err) {
      const name = err instanceof DOMException ? err.name : "Error";
      if (name === "NotAllowedError" || name === "PermissionDeniedError") {
        setCameraError("Camera permission denied. Allow camera access for this site and reload.");
      } else if (name === "NotFoundError" || name === "DevicesNotFoundError") {
        setCameraError("No camera found on this device.");
      } else if (name === "NotReadableError") {
        setCameraError("Camera is in use by another app. Close it and try again.");
      } else {
        setCameraError("Could not open camera. Check permissions and try again.");
      }
    }
  }, [facingMode, stopCamera]);

  useEffect(() => {
    void startCamera("environment");
    return () => stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-attach stream when returning to live after capture
  useEffect(() => {
    if (phase === "live" && !streamRef.current && !cameraError) {
      void startCamera(facingMode);
    }
  }, [phase, cameraError, facingMode, startCamera]);

  if (!user) return null;

  const activeCollectionId = collectionId || user.collections[0]?.id || "";
  const selected = candidates[pick];

  function captureFrame(): string | null {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !video.videoWidth) return null;

    const w = video.videoWidth;
    const h = video.videoHeight;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(video, 0, 0, w, h);
    return canvas.toDataURL("image/jpeg", 0.92);
  }

  function startScan() {
    setSavedMsg("");
    setCameraError(null);

    const dataUrl = captureFrame();
    if (!dataUrl) {
      setCameraError("Camera not ready yet — wait for the live preview, then tap Scan.");
      return;
    }

    setCapturedUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return dataUrl;
    });
    setPhase("scanning");
    stopCamera();

    // Demo identify (real ML later) — still shows YOUR photo
    window.setTimeout(() => {
      setPick(0);
      setPhase("results");
    }, 900);
  }

  function scanAgain() {
    if (capturedUrl?.startsWith("blob:")) URL.revokeObjectURL(capturedUrl);
    setCapturedUrl(null);
    setPhase("live");
    setSavedMsg("");
    void startCamera(facingMode);
  }

  async function flipCamera() {
    const next = facingMode === "environment" ? "user" : "environment";
    setFacingMode(next);
    if (phase === "live") await startCamera(next);
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
    const colName =
      user!.collections.find((c) => c.id === activeCollectionId)?.name ?? "collection";
    setSavedMsg(`Saved ${selected.catalogName} → ${colName} at ${formatUsd(selected.valueCents)}`);
    setPhase("saved");
  }

  const showLive = phase === "live";
  const showCapture = phase === "scanning" || phase === "results" || phase === "saved";

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold sm:text-3xl">Scanner</h1>
        <p className="mt-1 text-[var(--muted)]">
          Live camera — align the card, scan, confirm match, save. Pricing:{" "}
          {priceModeLabel(mode)}.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,320px)_1fr]">
        <div>
          <div className="scan-viewport">
            {/* Live camera */}
            <video
              ref={videoRef}
              className={`scan-video ${showLive ? "is-visible" : "is-hidden"}`}
              playsInline
              muted
              autoPlay
            />

            {/* Captured still */}
            {capturedUrl && showCapture && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={capturedUrl} alt="Captured card" className="scan-capture" />
            )}

            {phase === "scanning" && <div className="scan-line" />}

            {/* Card guide overlay */}
            {showLive && cameraReady && (
              <div className="scan-guide" aria-hidden>
                <div className="scan-guide-inner" />
              </div>
            )}

            {showLive && !cameraReady && !cameraError && (
              <div className="scan-status">Starting camera…</div>
            )}

            {cameraError && phase === "live" && (
              <div className="scan-status scan-status-error">{cameraError}</div>
            )}

            {phase === "scanning" && (
              <div className="scan-status">Identifying card…</div>
            )}
          </div>

          <canvas ref={canvasRef} className="hidden" />

          <div className="mt-3 flex flex-col gap-2">
            {phase === "live" && (
              <>
                <button
                  type="button"
                  className="btn btn-primary w-full"
                  onClick={startScan}
                  disabled={!cameraReady}
                >
                  {cameraReady ? "Scan card" : "Waiting for camera…"}
                </button>
                <div className="flex gap-2">
                  <button type="button" className="btn btn-secondary flex-1" onClick={flipCamera}>
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

          {phase === "live" && (
            <div className="card text-sm text-[var(--muted)]">
              <strong className="text-white">1.</strong> Allow camera when asked.
              <br />
              <strong className="text-white">2.</strong> Fill the guide with the card (good light, flat).
              <br />
              <strong className="text-white">3.</strong> Tap <strong className="text-white">Scan card</strong>.
            </div>
          )}

          {(phase === "results" || phase === "saved") && (
            <>
              <div className="card space-y-3">
                <p className="text-sm font-medium">Confirm match (top candidates)</p>
                <p className="text-xs text-[var(--muted)]">
                  Identify is still demo data — your photo is real. Pick the closest card.
                </p>
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
