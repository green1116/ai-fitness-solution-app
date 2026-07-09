/**
 * V78 P1 — Execution upstream dependencies (read-only)
 */
import {
  V76_COLLABORATION_FREEZE_VERSION,
  V76_COLLABORATION_SIGNOFF_VERSION,
} from "@/lib/collaboration/v76/signoff/signoff.types";
import {
  V77_PLANNING_FREEZE_VERSION,
  V77_PLANNING_SIGNOFF_VERSION,
} from "@/lib/planning/v77/signoff/signoff.types";

export type ExecutionUpstreamDependency = {
  id: string;
  upstreamVersion: string;
  executionRef: string;
  required: boolean;
  description: string;
};

export const EXECUTION_UPSTREAM_DEPENDENCIES: ExecutionUpstreamDependency[] = [
  {
    id: "EXE-DEP-001",
    upstreamVersion: V77_PLANNING_FREEZE_VERSION,
    executionRef: "EXE-001",
    required: true,
    description: "V77 planning freeze baseline upstream lock",
  },
  {
    id: "EXE-DEP-002",
    upstreamVersion: V77_PLANNING_SIGNOFF_VERSION,
    executionRef: "EXE-008",
    required: true,
    description: "V77 planning sign-off upstream lock",
  },
  {
    id: "EXE-DEP-003",
    upstreamVersion: "v77-planning-inventory-1",
    executionRef: "EXE-001",
    required: true,
    description: "V77 P1 planning inventory upstream",
  },
  {
    id: "EXE-DEP-004",
    upstreamVersion: "v77-planning-compliance-catalog-1",
    executionRef: "EXE-007",
    required: true,
    description: "V77 P7 planning compliance upstream",
  },
  {
    id: "EXE-DEP-005",
    upstreamVersion: V76_COLLABORATION_FREEZE_VERSION,
    executionRef: "EXE-001",
    required: true,
    description: "V76 collaboration freeze transitive upstream",
  },
  {
    id: "EXE-DEP-006",
    upstreamVersion: V76_COLLABORATION_SIGNOFF_VERSION,
    executionRef: "EXE-008",
    required: true,
    description: "V76 collaboration sign-off transitive upstream",
  },
  {
    id: "EXE-DEP-007",
    upstreamVersion: "v75-agent-freeze-1",
    executionRef: "EXE-001",
    required: true,
    description: "V75 agent freeze transitive upstream",
  },
  {
    id: "EXE-DEP-008",
    upstreamVersion: "v78-execution-inventory-1",
    executionRef: "EXE-001",
    required: true,
    description: "V78 P1 execution inventory self-reference",
  },
];

export function isExecutionUpstreamAligned(): boolean {
  return (
    EXECUTION_UPSTREAM_DEPENDENCIES.length >= 6 &&
    EXECUTION_UPSTREAM_DEPENDENCIES.some(
      (d) => d.upstreamVersion === V77_PLANNING_FREEZE_VERSION,
    ) &&
    EXECUTION_UPSTREAM_DEPENDENCIES.some(
      (d) => d.upstreamVersion === V77_PLANNING_SIGNOFF_VERSION,
    ) &&
    EXECUTION_UPSTREAM_DEPENDENCIES.every((d) => d.upstreamVersion.length > 0)
  );
}

export function getExecutionDependencyById(
  id: string,
): ExecutionUpstreamDependency | undefined {
  return EXECUTION_UPSTREAM_DEPENDENCIES.find((d) => d.id === id);
}

export function getExecutionDependenciesByRef(executionRef: string): ExecutionUpstreamDependency[] {
  return EXECUTION_UPSTREAM_DEPENDENCIES.filter((d) => d.executionRef === executionRef);
}
