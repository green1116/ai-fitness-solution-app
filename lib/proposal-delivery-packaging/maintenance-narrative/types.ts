import type { PROPOSAL_DELIVERY_PACKAGING_VERSION } from "../shared/types";

export const MAINTENANCE_NARRATIVE_RUNTIME_VERSION = "v19.5-maintenance-narrative-1" as const;

export interface MaintenanceNarrative {
  narrativeId: string;
  proposalLabel: string;
  bidderBrand: string;
  serviceCoverage: string;
  maintenanceFrequency: string;
  sparePartsProfile: string;
  supportReadiness: number;
  maintenanceReadiness: number;
}

export interface MaintenanceNarrativeRuntimePayload {
  version: typeof MAINTENANCE_NARRATIVE_RUNTIME_VERSION;
  packagingVersion: typeof PROPOSAL_DELIVERY_PACKAGING_VERSION;
  narrative: MaintenanceNarrative;
  maintenanceReadiness: number;
  summary: string;
}
