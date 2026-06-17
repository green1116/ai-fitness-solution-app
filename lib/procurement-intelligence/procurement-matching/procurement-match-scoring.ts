export interface ProcurementMatchScoreInput {
  capabilityFitScore: number;
  brandFitScore: number;
  decisionFitScore: number;
}

export interface ProcurementMatchScoreResult {
  matchScore: number;
  procurementFitScore: number;
  deliveryFitScore: number;
  priceFitScore: number;
  availabilityFitScore: number;
  evidenceFitScore: number;
  reasons: string[];
}

const DECISION_FIT: Record<string, number> = {
  substitute: 95,
  "conditional-substitute": 75,
  "no-substitute": 40,
  defer: 25,
};

export function calculateProcurementMatchScore(
  input: ProcurementMatchScoreInput,
): ProcurementMatchScoreResult {
  const capabilityFitScore = Math.max(0, Math.min(100, input.capabilityFitScore));
  const brandFitScore = Math.max(0, Math.min(100, input.brandFitScore));
  const decisionFitScore = Math.max(0, Math.min(100, input.decisionFitScore));

  const procurementFitScore = Math.round(
    capabilityFitScore * 0.4 + brandFitScore * 0.35 + decisionFitScore * 0.25,
  );
  const evidenceFitScore = Math.round(brandFitScore * 0.6 + capabilityFitScore * 0.4);
  const deliveryFitScore = Math.round(decisionFitScore * 0.7 + capabilityFitScore * 0.3);
  const priceFitScore = Math.round(decisionFitScore * 0.5 + brandFitScore * 0.5);
  const availabilityFitScore = Math.round(capabilityFitScore * 0.55 + decisionFitScore * 0.45);

  const matchScore = Math.min(
    100,
    Math.round(
      capabilityFitScore * 0.35 +
        brandFitScore * 0.3 +
        decisionFitScore * 0.35,
    ),
  );

  const reasons = [
    `capability-fit=${capabilityFitScore}`,
    `brand-fit=${brandFitScore}`,
    `decision-fit=${decisionFitScore}`,
    `match-score=${matchScore}`,
  ];

  return {
    matchScore,
    procurementFitScore,
    deliveryFitScore,
    priceFitScore,
    availabilityFitScore,
    evidenceFitScore,
    reasons,
  };
}

export function resolveDecisionFitScore(decisionLevel: string): number {
  return DECISION_FIT[decisionLevel] ?? 50;
}
