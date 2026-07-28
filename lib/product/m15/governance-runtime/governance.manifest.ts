/**
 * Product M15 — Evolution Governance manifest builder
 */

import { createHash } from "node:crypto";

import { PRODUCT_EVOLUTION_CAPABILITY_ID } from "../capability-runtime/capability.constants";
import {
  PRODUCT_EVOLUTION_GOVERNANCE_BASE,
  PRODUCT_EVOLUTION_GOVERNANCE_FREEZE_VERSION,
  PRODUCT_EVOLUTION_GOVERNANCE_ID,
  PRODUCT_EVOLUTION_GOVERNANCE_VERSION,
} from "./governance.constants";
import {
  getEvolutionGovernanceRuntimeMetadata,
  validateEvolutionGovernance,
} from "./governance.metadata";
import {
  clearEvolutionGovernances,
  listEvolutionGovernances,
} from "./governance.registry";
import type {
  EvolutionGovernanceManifest,
  EvolutionGovernanceReadinessCheck,
  EvolutionGovernanceReadinessResult,
} from "./governance.types";
import {
  clearEvolutionGovernanceReviews,
  listEvolutionGovernanceReviews,
} from "./review.registry";
import {
  clearEvolutionGovernanceControlPolicies,
  listEvolutionGovernanceControlPolicies,
} from "./governance.policy";
import {
  clearEvolutionGovernanceOversightContracts,
  listEvolutionGovernanceOversightContracts,
} from "./oversight.contract";

function nowIso(): string {
  return new Date().toISOString();
}

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): EvolutionGovernanceReadinessCheck {
  return { id, component, label, ok, detail };
}

export function clearEvolutionGovernanceRuntimeLayer(): void {
  clearEvolutionGovernanceOversightContracts();
  clearEvolutionGovernanceControlPolicies();
  clearEvolutionGovernanceReviews();
  clearEvolutionGovernances();
}

export function buildEvolutionGovernanceManifest(): EvolutionGovernanceManifest {
  const governances = listEvolutionGovernances();
  const reviews = listEvolutionGovernanceReviews();
  const policies = listEvolutionGovernanceControlPolicies();
  const contracts = listEvolutionGovernanceOversightContracts();
  const metadata = getEvolutionGovernanceRuntimeMetadata();
  const active = governances.filter((g) => g.status === "ACTIVE");

  const payload = {
    governanceRuntimeId: PRODUCT_EVOLUTION_GOVERNANCE_ID,
    version: PRODUCT_EVOLUTION_GOVERNANCE_VERSION,
    freezeVersion: PRODUCT_EVOLUTION_GOVERNANCE_FREEZE_VERSION,
    base: PRODUCT_EVOLUTION_GOVERNANCE_BASE,
    module: metadata.module,
    declarationOnly: metadata.declarationOnly,
    governances: governances.map((g) => ({
      governanceKey: g.governanceKey,
      kind: g.kind,
      status: g.status,
      scope: g.scope,
      capabilityRef: g.capabilityRef,
    })),
    reviews: reviews.map((r) => ({
      reviewKey: r.reviewKey,
      kind: r.kind,
      status: r.status,
      governanceId: r.governanceId,
    })),
    policies: policies.map((p) => ({
      policyKey: p.policyKey,
      kind: p.kind,
      status: p.status,
      governanceKeyRef: p.governanceKeyRef,
    })),
    contracts: contracts.map((c) => ({
      contractKey: c.contractKey,
      mode: c.query.mode,
      hitCount: c.hitCount,
    })),
  };

  return {
    governanceRuntimeId: PRODUCT_EVOLUTION_GOVERNANCE_ID,
    version: PRODUCT_EVOLUTION_GOVERNANCE_VERSION,
    freezeVersion: PRODUCT_EVOLUTION_GOVERNANCE_FREEZE_VERSION,
    base: PRODUCT_EVOLUTION_GOVERNANCE_BASE,
    governanceCount: governances.length,
    activeCount: active.length,
    reviewCount: reviews.length,
    policyCount: policies.length,
    contractCount: contracts.length,
    checksum: createHash("sha256")
      .update(JSON.stringify(payload))
      .digest("hex"),
    createdAt: nowIso(),
  };
}

export function evaluateEvolutionGovernanceReadiness(): EvolutionGovernanceReadinessResult {
  const checks: EvolutionGovernanceReadinessCheck[] = [];
  const metadata = getEvolutionGovernanceRuntimeMetadata();
  const governances = listEvolutionGovernances();
  const reviews = listEvolutionGovernanceReviews();
  const policies = listEvolutionGovernanceControlPolicies();
  const contracts = listEvolutionGovernanceOversightContracts();
  const manifest = buildEvolutionGovernanceManifest();
  const governancesValid = governances.every(
    (g) => validateEvolutionGovernance(g).ok,
  );

  checks.push(
    check(
      "EVOGOV-BASE",
      "governance",
      "evolution capability base aligned",
      PRODUCT_EVOLUTION_GOVERNANCE_BASE === PRODUCT_EVOLUTION_CAPABILITY_ID &&
        PRODUCT_EVOLUTION_CAPABILITY_ID ===
          "enterprise-product-evolution-capability-v1",
      `base=${PRODUCT_EVOLUTION_GOVERNANCE_BASE}`,
    ),
  );

  checks.push(
    check(
      "EVOGOV-META",
      "metadata",
      "Evolution governance metadata declaration-only",
      metadata.declarationOnly === true && metadata.excludes.length === 8,
      `module=${metadata.module}`,
    ),
  );

  checks.push(
    check(
      "EVOGOV-FRAME",
      "governance",
      "Active governance frames present and valid",
      governances.some((g) => g.status === "ACTIVE") && governancesValid,
      `governances=${governances.length}`,
    ),
  );

  checks.push(
    check(
      "EVOGOV-REV",
      "review",
      "Declared reviews present",
      reviews.some((r) => r.status === "DECLARED"),
      `reviews=${reviews.length}`,
    ),
  );

  checks.push(
    check(
      "EVOGOV-CTL",
      "policy",
      "Active control policies present",
      policies.some((p) => p.status === "ACTIVE"),
      `policies=${policies.length}`,
    ),
  );

  checks.push(
    check(
      "EVOGOV-OS",
      "oversight",
      "Oversight contracts with hits present",
      contracts.some((c) => c.hitCount >= 1),
      `contracts=${contracts.length}`,
    ),
  );

  checks.push(
    check(
      "EVOGOV-MAN",
      "manifest",
      "Evolution governance manifest checksum intact",
      manifest.checksum.length === 64 &&
        manifest.governanceRuntimeId === PRODUCT_EVOLUTION_GOVERNANCE_ID &&
        manifest.activeCount >= 1 &&
        manifest.reviewCount >= 1 &&
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
    summary: `product-evolution-governance readiness ${verdict.toLowerCase()}: pass=${passCount} fail=${failCount}`,
    evaluatedAt: nowIso(),
  };
}

export function assertEvolutionGovernanceReadinessReady(
  result: EvolutionGovernanceReadinessResult,
): asserts result is EvolutionGovernanceReadinessResult & {
  verdict: "READY";
} {
  if (result.verdict !== "READY") {
    throw new Error(
      `product evolution governance not ready: ${result.summary}`,
    );
  }
}
