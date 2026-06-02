/**
 * V3.4-E16 — 核心事件反应链（确定性，无 LLM）
 */

import type { RuntimeEventBus } from "../bus";
import type { RuntimeOrchestrationContext } from "../context";
import { emitRuntimeEvent } from "../emitter";

function validationFailed(ctx: RuntimeOrchestrationContext): boolean {
  const v = ctx.snapshot.tenderValidation;
  if (!v) return false;
  return v.outcome === "rejected" || v.outcome === "incomplete";
}

function validationPassed(ctx: RuntimeOrchestrationContext): boolean {
  const v = ctx.snapshot.tenderValidation;
  if (!v) return false;
  return v.outcome === "approved" || v.outcome === "conditional";
}

function auditApproved(ctx: RuntimeOrchestrationContext): boolean {
  const a = ctx.snapshot.tenderAudit;
  if (!a) return false;
  return a.governanceStatus === "clear";
}

function auditRejected(ctx: RuntimeOrchestrationContext): boolean {
  const a = ctx.snapshot.tenderAudit;
  if (!a) return false;
  return a.governanceStatus === "blocked";
}

function governanceApproved(ctx: RuntimeOrchestrationContext): boolean {
  const g = ctx.snapshot.tenderGovernance;
  if (!g) return false;
  return g.posture === "proceed";
}

function governanceEscalated(ctx: RuntimeOrchestrationContext): boolean {
  const g = ctx.snapshot.tenderGovernance;
  if (!g) return false;
  return (
    g.posture === "escalate" ||
    g.posture === "hold" ||
    g.escalation.required === true
  );
}

function executiveApproved(ctx: RuntimeOrchestrationContext): boolean {
  const gate = ctx.snapshot.executiveApprovalGate;
  if (gate) {
    return gate.status === "approved" || gate.status === "conditional";
  }
  const oversight = ctx.snapshot.executiveOversight;
  return oversight?.verdict === "approve";
}

