import type { HistoricalProposal } from "../shared/types";

export const PROPOSAL_ARCHIVE: HistoricalProposal[] = [
  {
    proposalId: "proposal-sh-gym-lf-001",
    tenderId: "tender-sh-commercial-gym-2025-001",
    sku: "LF-T5-001",
    brand: "Life Fitness",
    quantity: 10,
    finalPrice: 98000,
    proposalScore: 85,
    winProbability: 82,
    strategyType: "high-confidence",
    submittedAt: "2025-11-20",
    mode: "tender-knowledge",
  },
  {
    proposalId: "proposal-bj-hotel-tg-001",
    tenderId: "tender-bj-hotel-2025-002",
    sku: "TG-SKILLRUN-001",
    brand: "Technogym",
    quantity: 6,
    finalPrice: 245000,
    proposalScore: 78,
    winProbability: 68,
    strategyType: "balanced",
    submittedAt: "2025-10-28",
    mode: "tender-knowledge",
  },
  {
    proposalId: "proposal-cd-community-sh-001",
    tenderId: "tender-cd-community-2025-003",
    sku: "SH-T8000-001",
    brand: "Shuhua",
    quantity: 15,
    finalPrice: 42000,
    proposalScore: 82,
    winProbability: 79,
    strategyType: "high-confidence",
    submittedAt: "2025-09-15",
    mode: "tender-knowledge",
  },
  {
    proposalId: "proposal-gz-campus-lf-001",
    tenderId: "tender-gz-campus-2025-004",
    sku: "LF-SYNRGY360-001",
    brand: "Life Fitness",
    quantity: 4,
    finalPrice: 185000,
    proposalScore: 80,
    winProbability: 74,
    strategyType: "balanced",
    submittedAt: "2025-08-30",
    mode: "tender-knowledge",
  },
  {
    proposalId: "proposal-sh-enterprise-lf-001",
    tenderId: "tender-sh-enterprise-2025-005",
    sku: "LF-T5-001",
    brand: "Life Fitness",
    quantity: 8,
    finalPrice: 99000,
    proposalScore: 83,
    winProbability: 76,
    strategyType: "balanced",
    submittedAt: "2025-07-18",
    mode: "tender-knowledge",
  },
];

export function getAllHistoricalProposals(): HistoricalProposal[] {
  return [...PROPOSAL_ARCHIVE];
}

export function getHistoricalProposalById(proposalId: string): HistoricalProposal | undefined {
  return PROPOSAL_ARCHIVE.find((p) => p.proposalId === proposalId);
}

export function getHistoricalProposalsByTenderId(tenderId: string): HistoricalProposal[] {
  return PROPOSAL_ARCHIVE.filter((p) => p.tenderId === tenderId);
}
