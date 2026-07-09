"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { DeliveryArtifactType } from "@/lib/portal/v58/delivery/delivery.types";
import { PilotFlowStatus } from "@/components/pilot/PilotFlowStatus";
import { PilotWorkflowNav } from "@/components/pilot/PilotWorkflowNav";
import { DeliveryRow } from "./DeliveryRow";
import { DocumentEmptyState } from "./DocumentEmptyState";
import { DocumentListSkeleton } from "./DocumentListSkeleton";
import { useDocuments } from "./DocumentProvider";

type FilterKey = "all" | DeliveryArtifactType;

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "全部" },
  { key: "plan_pdf", label: "Plans" },
  { key: "budget_pdf", label: "Budgets" },
  { key: "quote_pdf", label: "Quotes" },
  { key: "merged_pdf", label: "Merged" },
  { key: "zip_package", label: "ZIP" },
  { key: "tender_pack", label: "Tender" },
];

type DocumentFilteredListProps = {
  title: string;
  artifactFilter?: DeliveryArtifactType;
  latestOnly?: boolean;
  emptyTitle: string;
  emptyDescription: string;
  emptyActionLabel?: string;
  emptyActionHref?: string;
};

export function DocumentFilteredList({
  title,
  artifactFilter,
  latestOnly = false,
  emptyTitle,
  emptyDescription,
  emptyActionLabel,
  emptyActionHref,
}: DocumentFilteredListProps) {
  const { loading, deliveries } = useDocuments();
  const [filter, setFilter] = useState<FilterKey>(artifactFilter ?? "all");

  const filtered = useMemo(() => {
    let list = deliveries;
    const activeFilter = artifactFilter ?? filter;
    if (activeFilter !== "all") {
      list = list.filter((d) => d.artifactType === activeFilter);
    }
    if (latestOnly) {
      list = list.filter((d) => d.isLatest);
    }
    return list;
  }, [deliveries, filter, artifactFilter, latestOnly]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">{title}</h1>
        {!artifactFilter ? (
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
                  filter === f.key
                    ? "bg-sky-600 text-white"
                    : "border border-zinc-700 text-zinc-400 hover:border-zinc-500"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {loading ? (
        <DocumentListSkeleton />
      ) : filtered.length === 0 ? (
        <DocumentEmptyState
          title={emptyTitle}
          description={emptyDescription}
          actionLabel={emptyActionLabel}
          actionHref={emptyActionHref}
        />
      ) : (
        <ul className="space-y-3">
          {filtered.map((d) => (
            <DeliveryRow key={d.id} delivery={d} />
          ))}
        </ul>
      )}

      <p className="text-xs text-zinc-600">
        提示：Latest 为当前可用版本，Archived 为历史版本，仍可回看与下载。
      </p>
    </div>
  );
}

export function DocumentOverviewPage() {
  const { loading, error, summary, refresh } = useDocuments();

  if (loading) return <DocumentListSkeleton rows={4} />;
  if (error) {
    return (
      <div className="rounded-2xl border border-red-900/50 bg-red-950/20 p-6 text-red-300">
        {error}
        <button
          type="button"
          onClick={() => void refresh()}
          className="ml-4 text-sm underline"
        >
          重试
        </button>
      </div>
    );
  }

  const stats = [
    { label: "Plans", value: summary?.plansCount ?? 0, href: "/documents/plans" },
    { label: "Budgets", value: summary?.budgetsCount ?? 0, href: "/documents/budgets" },
    { label: "Quotes", value: summary?.quotesCount ?? 0, href: "/documents/quotes" },
    { label: "Reports", value: summary?.reportsCount ?? 0, href: "/documents/reports" },
    { label: "Deliveries", value: summary?.deliveriesCount ?? 0, href: "/documents/deliveries" },
  ];

  return (
    <div className="space-y-8">
      <section>
        <p className="text-xs font-medium uppercase tracking-widest text-sky-400">归档区</p>
        <h1 className="mt-1 text-2xl font-bold">Document Center</h1>
        <p className="mt-1 text-sm text-zinc-400">
          统一管理 Plans、Budgets、Quotes、Reports 与交付包下载。
        </p>
      </section>

      <PilotWorkflowNav activeZone="archive" compact />

      <PilotFlowStatus
        status={(summary?.deliveriesCount ?? 0) > 0 ? "delivered" : "not_uploaded"}
      />

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="rounded-2xl border border-zinc-800 bg-black/40 p-5 hover:border-sky-800"
          >
            <p className="text-xs uppercase tracking-widest text-zinc-500">{s.label}</p>
            <p className="mt-2 text-3xl font-bold">{s.value}</p>
          </Link>
        ))}
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">最近交付</h2>
          <Link href="/documents/deliveries" className="text-sm text-sky-400 hover:text-sky-300">
            查看全部 →
          </Link>
        </div>
        {(summary?.recentDeliveries.length ?? 0) === 0 ? (
          <DocumentEmptyState
            title="还没有交付物"
            description="从上传标书或生成 Quote / Budget / Tender 开始，交付记录将出现在此处。"
            actionLabel="上传标书"
            actionHref="/pilot/intake"
          />
        ) : (
          <ul className="space-y-3">
            {summary?.recentDeliveries.map((d) => (
              <DeliveryRow key={d.id} delivery={d} />
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold">最近活动</h2>
        {(summary?.recentActivities.length ?? 0) === 0 ? (
          <p className="text-sm text-zinc-500">暂无活动记录</p>
        ) : (
          <ul className="space-y-2 text-sm text-zinc-400">
            {summary?.recentActivities.map((a, i) => (
              <li key={`${a.event}-${i}`} className="rounded-lg border border-zinc-800 px-4 py-2">
                <span className="text-zinc-200">{a.event}</span>
                <span className="mx-2">·</span>
                {new Date(a.timestamp).toLocaleString()}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
