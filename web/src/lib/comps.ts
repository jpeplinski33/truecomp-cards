/**
 * Market comps sources.
 *
 * HARD FACTS:
 * - 130point.com has NO public third-party API.
 * - Server/automated fetch is blocked by Cloudflare (403 challenge).
 * - "Golden" in hobby talk = Goldin auctions — a marketplace 130point already
 *   aggregates; not a separate price-guide API we can call.
 * - Until 130point (or a licensed data partner) gives us a key, the only honest
 *   integration is: build the right search query → open their site for real solds,
 *   and let the user save a comps value they verify.
 */

export type CompQuery = {
  catalogName: string;
  setName?: string;
  year?: number;
  condition?: string;
  grade?: string;
  grader?: string;
  category?: string;
};

/** Best-effort sold-search string for 130point / eBay / Goldin */
export function buildCompQuery(q: CompQuery): string {
  const parts = [
    q.year,
    q.catalogName,
    q.setName,
    q.grader,
    q.grade,
    q.condition && !q.grade ? q.condition : null,
  ]
    .filter(Boolean)
    .map(String);
  return parts.join(" ").replace(/\s+/g, " ").trim();
}

export function url130point(q: CompQuery): string {
  const query = encodeURIComponent(buildCompQuery(q));
  // SPA search — user lands on sales/search with term ready when site supports it;
  // header search is the documented UX. Query string is best-effort.
  return `https://130point.com/sales/?q=${query}`;
}

export function urlGoldin(q: CompQuery): string {
  const query = encodeURIComponent(buildCompQuery(q));
  return `https://goldin.co/discover?query=${query}`;
}

export function urlEbaySold(q: CompQuery): string {
  const query = encodeURIComponent(buildCompQuery(q));
  return `https://www.ebay.com/sch/i.html?_nkw=${query}&LH_Sold=1&LH_Complete=1&rt=nc&LH_PrefLoc=1`;
}

export function urlCardLadder(q: CompQuery): string {
  const query = encodeURIComponent(buildCompQuery(q));
  return `https://www.cardladder.com/search?q=${query}`;
}

export type SourceLinks = {
  query: string;
  oneThirtyPoint: string;
  golden: string;
  ebaySold: string;
  cardLadder: string;
};

export function allSourceLinks(q: CompQuery): SourceLinks {
  const query = buildCompQuery(q);
  return {
    query,
    oneThirtyPoint: url130point(q),
    golden: urlGoldin(q),
    ebaySold: urlEbaySold(q),
    cardLadder: urlCardLadder(q),
  };
}
