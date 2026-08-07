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

export function signup(email: string, password: string, displayName: string): { ok: true; user: UserProfile } | { ok: false; error: string } {
  const normalized = email.trim().toLowerCase();
  if (!normalized || !password) return { ok: false, error: "Email and password required." };
  if (password.length < 4) return { ok: false, error: "Password must be at least 4 characters." };
  const users = readUsers();
  if (users.some((u) => u.email === normalized)) {
    return { ok: false, error: "An account with that email already exists." };
  }

  const defaultCollection: Collection = {
    id: uid("col"),
    name: "Main collection",
    createdAt: new Date().toISOString(),
    cards: [], // empty — only real scans/adds the user saves
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

export function updateCardValue(
  userId: string,
  collectionId: string,
  cardId: string,
  valueCents: number | null,
  valueNote?: string
) {
  const user = getUser(userId);
  if (!user) return null;
  const col = user.collections.find((c) => c.id === collectionId);
  if (!col) return null;
  const card = col.cards.find((c) => c.id === cardId);
  if (!card) return null;
  card.valueCents = valueCents;
  if (valueNote !== undefined) card.valueNote = valueNote;
  saveUser(user);
  return user;
}