export function registerDefaultRuntimeEventHandlers(bus: RuntimeEventBus) {
  // 1. OCR_COMPLETED → COVERAGE_RE_EVALUATED → VALIDATION_RECHECKED
  bus.on(
    "OCR_COMPLETED",
    async (event, ctx) => {
      if (!ctx.snapshot.coverageRuntime && !ctx.snapshot.ocrDocumentCount) return;
      await emitRuntimeEvent(
        bus,
        ctx,
        "COVERAGE_RE_EVALUATED",
        {
          reason: "ocr-completed-trigger",
          validationSummary: ctx.snapshot.coverageRuntime
            ? {
                verdict: ctx.snapshot.coverageRuntime.validation.verdict,
                score: ctx.snapshot.coverageRuntime.summary.validationScore,
              }
            : undefined,
          meta: {
            ocrDocuments: ctx.snapshot.ocrDocumentCount,
            blocks: ctx.snapshot.ocrBlockCount,
          },
          source: "handler/ocr-completed",
        },
        event.id,
      );
    },
    "handler-ocr-completed",
  );

  bus.on(
    "COVERAGE_RE_EVALUATED",
    async (event, ctx) => {
      if (!ctx.snapshot.tenderValidation && !ctx.snapshot.coverageRuntime) return;
      await emitRuntimeEvent(
        bus,
        ctx,
        "VALIDATION_RECHECKED",
        {
          reason: "coverage-re-evaluated",
          validationSummary: ctx.snapshot.tenderValidation
            ? { outcome: ctx.snapshot.tenderValidation.outcome }
            : ctx.snapshot.coverageRuntime
              ? { verdict: ctx.snapshot.coverageRuntime.validation.verdict }
              : undefined,
          source: "handler/coverage-re-evaluated",
        },
        event.id,
      );
    },
    "handler-coverage-re-evaluated",
  );

  // 2. VALIDATION_FAILED → GOVERNANCE_ESCALATED → RELEASE_BLOCKED
  bus.on(
    "VALIDATION_FAILED",
    async (event, ctx) => {
      ctx.flags.governanceEscalated = true;
      ctx.flags.releaseBlocked = true;
      await emitRuntimeEvent(
        bus,
        ctx,
        "GOVERNANCE_ESCALATED",
        {
          reason: event.payload.reason ?? "validation-failed",
          validationSummary: event.payload.validationSummary,
          riskLevel: event.payload.riskLevel ?? "high",
          source: "handler/validation-failed",
        },
        event.id,
      );
    },
    "handler-validation-failed",
  );

  bus.on(
    "GOVERNANCE_ESCALATED",
    async (event, ctx) => {
      ctx.flags.releaseBlocked = true;
      await emitRuntimeEvent(
        bus,
        ctx,
        "RELEASE_BLOCKED",
        {
          reason: event.payload.reason ?? "governance-escalated",
          releaseDecision: "blocked",
          source: "handler/governance-escalated",
        },
        event.id,
      );
    },
    "handler-governance-escalated",
  );

  bus.on(
    "GOVERNANCE_FAILED",
    async (event, ctx) => {
      ctx.flags.releaseBlocked = true;
      await emitRuntimeEvent(
        bus,
        ctx,
        "RELEASE_BLOCKED",
        {
          reason: event.payload.reason ?? "governance-failed",
          releaseDecision: "blocked",
          source: "handler/governance-failed",
        },
        event.id,
      );
    },
    "handler-governance-failed",
  );

  // 3. AUDIT_APPROVED → EXECUTIVE_REVIEW_UNLOCKED
  bus.on(
    "AUDIT_APPROVED",
    async (event, ctx) => {
      ctx.flags.executiveReviewUnlocked = true;
      await emitRuntimeEvent(
        bus,
        ctx,
        "EXECUTIVE_REVIEW_UNLOCKED",
        {
          reason: event.payload.reason ?? "audit-approved",
          auditSummary: event.payload.auditSummary,
          source: "handler/audit-approved",
        },
        event.id,
      );
    },
    "handler-audit-approved",
  );

  bus.on(
    "AUDIT_REJECTED",
    async (event, ctx) => {
      ctx.flags.releaseBlocked = true;
      await emitRuntimeEvent(
        bus,
        ctx,
        "RELEASE_BLOCKED",
        {
          reason: event.payload.reason ?? "audit-rejected",
          releaseDecision: "blocked",
          auditSummary: event.payload.auditSummary,
          source: "handler/audit-rejected",
        },
        event.id,
      );
    },
    "handler-audit-rejected",
  );

  // 4. GOVERNANCE_APPROVED → RELEASE_ENABLED
  bus.on(
    "GOVERNANCE_APPROVED",
    async (event, ctx) => {
      if (ctx.flags.releaseBlocked) return;
      ctx.flags.releaseEnabled = true;
      await emitRuntimeEvent(
        bus,
        ctx,
        "RELEASE_ENABLED",
        {
          reason: event.payload.reason ?? "governance-approved",
          releaseDecision: "enabled",
          source: "handler/governance-approved",
        },
        event.id,
      );
    },
    "handler-governance-approved",
  );

  // 5. EXECUTIVE_APPROVED → MANIFEST_GENERATION_REQUESTED
  bus.on(
    "EXECUTIVE_APPROVED",
    async (event, ctx) => {
      ctx.flags.manifestRequested = true;
      await emitRuntimeEvent(
        bus,
        ctx,
        "MANIFEST_GENERATION_REQUESTED",
        {
          reason: event.payload.reason ?? "executive-approved",
          releaseDecision: "manifest-requested",
          source: "handler/executive-approved",
        },
        event.id,
      );
      if (!ctx.flags.releaseBlocked) {
        ctx.flags.releaseEnabled = true;
        await emitRuntimeEvent(
          bus,
          ctx,
          "RELEASE_ENABLED",
          {
            reason: "executive-approved-release",
            releaseDecision: "enabled",
            source: "handler/executive-approved",
          },
          event.id,
        );
      }
    },
    "handler-executive-approved",
  );

  // STATE_TRANSITIONED — 审计轨迹（全局）
  bus.onAny(async (event, ctx) => {
    if (event.type === "STATE_TRANSITIONED") {
      bus.traceStore.appendLog(
        `[state] ${event.payload.previousState} → ${event.payload.currentState} (${event.payload.reason ?? ""})`,
      );
    }
    // 同步 flags 与 policy / state machine
    const policy = ctx.snapshot.runtimePolicy;
    if (policy?.blocked) ctx.flags.releaseBlocked = true;
    if (policy?.conditionalRelease && !ctx.flags.releaseBlocked) {
      ctx.flags.releaseEnabled = true;
    }
    const sm = ctx.snapshot.runtimeStateMachine;
    if (sm?.releasable && !ctx.flags.releaseBlocked) {
      ctx.flags.releaseEnabled = true;
    }
    if (sm?.currentState === "release-blocked") {
      ctx.flags.releaseBlocked = true;
    }
  }, "handler-global-sync");

  // 导出判定供 orchestration 使用
  return {
    validationFailed,
    validationPassed,
    auditApproved,
    auditRejected,
    governanceApproved,
    governanceEscalated,
    executiveApproved,
  };
}
