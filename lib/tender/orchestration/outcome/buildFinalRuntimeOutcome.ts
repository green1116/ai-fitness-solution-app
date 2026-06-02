import type { RuntimeDecision } from "@/lib/tender/runtime/types";
import type {
  DecisionRoute,
  EscalationResult,
  FinalRuntimeOutcome,
  FinalRuntimeVerdict,
  OrchestrationPolicy,
  OrchestrationStatus,
  SubmissionReadiness,
} from "../types";

export type BuildFinalRuntimeOutcomeInput = {
  decision: RuntimeDecision;
  route: DecisionRoute;
  escalation: EscalationResult;
  readiness: SubmissionReadiness;
  policy?: Partial<OrchestrationPolicy>;
  workflowFailed?: boolean;
};

function resolveVerdict(
  route: DecisionRoute,
  readiness: SubmissionReadiness,
  escalation: EscalationResult,
  decision: RuntimeDecision,
  policy: OrchestrationPolicy,
): FinalRuntimeVerdict {
  if (route.target === "abort" || decision.action === "block") {
    if (policy.blockVerdictOnEscalation && escalation.level === "executive") {
      return "abort";
    }
    if (readiness.ready && policy.allowConditionalSubmit) {
      return "conditional_submit";
    }
    return escalation.level === "executive" ? "abort" : "defer";
  }

  if (route.target === "hold" || route.target === "review") {
    if (readiness.ready && policy.allowConditionalSubmit) {
      return "conditional_submit";
    }
    return "defer";
  }

  if (readiness.ready && decision.action === "allow") {
    return "submit";
  }

  if (readiness.ready && decision.action === "warn") {
    return policy.allowConditionalSubmit ? "conditional_submit" : "defer";
  }

  return "defer";
}

function resolveOrchestrationStatus(
  workflowFailed: boolean,
  readiness: SubmissionReadiness,
): OrchestrationStatus {
  if (workflowFailed) return "failed";
  if (!readiness.ready && readiness.blockers.length > 0) return "partial";
  return "completed";
}

function buildSummary(
  verdict: FinalRuntimeVerdict,
  readiness: SubmissionReadiness,
  route: DecisionRoute,
): string {
  const verdictText: Record<FinalRuntimeVerdict, string> = {
    submit: "系统判定可进入正式投标包提交流程",
    conditional_submit: "可在完成复核后条件性提交",
    defer: "建议暂缓提交，先完成阻断项补强",
    abort: "当前不具备投标准备条件，建议终止本轮投标准备",
  };
  return `${verdictText[verdict]}。路由：${route.label}，就绪评分 ${readiness.score}（${readiness.grade}）。`;
}

function buildNextActions(
  verdict: FinalRuntimeVerdict,
  decision: RuntimeDecision,
  readiness: SubmissionReadiness,
  escalation: EscalationResult,
): string[] {
  const actions: string[] = [];

  if (verdict === "submit") {
    actions.push("进入正式投标包生成与导出");
    return actions;
  }

  actions.push(...readiness.blockers.slice(0, 2).map((b) => `解除阻断：${b}`));
  actions.push(...decision.suggestedNextSteps.slice(0, 2));
  actions.push(...escalation.resolutionHints.slice(0, 2));

  if (verdict === "conditional_submit") {
    actions.unshift("完成人工复核后标记为可提交");
  }

  return [...new Set(actions)].slice(0, 6);
}

/**
 * V3.0 最终运行时结果
 */
export function buildFinalRuntimeOutcome(
  input: BuildFinalRuntimeOutcomeInput,
): FinalRuntimeOutcome {
  const policy: OrchestrationPolicy = {
    minReadinessScore: input.policy?.minReadinessScore ?? 75,
    allowConditionalSubmit: input.policy?.allowConditionalSubmit !== false,
    escalateOnWarn: input.policy?.escalateOnWarn !== false,
    blockVerdictOnEscalation: input.policy?.blockVerdictOnEscalation !== false,
  };

  const verdict = resolveVerdict(
    input.route,
    input.readiness,
    input.escalation,
    input.decision,
    policy,
  );

  const orchestrationStatus = resolveOrchestrationStatus(
    input.workflowFailed ?? false,
    input.readiness,
  );

  const outcomeId = `out-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  return {
    outcomeId,
    verdict,
    orchestrationStatus,
    summary: buildSummary(verdict, input.readiness, input.route),
    nextActions: buildNextActions(
      verdict,
      input.decision,
      input.readiness,
      input.escalation,
    ),
    decision: input.decision,
    route: input.route,
    escalation: input.escalation,
    readiness: input.readiness,
  };
}
