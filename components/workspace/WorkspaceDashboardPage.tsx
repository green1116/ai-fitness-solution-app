"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { EmptyState } from "@/components/workspace/EmptyState";
import { QuoteResultCard } from "@/components/workspace/QuoteResultCard";
import { WorkspaceError } from "@/components/workspace/WorkspaceError";
import { WorkspaceLoading } from "@/components/workspace/WorkspaceLoading";
import { useWorkspace } from "@/components/workspace/WorkspaceProvider";
import type { DeliveryRecord } from "@/lib/portal/v58/delivery/delivery.types";

function RecentDeliveriesSection() {
  const [deliveries, setDeliveries] = useState<DeliveryRecord[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/documents/summary");
        const data = await res.json();
        if (res.ok && data.ok) {
          setDeliveries(data.summary?.recentDeliveries ?? []);
        }
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  if (!loaded) return null;
  if (deliveries.length === 0) return null;

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Recent Deliveries</h2>
        <Link href="/documents" className="text-sm text-sky-400 hover:text-sky-300">
          Document Center →
        </Link>
      </div>
      <ul className="space-y-3">
        {deliveries.slice(0, 4).map((d) => (
          <li key={d.id}>
            <Link
              href={d.quoteId ? `/documents/quotes/${d.quoteId}` : `/documents/projects/${d.projectId}`}
              className="block rounded-xl border border-zinc-800 bg-black/40 p-4 hover:border-sky-800"
            >
              <div className="text-sm font-medium">{d.artifactType}</div>
              <div className="mt-1 text-xs text-zinc-500">
                {d.projectName ?? d.projectId.slice(0, 8)} · {d.isLatest ? "Latest" : "Archived"}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

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

  const quoteProjectId = quoteId
    ? recentQuotes.find((q) => q.id === quoteId)?.projectId ?? currentProject?.id
    : undefined;

  if (loading) return <WorkspaceLoading message="加载 Workspace 概览…" />;
  if (error) return <WorkspaceError message={error} onRetry={() => void refresh()} />;

  return (
    <div className="space-y-8">
      {quoteId ? <QuoteResultCard quoteId={quoteId} projectId={quoteProjectId} /> : null}

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
        <h2 className="mb-4 text-lg font-semibold">主流程</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/pilot/intake"
            className="rounded-xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white hover:bg-sky-500"
          >
            上传标书 / 导入招标文件
          </Link>
          <Link
            href={
              currentProject
                ? `/quote?projectId=${encodeURIComponent(currentProject.id)}`
                : "/onboarding"
            }
            className="rounded-xl border border-zinc-700 px-5 py-3 text-sm font-semibold hover:border-zinc-500"
          >
            生成方案 Quote
          </Link>
          <Link
            href={
              currentProject
                ? `/budget?projectId=${encodeURIComponent(currentProject.id)}`
                : "/budget"
            }
            className="rounded-xl border border-zinc-700 px-5 py-3 text-sm font-semibold hover:border-zinc-500"
          >
            计算预算 Budget
          </Link>
          <Link
            href={
              currentProject
                ? `/tender?projectId=${encodeURIComponent(currentProject.id)}`
                : "/tender"
            }
            className="rounded-xl border border-zinc-700 px-5 py-3 text-sm font-semibold hover:border-zinc-500"
          >
            生成标书 Tender
          </Link>
          <Link
            href="/documents"
            className="rounded-xl border border-sky-800 px-5 py-3 text-sm font-semibold text-sky-100 hover:bg-sky-900/30"
          >
            Document Center
          </Link>
          <Link
            href="/projects"
            className="rounded-xl border border-zinc-800 px-5 py-3 text-sm text-zinc-400 hover:border-zinc-600"
          >
            管理项目
          </Link>
        </div>
      </section>

      <RecentDeliveriesSection />

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
