/**
 * Product M15 — Evolution Experience Platform Release Gate
 * MODULE: Enterprise Evolution Experience (M15-P3)
 * BASE: enterprise-product-evolution-feedback-v1
 */

import { buildPlatformV1Manifest } from "../../../platform/v1/platform.manifest";
import { PRODUCT_EVOLUTION_FEEDBACK_ID } from "../feedback/feedback.constants";
import {
  EVOLUTION_EXPERIENCE_CAPABILITY_KINDS,
  EVOLUTION_EXPERIENCE_CAPABILITY_STATUSES,
  EVOLUTION_EXPERIENCE_DOMAIN_SCOPES,
  EVOLUTION_EXPERIENCE_EXPOSURE_MODES,
  EVOLUTION_EXPERIENCE_GOVERNANCE_POLICY_KINDS,
  EVOLUTION_EXPERIENCE_GOVERNANCE_POLICY_STATUSES,
  EVOLUTION_EXPERIENCE_KINDS,
  EVOLUTION_EXPERIENCE_READINESS_VERDICTS,
  EVOLUTION_EXPERIENCE_STATUSES,
  PRODUCT_EVOLUTION_EXPERIENCE_BASE,
  PRODUCT_EVOLUTION_EXPERIENCE_FREEZE_TAG,
  PRODUCT_EVOLUTION_EXPERIENCE_FREEZE_VERSION,
  PRODUCT_EVOLUTION_EXPERIENCE_ID,
  PRODUCT_EVOLUTION_EXPERIENCE_VERSION,
} from "../experience/experience.constants";
import {
  assertEvolutionExperienceReadinessReady,
  buildEvolutionExperienceManifest,
  clearEvolutionExperienceLayer,
  evaluateEvolutionExperienceReadiness,
} from "../experience/experience.manifest";
import {
  getEvolutionExperienceMetadata,
  isEvolutionExperienceMetadataIntact,
  validateEvolutionExperience,
} from "../experience/experience.metadata";
import {
  registerEvolutionExperience,
  updateEvolutionExperienceStatus,
} from "../experience/experience.registry";
import {
  registerEvolutionExperienceCapability,
  updateEvolutionExperienceCapabilityStatus,
} from "../experience/capability.registry";
import { registerEvolutionExperienceGovernancePolicy } from "../experience/governance.policy";
import { evaluateEvolutionExperienceExposureContract } from "../experience/exposure.contract";

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

export const PRODUCT_EVOLUTION_EXPERIENCE_SIGNOFF_VERSION =
  "product-evolution-experience-signoff-1" as const;

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
  clearEvolutionExperienceLayer();
}

export function checkProductEvolutionExperienceReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];
  const metadata = getEvolutionExperienceMetadata();

  checks.push(
    check(
      "EVOEX-CONSTANTS",
      "experience",
      "Product evolution experience version constants",
      PRODUCT_EVOLUTION_EXPERIENCE_ID ===
        "enterprise-product-evolution-experience-v1" &&
        PRODUCT_EVOLUTION_EXPERIENCE_VERSION ===
          "product-evolution-experience-1" &&
        PRODUCT_EVOLUTION_EXPERIENCE_BASE === PRODUCT_EVOLUTION_FEEDBACK_ID &&
        PRODUCT_EVOLUTION_EXPERIENCE_FREEZE_VERSION ===
          "product-evolution-experience-freeze-1" &&
        PRODUCT_EVOLUTION_EXPERIENCE_FREEZE_TAG ===
          "product-evolution-experience-freeze-1" &&
        EVOLUTION_EXPERIENCE_KINDS.length === 6 &&
        EVOLUTION_EXPERIENCE_STATUSES.length === 4 &&
        EVOLUTION_EXPERIENCE_CAPABILITY_KINDS.length === 6 &&
        EVOLUTION_EXPERIENCE_CAPABILITY_STATUSES.length === 4 &&
        EVOLUTION_EXPERIENCE_DOMAIN_SCOPES.length === 4 &&
        EVOLUTION_EXPERIENCE_EXPOSURE_MODES.length === 3 &&
        EVOLUTION_EXPERIENCE_GOVERNANCE_POLICY_KINDS.length === 4 &&
        EVOLUTION_EXPERIENCE_GOVERNANCE_POLICY_STATUSES.length === 3 &&
        EVOLUTION_EXPERIENCE_READINESS_VERDICTS.length === 3 &&
        isEvolutionExperienceMetadataIntact(metadata),
      `id=${PRODUCT_EVOLUTION_EXPERIENCE_ID} base=${PRODUCT_EVOLUTION_EXPERIENCE_BASE}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "EVOEX-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "EVOEX-UPSTREAM",
      "compatibility",
      "Depends on Evolution feedback chain",
      PRODUCT_EVOLUTION_EXPERIENCE_BASE ===
        "enterprise-product-evolution-feedback-v1" &&
        PRODUCT_EVOLUTION_FEEDBACK_ID ===
          "enterprise-product-evolution-feedback-v1",
      `feedback=${PRODUCT_EVOLUTION_FEEDBACK_ID}`,
    ),
  );

  try {
    cleanup();

    const experience = registerEvolutionExperience({
      id: "evoex.gate.ex",
      experienceKey: "DOMAIN_JOURNEY_SURFACE",
      kind: "JOURNEY",
      scope: "DOMAIN",
      title: "Domain journey experience surface",
      summary: "Declared journey experience surface for domain exposure",
      feedbackRef: PRODUCT_EVOLUTION_FEEDBACK_ID,
    });
    const active = updateEvolutionExperienceStatus({
      experienceId: experience.id,
      status: "ACTIVE",
    });
    const validation = validateEvolutionExperience(active);
    const capability = registerEvolutionExperienceCapability({
      id: "evoex.gate.cap",
      experienceId: experience.id,
      capabilityKey: "RECORD_DOMAIN_JOURNEY",
      kind: "RECORD",
      summary: "Declared record capability for domain journeys",
    });
    const declared = updateEvolutionExperienceCapabilityStatus({
      capabilityId: capability.id,
      status: "DECLARED",
    });
    const policy = registerEvolutionExperienceGovernancePolicy({
      id: "evoex.gate.gov",
      policyKey: "JOURNEY_ACCESS_CONTROL",
      kind: "ACCESS_CONTROL",
      title: "Journey experience access control",
      experienceKeyRef: experience.experienceKey,
      ruleRef: "EVOEX_RULE_INTERNAL_ONLY",
    });
    const contract = evaluateEvolutionExperienceExposureContract({
      id: "evoex.gate.xp",
      contractKey: "JOURNEY_DOMAIN_LOOKUP",
      query: {
        queryKey: "DOMAIN_JOURNEY_Q",
        mode: "DECLARED",
        kind: "JOURNEY",
        capabilityKind: "RECORD",
        scope: "DOMAIN",
        experienceKeys: [experience.experienceKey],
      },
    });
    const manifest = buildEvolutionExperienceManifest();
    const readiness = evaluateEvolutionExperienceReadiness();

    const ok =
      experience.experienceKey === "DOMAIN_JOURNEY_SURFACE" &&
      active.status === "ACTIVE" &&
      validation.ok === true &&
      declared.status === "DECLARED" &&
      policy.status === "ACTIVE" &&
      policy.experienceKeyRef === "DOMAIN_JOURNEY_SURFACE" &&
      contract.hitCount >= 1 &&
      manifest.checksum.length === 64 &&
      readiness.verdict === "READY";

    try {
      assertEvolutionExperienceReadinessReady(readiness);
      checks.push(
        check(
          "EVOEX-STACK",
          "evolution-experience",
          "Experience / capability / governance / exposure / manifest",
          ok,
          `readiness=${readiness.verdict} checksum=${manifest.checksum.slice(0, 12)}…`,
        ),
      );
    } catch (error) {
      checks.push(
        check(
          "EVOEX-STACK",
          "evolution-experience",
          "Experience / capability / governance / exposure / manifest",
          false,
          error instanceof Error
            ? error.message
            : "product evolution experience not ready",
        ),
      );
    }

    checks.push(
      check(
        "EVOEX-SCOPE",
        "scope",
        "No DB / learning / optimization / AI analysis / tool runtime",
        ok &&
          metadata.declarationOnly === true &&
          metadata.excludes.includes("learning-runtime") &&
          metadata.excludes.includes("optimization-runtime") &&
          metadata.excludes.includes("ai-analysis"),
        "evolution-experience-declaration-only domain",
      ),
    );

    cleanup();
  } catch (error) {
    const detail =
      error instanceof Error
        ? error.message
        : "product evolution experience probe failed";
    checks.push(
      check(
        "EVOEX-STACK",
        "evolution-experience",
        "Experience / capability / governance / exposure / manifest",
        false,
        detail,
      ),
    );
    checks.push(
      check(
        "EVOEX-SCOPE",
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
      `product-evolution-experience-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertProductEvolutionExperienceReleaseGatePass(
  gate: ReleaseGateResult = checkProductEvolutionExperienceReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(
      `Product evolution experience release gate failed: ${gate.summary}`,
    );
  }
}
