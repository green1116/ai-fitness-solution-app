/**
 * V80 P3 — Cross-layer state propagation model (V76→V79)
 */
import { SYSTEM_INVARIANT_CATALOG } from "./system.invariant.catalog";
import { SYSTEM_POLICY_CATALOG } from "./system.policy.catalog";
import type { SystemStatePropagationManifest, SystemStatePropagationSegment } from "./system.simulation";
import { V80_SYSTEM_SIMULATION_VERSION } from "./system.simulation";

export const SYSTEM_STATE_PROPAGATION_SEGMENTS: SystemStatePropagationSegment[] = [
  {
    id: "SYS-PRP-001",
    fromLayer: "V76",
    toLayer: "V77",
    stateKind: "collaboration-to-planning",
    policyRef: "SYS-POL-003",
    invariantRef: "SYS-INV-002",
    passCondition: "v76-signoff-propagates-to-v77",
    required: true,
    description: "V76 collaboration freeze state propagates to V77 planning",
  },
  {
    id: "SYS-PRP-002",
    fromLayer: "V77",
    toLayer: "V78",
    stateKind: "planning-to-execution",
    policyRef: "SYS-POL-004",
    invariantRef: "SYS-INV-003",
    passCondition: "v77-signoff-propagates-to-v78",
    required: true,
    description: "V77 planning freeze state propagates to V78 execution",
  },
  {
    id: "SYS-PRP-003",
    fromLayer: "V78",
    toLayer: "V79",
    stateKind: "execution-to-task",
    policyRef: "SYS-POL-004",
    invariantRef: "SYS-INV-003",
    passCondition: "v78-signoff-propagates-to-v79",
    required: true,
    description: "V78 execution freeze state propagates to V79 task",
  },
  {
    id: "SYS-PRP-004",
    fromLayer: "V76",
    toLayer: "V79",
    stateKind: "stack-end-to-end",
    policyRef: "SYS-POL-007",
    invariantRef: "SYS-INV-005",
    passCondition: "v76-v79-stack-state-aligned",
    required: true,
    description: "End-to-end V76→V79 stack state propagation aggregate",
  },
];

export function isSystemStatePropagationComplete(): boolean {
  const chain = ["V76→V77", "V77→V78", "V78→V79"];
  const policyIds = new Set(SYSTEM_POLICY_CATALOG.map((p) => p.id));
  const invariantIds = new Set(SYSTEM_INVARIANT_CATALOG.map((i) => i.id));

  const segmentsValid = SYSTEM_STATE_PROPAGATION_SEGMENTS.every(
    (s) =>
      policyIds.has(s.policyRef) &&
      invariantIds.has(s.invariantRef) &&
      s.passCondition.length > 0,
  );

  const hopsPresent = chain.every((hop) =>
    SYSTEM_STATE_PROPAGATION_SEGMENTS.some((s) => `${s.fromLayer}→${s.toLayer}` === hop),
  );

  return SYSTEM_STATE_PROPAGATION_SEGMENTS.length === 4 && segmentsValid && hopsPresent;
}

export function buildSystemStatePropagationManifest(): SystemStatePropagationManifest {
  const segments = SYSTEM_STATE_PROPAGATION_SEGMENTS;
  const propagationComplete = isSystemStatePropagationComplete();

  return {
    version: V80_SYSTEM_SIMULATION_VERSION,
    segmentCount: segments.length,
    propagationComplete,
    segments,
    summary: `system-propagation segments=${segments.length} complete=${propagationComplete}`,
  };
}

export function getSystemPropagationSegmentById(
  id: string,
): SystemStatePropagationSegment | undefined {
  return SYSTEM_STATE_PROPAGATION_SEGMENTS.find((s) => s.id === id);
}
