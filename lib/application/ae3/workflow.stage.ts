/**
 * AE-3 — Declarative application workflow stages.
 * Stage catalogue only — not business process / UI / deployment steps.
 */

export const AE3_WORKFLOW_STAGE_IDS = [
  "REGISTER",
  "COMPOSE",
  "BIND",
  "ACTIVATE",
  "IDLE",
  "HOLD",
  "CLOSE",
] as const;

export type Ae3WorkflowStageId = (typeof AE3_WORKFLOW_STAGE_IDS)[number];

export type Ae3WorkflowStage = Readonly<{
  stageId: Ae3WorkflowStageId;
  order: number;
  notes: string;
}>;

/**
 * Closed workflow stages — application assembly progression labels.
 */
export const AE3_WORKFLOW_STAGES = [
  {
    stageId: "REGISTER",
    order: 1,
    notes: "Surfaces registered (AE-1 registry)",
  },
  {
    stageId: "COMPOSE",
    order: 2,
    notes: "Composition slots declared (AE-1)",
  },
  {
    stageId: "BIND",
    order: 3,
    notes: "Runtime context bound (AE-2)",
  },
  {
    stageId: "ACTIVATE",
    order: 4,
    notes: "Runtime plan ready (AE-2)",
  },
  {
    stageId: "IDLE",
    order: 5,
    notes: "Workflow catalogue idle — awaiting later layers",
  },
  {
    stageId: "HOLD",
    order: 6,
    notes: "Policy hold — no progression",
  },
  {
    stageId: "CLOSE",
    order: 7,
    notes: "Terminal catalogue stage",
  },
] as const satisfies readonly Ae3WorkflowStage[];

export const AE3_INITIAL_STAGE = "REGISTER" as const;

export const AE3_DEFAULT_STAGE = "BIND" as const;

export function getAe3WorkflowStage(
  stageId: Ae3WorkflowStageId,
): Ae3WorkflowStage | undefined {
  return AE3_WORKFLOW_STAGES.find((s) => s.stageId === stageId);
}

export const AE3_STAGE_CHAIN = AE3_WORKFLOW_STAGE_IDS.join("→");
