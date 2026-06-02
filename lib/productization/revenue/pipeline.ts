import type { PipelineStage, PipelineStageKind, RevenueOpportunity } from "./types";

const STAGE_DEFINITIONS: readonly Omit<PipelineStage, "stageId">[] = [
  { kind: "lead", label: "Lead", order: 1 },
  { kind: "qualified", label: "Qualified", order: 2 },
  { kind: "proposal", label: "Proposal", order: 3 },
  { kind: "trial", label: "Trial", order: 4 },
  { kind: "negotiation", label: "Negotiation", order: 5 },
  { kind: "won", label: "Won", order: 6 },
  { kind: "lost", label: "Lost", order: 7 },
];

const OPPORTUNITY_DEFINITIONS: readonly Omit<RevenueOpportunity, "opportunityId">[] = [
  {
    name: "Metro Fitness Campus",
    stage: "negotiation",
    value: 480000,
    probability: 70,
    expectedCloseAt: "2026-07-15",
  },
  {
    name: "Regional Wellness Group",
    stage: "trial",
    value: 320000,
    probability: 55,
    expectedCloseAt: "2026-08-01",
  },
  {
    name: "Enterprise HQ Rollout",
    stage: "won",
    value: 1200000,
    probability: 100,
    expectedCloseAt: "2026-06-01",
  },
  {
    name: "Small Office Pilot",
    stage: "lost",
    value: 85000,
    probability: 0,
    expectedCloseAt: "2026-05-20",
  },
  {
    name: "National Chain Expansion",
    stage: "proposal",
    value: 960000,
    probability: 40,
    expectedCloseAt: "2026-09-10",
  },
];

export function buildPipelineStages(): PipelineStage[] {
  return STAGE_DEFINITIONS.map((stage) => ({
    stageId: `stage-${stage.kind}`,
    ...stage,
  }));
}

export function buildPipeline(input?: { deploymentId?: string }): RevenueOpportunity[] {
  const deploymentId = input?.deploymentId ?? "revenue-operations-default";
  return OPPORTUNITY_DEFINITIONS.map((opp, index) => ({
    opportunityId: `opp-${deploymentId}-${index + 1}`,
    ...opp,
  }));
}

export function getOpportunitiesByStage(stage: PipelineStageKind): RevenueOpportunity[] {
  return buildPipeline().filter((o) => o.stage === stage);
}
