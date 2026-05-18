import type { ExternalEvidenceRuntimeSuccess } from "../types/runtime";
import type { ExternalEvidenceRuntimeInput } from "../types";
import { RuntimeEventBus } from "./bus";
import { createRuntimeEventCorrelation } from "./correlation";
import {
  createOrchestrationContext,
  type RuntimeOrchestrationContext,
} from "./context";
import { emitRuntimeEvent } from "./emitter";
import { registerDefaultRuntimeEventHandlers } from "./handlers";
import { RuntimeEventTraceStore } from "./traces";
import type { RuntimeEventOrchestrationResult } from "./types";

export type EvidenceRuntimeOrchestrationSession = {
  bus: RuntimeEventBus;
  ctx: RuntimeOrchestrationContext;
  traceStore: RuntimeEventTraceStore;
};

export function createEvidenceRuntimeOrchestrationSession(input: {
  runtimeInput: ExternalEvidenceRuntimeInput;
  runId: string;
  ranAt: string;
}): EvidenceRuntimeOrchestrationSession {
  const correlation = createRuntimeEventCorrelation({
    traceId: input.runId,
    correlationId: input.runtimeInput.correlationId,
    jobId: input.runtimeInput.jobId,
    planId: input.runtimeInput.planId,
    tenderId: input.runtimeInput.tenderId,
    documentId: input.runtimeInput.tenderDocument?.documentId,
  });
  const traceStore = new RuntimeEventTraceStore();
  const bus = new RuntimeEventBus(traceStore, {
    debug: process.env.EVIDENCE_EVENT_DEBUG === "1",
  });
  registerDefaultRuntimeEventHandlers(bus);
  const ctx = createOrchestrationContext({
    correlation,
    runtimeInput: input.runtimeInput,
    runId: input.runId,
    ranAt: input.ranAt,
  });
  return { bus, ctx, traceStore };
}

export function finalizeOrchestration(
  session: EvidenceRuntimeOrchestrationSession,
): RuntimeEventOrchestrationResult {
  return session.traceStore.toResult({
    traceId: session.ctx.correlation.traceId,
    correlationId: session.ctx.correlation.correlationId,
    flags: session.ctx.flags,
  });
}

