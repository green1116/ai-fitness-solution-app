import { buildRequirementRegistryRecords } from "@/lib/requirement-intelligence";
import {
  buildRequirementProductEdges,
  runEquivalentDecisionEngine,
} from "@/lib/equivalent-product-intelligence";
import { PI_CANONICAL_ID } from "../shared/constants";
import type { ProcurementRequirementLink } from "./procurement-match-types";

let cachedLinks: ProcurementRequirementLink[] | undefined;

function buildLinkedRequirementIds(): string[] {
  const linked = new Set(
    buildRequirementProductEdges().map((edge) => edge.requirementId),
  );
  return buildRequirementRegistryRecords()
    .map((record) => record.requirementId)
    .filter((requirementId) => linked.has(requirementId));
}

export function buildProcurementRequirementLinks(): ProcurementRequirementLink[] {
  if (cachedLinks) return cachedLinks;

  const links: ProcurementRequirementLink[] = [];

  for (const requirementId of buildLinkedRequirementIds()) {
    const decision = runEquivalentDecisionEngine(requirementId);
    if (!decision) continue;

    links.push({
      linkId: `pi-req-decision-${requirementId}`,
      requirementId,
      decisionId: decision.decisionId,
      productId: decision.optimalProductId,
      decisionLevel: decision.decisionLevel,
      mode: PI_CANONICAL_ID,
    });
  }

  cachedLinks = links;
  return links;
}
