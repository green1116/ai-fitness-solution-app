"use client";

import { useCallback, useEffect, useState } from "react";

import type { TenderRequirements } from "@/lib/pilot/v80";

type QaCheck = { id: string; passed: boolean; message: string };

type QaState = {
  passed: boolean;
  handoffReady: boolean;
  reasonCode: string;
  reasonMessage: string;
  checks: QaCheck[];
  productionReadiness?: {
    projectName: string;
    organization: string;
    hasScope: boolean;
    requirementCount: number;
    syncPackageReady: boolean;
    workflowKey: string;
  };
};

type IntakeQAGatePanelProps = {
  sessionId: string;
  requirements: TenderRequirements;
  onQaChange?: (state: QaState | null) => void;
};

const REASON_LABELS: Record<string, string> = {
  QA_PASS: "QA 通过",
  SCHEMA_INCOMPLETE: "Schema 不完整",
  REQUIRED_FIELD_MISSING: "必填字段缺失",
  PARSE_EMPTY: "解析为空",
  PARTIAL_WRITE_DETECTED: "部分写入",
  WORKFLOW_CONFLICT: "工作流冲突",
  SESSION_LOCKED: "会话锁定",
  VALIDATION_FAILED: "校验失败",
  ALREADY_HANDED_OFF: "已交接",
};

export function IntakeQAGatePanel({
  sessionId,
  requirements,
  onQaChange,
}: IntakeQAGatePanelProps) {
  const [qa, setQa] = useState<QaState | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const runQa = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/pilot/v80/intake/qa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, requirements }),
      });
      const data = await res.json();
      if (!data.qa) throw new Error(data.message ?? data.code ?? "QA 检查失败");

      const next: QaState = {
        passed: data.qa.passed === true,
        handoffReady: data.qa.handoffReady === true,
        reasonCode: data.qa.reasonCode,
        reasonMessage: data.qa.reasonMessage,
        checks: data.qa.checks ?? [],
        productionReadiness: data.qa.productionReadiness,
      };
      setQa(next);
      onQaChange?.(next);
    } catch (e) {
      setError(e instanceof Error ? e.message : "QA 检查失败");
      setQa(null);
      onQaChange?.(null);
    } finally {
      setLoading(false);
    }
  }, [sessionId, requirements, onQaChange]);

  useEffect(() => {
    void runQa();
  }, [runQa]);

  return (
    <section className="space-y-4 rounded-2xl border border-violet-900/40 bg-violet-950/15 p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold text-violet-200">QA 门禁</h2>
          <p className="mt-1 text-xs text-zinc-500">批准前必须通过 QA，方可交接生产 V80</p>
        </div>
        <button
          type="button"
          disabled={loading}
          onClick={() => void runQa()}
          className="text-xs text-violet-300 underline disabled:opacity-40"
        >
          {loading ? "检查中…" : "重新检查"}
        </button>
      </div>

      {qa ? (
        <>
          <div
            className={
              qa.handoffReady
                ? "rounded-lg border border-emerald-900/50 bg-emerald-950/30 px-4 py-3"
                : "rounded-lg border border-red-900/50 bg-red-950/30 px-4 py-3"
            }
          >
            <p
              className={
                qa.handoffReady ? "text-sm font-medium text-emerald-300" : "text-sm font-medium text-red-300"
              }
            >
              {qa.handoffReady ? "可交接生产" : "QA 未通过"}
            </p>
            <p className="mt-1 text-xs text-zinc-400">
              {REASON_LABELS[qa.reasonCode] ?? qa.reasonCode}: {qa.reasonMessage}
            </p>
          </div>

          <ul className="space-y-1">
            {qa.checks.map((check) => (
              <li
                key={check.id}
                className="flex items-center justify-between rounded border border-zinc-800 px-3 py-2 text-xs"
              >
                <span className="text-zinc-400">{check.id}</span>
                <span className={check.passed ? "text-emerald-400" : "text-red-400"}>
                  {check.passed ? "PASS" : "FAIL"} — {check.message}
                </span>
              </li>
            ))}
          </ul>

          {qa.productionReadiness ? (
            <div className="rounded-lg border border-zinc-800 bg-black/30 p-4">
              <h3 className="text-sm font-medium text-zinc-300">生产就绪摘要</h3>
              <dl className="mt-2 space-y-1 text-xs text-zinc-400">
                <div>
                  <dt className="inline text-zinc-600">项目: </dt>
                  <dd className="inline">{qa.productionReadiness.projectName}</dd>
                </div>
                <div>
                  <dt className="inline text-zinc-600">单位: </dt>
                  <dd className="inline">{qa.productionReadiness.organization || "—"}</dd>
                </div>
                <div>
                  <dt className="inline text-zinc-600">需求条数: </dt>
                  <dd className="inline">{qa.productionReadiness.requirementCount}</dd>
                </div>
                <div>
                  <dt className="inline text-zinc-600">同步包: </dt>
                  <dd className="inline">
                    {qa.productionReadiness.syncPackageReady ? "就绪" : "未就绪"}
                  </dd>
                </div>
                <div>
                  <dt className="inline text-zinc-600">工作流: </dt>
                  <dd className="inline">{qa.productionReadiness.workflowKey}</dd>
                </div>
              </dl>
            </div>
          ) : null}
        </>
      ) : null}

      {error ? <p className="text-sm text-red-400">{error}</p> : null}
    </section>
  );
}
