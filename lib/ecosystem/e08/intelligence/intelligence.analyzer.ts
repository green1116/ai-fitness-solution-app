/**
 * E08-P5 — Ecosystem Intelligence Analyzer
 * Scores cross-enterprise workflow results for ecosystem analysis
 */

import type { WorkflowExecutionResult } from "../workflow/workflow.types";
import type { IntelligenceAnalysis } from "./intelligence.types";

export function analyzeWorkflowResult(
  result: WorkflowExecutionResult | undefined,
  workflowId: string,
  targetScore: number,
): IntelligenceAnalysis {
  if (!result) {
    return {
      workflowId,
      score: 0,
      completedSteps: 0,
      stepCount: 0,
      exchangedListings: [],
      status: "none",
      findings: ["no workflow result"],
      needsInsight: true,
      readOnly: true,
    };
  }

  const completedSteps = result.completedSteps;
  const stepCount = result.plan.stepCount;
  const score =
    result.success && stepCount > 0
      ? Math.round((completedSteps / stepCount) * 100)
      : result.success
        ? 100
        : 0;

  const findings: string[] = [];
  if (!result.success) {
    findings.push(
      `status=${result.status}: ${result.errorMessage ?? "unknown"}`,
    );
  }
  for (const step of result.stepResults) {
    if (!step.success) {
      findings.push(
        `step ${step.order} ${step.status}: ${step.errorMessage ?? "failed"}`,
      );
    }
  }
  if (result.exchangedListings.length === 0 && stepCount > 0) {
    findings.push("no partner listings exchanged");
  }

  return {
    workflowId,
    score,
    completedSteps,
    stepCount,
    exchangedListings: [...result.exchangedListings],
    status: result.status,
    findings,
    needsInsight: score < targetScore || !result.success,
    readOnly: true,
  };
}
