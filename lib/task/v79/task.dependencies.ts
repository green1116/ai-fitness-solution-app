/**
 * V79 P1 — Task upstream dependencies (read-only)
 */
import {
  V78_EXECUTION_FREEZE_VERSION,
  V78_EXECUTION_SIGNOFF_VERSION,
} from "@/lib/execution/v78/signoff/signoff.types";
import {
  V77_PLANNING_FREEZE_VERSION,
  V77_PLANNING_SIGNOFF_VERSION,
} from "@/lib/planning/v77/signoff/signoff.types";

export type TaskUpstreamDependency = {
  id: string;
  upstreamVersion: string;
  taskRef: string;
  required: boolean;
  description: string;
};

export const TASK_UPSTREAM_DEPENDENCIES: TaskUpstreamDependency[] = [
  {
    id: "TSK-DEP-001",
    upstreamVersion: V78_EXECUTION_FREEZE_VERSION,
    taskRef: "TSK-001",
    required: true,
    description: "V78 execution freeze baseline upstream lock",
  },
  {
    id: "TSK-DEP-002",
    upstreamVersion: V78_EXECUTION_SIGNOFF_VERSION,
    taskRef: "TSK-008",
    required: true,
    description: "V78 execution sign-off upstream lock",
  },
  {
    id: "TSK-DEP-003",
    upstreamVersion: "v78-execution-inventory-1",
    taskRef: "TSK-001",
    required: true,
    description: "V78 P1 execution inventory upstream",
  },
  {
    id: "TSK-DEP-004",
    upstreamVersion: "v78-execution-compliance-catalog-1",
    taskRef: "TSK-007",
    required: true,
    description: "V78 P7 execution compliance upstream",
  },
  {
    id: "TSK-DEP-005",
    upstreamVersion: V77_PLANNING_FREEZE_VERSION,
    taskRef: "TSK-001",
    required: true,
    description: "V77 planning freeze transitive upstream",
  },
  {
    id: "TSK-DEP-006",
    upstreamVersion: V77_PLANNING_SIGNOFF_VERSION,
    taskRef: "TSK-008",
    required: true,
    description: "V77 planning sign-off transitive upstream",
  },
  {
    id: "TSK-DEP-007",
    upstreamVersion: "v76-collaboration-freeze-1",
    taskRef: "TSK-001",
    required: true,
    description: "V76 collaboration freeze transitive upstream",
  },
  {
    id: "TSK-DEP-008",
    upstreamVersion: "v79-task-inventory-1",
    taskRef: "TSK-001",
    required: true,
    description: "V79 P1 task inventory self-reference",
  },
];

export function isTaskUpstreamAligned(): boolean {
  return (
    TASK_UPSTREAM_DEPENDENCIES.length >= 6 &&
    TASK_UPSTREAM_DEPENDENCIES.some(
      (d) => d.upstreamVersion === V78_EXECUTION_FREEZE_VERSION,
    ) &&
    TASK_UPSTREAM_DEPENDENCIES.some(
      (d) => d.upstreamVersion === V78_EXECUTION_SIGNOFF_VERSION,
    ) &&
    TASK_UPSTREAM_DEPENDENCIES.every((d) => d.upstreamVersion.length > 0)
  );
}

export function getTaskDependencyById(id: string): TaskUpstreamDependency | undefined {
  return TASK_UPSTREAM_DEPENDENCIES.find((d) => d.id === id);
}

export function getTaskDependenciesByRef(taskRef: string): TaskUpstreamDependency[] {
  return TASK_UPSTREAM_DEPENDENCIES.filter((d) => d.taskRef === taskRef);
}
