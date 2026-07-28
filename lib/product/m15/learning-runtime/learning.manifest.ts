/**
 * Product M15 — Evolution Learning Engine manifest builder
 */

import { createHash } from "node:crypto";

import { PRODUCT_EVOLUTION_EXPERIENCE_ID } from "../experience/experience.constants";
import {
  PRODUCT_EVOLUTION_LEARNING_BASE,
  PRODUCT_EVOLUTION_LEARNING_FREEZE_VERSION,
  PRODUCT_EVOLUTION_LEARNING_ID,
  PRODUCT_EVOLUTION_LEARNING_VERSION,
} from "./learning.constants";
import {
  getEvolutionLearningMetadata,
  validateEvolutionLearning,
} from "./learning.metadata";
import {
  clearEvolutionLearnings,
  listEvolutionLearnings,
} from "./learning.registry";
import type {
  EvolutionLearningManifest,
  EvolutionLearningReadinessCheck,
  EvolutionLearningReadinessResult,
} from "./learning.types";
import {
  clearEvolutionLearningCapabilities,
  listEvolutionLearningCapabilities,
} from "./capability.registry";
import {
  clearEvolutionLearningGovernancePolicies,
  listEvolutionLearningGovernancePolicies,
} from "./governance.policy";
import {
  clearEvolutionLearningInsightContracts,
  listEvolutionLearningInsightContracts,
} from "./insight.contract";

function nowIso(): string {
  return new Date().toISOString();
}

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): EvolutionLearningReadinessCheck {
  return { id, component, label, ok, detail };
}

export function clearEvolutionLearningLayer(): void {
  clearEvolutionLearningInsightContracts();
  clearEvolutionLearningGovernancePolicies();
  clearEvolutionLearningCapabilities();
  clearEvolutionLearnings();
}

export function buildEvolutionLearningManifest(): EvolutionLearningManifest {
  const learnings = listEvolutionLearnings();
  const capabilities = listEvolutionLearningCapabilities();
  const policies = listEvolutionLearningGovernancePolicies();
  const contracts = listEvolutionLearningInsightContracts();
  const metadata = getEvolutionLearningMetadata();
  const active = learnings.filter((l) => l.status === "ACTIVE");

  const payload = {
    learningId: PRODUCT_EVOLUTION_LEARNING_ID,
    version: PRODUCT_EVOLUTION_LEARNING_VERSION,
    freezeVersion: PRODUCT_EVOLUTION_LEARNING_FREEZE_VERSION,
    base: PRODUCT_EVOLUTION_LEARNING_BASE,
    module: metadata.module,
    declarationOnly: metadata.declarationOnly,
    learnings: learnings.map((l) => ({
      learningKey: l.learningKey,
      kind: l.kind,
      status: l.status,
      scope: l.scope,
      experienceRef: l.experienceRef,
    })),
    capabilities: capabilities.map((c) => ({
      capabilityKey: c.capabilityKey,
      kind: c.kind,
      status: c.status,
      learningId: c.learningId,
    })),
    policies: policies.map((p) => ({
      policyKey: p.policyKey,
      kind: p.kind,
      status: p.status,
      learningKeyRef: p.learningKeyRef,
    })),
    contracts: contracts.map((c) => ({
      contractKey: c.contractKey,
      mode: c.query.mode,
      hitCount: c.hitCount,
    })),
  };

  return {
    learningId: PRODUCT_EVOLUTION_LEARNING_ID,
    version: PRODUCT_EVOLUTION_LEARNING_VERSION,
    freezeVersion: PRODUCT_EVOLUTION_LEARNING_FREEZE_VERSION,
    base: PRODUCT_EVOLUTION_LEARNING_BASE,
    learningCount: learnings.length,
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

export function evaluateEvolutionLearningReadiness(): EvolutionLearningReadinessResult {
  const checks: EvolutionLearningReadinessCheck[] = [];
  const metadata = getEvolutionLearningMetadata();
  const learnings = listEvolutionLearnings();
  const capabilities = listEvolutionLearningCapabilities();
  const policies = listEvolutionLearningGovernancePolicies();
  const contracts = listEvolutionLearningInsightContracts();
  const manifest = buildEvolutionLearningManifest();
  const learningsValid = learnings.every(
    (l) => validateEvolutionLearning(l).ok,
  );

  checks.push(
    check(
      "EVOLRN-BASE",
      "learning",
      "evolution experience base aligned",
      PRODUCT_EVOLUTION_LEARNING_BASE === PRODUCT_EVOLUTION_EXPERIENCE_ID &&
        PRODUCT_EVOLUTION_EXPERIENCE_ID ===
          "enterprise-product-evolution-experience-v1",
      `base=${PRODUCT_EVOLUTION_LEARNING_BASE}`,
    ),
  );

  checks.push(
    check(
      "EVOLRN-META",
      "metadata",
      "Evolution learning metadata declaration-only",
      metadata.declarationOnly === true && metadata.excludes.length === 8,
      `module=${metadata.module}`,
    ),
  );

  checks.push(
    check(
      "EVOLRN-LRN",
      "learning",
      "Active learning artifacts present and valid",
      learnings.some((l) => l.status === "ACTIVE") && learningsValid,
      `learnings=${learnings.length}`,
    ),
  );

  checks.push(
    check(
      "EVOLRN-CAP",
      "capability",
      "Declared capabilities present",
      capabilities.some((c) => c.status === "DECLARED"),
      `capabilities=${capabilities.length}`,
    ),
  );

  checks.push(
    check(
      "EVOLRN-GOV",
      "governance",
      "Active governance policies present",
      policies.some((p) => p.status === "ACTIVE"),
      `policies=${policies.length}`,
    ),
  );

  checks.push(
    check(
      "EVOLRN-IN",
      "insight",
      "Insight contracts with hits present",
      contracts.some((c) => c.hitCount >= 1),
      `contracts=${contracts.length}`,
    ),
  );

  checks.push(
    check(
      "EVOLRN-MAN",
      "manifest",
      "Evolution learning manifest checksum intact",
      manifest.checksum.length === 64 &&
        manifest.learningId === PRODUCT_EVOLUTION_LEARNING_ID &&
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
    summary: `product-evolution-learning readiness ${verdict.toLowerCase()}: pass=${passCount} fail=${failCount}`,
    evaluatedAt: nowIso(),
  };
}

export function assertEvolutionLearningReadinessReady(
  result: EvolutionLearningReadinessResult,
): asserts result is EvolutionLearningReadinessResult & { verdict: "READY" } {
  if (result.verdict !== "READY") {
    throw new Error(
      `product evolution learning not ready: ${result.summary}`,
    );
  }
}
