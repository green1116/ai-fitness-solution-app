import { PDI_CANONICAL_ID } from "../shared/constants";
import { buildMilestoneRegistry } from "../project-foundation/milestone-registry";
import { buildExecutionDecisionLinks } from "./execution-decision-link";
import { buildExecutionProcurementLinks } from "./execution-procurement-link";
import { analyzeExecutionStatusCoverage } from "./execution-status-registry";
import { buildExecutionTaskRegistry } from "./execution-task-registry";
import type { ExecutionContext, ExecutionContextEntry } from "./execution-types";

let cachedContext: ExecutionContext | undefined;

export function buildExecutionContext(): ExecutionContext {
  if (cachedContext) return cachedContext;

  const tasks = buildExecutionTaskRegistry().records;
  const procurementLinks = buildExecutionProcurementLinks();
  const decisionLinks = buildExecutionDecisionLinks();
  const statusCoverage = analyzeExecutionStatusCoverage(tasks);

  const milestoneById = new Map(
    buildMilestoneRegistry().records.map((milestone) => [milestone.milestoneId, milestone]),
  );
  const procurementByTask = new Map(procurementLinks.map((link) => [link.taskId, link]));
  const decisionByTask = new Map(decisionLinks.map((link) => [link.taskId, link]));

  const entries: ExecutionContextEntry[] = tasks.map((task) => {
    const milestone = milestoneById.get(task.milestoneId);
    return {
      projectId: milestone?.projectId ?? "",
      milestoneId: task.milestoneId,
      taskId: task.taskId,
      status: task.status,
      decision: decisionByTask.get(task.taskId),
      procurement: procurementByTask.get(task.taskId),
    };
  });

  cachedContext = {
    contextId: "pdi-execution-context-v45-p2",
    entries,
    tasks,
    procurementLinks,
    decisionLinks,
    statusCoverage,
    mode: PDI_CANONICAL_ID,
  };

  return cachedContext;
}
