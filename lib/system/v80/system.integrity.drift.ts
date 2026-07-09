/**
 * V80 P4 — Drift detection system (V76–V79)
 */
import { SYSTEM_INVARIANT_CATALOG } from "./system.invariant.catalog";
import { SYSTEM_POLICY_CATALOG } from "./system.policy.catalog";
import { SYSTEM_SIMULATION_CATALOG } from "./system.simulation.catalog";
import type { SystemDriftDetectionManifest, SystemDriftDetector } from "./system.integrity";
import { V80_SYSTEM_INTEGRITY_VERSION } from "./system.integrity";

export const SYSTEM_DRIFT_DETECTORS: SystemDriftDetector[] = [
  {
    id: "SYS-DRF-001",
    driftKind: "v76-freeze-drift",
    layerRef: "V76",
    policyRef: "SYS-POL-002",
    invariantRef: "SYS-INV-001",
    simulationRef: "SYS-SIM-004",
    detectCondition: "v76-freeze-version != crossLayerMap[V76].freezeVersion",
    integrityRef: "SYS-INT-002",
    required: true,
    description: "Detect V76 collaboration freeze version drift",
  },
  {
    id: "SYS-DRF-002",
    driftKind: "v77-freeze-drift",
    layerRef: "V77",
    policyRef: "SYS-POL-002",
    invariantRef: "SYS-INV-001",
    simulationRef: "SYS-SIM-004",
    detectCondition: "v77-freeze-version != crossLayerMap[V77].freezeVersion",
    integrityRef: "SYS-INT-002",
    required: true,
    description: "Detect V77 planning freeze version drift",
  },
  {
    id: "SYS-DRF-003",
    driftKind: "v78-freeze-drift",
    layerRef: "V78",
    policyRef: "SYS-POL-002",
    invariantRef: "SYS-INV-001",
    simulationRef: "SYS-SIM-004",
    detectCondition: "v78-freeze-version != crossLayerMap[V78].freezeVersion",
    integrityRef: "SYS-INT-002",
    required: true,
    description: "Detect V78 execution freeze version drift",
  },
  {
    id: "SYS-DRF-004",
    driftKind: "v79-signoff-drift",
    layerRef: "V79",
    policyRef: "SYS-POL-008",
    invariantRef: "SYS-INV-005",
    simulationRef: "SYS-SIM-002",
    detectCondition: "v79-signoff-version != crossLayerMap[V79].signoffVersion",
    integrityRef: "SYS-INT-002",
    required: true,
    description: "Detect V79 task signoff version drift",
  },
];

export function isSystemDriftDetectionComplete(): boolean {
  const policyIds = new Set(SYSTEM_POLICY_CATALOG.map((p) => p.id));
  const invariantIds = new Set(SYSTEM_INVARIANT_CATALOG.map((i) => i.id));
  const simulationIds = new Set(SYSTEM_SIMULATION_CATALOG.map((s) => s.id));
  const layers = new Set(SYSTEM_DRIFT_DETECTORS.map((d) => d.layerRef));

  return (
    SYSTEM_DRIFT_DETECTORS.length === 4 &&
    layers.has("V76") &&
    layers.has("V77") &&
    layers.has("V78") &&
    layers.has("V79") &&
    SYSTEM_DRIFT_DETECTORS.every(
      (d) =>
        policyIds.has(d.policyRef) &&
        invariantIds.has(d.invariantRef) &&
        simulationIds.has(d.simulationRef) &&
        d.detectCondition.length > 0,
    )
  );
}

export function buildSystemDriftDetectionManifest(): SystemDriftDetectionManifest {
  const detectors = SYSTEM_DRIFT_DETECTORS;
  const driftDetectionComplete = isSystemDriftDetectionComplete();

  return {
    version: V80_SYSTEM_INTEGRITY_VERSION,
    detectorCount: detectors.length,
    driftDetectionComplete,
    detectors,
    summary: `system-drift detectors=${detectors.length} complete=${driftDetectionComplete}`,
  };
}

export function getSystemDriftDetectorByLayer(layer: string): SystemDriftDetector | undefined {
  return SYSTEM_DRIFT_DETECTORS.find((d) => d.layerRef === layer);
}
