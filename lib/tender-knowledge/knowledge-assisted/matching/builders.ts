import { getAllHistoricalBidOutcomes } from "../../bid-outcome";
import { getAllHistoricalProposals } from "../../proposal-archive";
import { getHistoricalTenderById } from "../../project-archive";
import type {
  SimilarHistoricalProject,
  SimilarProjectMatchDimensions,
  SimilarProjectMatchInput,
} from "../../shared/types";

const DEFAULT_QUANTITY_RANGE_PERCENT = 0.3;

function buildMatchDimensions(
  input: SimilarProjectMatchInput,
  tenderCity: string,
  tenderIndustry: SimilarProjectMatchInput["projectType"],
  proposalSku: string,
  proposalQuantity: number,
  quantityMin: number,
  quantityMax: number,
): SimilarProjectMatchDimensions {
  return {
    industry: tenderIndustry === input.projectType,
    city: tenderCity === input.city,
    sku: proposalSku === input.sku,
    projectType: tenderIndustry === input.projectType,
    quantityRange: proposalQuantity >= quantityMin && proposalQuantity <= quantityMax,
  };
}

function countMatchedDimensions(dimensions: SimilarProjectMatchDimensions): number {
  return Object.values(dimensions).filter(Boolean).length;
}

export function findSimilarHistoricalProjects(
  input: SimilarProjectMatchInput,
): SimilarHistoricalProject[] {
  const rangePercent = input.quantityRangePercent ?? DEFAULT_QUANTITY_RANGE_PERCENT;
  const quantityMin = Math.floor(input.quantity * (1 - rangePercent));
  const quantityMax = Math.ceil(input.quantity * (1 + rangePercent));
  const outcomesByProposalId = new Map(
    getAllHistoricalBidOutcomes().map((outcome) => [outcome.proposalId, outcome]),
  );

  const matches: SimilarHistoricalProject[] = [];

  for (const proposal of getAllHistoricalProposals()) {
    const tender = getHistoricalTenderById(proposal.tenderId);
    if (!tender) continue;

    const matchedDimensions = buildMatchDimensions(
      input,
      tender.city,
      tender.industry,
      proposal.sku,
      proposal.quantity,
      quantityMin,
      quantityMax,
    );
    const matchScore = countMatchedDimensions(matchedDimensions);

    if (matchScore < 2) continue;

    matches.push({
      tender,
      proposal,
      outcome: outcomesByProposalId.get(proposal.proposalId) ?? null,
      matchScore,
      matchedDimensions,
    });
  }

  return matches.sort((a, b) => b.matchScore - a.matchScore);
}
