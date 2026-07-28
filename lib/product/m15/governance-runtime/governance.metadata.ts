/**
 * Product M15 — Evolution Governance metadata + governance validator
 */

import {
  EVOLUTION_GOVERNANCE_DOMAIN_SCOPES,
  EVOLUTION_GOVERNANCE_FRAME_KINDS,
  EVOLUTION_GOVERNANCE_FRAME_STATUSES,
  PRODUCT_EVOLUTION_GOVERNANCE_BASE,
  PRODUCT_EVOLUTION_GOVERNANCE_FREEZE_TAG,
  PRODUCT_EVOLUTION_GOVERNANCE_FREEZE_VERSION,
  PRODUCT_EVOLUTION_GOVERNANCE_ID,
  PRODUCT_EVOLUTION_GOVERNANCE_VERSION,
} from "./governance.constants";
import type {
  EvolutionGovernance,
  EvolutionGovernanceValidationResult,
  RegisterEvolutionGovernanceInput,
} from "./governance.types";

export type EvolutionGovernanceMetadataRecord = {
  governanceRuntimeId: typeof PRODUCT_EVOLUTION_GOVERNANCE_ID;
  version: typeof PRODUCT_EVOLUTION_GOVERNANCE_VERSION;
  freezeVersion: typeof PRODUCT_EVOLUTION_GOVERNANCE_FREEZE_VERSION;
  freezeTag: typeof PRODUCT_EVOLUTION_GOVERNANCE_FREEZE_TAG;
  base: typeof PRODUCT_EVOLUTION_GOVERNANCE_BASE;
  module: "M15-P7";
  domain: "Enterprise Evolution";
  layer: "governance";
  declarationOnly: true;
  excludes: readonly string[];
};

export const PRODUCT_EVOLUTION_GOVERNANCE_METADATA: EvolutionGovernanceMetadataRecord =
  {
    governanceRuntimeId: PRODUCT_EVOLUTION_GOVERNANCE_ID,
    version: PRODUCT_EVOLUTION_GOVERNANCE_VERSION,
    freezeVersion: PRODUCT_EVOLUTION_GOVERNANCE_FREEZE_VERSION,
    freezeTag: PRODUCT_EVOLUTION_GOVERNANCE_FREEZE_TAG,
    base: PRODUCT_EVOLUTION_GOVERNANCE_BASE,
    module: "M15-P7",
    domain: "Enterprise Evolution",
    layer: "governance",
    declarationOnly: true,
    excludes: [
      "database",
      "vector-store",
      "rag-runtime",
      "embedding",
      "external-provider",
      "deployment-runtime",
      "execution-runtime",
      "capability-upgrade",
    ],
  };

export function getEvolutionGovernanceRuntimeMetadata(): EvolutionGovernanceMetadataRecord {
  return {
    ...PRODUCT_EVOLUTION_GOVERNANCE_METADATA,
    excludes: [...PRODUCT_EVOLUTION_GOVERNANCE_METADATA.excludes],
  };
}

export function isEvolutionGovernanceRuntimeMetadataIntact(
  metadata: EvolutionGovernanceMetadataRecord = PRODUCT_EVOLUTION_GOVERNANCE_METADATA,
): boolean {
  return (
    metadata.governanceRuntimeId ===
      "enterprise-product-evolution-governance-v1" &&
    metadata.version === "product-evolution-governance-1" &&
    metadata.freezeVersion === "product-evolution-governance-freeze-1" &&
    metadata.base === "enterprise-product-evolution-capability-v1" &&
    metadata.module === "M15-P7" &&
    metadata.declarationOnly === true &&
    metadata.excludes.length === 8
  );
}

export function validateEvolutionGovernanceInput(
  input: RegisterEvolutionGovernanceInput,
): EvolutionGovernanceValidationResult {
  const issues: EvolutionGovernanceValidationResult["issues"] = [];
  const governanceKey = input.governanceKey?.trim() ?? "";
  const title = input.title?.trim() ?? "";
  const summary = input.summary?.trim() ?? "";

  if (!governanceKey) {
    issues.push({ field: "governanceKey", message: "required" });
  }
  if (!title) issues.push({ field: "title", message: "required" });
  if (!summary) issues.push({ field: "summary", message: "required" });
  if (
    !(EVOLUTION_GOVERNANCE_FRAME_KINDS as readonly string[]).includes(input.kind)
  ) {
    issues.push({ field: "kind", message: `invalid kind: ${input.kind}` });
  }
  if (
    !(EVOLUTION_GOVERNANCE_DOMAIN_SCOPES as readonly string[]).includes(
      input.scope,
    )
  ) {
    issues.push({ field: "scope", message: `invalid scope: ${input.scope}` });
  }

  return { ok: issues.length === 0, issues };
}

export function validateEvolutionGovernance(
  governance: EvolutionGovernance,
): EvolutionGovernanceValidationResult {
  const issues: EvolutionGovernanceValidationResult["issues"] = [];
  if (!governance.id.trim()) issues.push({ field: "id", message: "required" });
  if (!governance.governanceKey.trim()) {
    issues.push({ field: "governanceKey", message: "required" });
  }
  if (
    !(EVOLUTION_GOVERNANCE_FRAME_KINDS as readonly string[]).includes(
      governance.kind,
    )
  ) {
    issues.push({
      field: "kind",
      message: `invalid kind: ${governance.kind}`,
    });
  }
  if (
    !(EVOLUTION_GOVERNANCE_FRAME_STATUSES as readonly string[]).includes(
      governance.status,
    )
  ) {
    issues.push({
      field: "status",
      message: `invalid status: ${governance.status}`,
    });
  }
  if (
    !(EVOLUTION_GOVERNANCE_DOMAIN_SCOPES as readonly string[]).includes(
      governance.scope,
    )
  ) {
    issues.push({
      field: "scope",
      message: `invalid scope: ${governance.scope}`,
    });
  }
  if (!governance.title.trim()) {
    issues.push({ field: "title", message: "required" });
  }
  if (!governance.summary.trim()) {
    issues.push({ field: "summary", message: "required" });
  }
  if (!governance.capabilityRef.trim()) {
    issues.push({ field: "capabilityRef", message: "required" });
  }
  return { ok: issues.length === 0, issues };
}
