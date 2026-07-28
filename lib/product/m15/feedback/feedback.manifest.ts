/**
 * Product M15 — Evolution Feedback Platform manifest builder
 */

import { createHash } from "node:crypto";

import { PRODUCT_EVOLUTION_FOUNDATION_ID } from "../foundation/evolution.constants";
import {
  PRODUCT_EVOLUTION_FEEDBACK_BASE,
  PRODUCT_EVOLUTION_FEEDBACK_FREEZE_VERSION,
  PRODUCT_EVOLUTION_FEEDBACK_ID,
  PRODUCT_EVOLUTION_FEEDBACK_VERSION,
} from "./feedback.constants";
import {
  getEvolutionFeedbackMetadata,
  validateEvolutionFeedback,
} from "./feedback.metadata";
import {
  clearEvolutionFeedbacks,
  listEvolutionFeedbacks,
} from "./feedback.registry";
import type {
  EvolutionFeedbackManifest,
  EvolutionFeedbackReadinessCheck,
  EvolutionFeedbackReadinessResult,
} from "./feedback.types";
import {
  clearEvolutionFeedbackCapabilities,
  listEvolutionFeedbackCapabilities,
} from "./capability.registry";
import {
  clearEvolutionFeedbackGovernancePolicies,
  listEvolutionFeedbackGovernancePolicies,
} from "./governance.policy";
import {
  clearEvolutionFeedbackIntakeContracts,
  listEvolutionFeedbackIntakeContracts,
} from "./intake.contract";

function nowIso(): string {
  return new Date().toISOString();
}

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): EvolutionFeedbackReadinessCheck {
  return { id, component, label, ok, detail };
}

export function clearEvolutionFeedbackLayer(): void {
  clearEvolutionFeedbackIntakeContracts();
  clearEvolutionFeedbackGovernancePolicies();
  clearEvolutionFeedbackCapabilities();
  clearEvolutionFeedbacks();
}

export function buildEvolutionFeedbackManifest(): EvolutionFeedbackManifest {
  const feedbacks = listEvolutionFeedbacks();
  const capabilities = listEvolutionFeedbackCapabilities();
  const policies = listEvolutionFeedbackGovernancePolicies();
  const contracts = listEvolutionFeedbackIntakeContracts();
  const metadata = getEvolutionFeedbackMetadata();
  const active = feedbacks.filter((f) => f.status === "ACTIVE");

  const payload = {
    feedbackId: PRODUCT_EVOLUTION_FEEDBACK_ID,
    version: PRODUCT_EVOLUTION_FEEDBACK_VERSION,
    freezeVersion: PRODUCT_EVOLUTION_FEEDBACK_FREEZE_VERSION,
    base: PRODUCT_EVOLUTION_FEEDBACK_BASE,
    module: metadata.module,
    declarationOnly: metadata.declarationOnly,
    feedbacks: feedbacks.map((f) => ({
      feedbackKey: f.feedbackKey,
      kind: f.kind,
      status: f.status,
      scope: f.scope,
      foundationRef: f.foundationRef,
    })),
    capabilities: capabilities.map((c) => ({
      capabilityKey: c.capabilityKey,
      kind: c.kind,
      status: c.status,
      feedbackId: c.feedbackId,
    })),
    policies: policies.map((p) => ({
      policyKey: p.policyKey,
      kind: p.kind,
      status: p.status,
      feedbackKeyRef: p.feedbackKeyRef,
    })),
    contracts: contracts.map((c) => ({
      contractKey: c.contractKey,
      mode: c.query.mode,
      hitCount: c.hitCount,
    })),
  };

  return {
    feedbackId: PRODUCT_EVOLUTION_FEEDBACK_ID,
    version: PRODUCT_EVOLUTION_FEEDBACK_VERSION,
    freezeVersion: PRODUCT_EVOLUTION_FEEDBACK_FREEZE_VERSION,
    base: PRODUCT_EVOLUTION_FEEDBACK_BASE,
    feedbackCount: feedbacks.length,
    activeCount: active.length,
    capabilityCount: capabilities.length,
    policyCount: policies.length,
    contractCount: contracts.length,
    checksum: createHash("sha256")
      .update(JSON.stringify(payload))
      .digest("hex"),
    createdAt: nowIso(),
  };
}

