"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type ArchiveItem = {
  sessionId: string;
  projectName?: string;
  archiveQueue: string;
  outcome: string;
  status: string;
  archiveRecordId?: string;
  closedAt?: string;
  linkedIds: {
    briefingPackIds: string[];
    boardPacketIds: string[];
    governanceActionIds: string[];
    executiveActionIds: string[];
  };
};

type Summary = {
  total: number;
  closed: number;
  acted: number;
  deferred: number;
  overdueResolved: number;
  archived: number;
  reviewed: number;
  exportsCount: number;
};

type ActionEntry = {
  id: string;
  action: string;
  timestamp: string;
  note?: string;
  sessionId?: string;
};

type AuditTrail = {
  sessionId: string;
  executiveActionHistory: Array<{ action: string; timestamp: string; note?: string }>;
  briefingPackHistory: Array<{ packId: string; title: string; status: string }>;
  decisionTrail: Array<{ action: string; timestamp: string; note?: string }>;
  closureTrail: Array<{ action: string; timestamp: string; note?: string }>;
  linkedIds: {
    briefingPackIds: string[];
    boardPacketIds: string[];
    governanceActionIds: string[];
    executiveActionIds: string[];
  };
};

const QUEUE_LABELS: Record<string, string> = {
  closed: "已关闭",
  acted: "已执行",
  deferred: "已延期",
  overdue_resolved: "逾期已解决",
  archived: "已归档",
};

const STATUS_STYLES: Record<string, string> = {
  active: "bg-zinc-800 text-zinc-300",
  archived: "bg-violet-950 text-violet-300",
  reviewed: "bg-emerald-950 text-emerald-300",
};

