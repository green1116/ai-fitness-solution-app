/**
 * Product M15 — Evolution Feedback Platform Release Gate
 * MODULE: Enterprise Evolution Feedback (M15-P2)
 * BASE: enterprise-product-evolution-foundation-v1
 */

import { buildPlatformV1Manifest } from "../../../platform/v1/platform.manifest";
import { PRODUCT_EVOLUTION_FOUNDATION_ID } from "../foundation/evolution.constants";
import {
  EVOLUTION_FEEDBACK_CAPABILITY_KINDS,
  EVOLUTION_FEEDBACK_CAPABILITY_STATUSES,
  EVOLUTION_FEEDBACK_DOMAIN_SCOPES,
  EVOLUTION_FEEDBACK_GOVERNANCE_POLICY_KINDS,
  EVOLUTION_FEEDBACK_GOVERNANCE_POLICY_STATUSES,
  EVOLUTION_FEEDBACK_INTAKE_MODES,
  EVOLUTION_FEEDBACK_KINDS,
  EVOLUTION_FEEDBACK_READINESS_VERDICTS,
  EVOLUTION_FEEDBACK_STATUSES,
  PRODUCT_EVOLUTION_FEEDBACK_BASE,
  PRODUCT_EVOLUTION_FEEDBACK_FREEZE_TAG,
  PRODUCT_EVOLUTION_FEEDBACK_FREEZE_VERSION,
  PRODUCT_EVOLUTION_FEEDBACK_ID,
  PRODUCT_EVOLUTION_FEEDBACK_VERSION,
} from "../feedback/feedback.constants";
import {
  assertEvolutionFeedbackReadinessReady,
  buildEvolutionFeedbackManifest,
  clearEvolutionFeedbackLayer,
  evaluateEvolutionFeedbackReadiness,
} from "../feedback/feedback.manifest";
import {
  getEvolutionFeedbackMetadata,
  isEvolutionFeedbackMetadataIntact,
  validateEvolutionFeedback,
} from "../feedback/feedback.metadata";
import {
  registerEvolutionFeedback,
  updateEvolutionFeedbackStatus,
} from "../feedback/feedback.registry";
import {
  registerEvolutionFeedbackCapability,
  updateEvolutionFeedbackCapabilityStatus,
} from "../feedback/capability.registry";
import { registerEvolutionFeedbackGovernancePolicy } from "../feedback/governance.policy";
import { evaluateEvolutionFeedbackIntakeContract } from "../feedback/intake.contract";

export type GateVerdict = "PASS" | "FAIL";

export type GateCheckItem = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type ReleaseGateResult = {
  result: GateVerdict;
  passCount: number;
  failCount: number;
  checks: GateCheckItem[];
  summary: string;
};

export const PRODUCT_EVOLUTION_FEEDBACK_SIGNOFF_VERSION =
  "product-evolution-feedback-signoff-1" as const;

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): GateCheckItem {
  return { id, component, label, ok, detail };
}

function cleanup(): void {
  clearEvolutionFeedbackLayer();
}

export function checkProductEvolutionFeedbackReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];
  const metadata = getEvolutionFeedbackMetadata();

  checks.push(
    check(
      "EVOFB-CONSTANTS",
      "feedback",
      "Product evolution feedback version constants",
      PRODUCT_EVOLUTION_FEEDBACK_ID ===
        "enterprise-product-evolution-feedback-v1" &&
        PRODUCT_EVOLUTION_FEEDBACK_VERSION ===
          "product-evolution-feedback-1" &&
        PRODUCT_EVOLUTION_FEEDBACK_BASE === PRODUCT_EVOLUTION_FOUNDATION_ID &&
        PRODUCT_EVOLUTION_FEEDBACK_FREEZE_VERSION ===
          "product-evolution-feedback-freeze-1" &&
        PRODUCT_EVOLUTION_FEEDBACK_FREEZE_TAG ===
          "product-evolution-feedback-freeze-1" &&
        EVOLUTION_FEEDBACK_KINDS.length === 6 &&
        EVOLUTION_FEEDBACK_STATUSES.length === 4 &&
        EVOLUTION_FEEDBACK_CAPABILITY_KINDS.length === 6 &&
        EVOLUTION_FEEDBACK_CAPABILITY_STATUSES.length === 4 &&
        EVOLUTION_FEEDBACK_DOMAIN_SCOPES.length === 4 &&
        EVOLUTION_FEEDBACK_INTAKE_MODES.length === 3 &&
        EVOLUTION_FEEDBACK_GOVERNANCE_POLICY_KINDS.length === 4 &&
        EVOLUTION_FEEDBACK_GOVERNANCE_POLICY_STATUSES.length === 3 &&
        EVOLUTION_FEEDBACK_READINESS_VERDICTS.length === 3 &&
        isEvolutionFeedbackMetadataIntact(metadata),
      `id=${PRODUCT_EVOLUTION_FEEDBACK_ID} base=${PRODUCT_EVOLUTION_FEEDBACK_BASE}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "EVOFB-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "EVOFB-UPSTREAM",
      "compatibility",
      "Depends on Evolution foundation chain",
      PRODUCT_EVOLUTION_FEEDBACK_BASE ===
        "enterprise-product-evolution-foundation-v1" &&
        PRODUCT_EVOLUTION_FOUNDATION_ID ===
          "enterprise-product-evolution-foundation-v1",
      `foundation=${PRODUCT_EVOLUTION_FOUNDATION_ID}`,
    ),
  );

  try {
    cleanup();

    const feedback = registerEvolutionFeedback({
      id: "evofb.gate.fb",
      feedbackKey: "DOMAIN_SIGNAL_CHANNEL",
      kind: "SIGNAL",
      scope: "DOMAIN",
      title: "Domain signal feedback channel",
      summary: "Declared signal feedback channel for domain intake",
      foundationRef: PRODUCT_EVOLUTION_FOUNDATION_ID,
    });
    const active = updateEvolutionFeedbackStatus({
      feedbackId: feedback.id,
      status: "ACTIVE",
    });
    const validation = validateEvolutionFeedback(active);
    const capability = registerEvolutionFeedbackCapability({
      id: "evofb.gate.cap",
      feedbackId: feedback.id,
      capabilityKey: "CAPTURE_DOMAIN_SIGNAL",
      kind: "CAPTURE",
      summary: "Declared capture capability for domain signals",
    });
    const declared = updateEvolutionFeedbackCapabilityStatus({
      capabilityId: capability.id,
      status: "DECLARED",
    });
    const policy = registerEvolutionFeedbackGovernancePolicy({
      id: "evofb.gate.gov",
      policyKey: "SIGNAL_ACCESS_CONTROL",
      kind: "ACCESS_CONTROL",
      title: "Signal feedback access control",
      feedbackKeyRef: feedback.feedbackKey,
      ruleRef: "EVOFB_RULE_INTERNAL_ONLY",
    });
    const contract = evaluateEvolutionFeedbackIntakeContract({
      id: "evofb.gate.in",
      contractKey: "SIGNAL_DOMAIN_LOOKUP",
      query: {
        queryKey: "DOMAIN_SIGNAL_Q",
        mode: "DECLARED",
        kind: "SIGNAL",
        capabilityKind: "CAPTURE",
        scope: "DOMAIN",
        feedbackKeys: [feedback.feedbackKey],
      },
    });
    const manifest = buildEvolutionFeedbackManifest();
    const readiness = evaluateEvolutionFeedbackReadiness();

    const ok =
      feedback.feedbackKey === "DOMAIN_SIGNAL_CHANNEL" &&
      active.status === "ACTIVE" &&
      validation.ok === true &&
      declared.status === "DECLARED" &&
      policy.status === "ACTIVE" &&
      policy.feedbackKeyRef === "DOMAIN_SIGNAL_CHANNEL" &&
      contract.hitCount >= 1 &&
      manifest.checksum.length === 64 &&
      readiness.verdict === "READY";

    try {
      assertEvolutionFeedbackReadinessReady(readiness);
      checks.push(
        check(
          "EVOFB-STACK",
          "evolution-feedback",
          "Feedback / capability / governance / intake / manifest",
          ok,
          `readiness=${readiness.verdict} checksum=${manifest.checksum.slice(0, 12)}…`,
        ),
      );
    } catch (error) {
      checks.push(
        check(
          "EVOFB-STACK",
          "evolution-feedback",
          "Feedback / capability / governance / intake / manifest",
          false,
          error instanceof Error
            ? error.message
            : "product evolution feedback not ready",
        ),
      );
    }

    checks.push(
      check(
        "EVOFB-SCOPE",
        "scope",
        "No DB / learning / optimization / AI analysis / tool runtime",
        ok &&
          metadata.declarationOnly === true &&
          metadata.excludes.includes("learning-runtime") &&
          metadata.excludes.includes("optimization-runtime") &&
          metadata.excludes.includes("ai-analysis"),
        "evolution-feedback-declaration-only domain",
      ),
    );

    cleanup();
  } catch (error) {
    const detail =
      error instanceof Error
        ? error.message
        : "product evolution feedback probe failed";
    checks.push(
      check(
        "EVOFB-STACK",
        "evolution-feedback",
        "Feedback / capability / governance / intake / manifest",
        false,
        detail,
      ),
    );
    checks.push(
      check(
        "EVOFB-SCOPE",
        "scope",
        "No DB / learning / optimization / AI analysis / tool runtime",
        false,
        detail,
      ),
    );
    cleanup();
  }

  const passCount = checks.filter((c) => c.ok).length;
  const failCount = checks.filter((c) => !c.ok).length;
  const result: GateVerdict = failCount === 0 ? "PASS" : "FAIL";

  return {
    result,
    passCount,
    failCount,
    checks,
    summary: [
      `product-evolution-feedback-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertProductEvolutionFeedbackReleaseGatePass(
  gate: ReleaseGateResult = checkProductEvolutionFeedbackReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(
      `Product evolution feedback release gate failed: ${gate.summary}`,
    );
  }
}
