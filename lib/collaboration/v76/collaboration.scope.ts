/**
 * V76 P1 — Collaboration scope catalog (declarative)
 */

export type CollaborationScopeKind = "global" | "domain" | "session" | "operator";

export type CollaborationScope = {
  id: string;
  kind: CollaborationScopeKind;
  label: string;
  required: boolean;
  description: string;
};

export const COLLABORATION_SCOPE_CATALOG: CollaborationScope[] = [
  {
    id: "COL-SCP-001",
    kind: "global",
    label: "Global collaboration scope",
    required: true,
    description: "Platform-wide declarative collaboration boundary",
  },
  {
    id: "COL-SCP-002",
    kind: "domain",
    label: "Fitness domain scope",
    required: true,
    description: "Fitness program multi-party collaboration domain",
  },
  {
    id: "COL-SCP-003",
    kind: "domain",
    label: "Agent domain scope",
    required: true,
    description: "V75 agent orchestration consumer collaboration domain",
  },
  {
    id: "COL-SCP-004",
    kind: "session",
    label: "Collaboration session scope",
    required: true,
    description: "Per-session collaboration orchestration context",
  },
  {
    id: "COL-SCP-005",
    kind: "operator",
    label: "Release operator scope",
    required: true,
    description: "Release engineering operator collaboration boundary",
  },
  {
    id: "COL-SCP-006",
    kind: "operator",
    label: "Governance operator scope",
    required: true,
    description: "Governance operator collaboration boundary",
  },
  {
    id: "COL-SCP-007",
    kind: "session",
    label: "Deployment session scope",
    required: true,
    description: "Per-deployment collaboration session boundary",
  },
  {
    id: "COL-SCP-008",
    kind: "global",
    label: "Freeze boundary scope",
    required: true,
    description: "V48–V75 frozen layer collaboration exclusion boundary",
  },
];

export function buildCollaborationScopeManifest() {
  const scopes = COLLABORATION_SCOPE_CATALOG;
  const kinds = new Set(scopes.map((s) => s.kind));
  const catalogComplete = scopes.length >= 6 && kinds.size >= 4;

  return {
    scopeCount: scopes.length,
    kindCount: kinds.size,
    catalogComplete,
    scopes,
    summary: [
      `collaboration-scopes count=${scopes.length}`,
      `kinds=${kinds.size}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function getCollaborationScopeById(id: string): CollaborationScope | undefined {
  return COLLABORATION_SCOPE_CATALOG.find((s) => s.id === id);
}

export function getCollaborationScopesByKind(kind: CollaborationScopeKind): CollaborationScope[] {
  return COLLABORATION_SCOPE_CATALOG.filter((s) => s.kind === kind);
}

export function isCollaborationScopeCoverageComplete(): boolean {
  const kinds = new Set(COLLABORATION_SCOPE_CATALOG.map((s) => s.kind));
  return COLLABORATION_SCOPE_CATALOG.length >= 6 && kinds.size >= 4;
}
