/**
 * V80 P5 — System completeness proof (P1–P4 coverage validation)
 */
import type { SystemCompletenessManifest, SystemCompletenessProof } from "./system.closure";
import { V80_SYSTEM_CLOSURE_VERSION } from "./system.closure";
import { V80_SYSTEM_INTEGRITY_VERSION } from "./system.integrity";
import { V80_SYSTEM_POLICY_VERSION } from "./system.policy";
import { V80_SYSTEM_SIMULATION_VERSION } from "./system.simulation";
import { V80_SYSTEM_VERSION } from "./system.types";

export const SYSTEM_COMPLETENESS_PROOFS: SystemCompletenessProof[] = [
  {
    id: "SYS-CMP-001",
    phase: "P1",
    phaseLabel: "Ontology / Inventory",
    phaseVersion: V80_SYSTEM_VERSION,
    verifyScript: "npx tsx scripts/verify-v80-p1-system-meta-inventory.ts",
    coverageCondition: "inventoryReady && roles=8 && topology=8 && governance=8",
    closureRef: "SYS-CLS-001",
    required: true,
    description: "P1 ontology inventory completeness proof",
  },
  {
    id: "SYS-CMP-002",
    phase: "P2",
    phaseLabel: "Policy",
    phaseVersion: V80_SYSTEM_POLICY_VERSION,
    verifyScript: "npx tsx scripts/verify-v80-p2-system-meta-policy.ts",
    coverageCondition: "catalogReady && policies=8 && invariants=6 && constraints=4",
    closureRef: "SYS-CLS-002",
    required: true,
    description: "P2 cross-layer policy completeness proof",
  },
  {
    id: "SYS-CMP-003",
    phase: "P3",
    phaseLabel: "Simulation",
    phaseVersion: V80_SYSTEM_SIMULATION_VERSION,
    verifyScript: "npx tsx scripts/verify-v80-p3-system-meta-simulation.ts",
    coverageCondition: "catalogReady && simulations=6 && propagation=4 && failures=4",
    closureRef: "SYS-CLS-003",
    required: true,
    description: "P3 simulation kernel completeness proof",
  },
  {
    id: "SYS-CMP-004",
    phase: "P4",
    phaseLabel: "Integrity",
    phaseVersion: V80_SYSTEM_INTEGRITY_VERSION,
    verifyScript: "npx tsx scripts/verify-v80-p4-system-meta-integrity.ts",
    coverageCondition: "catalogReady && integrity=6 && consistency=4 && drift=4",
    closureRef: "SYS-CLS-004",
    required: true,
    description: "P4 integrity enforcement completeness proof",
  },
];

export function isSystemCompletenessProofComplete(): boolean {
  const phases = new Set(SYSTEM_COMPLETENESS_PROOFS.map((p) => p.phase));
  return (
    SYSTEM_COMPLETENESS_PROOFS.length === 4 &&
    phases.has("P1") &&
    phases.has("P2") &&
    phases.has("P3") &&
    phases.has("P4") &&
    SYSTEM_COMPLETENESS_PROOFS.every((p) => p.verifyScript.length > 0 && p.coverageCondition.length > 0)
  );
}

export function buildSystemCompletenessManifest(): SystemCompletenessManifest {
  const proofs = SYSTEM_COMPLETENESS_PROOFS;
  const completenessComplete = isSystemCompletenessProofComplete();

  return {
    version: V80_SYSTEM_CLOSURE_VERSION,
    proofCount: proofs.length,
    completenessComplete,
    proofs,
    summary: `system-completeness proofs=${proofs.length} complete=${completenessComplete}`,
  };
}

export function getSystemCompletenessProofByPhase(phase: string): SystemCompletenessProof | undefined {
  return SYSTEM_COMPLETENESS_PROOFS.find((p) => p.phase === phase);
}
