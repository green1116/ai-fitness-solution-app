import type { CustomerJourneyStage, CustomerJourneyStageKind } from "./types";

const STAGE_DEFINITIONS: readonly Omit<CustomerJourneyStage, "id">[] = [
  {
    kind: "lead",
    order: 1,
    label: "Lead",
    description: "Initial inbound or outbound lead captured for AI Fitness Solution.",
    terminal: false,
  },
  {
    kind: "qualified-lead",
    order: 2,
    label: "Qualified Lead",
    description: "Lead validated against ICP fit, budget, and timeline criteria.",
    terminal: false,
  },
  {
    kind: "demo-requested",
    order: 3,
    label: "Demo Requested",
    description: "Prospect requested a product demonstration.",
    terminal: false,
  },
  {
    kind: "proposal-generated",
    order: 4,
    label: "Proposal Generated",
    description: "Commercial proposal or fitness solution plan generated for the prospect.",
    terminal: false,
  },
  {
    kind: "trial-started",
    order: 5,
    label: "Trial Started",
    description: "Prospect began a product trial or pilot engagement.",
    terminal: false,
  },
  {
    kind: "evaluation",
    order: 6,
    label: "Evaluation",
    description: "Prospect evaluating solution fit, ROI, and stakeholder alignment.",
    terminal: false,
  },
  {
    kind: "commercial-negotiation",
    order: 7,
    label: "Commercial Negotiation",
    description: "Active pricing, contract, and entitlement negotiation.",
    terminal: false,
  },
  {
    kind: "won",
    order: 8,
    label: "Won",
    description: "Deal closed successfully; customer converted.",
    terminal: true,
  },
  {
    kind: "lost",
    order: 9,
    label: "Lost",
    description: "Deal lost; prospect did not convert.",
    terminal: true,
  },
];

export function buildJourneyStages(): CustomerJourneyStage[] {
  return STAGE_DEFINITIONS.map((stage) => ({
    id: `stage-${stage.kind}`,
    ...stage,
  }));
}

export function getStageByKind(kind: CustomerJourneyStageKind): CustomerJourneyStage {
  const stage = buildJourneyStages().find((s) => s.kind === kind);
  if (!stage) {
    throw new Error(`Unknown journey stage: ${kind}`);
  }
  return stage;
}

export function getMainFunnelStages(): CustomerJourneyStage[] {
  return buildJourneyStages().filter((s) => !s.terminal || s.kind === "won" || s.kind === "lost");
}

export function getLinearFunnelStages(): CustomerJourneyStage[] {
  return buildJourneyStages()
    .filter((s) => s.kind !== "won" && s.kind !== "lost")
    .sort((a, b) => a.order - b.order);
}
