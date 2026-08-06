/** Seed catalog for client-side match after OCR / keywords */

export type CatalogCard = {
  catalogName: string;
  setName: string;
  year: number;
  category: "sports" | "pokemon" | "other";
  sport?: string;
  condition: string;
  grade?: string;
  grader?: string;
  imageHint: string;
  /** Keywords used for fuzzy match (lowercase) */
  keys: string[];
};

export const CARD_CATALOG: CatalogCard[] = [
  // Pokémon — Fusion Strike / Gengar (from Jordan's recording)
  {
    catalogName: "Gengar VMAX",
    setName: "Fusion Strike",
    year: 2021,
    category: "pokemon",
    condition: "Raw NM",
    imageHint: "👻",
    keys: ["gengar", "vmax", "fusion strike", "fusionstrike", "swsh8", "257", "tg87", "tg"],
  },
  {
    catalogName: "Gengar V",
    setName: "Fusion Strike",
    year: 2021,
    category: "pokemon",
    condition: "Raw NM",
    imageHint: "👻",
    keys: ["gengar v", "gengar", "fusion strike"],
  },
  {
    catalogName: "Charizard ex",
    setName: "Obsidian Flames",
    year: 2023,
    category: "pokemon",
    condition: "Raw NM",
    imageHint: "🔥",
    keys: ["charizard", "obsidian", "flames", "ex"],
  },
  {
    catalogName: "Pikachu VMAX",
    setName: "Vivid Voltage",
    year: 2020,
    category: "pokemon",
    condition: "Raw LP",
    imageHint: "⚡",
    keys: ["pikachu", "vmax", "vivid voltage"],
  },
  {
    catalogName: "Umbreon VMAX Alt Art",
    setName: "Evolving Skies",
    year: 2021,
    category: "pokemon",
    condition: "Raw NM",
    imageHint: "🌙",
    keys: ["umbreon", "vmax", "evolving skies", "alt art", "alternate"],
  },
  {
    catalogName: "Mew VMAX",
    setName: "Fusion Strike",
    year: 2021,
    category: "pokemon",
    condition: "Raw NM",
    imageHint: "🧬",
    keys: ["mew", "vmax", "fusion strike"],
  },
  {
    catalogName: "Lugia V",
    setName: "Silver Tempest",
    year: 2022,
    category: "pokemon",
    condition: "Raw NM",
    imageHint: "🪶",
    keys: ["lugia", "silver tempest"],
  },
  {
    catalogName: "Rayquaza VMAX",
    setName: "Evolving Skies",
    year: 2021,
    category: "pokemon",
    condition: "Raw NM",
    imageHint: "🐉",
    keys: ["rayquaza", "vmax", "evolving skies"],
  },
  {
    catalogName: "Mewtwo VSTAR",
    setName: "Pokémon GO",
    year: 2022,
    category: "pokemon",
    condition: "Raw NM",
    imageHint: "🧠",
    keys: ["mewtwo", "vstar", "pokemon go", "pokémon go"],
  },
  {
    catalogName: "Espeon VMAX",
    setName: "Evolving Skies",
    year: 2021,
    category: "pokemon",
    condition: "Raw NM",
    imageHint: "💜",
    keys: ["espeon", "vmax", "evolving skies"],
  },
  // Sports
  {
    catalogName: "Shohei Ohtani Refractor",
    setName: "Topps Chrome",
    year: 2018,
    category: "sports",
    sport: "mlb",
    condition: "Raw NM",
    imageHint: "⚾",
    keys: ["ohtani", "shohei", "topps chrome", "refractor", "baseball"],
  },
  {
    catalogName: "Mike Trout Base",
    setName: "Topps Chrome",
    year: 2011,
    category: "sports",
    sport: "mlb",
    condition: "PSA 10",
    grade: "10",
    grader: "PSA",
    imageHint: "⚾",
    keys: ["trout", "mike trout", "topps chrome", "2011"],
  },
  {
    catalogName: "Luka Doncic Prizm Silver",
    setName: "Panini Prizm",
    year: 2018,
    category: "sports",
    sport: "nba",
    condition: "PSA 9",
    grade: "9",
    grader: "PSA",
    imageHint: "🏀",
    keys: ["doncic", "luka", "prizm", "silver", "basketball"],
  },
  {
    catalogName: "Patrick Mahomes Optic Rated Rookie",
    setName: "Donruss Optic",
    year: 2017,
    category: "sports",
    sport: "nfl",
    condition: "BGS 9.5",
    grade: "9.5",
    grader: "BGS",
    imageHint: "🏈",
    keys: ["mahomes", "patrick", "optic", "rated rookie", "football"],
  },
  {
    catalogName: "LeBron James Prizm",
    setName: "Panini Prizm",
    year: 2012,
    category: "sports",
    sport: "nba",
    condition: "Raw NM",
    imageHint: "🏀",
    keys: ["lebron", "james", "prizm"],
  },
  {
    catalogName: "Tom Brady Chrome",
    setName: "Topps Chrome",
    year: 2000,
    category: "sports",
    sport: "nfl",
    condition: "Raw NM",
    imageHint: "🏈",
    keys: ["brady", "tom brady", "chrome"],
  },
  {
    catalogName: "Aaron Judge Rookie",
    setName: "Topps Chrome",
    year: 2017,
    category: "sports",
    sport: "mlb",
    condition: "Raw NM",
    imageHint: "⚾",
    keys: ["judge", "aaron judge", "rookie"],
  },
  {
    catalogName: "Victor Wembanyama Prizm",
    setName: "Panini Prizm",
    year: 2023,
    category: "sports",
    sport: "nba",
    condition: "Raw NM",
    imageHint: "🏀",
    keys: ["wembanyama", "wemby", "victor"],
  },
  {
    catalogName: "Caitlin Clark Prizm",
    setName: "Panini Prizm",
    year: 2024,
    category: "sports",
    sport: "wnba",
    condition: "Raw NM",
    imageHint: "🏀",
    keys: ["caitlin", "clark", "wnba"],
  },
  {
    catalogName: "Connor McDavid Young Guns",
    setName: "Upper Deck",
    year: 2015,
    category: "sports",
    sport: "nhl",
    condition: "Raw NM",
    imageHint: "🏒",
    keys: ["mcdavid", "connor", "young guns", "hockey"],
  },
];

