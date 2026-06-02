import type { StrategicInitiative } from "./types";

const STATUS_WEIGHT: Record<StrategicInitiative["status"], number> = {
  planned: 15,
  active: 25,
  completed: 30,
};

export function buildDefaultStrategicInitiatives(): StrategicInitiative[] {
  return [
    {
      id: "init-runtime-hardening",
      name: "Runtime Hardening",
      objectiveId: "obj-platform-scale",
      status: "active",
    },
    {
      id: "init-governance-expansion",
      name: "Governance Expansion",
      objectiveId: "obj-governance-maturity",
      status: "active",
    },
    {
      id: "init-enterprise-rollout",
      name: "Enterprise Rollout",
      objectiveId: "obj-commercial-growth",
      status: "planned",
    },
    {
      id: "init-ops-intelligence",
      name: "Operations Intelligence",
      objectiveId: "obj-operational-excellence",
      status: "completed",
    },
    {
      id: "init-strategic-planning",
      name: "Strategic Planning Layer",
      objectiveId: "obj-governance-maturity",
      status: "active",
    },
  ];
}

export function computeInitiativeScore(initiatives: StrategicInitiative[]): number {
  if (initiatives.length === 0) return 0;
  const total = initiatives.reduce((sum, init) => sum + STATUS_WEIGHT[init.status], 0);
  const max = initiatives.length * STATUS_WEIGHT.completed;
  return Math.round((total / max) * 100);
}