export function evaluateEvolutionFeedbackReadiness(): EvolutionFeedbackReadinessResult {
  const checks: EvolutionFeedbackReadinessCheck[] = [];
  const metadata = getEvolutionFeedbackMetadata();
  const feedbacks = listEvolutionFeedbacks();
  const capabilities = listEvolutionFeedbackCapabilities();
  const policies = listEvolutionFeedbackGovernancePolicies();
  const contracts = listEvolutionFeedbackIntakeContracts();
  const manifest = buildEvolutionFeedbackManifest();
  const feedbacksValid = feedbacks.every(
    (f) => validateEvolutionFeedback(f).ok,
  );

  checks.push(
    check(
      "EVOFB-BASE",
      "feedback",
      "evolution foundation base aligned",
      PRODUCT_EVOLUTION_FEEDBACK_BASE === PRODUCT_EVOLUTION_FOUNDATION_ID &&
        PRODUCT_EVOLUTION_FOUNDATION_ID ===
          "enterprise-product-evolution-foundation-v1",
      `base=${PRODUCT_EVOLUTION_FEEDBACK_BASE}`,
    ),
  );

  checks.push(
    check(
      "EVOFB-META",
      "metadata",
      "Evolution feedback metadata declaration-only",
      metadata.declarationOnly === true && metadata.excludes.length === 8,
      `module=${metadata.module}`,
    ),
  );

  checks.push(
    check(
      "EVOFB-FB",
      "feedback",
      "Active feedback channels present and valid",
      feedbacks.some((f) => f.status === "ACTIVE") && feedbacksValid,
      `feedbacks=${feedbacks.length}`,
    ),
  );

  checks.push(
    check(
      "EVOFB-CAP",
      "capability",
      "Declared capabilities present",
      capabilities.some((c) => c.status === "DECLARED"),
      `capabilities=${capabilities.length}`,
    ),
  );

  checks.push(
    check(
      "EVOFB-GOV",
      "governance",
      "Active governance policies present",
      policies.some((p) => p.status === "ACTIVE"),
      `policies=${policies.length}`,
    ),
  );

  checks.push(
    check(
      "EVOFB-IN",
      "intake",
      "Intake contracts with hits present",
      contracts.some((c) => c.hitCount >= 1),
      `contracts=${contracts.length}`,
    ),
  );

  checks.push(
    check(
      "EVOFB-MAN",
      "manifest",
      "Evolution feedback manifest checksum intact",
      manifest.checksum.length === 64 &&
        manifest.feedbackId === PRODUCT_EVOLUTION_FEEDBACK_ID &&
        manifest.activeCount >= 1 &&
        manifest.capabilityCount >= 1 &&
        manifest.policyCount >= 1 &&
        manifest.contractCount >= 1,
      `checksum=${manifest.checksum.slice(0, 12)}…`,
    ),
  );

  const passCount = checks.filter((c) => c.ok).length;
  const failCount = checks.filter((c) => !c.ok).length;
  const verdict =
    failCount === 0 ? "READY" : passCount === 0 ? "NOT_READY" : "BLOCKED";

  return {
    verdict,
    passCount,
    failCount,
    checks,
    summary: `product-evolution-feedback readiness ${verdict.toLowerCase()}: pass=${passCount} fail=${failCount}`,
    evaluatedAt: nowIso(),
  };
}

export function assertEvolutionFeedbackReadinessReady(
  result: EvolutionFeedbackReadinessResult,
): asserts result is EvolutionFeedbackReadinessResult & { verdict: "READY" } {
  if (result.verdict !== "READY") {
    throw new Error(
      `product evolution feedback not ready: ${result.summary}`,
    );
  }
}