/** Pipeline 完成后根据结果批量发射里程碑事件 */
export async function emitPostPipelineRuntimeEvents(
  session: EvidenceRuntimeOrchestrationSession,
  result: ExternalEvidenceRuntimeSuccess,
) {
  const { bus, ctx } = session;
  const snap = ctx.snapshot;

  if (result.ocrDocuments?.length) {
    snap.ocrDocumentCount = result.ocrDocuments.length;
    snap.ocrBlockCount = result.ocrDocuments.reduce(
      (n, d) => n + d.blocks.length,
      0,
    );
    await emitRuntimeEvent(bus, ctx, "OCR_COMPLETED", {
      meta: { documents: snap.ocrDocumentCount, blocks: snap.ocrBlockCount },
      evidenceIds: result.registry?.records.map((r) => r.id),
    });
  }

  if (result.coverageRuntime) {
    snap.coverageRuntime = result.coverageRuntime;
    await emitRuntimeEvent(bus, ctx, "COVERAGE_RE_EVALUATED", {
      validationSummary: {
        verdict: result.coverageRuntime.validation.verdict,
        score: result.coverageRuntime.summary.validationScore,
      },
    });
  }

  if (result.tenderValidation) {
    snap.tenderValidation = result.tenderValidation;
    const failed =
      result.tenderValidation.outcome === "rejected" ||
      result.tenderValidation.outcome === "incomplete";
    await emitRuntimeEvent(
      bus,
      ctx,
      failed ? "VALIDATION_FAILED" : "VALIDATION_PASSED",
      {
        reason: result.tenderValidation.outcome,
        validationSummary: {
          outcome: result.tenderValidation.outcome,
          findings: result.tenderValidation.findings.length,
          critical: result.tenderValidation.summary.criticalCount,
        },
        riskLevel: failed ? "high" : "low",
      },
    );
  }

  if (result.tenderAudit) {
    snap.tenderAudit = result.tenderAudit;
    const approved = result.tenderAudit.governanceStatus === "clear";
    const rejected = result.tenderAudit.governanceStatus === "blocked";
    await emitRuntimeEvent(
      bus,
      ctx,
      rejected ? "AUDIT_REJECTED" : approved ? "AUDIT_APPROVED" : "AUDIT_REJECTED",
      {
        reason: result.tenderAudit.governanceStatus,
        auditSummary: {
          governanceStatus: result.tenderAudit.governanceStatus,
          entries: result.tenderAudit.trail.entries.length,
        },
      },
    );
  }

  if (result.tenderGovernance) {
    snap.tenderGovernance = result.tenderGovernance;
    const approved = result.tenderGovernance.posture === "proceed";
    const escalated =
      result.tenderGovernance.posture === "escalate" ||
      result.tenderGovernance.posture === "hold";
    const failed = result.tenderGovernance.posture === "halt";
    if (approved) {
      await emitRuntimeEvent(bus, ctx, "GOVERNANCE_APPROVED", {
        reason: result.tenderGovernance.posture,
      });
    } else if (escalated || result.tenderGovernance.escalation.required) {
      await emitRuntimeEvent(bus, ctx, "GOVERNANCE_ESCALATED", {
        reason: result.tenderGovernance.posture,
        riskLevel: result.tenderGovernance.riskLevel,
      });
    } else if (failed) {
      await emitRuntimeEvent(bus, ctx, "GOVERNANCE_FAILED", {
        reason: result.tenderGovernance.posture,
        riskLevel: result.tenderGovernance.riskLevel,
      });
    }
  }

  if (result.executiveOversight) {
    snap.executiveOversight = result.executiveOversight;
  }
  if (result.executiveApprovalGate) {
    snap.executiveApprovalGate = result.executiveApprovalGate;
    const approved =
      result.executiveApprovalGate.status === "approved" ||
      result.executiveApprovalGate.status === "conditional";
    if (approved) {
      await emitRuntimeEvent(bus, ctx, "EXECUTIVE_APPROVED", {
        reason: result.executiveApprovalGate.status,
        releaseDecision: result.executiveApprovalGate.releasable
          ? "enabled"
          : "conditional",
      });
    }
  }

  if (result.executiveReleaseSurface) {
    snap.executiveReleaseSurface = result.executiveReleaseSurface;
  }
  if (result.runtimePolicy) {
    snap.runtimePolicy = result.runtimePolicy;
    if (result.runtimePolicy.blocked) {
      await emitRuntimeEvent(bus, ctx, "RELEASE_BLOCKED", {
        reason: "policy-blocked",
        policyDecision: {
          triggered: result.runtimePolicy.triggeredPolicies.length,
          blocked: true,
        },
        releaseDecision: "blocked",
      });
    }
  }

  if (result.runtimeStateMachine) {
    snap.runtimeStateMachine = result.runtimeStateMachine;
    for (const tr of result.runtimeStateMachine.transitions) {
      await emitRuntimeEvent(bus, ctx, "STATE_TRANSITIONED", {
        previousState: tr.from,
        currentState: tr.to,
        reason: tr.reason,
      });
    }
    if (
      result.runtimeStateMachine.releasable &&
      !ctx.flags.releaseBlocked
    ) {
      await emitRuntimeEvent(bus, ctx, "RELEASE_ENABLED", {
        reason: `state-${result.runtimeStateMachine.currentState}`,
        currentState: result.runtimeStateMachine.currentState,
        releaseDecision: "enabled",
      });
    }
    if (result.runtimeStateMachine.currentState === "release-blocked") {
      await emitRuntimeEvent(bus, ctx, "RELEASE_BLOCKED", {
        reason: "state-machine-blocked",
        currentState: result.runtimeStateMachine.currentState,
        releaseDecision: "blocked",
      });
    }
  }
}
