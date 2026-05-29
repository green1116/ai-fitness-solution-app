import { reviewCommand } from "../hitl/review";
import { approveCommand, rejectCommand, confirmCommand } from "../hitl/approval";
import { overrideCommand } from "../hitl/override";
import { cancelCommand } from "../hitl/cancellation";
import { suspendCommand } from "../hitl/suspension";
import { escalateCommand } from "../hitl/escalation";
import { requestCommandRollback } from "../hitl/rollback";
import { createEmptyReviewTrail } from "../hitl/audit";
import { evaluateBridgeEligibility } from "../hitl-bridge/eligibility";
import { admitToExecutionBridge, blockFromExecutionBridge } from "../hitl-bridge/admission";
import { evaluateDispatchReadiness } from "../hitl-bridge/readiness";
import type { CommandControlAction, CommandReviewAction } from "./types";
import { buildCommandApiEnvelope } from "./envelope";
import { buildCommandPlatformStack, type CommandPlatformStack } from "./stack";

export { buildCommandPlatformStack } from "./stack";

function resolveDeploymentId(input?: string): string {
  return input?.trim() || "command-platform-api";
}

export function getCommandSnapshot(deploymentId?: string) {
  const stack = buildCommandPlatformStack(resolveDeploymentId(deploymentId));
  return buildCommandApiEnvelope(stack, {
    snapshot: stack.command.center.snapshot,
    gate: stack.coordination.gate,
    bridgeSummary: stack.bridge.summary,
    hitlSummary: stack.hitl.summary,
  });
}

export function getCommandSummary(deploymentId?: string) {
  const stack = buildCommandPlatformStack(resolveDeploymentId(deploymentId));
  return buildCommandApiEnvelope(stack, {
    command: stack.command.summary,
    coordination: stack.coordination.summary,
    bridge: stack.bridge.summary,
    hitl: stack.hitl.summary,
    text: stack.coordination.summary.text,
  });
}

export function getCommandQueue(deploymentId?: string) {
  const stack = buildCommandPlatformStack(resolveDeploymentId(deploymentId));
  return buildCommandApiEnvelope(stack, {
    queue: stack.hitl.queue,
    reviewCases: stack.hitl.reviewCases,
  });
}

export function getCommandAudit(deploymentId?: string) {
  const stack = buildCommandPlatformStack(resolveDeploymentId(deploymentId));
  return buildCommandApiEnvelope(stack, {
    commandAudit: stack.command.audit,
    reviewTrail: stack.hitl.reviewTrail,
    admissionAudit: stack.coordination.admissionAudit,
  });
}

export function postCommandDispatch(input: { deploymentId?: string; dryRun?: boolean }) {
  const stack = buildCommandPlatformStack(resolveDeploymentId(input.deploymentId));
  const admitted = stack.coordination.admittedIntentIds;
  const readiness = stack.coordination.dispatchReadiness.filter((r) =>
    admitted.includes(r.intentId),
  );

  return buildCommandApiEnvelope(stack, {
    dryRun: input.dryRun ?? true,
    orchestrationOnly: true,
    gateState: stack.coordination.gate.state,
    bridgeStatus: stack.bridge.status,
    dispatchedCommands: stack.bridge.dispatchedCommands.filter((id) => admitted.includes(id)),
    dispatchReadiness: readiness,
    message: "dispatch surface returns readiness; execution remains on bridge runtime",
  });
}

