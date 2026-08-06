import { matchCatalog, type MatchResult, CARD_CATALOG } from "./catalog";

export type IdentifyOutcome = {
  ocrText: string;
  matches: MatchResult[];
  method: "ocr" | "fallback";
};

/**
 * Identify card from a captured data URL.
 * 1) Try Tesseract OCR in-browser
 * 2) Fuzzy match against local catalog
 * 3) If OCR fails, return empty matches (UI shows manual search)
 */
export async function identifyFromImage(
  dataUrl: string,
  onProgress?: (msg: string) => void
): Promise<IdentifyOutcome> {
  onProgress?.("Reading card text…");

  let ocrText = "";
  try {
    const Tesseract = await import("tesseract.js");
    const result = await Tesseract.recognize(dataUrl, "eng", {
      logger: (m) => {
        if (m.status === "recognizing text" && typeof m.progress === "number") {
          onProgress?.(`Reading text… ${Math.round(m.progress * 100)}%`);
        }
      },
    });
    ocrText = (result.data.text || "").replace(/\s+/g, " ").trim();
  } catch {
    ocrText = "";
  }

  onProgress?.("Matching catalog…");
  let matches = matchCatalog(ocrText, 5);

  // If OCR was weak but we got something short, still try
  if (matches.length === 0 && ocrText.length >= 3) {
    matches = matchCatalog(ocrText, 5);
  }

  // Absolute last resort: do NOT invent sports cards for a Pokémon photo.
  // Prefer empty so user can type/search.
  if (matches.length === 0) {
    return { ocrText, matches: [], method: "ocr" };
  }

  return { ocrText, matches, method: "ocr" };
}

export function catalogSize() {
  return CARD_CATALOG.length;
}
