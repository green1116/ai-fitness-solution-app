"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { EmptyState } from "@/components/workspace/EmptyState";
import { QuoteResultCard } from "@/components/workspace/QuoteResultCard";
import { WorkspaceError } from "@/components/workspace/WorkspaceError";
import { WorkspaceLoading } from "@/components/workspace/WorkspaceLoading";
import { useWorkspace } from "@/components/workspace/WorkspaceProvider";

function DashboardBody() {
  const searchParams = useSearchParams();
  const quoteId = searchParams.get("quoteId");
  const {
    loading,
    error,
    stats,
    recentProjects,
    recentQuotes,
    currentProject,
    refresh,
  } = useWorkspace();

  if (loading) return <WorkspaceLoading message="加载 Workspace 概览…" />;
  if (error) return <WorkspaceError message={error} onRetry={() => void refresh()} />;

  return (
    <div className="space-y-8">
      {quoteId ? <QuoteResultCard quoteId={quoteId} projectId={currentProject?.id} /> : null}

      <section className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Projects", value: stats.projectsCount },
          { label: "Quotes", value: stats.quotesCount },
          { label: "Reports", value: stats.reportsCount },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-2xl border border-zinc-800 bg-black/40 p-5"
          >
            <p className="text-xs uppercase tracking-widest text-zinc-500">{item.label}</p>
            <p className="mt-2 text-3xl font-bold">{item.value}</p>
          </div>
        ))}
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/projects"
            className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black hover:bg-zinc-200"
          >
            管理项目
          </Link>
          <Link
            href={
              currentProject
                ? `/quote?projectId=${encodeURIComponent(currentProject.id)}`
                : "/onboarding"
            }
            className="rounded-xl border border-zinc-700 px-5 py-3 text-sm font-semibold hover:border-zinc-500"
          >
            生成方案
          </Link>
          <Link
            href="/reports"
            className="rounded-xl border border-zinc-700 px-5 py-3 text-sm font-semibold hover:border-zinc-500"
          >
            查看报告
          </Link>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div>
          <h2 className="mb-4 text-lg font-semibold">Recent Projects</h2>
          {recentProjects.length === 0 ? (
            <EmptyState
              title="还没有项目"
              description="创建第一个项目，开始生成企业健身方案。"
              actionLabel="Create First Project"
              actionHref="/projects"
            />
          ) : (
            <ul className="space-y-3">
              {recentProjects.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/projects/${p.id}`}
                    className="block rounded-xl border border-zinc-800 bg-black/40 p-4 hover:border-zinc-600"
                  >
                    <div className="font-medium">{p.name}</div>
                    <div className="mt-1 text-xs text-zinc-500">
                      {p.clientName ?? "—"} · {p.quoteCount} quotes
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <h2 className="mb-4 text-lg font-semibold">Recent Quotes</h2>
          {recentQuotes.length === 0 ? (
            <EmptyState
              title="还没有方案"
              description="完成 Onboarding 后，为项目生成第一份 Quote。"
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
                    <div className="font-mono text-sm">{q.id.slice(0, 16)}…</div>
                    <div className="mt-1 text-xs text-zinc-500">
                      {q.status} · project {q.projectId.slice(0, 8)}…
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}

export function WorkspaceDashboardPage() {
  return (
    <Suspense fallback={<WorkspaceLoading />}>
      <DashboardBody />
    </Suspense>
  );
}
