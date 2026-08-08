"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

type WorkflowStep = {
  step: string;
  status: "pending" | "running" | "completed" | "failed";
  error?: string;
};

type GenerationState = {
  phase: "pending" | "generating" | "ready" | "failed";
  projectId?: string;
  tenderId?: string;
  quoteId?: string;
  workflowJobId?: string;
  workflowStatus?: string;
  steps: WorkflowStep[];
  documentCenterUrl?: string;
  tenderZipUrl?: string;
};

const STEP_LABELS: Record<string, string> = {
  "tender-upload": "标书上传",
  "tender-intelligence": "标书解析",
  "proposal-generation": "方案生成",
  "budget-calculate": "预算计算",
  "plan-pdf": "计划 PDF",
  "budget-pdf": "预算 PDF",
  "proposal-pdf": "方案 PDF",
  "enterprise-zip": "标书包 ZIP",
};

type IntakeGenerationProgressProps = {
  sessionId: string;
  initial?: Partial<GenerationState>;
  onReady?: (state: GenerationState) => void;
};

export function IntakeGenerationProgress({
  sessionId,
  initial,
  onReady,
}: IntakeGenerationProgressProps) {
  const [state, setState] = useState<GenerationState>({
    phase: initial?.phase ?? "generating",
    projectId: initial?.projectId,
    tenderId: initial?.tenderId,
    quoteId: initial?.quoteId,
    workflowJobId: initial?.workflowJobId,
    workflowStatus: initial?.workflowStatus,
    steps: initial?.steps ?? [],
    documentCenterUrl: initial?.documentCenterUrl,
    tenderZipUrl: initial?.tenderZipUrl,
  });
  const [error, setError] = useState("");

  const poll = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/pilot/v80/intake/${encodeURIComponent(sessionId)}/generation`,
      );
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.message ?? data.code ?? "轮询失败");

      const next: GenerationState = {
        phase: data.phase,
        projectId: data.projectId,
        tenderId: data.tenderId,
        quoteId: data.quoteId,
        workflowJobId: data.workflowJobId,
        workflowStatus: data.workflowStatus,
        steps: data.steps ?? [],
        documentCenterUrl: data.documentCenterUrl,
        tenderZipUrl: data.tenderZipUrl,
      };
      setState(next);
      if (next.phase === "ready") onReady?.(next);
      return next.phase;
    } catch (e) {
      setError(e instanceof Error ? e.message : "轮询失败");
      return "failed" as const;
    }
  }, [sessionId, onReady]);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    async function loop() {
      const phase = await poll();
      if (cancelled) return;
      if (phase === "generating" || phase === "pending") {
        timer = setTimeout(() => void loop(), 2000);
      }
    }

    void loop();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [poll]);

  const phaseLabel =
    state.phase === "ready"
      ? "就绪"
      : state.phase === "failed"
        ? "生成失败"
        : state.phase === "generating"
          ? "生成中"
          : "等待中";

  return (
    <section className="space-y-6 rounded-2xl border border-sky-900/40 bg-sky-950/20 p-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-sky-200">V80 自动生成</h2>
          <p className="mt-1 text-sm text-zinc-400">
            状态：<span className="text-sky-300">{phaseLabel}</span>
            {state.workflowStatus ? (
              <span className="ml-2 font-mono text-xs text-zinc-500">
                ({state.workflowStatus})
              </span>
            ) : null}
          </p>
        </div>
        {state.phase === "generating" ? (
          <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-sky-400 border-t-transparent" />
        ) : null}
      </div>

      {state.steps.length > 0 ? (
        <ol className="space-y-2">
          {state.steps.map((step) => (
            <li
              key={step.step}
              className="flex items-center justify-between rounded-lg border border-zinc-800 bg-black/40 px-4 py-2 text-sm"
            >
              <span className="text-zinc-300">
                {STEP_LABELS[step.step] ?? step.step}
              </span>
              <span
                className={
                  step.status === "completed"
                    ? "text-emerald-400"
                    : step.status === "running"
                      ? "text-sky-400"
                      : step.status === "failed"
                        ? "text-red-400"
                        : "text-zinc-600"
                }
              >
                {step.status}
              </span>
            </li>
          ))}
        </ol>
      ) : (
        <p className="text-sm text-zinc-500">正在启动 tender-pack-complete 工作流…</p>
      )}

      {state.projectId ? (
        <dl className="space-y-1 font-mono text-xs text-zinc-400">
          <div>
            <dt className="inline text-zinc-600">projectId: </dt>
            <dd className="inline">{state.projectId}</dd>
          </div>
          {state.quoteId ? (
            <div>
              <dt className="inline text-zinc-600">quoteId: </dt>
              <dd className="inline">{state.quoteId}</dd>
            </div>
          ) : null}
          {state.tenderId ? (
            <div>
              <dt className="inline text-zinc-600">tenderId: </dt>
              <dd className="inline">{state.tenderId}</dd>
            </div>
          ) : null}
          {state.workflowJobId ? (
            <div>
              <dt className="inline text-zinc-600">workflowJobId: </dt>
              <dd className="inline">{state.workflowJobId}</dd>
            </div>
          ) : null}
        </dl>
      ) : null}

      {error ? <p className="text-sm text-red-400">{error}</p> : null}

      {state.phase === "ready" && state.documentCenterUrl ? (
        <div className="flex flex-wrap gap-3 pt-2">
          <Link
            href={state.documentCenterUrl}
            className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black"
          >
            Document Center
          </Link>
          {state.tenderZipUrl ? (
            <Link
              href={state.tenderZipUrl}
              className="rounded-lg border border-zinc-600 px-4 py-2 text-sm"
            >
              标书包 ZIP
            </Link>
          ) : null}
          <Link href="/pilot/telemetry" className="rounded-lg border border-zinc-600 px-4 py-2 text-sm">
            Pilot Telemetry
          </Link>
        </div>
      ) : null}

      {state.phase === "failed" ? (
        <p className="text-sm text-red-300">
          工作流未完成。可重新点击批准以安全恢复（幂等）。
        </p>
      ) : null}
    </section>
  );
}
