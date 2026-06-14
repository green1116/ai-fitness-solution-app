export const TENDER_PROPOSAL_VERSION = "v36-tender-proposal-1" as const;
export const TENDER_PROPOSAL_TAG = "v36-tender-proposal-foundation" as const;

export type TenderProposalMode = "tender-proposal";

export type ProposalType =
  | "technical"
  | "commercial"
  | "construction"
  | "equipment"
  | "operation";

export type ProposalStatus =
  | "draft"
  | "generated"
  | "reviewed"
  | "approved"
  | "submitted"
  | "won"
  | "lost"
  | "archived";

export type IndustrySector =
  | "sports-flooring"
  | "running-track"
  | "artificial-turf"
  | "gym-equipment"
  | "sports-hall"
  | "fitness-center";

export interface ProposalScore {
  scoreId: string;
  proposalId: string;
  complianceScore: number;
  technicalScore: number;
  commercialScore: number;
  competitionScore: number;
  winningScore: number;
  totalProposalScore: number;
  mode: TenderProposalMode;
}

export interface ProposalSection {
  sectionId: string;
  sectionType:
    | "executive-summary"
    | "technical"
    | "commercial"
    | "construction"
    | "compliance";
  title: string;
  content: string;
  order: number;
  mode: TenderProposalMode;
}

export interface ProposalTemplate {
  templateId: string;
  proposalType: ProposalType;
  industrySector: IndustrySector;
  title: string;
  summary: string;
  sectionTypes: ProposalSection["sectionType"][];
  templateReady: boolean;
  mode: TenderProposalMode;
}

export interface ProposalEngineCompatibility {
  planPdfEngine: string;
  budgetPdfEngine: string;
  tenderPackageEngine: string;
  reqsigVerification: string;
}

export interface TenderProposal {
  proposalId: string;
  tenderId: string;
  buyerOrganizationId: string;
  proposalType: ProposalType;
  industrySector: IndustrySector;
  title: string;
  summary: string;
  proposalStatus: ProposalStatus;
  score: ProposalScore;
  templateId: string;
  sectionIds: string[];
  generatedAt: string;
  metadata: Record<string, string>;
  compatibility: ProposalEngineCompatibility;
  mode: TenderProposalMode;
}

export interface ProposalRegistry {
  registryId: string;
  proposals: TenderProposal[];
  proposalCount: number;
  typeBreakdown: Record<ProposalType, number>;
  statusBreakdown: Record<ProposalStatus, number>;
  sectorBreakdown: Record<IndustrySector, number>;
  registryReady: boolean;
  mode: TenderProposalMode;
}

export interface ProposalContext {
  contextId: string;
  proposals: TenderProposal[];
  proposalCount: number;
  typeBreakdown: Record<ProposalType, number>;
  statusBreakdown: Record<ProposalStatus, number>;
  sectorBreakdown: Record<IndustrySector, number>;
  averageScore: number;
  contextReady: boolean;
  mode: TenderProposalMode;
}

export interface ProposalQuery {
  buyerOrganizationId?: string;
  proposalType?: ProposalType;
  proposalStatus?: ProposalStatus;
  industrySector?: IndustrySector;
  minProposalScore?: number;
  limit?: number;
}

export interface ProposalQueryResult {
  queryId: string;
  query: ProposalQuery;
  proposals: TenderProposal[];
  hitCount: number;
  proposalReady: boolean;
}

export interface RegistryValidation {
  valid: boolean;
  count: number;
  summary: string;
}

export interface TenderProposalValidation {
  valid: boolean;
  proposalRegistry: RegistryValidation;
  proposalContext: RegistryValidation;
  proposalTemplate: RegistryValidation;
  proposalSection: RegistryValidation;
  proposalGenerator: RegistryValidation;
  proposalScoring: RegistryValidation;
  proposalQuery: RegistryValidation;
  engineCompatibility: RegistryValidation;
}

export const CANONICAL_TENDER_PROPOSAL_BUYER_ID = "ind-org-buyer-sh-gym" as const;

export const CANONICAL_PROPOSAL_QUERY: ProposalQuery = {
  buyerOrganizationId: CANONICAL_TENDER_PROPOSAL_BUYER_ID,
  proposalType: "equipment",
  limit: 5,
} as const;

export const TOP_PROPOSAL_SCORE_THRESHOLD = 78 as const;

export const SUBMITTED_PROPOSAL_STATUSES: ProposalStatus[] = ["submitted", "won", "lost"];

export const WINNING_PROPOSAL_STATUSES: ProposalStatus[] = ["won"];

export const PROPOSAL_TYPES: ProposalType[] = [
  "technical",
  "commercial",
  "construction",
  "equipment",
  "operation",
];

export const PROPOSAL_STATUSES: ProposalStatus[] = [
  "draft",
  "generated",
  "reviewed",
  "approved",
  "submitted",
  "won",
  "lost",
  "archived",
];

export const INDUSTRY_SECTORS: IndustrySector[] = [
  "sports-flooring",
  "running-track",
  "artificial-turf",
  "gym-equipment",
  "sports-hall",
  "fitness-center",
];
