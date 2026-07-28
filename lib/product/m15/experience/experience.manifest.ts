/**
 * Product M15 — Evolution Experience Platform manifest builder
 */

import { createHash } from "node:crypto";

import { PRODUCT_EVOLUTION_FEEDBACK_ID } from "../feedback/feedback.constants";
import {
  PRODUCT_EVOLUTION_EXPERIENCE_BASE,
  PRODUCT_EVOLUTION_EXPERIENCE_FREEZE_VERSION,
  PRODUCT_EVOLUTION_EXPERIENCE_ID,
  PRODUCT_EVOLUTION_EXPERIENCE_VERSION,
} from "./experience.constants";
import {
  getEvolutionExperienceMetadata,
  validateEvolutionExperience,
} from "./experience.metadata";
import {
  clearEvolutionExperiences,
  listEvolutionExperiences,
} from "./experience.registry";
import type {
  EvolutionExperienceManifest,
  EvolutionExperienceReadinessCheck,
  EvolutionExperienceReadinessResult,
} from "./experience.types";
import {
  clearEvolutionExperienceCapabilities,
  listEvolutionExperienceCapabilities,
} from "./capability.registry";
import {
  clearEvolutionExperienceGovernancePolicies,
  listEvolutionExperienceGovernancePolicies,
} from "./governance.policy";
import {
  clearEvolutionExperienceExposureContracts,
  listEvolutionExperienceExposureContracts,
} from "./exposure.contract";

function nowIso(): string {
  return new Date().toISOString();
}

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): EvolutionExperienceReadinessCheck {
  return { id, component, label, ok, detail };
}

export function clearEvolutionExperienceLayer(): void {
  clearEvolutionExperienceExposureContracts();
  clearEvolutionExperienceGovernancePolicies();
  clearEvolutionExperienceCapabilities();
  clearEvolutionExperiences();
}

export function buildEvolutionExperienceManifest(): EvolutionExperienceManifest {
  const experiences = listEvolutionExperiences();
  const capabilities = listEvolutionExperienceCapabilities();
  const policies = listEvolutionExperienceGovernancePolicies();
  const contracts = listEvolutionExperienceExposureContracts();
  const metadata = getEvolutionExperienceMetadata();
  const active = experiences.filter((e) => e.status === "ACTIVE");

  const payload = {
    experienceId: PRODUCT_EVOLUTION_EXPERIENCE_ID,
    version: PRODUCT_EVOLUTION_EXPERIENCE_VERSION,
    freezeVersion: PRODUCT_EVOLUTION_EXPERIENCE_FREEZE_VERSION,
    base: PRODUCT_EVOLUTION_EXPERIENCE_BASE,
    module: metadata.module,
    declarationOnly: metadata.declarationOnly,
    experiences: experiences.map((e) => ({
      experienceKey: e.experienceKey,
      kind: e.kind,
      status: e.status,
      scope: e.scope,
      feedbackRef: e.feedbackRef,
    })),
    capabilities: capabilities.map((c) => ({
      capabilityKey: c.capabilityKey,
      kind: c.kind,
      status: c.status,
      experienceId: c.experienceId,
    })),
    policies: policies.map((p) => ({
      policyKey: p.policyKey,
      kind: p.kind,
      status: p.status,
      experienceKeyRef: p.experienceKeyRef,
    })),
    contracts: contracts.map((c) => ({
      contractKey: c.contractKey,
      mode: c.query.mode,
      hitCount: c.hitCount,
    })),
  };

  return {
    experienceId: PRODUCT_EVOLUTION_EXPERIENCE_ID,
    version: PRODUCT_EVOLUTION_EXPERIENCE_VERSION,
    freezeVersion: PRODUCT_EVOLUTION_EXPERIENCE_FREEZE_VERSION,
    base: PRODUCT_EVOLUTION_EXPERIENCE_BASE,
    experienceCount: experiences.length,
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

export function evaluateEvolutionExperienceReadiness(): EvolutionExperienceReadinessResult {
  const checks: EvolutionExperienceReadinessCheck[] = [];
  const metadata = getEvolutionExperienceMetadata();
  const experiences = listEvolutionExperiences();
  const capabilities = listEvolutionExperienceCapabilities();
  const policies = listEvolutionExperienceGovernancePolicies();
  const contracts = listEvolutionExperienceExposureContracts();
  const manifest = buildEvolutionExperienceManifest();
  const experiencesValid = experiences.every(
    (e) => validateEvolutionExperience(e).ok,
  );

  checks.push(
    check(
      "EVOEX-BASE",
      "experience",
      "evolution feedback base aligned",
      PRODUCT_EVOLUTION_EXPERIENCE_BASE === PRODUCT_EVOLUTION_FEEDBACK_ID &&
        PRODUCT_EVOLUTION_FEEDBACK_ID ===
          "enterprise-product-evolution-feedback-v1",
      `base=${PRODUCT_EVOLUTION_EXPERIENCE_BASE}`,
    ),
  );

  checks.push(
    check(
      "EVOEX-META",
      "metadata",
      "Evolution experience metadata declaration-only",
      metadata.declarationOnly === true && metadata.excludes.length === 8,
      `module=${metadata.module}`,
    ),
  );

  checks.push(
    check(
      "EVOEX-EX",
      "experience",
      "Active experience surfaces present and valid",
      experiences.some((e) => e.status === "ACTIVE") && experiencesValid,
      `experiences=${experiences.length}`,
    ),
  );

  checks.push(
    check(
      "EVOEX-CAP",
      "capability",
      "Declared capabilities present",
      capabilities.some((c) => c.status === "DECLARED"),
      `capabilities=${capabilities.length}`,
    ),
  );

  checks.push(
    check(
      "EVOEX-GOV",
      "governance",
      "Active governance policies present",
      policies.some((p) => p.status === "ACTIVE"),
      `policies=${policies.length}`,
    ),
  );

  checks.push(
    check(
      "EVOEX-XP",
      "exposure",
      "Exposure contracts with hits present",
      contracts.some((c) => c.hitCount >= 1),
      `contracts=${contracts.length}`,
    ),
  );

  checks.push(
    check(
      "EVOEX-MAN",
      "manifest",
      "Evolution experience manifest checksum intact",
      manifest.checksum.length === 64 &&
        manifest.experienceId === PRODUCT_EVOLUTION_EXPERIENCE_ID &&
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
    summary: `product-evolution-experience readiness ${verdict.toLowerCase()}: pass=${passCount} fail=${failCount}`,
    evaluatedAt: nowIso(),
  };
}

export function assertEvolutionExperienceReadinessReady(
  result: EvolutionExperienceReadinessResult,
): asserts result is EvolutionExperienceReadinessResult & {
  verdict: "READY";
} {
  if (result.verdict !== "READY") {
    throw new Error(
      `product evolution experience not ready: ${result.summary}`,
    );
  }
}
