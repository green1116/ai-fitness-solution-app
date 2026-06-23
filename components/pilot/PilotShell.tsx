"use client";

import Link from "next/link";
import { PilotNav } from "./PilotNav";

export function PilotShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <header className="border-b border-zinc-800 px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-sky-500">Real User Pilot</p>
            <h1 className="text-lg font-semibold">Pilot Center</h1>
          </div>
          <Link href="/launch" className="text-sm text-zinc-400 hover:text-white">
            Launch Center →
          </Link>
        </div>
      </header>
      <PilotNav />
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
