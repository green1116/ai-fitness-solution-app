import { buildTenderRegistryRecords } from "@/lib/tender-hub";
import { buildProposalFromTender } from "./proposal-generator";
import type {
  IndustrySector,
  ProposalStatus,
  ProposalType,
  ProposalRegistry,
  RegistryValidation,
  TenderProposal,
} from "./shared/types";
import {
  CANONICAL_TENDER_PROPOSAL_BUYER_ID,
  INDUSTRY_SECTORS,
  PROPOSAL_STATUSES,
  PROPOSAL_TYPES,
} from "./shared/types";

function countBy<T extends string>(items: T[]): Record<T, number> {
  return items.reduce(
    (acc, item) => {
      acc[item] = (acc[item] ?? 0) + 1;
      return acc;
    },
    {} as Record<T, number>,
  );
}

export function buildProposalRegistryRecords(): TenderProposal[] {
  const tenders = buildTenderRegistryRecords();
  return tenders.map((tender, index) => buildProposalFromTender(tender, undefined, index + 1));
}

export function buildProposalRegistry(): ProposalRegistry {
  const proposals = buildProposalRegistryRecords();
  const typeBreakdown = countBy(proposals.map((proposal) => proposal.proposalType));
  const statusBreakdown = countBy(proposals.map((proposal) => proposal.proposalStatus));
  const sectorBreakdown = countBy(proposals.map((proposal) => proposal.industrySector));

  return {
    registryId: "tender-proposal-registry-v36",
    proposals,
    proposalCount: proposals.length,
    typeBreakdown,
    statusBreakdown,
    sectorBreakdown,
    registryReady: proposals.length >= 12,
    mode: "tender-proposal",
  };
}

export function getProposalById(proposalId: string): TenderProposal | undefined {
  return buildProposalRegistryRecords().find((proposal) => proposal.proposalId === proposalId);
}

export function getProposalsByTender(tenderId: string): TenderProposal[] {
  return buildProposalRegistryRecords().filter((proposal) => proposal.tenderId === tenderId);
}

export function getProposalsByBuyer(buyerOrganizationId: string): TenderProposal[] {
  return buildProposalRegistryRecords().filter(
    (proposal) => proposal.buyerOrganizationId === buyerOrganizationId,
  );
}

export function validateProposalRegistry(): RegistryValidation {
  const proposals = buildProposalRegistryRecords();
  const requiredTypes = PROPOSAL_TYPES;
  const requiredStatuses = PROPOSAL_STATUSES;
  const requiredSectors = INDUSTRY_SECTORS;

  const typeCoverage = requiredTypes.every((type) =>
    proposals.some((proposal) => proposal.proposalType === type),
  );
  const statusCoverage = requiredStatuses.every((status) =>
    proposals.some((proposal) => proposal.proposalStatus === status),
  );
  const sectorCoverage = requiredSectors.every((sector) =>
    proposals.some((proposal) => proposal.industrySector === sector),
  );

  const scoreValid = proposals.every(
    (proposal) =>
      proposal.score.complianceScore > 0 &&
      proposal.score.technicalScore > 0 &&
      proposal.score.commercialScore > 0 &&
      proposal.score.competitionScore > 0 &&
      proposal.score.winningScore > 0 &&
      proposal.score.totalProposalScore > 0,
  );

  const compatibilityValid = proposals.every(
    (proposal) =>
      proposal.compatibility.planPdfEngine.length > 0 &&
      proposal.compatibility.budgetPdfEngine.length > 0 &&
      proposal.compatibility.tenderPackageEngine.length > 0 &&
      proposal.compatibility.reqsigVerification === "REQSIG",
  );

  const canonical = getProposalsByBuyer(CANONICAL_TENDER_PROPOSAL_BUYER_ID);

  const valid =
    proposals.length >= 12 &&
    typeCoverage &&
    statusCoverage &&
    sectorCoverage &&
    scoreValid &&
    compatibilityValid &&
    canonical.length >= 1;

  return {
    valid,
    count: proposals.length,
    summary: `proposal-registry count=${proposals.length} types=${requiredTypes.filter((t) => proposals.some((p) => p.proposalType === t)).length}/5 statuses=${requiredStatuses.filter((s) => proposals.some((p) => p.proposalStatus === s)).length}/8 sectors=${requiredSectors.filter((s) => proposals.some((p) => p.industrySector === s)).length}/6 valid=${valid}`,
  };
}

export type { ProposalType, ProposalStatus, IndustrySector };
