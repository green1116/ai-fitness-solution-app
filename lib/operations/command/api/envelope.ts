import type { CommandPlatformStack } from "./stack";
import type { CommandApiEnvelope, CommandPlatformCounts } from "./types";
import { COMMAND_PLATFORM_API_VERSION } from "./types";

export function buildCommandPlatformCounts(stack: CommandPlatformStack): CommandPlatformCounts {
  const pendingIntentIds = stack.hitl.queue.entries
    .filter((e) => e.status === "pending" || e.status === "in-review")
    .map((e) => e.intentId);

  return {
    commands: stack.command.intents.length,
    approvals: {
      pending: stack.hitl.queue.pendingCount,
      approved: stack.hitl.queue.approvedCount,
      rejected: stack.hitl.queue.rejectedCount,
    },
    admission: {
      admitted: stack.coordination.admittedIntentIds.length,
      blocked: stack.coordination.blockedIntentIds.length,
    },
    bridgeReadiness: {
      ready: stack.coordination.dispatchReadiness.filter((r) => r.status === "ready").length,
      partial: stack.coordination.dispatchReadiness.filter((r) => r.status === "partial").length,
      blocked: stack.coordination.dispatchReadiness.filter((r) => r.status === "blocked").length,
      notReady: stack.coordination.dispatchReadiness.filter((r) => r.status === "not-ready").length,
    },
    audit: {
      command: stack.command.audit.records.length,
      review: stack.hitl.reviewTrail.records.length,
      admission: stack.coordination.admissionAudit.length,
      total:
        stack.command.audit.records.length +
        stack.hitl.reviewTrail.records.length +
        stack.coordination.admissionAudit.length,
    },
  };
}

export function resolvePlatformStatus(stack: CommandPlatformStack): string {
  if (stack.coordination.status === "open" && stack.bridge.status === "completed") return "operational";
  if (stack.coordination.status === "partial" || stack.bridge.status === "partial") return "degraded";
  if (stack.coordination.status === "closed" || stack.hitl.status === "blocked") return "restricted";
  return stack.command.status;
}

export function buildCommandApiEnvelope<T>(
  stack: CommandPlatformStack,
  data: T,
): CommandApiEnvelope<T> {
  const counts = buildCommandPlatformCounts(stack);
  const pendingIntentIds = stack.hitl.queue.entries
    .filter((e) => e.status === "pending" || e.status === "in-review")
    .map((e) => e.intentId);

  return {
    version: COMMAND_PLATFORM_API_VERSION,
    platformStatus: resolvePlatformStatus(stack),
    deploymentId: stack.deploymentId,
    counts,
    blockedSummary: {
      count: stack.coordination.blockedIntentIds.length,
      intentIds: stack.coordination.blockedIntentIds,
    },
    admittedSummary: {
      count: stack.coordination.admittedIntentIds.length,
      intentIds: stack.coordination.admittedIntentIds,
    },
    pendingSummary: {
      count: pendingIntentIds.length,
      intentIds: pendingIntentIds,
    },
    data,
  };
}
