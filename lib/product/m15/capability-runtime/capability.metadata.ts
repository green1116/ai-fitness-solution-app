/**
 * Product M15 â€?Evolution Capability Evolution metadata + capability validator
 */

import {
  EVOLUTION_CAPABILITY_DOMAIN_SCOPES,
  EVOLUTION_CAPABILITY_SPEC_KINDS,
  EVOLUTION_CAPABILITY_SPEC_STATUSES,
  PRODUCT_EVOLUTION_CAPABILITY_BASE,
  PRODUCT_EVOLUTION_CAPABILITY_FREEZE_TAG,
  PRODUCT_EVOLUTION_CAPABILITY_FREEZE_VERSION,
  PRODUCT_EVOLUTION_CAPABILITY_ID,
  PRODUCT_EVOLUTION_CAPABILITY_VERSION,
} from "./capability.constants";
import type {
  EvolutionCapabilitySpec,
  EvolutionCapabilitySpecValidationResult,
  RegisterEvolutionCapabilitySpecInput,
} from "./capability.types";

export type EvolutionCapabilityMetadataRecord = {
  capabilityRuntimeId: typeof PRODUCT_EVOLUTION_CAPABILITY_ID;
  version: typeof PRODUCT_EVOLUTION_CAPABILITY_VERSION;
  freezeVersion: typeof PRODUCT_EVOLUTION_CAPABILITY_FREEZE_VERSION;
  freezeTag: typeof PRODUCT_EVOLUTION_CAPABILITY_FREEZE_TAG;
  base: typeof PRODUCT_EVOLUTION_CAPABILITY_BASE;
  module: "M15-P6";
  domain: "Enterprise Evolution";
  layer: "capability";
  declarationOnly: true;
  excludes: readonly string[];
};

export const PRODUCT_EVOLUTION_CAPABILITY_METADATA: EvolutionCapabilityMetadataRecord =
  {
    capabilityRuntimeId: PRODUCT_EVOLUTION_CAPABILITY_ID,
    version: PRODUCT_EVOLUTION_CAPABILITY_VERSION,
    freezeVersion: PRODUCT_EVOLUTION_CAPABILITY_FREEZE_VERSION,
    freezeTag: PRODUCT_EVOLUTION_CAPABILITY_FREEZE_TAG,
    base: PRODUCT_EVOLUTION_CAPABILITY_BASE,
    module: "M15-P6",
    domain: "Enterprise Evolution",
    layer: "capability",
    declarationOnly: true,
    excludes: [
      "database",
      "vector-store",
      "rag-runtime",
      "embedding",
      "external-provider",
      "deployment-runtime",
      "execution-runtime",
      "activation-runtime",
    ],
  };

export function getEvolutionCapabilityRuntimeMetadata(): EvolutionCapabilityMetadataRecord {
  return {
    ...PRODUCT_EVOLUTION_CAPABILITY_METADATA,
    excludes: [...PRODUCT_EVOLUTION_CAPABILITY_METADATA.excludes],
  };
}

export function isEvolutionCapabilityRuntimeMetadataIntact(
  metadata: EvolutionCapabilityMetadataRecord = PRODUCT_EVOLUTION_CAPABILITY_METADATA,
): boolean {
  return (
    metadata.capabilityRuntimeId ===
      "enterprise-product-evolution-capability-v1" &&
    metadata.version === "product-evolution-capability-1" &&
    metadata.freezeVersion === "product-evolution-capability-freeze-1" &&
    metadata.base === "enterprise-product-evolution-optimization-v1" &&
    metadata.module === "M15-P6" &&
    metadata.declarationOnly === true &&
    metadata.excludes.length === 8
  );
}

export function validateEvolutionCapabilitySpecInput(
  input: RegisterEvolutionCapabilitySpecInput,
): EvolutionCapabilitySpecValidationResult {
  const issues: EvolutionCapabilitySpecValidationResult["issues"] = [];
  const capabilityKey = input.capabilityKey?.trim() ?? "";
  const title = input.title?.trim() ?? "";
  const summary = input.summary?.trim() ?? "";

  if (!capabilityKey) {
    issues.push({ field: "capabilityKey", message: "required" });
  }
  if (!title) issues.push({ field: "title", message: "required" });
  if (!summary) issues.push({ field: "summary", message: "required" });
  if (!(EVOLUTION_CAPABILITY_SPEC_KINDS as readonly string[]).includes(input.kind)) {
    issues.push({ field: "kind", message: `invalid kind: ${input.kind}` });
  }
  if (
    !(EVOLUTION_CAPABILITY_DOMAIN_SCOPES as readonly string[]).includes(
      input.scope,
    )
  ) {
    issues.push({ field: "scope", message: `invalid scope: ${input.scope}` });
  }

  return { ok: issues.length === 0, issues };
}

export function validateEvolutionCapabilitySpec(
  capability: EvolutionCapabilitySpec,
): EvolutionCapabilitySpecValidationResult {
  const issues: EvolutionCapabilitySpecValidationResult["issues"] = [];
  if (!capability.id.trim()) issues.push({ field: "id", message: "required" });
  if (!capability.capabilityKey.trim()) {
    issues.push({ field: "capabilityKey", message: "required" });
  }
  if (
    !(EVOLUTION_CAPABILITY_SPEC_KINDS as readonly string[]).includes(capability.kind)
  ) {
    issues.push({
      field: "kind",
      message: `invalid kind: ${capability.kind}`,
    });
  }
  if (
    !(EVOLUTION_CAPABILITY_SPEC_STATUSES as readonly string[]).includes(
      capability.status,
    )
  ) {
    issues.push({
      field: "status",
      message: `invalid status: ${capability.status}`,
    });
  }
  if (
    !(EVOLUTION_CAPABILITY_DOMAIN_SCOPES as readonly string[]).includes(
      capability.scope,
    )
  ) {
    issues.push({
      field: "scope",
      message: `invalid scope: ${capability.scope}`,
    });
  }
  if (!capability.title.trim()) {
    issues.push({ field: "title", message: "required" });
  }
  if (!capability.summary.trim()) {
    issues.push({ field: "summary", message: "required" });
  }
  if (!capability.optimizationRef.trim()) {
    issues.push({ field: "optimizationRef", message: "required" });
  }
  return { ok: issues.length === 0, issues };
}
