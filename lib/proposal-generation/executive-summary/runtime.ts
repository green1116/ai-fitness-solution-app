import { finalizeRuntime, runStage } from "../shared/runtime";
import type { ProposalRuntimeResult, ProposalStageResult } from "../shared/types";
import { PROPOSAL_GENERATION_VERSION } from "../shared/types";
import {
  buildBusinessObjectives,
  buildExpectedBenefits,
  buildProjectOverview,
  buildSuccessMetrics,
} from "./builders";
import type { ExecutiveSummaryRuntimePayload } from "./types";
import { EXECUTIVE_SUMMARY_RUNTIME_VERSION } from "./types";

export function validateExecutiveSummaryRuntime(input?: {
  deploymentId?: string;
}): { valid: boolean } {
  const deploymentId = input?.deploymentId ?? "executive-default";
  const overview = buildProjectOverview({ deploymentId });
  const objectives = buildBusinessObjectives({ deploymentId });
  const benefits = buildExpectedBenefits({ deploymentId });
  const metrics = buildSuccessMetrics({ deploymentId });
  return {
    valid:
      overview.projectName.length > 0 &&
      objectives.length >= 2 &&
      benefits.length >= 2 &&
      metrics.length >= 2,
  };
}

export function runExecutiveSummaryRuntime(input?: {
  deploymentId?: string;
}): ProposalRuntimeResult<ExecutiveSummaryRuntimePayload> {
  const deploymentId = input?.deploymentId ?? "executive-default";
  const stages: ProposalStageResult[] = [];

  const projectOverview = runStage("exec-overview", "Project Overview", () => buildProjectOverview({ deploymentId }), stages);
  const businessObjectives = runStage("exec-objectives", "Business Objectives", () => buildBusinessObjectives({ deploymentId }), stages);
  const expectedBenefits = runStage("exec-benefits", "Expected Benefits", () => buildExpectedBenefits({ deploymentId }), stages);
  const successMetrics = runStage("exec-metrics", "Success Metrics", () => buildSuccessMetrics({ deploymentId }), stages);

  const validation = runStage("exec-validate", "Executive Summary Validation", () => validateExecutiveSummaryRuntime({ deploymentId }), stages);
  if (!validation.valid) throw new Error("Executive summary validation failed");

  const payload: ExecutiveSummaryRuntimePayload = {
    version: EXECUTIVE_SUMMARY_RUNTIME_VERSION,
    proposalVersion: PROPOSAL_GENERATION_VERSION,
    projectOverview,
    businessObjectives,
    expectedBenefits,
    successMetrics,
    summary: `executive-summary project=${projectOverview.projectName} objectives=${businessObjectives.length} metrics=${successMetrics.length}`,
  };

  return finalizeRuntime({ domain: "executive-summary", deploymentId, stages, payload, summary: payload.summary });
}
