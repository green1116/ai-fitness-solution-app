"use client";

import Link from "next/link";
import { EmptyState } from "@/components/workspace/EmptyState";
import { WorkspaceLoading } from "@/components/workspace/WorkspaceLoading";
import { useWorkspace } from "@/components/workspace/WorkspaceProvider";

export default function QuotesPage() {
  const { loading, recentQuotes, currentProject } = useWorkspace();

  if (loading) return <WorkspaceLoading message="加载 Quotes…" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Quotes</h1>
        <Link
          href={
            currentProject
              ? `/quote?projectId=${encodeURIComponent(currentProject.id)}`
              : "/onboarding"
          }
          className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black"
        >
          Generate Quote
        </Link>
      </div>

      {recentQuotes.length === 0 ? (
        <EmptyState
          title="还没有方案"
          description="为当前项目生成第一份 Quote，进入可交付的方案输出。"
          actionLabel="Generate First Quote"
          actionHref={
            currentProject
              ? `/quote?projectId=${encodeURIComponent(currentProject.id)}`
              : "/onboarding"
          }
        />
      ) : (
        <ul className="space-y-3">
          {recentQuotes.map((q) => (
            <li key={q.id}>
              <Link
                href={`/quotes/${q.id}`}
                className="block rounded-xl border border-zinc-800 bg-black/40 p-4 hover:border-zinc-600"
              >
                <div className="font-mono text-sm">{q.id}</div>
                <div className="mt-1 text-xs text-zinc-500">
                  {q.status} · {new Date(q.createdAt).toLocaleDateString()}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
