"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type QueueItem = {
  sessionId: string;
  archiveRecordId: string;
  complianceRecordId?: string;
  projectName?: string;
  complianceQueue: string;
  complianceStatus: string;
  disposition: string;
  reviewDueDate: string;
  expiresAt: string;
  reviewerName?: string;
  isExpired: boolean;
  retentionPolicy: {
    retentionWindowDays: number;
    reviewWindowDays: number;
    reviewDueDate: string;
    expiresAt: string;
  };
};

type Policy = {
  retentionWindowDays: number;
  reviewWindowDays: number;
};

type Summary = {
  total: number;
  reviewed: number;
  pendingReview: number;
  retentionRequired: number;
  exportRequested: number;
  expired: number;
  onHold: number;
  purgeScheduled: number;
  exportsRequested: number;
};

type ActionEntry = {
  id: string;
  action: string;
  timestamp: string;
  note?: string;
  sessionId?: string;
};

const QUEUE_LABELS: Record<string, string> = {
  reviewed: "已审阅",
  pending_review: "待审阅",
  retention_required: "需保留",
  export_requested: "导出请求",
  expired: "已过期",
};

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-zinc-800 text-zinc-300",
  compliant: "bg-emerald-950 text-emerald-300",
  on_hold: "bg-violet-950 text-violet-300",
  purge_scheduled: "bg-red-950 text-red-300",
  expired: "bg-orange-950 text-orange-300",
  reviewed: "bg-sky-950 text-sky-300",
};

