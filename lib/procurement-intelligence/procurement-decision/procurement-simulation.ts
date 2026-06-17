import { PI_CANONICAL_ID } from "../shared/constants";
import { buildSupplierRegistry } from "../supplier-foundation/supplier-registry";
import type { ProcurementSimulationResult } from "./procurement-decision-types";
import { rankProcurementCandidatesForRequirement } from "./procurement-ranking";
import { buildProcurementMatches } from "../procurement-matching/procurement-match-builder";

export function simulateProcurementOutcome(
  requirementId: string,
  supplierId: string,
  productId: string,
): ProcurementSimulationResult | undefined {
  const matches = buildProcurementMatches(requirementId);
  const ranking = rankProcurementCandidatesForRequirement(requirementId, matches);
  if (!ranking || ranking.candidates.length === 0) return undefined;

  const baseline = ranking.candidates[0]!;
  const target = ranking.candidates.find(
    (candidate) => candidate.supplierId === supplierId && candidate.productId === productId,
  );
  if (!target) return undefined;

  const supplier = buildSupplierRegistry().records.find((record) => record.id === supplierId);
  const baselineSupplier = buildSupplierRegistry().records.find(
    (record) => record.id === baseline.supplierId,
  );

  const supplierDelta = target.totalScore - baseline.totalScore;
  const decisionDelta = target.decisionFitScore - baseline.decisionFitScore;
  const confidenceDelta = Math.round(
    (supplier?.reliabilityScore ?? 50) - (baselineSupplier?.reliabilityScore ?? 50),
  );

  return {
    simulationId: `pi-procurement-simulation-${requirementId}-${supplierId}`,
    requirementId,
    supplierId,
    productId,
    baselineSupplierId: baseline.supplierId,
    supplierDelta,
    decisionDelta,
    confidenceDelta,
    mode: PI_CANONICAL_ID,
  };
}
