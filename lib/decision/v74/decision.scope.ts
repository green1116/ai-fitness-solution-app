/**
 * V74 P1 — Decision scope catalog (declarative)
 */

export type DecisionScopeKind = "global" | "domain" | "session" | "operator";

export type DecisionScope = {
  id: string;
  kind: DecisionScopeKind;
  label: string;
  required: boolean;
  description: string;
};

export const DECISION_SCOPE_CATALOG: DecisionScope[] = [
  {
    id: "DEC-SCP-001",
    kind: "global",
    label: "Global decision scope",
    required: true,
    description: "Platform-wide declarative decision boundary",
  },
  {
    id: "DEC-SCP-002",
    kind: "domain",
    label: "Fitness domain scope",
    required: true,
    description: "Fitness program and training domain decisions",
  },
  {
    id: "DEC-SCP-003",
    kind: "domain",
    label: "Knowledge domain scope",
    required: true,
    description: "Knowledge retrieval and governance domain decisions",
  },
  {
    id: "DEC-SCP-004",
    kind: "session",
    label: "Operator session scope",
    required: true,
    description: "Per-session operator decision context",
  },
  {
    id: "DEC-SCP-005",
    kind: "operator",
    label: "Release operator scope",
    required: true,
    description: "Release engineering operator decision boundary",
  },
  {
    id: "DEC-SCP-006",
    kind: "operator",
    label: "Governance operator scope",
    required: true,
    description: "Governance operator decision boundary",
  },
  {
    id: "DEC-SCP-007",
    kind: "session",
    label: "Deployment session scope",
    required: true,
    description: "Per-deployment decision session boundary",
  },
  {
    id: "DEC-SCP-008",
    kind: "global",
    label: "Freeze boundary scope",
    required: true,
    description: "V48–V73 frozen layer decision exclusion boundary",
  },
];

export function buildDecisionScopeManifest() {
  const scopes = DECISION_SCOPE_CATALOG;
  const kinds = new Set(scopes.map((s) => s.kind));
  const catalogComplete = scopes.length >= 6 && kinds.size >= 4;

  return {
    scopeCount: scopes.length,
    kindCount: kinds.size,
    catalogComplete,
    scopes,
    summary: [
      `decision-scopes count=${scopes.length}`,
      `kinds=${kinds.size}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function getDecisionScopeById(id: string): DecisionScope | undefined {
  return DECISION_SCOPE_CATALOG.find((s) => s.id === id);
}

export function getDecisionScopesByKind(kind: DecisionScopeKind): DecisionScope[] {
  return DECISION_SCOPE_CATALOG.filter((s) => s.kind === kind);
}

export function isDecisionScopeCoverageComplete(): boolean {
  const kinds = new Set(DECISION_SCOPE_CATALOG.map((s) => s.kind));
  return DECISION_SCOPE_CATALOG.length >= 6 && kinds.size >= 4;
}
