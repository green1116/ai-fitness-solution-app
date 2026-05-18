import type {
  BuildRuntimeStateMachineInput,
  RuntimeLifecycleState,
  RuntimeStateMachinePackage,
  RuntimeStateTransition,
  RuntimeStateTransitionReason,
} from "../types";
import { RUNTIME_STATE_MACHINE_VERSION } from "../types";
import { formatRuntimeStateMachineDebug } from "../debug/runtimeStateMachineDebug";
import {
  auditPassed,
  governancePassed,
  ocrTraceabilityComplete,
} from "../runtime/buildExecutiveFindings";

function timestamp(input: BuildRuntimeStateMachineInput, offsetMs = 0): string {
  const base = input.ranAt ? new Date(input.ranAt).getTime() : Date.now();
  return new Date(base + offsetMs).toISOString();
}

function addTransition(
  transitions: RuntimeStateTransition[],
  from: RuntimeLifecycleState,
  to: RuntimeLifecycleState,
  reason: RuntimeStateTransitionReason,
  at: string,
): void {
  if (from === to) return;
  transitions.push({
    from,
    to,
    reason,
    deterministic: true,
    timestamp: at,
  });
}

/**
 * V3.4-E15 — 确定性 Tender Governance 生命周期状态机
 */
export function buildRuntimeStateMachine(
  input: BuildRuntimeStateMachineInput,
): RuntimeStateMachinePackage {
  const transitions: RuntimeStateTransition[] = [];
  let state: RuntimeLifecycleState = "draft";
  let tick = 0;
  const ts = () => timestamp(input, tick++);

  const gate = input.executiveApprovalGate;
  const surface = input.executiveReleaseSurface;
  const policy = input.runtimePolicy;
  const oversight = input.executiveOversight;
  const gov = input.tenderGovernance;
  const audit = input.tenderAudit;
  const val = input.tenderValidation;
  const cov = input.coverageRuntime;

  const hasAttachments =
    (input.attachmentCount ?? 0) > 0 || (input.ocrDocuments?.length ?? 0) > 0;
  const hasEvidence =
    hasAttachments || (input.linking?.matches.length ?? 0) > 0 || !!cov;

  // —— Evidence & OCR progression ——
  if (!hasEvidence) {
    addTransition(transitions, state, "evidence-pending", "evidence-complete", ts());
    state = "evidence-pending";
  } else {
    addTransition(transitions, state, "evidence-pending", "evidence-complete", ts());
    state = "evidence-pending";

    const ocrOk =
      ocrTraceabilityComplete(input) || (input.ocrDocuments?.length ?? 0) > 0;
    if (ocrOk) {
      addTransition(transitions, state, "ocr-verified", "ocr-verified", ts());
      state = "ocr-verified";
    }

    const coverageOk =
      !!cov &&
      ((cov.summary.mandatoryMissing ?? 0) === 0 &&
        (cov.validation.verdict === "pass" ||
          cov.validation.verdict === "conditional" ||
          cov.summary.coverageRatio >= 0.5));

    if (coverageOk) {
      addTransition(transitions, state, "coverage-passed", "coverage-passed", ts());
      state = "coverage-passed";
    }

    // —— Validation ——
    if (val?.outcome === "rejected" || (val?.summary.criticalCount ?? 0) > 0) {
      addTransition(transitions, state, "release-blocked", "validation-failed", ts());
      state = "release-blocked";
    } else if (val && val.outcome !== "rejected") {
      addTransition(transitions, state, "validation-passed", "coverage-passed", ts());
      state = "validation-passed";
    }

    // —— Audit ——
    if (state !== "release-blocked") {
      if (!auditPassed(input)) {
        addTransition(transitions, state, "release-blocked", "audit-failed", ts());
        state = "release-blocked";
      } else if (audit) {
        addTransition(transitions, state, "audit-reviewed", "coverage-passed", ts());
        state = "audit-reviewed";
      }
    }

    // —— Governance ——
    if (state !== "release-blocked") {
      if (!governancePassed(input) || gov?.posture === "halt" || gov?.posture === "hold") {
        addTransition(transitions, state, "release-blocked", "governance-failed", ts());
        state = "release-blocked";
      } else if (gov?.posture === "escalate" || gov?.escalation.required) {
        addTransition(
          transitions,
          state,
          "executive-escalation",
          "governance-failed",
          ts(),
        );
        state = "executive-escalation";
      } else if (gov?.posture === "proceed") {
        addTransition(
          transitions,
          state,
          "governance-approved",
          "audit-reviewed",
          ts(),
        );
        state = "governance-approved";
      }
    }

    // —— Executive ——
    if (state !== "release-blocked" && state !== "executive-escalation") {
      if (oversight?.recommendation === "reject") {
        addTransition(transitions, state, "release-blocked", "policy-blocked", ts());
        state = "release-blocked";
      } else if (oversight?.recommendation === "approve") {
        addTransition(transitions, state, "executive-approved", "executive-approved", ts());
        state = "executive-approved";
      } else if (
        oversight?.recommendation === "conditional-approve" ||
        oversight?.recommendation === "review-required"
      ) {
        addTransition(
          transitions,
          state,
          "executive-escalation",
          "executive-approved",
          ts(),
        );
        state = "executive-escalation";
      }
    }

    // —— Policy & Release terminal（release 优先于 conditional）——
    const gateReleasable = surface?.releasable ?? gate?.releasable ?? false;

    if (policy?.blocked || gate?.recommendation === "block-release") {
      addTransition(transitions, state, "release-blocked", "policy-blocked", ts());
      state = "release-blocked";
    } else if (
      gate?.recommendation === "release" ||
      surface?.decision === "release"
    ) {
      if (state !== "executive-approved" && state !== "release-approved") {
        addTransition(transitions, state, "executive-approved", "executive-approved", ts());
        state = "executive-approved";
      }
      addTransition(transitions, state, "release-approved", "executive-approved", ts());
      state = "release-approved";
      if (gateReleasable) {
        addTransition(transitions, state, "released", "executive-approved", ts());
        state = "released";
      }
    } else if (policy?.conditionalRelease || gate?.recommendation === "conditional-release") {
      addTransition(
        transitions,
        state,
        "conditional-release",
        "conditional-release-triggered",
        ts(),
      );
      state = "conditional-release";
    }
  }

  const previousState =
    transitions.length > 0 ? transitions[transitions.length - 1].from : undefined;

  const releasable =
    state === "released" ||
    (state === "release-approved" && (surface?.releasable ?? gate?.releasable ?? false));

  const escalationRequired =
    state === "executive-escalation" ||
    gov?.escalation.required === true ||
    policy?.executiveReviewRequired === true ||
    oversight?.recommendation === "review-required";

  const result = {
    currentState: state,
    previousState,
    transitions,
    releasable,
    escalationRequired,
  };

  const debug = formatRuntimeStateMachineDebug(result);

  return {
    version: RUNTIME_STATE_MACHINE_VERSION,
    ...result,
    debug,
  };
}
