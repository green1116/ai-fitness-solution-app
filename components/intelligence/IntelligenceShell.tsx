"use client";

import Link from "next/link";
import { IntelligenceProvider } from "./IntelligenceProvider";
import { IntelligenceNav } from "./IntelligenceNav";

export function IntelligenceShell({ children }: { children: React.ReactNode }) {
  return (
    <IntelligenceProvider>
      <div className="min-h-screen bg-zinc-950 text-white">
        <header className="border-b border-zinc-800 bg-zinc-950/80 px-6 py-4">
          <div className="mx-auto flex max-w-6xl flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-violet-500/90">
                Enterprise Delivery Intelligence
              </p>
              <h1 className="text-lg font-semibold text-white">企业交付智能中心</h1>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-zinc-400">
              <Link href="/documents" className="hover:text-white">
                Document Center
              </Link>
              <Link href="/dashboard" className="hover:text-white">
                Workspace
              </Link>
            </div>
          </div>
        </header>
        <IntelligenceNav />
        <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
      </div>
    </IntelligenceProvider>
  );
}
