"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { formatUsd } from "@/lib/format";

const links = [
  { href: "/app", label: "Dashboard", exact: true },
  { href: "/app/scanner", label: "Scanner" },
  { href: "/app/collections", label: "Collections" },
  { href: "/app/settings", label: "Settings" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const { ready, session, user, portfolioCents, logout } = useApp();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (ready && !session) router.replace("/login");
  }, [ready, session, router]);

  if (!ready || !session || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center text-[var(--muted)]">
        Loading…
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--bg)]/90 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between gap-3">
          <div className="flex items-center gap-6">
            <Link href="/app" className="flex items-center gap-2 font-semibold">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--accent-dim)] text-sm text-teal-300">
                TC
              </span>
              <span className="hidden sm:inline">TrueComp</span>
            </Link>
            <nav className="flex items-center gap-0.5 overflow-x-auto">
              {links.map((l) => {
                const active = l.exact
                  ? pathname === l.href
                  : pathname === l.href || pathname.startsWith(l.href + "/");
                return (
                  <Link
                    key={l.href}
                    href={l.href}
                    className={`nav-link whitespace-nowrap ${active ? "active" : ""}`}
                  >
                    {l.label}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-xs text-[var(--muted)]">All collections</p>
              <p className="text-sm font-semibold text-teal-300">{formatUsd(portfolioCents)}</p>
            </div>
            <div className="hidden text-sm text-[var(--muted)] md:block">
              {user.displayName}
            </div>
            <button
              type="button"
              className="btn btn-secondary !px-3 !py-1.5 text-sm"
              onClick={() => {
                logout();
                router.push("/");
              }}
            >
              Log out
            </button>
          </div>
        </div>
      </header>
      <main className="container flex-1 py-8">{children}</main>
    </div>
  );
}