export function ComplianceDashboard() {
  const [policy, setPolicy] = useState<Policy | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [items, setItems] = useState<QueueItem[]>([]);
  const [actions, setActions] = useState<ActionEntry[]>([]);
  const [selectedArchiveId, setSelectedArchiveId] = useState("");
  const [exportJson, setExportJson] = useState("");
  const [error, setError] = useState("");
  const [acting, setActing] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/pilot/v97/executive-compliance");
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.message ?? data.code ?? "加载失败");
      const d = data.dashboard;
      setPolicy(d.policy ?? null);
      setSummary(d.summary ?? null);
      setItems(d.allItems ?? []);
      setActions(d.recentActions ?? []);
      if (!selectedArchiveId && d.allItems?.[0]?.archiveRecordId) {
        setSelectedArchiveId(d.allItems[0].archiveRecordId);
      }
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "加载失败");
    } finally {
      setLoading(false);
    }
  }, [selectedArchiveId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function runAction(action: string, extra?: Record<string, string>) {
    if (!selectedArchiveId) return;
    setActing(true);
    setError("");
    try {
      const res = await fetch("/api/pilot/v97/executive-compliance/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, archiveRecordId: selectedArchiveId, ...extra }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.message ?? data.code ?? "操作失败");
      if (data.export) setExportJson(JSON.stringify(data.export, null, 2));
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "操作失败");
    } finally {
      setActing(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-zinc-500">加载合规面板…</p>;
  }

  const selected = items.find((i) => i.archiveRecordId === selectedArchiveId);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-zinc-500">合规审阅 — 只读归档/审计层 + 合规缓存写入</p>
        <button
          type="button"
          onClick={() => void load()}
          className="text-xs text-zinc-400 underline hover:text-white"
        >
          刷新
        </button>
      </div>

      {policy ? (
        <section className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-cyan-900/50 bg-cyan-950/10 p-4">
            <p className="text-xs font-medium text-cyan-400">保留策略</p>
            <p className="mt-2 text-sm text-white">保留窗口 {policy.retentionWindowDays} 天</p>
            <p className="text-xs text-zinc-500">审阅截止窗口 {policy.reviewWindowDays} 天</p>
          </div>
          {summary ? (
            <div className="rounded-xl border border-violet-900/50 bg-violet-950/10 p-4">
              <p className="text-xs font-medium text-violet-400">合规概览</p>
              <p className="mt-2 text-sm text-white">
                待审 {summary.pendingReview} · 已审 {summary.reviewed} · Hold{" "}
                {summary.onHold}
              </p>
              <p className="text-xs text-zinc-500">
                导出请求 {summary.exportsRequested} · 过期 {summary.expired}
              </p>
            </div>
          ) : null}
        </section>
      ) : null}

      {selected ? (
        <section className="rounded-2xl border border-violet-900/50 bg-violet-950/10 p-6">
          <h2 className="text-sm font-semibold text-violet-300">审阅工作流</h2>
          <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-medium text-white">
                {selected.projectName ?? selected.sessionId.slice(0, 8)}
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                审阅截止 {new Date(selected.reviewDueDate).toLocaleDateString("zh-CN")} · 过期{" "}
                {new Date(selected.expiresAt).toLocaleDateString("zh-CN")}
              </p>
              <p className="text-xs text-zinc-500">
                处置 {selected.disposition} · 审阅人 {selected.reviewerName ?? "未分配"}
              </p>
            </div>
            <span
              className={`rounded px-2 py-0.5 text-xs ${STATUS_STYLES[selected.complianceStatus] ?? "bg-zinc-800"}`}
            >
              {selected.complianceStatus}
            </span>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={acting}
              onClick={() =>
                void runAction("assign_reviewer", {
                  reviewerId: "compliance-reviewer",
                  reviewerName: "Compliance Officer",
                })
              }
              className="rounded-lg border border-zinc-600 px-3 py-1.5 text-xs disabled:opacity-40"
            >
              分配审阅人
            </button>
            <button
              type="button"
              disabled={acting}
              onClick={() => void runAction("mark_reviewed")}
              className="rounded-lg bg-emerald-800 px-3 py-1.5 text-xs text-white disabled:opacity-40"
            >
              标记已审阅
            </button>
            <button
              type="button"
              disabled={acting}
              onClick={() => void runAction("mark_hold")}
              className="rounded-lg border border-violet-800 px-3 py-1.5 text-xs text-violet-300 disabled:opacity-40"
            >
              保留 Hold
            </button>
            <button
              type="button"
              disabled={acting}
              onClick={() => void runAction("mark_purge")}
              className="rounded-lg border border-red-800 px-3 py-1.5 text-xs text-red-300 disabled:opacity-40"
            >
              标记清除
            </button>
            <button
              type="button"
              disabled={acting}
              onClick={() => void runAction("request_export")}
              className="rounded-lg border border-sky-800 px-3 py-1.5 text-xs text-sky-300 disabled:opacity-40"
            >
              请求导出
            </button>
          </div>
        </section>
      ) : null}

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-white">审阅队列</h2>
        {items.length === 0 ? (
          <p className="text-sm text-zinc-500">暂无合规项 — 请先从归档层完成归档</p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {items.map((item) => (
              <li
                key={item.archiveRecordId}
                className={`cursor-pointer rounded-xl border p-4 ${
                  selectedArchiveId === item.archiveRecordId
                    ? "border-cyan-700 bg-cyan-950/20"
                    : "border-zinc-800 bg-zinc-950"
                }`}
                onClick={() => setSelectedArchiveId(item.archiveRecordId)}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium text-white">
                    {item.projectName ?? item.sessionId.slice(0, 8)}
                  </p>
                  <span className="text-xs text-zinc-500">
                    {QUEUE_LABELS[item.complianceQueue] ?? item.complianceQueue}
                  </span>
                </div>
                <p className="mt-1 text-xs text-zinc-500">
                  保留 {item.retentionPolicy.retentionWindowDays} 天
                  {item.isExpired ? " · 已过期" : ""}
                </p>
                <Link
                  href={`/pilot/executive-archive?session=${item.sessionId}`}
                  className="mt-2 inline-block text-xs text-cyan-400 underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  下钻归档
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {actions.length > 0 ? (
        <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
          <h2 className="text-sm font-semibold text-white">保留时间线</h2>
          <ol className="mt-3 space-y-2 text-xs">
            {actions.slice(0, 12).map((a) => (
              <li key={a.id} className="flex flex-wrap gap-3 text-zinc-400">
                <span className="text-zinc-600">{new Date(a.timestamp).toLocaleString()}</span>
                <span className="font-mono text-cyan-500">{a.action}</span>
                {a.sessionId ? (
                  <span className="text-zinc-600">{a.sessionId.slice(0, 8)}</span>
                ) : null}
                <span>{a.note}</span>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      {exportJson ? (
        <section className="rounded-2xl border border-sky-900/50 bg-sky-950/10 p-4">
          <h2 className="text-sm font-semibold text-sky-300">导出预览</h2>
          <pre className="mt-2 max-h-48 overflow-auto text-xs text-zinc-400">{exportJson}</pre>
        </section>
      ) : null}

      {error ? <p className="text-sm text-red-400">{error}</p> : null}
    </div>
  );
}
