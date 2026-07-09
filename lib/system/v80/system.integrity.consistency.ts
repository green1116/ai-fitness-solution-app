/**
 * V80 P4 — Cross-layer consistency validation model
 */
import { SYSTEM_INVARIANT_CATALOG } from "./system.invariant.catalog";
import { SYSTEM_POLICY_CATALOG } from "./system.policy.catalog";
import type { SystemConsistencyCheck, SystemConsistencyManifest } from "./system.integrity";
import { V80_SYSTEM_INTEGRITY_VERSION } from "./system.integrity";

const STACK_LAYERS = ["V76", "V77", "V78", "V79"] as const;

export const SYSTEM_CONSISTENCY_CHECKS: SystemConsistencyCheck[] = [
  {
    id: "SYS-CONS-001",
    checkKind: "cross-layer-map",
    layerRefs: [...STACK_LAYERS],
    policyRef: "SYS-POL-003",
    invariantRef: "SYS-INV-002",
    passCondition: "crossLayerMap.complete && layers == 4",
    integrityRef: "SYS-INT-001",
    required: true,
    description: "Validate V76–V79 cross-layer map consistency",
  },
  {
    id: "SYS-CONS-002",
    checkKind: "dependency-chain",
    layerRefs: [...STACK_LAYERS],
    policyRef: "SYS-POL-004",
    invariantRef: "SYS-INV-003",
    passCondition: "dependencyChain == [V76,V77,V78,V79]",
    integrityRef: "SYS-INT-001",
    required: true,
    description: "Validate V76→V79 dependency chain consistency",
  },
  {
    id: "SYS-CONS-003",
    checkKind: "scope-coverage",
    layerRefs: [...STACK_LAYERS],
    policyRef: "SYS-POL-006",
    invariantRef: "SYS-INV-004",
    passCondition: "scopeCoverage.complete && perLayerScopes == 4",
    integrityRef: "SYS-INT-005",
    required: true,
    description: "Validate global and per-layer scope consistency",
  },
  {
    id: "SYS-CONS-004",
    checkKind: "signoff-alignment",
    layerRefs: [...STACK_LAYERS],
    policyRef: "SYS-POL-008",
    invariantRef: "SYS-INV-005",
    passCondition: "forall(layer): signoffRef == crossLayerMap[layer]",
    integrityRef: "SYS-INT-002",
    required: true,
    description: "Validate V76–V79 signoff version alignment",
  },
];

export function isSystemConsistencyValidationComplete(): boolean {
  const policyIds = new Set(SYSTEM_POLICY_CATALOG.map((p) => p.id));
  const invariantIds = new Set(SYSTEM_INVARIANT_CATALOG.map((i) => i.id));
  const kinds = new Set(SYSTEM_CONSISTENCY_CHECKS.map((c) => c.checkKind));

  return (
    SYSTEM_CONSISTENCY_CHECKS.length === 4 &&
    kinds.size === 4 &&
    SYSTEM_CONSISTENCY_CHECKS.every(
      (c) =>
        policyIds.has(c.policyRef) &&
        invariantIds.has(c.invariantRef) &&
        c.layerRefs.length === 4 &&
        c.passCondition.length > 0,
    )
  );
}

export function buildSystemConsistencyManifest(): SystemConsistencyManifest {
  const checks = SYSTEM_CONSISTENCY_CHECKS;
  const consistencyComplete = isSystemConsistencyValidationComplete();

  return {
    version: V80_SYSTEM_INTEGRITY_VERSION,
    checkCount: checks.length,
    consistencyComplete,
    checks,
    summary: `system-consistency checks=${checks.length} complete=${consistencyComplete}`,
  };
}

export function getSystemConsistencyCheckById(id: string): SystemConsistencyCheck | undefined {
  return SYSTEM_CONSISTENCY_CHECKS.find((c) => c.id === id);
}
