/**
 * E06-P4 — Enterprise Control Monitor
 * Derives health reports from control run results
 */

import { getControlById } from "./control.registry";
import type {
  ControlHealthEntry,
  ControlHealthReport,
  ControlHealthStatus,
  ControlRunResult,
} from "./control.types";

function completionRatio(run: ControlRunResult): number {
  return run.stepCount === 0 ? 0 : run.completedSteps / run.stepCount;
}

export function monitorControlRun(run: ControlRunResult): ControlHealthEntry {
  const control = getControlById(run.controlId);
  const threshold = control?.healthThreshold ?? 1;
  const ratio = completionRatio(run);

  let status: ControlHealthStatus;
  if (run.success && ratio >= threshold) {
    status = "green";
  } else if (run.status === "blocked") {
    status = "amber";
  } else {
    status = "red";
  }

  return {
    controlId: run.controlId,
    workflowId: run.workflowId,
    status,
    completionRatio: ratio,
    healthy: status === "green",
    note: `mode=${run.mode} status=${run.status} steps=${run.completedSteps}/${run.stepCount}`,
    readOnly: true,
  };
}

export function buildControlHealthReport(
  planId: string,
  runs: ControlRunResult[],
): ControlHealthReport {
  const entries = runs.map((run) => monitorControlRun(run));
  const healthyCount = entries.filter((e) => e.healthy).length;
  const successRate = entries.length === 0 ? 0 : healthyCount / entries.length;

  let status: ControlHealthStatus;
  if (entries.length > 0 && healthyCount === entries.length) {
    status = "green";
  } else if (entries.some((e) => e.status === "red")) {
    status = "red";
  } else {
    status = "amber";
  }

  return {
    planId,
    status,
    entryCount: entries.length,
    healthyCount,
    successRate,
    entries,
    summary: [
      `control-plane health=${status}`,
      `healthy=${healthyCount}/${entries.length}`,
      `successRate=${successRate.toFixed(2)}`,
    ].join(" "),
    readOnly: true,
  };
}

export function assertControlHealthPass(
  report: ControlHealthReport,
): asserts report is ControlHealthReport & { status: "green" } {
  if (report.status !== "green") {
    throw new Error(`E06 control plane unhealthy: ${report.summary}`);
  }
}
