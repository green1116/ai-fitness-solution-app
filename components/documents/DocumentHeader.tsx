"use client";

import Link from "next/link";
import { useDocuments } from "./DocumentProvider";

export function DocumentHeader() {
  const { loading, summary } = useDocuments();

  if (loading) {
    return (
      <header className="border-b border-zinc-800 bg-zinc-950/80 px-6 py-4">
        <div className="mx-auto max-w-6xl animate-pulse text-sm text-zinc-500">
          加载 Document Center…
        </div>
      </header>
    );
  }

  return (
    <header className="border-b border-zinc-800 bg-zinc-950/80 px-6 py-4">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-sky-500/90">
            Document & Delivery Platform
          </p>
          <h1 className="text-lg font-semibold text-white">文档交付中心</h1>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-zinc-400">
          <span>
            交付物：<span className="text-zinc-200">{summary?.deliveriesCount ?? 0}</span>
          </span>
          <span>
            最新版本：<span className="text-zinc-200">{summary?.recentDeliveries.length ?? 0}</span>
          </span>
          <Link href="/dashboard" className="text-sky-400 hover:text-sky-300">
            ← 返回 Workspace
          </Link>
        </div>
      </div>
    </header>
  );
}
