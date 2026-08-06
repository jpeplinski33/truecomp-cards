import type { Collection, PriceMode, Session, UserProfile, CardInstance } from "./types";
import { uid } from "./format";

const USERS_KEY = "tcc_users_v1";
const SESSION_KEY = "tcc_session_v1";

function readUsers(): UserProfile[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? (JSON.parse(raw) as UserProfile[]) : [];
  } catch {
    return [];
  }
}

function writeUsers(users: UserProfile[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function getSession(): Session | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

export function setSession(session: Session | null) {
  if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  else localStorage.removeItem(SESSION_KEY);
}

export function getUser(userId: string): UserProfile | null {
  return readUsers().find((u) => u.id === userId) ?? null;
}

export function saveUser(user: UserProfile) {
  const users = readUsers();
  const i = users.findIndex((u) => u.id === user.id);
  if (i >= 0) users[i] = user;
  else users.push(user);
  writeUsers(users);
}

function seedDemoCards(): CardInstance[] {
  return [
    {
      id: uid("card"),
      catalogName: "Mike Trout Base",
      setName: "Topps Chrome",
      year: 2011,
      category: "sports",
      sport: "mlb",
      condition: "PSA 10",
      grade: "10",
      grader: "PSA",
      quantity: 1,
      valueCents: 42000,
      sourceMode: "blend",
      valueBreakdown: { oneThirtyPointCents: 40000, goldenCents: 46000 },
      addedAt: new Date().toISOString(),
      imageHint: "⚾",
    },
    {
      id: uid("card"),
      catalogName: "Charizard ex",
      setName: "Obsidian Flames",
      year: 2023,
      category: "pokemon",
      condition: "Raw NM",
      quantity: 2,
      valueCents: 1850,
      sourceMode: "one_thirty_point",
      valueBreakdown: { oneThirtyPointCents: 1850, goldenCents: 2100 },
      addedAt: new Date().toISOString(),
      imageHint: "🔥",
    },
  ];
}

export function signup(email: string, password: string, displayName: string): { ok: true; user: UserProfile } | { ok: false; error: string } {
  const normalized = email.trim().toLowerCase();
  if (!normalized || !password) return { ok: false, error: "Email and password required." };
  if (password.length < 4) return { ok: false, error: "Password must be at least 4 characters (demo)." };
  const users = readUsers();
  if (users.some((u) => u.email === normalized)) {
    return { ok: false, error: "An account with that email already exists." };
  }

  const defaultCollection: Collection = {
    id: uid("col"),
    name: "Main collection",
    createdAt: new Date().toISOString(),
    cards: seedDemoCards(),
  };

  const user: UserProfile = {
    id: uid("user"),
    email: normalized,
    displayName: displayName.trim() || normalized.split("@")[0],
    password,
    priceMode: "blend",
    blendWeights: { one_thirty_point: 0.7, golden: 0.3 },
    collections: [defaultCollection],
    createdAt: new Date().toISOString(),
  };
  saveUser(user);
  setSession({ userId: user.id, email: user.email, displayName: user.displayName });
  return { ok: true, user };
}

export function login(email: string, password: string): { ok: true; user: UserProfile } | { ok: false; error: string } {
  const normalized = email.trim().toLowerCase();
  const user = readUsers().find((u) => u.email === normalized);
  if (!user || user.password !== password) {
    return { ok: false, error: "Invalid email or password." };
  }
  setSession({ userId: user.id, email: user.email, displayName: user.displayName });
  return { ok: true, user };
}

export function logout() {
  setSession(null);
}

export function updatePriceMode(userId: string, mode: PriceMode, weights?: { one_thirty_point: number; golden: number }) {
  const user = getUser(userId);
  if (!user) return null;
  user.priceMode = mode;
  if (weights) user.blendWeights = weights;
  saveUser(user);
  return user;
}

export function createCollection(userId: string, name: string): Collection | null {
  const user = getUser(userId);
  if (!user) return null;
  const col: Collection = {
    id: uid("col"),
    name: name.trim() || "New collection",
    createdAt: new Date().toISOString(),
    cards: [],
  };
  user.collections.push(col);
  saveUser(user);
  return col;
}

export function renameCollection(userId: string, collectionId: string, name: string) {
  const user = getUser(userId);
  if (!user) return null;
  const col = user.collections.find((c) => c.id === collectionId);
  if (!col) return null;
  col.name = name.trim() || col.name;
  saveUser(user);
  return user;
}

export function deleteCollection(userId: string, collectionId: string): { ok: true } | { ok: false; error: string } {
  const user = getUser(userId);
  if (!user) return { ok: false, error: "Not found" };
  if (user.collections.length <= 1) return { ok: false, error: "Keep at least one collection." };
  user.collections = user.collections.filter((c) => c.id !== collectionId);
  saveUser(user);
  return { ok: true };
}

export function addCardToCollection(userId: string, collectionId: string, card: Omit<CardInstance, "id" | "addedAt">) {
  const user = getUser(userId);
  if (!user) return null;
  const col = user.collections.find((c) => c.id === collectionId);
  if (!col) return null;
  const instance: CardInstance = {
    ...card,
    id: uid("card"),
    addedAt: new Date().toISOString(),
  };
  col.cards.unshift(instance);
  saveUser(user);
  return instance;
}

export function removeCard(userId: string, collectionId: string, cardId: string) {
  const user = getUser(userId);
  if (!user) return null;
  const col = user.collections.find((c) => c.id === collectionId);
  if (!col) return null;
  col.cards = col.cards.filter((c) => c.id !== cardId);
  saveUser(user);
  return user;
}

/** Dummy pricing: deterministic-ish fake comps for demo UI */
export function dummyPriceForQuery(
  name: string,
  mode: PriceMode
): {
  valueCents: number;
  breakdown: { oneThirtyPointCents: number; goldenCents: number };
  label: string;
} {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  const base = 800 + (hash % 45000);
  const oneThirty = Math.round(base * (0.9 + (hash % 20) / 100));
  const golden = Math.round(base * (1.05 + (hash % 15) / 100));
  const blend = Math.round(oneThirty * 0.7 + golden * 0.3);
  const valueCents = mode === "one_thirty_point" ? oneThirty : mode === "golden" ? golden : blend;
  return {
    valueCents,
    breakdown: { oneThirtyPointCents: oneThirty, goldenCents: golden },
    label: name,
  };
}

export const DEMO_SCAN_CANDIDATES = [
  {
    catalogName: "Shohei Ohtani Refractor",
    setName: "Topps Chrome",
    year: 2018,
    category: "sports" as const,
    sport: "mlb",
    condition: "Raw NM",
    imageHint: "⚾",
  },
  {
    catalogName: "Pikachu VMAX",
    setName: "Vivid Voltage",
    year: 2020,
    category: "pokemon" as const,
    condition: "Raw LP",
    imageHint: "⚡",
  },
  {
    catalogName: "Luka Doncic Prizm Silver",
    setName: "Panini Prizm",
    year: 2018,
    category: "sports" as const,
    sport: "nba",
    condition: "PSA 9",
    grade: "9",
    grader: "PSA",
    imageHint: "🏀",
  },
  {
    catalogName: "Umbreon VMAX Alt Art",
    setName: "Evolving Skies",
    year: 2021,
    category: "pokemon" as const,
    condition: "Raw NM",
    imageHint: "🌙",
  },
  {
    catalogName: "Patrick Mahomes Optic Rated Rookie",
    setName: "Donruss Optic",
    year: 2017,
    category: "sports" as const,
    sport: "nfl",
    condition: "BGS 9.5",
    grade: "9.5",
    grader: "BGS",
    imageHint: "🏈",
  },
];
