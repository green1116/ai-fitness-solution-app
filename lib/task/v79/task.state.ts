/**
 * V79 P1 — Task state catalog (declarative)
 */
import type { TaskState, TaskStateKind, TaskStateManifest } from "./task.types";
import { V79_TASK_VERSION } from "./task.types";

const REQUIRED_STATE_KINDS: TaskStateKind[] = [
  "draft",
  "pending",
  "queued",
  "active",
  "blocked",
  "completed",
  "cancelled",
  "frozen",
];

export const TASK_STATE_CATALOG: TaskState[] = [
  {
    id: "TSK-STA-001",
    name: "draft-state",
    kind: "draft",
    status: "declared",
    scopeRef: "TSK-SCP-001",
    roleRef: "TSK-ROL-001",
    transitionRule: "draft-to-pending-on-assign",
    required: true,
    description: "Initial declarative task draft state",
  },
  {
    id: "TSK-STA-002",
    name: "pending-state",
    kind: "pending",
    status: "registered",
    scopeRef: "TSK-SCP-004",
    roleRef: "TSK-ROL-002",
    transitionRule: "pending-to-queued-on-accept",
    required: true,
    description: "Task awaiting assignment acceptance",
  },
  {
    id: "TSK-STA-003",
    name: "queued-state",
    kind: "queued",
    status: "registered",
    scopeRef: "TSK-SCP-003",
    roleRef: "TSK-ROL-003",
    transitionRule: "queued-to-active-on-dispatch",
    required: true,
    description: "Task queued for declarative dispatch",
  },
  {
    id: "TSK-STA-004",
    name: "active-state",
    kind: "active",
    status: "active",
    scopeRef: "TSK-SCP-004",
    roleRef: "TSK-ROL-003",
    transitionRule: "active-to-completed-or-blocked",
    required: true,
    description: "Task actively in lifecycle — no runtime engine",
  },
  {
    id: "TSK-STA-005",
    name: "blocked-state",
    kind: "blocked",
    status: "registered",
    scopeRef: "TSK-SCP-006",
    roleRef: "TSK-ROL-004",
    transitionRule: "blocked-to-active-on-unblock",
    required: true,
    description: "Task blocked by dependency or governance",
  },
  {
    id: "TSK-STA-006",
    name: "completed-state",
    kind: "completed",
    status: "registered",
    scopeRef: "TSK-SCP-002",
    roleRef: "TSK-ROL-005",
    transitionRule: "completed-terminal",
    required: true,
    description: "Task lifecycle completed terminal state",
  },
  {
    id: "TSK-STA-007",
    name: "cancelled-state",
    kind: "cancelled",
    status: "registered",
    scopeRef: "TSK-SCP-005",
    roleRef: "TSK-ROL-006",
    transitionRule: "cancelled-terminal",
    required: true,
    description: "Task cancelled terminal state",
  },
  {
    id: "TSK-STA-008",
    name: "frozen-state",
    kind: "frozen",
    status: "frozen",
    scopeRef: "TSK-SCP-008",
    roleRef: "TSK-ROL-008",
    transitionRule: "frozen-immutable",
    required: true,
    description: "Task frozen boundary — no runtime task engine",
  },
];

export function buildTaskStateManifest(): TaskStateManifest {
  const states = TASK_STATE_CATALOG;
  const kinds = new Set(states.map((s) => s.kind));
  const catalogComplete =
    states.length === 8 && REQUIRED_STATE_KINDS.every((k) => kinds.has(k));

  return {
    version: V79_TASK_VERSION,
    entryCount: states.length,
    kindCount: kinds.size,
    catalogComplete,
    states,
    summary: [
      `task-states count=${states.length}`,
      `kinds=${kinds.size}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function getTaskStateById(id: string): TaskState | undefined {
  return TASK_STATE_CATALOG.find((s) => s.id === id);
}

export function getTaskStatesByKind(kind: TaskStateKind): TaskState[] {
  return TASK_STATE_CATALOG.filter((s) => s.kind === kind);
}

export function isTaskStateCoverageComplete(): boolean {
  const kinds = new Set(TASK_STATE_CATALOG.map((s) => s.kind));
  return TASK_STATE_CATALOG.length === 8 && REQUIRED_STATE_KINDS.every((k) => kinds.has(k));
}
