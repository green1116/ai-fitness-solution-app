import { findEvidenceByBrand } from "@/lib/evidence-intelligence-network";
import { PI_CANONICAL_ID } from "../shared/constants";
import type { SupplierCapabilityRecord } from "../shared/types";
import { buildSupplierRegistry } from "./supplier-registry";
import type { SupplierCapabilityRegistry } from "./supplier-types";

function resolveStrengthScore(baseScore: number, evidenceCount: number): number {
  return Math.min(100, Math.round(baseScore * 0.7 + Math.min(evidenceCount, 5) * 6));
}

let cachedCapabilityRegistry: SupplierCapabilityRegistry | undefined;

export function buildSupplierCapabilityRegistry(): SupplierCapabilityRegistry {
  if (cachedCapabilityRegistry) return cachedCapabilityRegistry;

  const suppliers = buildSupplierRegistry().records;
  const records: SupplierCapabilityRecord[] = [];

  for (const supplier of suppliers) {
    const primaryBrandId = supplier.brandIds[0];
    const evidenceIds = primaryBrandId
      ? findEvidenceByBrand(primaryBrandId).map((evidence) => evidence.evidenceId)
      : [];

    for (const capabilityTag of supplier.capabilityTags) {
      records.push({
        supplierId: supplier.id,
        capabilityTag,
        strengthScore: resolveStrengthScore(supplier.reliabilityScore, evidenceIds.length),
        evidenceIds,
      });
    }
  }

  cachedCapabilityRegistry = {
    registryId: "pi-supplier-capability-registry-v43-p1a",
    records,
    count: records.length,
    mode: PI_CANONICAL_ID,
  };

  return cachedCapabilityRegistry;
}
