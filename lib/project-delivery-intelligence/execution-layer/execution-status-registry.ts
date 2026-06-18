import { EXECUTION_STATUS } from "../shared/constants";
import { buildExecutionTaskRegistry } from "./execution-task-registry";
import type { ExecutionStatusCoverage } from "./execution-types";

export { EXECUTION_STATUS };

export function calculateExecutionProgress(tasks = buildExecutionTaskRegistry().records): number {
  if (tasks.length === 0) return 0;

  const weights: Record<(typeof EXECUTION_STATUS)[number], number> = {
    planned: 0,
    "in-progress": 50,
    blocked: 25,
    completed: 100,
  };

  const total = tasks.reduce((sum, task) => sum + weights[task.status], 0);
  return Math.round(total / tasks.length);
}

export function analyzeExecutionStatusCoverage(
  tasks = buildExecutionTaskRegistry().records,
): ExecutionStatusCoverage {
  const plannedCount = tasks.filter((task) => task.status === "planned").length;
  const inProgressCount = tasks.filter((task) => task.status === "in-progress").length;
  const blockedCount = tasks.filter((task) => task.status === "blocked").length;
  const completedCount = tasks.filter((task) => task.status === "completed").length;
  const assignedCount = inProgressCount + blockedCount + completedCount;

  return {
    totalTasks: tasks.length,
    plannedCount,
    inProgressCount,
    blockedCount,
    completedCount,
    coverageRatio: tasks.length === 0 ? 0 : assignedCount / tasks.length,
    progressPercent: calculateExecutionProgress(tasks),
  };
}

export function buildExecutionStatusRegistry(): ExecutionStatusCoverage {
  return analyzeExecutionStatusCoverage();
}
