import { buildIndustryOpportunityActivations } from "@/lib/industry-opportunity-activation";
import type { IndustryOpportunityActivation } from "@/lib/industry-opportunity-activation";
import { buildExecutionScore, resolveExecutionStatusFromActivation } from "./execution-scoring";
import type { IndustryExecution, IndustryExecutionType, RegistryValidation } from "./shared/types";
import { CANONICAL_EXECUTION_SUBJECT_ID } from "./shared/types";

function activationToExecution(
  activation: IndustryOpportunityActivation,
  rank: number,
): IndustryExecution {
  const executionId = `ind-execution-${activation.activationId}`;
  const score = buildExecutionScore(executionId, activation, rank);

  return {
    executionId,
    activationId: activation.activationId,
    opportunityId: activation.opportunityId,
    executionType: activation.opportunityType,
    subjectId: activation.subjectId,
    subjectType: activation.subjectType,
    title: `${activation.title.replace(" — Activation", "")} — Execution`,
    summary: `${activation.summary} Transitioned to industry execution pipeline.`,
    insightIds: [...activation.insightIds],
    executionStatus: resolveExecutionStatusFromActivation(activation, score, rank),
    score,
    generatedAt: activation.generatedAt,
    metadata: {
      ...activation.metadata,
      sourceActivationScore: activation.score.totalActivationScore.toString(),
      sourceLayer: "v33-industry-opportunity-activation",
    },
    mode: "industry-execution",
  };
}

export function buildIndustryExecutions(): IndustryExecution[] {
  const activations = buildIndustryOpportunityActivations();

  return activations.map((activation, index) => activationToExecution(activation, index + 1));
}

export function getExecutionById(executionId: string): IndustryExecution | undefined {
  return buildIndustryExecutions().find((execution) => execution.executionId === executionId);
}

export function getExecutionsByType(executionType: IndustryExecutionType): IndustryExecution[] {
  return buildIndustryExecutions().filter((execution) => execution.executionType === executionType);
}

export function getExecutionsBySubject(subjectId: string): IndustryExecution[] {
  return buildIndustryExecutions().filter((execution) => execution.subjectId === subjectId);
}

export function validateExecutionRegistry(): RegistryValidation {
  const executions = buildIndustryExecutions();
  const requiredTypes: IndustryExecutionType[] = ["supplier", "brand", "tender", "partnership"];
  const requiredStatuses = ["planned", "ready", "executing", "completed", "blocked"] as const;

  const typeCoverage = requiredTypes.every((type) =>
    executions.some((execution) => execution.executionType === type),
  );

  const statusCoverage = requiredStatuses.every((status) =>
    executions.some((execution) => execution.executionStatus === status),
  );

  const scoreValid = executions.every(
    (execution) =>
      execution.score.feasibility > 0 &&
      execution.score.readiness > 0 &&
      execution.score.impact > 0 &&
      execution.score.urgency > 0 &&
      execution.score.confidence > 0 &&
      execution.score.activationStrength > 0 &&
      execution.score.totalExecutionScore > 0 &&
      execution.insightIds.length > 0 &&
      execution.mode === "industry-execution",
  );

  const canonical = getExecutionsBySubject(CANONICAL_EXECUTION_SUBJECT_ID);

  const valid =
    executions.length >= 8 &&
    typeCoverage &&
    statusCoverage &&
    scoreValid &&
    canonical.length >= 1;

  return {
    valid,
    count: executions.length,
    summary: `execution-registry count=${executions.length} types=${requiredTypes.filter((t) => executions.some((e) => e.executionType === t)).length}/4 statuses=${requiredStatuses.filter((s) => executions.some((e) => e.executionStatus === s)).length}/5 valid=${valid}`,
  };
}
