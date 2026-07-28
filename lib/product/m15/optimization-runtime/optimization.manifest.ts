/**
 * Product M15 — Evolution Optimization Engine manifest builder
 */

import { createHash } from "node:crypto";

import { PRODUCT_EVOLUTION_LEARNING_ID } from "../learning-runtime/learning.constants";
import {
  PRODUCT_EVOLUTION_OPTIMIZATION_BASE,
  PRODUCT_EVOLUTION_OPTIMIZATION_FREEZE_VERSION,
  PRODUCT_EVOLUTION_OPTIMIZATION_ID,
  PRODUCT_EVOLUTION_OPTIMIZATION_VERSION,
} from "./optimization.constants";
import {
  getEvolutionOptimizationMetadata,
  validateEvolutionOptimizationProposal,
} from "./optimization.metadata";
import {
  clearEvolutionOptimizationProposals,
  listEvolutionOptimizationProposals,
} from "./optimization.registry";
import type {
  EvolutionOptimizationManifest,
  EvolutionOptimizationReadinessCheck,
  EvolutionOptimizationReadinessResult,
} from "./optimization.types";
import {
  clearEvolutionOptimizationCapabilities,
  listEvolutionOptimizationCapabilities,
} from "./capability.registry";
import {
  clearEvolutionOptimizationGovernancePolicies,
  listEvolutionOptimizationGovernancePolicies,
} from "./governance.policy";
import {
  clearEvolutionOptimizationEvaluationContracts,
  listEvolutionOptimizationEvaluationContracts,
} from "./evaluation.contract";

function nowIso(): string {
  return new Date().toISOString();
}

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): EvolutionOptimizationReadinessCheck {
  return { id, component, label, ok, detail };
}

export function clearEvolutionOptimizationLayer(): void {
  clearEvolutionOptimizationEvaluationContracts();
  clearEvolutionOptimizationGovernancePolicies();
  clearEvolutionOptimizationCapabilities();
  clearEvolutionOptimizationProposals();
}

export function buildEvolutionOptimizationManifest(): EvolutionOptimizationManifest {
  const proposals = listEvolutionOptimizationProposals();
  const capabilities = listEvolutionOptimizationCapabilities();
  const policies = listEvolutionOptimizationGovernancePolicies();
  const contracts = listEvolutionOptimizationEvaluationContracts();
  const metadata = getEvolutionOptimizationMetadata();
  const active = proposals.filter((p) => p.status === "ACTIVE");

  const payload = {
    optimizationId: PRODUCT_EVOLUTION_OPTIMIZATION_ID,
    version: PRODUCT_EVOLUTION_OPTIMIZATION_VERSION,
    freezeVersion: PRODUCT_EVOLUTION_OPTIMIZATION_FREEZE_VERSION,
    base: PRODUCT_EVOLUTION_OPTIMIZATION_BASE,
    module: metadata.module,
    declarationOnly: metadata.declarationOnly,
    proposals: proposals.map((p) => ({
      proposalKey: p.proposalKey,
      kind: p.kind,
      status: p.status,
      scope: p.scope,
      learningRef: p.learningRef,
    })),
    capabilities: capabilities.map((c) => ({
      capabilityKey: c.capabilityKey,
      kind: c.kind,
      status: c.status,
      proposalId: c.proposalId,
    })),
    policies: policies.map((p) => ({
      policyKey: p.policyKey,
      kind: p.kind,
      status: p.status,
      proposalKeyRef: p.proposalKeyRef,
    })),
    contracts: contracts.map((c) => ({
      contractKey: c.contractKey,
      mode: c.query.mode,
      hitCount: c.hitCount,
    })),
  };

  return {
    optimizationId: PRODUCT_EVOLUTION_OPTIMIZATION_ID,
    version: PRODUCT_EVOLUTION_OPTIMIZATION_VERSION,
    freezeVersion: PRODUCT_EVOLUTION_OPTIMIZATION_FREEZE_VERSION,
    base: PRODUCT_EVOLUTION_OPTIMIZATION_BASE,
    proposalCount: proposals.length,
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

export function evaluateEvolutionOptimizationReadiness(): EvolutionOptimizationReadinessResult {
  const checks: EvolutionOptimizationReadinessCheck[] = [];
  const metadata = getEvolutionOptimizationMetadata();
  const proposals = listEvolutionOptimizationProposals();
  const capabilities = listEvolutionOptimizationCapabilities();
  const policies = listEvolutionOptimizationGovernancePolicies();
  const contracts = listEvolutionOptimizationEvaluationContracts();
  const manifest = buildEvolutionOptimizationManifest();
  const proposalsValid = proposals.every(
    (p) => validateEvolutionOptimizationProposal(p).ok,
  );

  checks.push(
    check(
      "EVOPT-BASE",
      "optimization",
      "evolution learning base aligned",
      PRODUCT_EVOLUTION_OPTIMIZATION_BASE === PRODUCT_EVOLUTION_LEARNING_ID &&
        PRODUCT_EVOLUTION_LEARNING_ID ===
          "enterprise-product-evolution-learning-v1",
      `base=${PRODUCT_EVOLUTION_OPTIMIZATION_BASE}`,
    ),
  );

  checks.push(
    check(
      "EVOPT-META",
      "metadata",
      "Evolution optimization metadata declaration-only",
      metadata.declarationOnly === true && metadata.excludes.length === 8,
      `module=${metadata.module}`,
    ),
  );

  checks.push(
    check(
      "EVOPT-PROP",
      "proposal",
      "Active optimization proposals present and valid",
      proposals.some((p) => p.status === "ACTIVE") && proposalsValid,
      `proposals=${proposals.length}`,
    ),
  );

  checks.push(
    check(
      "EVOPT-CAP",
      "capability",
      "Declared capabilities present",
      capabilities.some((c) => c.status === "DECLARED"),
      `capabilities=${capabilities.length}`,
    ),
  );

  checks.push(
    check(
      "EVOPT-GOV",
      "governance",
      "Active governance policies present",
      policies.some((p) => p.status === "ACTIVE"),
      `policies=${policies.length}`,
    ),
  );

  checks.push(
    check(
      "EVOPT-EV",
      "evaluation",
      "Evaluation contracts with hits present",
      contracts.some((c) => c.hitCount >= 1),
      `contracts=${contracts.length}`,
    ),
  );

  checks.push(
    check(
      "EVOPT-MAN",
      "manifest",
      "Evolution optimization manifest checksum intact",
      manifest.checksum.length === 64 &&
        manifest.optimizationId === PRODUCT_EVOLUTION_OPTIMIZATION_ID &&
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
    summary: `product-evolution-optimization readiness ${verdict.toLowerCase()}: pass=${passCount} fail=${failCount}`,
    evaluatedAt: nowIso(),
  };
}

export function assertEvolutionOptimizationReadinessReady(
  result: EvolutionOptimizationReadinessResult,
): asserts result is EvolutionOptimizationReadinessResult & {
  verdict: "READY";
} {
  if (result.verdict !== "READY") {
    throw new Error(
      `product evolution optimization not ready: ${result.summary}`,
    );
  }
}
