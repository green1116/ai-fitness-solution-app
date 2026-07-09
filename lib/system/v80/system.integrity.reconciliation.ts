/**
 * V80 P4 — Reconciliation rules + global freeze semantics
 */
import { SYSTEM_INVARIANT_CATALOG } from "./system.invariant.catalog";
import { SYSTEM_POLICY_CATALOG } from "./system.policy.catalog";
import { SYSTEM_DRIFT_DETECTORS } from "./system.integrity.drift";
import type {
  SystemGlobalFreezeSemantic,
  SystemReconciliationManifest,
  SystemReconciliationRule,
} from "./system.integrity";
import { V80_SYSTEM_INTEGRITY_VERSION } from "./system.integrity";

const STACK_LAYERS = ["V76", "V77", "V78", "V79"] as const;

export const SYSTEM_RECONCILIATION_RULES: SystemReconciliationRule[] = [
  {
    id: "SYS-REC-001",
    reconcileKind: "map-gap-reconcile",
    layerRefs: [...STACK_LAYERS],
    policyRef: "SYS-POL-003",
    driftRef: "SYS-DRF-001",
    action: "declarative-document-gap-no-mutation",
    passCondition: "cross-layer-map-restored-declaratively",
    integrityRef: "SYS-INT-003",
    required: true,
    description: "Reconcile orphan layer — document gap without mutating V76–V79",
  },
  {
    id: "SYS-REC-002",
    reconcileKind: "version-drift-reconcile",
    layerRefs: [...STACK_LAYERS],
    policyRef: "SYS-POL-008",
    driftRef: "SYS-DRF-004",
    action: "declarative-lock-signoff-no-mutation",
    passCondition: "signoff-versions-realigned-declaratively",
    integrityRef: "SYS-INT-003",
    required: true,
    description: "Reconcile signoff desync — realign declaratively without mutation",
  },
  {
    id: "SYS-REC-003",
    reconcileKind: "dependency-break-reconcile",
    layerRefs: [...STACK_LAYERS],
    policyRef: "SYS-POL-004",
    driftRef: "SYS-DRF-003",
    action: "declarative-restore-chain-no-mutation",
    passCondition: "dependency-chain-restored-declaratively",
    integrityRef: "SYS-INT-003",
    required: true,
    description: "Reconcile dependency break — restore chain declaratively",
  },
];

export const SYSTEM_GLOBAL_FREEZE_SEMANTICS: SystemGlobalFreezeSemantic[] = [
  {
    id: "SYS-GFZ-001",
    semanticKind: "stack-wide-freeze-lock",
    layerRefs: [...STACK_LAYERS],
    policyRef: "SYS-POL-002",
    invariantRef: "SYS-INV-001",
    rule: "forall(layer in V76..V79): freezeVersion.locked == true",
    integrityRef: "SYS-INT-004",
    required: true,
    description: "Global freeze lock — entire V76–V79 stack frozen",
  },
  {
    id: "SYS-GFZ-002",
    semanticKind: "layer-freeze-cascade",
    layerRefs: [...STACK_LAYERS],
    policyRef: "SYS-POL-004",
    invariantRef: "SYS-INV-003",
    rule: "freeze[V76] => freeze[V77] => freeze[V78] => freeze[V79]",
    integrityRef: "SYS-INT-004",
    required: true,
    description: "Freeze cascade — upstream freeze propagates downstream",
  },
  {
    id: "SYS-GFZ-003",
    semanticKind: "freeze-exclusion-boundary",
    layerRefs: [...STACK_LAYERS],
    policyRef: "SYS-POL-001",
    invariantRef: "SYS-INV-006",
    rule: "no-mutation-below-v76 && v80-declarative-only",
    integrityRef: "SYS-INT-004",
    required: true,
    description: "Freeze exclusion — V80 cannot mutate frozen V76–V79 layers",
  },
];

export function isSystemReconciliationComplete(): boolean {
  const policyIds = new Set(SYSTEM_POLICY_CATALOG.map((p) => p.id));
  const driftIds = new Set(SYSTEM_DRIFT_DETECTORS.map((d) => d.id));
  const invariantIds = new Set(SYSTEM_INVARIANT_CATALOG.map((i) => i.id));

  const rulesValid = SYSTEM_RECONCILIATION_RULES.every(
    (r) =>
      policyIds.has(r.policyRef) &&
      driftIds.has(r.driftRef) &&
      r.action.length > 0 &&
      r.layerRefs.length === 4,
  );

  const freezeValid = SYSTEM_GLOBAL_FREEZE_SEMANTICS.every(
    (f) =>
      policyIds.has(f.policyRef) &&
      invariantIds.has(f.invariantRef) &&
      f.rule.length > 0 &&
      f.layerRefs.length === 4,
  );

  return (
    SYSTEM_RECONCILIATION_RULES.length === 3 &&
    SYSTEM_GLOBAL_FREEZE_SEMANTICS.length === 3 &&
    rulesValid &&
    freezeValid
  );
}

export function buildSystemReconciliationManifest(): SystemReconciliationManifest {
  const rules = SYSTEM_RECONCILIATION_RULES;
  const freezeSemantics = SYSTEM_GLOBAL_FREEZE_SEMANTICS;
  const reconciliationComplete = isSystemReconciliationComplete();

  return {
    version: V80_SYSTEM_INTEGRITY_VERSION,
    ruleCount: rules.length,
    reconciliationComplete,
    rules,
    freezeSemantics,
    summary: `system-reconciliation rules=${rules.length} freeze=${freezeSemantics.length} complete=${reconciliationComplete}`,
  };
}

export function getSystemReconciliationRuleById(id: string): SystemReconciliationRule | undefined {
  return SYSTEM_RECONCILIATION_RULES.find((r) => r.id === id);
}

export function getSystemGlobalFreezeSemanticById(
  id: string,
): SystemGlobalFreezeSemantic | undefined {
  return SYSTEM_GLOBAL_FREEZE_SEMANTICS.find((f) => f.id === id);
}
