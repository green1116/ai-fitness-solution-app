"use client";

import { useCallback, useEffect, useState } from "react";

type Audience = "internal" | "customer";

type HandoffPackage = {
  packageId: string;
  audience: Audience;
  builtAt: string;
  revision: number;
  fileName: string;
  approval: {
    sessionStatus: string;
    qaPassed: boolean;
    compliancePassed: boolean;
    clarificationsBlockingOpen: number;
    readyForV80: boolean;
    workflowStatus?: string;
  };
  requirementSummary: {
    projectName: string;
    organization: string;
    location: string;
    itemCount: number;
    mustCount: number;
    confirmedMustCount: number;
    withEvidenceCount: number;
    lowConfidenceCount: number;
  };
  customerBrief: {
    title: string;
    headline: string;
    bullets: string[];
    openQuestions: string[];
    riskNote?: string;
  };
  internalNotes: {
    blockers: string[];
    warnings: string[];
    nextActions: string[];
  };
  documents: Array<{ fileName: string; docType: string; priority: number }>;
  consolidation?: { conflicts: unknown[]; documentCount: number; keptItemCount: number };
  compliance?: {
    passed: boolean;
    blockingCount: number;
    warningCount: number;
    overallRisk: string;
    summary: string;
  };
  traceability: {
    contentHash: string;
    evidenceSample: Array<{
      text: string;
      sourceDocumentName?: string;
      pageRef?: string;
      evidenceExcerpts: Array<{ page: number; excerpt: string }>;
    }>;
    auditSteps: Array<{ step: string; timestamp: string; message?: string }>;
  };
};

type Props = {
  sessionId: string;
  readOnly?: boolean;
};

