import type { RealCatalogBundle } from "@/lib/real-catalog-foundation/bridge/catalog-bridge";
import type {
  LeadTimeIntelligenceEntry,
  ProcurementBundle,
  ProjectType,
} from "@/lib/procurement-intelligence/shared/types";
import type { SupplierNetworkBundle } from "@/lib/regional-supplier-foundation/shared/types";
import type { ProposalSection } from "../proposal-sections/types";

import type { CommercialProposalPack } from "../proposal-composer-integration/shared/types";

export const BID_COMMERCIAL_INTEGRATION_VERSION = "v23-bid-commercial-integration-4" as const;
export const BID_COMMERCIAL_INTEGRATION_TAG = "v23-bid-commercial-integration" as const;

export type { ProjectType };

export interface BidCommercialBundle {
  bundleId: string;
  sku: string;
  city: string;
  quantity: number;
  projectType: ProjectType;
  catalog: RealCatalogBundle | null;
  supplierNetwork: SupplierNetworkBundle;
  procurement: ProcurementBundle;
  finalPrice: number;
  savings: number;
  leadTime: LeadTimeIntelligenceEntry | undefined;
  readinessScore: number;
}

export interface BidCommercialBundleValidation {
  valid: boolean;
  catalogExists: boolean;
  supplierExists: boolean;
  inventoryExists: boolean;
  serviceExists: boolean;
  pricingExists: boolean;
  leadTimeExists: boolean;
}

export interface BidCommercialReport {
  version: typeof BID_COMMERCIAL_INTEGRATION_VERSION;
  reportId: string;
  bundleValidation: BidCommercialBundleValidation;
  exampleBundle: BidCommercialBundle | null;
  catalogReadiness: number;
  supplierReadiness: number;
  procurementReadiness: number;
  overallReadiness: number;
  summary: string;
  generatedAt: string;
}

export interface CommercialProposalSectionsValidation {
  valid: boolean;
  equipmentSectionExists: boolean;
  supplyChainSectionExists: boolean;
  procurementSectionExists: boolean;
  deliverySectionExists: boolean;
}

export interface CommercialProposalReadinessReport {
  version: typeof BID_COMMERCIAL_INTEGRATION_VERSION;
  reportId: string;
  bundleValidation: BidCommercialBundleValidation;
  sectionsValidation: CommercialProposalSectionsValidation;
  exampleSections: ProposalSection[];
  equipmentReadiness: number;
  supplyChainReadiness: number;
  procurementReadiness: number;
  deliveryReadiness: number;
  overallProposalReadiness: number;
  summary: string;
  generatedAt: string;
}

export interface CommercialCoverageStats {
  catalogCoverage: number;
  supplierCoverage: number;
  procurementCoverage: number;
  proposalSectionCoverage: number;
  proposalPackCoverage: number;
  commercialCoverageScore: number;
  upstreamCatalog: {
    brandCount: number;
    equipmentCount: number;
    pricingEntryCount: number;
  };
  upstreamSupplier: {
    supplierCount: number;
    dealerCount: number;
    coverageCount: number;
    inventoryCount: number;
    serviceCount: number;
  };
  upstreamProcurement: {
    channelPricingCount: number;
    projectPricingCount: number;
    discountRuleCount: number;
    leadTimeCount: number;
  };
}

export interface CommercialProposalFreezeValidation {
  valid: boolean;
  bundleValid: boolean;
  sectionsValid: boolean;
  packValid: boolean;
  tenderCompatible: boolean;
  validationScore: number;
}

export interface CommercialProposalReadiness {
  readinessScore: number;
  validationScore: number;
  commercialCoverageScore: number;
  integrationReadiness: number;
  equipmentReadiness: number;
  supplyChainReadiness: number;
  procurementReadiness: number;
  deliveryReadiness: number;
}

export interface CommercialProposalFreezeReport {
  version: typeof BID_COMMERCIAL_INTEGRATION_VERSION;
  tag: typeof BID_COMMERCIAL_INTEGRATION_TAG;
  reportId: string;
  status: "frozen";
  coverage: CommercialCoverageStats;
  validation: CommercialProposalFreezeValidation;
  readiness: CommercialProposalReadiness;
  examplePack: CommercialProposalPack | null;
  moduleStatistics: {
    frozenDomains: number;
    proposalSections: number;
    validationGates: number;
    reportBuilders: number;
    bridgeLayers: number;
  };
  canonicalQuery: {
    sku: string;
    city: string;
    quantity: number;
    projectType: ProjectType;
  };
  summary: string;
  generatedAt: string;
}

export interface CommercialProposalFreezeEvidence {
  evidenceId: string;
  version: typeof BID_COMMERCIAL_INTEGRATION_VERSION;
  tag: typeof BID_COMMERCIAL_INTEGRATION_TAG;
  freezeManifest: {
    packId: string;
    bundleId: string;
    frozenDomains: string[];
    canonicalQuery: {
      sku: string;
      city: string;
      quantity: number;
      projectType: ProjectType;
    };
  };
  coverage: CommercialCoverageStats;
  readiness: CommercialProposalReadiness;
  validationPassed: boolean;
  generatedAt: string;
  summary: string;
}
