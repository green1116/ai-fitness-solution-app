import type { PROPOSAL_DELIVERY_PACKAGING_VERSION } from "../shared/types";

export const TCO_RUNTIME_VERSION = "v19.5-tco-runtime-1" as const;

export interface TCOProfile {
  profileId: string;
  proposalLabel: string;
  bidderBrand: string;
  acquisition: number;
  operation: number;
  maintenance: number;
  replacement: number;
  totalTCO: number;
  tcoReadiness: number;
}

export interface TCORuntimePayload {
  version: typeof TCO_RUNTIME_VERSION;
  packagingVersion: typeof PROPOSAL_DELIVERY_PACKAGING_VERSION;
  profile: TCOProfile;
  tcoReadiness: number;
  summary: string;
}
