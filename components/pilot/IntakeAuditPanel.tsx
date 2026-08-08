"use client";

import { useCallback, useEffect, useState } from "react";

type AuditEntry = {
  id: string;
  step: string;
  timestamp: string;
  actorId: string;
  message?: string;
  statusBefore?: string;
  statusAfter?: string;
  workflowStatusBefore?: string;
  workflowStatusAfter?: string;
  meta?: Record<string, unknown>;
};

type Revision = {
  auditEntryId: string;
  step: string;
  timestamp: string;
  actorId: string;
  projectName?: string;
  valid?: boolean;
  revision?: number;
};

type DeliveryLock = {
  frozen: boolean;
  frozenAt?: string;
  frozenBy?: string;
  freezeReasonCode?: string;
  freezeReasonMessage?: string;
  readOnly: boolean;
  deliveryLocked: boolean;
};

type HistoryState = {
  timeline: AuditEntry[];
  revisions: Revision[];
  traceability: Record<string, string | number | undefined>;
  canRecover: boolean;
  canRetry: boolean;
  deliveryLock?: DeliveryLock;
  lastFailure?: { message: string; step?: string };
};

const STEP_LABELS: Record<string, string> = {
  upload: "上传",
  parse: "解析",
  extract: "抽取",
  "re-extract": "重新抽取",
  item_review: "条目审核",
  patch: "编辑",
  reset: "重置",
  validate: "校验",
  approve: "批准",
  generate: "生成",
  retry: "重试",
  recover: "恢复",
  qa: "QA 门禁",
  handoff: "生产交接",
  freeze: "冻结",
  delivery_lock: "交付锁定",
  signoff: "最终签收",
  release_package: "发布包",
};

type IntakeAuditPanelProps = {
  sessionId: string;
  onRecovered?: () => void;
};

