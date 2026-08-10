"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import type {
  RequirementItem,
  RequirementItemListKey,
  RequirementReviewStatus,
  TenderRequirements,
} from "@/lib/pilot/v80/intake/requirements.schema";
import { itemNeedsEvidenceConfirmation } from "@/lib/pilot/v80/intake/confidence.service";
import { IntakeBootstrapKickoffPanel } from "@/components/pilot/IntakeBootstrapKickoffPanel";
import { IntakeClarificationPanel } from "@/components/pilot/IntakeClarificationPanel";
import { IntakeCompliancePanel } from "@/components/pilot/IntakeCompliancePanel";
import { IntakeHandoffPackagePanel } from "@/components/pilot/IntakeHandoffPackagePanel";
import { IntakeMultiDocPanel } from "@/components/pilot/IntakeMultiDocPanel";
import { IntakeCrossProjectPanel } from "@/components/pilot/IntakeCrossProjectPanel";
import { IntakeOrgKnowledgePanel } from "@/components/pilot/IntakeOrgKnowledgePanel";
import { IntakeQAGatePanel } from "@/components/pilot/IntakeQAGatePanel";

export type ValidationIssue = { path: string; message: string };

type IntakeReviewEditorProps = {
  sessionId: string;
  tenderIntakeId: string;
  requirements: TenderRequirements;
  extractedRequirements?: TenderRequirements | null;
  revision?: number;
  readOnly?: boolean;
  onRequirementsChange: (req: TenderRequirements, meta?: { revision?: number }) => void;
  onApproved: (result: {
    projectId: string;
    tenderId: string;
    quoteId: string;
    workflowJobId?: string;
    workflowStatus?: string;
    generationPhase?: string;
  }) => void;
};

const SCALAR_FIELDS: { key: keyof TenderRequirements; label: string; multiline?: boolean }[] = [
  { key: "projectName", label: "项目名称 *" },
  { key: "organization", label: "招标单位" },
  { key: "industry", label: "行业" },
  { key: "location", label: "地点" },
  { key: "scope", label: "范围概述", multiline: true },
];

const STRING_LIST_FIELDS: { key: "objectives" | "deliverables" | "risks"; label: string }[] = [
  { key: "objectives", label: "项目目标（每行一条）" },
  { key: "deliverables", label: "交付物（每行一条）" },
  { key: "risks", label: "风险（每行一条）" },
];

const ITEM_LIST_FIELDS: { key: RequirementItemListKey; label: string }[] = [
  { key: "functionalRequirements", label: "功能需求" },
  { key: "technicalRequirements", label: "技术需求" },
  { key: "equipment", label: "设备" },
  { key: "space", label: "空间" },
  { key: "compliance", label: "合规" },
  { key: "evaluation", label: "评标" },
];

function statusLabel(status: RequirementReviewStatus | undefined): string {
  if (status === "confirmed") return "已确认";
  if (status === "rejected") return "已驳回";
  return "待审";
}

function statusClass(status: RequirementReviewStatus | undefined): string {
  if (status === "confirmed") return "text-emerald-400 border-emerald-800";
  if (status === "rejected") return "text-red-400 border-red-900";
  return "text-amber-400 border-amber-900";
}

function confidenceClass(band: RequirementItem["confidenceBand"]): string {
  if (band === "high") return "text-emerald-400 border-emerald-900/60";
  if (band === "medium") return "text-amber-300 border-amber-900/60";
  return "text-rose-300 border-rose-900/60";
}

function confidenceLabel(item: RequirementItem): string {
  const band = item.confidenceBand ?? "low";
  const score =
    typeof item.confidence === "number" ? ` ${(item.confidence * 100).toFixed(0)}%` : "";
  if (band === "high") return `高置信${score}`;
  if (band === "medium") return `中置信${score}`;
  return `低置信${score}`;
}