export function postCommandReview(input: {
  deploymentId?: string;
  intentId: string;
  action: CommandReviewAction;
  operator?: string;
  reason?: string;
}) {
  const stack = buildCommandPlatformStack(resolveDeploymentId(input.deploymentId));
  const intent = stack.command.intents.find((i) => i.intentId === input.intentId);
  if (!intent) {
    return buildCommandApiEnvelope(stack, {
      ok: false,
      error: "intent-not-found",
      intentId: input.intentId,
    });
  }

  const operator = input.operator ?? "command-api";
  let trail = createEmptyReviewTrail(stack.deploymentId);
  let reviewCase = reviewCommand({
    deploymentId: stack.deploymentId,
    intent,
    command: stack.command,
    reviewer: operator,
  });

  const action = input.action;
  let result: { reviewCase: typeof reviewCase; trail: typeof trail; record?: unknown } = {
    reviewCase,
    trail,
  };

  if (action === "approve") {
    const r = approveCommand({ reviewCase, trail, operator, reason: input.reason });
    result = { ...r, record: null };
  } else if (action === "reject") {
    const r = rejectCommand({
      reviewCase,
      trail,
      operator,
      reason: input.reason ?? "api-reject",
    });
    result = r;
  } else if (action === "confirm") {
    const r = confirmCommand({ reviewCase, trail, operator, reason: input.reason });
    result = r;
  } else if (action === "override") {
    const r = overrideCommand({
      reviewCase,
      trail,
      operator,
      originalDecision: "pending",
      newDecision: "approved",
      reason: input.reason ?? "api-override",
    });
    result = { ...r, record: r.override };
  } else if (action === "suspend") {
    const r = suspendCommand({
      reviewCase,
      trail,
      operator,
      reason: input.reason ?? "api-suspend",
    });
    result = { ...r, record: r.suspension };
  } else if (action === "cancel") {
    const r = cancelCommand({
      reviewCase,
      trail,
      operator,
      reason: input.reason ?? "api-cancel",
    });
    result = { ...r, record: r.cancellation };
  } else if (action === "escalate") {
    const r = escalateCommand({
      reviewCase,
      trail,
      operator,
      fromLevel: 2,
      toLevel: 5,
      reason: input.reason ?? "api-escalate",
    });
    result = { ...r, record: r.escalation };
  } else if (action === "rollback-request") {
    const r = requestCommandRollback({
      reviewCase,
      trail,
      operator,
      reason: input.reason ?? "api-rollback-request",
    });
    result = { reviewCase, trail: r.trail, record: r.request };
  }

  return buildCommandApiEnvelope(stack, {
    ok: true,
    orchestrationOnly: true,
    intentId: input.intentId,
    action,
    reviewCase: result.reviewCase,
    auditRecords: result.trail.records.length,
    record: result.record ?? null,
    message: "review action applied in API session; rebuild stack for full platform state",
  });
}

export function postCommandAdmission(input: { deploymentId?: string; intentId?: string }) {
  const stack = buildCommandPlatformStack(resolveDeploymentId(input.deploymentId));

  if (input.intentId) {
    const intent = stack.command.intents.find((i) => i.intentId === input.intentId);
    if (!intent) {
      return buildCommandApiEnvelope(stack, {
        ok: false,
        error: "intent-not-found",
        intentId: input.intentId,
      });
    }
    const profile = evaluateBridgeEligibility({
      deploymentId: stack.deploymentId,
      intent,
      command: stack.command,
      hitl: stack.hitl,
    });
    const decision = profile.eligible
      ? admitToExecutionBridge({ deploymentId: stack.deploymentId, profile })
      : blockFromExecutionBridge({ deploymentId: stack.deploymentId, profile });
    const readiness = evaluateDispatchReadiness({
      deploymentId: stack.deploymentId,
      profile,
      admission: decision,
      bridge: stack.bridge,
    });
    return buildCommandApiEnvelope(stack, {
      ok: true,
      intentId: input.intentId,
      eligibility: profile,
      decision,
      readiness,
    });
  }

  return buildCommandApiEnvelope(stack, {
    ok: true,
    gate: stack.coordination.gate,
    decisions: stack.coordination.admissionDecisions,
    eligibilityProfiles: stack.coordination.eligibilityProfiles,
  });
}

export function postCommandControl(input: {
  deploymentId?: string;
  intentId: string;
  action: CommandControlAction;
  operator?: string;
  reason?: string;
}) {
  return postCommandReview({
    deploymentId: input.deploymentId,
    intentId: input.intentId,
    action: input.action,
    operator: input.operator,
    reason: input.reason,
  });
}

export function buildCommandApiHealth(stack?: CommandPlatformStack) {
  const s = stack ?? buildCommandPlatformStack("command-platform-api");
  return buildCommandApiEnvelope(s, {
    commandVersion: s.command.version,
    hitlVersion: s.hitl.version,
    bridgeVersion: s.bridge.version,
    coordinationVersion: s.coordination.version,
    healthy: s.coordination.flags.gate && s.command.flags.commandCenter,
  });
}
