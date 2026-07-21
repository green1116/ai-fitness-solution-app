/**
 * E11-P6 — Optimization Engine
 * Uses governance metrics to produce optimization recommendations / actions
 */

import type { ExecutionManager } from "../execution/execution.manager";
import { captureGovernanceMetrics } from "../governance/governance.metrics";
import { listAllocations, releaseAllocation } from "../governance/governance.allocation";
import { createOperation, updateOperation } from "./autonomous.operation";
import type { OptimizeResult } from "./autonomous.types";

function nowIso(): string {
  return new Date().toISOString();
}

export function optimizeResources(options?: {
  utilizationTarget?: number;
  releaseDenied?: boolean;
  /** Optional: emit a probe task via execution manager. */
  execution?: ExecutionManager;
  runtimeId?: string;
  tenantId?: string;
}): OptimizeResult {
  const utilizationTarget = options?.utilizationTarget ?? 0.75;
  const op = createOperation({
    kind: "OPTIMIZE",
    title: "Optimize resource utilization",
    runtimeId: options?.runtimeId,
    tenantId: options?.tenantId,
  });
  updateOperation(op.id, { status: "RUNNING", startedAt: nowIso() });

  const recommendations: string[] = [];

  try {
    const metrics = captureGovernanceMetrics();
    recommendations.push(
      `utilization=${metrics.averageUtilization.toFixed(2)} target=${utilizationTarget}`,
    );

    if (metrics.deniedAllocations > 0) {
      recommendations.push(
        `review denied allocations count=${metrics.deniedAllocations}`,
      );
    }

    if (metrics.averageUtilization > utilizationTarget) {
      recommendations.push("consider scaling capacity or throttling LOW priority");
      // Soft optimize: release oldest LOW priority ACTIVE allocation if any
      const lowActive = listAllocations({
        status: "ACTIVE",
        priority: "LOW",
      });
      if (lowActive.length > 0) {
        const target = lowActive[0]!;
        releaseAllocation(target.id);
        recommendations.push(`released LOW allocation ${target.id}`);
      }
    } else if (metrics.averageUtilization < utilizationTarget * 0.4) {
      recommendations.push("capacity underutilized — consolidate workloads");
    } else {
      recommendations.push("utilization within target band");
    }

    if (options?.execution && options.runtimeId) {
      const task = options.execution.createTask({
        name: "autonomous-optimize-probe",
        kind: "PROBE",
        runtimeId: options.runtimeId,
        payload: {
          operationId: op.id,
          utilization: metrics.averageUtilization,
        },
      });
      options.execution.queue(task.id);
      options.execution.execute(task.id);
      recommendations.push(`probe task ${task.id} executed`);
    }

    const optimized = recommendations.some((r) =>
      r.startsWith("released LOW") || r.includes("within target"),
    );

    updateOperation(op.id, {
      status: "SUCCEEDED",
      finishedAt: nowIso(),
      result: recommendations.join("; "),
    });

    return {
      operationId: op.id,
      optimized,
      recommendations,
      utilization: metrics.averageUtilization,
      message: `optimize completed util=${metrics.averageUtilization.toFixed(2)}`,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "optimize failed";
    updateOperation(op.id, {
      status: "FAILED",
      finishedAt: nowIso(),
      error: message,
    });
    return {
      operationId: op.id,
      optimized: false,
      recommendations,
      utilization: 0,
      message,
    };
  }
}
