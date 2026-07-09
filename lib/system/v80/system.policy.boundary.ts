/**
 * V80 P2 — System policy scope boundary (V80 vs V76–V79)
 */
import type { SystemPolicyBoundaryManifest, SystemPolicyScopeBoundary } from "./system.policy";
import { V80_SYSTEM_POLICY_VERSION } from "./system.policy";

export const SYSTEM_POLICY_SCOPE_BOUNDARIES: SystemPolicyScopeBoundary[] = [
  {
    id: "SYS-BND-001",
    zone: "v80-policy",
    scopeRef: "SYS-SCP-007",
    appliesTo: ["V80"],
    excludes: [],
    rule: "v80-meta-policy-authorship-zone",
    required: true,
    description: "V80 meta scope — policy/invariant/constraint declaration zone",
  },
  {
    id: "SYS-BND-002",
    zone: "v76-v79-target",
    scopeRef: "SYS-SCP-002",
    appliesTo: ["V76", "V77", "V78", "V79"],
    excludes: ["V80"],
    rule: "v76-v79-read-only-policy-target",
    required: true,
    description: "V76–V79 stack — read-only cross-layer policy target zone",
  },
  {
    id: "SYS-BND-003",
    zone: "exclusion",
    scopeRef: "SYS-SCP-008",
    appliesTo: ["V48", "V49", "V50", "V51", "V52", "V53", "V54", "V55", "V56", "V57", "V58", "V59", "V60", "V61", "V62", "V63", "V64", "V65", "V66", "V67", "V68", "V69", "V70", "V71", "V72", "V73", "V74", "V75"],
    excludes: ["V76", "V77", "V78", "V79", "V80"],
    rule: "v48-v75-frozen-exclusion",
    required: true,
    description: "V48–V75 frozen layers excluded from V80 policy scope",
  },
];

export function isSystemPolicyBoundaryComplete(): boolean {
  const zones = new Set(SYSTEM_POLICY_SCOPE_BOUNDARIES.map((b) => b.zone));
  return (
    SYSTEM_POLICY_SCOPE_BOUNDARIES.length === 3 &&
    zones.has("v80-policy") &&
    zones.has("v76-v79-target") &&
    zones.has("exclusion")
  );
}

export function buildSystemPolicyBoundaryManifest(): SystemPolicyBoundaryManifest {
  const boundaries = SYSTEM_POLICY_SCOPE_BOUNDARIES;
  const boundaryComplete = isSystemPolicyBoundaryComplete();

  return {
    version: V80_SYSTEM_POLICY_VERSION,
    zoneCount: boundaries.length,
    boundaryComplete,
    boundaries,
    summary: `system-policy-boundary zones=${boundaries.length} complete=${boundaryComplete}`,
  };
}

export function getSystemPolicyScopeBoundaryByZone(
  zone: SystemPolicyScopeBoundary["zone"],
): SystemPolicyScopeBoundary | undefined {
  return SYSTEM_POLICY_SCOPE_BOUNDARIES.find((b) => b.zone === zone);
}
