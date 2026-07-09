/**
 * V80 P2 — System meta constraints catalog (declarative)
 */
import type { SystemMetaConstraint, SystemMetaConstraintManifest } from "./system.policy";
import { V80_SYSTEM_POLICY_VERSION } from "./system.policy";

const REQUIRED_KINDS: SystemMetaConstraint["kind"][] = [
  "runtime",
  "mutation",
  "boundary",
  "consumer",
];

export const SYSTEM_META_CONSTRAINT_CATALOG: SystemMetaConstraint[] = [
  {
    id: "SYS-CON-001",
    kind: "runtime",
    boundarySide: "v80",
    policyRef: "SYS-POL-001",
    scopeRef: "SYS-SCP-008",
    rule: "no-meta-runtime-orchestration-engine",
    required: true,
    description: "V80 must not introduce runtime orchestration engine",
  },
  {
    id: "SYS-CON-002",
    kind: "mutation",
    boundarySide: "exclusion",
    policyRef: "SYS-POL-002",
    scopeRef: "SYS-SCP-008",
    rule: "no-v76-v79-layer-mutation",
    required: true,
    description: "V80 policies must not mutate V76–V79 frozen layers",
  },
  {
    id: "SYS-CON-003",
    kind: "boundary",
    boundarySide: "v80",
    policyRef: "SYS-POL-006",
    scopeRef: "SYS-SCP-007",
    rule: "policy-declaration-v80-only",
    required: true,
    description: "Policy authorship confined to V80 meta scope",
  },
  {
    id: "SYS-CON-004",
    kind: "consumer",
    boundarySide: "stack",
    policyRef: "SYS-POL-004",
    scopeRef: "SYS-SCP-002",
    rule: "read-only-stack-consumer",
    required: true,
    description: "V80 consumes V76–V79 stack read-only via signoff refs",
  },
];

export function isSystemMetaConstraintCatalogComplete(): boolean {
  const kinds = new Set(SYSTEM_META_CONSTRAINT_CATALOG.map((c) => c.kind));
  return (
    SYSTEM_META_CONSTRAINT_CATALOG.length === 4 &&
    REQUIRED_KINDS.every((k) => kinds.has(k))
  );
}

export function buildSystemMetaConstraintManifest(): SystemMetaConstraintManifest {
  const constraints = SYSTEM_META_CONSTRAINT_CATALOG;
  const kinds = new Set(constraints.map((c) => c.kind));
  const catalogComplete =
    constraints.length === 4 && REQUIRED_KINDS.every((k) => kinds.has(k));

  return {
    version: V80_SYSTEM_POLICY_VERSION,
    entryCount: constraints.length,
    kindCount: kinds.size,
    catalogComplete,
    constraints,
    summary: `system-constraints count=${constraints.length} kinds=${kinds.size} complete=${catalogComplete}`,
  };
}

export function getSystemMetaConstraintById(id: string): SystemMetaConstraint | undefined {
  return SYSTEM_META_CONSTRAINT_CATALOG.find((c) => c.id === id);
}
