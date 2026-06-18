import {
  PDI_MIN_EXECUTION_DECISION_LINK_COUNT,
  PDI_MIN_EXECUTION_PROCUREMENT_LINK_COUNT,
  PDI_MIN_EXECUTION_STATUS_COVERAGE,
  PDI_MIN_EXECUTION_TASK_COUNT,
} from "../shared/constants";
import { buildExecutionDecisionLinks } from "./execution-decision-link";
import { buildExecutionProcurementLinks } from "./execution-procurement-link";
import { analyzeExecutionStatusCoverage } from "./execution-status-registry";
import { buildExecutionTaskRegistry } from "./execution-task-registry";
import type { ExecutionLayerValidation } from "./execution-types";

export function validateExecutionLayer(): ExecutionLayerValidation {
  const tasks = buildExecutionTaskRegistry();
  const statusCoverage = analyzeExecutionStatusCoverage(tasks.records);
  const procurementLinks = buildExecutionProcurementLinks();
  const decisionLinks = buildExecutionDecisionLinks();

  const taskCount = tasks.count;
  const procurementLinkCount = procurementLinks.length;
  const decisionLinkCount = decisionLinks.length;

  const valid =
    taskCount >= PDI_MIN_EXECUTION_TASK_COUNT &&
    statusCoverage.coverageRatio >= PDI_MIN_EXECUTION_STATUS_COVERAGE &&
    procurementLinkCount >= PDI_MIN_EXECUTION_PROCUREMENT_LINK_COUNT &&
    decisionLinkCount >= PDI_MIN_EXECUTION_DECISION_LINK_COUNT;

  const summary = [
    `tasks=${taskCount}`,
    `statusCoverage=${(statusCoverage.coverageRatio * 100).toFixed(1)}%`,
    `procurementLinks=${procurementLinkCount}`,
    `decisionLinks=${decisionLinkCount}`,
  ].join(" ");

  return {
    valid,
    taskCount,
    statusCoverage: statusCoverage.coverageRatio,
    procurementLinkCount,
    decisionLinkCount,
    summary,
  };
}
