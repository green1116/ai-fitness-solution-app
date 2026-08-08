"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

type OpsStatus =
  | "healthy"
  | "in_review"
  | "generating"
  | "failed"
  | "stuck"
  | "partial"
  | "frozen"
  | "ready";

type OpsSnapshot = {
  sessionId: string;
  tenderIntakeId: string;
  fileName: string;
  status: string;
  opsStatus: OpsStatus;
  stuck: boolean;
  stuckReason?: string;
  updatedAt: string;
  workflowStatus?: string;
  productionProjectId?: string;
  productionQuoteId?: string;
  productionTenderId?: string;
  failure: {
    code: string;
    message: string;
    category: string;
    retryable: boolean;
  };
  recommendedAction: string;
  timeline: Array<{
    id: string;
    step: string;
    timestamp: string;
    message?: string;
    statusAfter?: string;
  }>;
};

type BoardResponse = {
  ok: boolean;
  counts?: Record<OpsStatus, number>;
  exceptions?: OpsSnapshot[];
  sessions?: OpsSnapshot[];
  code?: string;
};

const STATUS_LABEL: Record<OpsStatus, string> = {
  healthy: "正常",
  in_review: "审核中",
  generating: "生成中",
  failed: "失败",
  stuck: "卡住",
  partial: "半写",
  frozen: "已冻结",
  ready: "就绪",
};

function statusClass(s: OpsStatus): string {
  switch (s) {
    case "failed":
    case "stuck":
    case "partial":
      return "text-rose-300";
    case "generating":
      return "text-amber-300";
    case "ready":
      return "text-emerald-300";
    case "frozen":
      return "text-sky-300";
    default:
      return "text-zinc-300";
  }
}

