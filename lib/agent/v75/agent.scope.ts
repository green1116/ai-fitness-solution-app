/**
 * V75 P1 — Agent scope catalog (declarative)
 */

export type AgentScopeKind = "global" | "domain" | "session" | "operator";

export type AgentScope = {
  id: string;
  kind: AgentScopeKind;
  label: string;
  required: boolean;
  description: string;
};

export const AGENT_SCOPE_CATALOG: AgentScope[] = [
  {
    id: "AGT-SCP-001",
    kind: "global",
    label: "Global agent scope",
    required: true,
    description: "Platform-wide declarative agent orchestration boundary",
  },
  {
    id: "AGT-SCP-002",
    kind: "domain",
    label: "Fitness domain scope",
    required: true,
    description: "Fitness program agent orchestration domain",
  },
  {
    id: "AGT-SCP-003",
    kind: "domain",
    label: "Decision domain scope",
    required: true,
    description: "V74 decision engine consumer agent domain",
  },
  {
    id: "AGT-SCP-004",
    kind: "session",
    label: "Agent session scope",
    required: true,
    description: "Per-session agent orchestration context",
  },
  {
    id: "AGT-SCP-005",
    kind: "operator",
    label: "Release operator scope",
    required: true,
    description: "Release engineering operator agent boundary",
  },
  {
    id: "AGT-SCP-006",
    kind: "operator",
    label: "Governance operator scope",
    required: true,
    description: "Governance operator agent boundary",
  },
  {
    id: "AGT-SCP-007",
    kind: "session",
    label: "Deployment session scope",
    required: true,
    description: "Per-deployment agent session boundary",
  },
  {
    id: "AGT-SCP-008",
    kind: "global",
    label: "Freeze boundary scope",
    required: true,
    description: "V48–V74 frozen layer agent exclusion boundary",
  },
];

export function buildAgentScopeManifest() {
  const scopes = AGENT_SCOPE_CATALOG;
  const kinds = new Set(scopes.map((s) => s.kind));
  const catalogComplete = scopes.length >= 6 && kinds.size >= 4;

  return {
    scopeCount: scopes.length,
    kindCount: kinds.size,
    catalogComplete,
    scopes,
    summary: [
      `agent-scopes count=${scopes.length}`,
      `kinds=${kinds.size}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function getAgentScopeById(id: string): AgentScope | undefined {
  return AGENT_SCOPE_CATALOG.find((s) => s.id === id);
}

export function getAgentScopesByKind(kind: AgentScopeKind): AgentScope[] {
  return AGENT_SCOPE_CATALOG.filter((s) => s.kind === kind);
}

export function isAgentScopeCoverageComplete(): boolean {
  const kinds = new Set(AGENT_SCOPE_CATALOG.map((s) => s.kind));
  return AGENT_SCOPE_CATALOG.length >= 6 && kinds.size >= 4;
}