export function ArchiveDashboard() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [items, setItems] = useState<ArchiveItem[]>([]);
  const [actions, setActions] = useState<ActionEntry[]>([]);
  const [selectedSession, setSelectedSession] = useState("");
  const [selectedRecordId, setSelectedRecordId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [trail, setTrail] = useState<AuditTrail | null>(null);
  const [exportJson, setExportJson] = useState("");
  const [error, setError] = useState("");
  const [acting, setActing] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (q?: string) => {
    setLoading(true);
    try {
      const url = q?.trim()
        ? `/api/pilot/v96/executive-archive?q=${encodeURIComponent(q)}`
        : "/api/pilot/v96/executive-archive";
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.message ?? data.code ?? "加载失败");
      const d = data.dashboard;
      setSummary(d.summary ?? null);
      setItems(data.search?.matches ?? d.allItems ?? []);
      setActions(d.recentActions ?? []);
      if (!selectedSession && (data.search?.matches?.[0] ?? d.allItems?.[0])?.sessionId) {
        const first = data.search?.matches?.[0] ?? d.allItems?.[0];
        setSelectedSession(first.sessionId);
        setSelectedRecordId(first.archiveRecordId ?? "");
      }
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "加载失败");
    } finally {
      setLoading(false);
    }
  }, [selectedSession]);

  const loadTrail = useCallback(async (sessionId: string) => {
    if (!sessionId) return;
    try {
      const res = await fetch(
        `/api/pilot/v96/executive-archive/actions?sessionId=${encodeURIComponent(sessionId)}`,
      );
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.message ?? data.code ?? "检索失败");
      setTrail(data.trail ?? null);
    } catch (e) {
      setTrail(null);
      setError(e instanceof Error ? e.message : "检索失败");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (selectedSession) void loadTrail(selectedSession);
  }, [selectedSession, loadTrail]);

  async function runAction(action: string, extra?: Record<string, string>) {
    setActing(true);
    setError("");
    try {
      const res = await fetch("/api/pilot/v96/executive-archive/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, sessionId: selectedSession, ...extra }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.message ?? data.code ?? "操作失败");
      if (data.record?.id) setSelectedRecordId(data.record.id);
      if (data.export) setExportJson(JSON.stringify(data.export, null, 2));
      await load(searchQuery);
      if (selectedSession) await loadTrail(selectedSession);
    } catch (e) {
      setError(e instanceof Error ? e.message : "操作失败");
    } finally {
      setActing(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-zinc-500">加载归档面板…</p>;
  }

  const selected = items.find((i) => i.sessionId === selectedSession);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-zinc-500">高管归档 — 只读行动/简报/治理层 + 归档缓存写入</p>
        <button
          type="button"
          onClick={() => void load(searchQuery)}
          className="text-xs text-zinc-400 underline hover:text-white"
        >
          刷新
        </button>
      </div>

      <section className="flex flex-wrap gap-2">
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="搜索会话 / 项目…"
          className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-sm text-white"
        />
        <button
          type="button"
          onClick={() => void load(searchQuery)}
          className="rounded-lg border border-zinc-600 px-3 py-1.5 text-xs"
        >
          搜索
        </button>
      </section>

      {summary ? (
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "总归档", value: summary.total },
            { label: "已归档", value: summary.archived },
            { label: "已审阅", value: summary.reviewed },
            { label: "导出次数", value: summary.exportsCount },
          ].map((c) => (
            <div key={c.label} className="rounded-xl border border-zinc-800 bg-zinc-950 p-3">
              <p className="text-xs text-zinc-500">{c.label}</p>
              <p className="text-xl font-bold text-cyan-300">{c.value}</p>
            </div>
          ))}
        </section>
      ) : null}

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-white">归档队列</h2>
        {items.length === 0 ? (
          <p className="text-sm text-zinc-500">暂无归档项 — 请先从行动层完成闭环</p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {items.map((item) => (
              <li
                key={item.sessionId}
                className={`cursor-pointer rounded-xl border p-4 ${
                  selectedSession === item.sessionId
                    ? "border-cyan-700 bg-cyan-950/20"
                    : "border-zinc-800 bg-zinc-950"
                }`}
                onClick={() => {
                  setSelectedSession(item.sessionId);
                  setSelectedRecordId(item.archiveRecordId ?? "");
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium text-white">
                    {item.projectName ?? item.sessionId.slice(0, 8)}
                  </p>
                  <span
                    className={`rounded px-2 py-0.5 text-xs ${STATUS_STYLES[item.status] ?? "bg-zinc-800"}`}
                  >
                    {item.status}
                  </span>
                </div>
                <p className="mt-1 text-xs text-zinc-500">
                  {QUEUE_LABELS[item.archiveQueue] ?? item.archiveQueue} · {item.outcome}
                </p>
                <Link
                  href={`/pilot/executive-actions?session=${item.sessionId}`}
                  className="mt-2 inline-block text-xs text-cyan-400 underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  下钻行动
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {selected ? (
        <section className="rounded-2xl border border-violet-900/50 bg-violet-950/10 p-6">
          <h2 className="text-sm font-semibold text-violet-300">导出面板</h2>
          <p className="mt-2 text-xs text-zinc-500">
            关联 ID：简报 {selected.linkedIds.briefingPackIds.length} · 材料包{" "}
            {selected.linkedIds.boardPacketIds.length} · 治理{" "}
            {selected.linkedIds.governanceActionIds.length} · 行动{" "}
            {selected.linkedIds.executiveActionIds.length}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={acting || !selectedSession}
              onClick={() => void runAction("archive_record")}
              className="rounded-lg bg-violet-700 px-3 py-1.5 text-xs text-white disabled:opacity-40"
            >
              归档记录
            </button>
            {selectedRecordId ? (
              <>
                <button
                  type="button"
                  disabled={acting}
                  onClick={() =>
                    void runAction("restore_view", { archiveRecordId: selectedRecordId })
                  }
                  className="rounded-lg border border-zinc-600 px-3 py-1.5 text-xs disabled:opacity-40"
                >
                  恢复视图
                </button>
                <button
                  type="button"
                  disabled={acting}
                  onClick={() =>
                    void runAction("mark_reviewed", { archiveRecordId: selectedRecordId })
                  }
                  className="rounded-lg border border-emerald-800 px-3 py-1.5 text-xs text-emerald-300 disabled:opacity-40"
                >
                  标记已审阅
                </button>
              </>
            ) : null}
            <button
              type="button"
              disabled={acting}
              onClick={() =>
                void runAction("export_audit_bundle", {
                  sessionId: selectedSession,
                  archiveRecordId: selectedRecordId,
                })
              }
              className="rounded-lg border border-sky-800 px-3 py-1.5 text-xs text-sky-300 disabled:opacity-40"
            >
              导出审计包
            </button>
          </div>
        </section>
      ) : null}

      {trail ? (
        <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
          <h2 className="text-sm font-semibold text-white">审计检索 — {trail.sessionId.slice(0, 8)}</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium text-cyan-400">高管行动历史</p>
              <ol className="mt-2 space-y-1 text-xs text-zinc-400">
                {trail.executiveActionHistory.slice(0, 6).map((a, i) => (
                  <li key={i}>
                    {a.action} — {new Date(a.timestamp).toLocaleString()}
                  </li>
                ))}
              </ol>
            </div>
            <div>
              <p className="text-xs font-medium text-violet-400">简报包历史</p>
              <ol className="mt-2 space-y-1 text-xs text-zinc-400">
                {trail.briefingPackHistory.map((p) => (
                  <li key={p.packId}>
                    {p.title} ({p.status})
                  </li>
                ))}
              </ol>
            </div>
            <div>
              <p className="text-xs font-medium text-orange-400">决策轨迹</p>
              <ol className="mt-2 space-y-1 text-xs text-zinc-400">
                {trail.decisionTrail.slice(0, 6).map((d, i) => (
                  <li key={i}>
                    {d.action} — {d.note}
                  </li>
                ))}
              </ol>
            </div>
            <div>
              <p className="text-xs font-medium text-emerald-400">闭环轨迹</p>
              <ol className="mt-2 space-y-1 text-xs text-zinc-400">
                {trail.closureTrail.map((c, i) => (
                  <li key={i}>
                    {c.action} — {c.note}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>
      ) : null}

      {actions.length > 0 ? (
        <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
          <h2 className="text-sm font-semibold text-white">行动时间线</h2>
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
