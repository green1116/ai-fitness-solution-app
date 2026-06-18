import { buildRequirementRegistryRecords } from "@/lib/requirement-intelligence";
import { runEquivalentDecisionEngine } from "@/lib/equivalent-product-intelligence";
import { PDI_CANONICAL_ID } from "../shared/constants";
import { buildMilestoneRegistry } from "../project-foundation/milestone-registry";
import { buildExecutionContext } from "../execution-layer/execution-context";
import { calculateExecutionProgress } from "../execution-layer/execution-status-registry";
import { buildAcceptanceCriteriaRegistry } from "./acceptance-criteria-registry";
import type {
  AcceptanceCheckRecord,
  AcceptanceCheckRegistry,
  AcceptanceCriteriaRecord,
} from "./acceptance-types";

function evaluateRequirementCheck(criteria: AcceptanceCriteriaRecord): AcceptanceCheckRecord {
  const requirement = buildRequirementRegistryRecords().find(
    (record) => record.requirementId === criteria.requirementId,
  );

  if (!requirement) {
    return {
      checkId: `pdi-check-${criteria.criteriaId}`,
      criteriaId: criteria.criteriaId,
      projectId: criteria.projectId,
      status: "fail",
      confidence: 35,
    };
  }

  const score = requirement.score?.totalRequirementScore ?? requirement.matchScore ?? 0;
  return {
    checkId: `pdi-check-${criteria.criteriaId}`,
    criteriaId: criteria.criteriaId,
    projectId: criteria.projectId,
    status: score >= 50 ? "pass" : "warning",
    confidence: Math.min(100, Math.max(60, Math.round(score || 75))),
  };
}

function evaluateProductCheck(criteria: AcceptanceCriteriaRecord): AcceptanceCheckRecord {
  const decision = criteria.requirementId
    ? runEquivalentDecisionEngine(criteria.requirementId)
    : undefined;

  if (!decision) {
    return {
      checkId: `pdi-check-${criteria.criteriaId}`,
      criteriaId: criteria.criteriaId,
      projectId: criteria.projectId,
      status: "fail",
      confidence: 30,
    };
  }

  if (
    decision.decisionLevel === "substitute" ||
    decision.decisionLevel === "conditional-substitute"
  ) {
    return {
      checkId: `pdi-check-${criteria.criteriaId}`,
      criteriaId: criteria.criteriaId,
      projectId: criteria.projectId,
      status: "pass",
      confidence: decision.decisionLevel === "substitute" ? 92 : 78,
    };
  }

  if (decision.decisionLevel === "defer") {
    return {
      checkId: `pdi-check-${criteria.criteriaId}`,
      criteriaId: criteria.criteriaId,
      projectId: criteria.projectId,
      status: "warning",
      confidence: 58,
    };
  }

  return {
    checkId: `pdi-check-${criteria.criteriaId}`,
    criteriaId: criteria.criteriaId,
    projectId: criteria.projectId,
    status: "fail",
    confidence: 40,
  };
}

function evaluateProcurementCheck(criteria: AcceptanceCriteriaRecord): AcceptanceCheckRecord {
  const procurementCount = buildExecutionContext().entries.filter(
    (entry) => entry.projectId === criteria.projectId && entry.procurement,
  ).length;

  if (procurementCount > 0) {
    return {
      checkId: `pdi-check-${criteria.criteriaId}`,
      criteriaId: criteria.criteriaId,
      projectId: criteria.projectId,
      status: "pass",
      confidence: procurementCount >= 3 ? 85 : 70,
    };
  }

  return {
    checkId: `pdi-check-${criteria.criteriaId}`,
    criteriaId: criteria.criteriaId,
    projectId: criteria.projectId,
    status: "fail",
    confidence: 35,
  };
}

function evaluateExecutionCheck(criteria: AcceptanceCriteriaRecord): AcceptanceCheckRecord {
  const projectTasks = buildExecutionContext().entries.filter(
    (entry) => entry.projectId === criteria.projectId,
  );
  const progress = calculateExecutionProgress(
    projectTasks.map((entry) => ({
      taskId: entry.taskId,
      milestoneId: entry.milestoneId,
      name: entry.taskId,
      status: entry.status,
    })),
  );

  const completedMilestones = buildMilestoneRegistry().records.filter(
    (milestone) => milestone.projectId === criteria.projectId && milestone.status === "completed",
  ).length;

  if (progress >= 35 || completedMilestones >= 1) {
    return {
      checkId: `pdi-check-${criteria.criteriaId}`,
      criteriaId: criteria.criteriaId,
      projectId: criteria.projectId,
      status: "pass",
      confidence: Math.min(100, progress + 20),
    };
  }

  if (progress >= 30) {
    return {
      checkId: `pdi-check-${criteria.criteriaId}`,
      criteriaId: criteria.criteriaId,
      projectId: criteria.projectId,
      status: "warning",
      confidence: Math.max(50, progress),
    };
  }

  return {
    checkId: `pdi-check-${criteria.criteriaId}`,
    criteriaId: criteria.criteriaId,
    projectId: criteria.projectId,
    status: "fail",
    confidence: Math.max(30, progress),
  };
}

function evaluateCriteria(criteria: AcceptanceCriteriaRecord): AcceptanceCheckRecord {
  switch (criteria.category) {
    case "requirement":
      return evaluateRequirementCheck(criteria);
    case "product":
      return evaluateProductCheck(criteria);
    case "procurement":
      return evaluateProcurementCheck(criteria);
    case "execution":
      return evaluateExecutionCheck(criteria);
  }
}

let cachedRegistry: AcceptanceCheckRegistry | undefined;

export function buildAcceptanceChecks(): AcceptanceCheckRegistry {
  if (cachedRegistry) return cachedRegistry;

  const records = buildAcceptanceCriteriaRegistry().records.map(evaluateCriteria);
  const passCount = records.filter((record) => record.status === "pass").length;
  const warningCount = records.filter((record) => record.status === "warning").length;
  const failCount = records.filter((record) => record.status === "fail").length;

  cachedRegistry = {
    registryId: "pdi-acceptance-check-registry-v45-p4",
    records,
    count: records.length,
    passCount,
    warningCount,
    failCount,
    passRate: records.length === 0 ? 0 : passCount / records.length,
    mode: PDI_CANONICAL_ID,
  };

  return cachedRegistry;
}
