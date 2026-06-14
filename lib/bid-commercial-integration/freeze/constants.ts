import type { ProjectType } from "@/lib/procurement-intelligence/shared/types";

export const CANONICAL_COMMERCIAL_PROPOSAL_QUERY = {
  sku: "LF-T5-001",
  city: "Shanghai",
  quantity: 10,
  projectType: "commercial-gym" as const,
} satisfies {
  sku: string;
  city: string;
  quantity: number;
  projectType: ProjectType;
};

export const BID_COMMERCIAL_FROZEN_DOMAINS = [
  "bid-commercial-bundle",
  "commercial-proposal-sections",
  "commercial-proposal-pack",
  "commercial-proposal-validation",
  "commercial-proposal-reporting",
] as const;

export const BID_COMMERCIAL_FROZEN_SECTIONS = [
  "equipment-section",
  "supply-chain-section",
  "procurement-section",
  "delivery-section",
] as const;
