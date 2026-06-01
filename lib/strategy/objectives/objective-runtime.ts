import type { PlanningHorizon, StrategicObjective } from "./types";

const PRIORITY_WEIGHT: Record<StrategicObjective["priority"], number> = {
  low: 10,
  medium: 20,
  high: 30,
};

export function buildDefaultStrategicObjectives(): StrategicObjective[] {
  return [
    {
      id: "obj-platform-scale",
      name: "Platform Scale",
      description: "Expand enterprise runtime capacity and reliability.",
      priority: "high",
    },
    {
      id: "obj-governance-maturity",
      name: "Governance Maturity",
      description: "Deepen governance, trust, and compliance alignment.",
      priority: "high",
    },
    {
      id: "obj-commercial-growth",
      name: "Commercial Growth",
      description: "Accelerate commercialization and enterprise adoption.",
      priority: "medium",
    },
    {
      id: "obj-operational-excellence",
      name: "Operational Excellence",
      description: "Improve operational intelligence and autonomous execution.",
      priority: "medium",
    },
  ];
}

export function buildPlanningHorizons(): PlanningHorizon[] {
  return [
    { kind: "short-term", label: "Short Term", months: 6 },
    { kind: "mid-term", label: "Mid Term", months: 18 },
    { kind: "long-term", label: "Long Term", months: 36 },
  ];
}

export function computeObjectiveScore(objectives: StrategicObjective[]): number {
  if (objectives.length === 0) return 0;
  const total = objectives.reduce((sum, obj) => sum + PRIORITY_WEIGHT[obj.priority], 0);
  const max = objectives.length * PRIORITY_WEIGHT.high;
  return Math.round((total / max) * 100);
}
