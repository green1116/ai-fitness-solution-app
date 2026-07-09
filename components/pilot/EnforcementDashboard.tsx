"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type QueueItem = {
  sessionId: string;
  archiveRecordId: string;
  projectName?: string;
  policyDue: string;
  policyStatus: string;
  dueDate: string;
  nextStep: string;
  isBlocked: boolean;
};

type Summary = {
  total: number;
  reviewDue: number;
  retentionDue: number;
  purgeDue: number;
  exportDue: number;
  holdRequired: number;
  blocked: number;
  enforced: number;
  actionsTaken: number;
};

type Enforcement = {
  policyStatus: string;
  nextStep: string;
  dueDates: Record<string, string | undefined>;
  blockedItems: QueueItem[];
};

type ActionEntry = {
  id: string;
  action: string;
  timestamp: string;
  note?: string;
  sessionId?: string;
};

const DUE_LABELS: Record<string, string> = {
  review_due: "审阅到期",
  retention_due: "保留到期",
  purge_due: "清除到期",
  export_due: "导出到期",
  hold_required: "需 Hold",
};

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-zinc-800 text-zinc-300",
  enforced: "bg-emerald-950 text-emerald-300",
  blocked: "bg-red-950 text-red-300",
  completed: "bg-sky-950 text-sky-300",
};

export function EnforcementDashboard() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [enforcement, setEnforcement] = useState<Enforcement | null>(null);
  const [items, setItems] = useState<QueueItem[]>([]);
  const [actions, setActions] = useState<ActionEntry[]>([]);
  const [selectedArchiveId, setSelectedArchiveId] = useState("");
  const [auditPreview, setAuditPreview] = useState("");
  const [error, setError] = useState("");
  const [acting, setActing] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/pilot/v98/policy-enforcement");
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.message ?? data.code ?? "加载失败");
      const d = data.dashboard;
      setSummary(d.summary ?? null);
      setEnforcement(d.enforcement ?? null);
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

  async function runAction(action: string) {
    if (!selectedArchiveId) return;
    setActing(true);
    setError("");
    try {
      const res = await fetch("/api/pilot/v98/policy-enforcement/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, archiveRecordId: selectedArchiveId }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.message ?? data.code ?? "操作失败");
      if (data.auditSnapshot) {
        setAuditPreview(JSON.stringify(data.auditSnapshot, null, 2));
      }
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "操作失败");
    } finally {
      setActing(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-zinc-500">加载策略执行面板…</p>;
  }

  const selected = items.find((i) => i.archiveRecordId === selectedArchiveId);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-zinc-500">策略执行 — 只读合规/归档层 + 执行缓存写入</p>
        <button
          type="button"
          onClick={() => void load()}
          className="text-xs text-zinc-400 underline hover:text-white"
        >
          刷新
        </button>
      </div>

      {summary && enforcement ? (
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "策略项", value: summary.total },
            { label: "审阅到期", value: summary.reviewDue },
            { label: "已执行", value: summary.enforced },
            { label: "阻断", value: summary.blocked },
          ].map((c) => (
            <div key={c.label} className="rounded-xl border border-zinc-800 bg-zinc-950 p-3">
              <p className="text-xs text-zinc-500">{c.label}</p>
              <p className="text-xl font-bold text-cyan-300">{c.value}</p>
            </div>
          ))}
        </section>
      ) : null}

      {enforcement ? (
        <section className="rounded-2xl border border-cyan-900/50 bg-cyan-950/10 p-6">
          <h2 className="text-sm font-semibold text-cyan-300">策略状态</h2>
          <p className="mt-2 text-sm text-zinc-300">下一步：{enforcement.nextStep}</p>
          <p className="mt-1 text-xs text-zinc-500">
            状态 {enforcement.policyStatus}
            {enforcement.dueDates.reviewDue
              ? ` · 审阅截止 ${new Date(enforcement.dueDates.reviewDue).toLocaleDateString("zh-CN")}`
              : ""}
          </p>
        </section>
      ) : null}

      {selected ? (
        <section className="rounded-2xl border border-violet-900/50 bg-violet-950/10 p-6">
          <h2 className="text-sm font-semibold text-violet-300">自动执行</h2>
          <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-medium text-white">
                {selected.projectName ?? selected.sessionId.slice(0, 8)}
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                {DUE_LABELS[selected.policyDue] ?? selected.policyDue} · 截止{" "}
                {new Date(selected.dueDate).toLocaleDateString("zh-CN")}
              </p>
              <p className="text-xs text-zinc-500">{selected.nextStep}</p>
            </div>
            <span
              className={`rounded px-2 py-0.5 text-xs ${STATUS_STYLES[selected.policyStatus] ?? "bg-zinc-800"}`}
            >
              {selected.policyStatus}
            </span>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={acting}
              onClick={() => void runAction("auto_assign_reviewer")}
              className="rounded-lg border border-zinc-600 px-3 py-1.5 text-xs disabled:opacity-40"
            >
              自动分配审阅人
            </button>
            <button
              type="button"
              disabled={acting}
              onClick={() => void runAction("auto_mark_due")}
              className="rounded-lg border border-amber-800 px-3 py-1.5 text-xs text-amber-300 disabled:opacity-40"
            >
              自动标记到期
            </button>
            <button
              type="button"
              disabled={acting}
              onClick={() => void runAction("auto_hold")}
              className="rounded-lg border border-violet-800 px-3 py-1.5 text-xs text-violet-300 disabled:opacity-40"
            >
              自动 Hold
            </button>
            <button
              type="button"
              disabled={acting}
              onClick={() => void runAction("auto_purge")}
              className="rounded-lg border border-red-800 px-3 py-1.5 text-xs text-red-300 disabled:opacity-40"
            >
              自动清除
            </button>
            <button
              type="button"
              disabled={acting}
              onClick={() => void runAction("auto_request_export")}
              className="rounded-lg bg-sky-800 px-3 py-1.5 text-xs text-white disabled:opacity-40"
            >
              自动请求导出
            </button>
          </div>
        </section>
      ) : null}

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-white">策略队列</h2>
        {items.length === 0 ? (
          <p className="text-sm text-zinc-500">暂无策略项 — 请先从合规层完成审阅</p>
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
                    {DUE_LABELS[item.policyDue] ?? item.policyDue}
                  </span>
                </div>
                <p className="mt-1 text-xs text-zinc-500">{item.nextStep}</p>
                <Link
                  href={`/pilot/executive-compliance?session=${item.sessionId}`}
                  className="mt-2 inline-block text-xs text-cyan-400 underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  下钻合规
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {actions.length > 0 ? (
        <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
          <h2 className="text-sm font-semibold text-white">到期时间线</h2>
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

      {auditPreview ? (
        <section className="rounded-2xl border border-sky-900/50 bg-sky-950/10 p-4">
          <h2 className="text-sm font-semibold text-sky-300">审计快照</h2>
          <pre className="mt-2 max-h-48 overflow-auto text-xs text-zinc-400">{auditPreview}</pre>
        </section>
      ) : null}

      {error ? <p className="text-sm text-red-400">{error}</p> : null}
    </div>
  );
}
