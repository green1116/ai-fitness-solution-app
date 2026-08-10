"use client";

import { useCallback, useEffect, useState } from "react";

import type {
  ComplianceValidationReport,
  IntakeComplianceState,
  KnowledgeReference,
} from "@/lib/pilot/v80/intake/compliance.schema";
import type { TenderRequirements } from "@/lib/pilot/v80/intake/requirements.schema";

type Props = {
  sessionId: string;
  requirements: TenderRequirements;
  readOnly?: boolean;
  onReportChange?: (report: ComplianceValidationReport | null) => void;
};

const RISK_LABEL: Record<string, string> = {
  critical: "严重",
  high: "高",
  medium: "中",
  low: "低",
  none: "无",
};

export function IntakeCompliancePanel({
  sessionId,
  requirements,
  readOnly = false,
  onReportChange,
}: Props) {
  const [compliance, setCompliance] = useState<IntakeComplianceState | null>(null);
  const [knowledgeRefs, setKnowledgeRefs] = useState<KnowledgeReference[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const apply = useCallback(
    (data: { compliance?: IntakeComplianceState; report?: ComplianceValidationReport }) => {
      if (data.compliance) setCompliance(data.compliance);
      onReportChange?.(data.report ?? data.compliance?.report ?? null);
    },
    [onReportChange],
  );

  const load = useCallback(async () => {
    const res = await fetch(`/api/pilot/v80/intake/${encodeURIComponent(sessionId)}/compliance`);
    const data = await res.json();
    if (res.ok && data.ok) {
      setCompliance(data.compliance ?? null);
      setKnowledgeRefs(data.knowledgeRefs ?? []);
      onReportChange?.(data.compliance?.report ?? null);
    }
  }, [sessionId, onReportChange]);

  useEffect(() => {
    void load();
  }, [load]);

  async function evaluate() {
    setBusy(true);
    setError("");
    try {
      const res = await fetch(
        `/api/pilot/v80/intake/${encodeURIComponent(sessionId)}/compliance`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "evaluate", requirements }),
        },
      );
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.message ?? data.code ?? "校验失败");
      apply(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "校验失败");
    } finally {
      setBusy(false);
    }
  }

  async function acknowledge(findingId: string, ruleId: string) {
    setBusy(true);
    setError("");
    try {
      const res = await fetch(
        `/api/pilot/v80/intake/${encodeURIComponent(sessionId)}/compliance`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "acknowledge", findingId, ruleId }),
        },
      );
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.message ?? data.code ?? "确认失败");
      apply(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "确认失败");
    } finally {
      setBusy(false);
    }
  }

  const report = compliance?.report;

  return (
    <section className="space-y-3 rounded-xl border border-zinc-800 bg-black/40 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-medium text-zinc-200">知识与合规校验</h3>
          <p className="text-xs text-zinc-500">
            {report
              ? `${report.summary} · 风险 ${RISK_LABEL[report.overallRisk] ?? report.overallRisk}`
              : "对照企业知识库与合规规则评估需求"}
          </p>
        </div>
        {!readOnly ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => void evaluate()}
            className="rounded-lg border border-sky-800 px-3 py-1.5 text-xs text-sky-300 disabled:opacity-40"
          >
            运行合规校验
          </button>
        ) : null}
      </div>

      {knowledgeRefs.length > 0 ? (
        <details className="text-xs text-zinc-500">
          <summary className="cursor-pointer text-zinc-400">
            知识参考（{knowledgeRefs.length}）
          </summary>
          <ul className="mt-2 max-h-28 space-y-1 overflow-y-auto">
            {knowledgeRefs.map((k) => (
              <li key={k.id}>
                <span className="text-zinc-300">{k.code ?? k.title}</span>
                <span className="ml-2 text-zinc-600">{k.summary}</span>
              </li>
            ))}
          </ul>
        </details>
      ) : null}

      {report ? (
        <ul className="max-h-56 space-y-2 overflow-y-auto">
          {report.findings.length === 0 ? (
            <li className="text-xs text-emerald-400">未发现问题</li>
          ) : (
            report.findings.map((f) => (
              <li
                key={f.id}
                className={`rounded-lg border p-2 text-xs ${
                  f.severity === "blocking"
                    ? "border-rose-900/70 bg-rose-950/30"
                    : f.severity === "warning"
                      ? "border-amber-900/50 bg-amber-950/20"
                      : "border-zinc-800"
                }`}
              >
                <div className="flex flex-wrap gap-2">
                  <span className="font-medium text-zinc-200">{f.title}</span>
                  <span className="text-zinc-500">{f.severity}</span>
                  <span className="text-zinc-600">risk:{f.risk}</span>
                  {f.acknowledged ? (
                    <span className="text-sky-400">已确认警告</span>
                  ) : null}
                </div>
                <p className="mt-1 text-zinc-400">{f.message}</p>
                <p className="mt-1 text-zinc-500">建议：{f.recommendation}</p>
                {!readOnly && f.severity === "warning" && !f.acknowledged ? (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void acknowledge(f.id, f.ruleId)}
                    className="mt-2 text-[11px] text-sky-400 underline disabled:opacity-40"
                  >
                    确认此警告
                  </button>
                ) : null}
              </li>
            ))
          )}
        </ul>
      ) : (
        <p className="text-xs text-zinc-600">尚未运行合规校验。</p>
      )}

      {error ? <p className="text-xs text-rose-300">{error}</p> : null}
    </section>
  );
}
