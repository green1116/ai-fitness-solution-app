/**
 * V77 P1 — Planning scope catalog (declarative)
 */

export type PlanningScopeKind = "global" | "domain" | "session" | "operator";

export type PlanningScope = {
  id: string;
  kind: PlanningScopeKind;
  label: string;
  required: boolean;
  description: string;
};

export const PLANNING_SCOPE_CATALOG: PlanningScope[] = [
  {
    id: "PLN-SCP-001",
    kind: "global",
    label: "Global planning scope",
    required: true,
    description: "Platform-wide declarative multi-agent planning boundary",
  },
  {
    id: "PLN-SCP-002",
    kind: "domain",
    label: "Fitness domain planning scope",
    required: true,
    description: "Fitness program multi-agent planning domain",
  },
  {
    id: "PLN-SCP-003",
    kind: "domain",
    label: "Collaboration domain scope",
    required: true,
    description: "V76 collaboration consumer planning domain",
  },
  {
    id: "PLN-SCP-004",
    kind: "session",
    label: "Planning session scope",
    required: true,
    description: "Per-session planning orchestration context",
  },
  {
    id: "PLN-SCP-005",
    kind: "operator",
    label: "Release operator scope",
    required: true,
    description: "Release engineering operator planning boundary",
  },
  {
    id: "PLN-SCP-006",
    kind: "operator",
    label: "Governance operator scope",
    required: true,
    description: "Governance operator planning boundary",
  },
  {
    id: "PLN-SCP-007",
    kind: "session",
    label: "Deployment session scope",
    required: true,
    description: "Per-deployment planning session boundary",
  },
  {
    id: "PLN-SCP-008",
    kind: "global",
    label: "Freeze boundary scope",
    required: true,
    description: "V48–V76 frozen layer planning exclusion boundary",
  },
];

export function buildPlanningScopeManifest() {
  const scopes = PLANNING_SCOPE_CATALOG;
  const kinds = new Set(scopes.map((s) => s.kind));
  const catalogComplete = scopes.length >= 6 && kinds.size >= 4;

  return {
    scopeCount: scopes.length,
    kindCount: kinds.size,
    catalogComplete,
    scopes,
    summary: [
      `planning-scopes count=${scopes.length}`,
      `kinds=${kinds.size}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function getPlanningScopeById(id: string): PlanningScope | undefined {
  return PLANNING_SCOPE_CATALOG.find((s) => s.id === id);
}

export function getPlanningScopesByKind(kind: PlanningScopeKind): PlanningScope[] {
  return PLANNING_SCOPE_CATALOG.filter((s) => s.kind === kind);
}

export function isPlanningScopeCoverageComplete(): boolean {
  const kinds = new Set(PLANNING_SCOPE_CATALOG.map((s) => s.kind));
  return PLANNING_SCOPE_CATALOG.length >= 6 && kinds.size >= 4;
}
