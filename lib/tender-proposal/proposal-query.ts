import {
  buildProposalRegistryRecords,
  getProposalsByBuyer,
} from "./proposal-registry";
import type {
  ProposalQuery,
  ProposalQueryResult,
  RegistryValidation,
  TenderProposal,
} from "./shared/types";
import {
  CANONICAL_PROPOSAL_QUERY,
  CANONICAL_TENDER_PROPOSAL_BUYER_ID,
  SUBMITTED_PROPOSAL_STATUSES,
  TOP_PROPOSAL_SCORE_THRESHOLD,
  WINNING_PROPOSAL_STATUSES,
} from "./shared/types";

function applyProposalQuery(input: ProposalQuery, source: TenderProposal[]): TenderProposal[] {
  let proposals = [...source];

  if (input.buyerOrganizationId) {
    proposals = proposals.filter(
      (proposal) => proposal.buyerOrganizationId === input.buyerOrganizationId,
    );
  }

  if (input.proposalType) {
    proposals = proposals.filter((proposal) => proposal.proposalType === input.proposalType);
  }

  if (input.proposalStatus) {
    proposals = proposals.filter(
      (proposal) => proposal.proposalStatus === input.proposalStatus,
    );
  }

  if (input.industrySector) {
    proposals = proposals.filter(
      (proposal) => proposal.industrySector === input.industrySector,
    );
  }

  if (input.minProposalScore !== undefined) {
    proposals = proposals.filter(
      (proposal) => proposal.score.totalProposalScore >= input.minProposalScore!,
    );
  }

  if (input.limit !== undefined) {
    proposals = proposals.slice(0, input.limit);
  }

  return proposals;
}

function toQueryResult(query: ProposalQuery, proposals: TenderProposal[]): ProposalQueryResult {
  const queryParts = [
    query.buyerOrganizationId ?? "all-buyers",
    query.proposalType ?? "all-types",
    query.proposalStatus ?? "all-status",
    query.industrySector ?? "all-sectors",
    query.minProposalScore?.toString() ?? "no-min-score",
    query.limit?.toString() ?? "no-limit",
  ];

  return {
    queryId: `proposal-query-${queryParts.join("-")}`,
    query,
    proposals,
    hitCount: proposals.length,
    proposalReady: proposals.length > 0,
  };
}

export function findProposals(limit = 10): ProposalQueryResult {
  return toQueryResult({ limit }, applyProposalQuery({ limit }, buildProposalRegistryRecords()));
}

export function findSubmittedProposals(limit = 5): ProposalQueryResult {
  const proposals = buildProposalRegistryRecords()
    .filter((proposal) => SUBMITTED_PROPOSAL_STATUSES.includes(proposal.proposalStatus))
    .slice(0, limit);

  return toQueryResult({ proposalStatus: "submitted", limit }, proposals);
}

export function findWinningProposals(limit = 5): ProposalQueryResult {
  const proposals = buildProposalRegistryRecords()
    .filter((proposal) => WINNING_PROPOSAL_STATUSES.includes(proposal.proposalStatus))
    .slice(0, limit);

  return toQueryResult({ proposalStatus: "won", limit }, proposals);
}

export function findTopProposals(limit = 5): ProposalQueryResult {
  const proposals = [...buildProposalRegistryRecords()]
    .filter((proposal) => proposal.score.totalProposalScore >= TOP_PROPOSAL_SCORE_THRESHOLD)
    .sort((left, right) => right.score.totalProposalScore - left.score.totalProposalScore)
    .slice(0, limit);

  return toQueryResult({ minProposalScore: TOP_PROPOSAL_SCORE_THRESHOLD, limit }, proposals);
}

export function executeProposalQuery(query: ProposalQuery = {}): ProposalQueryResult {
  return toQueryResult(query, applyProposalQuery(query, buildProposalRegistryRecords()));
}

export function validateProposalQueryRegistry(): RegistryValidation {
  const canonical = executeProposalQuery(CANONICAL_PROPOSAL_QUERY);
  const all = findProposals(10);
  const submitted = findSubmittedProposals(5);
  const winning = findWinningProposals(5);
  const top = findTopProposals(5);
  const buyer = getProposalsByBuyer(CANONICAL_TENDER_PROPOSAL_BUYER_ID);

  const valid =
    canonical.proposalReady &&
    canonical.hitCount >= 1 &&
    all.hitCount >= 10 &&
    submitted.hitCount >= 1 &&
    winning.hitCount >= 1 &&
    top.hitCount >= 3 &&
    buyer.length >= 1 &&
    canonical.proposals.every(
      (proposal) =>
        proposal.score.complianceScore > 0 &&
        proposal.score.technicalScore > 0 &&
        proposal.score.commercialScore > 0 &&
        proposal.score.competitionScore > 0 &&
        proposal.score.winningScore > 0,
    );

  return {
    valid,
    count: canonical.hitCount,
    summary: `proposal-query canonical=${canonical.hitCount} submitted=${submitted.hitCount} winning=${winning.hitCount} top=${top.hitCount} valid=${valid}`,
  };
}
