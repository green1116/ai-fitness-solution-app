/**
 * V80 P1 — Global system scope catalog (declarative)
 */

export type SystemScopeKind = "global" | "stack" | "layer" | "meta";

export type SystemScope = {
  id: string;
  kind: SystemScopeKind;
  label: string;
  layerRef?: string;
  required: boolean;
  description: string;
};

export const SYSTEM_SCOPE_CATALOG: SystemScope[] = [
  {
    id: "SYS-SCP-001",
    kind: "global",
    label: "Global system meta scope",
    required: true,
    description: "Platform-wide V76–V79 stack meta boundary",
  },
  {
    id: "SYS-SCP-002",
    kind: "stack",
    label: "V76–V79 stack scope",
    required: true,
    description: "Cross-layer stack orchestration boundary",
  },
  {
    id: "SYS-SCP-003",
    kind: "layer",
    label: "V76 collaboration layer scope",
    layerRef: "V76",
    required: true,
    description: "Collaboration layer meta consumer scope",
  },
  {
    id: "SYS-SCP-004",
    kind: "layer",
    label: "V77 planning layer scope",
    layerRef: "V77",
    required: true,
    description: "Planning layer meta consumer scope",
  },
  {
    id: "SYS-SCP-005",
    kind: "layer",
    label: "V78 execution layer scope",
    layerRef: "V78",
    required: true,
    description: "Execution layer meta consumer scope",
  },
  {
    id: "SYS-SCP-006",
    kind: "layer",
    label: "V79 task layer scope",
    layerRef: "V79",
    required: true,
    description: "Task layer meta consumer scope",
  },
  {
    id: "SYS-SCP-007",
    kind: "meta",
    label: "V80 meta-orchestration scope",
    layerRef: "V80",
    required: true,
    description: "System meta-orchestration declaration scope",
  },
  {
    id: "SYS-SCP-008",
    kind: "global",
    label: "Freeze boundary scope",
    required: true,
    description: "V48–V79 frozen layer exclusion boundary",
  },
];

export function buildSystemScopeManifest() {
  const scopes = SYSTEM_SCOPE_CATALOG;
  const kinds = new Set(scopes.map((s) => s.kind));
  return {
    scopeCount: scopes.length,
    kindCount: kinds.size,
    catalogComplete: scopes.length >= 6 && kinds.size >= 4,
    scopes,
    summary: `system-scopes count=${scopes.length} kinds=${kinds.size}`,
  };
}

export function getSystemScopeById(id: string): SystemScope | undefined {
  return SYSTEM_SCOPE_CATALOG.find((s) => s.id === id);
}

export function isSystemScopeCoverageComplete(): boolean {
  const kinds = new Set(SYSTEM_SCOPE_CATALOG.map((s) => s.kind));
  return SYSTEM_SCOPE_CATALOG.length >= 6 && kinds.size >= 4;
}
