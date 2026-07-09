"use client";

import { ArchiveDashboard } from "@/components/pilot/ArchiveDashboard";

export default function PilotExecutiveArchivePage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8 py-8">
      <div>
        <h1 className="text-2xl font-bold text-white">V96 — Executive Archive</h1>
        <p className="mt-2 text-sm text-zinc-400">
          高管归档 · 审计检索 · 导出工作流 · 只写归档缓存
        </p>
      </div>

      <ArchiveDashboard />
    </div>
  );
}
