/**
 * Product M15 — Evolution Learning Engine Release Gate
 * MODULE: Enterprise Evolution Learning (M15-P4)
 * BASE: enterprise-product-evolution-experience-v1
 */

import { buildPlatformV1Manifest } from "../../../platform/v1/platform.manifest";
import { PRODUCT_EVOLUTION_EXPERIENCE_ID } from "../experience/experience.constants";
import {
  EVOLUTION_LEARNING_CAPABILITY_KINDS,
  EVOLUTION_LEARNING_CAPABILITY_STATUSES,
  EVOLUTION_LEARNING_DOMAIN_SCOPES,
  EVOLUTION_LEARNING_GOVERNANCE_POLICY_KINDS,
  EVOLUTION_LEARNING_GOVERNANCE_POLICY_STATUSES,
  EVOLUTION_LEARNING_INSIGHT_MODES,
  EVOLUTION_LEARNING_KINDS,
  EVOLUTION_LEARNING_READINESS_VERDICTS,
  EVOLUTION_LEARNING_STATUSES,
  PRODUCT_EVOLUTION_LEARNING_BASE,
  PRODUCT_EVOLUTION_LEARNING_FREEZE_TAG,
  PRODUCT_EVOLUTION_LEARNING_FREEZE_VERSION,
  PRODUCT_EVOLUTION_LEARNING_ID,
  PRODUCT_EVOLUTION_LEARNING_VERSION,
} from "../learning-runtime/learning.constants";
import {
  assertEvolutionLearningReadinessReady,
  buildEvolutionLearningManifest,
  clearEvolutionLearningLayer,
  evaluateEvolutionLearningReadiness,
} from "../learning-runtime/learning.manifest";
import {
  getEvolutionLearningMetadata,
  isEvolutionLearningMetadataIntact,
  validateEvolutionLearning,
} from "../learning-runtime/learning.metadata";
import {
  registerEvolutionLearning,
  updateEvolutionLearningStatus,
} from "../learning-runtime/learning.registry";
import {
  registerEvolutionLearningCapability,
  updateEvolutionLearningCapabilityStatus,
} from "../learning-runtime/capability.registry";
import { registerEvolutionLearningGovernancePolicy } from "../learning-runtime/governance.policy";
import { evaluateEvolutionLearningInsightContract } from "../learning-runtime/insight.contract";

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

export const PRODUCT_EVOLUTION_LEARNING_SIGNOFF_VERSION =
  "product-evolution-learning-signoff-1" as const;

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
  clearEvolutionLearningLayer();
}

export function checkProductEvolutionLearningReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];
  const metadata = getEvolutionLearningMetadata();

  checks.push(
    check(
      "EVOLRN-CONSTANTS",
      "learning",
      "Product evolution learning version constants",
      PRODUCT_EVOLUTION_LEARNING_ID ===
        "enterprise-product-evolution-learning-v1" &&
        PRODUCT_EVOLUTION_LEARNING_VERSION === "product-evolution-learning-1" &&
        PRODUCT_EVOLUTION_LEARNING_BASE === PRODUCT_EVOLUTION_EXPERIENCE_ID &&
        PRODUCT_EVOLUTION_LEARNING_FREEZE_VERSION ===
          "product-evolution-learning-freeze-1" &&
        PRODUCT_EVOLUTION_LEARNING_FREEZE_TAG ===
          "product-evolution-learning-freeze-1" &&
        EVOLUTION_LEARNING_KINDS.length === 6 &&
        EVOLUTION_LEARNING_STATUSES.length === 4 &&
        EVOLUTION_LEARNING_CAPABILITY_KINDS.length === 6 &&
        EVOLUTION_LEARNING_CAPABILITY_STATUSES.length === 4 &&
        EVOLUTION_LEARNING_DOMAIN_SCOPES.length === 4 &&
        EVOLUTION_LEARNING_INSIGHT_MODES.length === 3 &&
        EVOLUTION_LEARNING_GOVERNANCE_POLICY_KINDS.length === 4 &&
        EVOLUTION_LEARNING_GOVERNANCE_POLICY_STATUSES.length === 3 &&
        EVOLUTION_LEARNING_READINESS_VERDICTS.length === 3 &&
        isEvolutionLearningMetadataIntact(metadata),
      `id=${PRODUCT_EVOLUTION_LEARNING_ID} base=${PRODUCT_EVOLUTION_LEARNING_BASE}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "EVOLRN-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "EVOLRN-UPSTREAM",
      "compatibility",
      "Depends on Evolution experience chain",
      PRODUCT_EVOLUTION_LEARNING_BASE ===
        "enterprise-product-evolution-experience-v1" &&
        PRODUCT_EVOLUTION_EXPERIENCE_ID ===
          "enterprise-product-evolution-experience-v1",
      `experience=${PRODUCT_EVOLUTION_EXPERIENCE_ID}`,
    ),
  );

  try {
    cleanup();

    const learning = registerEvolutionLearning({
      id: "evolrn.gate.lrn",
      learningKey: "DOMAIN_PATTERN_ARTIFACT",
      kind: "PATTERN",
      scope: "DOMAIN",
      title: "Domain pattern learning artifact",
      summary: "Declared pattern learning artifact for domain insight",
      experienceRef: PRODUCT_EVOLUTION_EXPERIENCE_ID,
    });
    const active = updateEvolutionLearningStatus({
      learningId: learning.id,
      status: "ACTIVE",
    });
    const validation = validateEvolutionLearning(active);
    const capability = registerEvolutionLearningCapability({
      id: "evolrn.gate.cap",
      learningId: learning.id,
      capabilityKey: "CAPTURE_DOMAIN_PATTERN",
      kind: "CAPTURE",
      summary: "Declared capture capability for domain patterns",
    });
    const declared = updateEvolutionLearningCapabilityStatus({
      capabilityId: capability.id,
      status: "DECLARED",
    });
    const policy = registerEvolutionLearningGovernancePolicy({
      id: "evolrn.gate.gov",
      policyKey: "PATTERN_ACCESS_CONTROL",
      kind: "ACCESS_CONTROL",
      title: "Pattern learning access control",
      learningKeyRef: learning.learningKey,
      ruleRef: "EVOLRN_RULE_INTERNAL_ONLY",
    });
    const contract = evaluateEvolutionLearningInsightContract({
      id: "evolrn.gate.in",
      contractKey: "PATTERN_DOMAIN_LOOKUP",
      query: {
        queryKey: "DOMAIN_PATTERN_Q",
        mode: "DECLARED",
        kind: "PATTERN",
        capabilityKind: "CAPTURE",
        scope: "DOMAIN",
        learningKeys: [learning.learningKey],
      },
    });
    const manifest = buildEvolutionLearningManifest();
    const readiness = evaluateEvolutionLearningReadiness();

    const ok =
      learning.learningKey === "DOMAIN_PATTERN_ARTIFACT" &&
      active.status === "ACTIVE" &&
      validation.ok === true &&
      declared.status === "DECLARED" &&
      policy.status === "ACTIVE" &&
      policy.learningKeyRef === "DOMAIN_PATTERN_ARTIFACT" &&
      contract.hitCount >= 1 &&
      manifest.checksum.length === 64 &&
      readiness.verdict === "READY";

    try {
      assertEvolutionLearningReadinessReady(readiness);
      checks.push(
        check(
          "EVOLRN-STACK",
          "evolution-learning",
          "Learning / capability / governance / insight / manifest",
          ok,
          `readiness=${readiness.verdict} checksum=${manifest.checksum.slice(0, 12)}…`,
        ),
      );
    } catch (error) {
      checks.push(
        check(
          "EVOLRN-STACK",
          "evolution-learning",
          "Learning / capability / governance / insight / manifest",
          false,
          error instanceof Error
            ? error.message
            : "product evolution learning not ready",
        ),
      );
    }

    checks.push(
      check(
        "EVOLRN-SCOPE",
        "scope",
        "No DB / optimization / recommendation / execution / tool runtime",
        ok &&
          metadata.declarationOnly === true &&
          metadata.excludes.includes("optimization-runtime") &&
          metadata.excludes.includes("recommendation-runtime") &&
          metadata.excludes.includes("execution-runtime"),
        "evolution-learning-declaration-only domain",
      ),
    );

    cleanup();
  } catch (error) {
    const detail =
      error instanceof Error
        ? error.message
        : "product evolution learning probe failed";
    checks.push(
      check(
        "EVOLRN-STACK",
        "evolution-learning",
        "Learning / capability / governance / insight / manifest",
        false,
        detail,
      ),
    );
    checks.push(
      check(
        "EVOLRN-SCOPE",
        "scope",
        "No DB / optimization / recommendation / execution / tool runtime",
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
      `product-evolution-learning-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertProductEvolutionLearningReleaseGatePass(
  gate: ReleaseGateResult = checkProductEvolutionLearningReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(
      `Product evolution learning release gate failed: ${gate.summary}`,
    );
  }
}
