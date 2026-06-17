import type { EquivalentDecision } from "@/lib/equivalent-product-intelligence";
import type { PI_CANONICAL_ID } from "../shared/constants";
import type { ProcurementMatchRecord, SupplierCapabilityRecord } from "../shared/types";
import type { SupplierRegistryRecord } from "../supplier-foundation/supplier-types";

export type { ProcurementMatchRecord };

export interface ProcurementRequirementLink {
  linkId: string;
  requirementId: string;
  decisionId: string;
  productId: string;
  decisionLevel: string;
  mode: typeof PI_CANONICAL_ID;
}

export type ProcurementSupplierLinkType = "supplier-product" | "supplier-capability";

export interface ProcurementSupplierLink {
  linkId: string;
  supplierId: string;
  productId?: string;
  capabilityTag?: string;
  brandId?: string;
  linkType: ProcurementSupplierLinkType;
  mode: typeof PI_CANONICAL_ID;
}

export interface ProcurementMatchContext {
  contextId: string;
  requirementLinks: ProcurementRequirementLink[];
  supplierLinks: ProcurementSupplierLink[];
  requirements: string[];
  decisions: EquivalentDecision[];
  suppliers: SupplierRegistryRecord[];
  capabilities: SupplierCapabilityRecord[];
  mode: typeof PI_CANONICAL_ID;
}

export interface ProcurementMatchingValidation {
  valid: boolean;
  requirementLinksReady: boolean;
  supplierLinksReady: boolean;
  matchContextReady: boolean;
  requirementLinkCount: number;
  supplierLinkCount: number;
  matchCount: number;
  summary: string;
}
