import type { Opportunity, PipelineStage } from "./types";

const SAMPLES: Array<{ accountName: string; stage: PipelineStage; value: number; probability: number }> = [
  { accountName: "某市体育局", stage: "proposal", value: 2_800_000, probability: 0.65 },
  { accountName: "某大学", stage: "negotiation", value: 1_500_000, probability: 0.78 },
  { accountName: "某酒店集团", stage: "discovery", value: 800_000, probability: 0.35 },
  { accountName: "某制造企业", stage: "won", value: 1_200_000, probability: 1.0 },
];

export function buildOpportunities(input?: { deploymentId?: string }): Opportunity[] {
  const deploymentId = input?.deploymentId ?? "opportunity-default";
  return SAMPLES.map((s, i) => ({
    opportunityId: `opp-${deploymentId}-${i + 1}`,
    pipelineStage: s.stage,
    estimatedValueCny: s.value,
    closeProbability: s.probability,
    accountName: s.accountName,
    mode: "readiness-stub" as const,
  }));
}
