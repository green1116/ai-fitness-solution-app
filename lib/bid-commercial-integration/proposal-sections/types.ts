export type ProposalSectionSource =
  | "v20-real-catalog"
  | "v21-supplier-network"
  | "v22-procurement-intelligence"
  | "v21-v22-delivery";

export interface ProposalSection {
  id: string;
  title: string;
  content: string;
  source: ProposalSectionSource;
  readinessScore: number;
}

export const PROPOSAL_SECTION_IDS = [
  "equipment-section",
  "supply-chain-section",
  "procurement-section",
  "delivery-section",
] as const;

export type ProposalSectionId = (typeof PROPOSAL_SECTION_IDS)[number];
