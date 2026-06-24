"use client";

import Link from "next/link";
import { EmptyState } from "@/components/workspace/EmptyState";
import { WorkspaceLoading } from "@/components/workspace/WorkspaceLoading";
import { useWorkspace } from "@/components/workspace/WorkspaceProvider";

export default function ReportsPage() {
  const { loading, stats } = useWorkspace();

  if (loading) return <WorkspaceLoading message="加载 Reports…" />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Reports</h1>
      <p className="text-sm text-zinc-400">
        报告基于 Tender / 标书输出聚合（当前组织共 {stats.reportsCount} 份）
      </p>

      {stats.reportsCount === 0 ? (
        <EmptyState
          title="还没有报告"
          description="完成 Quote 后可生成标书与 PDF 报告，报告将在此汇总。"
          actionLabel="前往 Projects"
          actionHref="/projects"
        />
      ) : (
        <section className="rounded-2xl border border-zinc-800 bg-black/40 p-6">
          <p className="text-sm text-zinc-300">
            已检测到 {stats.reportsCount} 份报告记录。完整报告列表将在后续版本接入只读聚合 API。
          </p>
          <Link
            href="/projects"
            className="mt-4 inline-block text-sm text-emerald-400 hover:underline"
          >
            从项目进入标书流程 →
          </Link>
        </section>
      )}
    </div>
  );
}
