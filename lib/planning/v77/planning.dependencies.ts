/**
 * V77 P1 — Planning upstream dependencies (read-only)
 */
import {
  V76_COLLABORATION_FREEZE_VERSION,
  V76_COLLABORATION_SIGNOFF_VERSION,
} from "@/lib/collaboration/v76/signoff/signoff.types";
import {
  V75_AGENT_FREEZE_VERSION,
  V75_AGENT_SIGNOFF_VERSION,
} from "@/lib/agent/v75/signoff/signoff.types";

export type PlanningUpstreamDependency = {
  id: string;
  upstreamVersion: string;
  planningRef: string;
  required: boolean;
  description: string;
};

export const PLANNING_UPSTREAM_DEPENDENCIES: PlanningUpstreamDependency[] = [
  {
    id: "PLN-DEP-001",
    upstreamVersion: V76_COLLABORATION_FREEZE_VERSION,
    planningRef: "PLN-001",
    required: true,
    description: "V76 collaboration freeze baseline upstream lock",
  },
  {
    id: "PLN-DEP-002",
    upstreamVersion: V76_COLLABORATION_SIGNOFF_VERSION,
    planningRef: "PLN-008",
    required: true,
    description: "V76 collaboration sign-off upstream lock",
  },
  {
    id: "PLN-DEP-003",
    upstreamVersion: "v76-collaboration-inventory-1",
    planningRef: "PLN-001",
    required: true,
    description: "V76 P1 collaboration inventory upstream",
  },
  {
    id: "PLN-DEP-004",
    upstreamVersion: "v76-collaboration-compliance-catalog-1",
    planningRef: "PLN-007",
    required: true,
    description: "V76 P7 collaboration compliance upstream",
  },
  {
    id: "PLN-DEP-005",
    upstreamVersion: V75_AGENT_FREEZE_VERSION,
    planningRef: "PLN-001",
    required: true,
    description: "V75 agent freeze transitive upstream",
  },
  {
    id: "PLN-DEP-006",
    upstreamVersion: V75_AGENT_SIGNOFF_VERSION,
    planningRef: "PLN-008",
    required: true,
    description: "V75 agent sign-off transitive upstream",
  },
  {
    id: "PLN-DEP-007",
    upstreamVersion: "v74-decision-freeze-1",
    planningRef: "PLN-001",
    required: true,
    description: "V74 decision freeze transitive upstream",
  },
  {
    id: "PLN-DEP-008",
    upstreamVersion: "v77-planning-inventory-1",
    planningRef: "PLN-001",
    required: true,
    description: "V77 P1 planning inventory self-reference",
  },
];

export function isPlanningUpstreamAligned(): boolean {
  return (
    PLANNING_UPSTREAM_DEPENDENCIES.length >= 6 &&
    PLANNING_UPSTREAM_DEPENDENCIES.some(
      (d) => d.upstreamVersion === V76_COLLABORATION_FREEZE_VERSION,
    ) &&
    PLANNING_UPSTREAM_DEPENDENCIES.some(
      (d) => d.upstreamVersion === V76_COLLABORATION_SIGNOFF_VERSION,
    ) &&
    PLANNING_UPSTREAM_DEPENDENCIES.every((d) => d.upstreamVersion.length > 0)
  );
}

export function getPlanningDependencyById(
  id: string,
): PlanningUpstreamDependency | undefined {
  return PLANNING_UPSTREAM_DEPENDENCIES.find((d) => d.id === id);
}

export function getPlanningDependenciesByRef(planningRef: string): PlanningUpstreamDependency[] {
  return PLANNING_UPSTREAM_DEPENDENCIES.filter((d) => d.planningRef === planningRef);
}
