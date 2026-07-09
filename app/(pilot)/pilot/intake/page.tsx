"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

import { IntakeArtifactCenter } from "@/components/pilot/IntakeArtifactCenter";
import { IntakeAuditPanel } from "@/components/pilot/IntakeAuditPanel";
import { IntakeFrozenBanner } from "@/components/pilot/IntakeFrozenBanner";
import { IntakeReviewEditor } from "@/components/pilot/IntakeReviewEditor";
import { IntakeSignoffPanel } from "@/components/pilot/IntakeSignoffPanel";
import { PilotFlowStatus } from "@/components/pilot/PilotFlowStatus";
import { PilotWorkflowNav } from "@/components/pilot/PilotWorkflowNav";
import type { TenderRequirements } from "@/lib/pilot/v80";

type Step = "upload" | "review" | "generating" | "artifacts";

type ApproveResult = {
  projectId: string;
  tenderId: string;
  quoteId: string;
  workflowJobId?: string;
  workflowStatus?: string;
  generationPhase?: "generating" | "ready";
};

export default function PilotIntakePage() {
  const [step, setStep] = useState<Step>("upload");
  const [sessionId, setSessionId] = useState("");
  const [tenderIntakeId, setTenderIntakeId] = useState("");
  const [requirements, setRequirements] = useState<TenderRequirements | null>(null);
  const [extractedRequirements, setExtractedRequirements] = useState<TenderRequirements | null>(
    null,
  );
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [approveResult, setApproveResult] = useState<ApproveResult | null>(null);
  const [readOnly, setReadOnly] = useState(false);

  useEffect(() => {
    if (!sessionId) {
      setReadOnly(false);
      return;
    }
    let cancelled = false;
    async function loadFreeze() {
      const res = await fetch(`/api/pilot/v80/intake/${encodeURIComponent(sessionId)}/freeze`);
      const data = await res.json();
      if (!cancelled && res.ok && data.ok) {
        setReadOnly(data.deliveryLock?.readOnly === true);
      }
    }
    void loadFreeze();
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  const onFile = useCallback(async (file: File) => {
    setUploading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/pilot/v80/intake/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.message ?? data.code ?? "上传失败");
      setSessionId(data.sessionId);
      setTenderIntakeId(data.tenderIntakeId);
      setRequirements(data.requirements);
      setExtractedRequirements(data.requirements);
      setStep("review");
    } catch (e) {
      setError(e instanceof Error ? e.message : "上传失败");
    } finally {
      setUploading(false);
    }
  }, []);

  const handleApproved = useCallback((result: Record<string, string>) => {
    const parsed: ApproveResult = {
      projectId: result.projectId,
      tenderId: result.tenderId,
      quoteId: result.quoteId,
      workflowJobId: result.workflowJobId,
      workflowStatus: result.workflowStatus,
      generationPhase: result.generationPhase as ApproveResult["generationPhase"],
    };
    setApproveResult(parsed);
    if (parsed.generationPhase === "ready" || parsed.workflowStatus === "completed") {
      setStep("artifacts");
    } else {
      setStep("generating");
    }
  }, []);

  const showArtifactCenter = (step === "generating" || step === "artifacts") && sessionId;

  const flowStatus =
    step === "upload"
      ? "not_uploaded"
      : step === "review"
        ? "parsed"
        : step === "generating"
          ? "generated"
          : "downloadable";

  return (
    <div className="mx-auto max-w-3xl space-y-8 py-8">
      <div>
        <p className="text-xs font-medium uppercase tracking-widest text-sky-400">导入区</p>
        <h1 className="mt-1 text-2xl font-bold text-white">上传标书 / 导入招标文件</h1>
        <p className="mt-2 text-sm text-zinc-400">
          上传 → 审核 → QA 门禁 → 生产交接 → 交付产物 → 审计追溯
        </p>
      </div>

      <PilotWorkflowNav activeZone="import" />

      <PilotFlowStatus status={flowStatus} />

      <ol className="flex flex-wrap gap-2 text-xs font-medium uppercase tracking-widest text-zinc-500">
        {(["upload", "review", "generating", "artifacts"] as Step[]).map((s, i) => (
          <li key={s} className={step === s ? "text-sky-400" : ""}>
            {i + 1}.{" "}
            {s === "upload"
              ? "Upload"
              : s === "review"
                ? "Review"
                : s === "generating"
                  ? "Generate"
                  : "Artifacts"}
          </li>
        ))}
      </ol>

      {step === "upload" && (
        <section className="rounded-2xl border border-sky-800/40 bg-sky-950/10 p-8">
          <p className="mb-4 text-center text-sm text-zinc-400">
            尚未上传招标文件。选择 PDF 或 DOCX 开始导入。
          </p>
          <label className="flex cursor-pointer flex-col items-center gap-4 rounded-xl border border-dashed border-sky-700/60 p-12 hover:border-sky-500">
            <span className="text-base font-semibold text-white">选择招标文件（PDF / DOCX）</span>
            <span className="text-xs text-zinc-500">支持招标书、技术规格书等源文件</span>
            <input
              type="file"
              accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              className="hidden"
              disabled={uploading}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void onFile(f);
              }}
            />
            <span className="rounded-lg bg-sky-600 px-6 py-3 text-sm font-semibold text-white">
              {uploading ? "解析中…" : "上传标书 / 导入招标文件"}
            </span>
          </label>
          <p className="mt-4 text-center text-xs text-zinc-600">
            也可从
            <Link href="/quote" className="mx-1 text-sky-400 underline">
              Quote 计算流程
            </Link>
            手动开始
          </p>
        </section>
      )}

      {sessionId ? (
        <IntakeFrozenBanner
          sessionId={sessionId}
          documentCenterUrl={
            approveResult?.projectId
              ? `/documents/projects/${approveResult.projectId}`
              : undefined
          }
        />
      ) : null}

      {step === "review" && requirements && sessionId && (
        <IntakeReviewEditor
          sessionId={sessionId}
          tenderIntakeId={tenderIntakeId}
          requirements={requirements}
          extractedRequirements={extractedRequirements}
          readOnly={readOnly}
          onRequirementsChange={setRequirements}
          onApproved={handleApproved}
        />
      )}

      {showArtifactCenter ? (
        <IntakeArtifactCenter
          sessionId={sessionId}
          initial={{
            phase: step === "artifacts" ? "ready" : "generating",
            workflowStatus: approveResult?.workflowStatus,
            linkage: {
              intakeSessionId: sessionId,
              tenderIntakeId,
              projectId: approveResult?.projectId,
              quoteId: approveResult?.quoteId,
              tenderId: approveResult?.tenderId,
              workflowJobId: approveResult?.workflowJobId,
            },
            documentCenterUrl: approveResult?.projectId
              ? `/documents/projects/${approveResult.projectId}`
              : undefined,
          }}
          onReady={() => setStep("artifacts")}
        />
      ) : null}

      {sessionId && readOnly ? (
        <IntakeSignoffPanel sessionId={sessionId} frozen={readOnly} />
      ) : null}

      {sessionId ? (
        <IntakeAuditPanel
          sessionId={sessionId}
          onRecovered={() => {
            if (approveResult) setStep("generating");
          }}
        />
      ) : null}

      {error ? <p className="text-sm text-red-400">{error}</p> : null}
    </div>
  );
}
