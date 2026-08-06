"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { formatUsd, parseUsdToCents, priceModeLabel } from "@/lib/format";
import { identifyFromImage } from "@/lib/identify";
import { searchCatalog, type MatchResult } from "@/lib/catalog";
import { allSourceLinks } from "@/lib/comps";
import type { PriceMode } from "@/lib/types";

type Phase = "live" | "scanning" | "results" | "saved";

export default function ScannerPage() {
  const { user, addCard } = useApp();
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const startingRef = useRef(false);
  const autoArmedRef = useRef(true);
  const lastMotionRef = useRef(0);
  const sampleCanvasRef = useRef<HTMLCanvasElement | null>(null);

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
  const [candidates, setCandidates] = useState<MatchResult[]>([]);
  const [manualQuery, setManualQuery] = useState("");
  const [valueInput, setValueInput] = useState("");
  const [autoHint, setAutoHint] = useState("Point at a card — auto-scans when steady");

  const mode: PriceMode = user?.priceMode ?? "blend";

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
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
      await new Promise((r) => setTimeout(r, 120));
      await video.play().catch(() => undefined);
    }
    setCameraReady(true);
    autoArmedRef.current = true;
  }, []);

  const startCamera = useCallback(
    async (facing: "environment" | "user" = facingMode) => {
      if (startingRef.current) return;
      startingRef.current = true;
      setCameraError(null);
      setCameraReady(false);
      stopCamera();

      if (typeof window === "undefined" || !navigator.mediaDevices?.getUserMedia) {
        setCameraError("Camera API unavailable. Use Safari/Chrome on HTTPS.");
        startingRef.current = false;
        return;
      }

      try {
        let stream: MediaStream | null = null;
        let lastErr: unknown;
        for (const constraints of [
          {
            audio: false,
            video: {
              facingMode: { ideal: facing },
              width: { ideal: 1920 },
              height: { ideal: 1080 },
            },
          },
          { audio: false, video: { facingMode: facing } },
          { audio: false, video: true },
        ] as MediaStreamConstraints[]) {
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
            "Camera blocked. iPhone: Settings → Safari → Camera → Allow, then reload."
          );
        } else if (name === "NotFoundError") {
          setCameraError("No camera found.");
        } else if (name === "NotReadableError") {
          setCameraError("Camera busy in another app.");
        } else {
          setCameraError("Could not open camera. Use Upload photo.");
        }
      } finally {
        startingRef.current = false;
      }
    },
    [attachStream, facingMode, stopCamera]
  );

  useEffect(() => {
    if (phase === "live") void startCamera(facingMode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  useEffect(() => () => stopCamera(), [stopCamera]);

  const captureFrame = useCallback((): string | null => {
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
  }, []);

  const runIdentify = useCallback(async (dataUrl: string) => {
    setPhase("scanning");
    setStatusMsg("Reading card…");
    setCandidates([]);
    setOcrText("");
    setPick(0);
    setValueInput("");
    try {
      const outcome = await identifyFromImage(dataUrl, setStatusMsg);
      setOcrText(outcome.ocrText);
      setCandidates(outcome.matches);
      setPhase("results");
      setStatusMsg(
        outcome.matches.length
          ? `Matched ${outcome.matches.length} — open real comps below (not fake $)`
          : "No catalog match — search name, then open 130point for real solds"
      );
    } catch {
      setCandidates([]);
      setPhase("results");
      setStatusMsg("Identify failed — search manually, then open 130point");
    }
  }, []);

  const onScan = useCallback(async () => {
    setSavedMsg("");
    setCameraError(null);
    const dataUrl = captureFrame();
    if (!dataUrl) {
      setCameraError("Camera not ready yet.");
      return;
    }
    autoArmedRef.current = false;
    setCapturedUrl(dataUrl);
    stopCamera();
    await runIdentify(dataUrl);
  }, [captureFrame, runIdentify, stopCamera]);

  // Auto-scan: when live + ready, wait for steady frame then fire once
  useEffect(() => {
    if (phase !== "live" || !cameraReady) return;

    let raf = 0;
    let lastSample = "";
    let steadyMs = 0;
    let lastTs = performance.now();
    const NEED_STEADY_MS = 900;
    const CHECK_EVERY = 200;

    const tick = (ts: number) => {
      raf = requestAnimationFrame(tick);
      if (!autoArmedRef.current) return;
      if (ts - lastTs < CHECK_EVERY) return;
      lastTs = ts;

      const video = videoRef.current;
      if (!video || !video.videoWidth) return;

      if (!sampleCanvasRef.current) {
        sampleCanvasRef.current = document.createElement("canvas");
      }
      const c = sampleCanvasRef.current;
      const sw = 48;
      const sh = 64;
      c.width = sw;
      c.height = sh;
      const ctx = c.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;
      ctx.drawImage(video, 0, 0, sw, sh);
      const data = ctx.getImageData(0, 0, sw, sh).data;
      // brightness + simple hash for motion
      let sum = 0;
      let hash = 0;
      for (let i = 0; i < data.length; i += 16) {
        const v = data[i] + data[i + 1] + data[i + 2];
        sum += v;
        hash = (hash * 31 + v) >>> 0;
      }
      const sample = `${hash}`;
      const brightness = sum / (data.length / 16) / 3;

      if (brightness < 25) {
        setAutoHint("Too dark — add light");
        steadyMs = 0;
        lastSample = sample;
        return;
      }

      if (sample === lastSample) {
        steadyMs += CHECK_EVERY;
        setAutoHint(
          steadyMs >= NEED_STEADY_MS
            ? "Scanning…"
            : `Hold steady… ${Math.min(100, Math.round((steadyMs / NEED_STEADY_MS) * 100))}%`
        );
        if (steadyMs >= NEED_STEADY_MS) {
          autoArmedRef.current = false;
          lastMotionRef.current = ts;
          void onScan();
        }
      } else {
        steadyMs = 0;
        lastSample = sample;
        setAutoHint("Point at a card — auto-scans when steady");
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [phase, cameraReady, onScan]);

  if (!user) return null;

  const activeCollectionId = collectionId || user.collections[0]?.id || "";
  const selected = candidates[pick] ?? null;
  const links = selected
    ? allSourceLinks({
        catalogName: selected.catalogName,
        setName: selected.setName,
        year: selected.year,
        condition: selected.condition,
        grade: selected.grade,
        grader: selected.grader,
        category: selected.category,
      })
    : null;

  async function onFileUpload(file: File | null) {
    if (!file) return;
    setSavedMsg("");
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
    autoArmedRef.current = false;
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
    setValueInput("");
    setPhase("live");
    autoArmedRef.current = true;
  }

  function applyManualSearch() {
    const hits = searchCatalog(manualQuery, 8);
    setCandidates(hits);
    setPick(0);
    setStatusMsg(hits.length ? `Search: ${hits.length} result(s)` : "No catalog hits");
    if (phase === "live") {
      stopCamera();
      setPhase("results");
    }
  }

  function saveSelected() {
    if (!selected || !activeCollectionId) return;
    const cents = parseUsdToCents(valueInput);
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
      valueCents: cents,
      sourceMode: mode,
      valueNote: cents != null ? "User comps (from 130point / market)" : undefined,
      imageHint: selected.imageHint,
    });
    const colName =
      user!.collections.find((c) => c.id === activeCollectionId)?.name ?? "collection";
    setSavedMsg(
      cents != null
        ? `Saved ${selected.catalogName} @ ${formatUsd(cents)} → ${colName}`
        : `Saved ${selected.catalogName} with no value yet → ${colName}`
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
          Auto-scan when steady. Values come from <strong className="text-white">real comps links</strong>{" "}
          (130point / Goldin / eBay sold) — we do <strong className="text-white">not</strong> invent prices.
          Preference: {priceModeLabel(mode)}.
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
            {showLive && cameraReady && !cameraError && (
              <div className="scan-status">{autoHint}</div>
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
                  onClick={() => void onScan()}
                  disabled={!cameraReady}
                >
                  Scan now
                </button>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="btn btn-secondary flex-1"
                    onClick={() => {
                      const next = facingMode === "environment" ? "user" : "environment";
                      setFacingMode(next);
                      void startCamera(next);
                    }}
                  >
                    Flip
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary flex-1"
                    onClick={() => void startCamera(facingMode)}
                  >
                    Retry cam
                  </button>
                </div>
                <label className="btn btn-secondary w-full cursor-pointer">
                  Upload photo
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
              Search catalog
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

          <div className="card text-sm text-[var(--muted)]">
            <p className="font-medium text-white">Why not inside 130point / Golden?</p>
            <p className="mt-2">
              Neither sells a public API for third-party apps. 130point blocks automated scrapers
              (Cloudflare). “Golden” = <strong className="text-white">Goldin</strong> auctions —
              a marketplace 130point already aggregates. Until we license data, we open{" "}
              <strong className="text-white">deep links</strong> so you see real solds, then you
              enter the value.
            </p>
          </div>

          {(phase === "results" || phase === "saved") && (
            <>
              {statusMsg && <p className="text-sm text-teal-200/90">{statusMsg}</p>}
              {ocrText && (
                <div className="card !py-2 text-xs text-[var(--muted)]">
                  <span className="font-medium text-white">OCR: </span>
                  {ocrText.slice(0, 220)}
                  {ocrText.length > 220 ? "…" : ""}
                </div>
              )}

              <div className="card space-y-3">
                <p className="text-sm font-medium">Confirm card ID</p>
                {candidates.length === 0 ? (
                  <p className="text-sm text-[var(--muted)]">
                    No auto-match. Search above, then open comps.
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
                      <span className="text-[10px] text-[var(--muted)]">
                        {i === 0 ? "Best" : `#${i + 1}`}
                      </span>
                    </button>
                  ))
                )}
              </div>

              {selected && links && (
                <div className="card space-y-3">
                  <p className="text-sm font-medium">Real market comps (deep links)</p>
                  <p className="text-xs text-[var(--muted)]">Query: {links.query}</p>
                  <div className="flex flex-col gap-2">
                    <a
                      className="btn btn-primary w-full"
                      href={links.oneThirtyPoint}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Open 130point solds
                    </a>
                    <a
                      className="btn btn-secondary w-full"
                      href={links.golden}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Open Goldin (Golden)
                    </a>
                    <a
                      className="btn btn-secondary w-full"
                      href={links.ebaySold}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Open eBay sold
                    </a>
                  </div>

                  <div>
                    <label className="label" htmlFor="val">
                      Enter value from comps (optional)
                    </label>
                    <input
                      id="val"
                      className="input"
                      inputMode="decimal"
                      placeholder="$0.00 — paste what 130point shows"
                      value={valueInput}
                      onChange={(e) => setValueInput(e.target.value)}
                    />
                    <p className="mt-1 text-xs text-[var(--muted)]">
                      Leave blank to save the card with no value (shows as —).
                    </p>
                  </div>

                  {phase !== "saved" ? (
                    <button type="button" className="btn btn-primary w-full" onClick={saveSelected}>
                      Save to collection
                    </button>
                  ) : (
                    <div className="space-y-3">
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
