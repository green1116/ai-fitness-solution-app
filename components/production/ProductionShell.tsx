"use client";

import Link from "next/link";
import { ProductionNav } from "./ProductionNav";

export function ProductionShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <header className="border-b border-zinc-800 bg-zinc-950/80 px-6 py-4">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-amber-500/90">
              Production Readiness
            </p>
            <h1 className="text-lg font-semibold">System Health Center</h1>
          </div>
          <div className="flex gap-4 text-sm text-zinc-400">
            <Link href="/intelligence" className="hover:text-white">
              Intelligence
            </Link>
            <Link href="/dashboard" className="hover:text-white">
              Workspace
            </Link>
          </div>
        </div>
      </header>
      <ProductionNav />
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
