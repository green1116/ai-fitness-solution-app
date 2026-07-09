/**
 * V80 P2 — System invariants catalog (declarative, cross-layer)
 */
import type { SystemInvariant, SystemInvariantManifest } from "./system.policy";
import { V80_SYSTEM_POLICY_VERSION } from "./system.policy";

const REQUIRED_KINDS: SystemInvariant["kind"][] = [
  "freeze",
  "map",
  "dependency",
  "scope",
  "alignment",
  "declarative",
];

const STACK_LAYERS = ["V76", "V77", "V78", "V79"] as const;

export const SYSTEM_INVARIANT_CATALOG: SystemInvariant[] = [
  {
    id: "SYS-INV-001",
    kind: "freeze",
    layerRefs: [...STACK_LAYERS],
    policyRef: "SYS-POL-002",
    scopeRef: "SYS-SCP-002",
    expression: "forall(layer in V76..V79): layer.freezeVersion != null",
    required: true,
    description: "All stack layers V76–V79 remain frozen",
  },
  {
    id: "SYS-INV-002",
    kind: "map",
    layerRefs: [...STACK_LAYERS],
    policyRef: "SYS-POL-003",
    scopeRef: "SYS-SCP-002",
    expression: "crossLayerMap.complete == true && crossLayerMap.length == 4",
    required: true,
    description: "Cross-layer map covers V76–V79 completely",
  },
  {
    id: "SYS-INV-003",
    kind: "dependency",
    layerRefs: [...STACK_LAYERS],
    policyRef: "SYS-POL-004",
    scopeRef: "SYS-SCP-001",
    expression: "dependencyChain == [V76, V77, V78, V79] && upstreamAligned",
    required: true,
    description: "Stack dependency chain V76→V79 is valid and aligned",
  },
  {
    id: "SYS-INV-004",
    kind: "scope",
    layerRefs: [...STACK_LAYERS, "V80"],
    policyRef: "SYS-POL-006",
    scopeRef: "SYS-SCP-001",
    expression: "scopeCoverage.complete == true && scope.kinds >= 4",
    required: true,
    description: "Global and per-layer scopes fully declared",
  },
  {
    id: "SYS-INV-005",
    kind: "alignment",
    layerRefs: [...STACK_LAYERS],
    policyRef: "SYS-POL-008",
    scopeRef: "SYS-SCP-007",
    expression: "forall(layer): layer.signoffRef == crossLayerMap[layer].signoffVersion",
    required: true,
    description: "Layer sign-off refs align with cross-layer map",
  },
  {
    id: "SYS-INV-006",
    kind: "declarative",
    layerRefs: [...STACK_LAYERS, "V80"],
    policyRef: "SYS-POL-001",
    scopeRef: "SYS-SCP-008",
    expression: "noRuntimeOrchestration && noExecution && noSimulation",
    required: true,
    description: "Entire stack remains declarative-only",
  },
];

export function isSystemInvariantCatalogComplete(): boolean {
  const kinds = new Set(SYSTEM_INVARIANT_CATALOG.map((i) => i.kind));
  const allCrossLayer = SYSTEM_INVARIANT_CATALOG.every((i) => i.layerRefs.length >= 4);
  return (
    SYSTEM_INVARIANT_CATALOG.length === 6 &&
    REQUIRED_KINDS.every((k) => kinds.has(k)) &&
    allCrossLayer
  );
}

export function buildSystemInvariantManifest(): SystemInvariantManifest {
  const invariants = SYSTEM_INVARIANT_CATALOG;
  const kinds = new Set(invariants.map((i) => i.kind));
  const catalogComplete =
    invariants.length === 6 && REQUIRED_KINDS.every((k) => kinds.has(k));

  return {
    version: V80_SYSTEM_POLICY_VERSION,
    entryCount: invariants.length,
    kindCount: kinds.size,
    catalogComplete,
    invariants,
    summary: `system-invariants count=${invariants.length} kinds=${kinds.size} complete=${catalogComplete}`,
  };
}

export function getSystemInvariantById(id: string): SystemInvariant | undefined {
  return SYSTEM_INVARIANT_CATALOG.find((i) => i.id === id);
}
