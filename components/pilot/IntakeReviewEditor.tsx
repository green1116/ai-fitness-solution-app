"use client";

import { useCallback, useMemo, useState } from "react";

import type { RequirementItem, TenderRequirements } from "@/lib/pilot/v80";
import { IntakeQAGatePanel } from "@/components/pilot/IntakeQAGatePanel";

export type ValidationIssue = { path: string; message: string };

type IntakeReviewEditorProps = {
  sessionId: string;
  tenderIntakeId: string;
  requirements: TenderRequirements;
  extractedRequirements?: TenderRequirements | null;
  readOnly?: boolean;
  onRequirementsChange: (req: TenderRequirements) => void;
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

const ITEM_LIST_FIELDS: {
  key: keyof Pick<
    TenderRequirements,
    | "functionalRequirements"
    | "technicalRequirements"
    | "equipment"
    | "space"
    | "compliance"
    | "evaluation"
  >;
  label: string;
}[] = [
  { key: "functionalRequirements", label: "功能需求" },
  { key: "technicalRequirements", label: "技术需求" },
  { key: "equipment", label: "设备" },
  { key: "space", label: "空间" },
  { key: "compliance", label: "合规" },
  { key: "evaluation", label: "评标" },
];

function itemsToLines(items: RequirementItem[]): string {
  return items.map((i) => i.text).join("\n");
}

function linesToItems(lines: string, existing: RequirementItem[]): RequirementItem[] {
  return lines
    .split("\n")
    .map((t) => t.trim())
    .filter(Boolean)
    .map((text, i) => ({
      id: existing[i]?.id ?? `edit_${i}_${Date.now()}`,
      text,
      pageRef: existing[i]?.pageRef,
      priority: existing[i]?.priority ?? "must",
    }));
}

export function IntakeReviewEditor({
  sessionId,
  tenderIntakeId,
  requirements,
  extractedRequirements,
  readOnly = false,
  onRequirementsChange,
  onApproved,
}: IntakeReviewEditorProps) {
  const [local, setLocal] = useState(requirements);
  const [validationErrors, setValidationErrors] = useState<ValidationIssue[]>([]);
  const [saving, setSaving] = useState(false);
  const [approving, setApproving] = useState(false);
  const [actionError, setActionError] = useState("");
  const [handoffReady, setHandoffReady] = useState(false);

  const dirty = useMemo(
    () => JSON.stringify(local) !== JSON.stringify(requirements),
    [local, requirements],
  );

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

  const updateItemList = useCallback(
    (key: (typeof ITEM_LIST_FIELDS)[number]["key"], value: string) => {
      setLocal((prev) => ({
        ...prev,
        [key]: linesToItems(value, prev[key]),
      }));
      setValidationErrors([]);
    },
    [],
  );

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
      onRequirementsChange(data.requirements as TenderRequirements);
      setValidationErrors(data.validation?.errors ?? []);
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
    try {
      const res = await fetch(`/api/pilot/v80/intake/${encodeURIComponent(sessionId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reset: true }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.message ?? data.code ?? "重置失败");
      const reset = data.requirements as TenderRequirements;
      setLocal(reset);
      onRequirementsChange(reset);
      setValidationErrors(data.validation?.errors ?? []);
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "重置失败");
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
        onRequirementsChange(saveData.requirements as TenderRequirements);
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
              .map((c: { id: string; message: string }) => ({ path: c.id, message: c.message })),
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
          {dirty ? <span className="ml-2 text-amber-500">未保存</span> : null}
        </p>
        {extractedRequirements ? (
          <button
            type="button"
            onClick={() => void handleReset()}
            className="text-xs text-zinc-400 underline hover:text-white"
          >
            重置为抽取结果
          </button>
        ) : null}
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
        <label key={key} className="block">
          <span className="text-sm text-zinc-400">
            {label} ({local[key].length})
          </span>
          <textarea
            className="mt-1 w-full rounded-lg border border-zinc-700 bg-black px-3 py-2 font-mono text-xs disabled:opacity-60"
            rows={4}
            disabled={readOnly}
            value={itemsToLines(local[key])}
            onChange={(e) => updateItemList(key, e.target.value)}
          />
        </label>
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
          disabled={approving || !handoffReady}
          onClick={() => void handleApprove()}
          className="rounded-xl bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-black disabled:opacity-50"
          title={handoffReady ? "QA 已通过" : "请先通过 QA 门禁"}
        >
          {approving ? "交接生产中…" : "交接生产 → V80"}
        </button>
      </div>
      ) : null}
    </section>
  );
}
