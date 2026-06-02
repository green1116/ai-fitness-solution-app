import { buildExecutiveOversightRuntime } from "../runtime/buildExecutiveOversight";
import type {
  ExecutiveBriefSection,
  ExecutiveOversightRuntimeInput,
  ExecutiveSupervision,
  ExecutiveTenderResult,
} from "../types";
import {
  recommendationToVerdict,
  toBuildExecutiveOversightInput,
  verdictMessage,
  verdictTitle,
} from "../types";
import {
  buildExecutiveInputsSnapshot,
  buildExecutiveKeyMetrics,
} from "./assessExecutiveRisk";
import { appendExecutiveEvent, createExecutiveTrace } from "./executiveTrace";

/**
 * V3.4-E9 Executive Oversight Runtime
 *
 * 委托确定性 buildExecutiveOversightRuntime，并输出兼容 ExecutiveTenderResult。
 */
export function runExecutiveOversightRuntime(
  input: ExecutiveOversightRuntimeInput,
): ExecutiveTenderResult {
  const started = Date.now();
  const ranAt = new Date().toISOString();
  let trace = createExecutiveTrace(input.runId);

  trace = appendExecutiveEvent(trace, "executive_risk", "评估高管风险");
  const oversightInput = toBuildExecutiveOversightInput(input);
  const pkg = buildExecutiveOversightRuntime(oversightInput);
  trace = appendExecutiveEvent(trace, "executive_score", `score=${pkg.executiveScore}`);
  trace = appendExecutiveEvent(trace, "recommendation_rules", pkg.recommendation);
  trace = appendExecutiveEvent(trace, "debug", "生成 executive debug");

  const verdict = recommendationToVerdict(pkg.recommendation);
  const inputs = buildExecutiveInputsSnapshot(input);
  const keyMetrics = buildExecutiveKeyMetrics(input);

  const brief: ExecutiveBriefSection[] = [
    { heading: "Executive Summary", body: pkg.debug.summary },
    { heading: "Executive Findings", body: pkg.debug.findings },
    { heading: "Critical Findings", body: pkg.debug.criticalFindings },
    { heading: "Recommendations", body: pkg.debug.recommendations },
  ];

  const supervision: ExecutiveSupervision = {
    riskLevel: pkg.risk.executiveRisk,
    verdict,
    requiresBoardReview:
      pkg.risk.executiveRisk === "critical" ||
      pkg.recommendation === "reject",
    requiresComplianceSignoff:
      input.tenderGovernance?.escalation.required === true ||
      pkg.recommendation === "conditional-approve" ||
      pkg.recommendation === "review-required",
    escalationLevel:
      input.tenderGovernance?.escalation.level ?? "none",
  };

  const explain = [
    `recommendation=${pkg.recommendation}`,
    `executiveApproved=${pkg.executiveApproved}`,
    ...pkg.findings.slice(0, 5).map((f) => f.summary),
  ];

  return {
    ...pkg,
    runId: input.runId,
    ranAt,
    durationMs: Date.now() - started,
    documentId: input.documentId,
    riskLevel: pkg.risk.executiveRisk,
    verdict,
    title: verdictTitle(verdict),
    message: verdictMessage(verdict),
    brief,
    keyMetrics,
    supervision,
    explain: [...new Set(explain)],
    inputs,
    trace,
  };
}
