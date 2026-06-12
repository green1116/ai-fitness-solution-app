import type { BIDDER_INTELLIGENCE_VERSION, ReadinessStubMode } from "../shared/types";

export const BIDDER_PROFILE_RUNTIME_VERSION = "v19.0-bidder-profile-1" as const;

export const COMPANY_SCALES = ["startup", "growth", "enterprise", "national"] as const;
export type CompanyScale = (typeof COMPANY_SCALES)[number];

export interface CompanyProfile {
  companyId: string;
  legalName: string;
  displayName: string;
  foundedYear: number;
  headquarters: string;
  industry: string;
  mode: ReadinessStubMode;
}

export interface CompanyPositioning {
  positioningId: string;
  tagline: string;
  primaryMarket: string;
  differentiator: string;
  competitiveFocus: string;
}

export interface Certification {
  certificationId: string;
  name: string;
  issuer: string;
  validUntil: string;
  status: "active" | "expiring" | "expired";
}

export interface DeliveryCapability {
  capabilityId: string;
  region: string;
  maxConcurrentProjects: number;
  avgDeliveryDays: number;
  onTimeRate: number;
}

export interface BidderProfileSnapshot {
  profile: CompanyProfile;
  positioning: CompanyPositioning;
  scale: CompanyScale;
  employeeCount: number;
  annualRevenueTier: string;
  certifications: Certification[];
  deliveryCapabilities: DeliveryCapability[];
  profileReadiness: number;
}

export interface BidderProfileRuntimePayload {
  version: typeof BIDDER_PROFILE_RUNTIME_VERSION;
  bidderIntelligenceVersion: typeof BIDDER_INTELLIGENCE_VERSION;
  snapshot: BidderProfileSnapshot;
  profileReadiness: number;
  summary: string;
}
