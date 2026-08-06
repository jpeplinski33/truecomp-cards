export function formatUsd(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100);
}

export function collectionTotalCents(cards: { valueCents: number; quantity: number }[]): number {
  return cards.reduce((sum, c) => sum + c.valueCents * c.quantity, 0);
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
