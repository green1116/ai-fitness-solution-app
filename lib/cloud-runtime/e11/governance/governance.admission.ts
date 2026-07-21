/**
 * E11-P4 — Admission Controller
 * Combines capacity, throttle policy, workload priority, tenant presence
 */

import { getRuntime } from "../registry/cloud.registry";
import { getTenant } from "../tenant/tenant.namespace";
import { getTenantQuotaByType } from "../tenant/tenant.quota";
import { listAllocations } from "./governance.allocation";
import { captureCapacity, totalUtilization } from "./governance.capacity";
import { priorityBypassesSoftThrottle } from "./governance.priority";
import { availableCapacity, getResource } from "./governance.resource";
import { resolveThrottlePolicy } from "./governance.throttle";
import { WORKLOAD_PRIORITIES } from "./governance.constants";
import type {
  AdmissionRequest,
  AdmissionResult,
  WorkloadPriority,
} from "./governance.types";

let admittedCount = 0;
let rejectedCount = 0;
let throttledCount = 0;

function nowIso(): string {
  return new Date().toISOString();
}

function result(
  request: AdmissionRequest,
  decision: AdmissionResult["decision"],
  reason: string,
  priority: WorkloadPriority,
): AdmissionResult {
  if (decision === "ADMIT") admittedCount += 1;
  else if (decision === "REJECT") rejectedCount += 1;
  else throttledCount += 1;

  return {
    decision,
    tenantId: request.tenantId,
    resourceId: request.resourceId,
    reason,
    priority,
    checkedAt: nowIso(),
  };
}

export function evaluateAdmission(
  request: AdmissionRequest,
): AdmissionResult {
  const tenantId = request.tenantId.trim();
  const resourceId = request.resourceId.trim();
  const priority = request.priority ?? "NORMAL";
  if (!(WORKLOAD_PRIORITIES as readonly string[]).includes(priority)) {
    return result(request, "REJECT", `invalid priority: ${priority}`, "NORMAL");
  }
  if (!tenantId) return result(request, "REJECT", "tenantId required", priority);
  if (!resourceId) {
    return result(request, "REJECT", "resourceId required", priority);
  }
  if (!Number.isFinite(request.amount) || request.amount <= 0) {
    return result(request, "REJECT", "amount must be > 0", priority);
  }

  const tenant = getTenant(tenantId);
  if (!tenant || tenant.status !== "ACTIVE") {
    return result(request, "REJECT", `tenant not ACTIVE: ${tenantId}`, priority);
  }

  const resource = getResource(resourceId);
  if (!resource) {
    return result(
      request,
      "REJECT",
      `resource not found: ${resourceId}`,
      priority,
    );
  }

  if (request.runtimeId) {
    const runtime = getRuntime(request.runtimeId.trim());
    if (!runtime) {
      return result(
        request,
        "REJECT",
        `runtime not found: ${request.runtimeId}`,
        priority,
      );
    }
  }

  if (availableCapacity(resourceId) < request.amount) {
    return result(request, "REJECT", "insufficient capacity", priority);
  }

  const taskQuota = getTenantQuotaByType(tenantId, "TASK");
  if (taskQuota && taskQuota.used + 1 > taskQuota.limit) {
    return result(request, "REJECT", "tenant TASK quota exceeded", priority);
  }

  const policy = resolveThrottlePolicy(tenantId);
  if (policy && policy.mode !== "OFF") {
    const cap = captureCapacity(resourceId);
    const util = cap.utilization;
    const globalUtil = totalUtilization();
    const effectiveUtil = Math.max(util, globalUtil);

    if (policy.mode === "HARD" && effectiveUtil >= policy.threshold) {
      if (policy.maxConcurrent !== undefined) {
        const active = listAllocations({ status: "ACTIVE" }).length;
        if (active >= policy.maxConcurrent) {
          return result(
            request,
            "REJECT",
            `HARD throttle: maxConcurrent=${policy.maxConcurrent}`,
            priority,
          );
        }
      }
      if (!priorityBypassesSoftThrottle(priority)) {
        return result(
          request,
          "REJECT",
          `HARD throttle: utilization=${effectiveUtil.toFixed(2)}`,
          priority,
        );
      }
    }

    if (policy.mode === "SOFT" && effectiveUtil >= policy.threshold) {
      if (!priorityBypassesSoftThrottle(priority)) {
        return result(
          request,
          "THROTTLE",
          `SOFT throttle: utilization=${effectiveUtil.toFixed(2)}`,
          priority,
        );
      }
    }
  }

  return result(request, "ADMIT", "admission granted", priority);
}

export function getAdmissionCounters(): {
  admittedCount: number;
  rejectedCount: number;
  throttledCount: number;
} {
  return { admittedCount, rejectedCount, throttledCount };
}

export function resetAdmissionCounters(): void {
  admittedCount = 0;
  rejectedCount = 0;
  throttledCount = 0;
}
