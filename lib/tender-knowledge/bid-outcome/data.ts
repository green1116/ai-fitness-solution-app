import type { HistoricalBidOutcome } from "../shared/types";

export const BID_OUTCOME_ARCHIVE: HistoricalBidOutcome[] = [
  {
    outcomeId: "outcome-sh-gym-lf-won",
    tenderId: "tender-sh-commercial-gym-2025-001",
    proposalId: "proposal-sh-gym-lf-001",
    outcome: "won",
    winPrice: 980000,
    competitorCount: 4,
    marginPercent: 17,
    recordedAt: "2025-12-05",
    mode: "tender-knowledge",
  },
  {
    outcomeId: "outcome-bj-hotel-tg-lost",
    tenderId: "tender-bj-hotel-2025-002",
    proposalId: "proposal-bj-hotel-tg-001",
    outcome: "lost",
    winPrice: null,
    competitorCount: 5,
    marginPercent: null,
    recordedAt: "2025-11-10",
    mode: "tender-knowledge",
  },
  {
    outcomeId: "outcome-cd-community-sh-won",
    tenderId: "tender-cd-community-2025-003",
    proposalId: "proposal-cd-community-sh-001",
    outcome: "won",
    winPrice: 630000,
    competitorCount: 3,
    marginPercent: 14,
    recordedAt: "2025-10-01",
    mode: "tender-knowledge",
  },
  {
    outcomeId: "outcome-gz-campus-lf-lost",
    tenderId: "tender-gz-campus-2025-004",
    proposalId: "proposal-gz-campus-lf-001",
    outcome: "lost",
    winPrice: null,
    competitorCount: 6,
    marginPercent: null,
    recordedAt: "2025-09-20",
    mode: "tender-knowledge",
  },
  {
    outcomeId: "outcome-sh-enterprise-lf-won",
    tenderId: "tender-sh-enterprise-2025-005",
    proposalId: "proposal-sh-enterprise-lf-001",
    outcome: "won",
    winPrice: 792000,
    competitorCount: 3,
    marginPercent: 16,
    recordedAt: "2025-08-05",
    mode: "tender-knowledge",
  },
];

export function getAllHistoricalBidOutcomes(): HistoricalBidOutcome[] {
  return [...BID_OUTCOME_ARCHIVE];
}

export function getHistoricalBidOutcomeById(outcomeId: string): HistoricalBidOutcome | undefined {
  return BID_OUTCOME_ARCHIVE.find((o) => o.outcomeId === outcomeId);
}

export function getHistoricalBidOutcomesByTenderId(tenderId: string): HistoricalBidOutcome[] {
  return BID_OUTCOME_ARCHIVE.filter((o) => o.tenderId === tenderId);
}

export function getWonBidOutcomes(): HistoricalBidOutcome[] {
  return BID_OUTCOME_ARCHIVE.filter((o) => o.outcome === "won");
}
