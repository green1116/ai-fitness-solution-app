/**
 * V78 P1 — Execution scope catalog (declarative)
 */

export type ExecutionScopeKind = "global" | "domain" | "session" | "operator";

export type ExecutionScope = {
  id: string;
  kind: ExecutionScopeKind;
  label: string;
  required: boolean;
  description: string;
};

export const EXECUTION_SCOPE_CATALOG: ExecutionScope[] = [
  {
    id: "EXE-SCP-001",
    kind: "global",
    label: "Global execution scope",
    required: true,
    description: "Platform-wide declarative execution boundary",
  },
  {
    id: "EXE-SCP-002",
    kind: "domain",
    label: "Fitness domain execution scope",
    required: true,
    description: "Fitness program execution domain",
  },
  {
    id: "EXE-SCP-003",
    kind: "domain",
    label: "Planning domain scope",
    required: true,
    description: "V77 planning consumer execution domain",
  },
  {
    id: "EXE-SCP-004",
    kind: "session",
    label: "Execution session scope",
    required: true,
    description: "Per-session execution context boundary",
  },
  {
    id: "EXE-SCP-005",
    kind: "operator",
    label: "Release operator scope",
    required: true,
    description: "Release engineering operator execution boundary",
  },
  {
    id: "EXE-SCP-006",
    kind: "operator",
    label: "Governance operator scope",
    required: true,
    description: "Governance operator execution boundary",
  },
  {
    id: "EXE-SCP-007",
    kind: "session",
    label: "Deployment session scope",
    required: true,
    description: "Per-deployment execution session boundary",
  },
  {
    id: "EXE-SCP-008",
    kind: "global",
    label: "Freeze boundary scope",
    required: true,
    description: "V48–V77 frozen layer execution exclusion boundary",
  },
];

export function buildExecutionScopeManifest() {
  const scopes = EXECUTION_SCOPE_CATALOG;
  const kinds = new Set(scopes.map((s) => s.kind));
  const catalogComplete = scopes.length >= 6 && kinds.size >= 4;

  return {
    scopeCount: scopes.length,
    kindCount: kinds.size,
    catalogComplete,
    scopes,
    summary: [
      `execution-scopes count=${scopes.length}`,
      `kinds=${kinds.size}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function getExecutionScopeById(id: string): ExecutionScope | undefined {
  return EXECUTION_SCOPE_CATALOG.find((s) => s.id === id);
}

export function getExecutionScopesByKind(kind: ExecutionScopeKind): ExecutionScope[] {
  return EXECUTION_SCOPE_CATALOG.filter((s) => s.kind === kind);
}

export function isExecutionScopeCoverageComplete(): boolean {
  const kinds = new Set(EXECUTION_SCOPE_CATALOG.map((s) => s.kind));
  return EXECUTION_SCOPE_CATALOG.length >= 6 && kinds.size >= 4;
}
