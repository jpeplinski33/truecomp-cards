"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { CardInstance, PriceMode, Session, UserProfile } from "@/lib/types";
import {
  addCardToCollection,
  createCollection,
  deleteCollection,
  getSession,
  getUser,
  login as storeLogin,
  logout as storeLogout,
  removeCard,
  renameCollection,
  signup as storeSignup,
  updatePriceMode,
  updateCardValue as storeUpdateCardValue,
} from "@/lib/store";
import { collectionTotalCents } from "@/lib/format";

type AppContextValue = {
  ready: boolean;
  session: Session | null;
  user: UserProfile | null;
  portfolioCents: number;
  refresh: () => void;
  login: (email: string, password: string) => { ok: true } | { ok: false; error: string };
  signup: (
    email: string,
    password: string,
    displayName: string
  ) => { ok: true } | { ok: false; error: string };
  logout: () => void;
  setPriceMode: (mode: PriceMode) => void;
  addCollection: (name: string) => void;
  renameCol: (id: string, name: string) => void;
  removeCol: (id: string) => { ok: true } | { ok: false; error: string };
  addCard: (
    collectionId: string,
    card: Omit<CardInstance, "id" | "addedAt">
  ) => void;
  deleteCard: (collectionId: string, cardId: string) => void;
  setCardValue: (collectionId: string, cardId: string, valueCents: number | null, note?: string) => void;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [session, setSessionState] = useState<Session | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);

  const refresh = useCallback(() => {
    const s = getSession();
    setSessionState(s);
    setUser(s ? getUser(s.userId) : null);
  }, []);

  useEffect(() => {
    refresh();
    setReady(true);
  }, [refresh]);

  const portfolioCents = useMemo(() => {
    if (!user) return 0;
    return user.collections.reduce(
      (sum, c) => sum + collectionTotalCents(c.cards),
      0
    );
  }, [user]);

  const value: AppContextValue = {
    ready,
    session,
    user,
    portfolioCents,
    refresh,
    login: (email, password) => {
      const res = storeLogin(email, password);
      if (!res.ok) return res;
      refresh();
      return { ok: true };
    },
    signup: (email, password, displayName) => {
      const res = storeSignup(email, password, displayName);
      if (!res.ok) return res;
      refresh();
      return { ok: true };
    },
    logout: () => {
      storeLogout();
      refresh();
    },
    setPriceMode: (mode) => {
      if (!user) return;
      updatePriceMode(user.id, mode);
      refresh();
    },
    addCollection: (name) => {
      if (!user) return;
      createCollection(user.id, name);
      refresh();
    },
    renameCol: (id, name) => {
      if (!user) return;
      renameCollection(user.id, id, name);
      refresh();
    },
    removeCol: (id) => {
      if (!user) return { ok: false, error: "Not signed in" };
      const res = deleteCollection(user.id, id);
      refresh();
      return res;
    },
    addCard: (collectionId, card) => {
      if (!user) return;
      addCardToCollection(user.id, collectionId, card);
      refresh();
    },
    deleteCard: (collectionId, cardId) => {
      if (!user) return;
      removeCard(user.id, collectionId, cardId);
      refresh();
    },
    setCardValue: (collectionId, cardId, valueCents, note) => {
      if (!user) return;
      storeUpdateCardValue(user.id, collectionId, cardId, valueCents, note);
      refresh();
    },
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
