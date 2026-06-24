"use client";

import Link from "next/link";
import { LaunchNav } from "./LaunchNav";

export function LaunchShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <header className="border-b border-zinc-800 px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-emerald-500">Commercial Launch</p>
            <h1 className="text-lg font-semibold">Launch Center</h1>
          </div>
          <Link href="/production" className="text-sm text-zinc-400 hover:text-white">
            Production Ops →
          </Link>
        </div>
      </header>
      <LaunchNav />
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
