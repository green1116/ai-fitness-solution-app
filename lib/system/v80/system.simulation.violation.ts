/**
 * V80 P3 — Pre-runtime policy violation detection rules
 */
import { SYSTEM_INVARIANT_CATALOG } from "./system.invariant.catalog";
import { SYSTEM_POLICY_CATALOG } from "./system.policy.catalog";
import type {
  SystemPreRuntimeViolationManifest,
  SystemPreRuntimeViolationRule,
} from "./system.simulation";
import { V80_SYSTEM_SIMULATION_VERSION } from "./system.simulation";

export const SYSTEM_PRE_RUNTIME_VIOLATION_RULES: SystemPreRuntimeViolationRule[] = [
  {
    id: "SYS-VIO-001",
    policyRef: "SYS-POL-001",
    invariantRef: "SYS-INV-006",
    violationKind: "runtime-detected",
    detectCondition: "runtime-meta-orchestration-engine-present",
    blockCondition: "declarative-only-no-runtime",
    simulationRef: "SYS-SIM-003",
    required: true,
    description: "Pre-runtime detect meta orchestration engine before execution",
  },
  {
    id: "SYS-VIO-002",
    policyRef: "SYS-POL-002",
    invariantRef: "SYS-INV-001",
    violationKind: "freeze-conflict",
    detectCondition: "layer-freeze-version-mismatch",
    blockCondition: "stack-freeze-intact",
    simulationRef: "SYS-SIM-004",
    required: true,
    description: "Pre-runtime detect stack freeze conflict across V76–V79",
  },
  {
    id: "SYS-VIO-003",
    policyRef: "SYS-POL-004",
    invariantRef: "SYS-INV-003",
    violationKind: "dependency-drift",
    detectCondition: "upstream-dependency-chain-broken",
    blockCondition: "stack-dependency-chain-valid",
    simulationRef: "SYS-SIM-001",
    required: true,
    description: "Pre-runtime detect V76→V79 dependency drift",
  },
  {
    id: "SYS-VIO-004",
    policyRef: "SYS-POL-006",
    invariantRef: "SYS-INV-004",
    violationKind: "scope-bypass",
    detectCondition: "policy-scope-boundary-crossed",
    blockCondition: "global-scope-bounded",
    simulationRef: "SYS-SIM-005",
    required: true,
    description: "Pre-runtime detect scope bypass outside V80 boundary",
  },
  {
    id: "SYS-VIO-005",
    policyRef: "SYS-POL-008",
    invariantRef: "SYS-INV-005",
    violationKind: "version-desync",
    detectCondition: "layer-signoff-version-drift",
    blockCondition: "layer-signoff-versions-locked",
    simulationRef: "SYS-SIM-002",
    required: true,
    description: "Pre-runtime detect signoff version desync across stack",
  },
  {
    id: "SYS-VIO-006",
    policyRef: "SYS-POL-003",
    invariantRef: "SYS-INV-002",
    violationKind: "cross-layer-gap",
    detectCondition: "cross-layer-map-incomplete",
    blockCondition: "cross-layer-map-documented",
    simulationRef: "SYS-SIM-001",
    required: true,
    description: "Pre-runtime detect missing cross-layer map entry",
  },
];

export function isSystemPreRuntimeViolationRulesComplete(): boolean {
  const policyIds = new Set(SYSTEM_POLICY_CATALOG.map((p) => p.id));
  const invariantIds = new Set(SYSTEM_INVARIANT_CATALOG.map((i) => i.id));
  const kinds = new Set(SYSTEM_PRE_RUNTIME_VIOLATION_RULES.map((r) => r.violationKind));

  return (
    SYSTEM_PRE_RUNTIME_VIOLATION_RULES.length === 6 &&
    SYSTEM_PRE_RUNTIME_VIOLATION_RULES.every(
      (r) =>
        policyIds.has(r.policyRef) &&
        invariantIds.has(r.invariantRef) &&
        r.detectCondition.length > 0 &&
        r.blockCondition.length > 0 &&
        r.simulationRef.startsWith("SYS-SIM-"),
    ) &&
    kinds.size >= 5
  );
}

export function buildSystemPreRuntimeViolationManifest(): SystemPreRuntimeViolationManifest {
  const rules = SYSTEM_PRE_RUNTIME_VIOLATION_RULES;
  const rulesComplete = isSystemPreRuntimeViolationRulesComplete();

  return {
    version: V80_SYSTEM_SIMULATION_VERSION,
    ruleCount: rules.length,
    rulesComplete,
    rules,
    summary: `system-violations rules=${rules.length} complete=${rulesComplete}`,
  };
}

export function getSystemPreRuntimeViolationById(
  id: string,
): SystemPreRuntimeViolationRule | undefined {
  return SYSTEM_PRE_RUNTIME_VIOLATION_RULES.find((r) => r.id === id);
}