export function IntakeHandoffPackagePanel({ sessionId, readOnly = false }: Props) {
  const [audience, setAudience] = useState<Audience>("internal");
  const [pkg, setPkg] = useState<HandoffPackage | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const res = await fetch(
      `/api/pilot/v80/intake/${encodeURIComponent(sessionId)}/handoff-package?audience=${audience}`,
    );
    const data = await res.json();
    if (res.ok && data.ok) setPkg(data.package);
  }, [sessionId, audience]);

  useEffect(() => {
    void load();
  }, [load]);

  async function generate() {
    setBusy(true);
    setError("");
    try {
      const res = await fetch(
        `/api/pilot/v80/intake/${encodeURIComponent(sessionId)}/handoff-package`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ audience }),
        },
      );
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.message ?? data.code ?? "生成失败");
      setPkg(data.package);
    } catch (e) {
      setError(e instanceof Error ? e.message : "生成失败");
    } finally {
      setBusy(false);
    }
  }

  function download() {
    window.open(
      `/api/pilot/v80/intake/${encodeURIComponent(sessionId)}/handoff-package?audience=${audience}&download=1`,
      "_blank",
    );
  }

  return (
    <section className="space-y-3 rounded-xl border border-zinc-800 bg-black/40 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-medium text-zinc-200">交接摘要包</h3>
          <p className="text-xs text-zinc-500">
            批准前汇总需求、证据、澄清、多文档冲突、合规与追溯（预 V80）
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            className="rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-xs text-zinc-300"
            value={audience}
            onChange={(e) => setAudience(e.target.value as Audience)}
          >
            <option value="internal">内部视图</option>
            <option value="customer">客户视图</option>
          </select>
          {!readOnly ? (
            <button
              type="button"
              disabled={busy}
              onClick={() => void generate()}
              className="rounded-lg border border-sky-800 px-3 py-1.5 text-xs text-sky-300 disabled:opacity-40"
            >
              生成/刷新
            </button>
          ) : null}
          <button
            type="button"
            onClick={download}
            className="rounded-lg border border-zinc-600 px-3 py-1.5 text-xs text-zinc-300"
          >
            导出 JSON
          </button>
        </div>
      </div>

      {error ? <p className="text-xs text-rose-300">{error}</p> : null}

      {!pkg ? (
        <p className="text-xs text-zinc-600">尚未生成交接包，点击「生成/刷新」。</p>
      ) : (
        <div className="space-y-4 text-xs">
          <div className="flex flex-wrap gap-3 text-zinc-400">
            <span className="font-mono text-zinc-500">{pkg.packageId}</span>
            <span>
              V80 就绪：
              <span className={pkg.approval.readyForV80 ? "text-emerald-400" : "text-amber-300"}>
                {pkg.approval.readyForV80 ? "是" : "否"}
              </span>
            </span>
            <span>修订 v{pkg.revision}</span>
            <span className="font-mono text-zinc-600">
              hash {pkg.traceability.contentHash.slice(0, 12)}…
            </span>
          </div>

          {audience === "customer" ? (
            <div className="rounded-lg border border-zinc-800 p-3">
              <p className="font-medium text-zinc-200">{pkg.customerBrief.headline}</p>
              <p className="mt-1 text-zinc-400">{pkg.customerBrief.title}</p>
              <ul className="mt-2 list-disc space-y-1 pl-4 text-zinc-400">
                {pkg.customerBrief.bullets.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
              {pkg.customerBrief.openQuestions.length > 0 ? (
                <div className="mt-2">
                  <p className="text-amber-300">待确认问题</p>
                  <ul className="mt-1 list-disc pl-4 text-zinc-400">
                    {pkg.customerBrief.openQuestions.map((q) => (
                      <li key={q}>{q}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {pkg.customerBrief.riskNote ? (
                <p className="mt-2 text-rose-300">{pkg.customerBrief.riskNote}</p>
              ) : null}
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-lg border border-zinc-800 p-3">
                <p className="mb-1 font-medium text-zinc-300">内部阻断 / 警告</p>
                {pkg.internalNotes.blockers.length === 0 ? (
                  <p className="text-emerald-400">无阻断</p>
                ) : (
                  <ul className="list-disc pl-4 text-rose-300">
                    {pkg.internalNotes.blockers.map((b) => (
                      <li key={b}>{b}</li>
                    ))}
                  </ul>
                )}
                <ul className="mt-2 list-disc pl-4 text-amber-200/80">
                  {pkg.internalNotes.warnings.map((w) => (
                    <li key={w}>{w}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-lg border border-zinc-800 p-3">
                <p className="mb-1 font-medium text-zinc-300">下一步</p>
                <ul className="list-disc pl-4 text-zinc-400">
                  {pkg.internalNotes.nextActions.map((a) => (
                    <li key={a}>{a}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <div className="rounded-lg border border-zinc-800 p-3">
            <p className="mb-1 font-medium text-zinc-300">需求摘要</p>
            <p className="text-zinc-400">
              {pkg.requirementSummary.projectName} · {pkg.requirementSummary.organization} ·{" "}
              {pkg.requirementSummary.location}
            </p>
            <p className="mt-1 text-zinc-500">
              条目 {pkg.requirementSummary.itemCount} · 必选{" "}
              {pkg.requirementSummary.confirmedMustCount}/{pkg.requirementSummary.mustCount} ·
              有证据 {pkg.requirementSummary.withEvidenceCount} · 低置信{" "}
              {pkg.requirementSummary.lowConfidenceCount}
            </p>
          </div>

          <div className="rounded-lg border border-zinc-800 p-3">
            <p className="mb-1 font-medium text-zinc-300">文档 / 合并 / 合规</p>
            <ul className="text-zinc-500">
              {pkg.documents.map((d) => (
                <li key={`${d.fileName}-${d.priority}`}>
                  [{d.docType}] {d.fileName}
                </li>
              ))}
            </ul>
            {pkg.consolidation ? (
              <p className="mt-1 text-zinc-500">
                合并：{pkg.consolidation.documentCount} 文档 · 保留{" "}
                {pkg.consolidation.keptItemCount} · 冲突{" "}
                {pkg.consolidation.conflicts.length}
              </p>
            ) : null}
            {pkg.compliance ? (
              <p className="mt-1 text-zinc-400">{pkg.compliance.summary}</p>
            ) : null}
          </div>

          <div className="rounded-lg border border-zinc-800 p-3">
            <p className="mb-1 font-medium text-zinc-300">追溯</p>
            <ul className="max-h-32 space-y-1 overflow-y-auto text-zinc-500">
              {pkg.traceability.evidenceSample.slice(0, 6).map((e, i) => (
                <li key={`${e.text}-${i}`}>
                  {e.sourceDocumentName ? `${e.sourceDocumentName} · ` : ""}
                  {e.pageRef ?? (e.evidenceExcerpts[0] ? `p.${e.evidenceExcerpts[0].page}` : "")}
                  {" — "}
                  {e.text.slice(0, 60)}
                </li>
              ))}
            </ul>
            <p className="mt-2 text-zinc-600">
              审计步数 {pkg.traceability.auditSteps.length}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
