/**
 * Product M15 â€?Evolution Capability Evolution manifest builder
 */

import { createHash } from "node:crypto";

import { PRODUCT_EVOLUTION_OPTIMIZATION_ID } from "../optimization-runtime/optimization.constants";
import {
  PRODUCT_EVOLUTION_CAPABILITY_BASE,
  PRODUCT_EVOLUTION_CAPABILITY_FREEZE_VERSION,
  PRODUCT_EVOLUTION_CAPABILITY_ID,
  PRODUCT_EVOLUTION_CAPABILITY_VERSION,
} from "./capability.constants";
import {
  getEvolutionCapabilityRuntimeMetadata,
  validateEvolutionCapabilitySpec,
} from "./capability.metadata";
import {
  clearEvolutionCapabilitySpecs,
  listEvolutionCapabilitySpecs,
} from "./capability.registry";
import type {
  EvolutionCapabilityManifest,
  EvolutionCapabilityReadinessCheck,
  EvolutionCapabilityReadinessResult,
} from "./capability.types";
import {
  clearEvolutionCapabilityRevisions,
  listEvolutionCapabilityRevisions,
} from "./revision.registry";
import {
  clearEvolutionCapabilityGovernancePolicies,
  listEvolutionCapabilityGovernancePolicies,
} from "./governance.policy";
import {
  clearEvolutionCapabilityAdvancementContracts,
  listEvolutionCapabilityAdvancementContracts,
} from "./advancement.contract";

function nowIso(): string {
  return new Date().toISOString();
}

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): EvolutionCapabilityReadinessCheck {
  return { id, component, label, ok, detail };
}

export function clearEvolutionCapabilityRuntimeLayer(): void {
  clearEvolutionCapabilityAdvancementContracts();
  clearEvolutionCapabilityGovernancePolicies();
  clearEvolutionCapabilityRevisions();
  clearEvolutionCapabilitySpecs();
}

export function buildEvolutionCapabilityManifest(): EvolutionCapabilityManifest {
  const capabilities = listEvolutionCapabilitySpecs();
  const revisions = listEvolutionCapabilityRevisions();
  const policies = listEvolutionCapabilityGovernancePolicies();
  const contracts = listEvolutionCapabilityAdvancementContracts();
  const metadata = getEvolutionCapabilityRuntimeMetadata();
  const active = capabilities.filter((c) => c.status === "ACTIVE");

  const payload = {
    capabilityRuntimeId: PRODUCT_EVOLUTION_CAPABILITY_ID,
    version: PRODUCT_EVOLUTION_CAPABILITY_VERSION,
    freezeVersion: PRODUCT_EVOLUTION_CAPABILITY_FREEZE_VERSION,
    base: PRODUCT_EVOLUTION_CAPABILITY_BASE,
    module: metadata.module,
    declarationOnly: metadata.declarationOnly,
    capabilities: capabilities.map((c) => ({
      capabilityKey: c.capabilityKey,
      kind: c.kind,
      status: c.status,
      scope: c.scope,
      optimizationRef: c.optimizationRef,
    })),
    revisions: revisions.map((r) => ({
      revisionKey: r.revisionKey,
      kind: r.kind,
      status: r.status,
      capabilityId: r.capabilityId,
    })),
    policies: policies.map((p) => ({
      policyKey: p.policyKey,
      kind: p.kind,
      status: p.status,
      capabilityKeyRef: p.capabilityKeyRef,
    })),
    contracts: contracts.map((c) => ({
      contractKey: c.contractKey,
      mode: c.query.mode,
      hitCount: c.hitCount,
    })),
  };

  return {
    capabilityRuntimeId: PRODUCT_EVOLUTION_CAPABILITY_ID,
    version: PRODUCT_EVOLUTION_CAPABILITY_VERSION,
    freezeVersion: PRODUCT_EVOLUTION_CAPABILITY_FREEZE_VERSION,
    base: PRODUCT_EVOLUTION_CAPABILITY_BASE,
    capabilityCount: capabilities.length,
    activeCount: active.length,
    revisionCount: revisions.length,
    policyCount: policies.length,
    contractCount: contracts.length,
    checksum: createHash("sha256")
      .update(JSON.stringify(payload))
      .digest("hex"),
    createdAt: nowIso(),
  };
}

export function evaluateEvolutionCapabilityReadiness(): EvolutionCapabilityReadinessResult {
  const checks: EvolutionCapabilityReadinessCheck[] = [];
  const metadata = getEvolutionCapabilityRuntimeMetadata();
  const capabilities = listEvolutionCapabilitySpecs();
  const revisions = listEvolutionCapabilityRevisions();
  const policies = listEvolutionCapabilityGovernancePolicies();
  const contracts = listEvolutionCapabilityAdvancementContracts();
  const manifest = buildEvolutionCapabilityManifest();
  const capabilitiesValid = capabilities.every(
    (c) => validateEvolutionCapabilitySpec(c).ok,
  );

  checks.push(
    check(
      "EVOCAP-BASE",
      "capability",
      "evolution optimization base aligned",
      PRODUCT_EVOLUTION_CAPABILITY_BASE === PRODUCT_EVOLUTION_OPTIMIZATION_ID &&
        PRODUCT_EVOLUTION_OPTIMIZATION_ID ===
          "enterprise-product-evolution-optimization-v1",
      `base=${PRODUCT_EVOLUTION_CAPABILITY_BASE}`,
    ),
  );

  checks.push(
    check(
      "EVOCAP-META",
      "metadata",
      "Evolution capability metadata declaration-only",
      metadata.declarationOnly === true && metadata.excludes.length === 8,
      `module=${metadata.module}`,
    ),
  );

  checks.push(
    check(
      "EVOCAP-SPEC",
      "capability",
      "Active capability specs present and valid",
      capabilities.some((c) => c.status === "ACTIVE") && capabilitiesValid,
      `capabilities=${capabilities.length}`,
    ),
  );

  checks.push(
    check(
      "EVOCAP-REV",
      "revision",
      "Declared revisions present",
      revisions.some((r) => r.status === "DECLARED"),
      `revisions=${revisions.length}`,
    ),
  );

  checks.push(
    check(
      "EVOCAP-GOV",
      "governance",
      "Active governance policies present",
      policies.some((p) => p.status === "ACTIVE"),
      `policies=${policies.length}`,
    ),
  );

  checks.push(
    check(
      "EVOCAP-ADV",
      "advancement",
      "Advancement contracts with hits present",
      contracts.some((c) => c.hitCount >= 1),
      `contracts=${contracts.length}`,
    ),
  );

  checks.push(
    check(
      "EVOCAP-MAN",
      "manifest",
      "Evolution capability manifest checksum intact",
      manifest.checksum.length === 64 &&
        manifest.capabilityRuntimeId === PRODUCT_EVOLUTION_CAPABILITY_ID &&
        manifest.activeCount >= 1 &&
        manifest.revisionCount >= 1 &&
        manifest.policyCount >= 1 &&
        manifest.contractCount >= 1,
      `checksum=${manifest.checksum.slice(0, 12)}â€¦`,
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
    summary: `product-evolution-capability readiness ${verdict.toLowerCase()}: pass=${passCount} fail=${failCount}`,
    evaluatedAt: nowIso(),
  };
}

export function assertEvolutionCapabilityReadinessReady(
  result: EvolutionCapabilityReadinessResult,
): asserts result is EvolutionCapabilityReadinessResult & {
  verdict: "READY";
} {
  if (result.verdict !== "READY") {
    throw new Error(
      `product evolution capability not ready: ${result.summary}`,
    );
  }
}
