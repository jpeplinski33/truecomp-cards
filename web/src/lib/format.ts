export function formatUsd(cents: number | null | undefined): string {
  if (cents == null || Number.isNaN(cents)) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100);
}

export function collectionTotalCents(
  cards: { valueCents: number | null; quantity: number }[]
): number {
  return cards.reduce((sum, c) => {
    if (c.valueCents == null) return sum;
    return sum + c.valueCents * c.quantity;
  }, 0);
}

export function parseUsdToCents(input: string): number | null {
  const cleaned = input.replace(/[$,\s]/g, "").trim();
  if (!cleaned) return null;
  const n = Number(cleaned);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n * 100);
}

export function priceModeLabel(mode: string): string {
  switch (mode) {
    case "one_thirty_point":
      return "130point-style";
    case "golden":
      return "Golden / Goldin-style";
    case "blend":
      return "Combined";
    default:
      return mode;
  }
}

export function uid(prefix = "id"): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;
}
