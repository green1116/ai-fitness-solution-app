"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

import { downloadTenderPack } from "@/components/documents/downloadTenderPack";

type WorkflowStep = {
  step: string;
  status: "pending" | "running" | "completed" | "failed";
  error?: string;
};

type ArtifactItem = {
  id: string;
  kind: string;
  label: string;
  status: "ready" | "generating" | "failed" | "pending";
  source: string;
  artifactId?: string;
  downloadUrl?: string;
  openUrl?: string;
};

type Linkage = {
  intakeSessionId: string;
  tenderIntakeId: string;
  projectId?: string;
  quoteId?: string;
  tenderId?: string;
  v80TenderId?: string;
  v80QuoteId?: string;
  workflowJobId?: string;
};

type DeliveryState = {
  phase: "pending" | "generating" | "ready" | "failed";
  sessionStatus?: string;
  workflowStatus?: string;
  steps: WorkflowStep[];
  linkage: Linkage;
  artifacts: ArtifactItem[];
  error?: { message: string; step?: string };
  canRetry: boolean;
  readOnly?: boolean;
  documentCenterUrl?: string;
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

const STATUS_LABELS: Record<string, string> = {
  ready: "就绪",
  generating: "生成中",
  failed: "失败",
  pending: "等待",
};

type IntakeArtifactCenterProps = {
  sessionId: string;
  initial?: Partial<DeliveryState>;
  onReady?: () => void;
};

export function IntakeArtifactCenter({
  sessionId,
  initial,
  onReady,
}: IntakeArtifactCenterProps) {
  const [state, setState] = useState<DeliveryState>({
    phase: initial?.phase ?? "generating",
    sessionStatus: initial?.sessionStatus,
    workflowStatus: initial?.workflowStatus,
    steps: initial?.steps ?? [],
    linkage: initial?.linkage ?? {
      intakeSessionId: sessionId,
      tenderIntakeId: "",
    },
    artifacts: initial?.artifacts ?? [],
    canRetry: initial?.canRetry ?? false,
    documentCenterUrl: initial?.documentCenterUrl,
    error: initial?.error,
  });
  const [pollError, setPollError] = useState("");
  const [retrying, setRetrying] = useState(false);
  const [downloadingZip, setDownloadingZip] = useState(false);
  const [readOnly, setReadOnly] = useState(false);

  const poll = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/pilot/v80/intake/${encodeURIComponent(sessionId)}/generation`,
      );
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.message ?? data.code ?? "轮询失败");

      const next: DeliveryState = {
        phase: data.phase,
        sessionStatus: data.sessionStatus,
        workflowStatus: data.workflowStatus,
        steps: data.steps ?? [],
        linkage: data.linkage ?? { intakeSessionId: sessionId, tenderIntakeId: "" },
        artifacts: data.artifacts ?? [],
        error: data.error,
        canRetry: data.canRetry === true && data.readOnly !== true,
        documentCenterUrl: data.documentCenterUrl,
      };
      setReadOnly(data.readOnly === true || data.deliveryLock?.frozen === true);
      setState(next);
      setPollError("");
      if (next.phase === "ready") onReady?.();
      return next.phase;
    } catch (e) {
      setPollError(e instanceof Error ? e.message : "轮询失败");
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
      } else if (phase === "ready" && !readOnly) {
        timer = setTimeout(() => void loop(), 5000);
      }
    }

    void loop();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [poll]);

  async function handleRetry() {
    if (readOnly) return;
    setRetrying(true);
    setPollError("");
    try {
      const res = await fetch(
        `/api/pilot/v80/intake/${encodeURIComponent(sessionId)}/generation/retry`,
        { method: "POST" },
      );
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.message ?? data.code ?? "重试失败");
      await poll();
    } catch (e) {
      setPollError(e instanceof Error ? e.message : "重试失败");
    } finally {
      setRetrying(false);
    }
  }

  async function handleZipDownload() {
    const projectId = state.linkage.projectId;
    if (!projectId) return;
    setDownloadingZip(true);
    try {
      await downloadTenderPack(projectId);
    } catch (e) {
      setPollError(e instanceof Error ? e.message : "ZIP 下载失败");
    } finally {
      setDownloadingZip(false);
    }
  }

  const phaseLabel =
    state.phase === "ready"
      ? "就绪"
      : state.phase === "failed"
        ? "生成失败"
        : state.phase === "generating"
          ? "生成中"
          : "等待中";

  return (
    <div className="space-y-6">
      <section className="space-y-6 rounded-2xl border border-sky-900/40 bg-sky-950/20 p-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-sky-200">交付状态</h2>
            {readOnly ? (
              <span className="mt-1 inline-block rounded-full border border-amber-700/60 bg-amber-950/50 px-2 py-0.5 text-xs text-amber-200">
                已冻结 · 只读
              </span>
            ) : null}
            <p className="mt-1 text-sm text-zinc-400">
              阶段：<span className="text-sky-300">{phaseLabel}</span>
              {state.sessionStatus ? (
                <span className="ml-2 text-zinc-500">session: {state.sessionStatus}</span>
              ) : null}
              {state.workflowStatus ? (
                <span className="ml-2 font-mono text-xs text-zinc-500">
                  workflow: {state.workflowStatus}
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
                <span className="text-zinc-300">{STEP_LABELS[step.step] ?? step.step}</span>
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

        {state.error ? (
          <div className="rounded-lg border border-red-900/50 bg-red-950/30 p-4">
            <p className="text-sm font-medium text-red-300">生成错误</p>
            <p className="mt-1 text-xs text-red-200/90">
              {state.error.step ? `步骤 ${state.error.step}: ` : ""}
              {state.error.message}
            </p>
          </div>
        ) : null}

        {state.canRetry ? (
          <button
            type="button"
            disabled={retrying}
            onClick={() => void handleRetry()}
            className="rounded-xl border border-amber-700 bg-amber-950/40 px-5 py-2.5 text-sm font-semibold text-amber-200 disabled:opacity-50"
          >
            {retrying ? "重试中…" : "重试生成（保留已批准实体）"}
          </button>
        ) : null}

        {pollError ? <p className="text-sm text-red-400">{pollError}</p> : null}
      </section>

      <section className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-950 p-8">
        <h2 className="text-lg font-semibold text-white">产物关联</h2>
        <dl className="grid gap-2 font-mono text-xs text-zinc-400 sm:grid-cols-2">
          <div>
            <dt className="text-zinc-600">intakeSessionId</dt>
            <dd className="truncate">{state.linkage.intakeSessionId}</dd>
          </div>
          <div>
            <dt className="text-zinc-600">tenderIntakeId</dt>
            <dd>{state.linkage.tenderIntakeId}</dd>
          </div>
          {state.linkage.projectId ? (
            <div>
              <dt className="text-zinc-600">projectId</dt>
              <dd>{state.linkage.projectId}</dd>
            </div>
          ) : null}
          {state.linkage.quoteId ? (
            <div>
              <dt className="text-zinc-600">quoteId</dt>
              <dd>{state.linkage.quoteId}</dd>
            </div>
          ) : null}
          {state.linkage.tenderId ? (
            <div>
              <dt className="text-zinc-600">tenderId</dt>
              <dd>{state.linkage.tenderId}</dd>
            </div>
          ) : null}
          {state.linkage.v80TenderId ? (
            <div>
              <dt className="text-zinc-600">v80TenderId</dt>
              <dd>{state.linkage.v80TenderId}</dd>
            </div>
          ) : null}
          {state.linkage.v80QuoteId ? (
            <div>
              <dt className="text-zinc-600">v80QuoteId</dt>
              <dd>{state.linkage.v80QuoteId}</dd>
            </div>
          ) : null}
          {state.linkage.workflowJobId ? (
            <div>
              <dt className="text-zinc-600">workflowJobId</dt>
              <dd className="truncate">{state.linkage.workflowJobId}</dd>
            </div>
          ) : null}
        </dl>
      </section>

      <section className="space-y-4 rounded-2xl border border-emerald-900/40 bg-emerald-950/10 p-8">
        <h2 className="text-lg font-semibold text-emerald-200">交付产物</h2>

        {state.artifacts.length === 0 ? (
          <p className="text-sm text-zinc-500">
            {state.phase === "ready"
              ? "暂无产物记录，请从 Document Center 查看。"
              : "生成完成后将在此列出计划 PDF、预算 PDF、标书包 ZIP 等产物。"}
          </p>
        ) : (
          <ul className="space-y-2">
            {state.artifacts.map((artifact) => (
              <li
                key={artifact.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-zinc-800 bg-black/40 px-4 py-3 text-sm"
              >
                <div>
                  <p className="font-medium text-zinc-200">{artifact.label}</p>
                  <p className="text-xs text-zinc-500">
                    {artifact.source}
                    {artifact.artifactId ? ` · ${artifact.artifactId.slice(0, 8)}…` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={
                      artifact.status === "ready"
                        ? "text-emerald-400"
                        : artifact.status === "generating"
                          ? "text-sky-400"
                          : artifact.status === "failed"
                            ? "text-red-400"
                            : "text-zinc-500"
                    }
                  >
                    {STATUS_LABELS[artifact.status] ?? artifact.status}
                  </span>
                  {artifact.kind === "bundle" && state.linkage.projectId ? (
                    <button
                      type="button"
                      disabled={downloadingZip || artifact.status !== "ready"}
                      onClick={() => void handleZipDownload()}
                      className="text-xs text-sky-300 underline disabled:opacity-40"
                    >
                      {downloadingZip ? "下载中…" : "下载 ZIP"}
                    </button>
                  ) : null}
                  {artifact.openUrl && artifact.kind !== "bundle" ? (
                    <a
                      href={artifact.openUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-sky-300 underline"
                    >
                      打开
                    </a>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className="flex flex-wrap gap-3 pt-2">
          {state.documentCenterUrl ? (
            <Link
              href={state.documentCenterUrl}
              className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black"
            >
              打开 Document Center
            </Link>
          ) : null}
          {state.linkage.projectId ? (
            <button
              type="button"
              disabled={downloadingZip || state.phase !== "ready"}
              onClick={() => void handleZipDownload()}
              className="rounded-lg border border-zinc-600 px-4 py-2 text-sm disabled:opacity-40"
            >
              {downloadingZip ? "打包中…" : "下载标书包 ZIP"}
            </button>
          ) : null}
        </div>
      </section>
    </div>
  );
}
