export const STRATEGIC_PLANNING_RUNTIME_VERSION = "phase-xii-v1" as const;

export type StrategicPriority = "low" | "medium" | "high";

export interface StrategicObjective {
  id: string;
  name: string;
  description: string;
  priority: StrategicPriority;
}

export type PlanningHorizonKind = "short-term" | "mid-term" | "long-term";

export interface PlanningHorizon {
  kind: PlanningHorizonKind;
  label: string;
  months: number;
}
