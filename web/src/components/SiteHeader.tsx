"use client";

import Link from "next/link";
import { useApp } from "@/context/AppContext";

export function SiteHeader({ solid = false }: { solid?: boolean }) {
  const { session } = useApp();

  return (
    <header
      className={`sticky top-0 z-40 border-b border-[var(--border)] ${
        solid ? "bg-[var(--bg)]/95 backdrop-blur" : "bg-[var(--bg)]/70 backdrop-blur-md"
      }`}
    >
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--accent-dim)] text-sm text-teal-300">
            TC
          </span>
          TrueComp Cards
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2">
          {session ? (
            <>
              <Link href="/app" className="nav-link hidden sm:inline">
                Dashboard
              </Link>
              <Link href="/app" className="btn btn-primary">
                Open app
              </Link>
            </>
          ) : (
            <>
              <Link href="/login" className="nav-link">
                Log in
              </Link>
              <Link href="/signup" className="btn btn-primary">
                Get started
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