export function IntakeOpsDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [counts, setCounts] = useState<Record<OpsStatus, number> | null>(null);
  const [exceptions, setExceptions] = useState<OpsSnapshot[]>([]);
  const [selected, setSelected] = useState<OpsSnapshot | null>(null);
  const [busyId, setBusyId] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/pilot/v80/intake/ops");
      const data = (await res.json()) as BoardResponse;
      if (!res.ok || !data.ok) {
        throw new Error(data.code || "LOAD_FAILED");
      }
      setCounts(data.counts ?? null);
      setExceptions(data.exceptions ?? []);
      setSelected((prev) => {
        if (!prev) return null;
        return (data.exceptions ?? []).find((e) => e.sessionId === prev.sessionId) ?? null;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "LOAD_FAILED");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function resume(sessionId: string, action: string) {
    setBusyId(sessionId);
    setError("");
    try {
      const res = await fetch(`/api/pilot/v80/intake/${sessionId}/ops/resume`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.code || data.message || "RESUME_FAILED");
      }
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "RESUME_FAILED");
    } finally {
      setBusyId("");
    }
  }

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-white">Intake 运维异常台</h1>
        <p className="max-w-2xl text-sm text-zinc-400">
          查看卡住与失败的 Intake、失败原因归类，并安全重试 / 恢复（复用 P3 批准与生成路径）。
        </p>
      </header>

      {counts ? (
        <div className="flex flex-wrap gap-4 text-sm text-zinc-400">
          {(Object.keys(STATUS_LABEL) as OpsStatus[]).map((key) => (
            <span key={key}>
              {STATUS_LABEL[key]}{" "}
              <span className={`font-medium ${statusClass(key)}`}>{counts[key] ?? 0}</span>
            </span>
          ))}
        </div>
      ) : null}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => void load()}
          className="rounded-lg border border-zinc-700 px-3 py-1.5 text-sm text-zinc-200 hover:bg-zinc-900"
        >
          刷新
        </button>
        <Link href="/pilot/intake" className="rounded-lg px-3 py-1.5 text-sm text-zinc-400 hover:text-white">
          返回 Intake
        </Link>
      </div>

      {error ? (
        <p className="rounded-lg border border-rose-900/60 bg-rose-950/40 px-3 py-2 text-sm text-rose-200">
          {error}
        </p>
      ) : null}

      {loading ? (
        <p className="text-sm text-zinc-500">加载中…</p>
      ) : exceptions.length === 0 ? (
        <p className="text-sm text-zinc-500">当前无失败 / 卡住 / 半写 / 生成中的会话。</p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <ul className="divide-y divide-zinc-800/80 rounded-xl border border-zinc-800">
            {exceptions.map((row) => (
              <li key={row.sessionId}>
                <button
                  type="button"
                  onClick={() => setSelected(row)}
                  className={`flex w-full flex-col gap-1 px-4 py-3 text-left hover:bg-zinc-900/60 ${
                    selected?.sessionId === row.sessionId ? "bg-zinc-900/80" : ""
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="truncate text-sm font-medium text-white">{row.fileName}</span>
                    <span className={`shrink-0 text-xs ${statusClass(row.opsStatus)}`}>
                      {STATUS_LABEL[row.opsStatus]}
                    </span>
                  </div>
                  <div className="truncate text-xs text-zinc-500">
                    {row.failure.code !== "NONE" ? row.failure.message || row.failure.code : row.status}
                    {" · "}
                    {row.tenderIntakeId}
                  </div>
                </button>
              </li>
            ))}
          </ul>

          {selected ? (
            <aside className="space-y-4 rounded-xl border border-zinc-800 p-4">
              <div>
                <h2 className="text-lg font-medium text-white">{selected.fileName}</h2>
                <p className="text-xs text-zinc-500">{selected.sessionId}</p>
              </div>

              <dl className="grid grid-cols-2 gap-2 text-xs text-zinc-400">
                <div>
                  <dt>运维状态</dt>
                  <dd className={statusClass(selected.opsStatus)}>
                    {STATUS_LABEL[selected.opsStatus]}
                  </dd>
                </div>
                <div>
                  <dt>会话状态</dt>
                  <dd className="text-zinc-200">{selected.status}</dd>
                </div>
                <div>
                  <dt>失败码</dt>
                  <dd className="text-zinc-200">{selected.failure.code}</dd>
                </div>
                <div>
                  <dt>建议动作</dt>
                  <dd className="text-zinc-200">{selected.recommendedAction}</dd>
                </div>
              </dl>

              {selected.failure.message ? (
                <p className="text-sm text-rose-200/90">{selected.failure.message}</p>
              ) : null}

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={busyId === selected.sessionId || selected.opsStatus === "partial"}
                  onClick={() => void resume(selected.sessionId, "auto")}
                  className="rounded-lg bg-white px-3 py-1.5 text-sm font-medium text-black disabled:opacity-40"
                >
                  自动恢复
                </button>
                <button
                  type="button"
                  disabled={busyId === selected.sessionId || selected.opsStatus === "partial"}
                  onClick={() => void resume(selected.sessionId, "retry")}
                  className="rounded-lg border border-zinc-600 px-3 py-1.5 text-sm text-zinc-200 disabled:opacity-40"
                >
                  重试生成
                </button>
                <button
                  type="button"
                  disabled={busyId === selected.sessionId || selected.opsStatus === "partial"}
                  onClick={() => void resume(selected.sessionId, "resume_approve")}
                  className="rounded-lg border border-zinc-600 px-3 py-1.5 text-sm text-zinc-200 disabled:opacity-40"
                >
                  恢复批准
                </button>
              </div>

              {selected.opsStatus === "partial" ? (
                <p className="text-xs text-amber-200/90">
                  半写状态禁止自动重试，请人工核对 Project / Quote / Tender 后处理。
                </p>
              ) : null}

              <div>
                <h3 className="mb-2 text-sm font-medium text-zinc-300">状态时间线</h3>
                <ol className="max-h-64 space-y-2 overflow-y-auto text-xs text-zinc-500">
                  {selected.timeline.length === 0 ? (
                    <li>暂无审计记录</li>
                  ) : (
                    selected.timeline.map((t) => (
                      <li key={t.id} className="border-l border-zinc-700 pl-3">
                        <div className="text-zinc-400">
                          {t.step}
                          {t.statusAfter ? ` → ${t.statusAfter}` : ""}
                        </div>
                        <div>{t.message || t.timestamp}</div>
                      </li>
                    ))
                  )}
                </ol>
              </div>

              <Link
                href={`/pilot/intake?sessionId=${selected.sessionId}`}
                className="inline-block text-sm text-zinc-400 hover:text-white"
              >
                打开 Intake 会话 →
              </Link>
            </aside>
          ) : (
            <p className="text-sm text-zinc-500">选择一条异常查看诊断与恢复操作。</p>
          )}
        </div>
      )}
    </div>
  );
}