export function IntakeReviewEditor({
  sessionId,
  tenderIntakeId,
  requirements,
  extractedRequirements,
  revision = 0,
  readOnly = false,
  onRequirementsChange,
  onApproved,
}: IntakeReviewEditorProps) {
  const [local, setLocal] = useState(requirements);
  const [localRevision, setLocalRevision] = useState(revision);
  const [validationErrors, setValidationErrors] = useState<ValidationIssue[]>([]);
  const [saving, setSaving] = useState(false);
  const [approving, setApproving] = useState(false);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState("");
  const [handoffReady, setHandoffReady] = useState(false);
  const [complianceBlocking, setComplianceBlocking] = useState(0);

  useEffect(() => {
    setLocal(requirements);
  }, [requirements]);

  useEffect(() => {
    setLocalRevision(revision);
  }, [revision]);

  const dirty = useMemo(
    () => JSON.stringify(local) !== JSON.stringify(requirements),
    [local, requirements],
  );

  const pendingMustCount = useMemo(() => {
    let n = 0;
    for (const { key } of ITEM_LIST_FIELDS) {
      for (const item of local[key]) {
        if (!item.text.trim()) continue;
        if ((item.priority ?? "must") !== "must") continue;
        if (item.reviewStatus === "rejected") continue;
        if (item.reviewStatus !== "confirmed") n += 1;
      }
    }
    return n;
  }, [local]);

  const evidenceGateCount = useMemo(() => {
    let n = 0;
    for (const { key } of ITEM_LIST_FIELDS) {
      for (const item of local[key]) {
        if (itemNeedsEvidenceConfirmation(item)) n += 1;
      }
    }
    return n;
  }, [local]);

  const lowConfidenceCount = useMemo(() => {
    let n = 0;
    for (const { key } of ITEM_LIST_FIELDS) {
      for (const item of local[key]) {
        if (!item.text.trim()) continue;
        if (item.confidenceBand === "low" || (item.confidence ?? 1) < 0.5) n += 1;
      }
    }
    return n;
  }, [local]);

  const updateScalar = useCallback((key: keyof TenderRequirements, value: string) => {
    setLocal((prev) => ({ ...prev, [key]: value }));
    setValidationErrors([]);
  }, []);

  const updateStringList = useCallback(
    (key: "objectives" | "deliverables" | "risks", value: string) => {
      setLocal((prev) => ({
        ...prev,
        [key]: value.split("\n").map((s) => s.trim()).filter(Boolean),
      }));
      setValidationErrors([]);
    },
    [],
  );

  const updateItemText = useCallback(
    (listKey: RequirementItemListKey, itemId: string, text: string) => {
      setLocal((prev) => ({
        ...prev,
        [listKey]: prev[listKey].map((item) =>
          item.id === itemId ? { ...item, text, reviewStatus: "pending" as const } : item,
        ),
      }));
      setValidationErrors([]);
    },
    [],
  );

  async function applyServerResult(data: {
    requirements?: TenderRequirements;
    validation?: { errors?: ValidationIssue[] };
    revision?: number;
  }) {
    if (data.requirements) {
      setLocal(data.requirements);
      onRequirementsChange(data.requirements, { revision: data.revision });
    }
    if (typeof data.revision === "number") setLocalRevision(data.revision);
    setValidationErrors(data.validation?.errors ?? []);
  }

  async function saveDraft() {
    setSaving(true);
    setActionError("");
    try {
      const res = await fetch(`/api/pilot/v80/intake/${encodeURIComponent(sessionId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requirements: local }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.message ?? data.code ?? "保存失败");
      await applyServerResult(data);
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "保存失败");
    } finally {
      setSaving(false);
    }
  }

  async function validateOnly() {
    setActionError("");
    const res = await fetch("/api/pilot/v80/intake/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, requirements: local }),
    });
    const data = await res.json();
    setValidationErrors(data.validation?.errors ?? []);
    return data.validation?.valid === true;
  }

  async function handleReset() {
    setActionError("");
    setBusy(true);
    try {
      const res = await fetch(`/api/pilot/v80/intake/${encodeURIComponent(sessionId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reset: true }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.message ?? data.code ?? "重置失败");
      await applyServerResult(data);
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "重置失败");
    } finally {
      setBusy(false);
    }
  }

  async function handleReExtract() {
    setActionError("");
    setBusy(true);
    try {
      const res = await fetch("/api/pilot/v80/intake/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, mode: "replace" }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.message ?? data.code ?? "重抽失败");
      await applyServerResult(data);
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "重抽失败");
    } finally {
      setBusy(false);
    }
  }

  async function handleItemReview(
    listKey: RequirementItemListKey,
    itemId: string,
    reviewStatus: RequirementReviewStatus,
  ) {
    setActionError("");
    setBusy(true);
    try {
      if (dirty) {
        const saveRes = await fetch(`/api/pilot/v80/intake/${encodeURIComponent(sessionId)}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ requirements: local }),
        });
        const saveData = await saveRes.json();
        if (!saveRes.ok || !saveData.ok) throw new Error(saveData.message ?? "保存失败");
        await applyServerResult(saveData);
      }

      const res = await fetch(`/api/pilot/v80/intake/${encodeURIComponent(sessionId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemReview: { listKey, itemId, reviewStatus } }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.message ?? data.code ?? "审核失败");
      await applyServerResult(data);
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "审核失败");
    } finally {
      setBusy(false);
    }
  }

  async function handleEvidenceOverride(
    listKey: RequirementItemListKey,
    itemId: string,
    override: boolean,
  ) {
    setActionError("");
    setBusy(true);
    try {
      if (dirty) {
        const saveRes = await fetch(`/api/pilot/v80/intake/${encodeURIComponent(sessionId)}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ requirements: local }),
        });
        const saveData = await saveRes.json();
        if (!saveRes.ok || !saveData.ok) throw new Error(saveData.message ?? "保存失败");
        await applyServerResult(saveData);
      }

      const res = await fetch(`/api/pilot/v80/intake/${encodeURIComponent(sessionId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          evidenceOverride: {
            listKey,
            itemId,
            override,
            note: override ? "审核员确认弱证据/低置信度抽取" : undefined,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.message ?? data.code ?? "证据覆盖失败");
      await applyServerResult(data);
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "证据覆盖失败");
    } finally {
      setBusy(false);
    }
  }

  async function handleConfirmAllMust() {
    setActionError("");
    setBusy(true);
    try {
      if (dirty) {
        const saveRes = await fetch(`/api/pilot/v80/intake/${encodeURIComponent(sessionId)}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ requirements: local }),
        });
        const saveData = await saveRes.json();
        if (!saveRes.ok || !saveData.ok) throw new Error(saveData.message ?? "保存失败");
        await applyServerResult(saveData);
      }

      const res = await fetch(`/api/pilot/v80/intake/${encodeURIComponent(sessionId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bulkReview: { reviewStatus: "confirmed", mustOnly: true },
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.message ?? data.code ?? "批量确认失败");
      await applyServerResult(data);
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "批量确认失败");
    } finally {
      setBusy(false);
    }
  }

  async function handleApprove() {
    setApproving(true);
    setActionError("");
    setValidationErrors([]);
    try {
      if (dirty) {
        const saveRes = await fetch(`/api/pilot/v80/intake/${encodeURIComponent(sessionId)}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ requirements: local }),
        });
        const saveData = await saveRes.json();
        if (!saveRes.ok || !saveData.ok) throw new Error(saveData.message ?? "保存失败");
        await applyServerResult(saveData);
      }

      const valid = await validateOnly();
      if (!valid) return;

      const qaRes = await fetch("/api/pilot/v80/intake/qa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, requirements: local }),
      });
      const qaData = await qaRes.json();
      if (!qaData.qa?.handoffReady) {
        setActionError(qaData.qa?.reasonMessage ?? "QA 未通过，无法交接");
        if (qaData.qa?.checks) {
          setValidationErrors(
            qaData.qa.checks
              .filter((c: { passed: boolean }) => !c.passed)
              .map((c: { id: string; message: string }) => ({
                path: c.id,
                message: c.message,
              })),
          );
        }
        return;
      }

      const res = await fetch("/api/pilot/v80/intake/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, requirements: local }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        if (data.errors) setValidationErrors(data.errors);
        if (data.checks) {
          setValidationErrors(
            data.checks.map((c: { id: string; message: string }) => ({
              path: c.id,
              message: c.message,
            })),
          );
        }
        throw new Error(data.message ?? data.code ?? "批准失败");
      }
      onApproved({
        projectId: data.projectId,
        tenderId: data.tenderId,
        quoteId: data.quoteId,
        workflowJobId: data.workflowJobId,
        workflowStatus: data.workflowStatus,
        generationPhase: data.generationPhase,
      });
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "批准失败");
    } finally {
      setApproving(false);
    }
  }

  return (
    <section className="space-y-6 rounded-2xl border border-zinc-800 bg-zinc-950 p-8">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-zinc-500">
          Intake ID: <span className="font-mono text-zinc-400">{tenderIntakeId}</span>
          <span className="ml-3 font-mono text-sky-400">v{localRevision}</span>
          {dirty ? <span className="ml-2 text-amber-500">未保存</span> : null}
          {pendingMustCount > 0 ? (
            <span className="ml-2 text-amber-400">待确认必选 {pendingMustCount}</span>
          ) : (
            <span className="ml-2 text-emerald-500">必选已审完</span>
          )}
          {lowConfidenceCount > 0 ? (
            <span className="ml-2 text-rose-300">低置信 {lowConfidenceCount}</span>
          ) : null}
          {evidenceGateCount > 0 ? (
            <span className="ml-2 text-amber-300">证据门禁待确认 {evidenceGateCount}</span>
          ) : null}
        </p>
        <div className="flex flex-wrap gap-3 text-xs">
          {!readOnly ? (
            <button
              type="button"
              disabled={busy}
              onClick={() => void handleReExtract()}
              className="text-sky-400 underline hover:text-sky-200 disabled:opacity-40"
            >
              重新抽取
            </button>
          ) : null}
          {extractedRequirements && !readOnly ? (
            <button
              type="button"
              disabled={busy}
              onClick={() => void handleReset()}
              className="text-zinc-400 underline hover:text-white disabled:opacity-40"
            >
              重置为抽取结果
            </button>
          ) : null}
          {!readOnly ? (
            <button
              type="button"
              disabled={busy}
              onClick={() => void handleConfirmAllMust()}
              className="text-emerald-400 underline hover:text-emerald-200 disabled:opacity-40"
            >
              确认全部必选
            </button>
          ) : null}
        </div>
      </div>

      {readOnly ? (
        <p className="rounded-lg border border-amber-800/50 bg-amber-950/30 px-4 py-2 text-sm text-amber-200">
          会话已冻结 — 需求为只读，请从交付产物区查看结果。
        </p>
      ) : null}

      {SCALAR_FIELDS.map(({ key, label, multiline }) => (
        <label key={key} className="block">
          <span className="text-sm text-zinc-400">{label}</span>
          {multiline ? (
            <textarea
              className="mt-1 w-full rounded-lg border border-zinc-700 bg-black px-3 py-2 text-sm disabled:opacity-60"
              rows={3}
              disabled={readOnly}
              value={String(local[key] ?? "")}
              onChange={(e) => updateScalar(key, e.target.value)}
            />
          ) : (
            <input
              className="mt-1 w-full rounded-lg border border-zinc-700 bg-black px-3 py-2 text-sm disabled:opacity-60"
              disabled={readOnly}
              value={String(local[key] ?? "")}
              onChange={(e) => updateScalar(key, e.target.value)}
            />
          )}
        </label>
      ))}

      {STRING_LIST_FIELDS.map(({ key, label }) => (
        <label key={key} className="block">
          <span className="text-sm text-zinc-400">{label}</span>
          <textarea
            className="mt-1 w-full rounded-lg border border-zinc-700 bg-black px-3 py-2 text-sm disabled:opacity-60"
            rows={3}
            disabled={readOnly}
            value={(local[key] as string[]).join("\n")}
            onChange={(e) => updateStringList(key, e.target.value)}
          />
        </label>
      ))}

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="text-sm text-zinc-400">预算下限（元）</span>
          <input
            type="number"
            className="mt-1 w-full rounded-lg border border-zinc-700 bg-black px-3 py-2 text-sm disabled:opacity-60"
            disabled={readOnly}
            value={local.budget.min ?? ""}
            onChange={(e) =>
              setLocal((p) => ({
                ...p,
                budget: {
                  ...p.budget,
                  min: e.target.value ? Number(e.target.value) : undefined,
                },
              }))
            }
          />
        </label>
        <label className="block">
          <span className="text-sm text-zinc-400">预算上限（元）</span>
          <input
            type="number"
            className="mt-1 w-full rounded-lg border border-zinc-700 bg-black px-3 py-2 text-sm disabled:opacity-60"
            disabled={readOnly}
            value={local.budget.max ?? ""}
            onChange={(e) =>
              setLocal((p) => ({
                ...p,
                budget: {
                  ...p.budget,
                  max: e.target.value ? Number(e.target.value) : undefined,
                },
              }))
            }
          />
        </label>
      </div>

      {ITEM_LIST_FIELDS.map(({ key, label }) => (
        <div key={key} className="space-y-2">
          <p className="text-sm text-zinc-400">
            {label} ({local[key].length})
          </p>
          <ul className="space-y-2">
            {local[key].map((item: RequirementItem) => {
              const needsEvidence = itemNeedsEvidenceConfirmation(item);
              const isLow =
                item.confidenceBand === "low" || (item.confidence ?? 1) < 0.5;
              return (
              <li
                key={item.id}
                className={`rounded-xl border bg-black/50 p-3 ${
                  isLow || needsEvidence
                    ? "border-rose-900/70 ring-1 ring-rose-950/80"
                    : "border-zinc-800"
                }`}
              >
                <div className="mb-2 flex flex-wrap items-center gap-2 text-xs">
                  <span
                    className={`rounded border px-2 py-0.5 ${statusClass(item.reviewStatus)}`}
                  >
                    {statusLabel(item.reviewStatus)}
                  </span>
                  <span className="text-zinc-500">{item.priority ?? "must"}</span>
                  <span
                    className={`rounded border px-2 py-0.5 ${confidenceClass(item.confidenceBand)}`}
                  >
                    {confidenceLabel(item)}
                  </span>
                  {item.pageRef ? (
                    <span className="font-mono text-zinc-600">{item.pageRef}</span>
                  ) : (
                    <span className="text-rose-400">无页码</span>
                  )}
                  {item.sourceDocumentName ? (
                    <span className="truncate text-zinc-500" title={item.sourceDocumentName}>
                      ← {item.sourceDocumentName}
                    </span>
                  ) : null}
                  {item.evidenceOverride ? (
                    <span className="text-sky-400">已覆盖弱证据</span>
                  ) : null}
                </div>
                <textarea
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 font-mono text-xs disabled:opacity-60"
                  rows={2}
                  disabled={readOnly}
                  value={item.text}
                  onChange={(e) => updateItemText(key, item.id, e.target.value)}
                />
                <div className="mt-2 space-y-1 rounded-lg border border-zinc-800/80 bg-zinc-950/80 p-2">
                  <p className="text-[11px] font-medium text-zinc-400">来源证据</p>
                  {(item.evidence?.length ?? 0) === 0 ? (
                    <p className="text-[11px] text-rose-300/90">未匹配到 PDF/DOCX 原文片段</p>
                  ) : (
                    <ul className="space-y-1">
                      {item.evidence!.map((ev, ei) => (
                        <li key={`${item.id}-ev-${ei}`} className="text-[11px] text-zinc-500">
                          <span className="font-mono text-zinc-400">
                            {ev.documentName ? `${ev.documentName} ` : ""}p.{ev.page}
                          </span>
                          <span className="ml-2 text-zinc-400">「{ev.excerpt}」</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                {!readOnly ? (
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void handleItemReview(key, item.id, "confirmed")}
                      className="rounded-lg border border-emerald-800 px-3 py-1 text-xs text-emerald-300 disabled:opacity-40"
                    >
                      确认
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void handleItemReview(key, item.id, "rejected")}
                      className="rounded-lg border border-red-900 px-3 py-1 text-xs text-red-300 disabled:opacity-40"
                    >
                      驳回
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void handleItemReview(key, item.id, "pending")}
                      className="rounded-lg border border-zinc-700 px-3 py-1 text-xs text-zinc-400 disabled:opacity-40"
                    >
                      待审
                    </button>
                    {isLow || (item.evidence?.length ?? 0) === 0 ? (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void handleEvidenceOverride(key, item.id, true)}
                        className="rounded-lg border border-sky-800 px-3 py-1 text-xs text-sky-300 disabled:opacity-40"
                      >
                        确认弱证据
                      </button>
                    ) : null}
                  </div>
                ) : null}
              </li>
              );
            })}
            {local[key].length === 0 ? (
              <li className="text-xs text-zinc-600">无条目</li>
            ) : null}
          </ul>
        </div>
      ))}

      {validationErrors.length > 0 ? (
        <div className="rounded-lg border border-red-900/50 bg-red-950/30 p-4">
          <p className="text-sm font-medium text-red-300">校验未通过</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-red-200/90">
            {validationErrors.map((e) => (
              <li key={`${e.path}-${e.message}`}>
                <span className="font-mono text-red-400">{e.path}</span>: {e.message}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {actionError ? <p className="text-sm text-red-400">{actionError}</p> : null}

      {!readOnly ? (
        <IntakeMultiDocPanel
          sessionId={sessionId}
          readOnly={readOnly}
          onRequirementsChange={(req, meta) => {
            setLocal(req);
            if (typeof meta?.revision === "number") setLocalRevision(meta.revision);
            onRequirementsChange(req, meta);
          }}
        />
      ) : null}

      {!readOnly ? (
        <IntakeClarificationPanel
          sessionId={sessionId}
          readOnly={readOnly}
          onRequirementsChange={(req, meta) => {
            setLocal(req);
            if (typeof meta?.revision === "number") setLocalRevision(meta.revision);
            onRequirementsChange(req, meta);
          }}
        />
      ) : null}

      {!readOnly ? (
        <IntakeCompliancePanel
          sessionId={sessionId}
          requirements={local}
          readOnly={readOnly}
          onReportChange={(report) => {
            setComplianceBlocking(report?.blockingCount ?? 0);
          }}
        />
      ) : null}

      <IntakeOrgKnowledgePanel
        sessionId={sessionId}
        requirements={local}
        readOnly={readOnly}
        onRequirementsChange={(req, meta) => {
          setLocal(req);
          if (typeof meta?.revision === "number") setLocalRevision(meta.revision);
          onRequirementsChange(req, meta);
        }}
      />

      <IntakeCrossProjectPanel sessionId={sessionId} readOnly={readOnly} />

      <IntakeHandoffPackagePanel sessionId={sessionId} readOnly={readOnly} />

      <IntakeBootstrapKickoffPanel sessionId={sessionId} readOnly={readOnly} />

      {!readOnly ? (
        <IntakeQAGatePanel
          sessionId={sessionId}
          requirements={local}
          onQaChange={(state) => setHandoffReady(state?.handoffReady === true)}
        />
      ) : null}

      {!readOnly ? (
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            disabled={saving || !dirty}
            onClick={() => void saveDraft()}
            className="rounded-xl border border-zinc-600 px-5 py-2.5 text-sm font-semibold disabled:opacity-40"
          >
            {saving ? "保存中…" : "保存草稿"}
          </button>
          <button
            type="button"
            onClick={() => void validateOnly()}
            className="rounded-xl border border-sky-800 px-5 py-2.5 text-sm font-semibold text-sky-200"
          >
            校验
          </button>
          <button
            type="button"
            disabled={
              approving ||
              !handoffReady ||
              pendingMustCount > 0 ||
              evidenceGateCount > 0 ||
              complianceBlocking > 0
            }
            onClick={() => void handleApprove()}
            className="rounded-xl bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-black disabled:opacity-50"
            title={
              pendingMustCount > 0
                ? "请先确认全部必选条目"
                : evidenceGateCount > 0
                  ? "请先确认低置信度/缺证据条目"
                  : complianceBlocking > 0
                    ? "请先解决阻断性合规问题"
                    : handoffReady
                      ? "QA 已通过"
                      : "请先通过 QA 门禁"
            }
          >
            {approving ? "交接生产中…" : "批准 → 创建项目 / V80"}
          </button>
        </div>
      ) : null}
    </section>
  );
}
