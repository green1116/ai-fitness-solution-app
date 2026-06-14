import { buildProposalRegistryRecords } from "./proposal-registry";
import type { ProposalContext, RegistryValidation } from "./shared/types";

export function buildProposalContext(): ProposalContext {
  const proposals = buildProposalRegistryRecords();

  const typeBreakdown = proposals.reduce(
    (acc, proposal) => {
      acc[proposal.proposalType] = (acc[proposal.proposalType] ?? 0) + 1;
      return acc;
    },
    {} as ProposalContext["typeBreakdown"],
  );

  const statusBreakdown = proposals.reduce(
    (acc, proposal) => {
      acc[proposal.proposalStatus] = (acc[proposal.proposalStatus] ?? 0) + 1;
      return acc;
    },
    {} as ProposalContext["statusBreakdown"],
  );

  const sectorBreakdown = proposals.reduce(
    (acc, proposal) => {
      acc[proposal.industrySector] = (acc[proposal.industrySector] ?? 0) + 1;
      return acc;
    },
    {} as ProposalContext["sectorBreakdown"],
  );

  const averageScore =
    proposals.length === 0
      ? 0
      : Math.round(
          proposals.reduce((sum, proposal) => sum + proposal.score.totalProposalScore, 0) /
            proposals.length,
        );

  return {
    contextId: "tender-proposal-context-v36",
    proposals,
    proposalCount: proposals.length,
    typeBreakdown,
    statusBreakdown,
    sectorBreakdown,
    averageScore,
    contextReady: proposals.length >= 12,
    mode: "tender-proposal",
  };
}

export function validateProposalContext(): RegistryValidation {
  const context = buildProposalContext();
  const valid = context.contextReady && context.averageScore > 0 && context.proposalCount >= 12;

  return {
    valid,
    count: context.proposalCount,
    summary: `proposal-context count=${context.proposalCount} averageScore=${context.averageScore} valid=${valid}`,
  };
}
