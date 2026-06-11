import type { BIDDER_INTELLIGENCE_VERSION, ReadinessStubMode } from "../shared/types";

export const SUPPLIER_CAPABILITY_RUNTIME_VERSION = "v19.0-supplier-capability-1" as const;

export interface ServiceCoverage {
  coverageId: string;
  serviceType: string;
  regions: string[];
  responseHours: number;
  availability: "24x7" | "business-hours" | "on-call";
}

export interface DeliveryCoverage {
  coverageId: string;
  region: string;
  maxDistanceKm: number;
  avgLeadTimeDays: number;
  logisticsPartners: string[];
}

export interface InstallationCapability {
  capabilityId: string;
  teamSize: number;
  certifications: string[];
  maxDailyInstalls: number;
  complexSiteReady: boolean;
}

export interface SupportCapability {
  capabilityId: string;
  supportTier: "basic" | "standard" | "premium";
  slaResponseHours: number;
  remoteDiagnostics: boolean;
  onSiteSupport: boolean;
}

export interface SupplierCapabilitySnapshot {
  snapshotId: string;
  serviceCoverage: ServiceCoverage[];
  deliveryCoverage: DeliveryCoverage[];
  installationCapability: InstallationCapability;
  supportCapability: SupportCapability;
  supplierReadiness: number;
}

export interface SupplierCapabilityRuntimePayload {
  version: typeof SUPPLIER_CAPABILITY_RUNTIME_VERSION;
  bidderIntelligenceVersion: typeof BIDDER_INTELLIGENCE_VERSION;
  snapshot: SupplierCapabilitySnapshot;
  supplierReadiness: number;
  summary: string;
}
