/**
 * PI-5.1 — Canonical integration pipeline stages (PD-6.1 §2).
 * UI → API → Service → Domain → Persistence.
 */
export const INTEGRATION_PIPELINE_STAGES = [
  "UI",
  "API",
  "SERVICE",
  "DOMAIN",
  "PERSISTENCE",
] as const;

export type IntegrationPipelineStage =
  (typeof INTEGRATION_PIPELINE_STAGES)[number];

export type PipelineStageRecord = Readonly<{
  stageId: IntegrationPipelineStage;
  order: number;
  ownerSide: "frontend" | "backend" | "domain" | "data";
  role: string;
}>;

export const INTEGRATION_PIPELINE_CATALOGUE = [
  {
    stageId: "UI",
    order: 1,
    ownerSide: "frontend",
    role: "Screens / CMP / INT / Adapter presentation",
  },
  {
    stageId: "API",
    order: 2,
    ownerSide: "backend",
    role: "Existing HTTP API edge (PD-2.4 / PD-5.3)",
  },
  {
    stageId: "SERVICE",
    order: 3,
    ownerSide: "backend",
    role: "L4 Command/Query orchestration (≠ Domain)",
  },
  {
    stageId: "DOMAIN",
    order: 4,
    ownerSide: "domain",
    role: "M11–M15 business outcomes + authz",
  },
  {
    stageId: "PERSISTENCE",
    order: 5,
    ownerSide: "data",
    role: "L1 Domain persistence ports / existing stores",
  },
] as const satisfies readonly PipelineStageRecord[];
