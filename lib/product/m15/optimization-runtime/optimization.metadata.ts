/**
 * Product M15 — Evolution Optimization Engine metadata + proposal validator
 */

import {
  EVOLUTION_OPTIMIZATION_DOMAIN_SCOPES,
  EVOLUTION_OPTIMIZATION_PROPOSAL_KINDS,
  EVOLUTION_OPTIMIZATION_PROPOSAL_STATUSES,
  PRODUCT_EVOLUTION_OPTIMIZATION_BASE,
  PRODUCT_EVOLUTION_OPTIMIZATION_FREEZE_TAG,
  PRODUCT_EVOLUTION_OPTIMIZATION_FREEZE_VERSION,
  PRODUCT_EVOLUTION_OPTIMIZATION_ID,
  PRODUCT_EVOLUTION_OPTIMIZATION_VERSION,
} from "./optimization.constants";
import type {
  EvolutionOptimizationProposal,
  EvolutionOptimizationProposalValidationResult,
  RegisterEvolutionOptimizationProposalInput,
} from "./optimization.types";

export type EvolutionOptimizationMetadataRecord = {
  optimizationId: typeof PRODUCT_EVOLUTION_OPTIMIZATION_ID;
  version: typeof PRODUCT_EVOLUTION_OPTIMIZATION_VERSION;
  freezeVersion: typeof PRODUCT_EVOLUTION_OPTIMIZATION_FREEZE_VERSION;
  freezeTag: typeof PRODUCT_EVOLUTION_OPTIMIZATION_FREEZE_TAG;
  base: typeof PRODUCT_EVOLUTION_OPTIMIZATION_BASE;
  module: "M15-P5";
  domain: "Enterprise Evolution";
  layer: "optimization";
  declarationOnly: true;
  excludes: readonly string[];
};

export const PRODUCT_EVOLUTION_OPTIMIZATION_METADATA: EvolutionOptimizationMetadataRecord =
  {
    optimizationId: PRODUCT_EVOLUTION_OPTIMIZATION_ID,
    version: PRODUCT_EVOLUTION_OPTIMIZATION_VERSION,
    freezeVersion: PRODUCT_EVOLUTION_OPTIMIZATION_FREEZE_VERSION,
    freezeTag: PRODUCT_EVOLUTION_OPTIMIZATION_FREEZE_TAG,
    base: PRODUCT_EVOLUTION_OPTIMIZATION_BASE,
    module: "M15-P5",
    domain: "Enterprise Evolution",
    layer: "optimization",
    declarationOnly: true,
    excludes: [
      "database",
      "vector-store",
      "rag-runtime",
      "embedding",
      "external-provider",
      "execution-runtime",
      "deployment-runtime",
      "automation-runtime",
    ],
  };

export function getEvolutionOptimizationMetadata(): EvolutionOptimizationMetadataRecord {
  return {
    ...PRODUCT_EVOLUTION_OPTIMIZATION_METADATA,
    excludes: [...PRODUCT_EVOLUTION_OPTIMIZATION_METADATA.excludes],
  };
}

export function isEvolutionOptimizationMetadataIntact(
  metadata: EvolutionOptimizationMetadataRecord = PRODUCT_EVOLUTION_OPTIMIZATION_METADATA,
): boolean {
  return (
    metadata.optimizationId ===
      "enterprise-product-evolution-optimization-v1" &&
    metadata.version === "product-evolution-optimization-1" &&
    metadata.freezeVersion === "product-evolution-optimization-freeze-1" &&
    metadata.base === "enterprise-product-evolution-learning-v1" &&
    metadata.module === "M15-P5" &&
    metadata.declarationOnly === true &&
    metadata.excludes.length === 8
  );
}

export function validateEvolutionOptimizationProposalInput(
  input: RegisterEvolutionOptimizationProposalInput,
): EvolutionOptimizationProposalValidationResult {
  const issues: EvolutionOptimizationProposalValidationResult["issues"] = [];
  const proposalKey = input.proposalKey?.trim() ?? "";
  const title = input.title?.trim() ?? "";
  const summary = input.summary?.trim() ?? "";

  if (!proposalKey) {
    issues.push({ field: "proposalKey", message: "required" });
  }
  if (!title) issues.push({ field: "title", message: "required" });
  if (!summary) issues.push({ field: "summary", message: "required" });
  if (
    !(EVOLUTION_OPTIMIZATION_PROPOSAL_KINDS as readonly string[]).includes(
      input.kind,
    )
  ) {
    issues.push({ field: "kind", message: `invalid kind: ${input.kind}` });
  }
  if (
    !(EVOLUTION_OPTIMIZATION_DOMAIN_SCOPES as readonly string[]).includes(
      input.scope,
    )
  ) {
    issues.push({ field: "scope", message: `invalid scope: ${input.scope}` });
  }

  return { ok: issues.length === 0, issues };
}

export function validateEvolutionOptimizationProposal(
  proposal: EvolutionOptimizationProposal,
): EvolutionOptimizationProposalValidationResult {
  const issues: EvolutionOptimizationProposalValidationResult["issues"] = [];
  if (!proposal.id.trim()) issues.push({ field: "id", message: "required" });
  if (!proposal.proposalKey.trim()) {
    issues.push({ field: "proposalKey", message: "required" });
  }
  if (
    !(EVOLUTION_OPTIMIZATION_PROPOSAL_KINDS as readonly string[]).includes(
      proposal.kind,
    )
  ) {
    issues.push({ field: "kind", message: `invalid kind: ${proposal.kind}` });
  }
  if (
    !(EVOLUTION_OPTIMIZATION_PROPOSAL_STATUSES as readonly string[]).includes(
      proposal.status,
    )
  ) {
    issues.push({
      field: "status",
      message: `invalid status: ${proposal.status}`,
    });
  }
  if (
    !(EVOLUTION_OPTIMIZATION_DOMAIN_SCOPES as readonly string[]).includes(
      proposal.scope,
    )
  ) {
    issues.push({
      field: "scope",
      message: `invalid scope: ${proposal.scope}`,
    });
  }
  if (!proposal.title.trim()) {
    issues.push({ field: "title", message: "required" });
  }
  if (!proposal.summary.trim()) {
    issues.push({ field: "summary", message: "required" });
  }
  if (!proposal.learningRef.trim()) {
    issues.push({ field: "learningRef", message: "required" });
  }
  return { ok: issues.length === 0, issues };
}
