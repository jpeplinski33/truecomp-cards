"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { useApp } from "@/context/AppContext";

export default function SignupPage() {
  const { signup, session, ready } = useApp();
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (ready && session) router.replace("/app");
  }, [ready, session, router]);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = signup(email, password, displayName);
    setLoading(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    router.push("/app");
  }

  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader solid />
      <main className="container flex flex-1 items-center justify-center py-12">
        <div className="card w-full max-w-md">
          <h1 className="text-2xl font-semibold">Create account</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            New accounts start with an empty collection. Your data stays on this device until cloud sync ships.
          </p>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <label className="label" htmlFor="name">
                Display name
              </label>
              <input
                id="name"
                className="input"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Jordan"
              />
            </div>
            <div>
              <label className="label" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                className="input"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="label" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                className="input"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={4}
              />
            </div>
            {error && (
              <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
                {error}
              </p>
            )}
            <button type="submit" className="btn btn-primary w-full" disabled={loading}>
              {loading ? "Creating…" : "Create account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[var(--muted)]">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-teal-300 hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
