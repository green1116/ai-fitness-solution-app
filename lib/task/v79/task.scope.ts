/**
 * V79 P1 — Task scope catalog (declarative)
 */

export type TaskScopeKind = "global" | "domain" | "session" | "operator";

export type TaskScope = {
  id: string;
  kind: TaskScopeKind;
  label: string;
  required: boolean;
  description: string;
};

export const TASK_SCOPE_CATALOG: TaskScope[] = [
  {
    id: "TSK-SCP-001",
    kind: "global",
    label: "Global task scope",
    required: true,
    description: "Platform-wide declarative task lifecycle boundary",
  },
  {
    id: "TSK-SCP-002",
    kind: "domain",
    label: "Fitness domain task scope",
    required: true,
    description: "Fitness program task lifecycle domain",
  },
  {
    id: "TSK-SCP-003",
    kind: "domain",
    label: "Execution domain scope",
    required: true,
    description: "V78 execution consumer task domain",
  },
  {
    id: "TSK-SCP-004",
    kind: "session",
    label: "Task session scope",
    required: true,
    description: "Per-session task lifecycle context boundary",
  },
  {
    id: "TSK-SCP-005",
    kind: "operator",
    label: "Release operator scope",
    required: true,
    description: "Release engineering operator task boundary",
  },
  {
    id: "TSK-SCP-006",
    kind: "operator",
    label: "Governance operator scope",
    required: true,
    description: "Governance operator task boundary",
  },
  {
    id: "TSK-SCP-007",
    kind: "session",
    label: "Deployment session scope",
    required: true,
    description: "Per-deployment task session boundary",
  },
  {
    id: "TSK-SCP-008",
    kind: "global",
    label: "Freeze boundary scope",
    required: true,
    description: "V48–V78 frozen layer task exclusion boundary",
  },
];

export function buildTaskScopeManifest() {
  const scopes = TASK_SCOPE_CATALOG;
  const kinds = new Set(scopes.map((s) => s.kind));
  const catalogComplete = scopes.length >= 6 && kinds.size >= 4;

  return {
    scopeCount: scopes.length,
    kindCount: kinds.size,
    catalogComplete,
    scopes,
    summary: [
      `task-scopes count=${scopes.length}`,
      `kinds=${kinds.size}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function getTaskScopeById(id: string): TaskScope | undefined {
  return TASK_SCOPE_CATALOG.find((s) => s.id === id);
}

export function getTaskScopesByKind(kind: TaskScopeKind): TaskScope[] {
  return TASK_SCOPE_CATALOG.filter((s) => s.kind === kind);
}

export function isTaskScopeCoverageComplete(): boolean {
  const kinds = new Set(TASK_SCOPE_CATALOG.map((s) => s.kind));
  return TASK_SCOPE_CATALOG.length >= 6 && kinds.size >= 4;
}
