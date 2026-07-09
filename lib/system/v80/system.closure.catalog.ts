/**
 * V80 P5 — System closure proof catalog (declarative)
 */
import { SYSTEM_COMPLETENESS_PROOFS } from "./system.closure.completeness";
import { SYSTEM_GLOBAL_INVARIANT_CERTS } from "./system.closure.invariant";
import type {
  SystemClosureCatalogManifest,
  SystemClosureKind,
  SystemClosureProof,
} from "./system.closure";
import { V80_SYSTEM_CLOSURE_VERSION } from "./system.closure";
import { V80_SYSTEM_INTEGRITY_VERSION } from "./system.integrity";
import { V80_SYSTEM_POLICY_VERSION } from "./system.policy";
import { V80_SYSTEM_SIMULATION_VERSION } from "./system.simulation";
import { V80_SYSTEM_VERSION } from "./system.types";

const STACK_LAYERS = ["V76", "V77", "V78", "V79"] as const;

const REQUIRED_KINDS: SystemClosureKind[] = [
  "ontology",
  "policy",
  "simulation",
  "integrity",
  "completeness",
  "seal",
];

export const SYSTEM_CLOSURE_CATALOG: SystemClosureProof[] = [
  {
    id: "SYS-CLS-001",
    kind: "ontology",
    phase: "P1",
    phaseVersion: V80_SYSTEM_VERSION,
    layerRefs: [...STACK_LAYERS],
    completenessRef: "SYS-CMP-001",
    invariantCertRef: "SYS-GIC-002",
    passCondition: "p1-inventory-ready && cross-layer-map-complete",
    status: "certified",
    required: true,
    description: "P1 ontology closure — system meta inventory certified",
  },
  {
    id: "SYS-CLS-002",
    kind: "policy",
    phase: "P2",
    phaseVersion: V80_SYSTEM_POLICY_VERSION,
    layerRefs: [...STACK_LAYERS],
    completenessRef: "SYS-CMP-002",
    invariantCertRef: "SYS-GIC-005",
    passCondition: "p2-policy-ready && cross-layer-policies=8",
    status: "certified",
    required: true,
    description: "P2 policy closure — cross-layer policy kernel certified",
  },
  {
    id: "SYS-CLS-003",
    kind: "simulation",
    phase: "P3",
    phaseVersion: V80_SYSTEM_SIMULATION_VERSION,
    layerRefs: [...STACK_LAYERS],
    completenessRef: "SYS-CMP-003",
    invariantCertRef: "SYS-GIC-003",
    passCondition: "p3-simulation-ready && simulations=6",
    status: "certified",
    required: true,
    description: "P3 simulation closure — meta simulation kernel certified",
  },
  {
    id: "SYS-CLS-004",
    kind: "integrity",
    phase: "P4",
    phaseVersion: V80_SYSTEM_INTEGRITY_VERSION,
    layerRefs: [...STACK_LAYERS],
    completenessRef: "SYS-CMP-004",
    invariantCertRef: "SYS-GIC-001",
    passCondition: "p4-integrity-ready && integrity-rules=6",
    status: "certified",
    required: true,
    description: "P4 integrity closure — meta integrity enforcement certified",
  },
  {
    id: "SYS-CLS-005",
    kind: "completeness",
    phase: "P1-P4",
    phaseVersion: V80_SYSTEM_CLOSURE_VERSION,
    layerRefs: [...STACK_LAYERS],
    completenessRef: "SYS-CMP-001",
    invariantCertRef: "SYS-GIC-004",
    passCondition: "all-phases-ready && completeness-proofs=4",
    status: "certified",
    required: true,
    description: "Completeness closure — P1–P4 coverage validated",
  },
  {
    id: "SYS-CLS-006",
    kind: "seal",
    phase: "P5",
    phaseVersion: V80_SYSTEM_CLOSURE_VERSION,
    layerRefs: [...STACK_LAYERS],
    completenessRef: "SYS-CMP-004",
    invariantCertRef: "SYS-GIC-006",
    passCondition: "system-sealed && version-lock-intact && rollback-index-complete",
    status: "certified",
    required: true,
    description: "Final seal closure — V80 system kernel sealed",
  },
];

export function isSystemClosureCatalogRefsAligned(): boolean {
  const completenessIds = new Set(SYSTEM_COMPLETENESS_PROOFS.map((p) => p.id));
  const certIds = new Set(SYSTEM_GLOBAL_INVARIANT_CERTS.map((c) => c.id));
  const kinds = new Set(SYSTEM_CLOSURE_CATALOG.map((p) => p.kind));
  const completenessClosureRefs = new Set(SYSTEM_COMPLETENESS_PROOFS.map((p) => p.closureRef));
  const closureIds = new Set(SYSTEM_CLOSURE_CATALOG.map((p) => p.id));

  const proofsAligned = SYSTEM_CLOSURE_CATALOG.every(
    (p) =>
      completenessIds.has(p.completenessRef) &&
      certIds.has(p.invariantCertRef) &&
      p.layerRefs.length === 4 &&
      p.passCondition.length > 0,
  );

  const completenessAligned = SYSTEM_COMPLETENESS_PROOFS.every((p) =>
    closureIds.has(p.closureRef),
  );

  const certsAligned = SYSTEM_GLOBAL_INVARIANT_CERTS.every((c) =>
    closureIds.has(c.closureRef),
  );

  const kindsComplete = REQUIRED_KINDS.every((k) => kinds.has(k));

  return (
    proofsAligned &&
    completenessAligned &&
    certsAligned &&
    kindsComplete &&
    completenessClosureRefs.size === 4 &&
    SYSTEM_CLOSURE_CATALOG.length === 6
  );
}

export function buildSystemClosureCatalogManifest(): SystemClosureCatalogManifest {
  const proofs = SYSTEM_CLOSURE_CATALOG;
  const kinds = new Set(proofs.map((p) => p.kind));
  const catalogComplete =
    proofs.length === 6 && REQUIRED_KINDS.every((k) => kinds.has(k));

  return {
    version: V80_SYSTEM_CLOSURE_VERSION,
    entryCount: proofs.length,
    kindCount: kinds.size,
    catalogComplete,
    proofs,
    summary: `system-closure count=${proofs.length} kinds=${kinds.size} complete=${catalogComplete}`,
  };
}

export function getSystemClosureProofById(id: string): SystemClosureProof | undefined {
  return SYSTEM_CLOSURE_CATALOG.find((p) => p.id === id);
}

export function getSystemClosureProofsByKind(kind: SystemClosureKind): SystemClosureProof[] {
  return SYSTEM_CLOSURE_CATALOG.filter((p) => p.kind === kind);
}

export function computeSystemDeclarativeClosureSealed(input: {
  kind: SystemClosureKind;
  status: SystemClosureProof["status"];
}): boolean {
  return input.kind === "seal" && input.status === "certified";
}