function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export type MatchResult = CatalogCard & { score: number; reason: string };

/** Score catalog cards against OCR / free-text blob */
export function matchCatalog(rawText: string, limit = 5): MatchResult[] {
  const text = normalize(rawText);
  if (!text || text.length < 2) {
    // No OCR — return empty so UI can show search
    return [];
  }

  const scored: MatchResult[] = CARD_CATALOG.map((card) => {
    let score = 0;
    const hits: string[] = [];
    for (const k of card.keys) {
      const key = normalize(k);
      if (!key) continue;
      if (text.includes(key)) {
        // Longer keys weigh more
        const w = Math.min(40, 8 + key.length * 2);
        score += w;
        hits.push(key);
      } else {
        // partial token hits
        for (const tok of key.split(" ")) {
          if (tok.length >= 4 && text.includes(tok)) {
            score += 4;
            hits.push(tok);
          }
        }
      }
    }
    // name tokens
    for (const tok of normalize(card.catalogName).split(" ")) {
      if (tok.length >= 3 && text.includes(tok)) {
        score += 6;
        hits.push(tok);
      }
    }
    if (card.category === "pokemon" && (text.includes("hp") || text.includes("vmax") || text.includes("vstar"))) {
      score += 3;
    }
    return {
      ...card,
      score,
      reason: hits.length ? `matched: ${[...new Set(hits)].slice(0, 6).join(", ")}` : "no keyword hit",
    };
  });

  return scored
    .filter((c) => c.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export function searchCatalog(query: string, limit = 8): MatchResult[] {
  const q = normalize(query);
  if (!q) return [];
  return matchCatalog(q, limit);
}