export function IntakeAuditPanel({ sessionId, onRecovered }: IntakeAuditPanelProps) {
  const [history, setHistory] = useState<HistoryState | null>(null);
  const [error, setError] = useState("");
  const [acting, setActing] = useState("");

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/pilot/v80/intake/${encodeURIComponent(sessionId)}/history`);
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.message ?? data.code ?? "加载历史失败");
      setHistory({
        timeline: data.timeline ?? [],
        revisions: data.revisions ?? [],
        traceability: data.traceability ?? {},
        canRecover: data.canRecover ?? false,
        canRetry: data.canRetry ?? false,
        deliveryLock: data.deliveryLock,
        lastFailure: data.lastFailure,
      });
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "加载历史失败");
    }
  }, [sessionId]);

  useEffect(() => {
    void load();
    const timer = setInterval(() => void load(), 4000);
    return () => clearInterval(timer);
  }, [load]);

  async function recover(
    action: "restore_snapshot" | "rollback_valid" | "retry_generation",
    auditEntryId?: string,
  ) {
    setActing(action);
    setError("");
    try {
      const res = await fetch(`/api/pilot/v80/intake/${encodeURIComponent(sessionId)}/recover`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, auditEntryId }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.message ?? data.code ?? "恢复失败");
      await load();
      onRecovered?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "恢复失败");
    } finally {
      setActing("");
    }
  }

  if (!history) {
    return (
      <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
        <p className="text-sm text-zinc-500">加载审计记录…</p>
      </section>
    );
  }

  return (
    <section className="space-y-6 rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-white">审计与恢复</h2>
        <button
          type="button"
          onClick={() => void load()}
          className="text-xs text-zinc-400 underline hover:text-white"
        >
          刷新
        </button>
      </div>

      {history.deliveryLock?.frozen ? (
        <div className="rounded-lg border border-amber-900/50 bg-amber-950/30 p-4">
          <p className="text-sm font-medium text-amber-200">交付已冻结 · 只读</p>
          <p className="mt-1 text-xs text-amber-100/80">
            {history.deliveryLock.freezeReasonMessage ?? "恢复操作已禁用，请通过显式 recovery 流程（管理员）"}
          </p>
        </div>
      ) : null}

      {history.lastFailure ? (
        <div className="rounded-lg border border-red-900/50 bg-red-950/30 p-4">
          <p className="text-sm font-medium text-red-300">最近失败</p>
          <p className="mt-1 text-xs text-red-200/90">
            {history.lastFailure.step ? `步骤 ${history.lastFailure.step}: ` : ""}
            {history.lastFailure.message}
          </p>
        </div>
      ) : null}

      <div>
        <h3 className="text-sm font-medium text-zinc-300">追溯 ID</h3>
        <dl className="mt-2 grid gap-1 font-mono text-xs text-zinc-500 sm:grid-cols-2">
          {Object.entries(history.traceability).map(([key, value]) =>
            value ? (
              <div key={key}>
                <dt className="inline text-zinc-600">{key}: </dt>
                <dd className="inline break-all text-zinc-400">{String(value)}</dd>
              </div>
            ) : null,
          )}
        </dl>
      </div>

      <div>
        <h3 className="text-sm font-medium text-zinc-300">需求版本</h3>
        {history.revisions.length === 0 ? (
          <p className="mt-2 text-xs text-zinc-500">暂无版本记录</p>
        ) : (
          <ul className="mt-2 space-y-2">
            {history.revisions.map((rev) => (
              <li
                key={rev.auditEntryId}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-zinc-800 px-3 py-2 text-xs"
              >
                <div>
                  <span className="text-zinc-300">
                    {typeof rev.revision === "number" ? `v${rev.revision} · ` : ""}
                    {STEP_LABELS[rev.step] ?? rev.step}
                    {rev.projectName ? ` · ${rev.projectName}` : ""}
                  </span>
                  <span className="ml-2 text-zinc-600">
                    {new Date(rev.timestamp).toLocaleString()}
                  </span>
                  {rev.valid === true ? (
                    <span className="ml-2 text-emerald-500">有效</span>
                  ) : rev.valid === false ? (
                    <span className="ml-2 text-red-400">无效</span>
                  ) : null}
                </div>
                {history.canRecover ? (
                  <button
                    type="button"
                    disabled={acting !== ""}
                    onClick={() => void recover("restore_snapshot", rev.auditEntryId)}
                    className="text-sky-300 underline disabled:opacity-40"
                  >
                    还原
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h3 className="text-sm font-medium text-zinc-300">时间线</h3>
        <ol className="mt-2 max-h-64 space-y-2 overflow-y-auto">
          {[...history.timeline].reverse().map((entry) => (
            <li
              key={entry.id}
              className="rounded-lg border border-zinc-800/80 bg-black/30 px-3 py-2 text-xs"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium text-zinc-200">
                  {STEP_LABELS[entry.step] ?? entry.step}
                </span>
                <span className="text-zinc-600">{new Date(entry.timestamp).toLocaleString()}</span>
              </div>
              {entry.message ? <p className="mt-1 text-zinc-400">{entry.message}</p> : null}
              {entry.statusBefore || entry.statusAfter ? (
                <p className="mt-1 text-zinc-600">
                  状态 {entry.statusBefore ?? "—"} → {entry.statusAfter ?? "—"}
                  {entry.workflowStatusAfter ? ` · workflow: ${entry.workflowStatusAfter}` : ""}
                </p>
              ) : null}
            </li>
          ))}
        </ol>
      </div>

      <div className="flex flex-wrap gap-3">
        {history.canRecover ? (
          <button
            type="button"
            disabled={acting !== ""}
            onClick={() => void recover("rollback_valid")}
            className="rounded-lg border border-zinc-600 px-4 py-2 text-sm disabled:opacity-40"
          >
            {acting === "rollback_valid" ? "回滚中…" : "回滚到最后有效审核"}
          </button>
        ) : null}
        {history.canRetry ? (
          <button
            type="button"
            disabled={acting !== ""}
            onClick={() => void recover("retry_generation")}
            className="rounded-lg border border-amber-700 px-4 py-2 text-sm text-amber-200 disabled:opacity-40"
          >
            {acting === "retry_generation" ? "重试中…" : "重试生成"}
          </button>
        ) : null}
      </div>

      {error ? <p className="text-sm text-red-400">{error}</p> : null}
    </section>
  );
}
