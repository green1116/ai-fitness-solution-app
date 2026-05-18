import type { EvidenceDecisionResult } from "@/lib/tender/evidence/runtime/types";
import type { BidDecisionGateResult } from "@/lib/tender/score/buildBidDecisionGate";
import type {
  RuntimeDecision,
  RuntimeGateAction,
  RuntimeStatus,
  WorkflowStepResult,
} from "../types";

function uniq(arr: string[]) {
  return Array.from(new Set(arr.map((s) => s.trim()).filter(Boolean)));
}

function mergeAction(
  a?: RuntimeGateAction,
  b?: RuntimeGateAction,
): RuntimeGateAction {
  if (a === "block" || b === "block") return "block";
  if (a === "warn" || b === "warn") return "warn";
  return a ?? b ?? "allow";
}

function resolveStatus(
  action: RuntimeGateAction,
  steps: WorkflowStepResult[],
): RuntimeStatus {
  const hasFailure = steps.some((s) => s.status === "failed");
  const hasSkip = steps.some((s) => s.status === "skipped");
  if (hasFailure || (hasSkip && action !== "allow")) return "incomplete";
  if (action === "block") return "blocked";
  if (action === "warn") return "caution";
  return "ready";
}

export type BuildTenderRuntimeDecisionInput = {
  evidenceDecision?: EvidenceDecisionResult;
  gate?: BidDecisionGateResult;
  steps: WorkflowStepResult[];
  forceAllow?: boolean;
  scoreRatio?: number | null;
};

/**
 * V2.9 统一决策：合并 evidence runtime decision + score gate
 */
export function buildTenderRuntimeDecision(
  input: BuildTenderRuntimeDecisionInput,
): RuntimeDecision {
  const evidenceAction = input.evidenceDecision?.action;
  const gateAction = input.gate?.action;
  const merged = mergeAction(evidenceAction, gateAction);

  const reasons = uniq([
    ...(input.evidenceDecision?.reasons ?? []),
    ...(input.gate?.reasons ?? []),
  ]);

  const suggestedNextSteps = uniq([
    ...(input.evidenceDecision?.suggestedNextSteps ?? []),
    ...(input.gate?.suggestedNextSteps ?? []),
  ]).slice(0, 6);

  const evidenceMeta = input.evidenceDecision?.meta;
  const scoreRatio =
    input.scoreRatio ??
    input.gate?.meta.scoreRatio ??
    null;

  if (input.forceAllow) {
    return {
      action: "allow",
      passed: true,
      status: "ready",
      title: "工作流已强制放行",
      message: "强制放行模式下，原始 evidence/gate 评估仅供参考。",
      reasons: uniq(reasons),
      suggestedNextSteps,
      sources: { evidence: evidenceAction, gate: gateAction },
      meta: {
        workflowStepsCompleted: input.steps.filter((s) => s.status === "completed")
          .length,
        workflowStepsFailed: input.steps.filter((s) => s.status === "failed").length,
        evidenceCoverageRatio: evidenceMeta?.coverageRatio ?? 0,
        scoreRatio,
        unsupportedCount: evidenceMeta?.unsupportedCount ?? 0,
        gateEvidenceWeakCount: input.gate?.meta.evidenceWeakCount ?? 0,
      },
    };
  }

  const action = merged;
  const passed = action !== "block";
  const status = resolveStatus(action, input.steps);

  let title: string;
  let message: string;

  if (action === "block") {
    title = "投标运行时阻断：证据或评分门闸未通过";
    message =
      "证据覆盖率或评分诊断未达到放行阈值，建议完成补强后重新执行 workflow。";
  } else if (action === "warn") {
    title = "投标运行时可继续，但存在需关注项";
    message = `综合 evidence 与评分门闸，建议先处理 ${reasons.length || "若干"} 项风险后再生成正式投标包。`;
  } else {
    title = "投标运行时就绪";
    message = `证据与评分检查通过，可进入后续投标包生成流程。`;
  }

  return {
    action,
    passed,
    status,
    title,
    message,
    reasons: reasons.slice(0, 6),
    suggestedNextSteps,
    sources: { evidence: evidenceAction, gate: gateAction },
    meta: {
      workflowStepsCompleted: input.steps.filter((s) => s.status === "completed")
        .length,
      workflowStepsFailed: input.steps.filter((s) => s.status === "failed").length,
      evidenceCoverageRatio: evidenceMeta?.coverageRatio ?? 0,
      scoreRatio,
      unsupportedCount: evidenceMeta?.unsupportedCount ?? 0,
      gateEvidenceWeakCount: input.gate?.meta.evidenceWeakCount ?? 0,
    },
  };
}
